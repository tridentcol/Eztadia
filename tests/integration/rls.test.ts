import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "../setup";

/**
 * Tests de aislamiento RLS — el chequeo critico de Phase B.
 *
 * Estrategia:
 *   - Crear 2 users via admin API (service_role).
 *   - User A crea organization + property; User B crea otra.
 *   - Con un client autenticado *como User A* (anon key + signin), verificar:
 *       * Ve su propiedad
 *       * NO ve la propiedad de User B
 *       * NO ve bookings de User B
 *       * Intentar UPDATE en propiedad de User B → 0 rows afectadas (RLS bloquea)
 *   - Cleanup: borrar users via admin (cascade limpia profile + property_users;
 *     orgs y properties quedan huerfanos por RESTRICT FK — los borramos antes).
 */

type SB = SupabaseClient;

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SR   = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const RUN_ID = `rls-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
const PASS = "Test12345-rls";

let admin: SB;
let userA: { id: string; email: string; client: SB };
let userB: { id: string; email: string; client: SB };

let orgA: { id: string };
let propA: { id: string; slug: string };
let orgB: { id: string };
let propB: { id: string; slug: string };

async function signupAndAuth(email: string): Promise<{ id: string; email: string; client: SB }> {
  // Crear via admin (auto-confirm)
  const { data: createRes, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: PASS,
    email_confirm: true,
    user_metadata: { full_name: `User ${email}` },
  });
  if (createErr || !createRes.user) throw new Error(`createUser failed: ${createErr?.message}`);
  const userId = createRes.user.id;

  // Cliente autenticado como ese user (firma JWT propio)
  const client = createClient(URL, ANON, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: signinErr } = await client.auth.signInWithPassword({ email, password: PASS });
  if (signinErr) throw new Error(`signin failed: ${signinErr.message}`);

  return { id: userId, email, client };
}

async function createPropertyForUser(
  client: SB,
  userId: string,
  suffix: string,
): Promise<{ orgId: string; propId: string; slug: string }> {
  const { data: org, error: orgErr } = await client
    .from("organizations")
    .insert({ name: `Org ${suffix}`, owner_id: userId })
    .select()
    .single();
  if (orgErr) throw new Error(`org insert: ${orgErr.message}`);

  const slug = `${RUN_ID}-${suffix}`.toLowerCase();
  const { data: prop, error: propErr } = await client
    .from("properties")
    .insert({ organization_id: org.id, slug, name: `Property ${suffix}` })
    .select()
    .single();
  if (propErr) throw new Error(`prop insert: ${propErr.message}`);

  // El trigger on_property_created_link_owner ya creo property_users(owner)
  // — no insertamos manualmente para evitar unique violation.

  return { orgId: org.id, propId: prop.id, slug };
}

beforeAll(async () => {
  admin = createClient(URL, SR, { auth: { autoRefreshToken: false, persistSession: false } });

  userA = await signupAndAuth(`${RUN_ID}-a@gmail.com`);
  userB = await signupAndAuth(`${RUN_ID}-b@gmail.com`);

  const a = await createPropertyForUser(userA.client, userA.id, "a");
  const b = await createPropertyForUser(userB.client, userB.id, "b");
  orgA = { id: a.orgId };
  propA = { id: a.propId, slug: a.slug };
  orgB = { id: b.orgId };
  propB = { id: b.propId, slug: b.slug };
});

afterAll(async () => {
  // Cleanup: borrar propiedades antes que orgs/users (FKs).
  await admin.from("whatsapp_messages").delete().eq("property_id", propA.id);
  await admin.from("whatsapp_messages").delete().eq("property_id", propB.id);
  await admin.from("whatsapp_configs").delete().eq("property_id", propA.id);
  await admin.from("whatsapp_configs").delete().eq("property_id", propB.id);
  await admin.from("wompi_configs").delete().eq("property_id", propA.id);
  await admin.from("wompi_configs").delete().eq("property_id", propB.id);
  await admin.from("ical_feeds").delete().eq("property_id", propA.id);
  await admin.from("ical_feeds").delete().eq("property_id", propB.id);
  await admin.from("email_logs").delete().eq("property_id", propA.id);
  await admin.from("email_logs").delete().eq("property_id", propB.id);
  await admin.from("bookings").delete().eq("property_id", propA.id);
  await admin.from("bookings").delete().eq("property_id", propB.id);
  await admin.from("property_users").delete().eq("property_id", propA.id);
  await admin.from("property_users").delete().eq("property_id", propB.id);
  await admin.from("properties").delete().eq("id", propA.id);
  await admin.from("properties").delete().eq("id", propB.id);
  await admin.from("organizations").delete().eq("id", orgA.id);
  await admin.from("organizations").delete().eq("id", orgB.id);
  await admin.auth.admin.deleteUser(userA.id);
  await admin.auth.admin.deleteUser(userB.id);
});

describe("RLS isolation · properties", () => {
  it("user A sees his property", async () => {
    const { data, error } = await userA.client
      .from("properties")
      .select("id, name")
      .eq("id", propA.id)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.id).toBe(propA.id);
  });

  it("user A does NOT see user B's property", async () => {
    const { data } = await userA.client
      .from("properties")
      .select("id")
      .eq("id", propB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A listing properties only gets his own", async () => {
    const { data, error } = await userA.client.from("properties").select("id");
    expect(error).toBeNull();
    const ids = (data ?? []).map((r) => r.id);
    expect(ids).toContain(propA.id);
    expect(ids).not.toContain(propB.id);
  });
});

describe("RLS isolation · update guard", () => {
  it("user A cannot UPDATE user B's property (0 rows touched)", async () => {
    const { data, error } = await userA.client
      .from("properties")
      .update({ name: "Hijacked" })
      .eq("id", propB.id)
      .select();
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBe(0);
  });

  it("user B's property name unchanged after A's attempt", async () => {
    const { data } = await admin
      .from("properties")
      .select("name")
      .eq("id", propB.id)
      .maybeSingle();
    expect(data?.name).toBe("Property b");
  });
});

describe("RLS isolation · bookings", () => {
  let bookingB: { id: string };

  beforeAll(async () => {
    // Crear room_type + room + booking en propB via service_role
    const { data: rt } = await admin
      .from("room_types")
      .insert({ property_id: propB.id, name_es: "Suite B", base_price_cents: 100_000, capacity_adults: 2 })
      .select()
      .single();
    const { data: room } = await admin
      .from("rooms")
      .insert({ property_id: propB.id, room_type_id: rt!.id, number: "B-101" })
      .select()
      .single();
    const { data: bk } = await admin
      .from("bookings")
      .insert({
        property_id: propB.id,
        room_type_id: rt!.id,
        room_id: room!.id,
        check_in: "2030-01-01",
        check_out: "2030-01-03",
        guest_full_name: "Guest B",
        guest_email: "guest-b@gmail.com",
        guest_phone: "+573000000000",
        total_cents: 200_000,
        payment_method: "pse",
        status: "confirmed",
      })
      .select()
      .single();
    bookingB = { id: bk!.id };
  });

  it("user A cannot SELECT user B's booking", async () => {
    const { data } = await userA.client
      .from("bookings")
      .select("id")
      .eq("id", bookingB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot DELETE user B's booking (0 rows)", async () => {
    const { data, error } = await userA.client
      .from("bookings")
      .delete()
      .eq("id", bookingB.id)
      .select();
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBe(0);
  });

  it("user B still sees his booking after A's attempts", async () => {
    const { data } = await userB.client
      .from("bookings")
      .select("id")
      .eq("id", bookingB.id)
      .maybeSingle();
    expect(data?.id).toBe(bookingB.id);
  });
});

describe("RLS isolation · webhook_logs", () => {
  let webhookA: { id: string };
  let webhookB: { id: string };

  beforeAll(async () => {
    // Insert via service_role: una fila por propiedad + una global (sin property_id).
    const { data: rowA } = await admin
      .from("webhook_logs")
      .insert({
        provider: "wompi",
        property_id: propA.id,
        status: "processed",
        event_type: "transaction.updated",
      })
      .select()
      .single();
    const { data: rowB } = await admin
      .from("webhook_logs")
      .insert({
        provider: "wompi",
        property_id: propB.id,
        status: "processed",
        event_type: "transaction.updated",
      })
      .select()
      .single();
    webhookA = { id: rowA!.id };
    webhookB = { id: rowB!.id };
  });

  it("user A sees his own webhook_logs", async () => {
    const { data } = await userA.client
      .from("webhook_logs")
      .select("id")
      .eq("id", webhookA.id)
      .maybeSingle();
    expect(data?.id).toBe(webhookA.id);
  });

  it("user A does NOT see user B's webhook_logs", async () => {
    const { data } = await userA.client
      .from("webhook_logs")
      .select("id")
      .eq("id", webhookB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot INSERT into webhook_logs (no policy)", async () => {
    const { error } = await userA.client
      .from("webhook_logs")
      .insert({ provider: "wompi", status: "received", property_id: propA.id });
    // RLS bloquea: PostgREST devuelve un error o 0 filas. Aceptamos cualquiera.
    expect(error).not.toBeNull();
  });
});

describe("RLS isolation · whatsapp_configs", () => {
  beforeAll(async () => {
    // wa configs son owner-only — service_role los crea
    await admin.from("whatsapp_configs").insert([
      { property_id: propA.id, phone_number_id: "PA-phone", is_active: true },
      { property_id: propB.id, phone_number_id: "PB-phone", is_active: true },
    ]);
  });

  it("user A sees his whatsapp_config", async () => {
    const { data } = await userA.client
      .from("whatsapp_configs")
      .select("property_id, phone_number_id")
      .eq("property_id", propA.id)
      .maybeSingle();
    expect(data?.phone_number_id).toBe("PA-phone");
  });

  it("user A does NOT see user B's whatsapp_config", async () => {
    const { data } = await userA.client
      .from("whatsapp_configs")
      .select("property_id")
      .eq("property_id", propB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot UPDATE user B's whatsapp_config", async () => {
    const { data, error } = await userA.client
      .from("whatsapp_configs")
      .update({ phone_number_id: "hijacked" })
      .eq("property_id", propB.id)
      .select();
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBe(0);
  });
});

describe("RLS isolation · whatsapp_messages", () => {
  let msgA: { id: string };
  let msgB: { id: string };

  beforeAll(async () => {
    const { data: a } = await admin
      .from("whatsapp_messages")
      .insert({
        property_id: propA.id,
        direction: "outbound",
        to_phone: "+573001111111",
        from_phone: "+573009999999",
        body: "Hola A",
        status: "sent",
      })
      .select()
      .single();
    const { data: b } = await admin
      .from("whatsapp_messages")
      .insert({
        property_id: propB.id,
        direction: "outbound",
        to_phone: "+573002222222",
        from_phone: "+573009999999",
        body: "Hola B",
        status: "sent",
      })
      .select()
      .single();
    msgA = { id: a!.id };
    msgB = { id: b!.id };
  });

  it("user A sees his own message", async () => {
    const { data } = await userA.client
      .from("whatsapp_messages")
      .select("id, body")
      .eq("id", msgA.id)
      .maybeSingle();
    expect(data?.body).toBe("Hola A");
  });

  it("user A does NOT see user B's message", async () => {
    const { data } = await userA.client
      .from("whatsapp_messages")
      .select("id")
      .eq("id", msgB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot INSERT a message into user B's property", async () => {
    const { error } = await userA.client
      .from("whatsapp_messages")
      .insert({
        property_id: propB.id,
        direction: "outbound",
        to_phone: "+573001234567",
        from_phone: "+573009999999",
        body: "spoof",
        status: "sent",
      });
    expect(error).not.toBeNull();
  });
});

describe("RLS isolation · wompi_configs", () => {
  beforeAll(async () => {
    await admin
      .from("wompi_configs")
      .insert({
        property_id: propA.id,
        public_key: "pub_test_PA",
        is_test_mode: true,
        is_active: true,
      });
    await admin
      .from("wompi_configs")
      .insert({
        property_id: propB.id,
        public_key: "pub_test_PB",
        is_test_mode: true,
        is_active: true,
      });
  });

  it("user A sees his own wompi_config", async () => {
    const { data } = await userA.client
      .from("wompi_configs")
      .select("property_id, public_key, is_active")
      .eq("property_id", propA.id)
      .maybeSingle();
    expect(data?.public_key).toBe("pub_test_PA");
    expect(data?.is_active).toBe(true);
  });

  it("user A does NOT see user B's wompi_config", async () => {
    const { data } = await userA.client
      .from("wompi_configs")
      .select("property_id")
      .eq("property_id", propB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot toggle is_active on user B's wompi_config", async () => {
    const { data, error } = await userA.client
      .from("wompi_configs")
      .update({ is_active: false })
      .eq("property_id", propB.id)
      .select();
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBe(0);

    // Y la fila de B sigue intacta vista por admin.
    const { data: stillActive } = await admin
      .from("wompi_configs")
      .select("is_active")
      .eq("property_id", propB.id)
      .maybeSingle();
    expect(stillActive?.is_active).toBe(true);
  });
});

describe("RLS isolation · ical_feeds", () => {
  let feedA: { id: string };
  let feedB: { id: string };

  beforeAll(async () => {
    const { data: a } = await admin
      .from("ical_feeds")
      .insert({
        property_id: propA.id,
        name: "Booking.com",
        direction: "inbound",
        url: "https://example.com/A.ics",
      })
      .select()
      .single();
    const { data: b } = await admin
      .from("ical_feeds")
      .insert({
        property_id: propB.id,
        name: "Airbnb",
        direction: "inbound",
        url: "https://example.com/B.ics",
      })
      .select()
      .single();
    feedA = { id: a!.id };
    feedB = { id: b!.id };
  });

  it("user A sees his own ical_feed", async () => {
    const { data } = await userA.client
      .from("ical_feeds")
      .select("id, name")
      .eq("id", feedA.id)
      .maybeSingle();
    expect(data?.name).toBe("Booking.com");
  });

  it("user A does NOT see user B's ical_feed", async () => {
    const { data } = await userA.client
      .from("ical_feeds")
      .select("id")
      .eq("id", feedB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot DELETE user B's ical_feed", async () => {
    const { data, error } = await userA.client
      .from("ical_feeds")
      .delete()
      .eq("id", feedB.id)
      .select();
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBe(0);
  });
});

describe("RLS isolation · external_blocks", () => {
  // Blocks importados por el cron iCal sync (lib/ical/sync.ts) — verificamos
  // que un member solo ve los de SUS propiedades y no puede borrar los ajenos.
  // Setup: feeds + room dedicados al test para no acoplarse a describes vecinos.
  let blockA: { id: string };
  let blockB: { id: string };

  beforeAll(async () => {
    const { data: rtA } = await admin
      .from("room_types")
      .insert({
        property_id: propA.id,
        name_es: "Suite ext",
        base_price_cents: 50_000,
        capacity_adults: 2,
      })
      .select()
      .single();
    const { data: rA } = await admin
      .from("rooms")
      .insert({
        property_id: propA.id,
        room_type_id: rtA!.id,
        number: "A-ext",
      })
      .select()
      .single();
    const { data: feedA } = await admin
      .from("ical_feeds")
      .insert({
        property_id: propA.id,
        room_id: rA!.id,
        name: "Booking A (ext blocks)",
        direction: "inbound",
        url: "https://example.com/A-ext.ics",
      })
      .select()
      .single();
    const { data: ebA } = await admin
      .from("external_blocks")
      .insert({
        ical_feed_id: feedA!.id,
        property_id: propA.id,
        room_id: rA!.id,
        external_uid: "uid-A@booking",
        start_date: "2030-06-01",
        end_date: "2030-06-04",
        summary: "Booking import A",
      })
      .select()
      .single();
    blockA = { id: ebA!.id };

    const { data: rtB } = await admin
      .from("room_types")
      .insert({
        property_id: propB.id,
        name_es: "Suite ext B",
        base_price_cents: 50_000,
        capacity_adults: 2,
      })
      .select()
      .single();
    const { data: rB } = await admin
      .from("rooms")
      .insert({
        property_id: propB.id,
        room_type_id: rtB!.id,
        number: "B-ext",
      })
      .select()
      .single();
    const { data: feedB2 } = await admin
      .from("ical_feeds")
      .insert({
        property_id: propB.id,
        room_id: rB!.id,
        name: "Airbnb B (ext blocks)",
        direction: "inbound",
        url: "https://example.com/B-ext.ics",
      })
      .select()
      .single();
    const { data: ebB } = await admin
      .from("external_blocks")
      .insert({
        ical_feed_id: feedB2!.id,
        property_id: propB.id,
        room_id: rB!.id,
        external_uid: "uid-B@airbnb",
        start_date: "2030-06-10",
        end_date: "2030-06-12",
        summary: "Booking import B",
      })
      .select()
      .single();
    blockB = { id: ebB!.id };
  });

  it("user A sees his own external_block", async () => {
    const { data } = await userA.client
      .from("external_blocks")
      .select("id, external_uid")
      .eq("id", blockA.id)
      .maybeSingle();
    expect(data?.external_uid).toBe("uid-A@booking");
  });

  it("user A does NOT see user B's external_block", async () => {
    const { data } = await userA.client
      .from("external_blocks")
      .select("id")
      .eq("id", blockB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot DELETE user B's external_block", async () => {
    const { data, error } = await userA.client
      .from("external_blocks")
      .delete()
      .eq("id", blockB.id)
      .select();
    expect(error).toBeNull();
    expect(data?.length ?? 0).toBe(0);
  });
});

describe("RLS isolation · email_logs", () => {
  let emailA: { id: string };
  let emailB: { id: string };

  beforeAll(async () => {
    const { data: a } = await admin
      .from("email_logs")
      .insert({
        property_id: propA.id,
        to_email: "guest-a@example.com",
        template: "booking_confirmed",
        subject: "Reserva confirmada A",
        status: "sent",
      })
      .select()
      .single();
    const { data: b } = await admin
      .from("email_logs")
      .insert({
        property_id: propB.id,
        to_email: "guest-b@example.com",
        template: "booking_confirmed",
        subject: "Reserva confirmada B",
        status: "sent",
      })
      .select()
      .single();
    emailA = { id: a!.id };
    emailB = { id: b!.id };
  });

  it("user A sees his own email_log", async () => {
    const { data } = await userA.client
      .from("email_logs")
      .select("id, subject")
      .eq("id", emailA.id)
      .maybeSingle();
    expect(data?.subject).toBe("Reserva confirmada A");
  });

  it("user A does NOT see user B's email_log", async () => {
    const { data } = await userA.client
      .from("email_logs")
      .select("id")
      .eq("id", emailB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });

  it("user A cannot INSERT email_logs (no write policy — service_role only)", async () => {
    const { error } = await userA.client
      .from("email_logs")
      .insert({
        property_id: propA.id,
        to_email: "spoof@example.com",
        template: "booking_confirmed",
        subject: "spoof",
        status: "sent",
      });
    expect(error).not.toBeNull();
  });
});

describe("RLS isolation · profiles", () => {
  it("user A can read his own profile", async () => {
    const { data } = await userA.client
      .from("profiles")
      .select("id, email")
      .eq("id", userA.id)
      .maybeSingle();
    expect(data?.id).toBe(userA.id);
  });

  it("user A cannot read user B's profile", async () => {
    const { data } = await userA.client
      .from("profiles")
      .select("id")
      .eq("id", userB.id)
      .maybeSingle();
    expect(data).toBeNull();
  });
});
