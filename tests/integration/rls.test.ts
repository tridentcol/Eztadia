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
