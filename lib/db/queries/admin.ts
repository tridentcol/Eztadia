import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/session";
import { mapDbError, NotFoundError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow  = Database["public"]["Tables"]["profiles"]["Row"];
type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type BookingRow  = Database["public"]["Tables"]["bookings"]["Row"];
type AuditLogRow = Database["public"]["Tables"]["audit_logs"]["Row"];
type ActorType   = Database["public"]["Enums"]["AuditActorType"];

export type GlobalStats = {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  bookings30d: number;
};

/**
 * Stats globales — solo accesibles a super_admin (RLS lo aplica).
 * Si el user actual no es admin, las count() devuelven 0 o las queries fallan.
 */
export async function getGlobalStats(): Promise<GlobalStats> {
  const supabase = await createClient();
  const since30d = new Date(Date.now() - 30 * 86400_000).toISOString();

  const [usersR, propsR, bookingsR, recentR] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since30d),
  ]);

  // Si algun count falla por permisos, devuelve 0 (no rompe la UI admin).
  return {
    totalUsers: usersR.count ?? 0,
    totalProperties: propsR.count ?? 0,
    totalBookings: bookingsR.count ?? 0,
    bookings30d: recentR.count ?? 0,
  };
}

export type AdminUserRow = Pick<ProfileRow,
  "id" | "email" | "full_name" | "role" | "created_at"
>;

/**
 * Lista users del sistema (paginado). Solo super_admin via RLS.
 */
export async function listAdminUsers(opts: {
  limit?: number;
  cursor?: string; // ISO timestamp para keyset pagination
  search?: string;
} = {}): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  let q = supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at");

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(`email.ilike.%${s}%,full_name.ilike.%${s}%`);
  }
  if (opts.cursor) q = q.lt("created_at", opts.cursor);

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 50);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  return data ?? [];
}

/* ─── PROPERTIES (admin) ─── */

export type AdminPropertyRow = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  isActive: boolean;
  createdAt: string;
  organization: { id: string; name: string } | null;
  roomsCount: number;
  bookingsCount: number;
};

/**
 * Lista TODAS las properties del sistema. Solo super_admin.
 *
 * Por que admin client: las policies de `properties` no tienen super_admin
 * bypass (decision Phase B3 — defense in depth). Para admin pages que
 * legítimamente cruzan tenant boundaries, validamos super_admin server-side
 * y usamos admin client. Mismo patron que [[logAudit]].
 */
export async function listAdminProperties(opts: {
  search?: string;
  limit?: number;
} = {}): Promise<AdminPropertyRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  let q = admin
    .from("properties")
    .select(
      `id, name, slug, city, is_active, created_at,
       organization:organizations(id, name),
       rooms_count:rooms(count),
       bookings_count:bookings(count)`,
    );

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(`name.ilike.%${s}%,slug.ilike.%${s}%,city.ilike.%${s}%`);
  }

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 200);

  const { data, error } = await q;
  if (error) throw mapDbError(error);

  type Row = {
    id: string;
    name: string;
    slug: string;
    city: string | null;
    is_active: boolean;
    created_at: string;
    organization: { id: string; name: string } | null;
    rooms_count: { count: number }[] | null;
    bookings_count: { count: number }[] | null;
  };

  return (data ?? []).map((r) => {
    const row = r as unknown as Row;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      city: row.city,
      isActive: row.is_active,
      createdAt: row.created_at,
      organization: row.organization,
      roomsCount: row.rooms_count?.[0]?.count ?? 0,
      bookingsCount: row.bookings_count?.[0]?.count ?? 0,
    };
  });
}

export type AdminPropertyDetail = {
  property: PropertyRow;
  organization: { id: string; name: string; ownerId: string } | null;
  owner: { id: string; email: string; fullName: string | null } | null;
  members: {
    userId: string;
    role: Database["public"]["Enums"]["PropertyUserRole"];
    invitedAt: string;
    acceptedAt: string | null;
    email: string | null;
    fullName: string | null;
  }[];
  recentBookings: Pick<BookingRow,
    "id" | "code" | "status" | "check_in" | "check_out" |
    "guest_full_name" | "total_cents" | "created_at"
  >[];
};

/**
 * Detalle profundo de una propiedad para admin. Property + org + owner
 * profile + members + ultimas 10 bookings.
 */
export async function getAdminPropertyDetail(
  propertyId: string,
): Promise<AdminPropertyDetail> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  const propR = await admin
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .maybeSingle();
  if (propR.error) throw mapDbError(propR.error);
  if (!propR.data) throw new NotFoundError("Propiedad");
  const property = propR.data;

  const [orgR, membersR, bookingsR] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, owner_id")
      .eq("id", property.organization_id)
      .maybeSingle(),
    admin
      .from("property_users")
      .select("user_id, role, created_at, invitation_accepted_at, profiles(email, full_name)")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: true }),
    admin
      .from("bookings")
      .select(
        "id, code, status, check_in, check_out, guest_full_name, total_cents, created_at",
      )
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (orgR.error) throw mapDbError(orgR.error);
  if (membersR.error) throw mapDbError(membersR.error);
  if (bookingsR.error) throw mapDbError(bookingsR.error);

  const organization = orgR.data
    ? { id: orgR.data.id, name: orgR.data.name, ownerId: orgR.data.owner_id }
    : null;

  let owner: AdminPropertyDetail["owner"] = null;
  if (organization) {
    const { data } = await admin
      .from("profiles")
      .select("id, email, full_name")
      .eq("id", organization.ownerId)
      .maybeSingle();
    if (data) {
      owner = { id: data.id, email: data.email, fullName: data.full_name };
    }
  }

  type MemberRow = {
    user_id: string;
    role: Database["public"]["Enums"]["PropertyUserRole"];
    created_at: string;
    invitation_accepted_at: string | null;
    profiles: { email: string; full_name: string | null } | null;
  };

  const members = (membersR.data ?? []).map((m) => {
    const row = m as unknown as MemberRow;
    return {
      userId: row.user_id,
      role: row.role,
      invitedAt: row.created_at,
      acceptedAt: row.invitation_accepted_at,
      email: row.profiles?.email ?? null,
      fullName: row.profiles?.full_name ?? null,
    };
  });

  return {
    property,
    organization,
    owner,
    members,
    recentBookings: bookingsR.data ?? [],
  };
}

/* ─── BOOKINGS (admin) ─── */

type BookingStatus = Database["public"]["Enums"]["BookingStatus"];
type PaymentMethod = Database["public"]["Enums"]["PaymentMethod"];
type PaymentStatus = Database["public"]["Enums"]["PaymentStatus"];

export type AdminBookingRow = {
  id: string;
  code: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestFullName: string;
  guestEmail: string | null;
  totalCents: number;
  createdAt: string;
  property: { id: string; name: string; slug: string } | null;
  roomType: { id: string; nameEs: string } | null;
  room: { id: string; number: string } | null;
};

export async function listAdminBookings(opts: {
  search?: string;
  status?: BookingStatus[];
  from?: string;  // ISO date — created_at >=
  to?: string;    // ISO date — created_at <=
  limit?: number;
} = {}): Promise<AdminBookingRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  let q = admin
    .from("bookings")
    .select(
      `id, code, status, payment_method, check_in, check_out, nights,
       guest_full_name, guest_email, total_cents, created_at,
       property:properties(id, name, slug),
       room_type:room_types(id, name_es),
       room:rooms(id, number)`,
    );

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(`code.ilike.%${s}%,guest_full_name.ilike.%${s}%,guest_email.ilike.%${s}%`);
  }
  if (opts.status?.length) q = q.in("status", opts.status);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 200);

  const { data, error } = await q;
  if (error) throw mapDbError(error);

  type Row = {
    id: string;
    code: string;
    status: BookingStatus;
    payment_method: PaymentMethod;
    check_in: string;
    check_out: string;
    nights: number;
    guest_full_name: string;
    guest_email: string | null;
    total_cents: number;
    created_at: string;
    property: { id: string; name: string; slug: string } | null;
    room_type: { id: string; name_es: string } | null;
    room: { id: string; number: string } | null;
  };

  return (data ?? []).map((r) => {
    const row = r as unknown as Row;
    return {
      id: row.id,
      code: row.code,
      status: row.status,
      paymentMethod: row.payment_method,
      checkIn: row.check_in,
      checkOut: row.check_out,
      nights: row.nights,
      guestFullName: row.guest_full_name,
      guestEmail: row.guest_email,
      totalCents: row.total_cents,
      createdAt: row.created_at,
      property: row.property,
      roomType: row.room_type
        ? { id: row.room_type.id, nameEs: row.room_type.name_es }
        : null,
      room: row.room,
    };
  });
}

export type AdminBookingDetail = {
  booking: BookingRow;
  property: { id: string; name: string; slug: string; city: string | null } | null;
  roomType: { id: string; nameEs: string; basePriceCents: number } | null;
  room: { id: string; number: string; floor: string | null } | null;
  payment: {
    id: string;
    method: PaymentMethod;
    status: PaymentStatus;
    amountCents: number;
    createdAt: string;
    confirmedAt: string | null;
  } | null;
  auditLogs: Pick<
    Database["public"]["Tables"]["audit_logs"]["Row"],
    "id" | "action" | "actor_type" | "created_at" | "diff"
  >[];
};

export async function getAdminBookingDetail(
  bookingId: string,
): Promise<AdminBookingDetail> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  const bookingR = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();
  if (bookingR.error) throw mapDbError(bookingR.error);
  if (!bookingR.data) throw new NotFoundError("Reserva");
  const booking = bookingR.data;

  const [propR, rtR, roomR, paymentR, auditR] = await Promise.all([
    admin
      .from("properties")
      .select("id, name, slug, city")
      .eq("id", booking.property_id)
      .maybeSingle(),
    admin
      .from("room_types")
      .select("id, name_es, base_price_cents")
      .eq("id", booking.room_type_id)
      .maybeSingle(),
    booking.room_id
      ? admin
          .from("rooms")
          .select("id, number, floor")
          .eq("id", booking.room_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    admin
      .from("payments")
      .select("id, method, status, amount_cents, created_at, confirmed_at")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("audit_logs")
      .select("id, action, actor_type, created_at, diff")
      .in("resource_type", ["booking", "booking_hold", "payment"])
      .eq("resource_id", bookingId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (propR.error) throw mapDbError(propR.error);
  if (rtR.error) throw mapDbError(rtR.error);
  if (roomR.error) throw mapDbError(roomR.error);
  if (paymentR.error) throw mapDbError(paymentR.error);
  if (auditR.error) throw mapDbError(auditR.error);

  return {
    booking,
    property: propR.data
      ? {
          id: propR.data.id,
          name: propR.data.name,
          slug: propR.data.slug,
          city: propR.data.city,
        }
      : null,
    roomType: rtR.data
      ? {
          id: rtR.data.id,
          nameEs: rtR.data.name_es,
          basePriceCents: rtR.data.base_price_cents,
        }
      : null,
    room: roomR.data
      ? { id: roomR.data.id, number: roomR.data.number, floor: roomR.data.floor }
      : null,
    payment: paymentR.data
      ? {
          id: paymentR.data.id,
          method: paymentR.data.method,
          status: paymentR.data.status,
          amountCents: paymentR.data.amount_cents,
          createdAt: paymentR.data.created_at,
          confirmedAt: paymentR.data.confirmed_at,
        }
      : null,
    auditLogs: auditR.data ?? [],
  };
}

/* ─── AUDIT LOGS (admin) ─── */

export type AdminAuditLogRow = {
  id: string;
  action: string;
  actorType: ActorType;
  resourceType: string;
  resourceId: string | null;
  propertyId: string | null;
  diff: AuditLogRow["diff"];
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; email: string; fullName: string | null } | null;
  property: { id: string; name: string; slug: string } | null;
};

/**
 * Lista audit_logs cross-tenant para super_admin.
 *
 * Por que admin client: audit_logs tiene RLS habilitada SIN policies de
 * SELECT (defense in depth — solo accesible via admin tools). logAudit()
 * tambien usa admin client para INSERT por la misma razon.
 *
 * Actor + property se resuelven via batch lookup TS-side en vez de
 * embedded JOIN (audit_logs.actor_id es FK opcional a profiles, y la
 * relacion via Postgrest podria no estar declarada).
 */
export async function listAdminAuditLogs(opts: {
  search?: string;       // Match action prefix
  actorType?: ActorType;
  resourceType?: string;
  propertyId?: string;
  from?: string;         // ISO timestamp created_at >=
  to?: string;           // ISO timestamp created_at <=
  limit?: number;
} = {}): Promise<AdminAuditLogRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  let q = admin
    .from("audit_logs")
    .select(
      "id, action, actor_id, actor_type, resource_type, resource_id, property_id, diff, ip, user_agent, created_at",
    );

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.ilike("action", `%${s}%`);
  }
  if (opts.actorType) q = q.eq("actor_type", opts.actorType);
  if (opts.resourceType) q = q.eq("resource_type", opts.resourceType);
  if (opts.propertyId) q = q.eq("property_id", opts.propertyId);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 200);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  const rows = data ?? [];

  // Batch resolve actors + properties (sin N+1).
  const actorIds = Array.from(
    new Set(rows.map((r) => r.actor_id).filter((v): v is string => Boolean(v))),
  );
  const propertyIds = Array.from(
    new Set(rows.map((r) => r.property_id).filter((v): v is string => Boolean(v))),
  );

  const [actorsR, propsR] = await Promise.all([
    actorIds.length > 0
      ? admin
          .from("profiles")
          .select("id, email, full_name")
          .in("id", actorIds)
      : Promise.resolve({ data: [] as { id: string; email: string; full_name: string | null }[], error: null }),
    propertyIds.length > 0
      ? admin
          .from("properties")
          .select("id, name, slug")
          .in("id", propertyIds)
      : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[], error: null }),
  ]);

  if (actorsR.error) throw mapDbError(actorsR.error);
  if (propsR.error) throw mapDbError(propsR.error);

  const actorMap = new Map(
    (actorsR.data ?? []).map((p) => [
      p.id,
      { id: p.id, email: p.email, fullName: p.full_name },
    ]),
  );
  const propertyMap = new Map(
    (propsR.data ?? []).map((p) => [p.id, p]),
  );

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    actorType: r.actor_type,
    resourceType: r.resource_type,
    resourceId: r.resource_id,
    propertyId: r.property_id,
    diff: r.diff,
    ip: r.ip as string | null,
    userAgent: r.user_agent,
    createdAt: r.created_at,
    actor: r.actor_id ? actorMap.get(r.actor_id) ?? null : null,
    property: r.property_id ? propertyMap.get(r.property_id) ?? null : null,
  }));
}

/**
 * Lista valores distintos de resource_type presentes en audit_logs (para
 * popular el filter dropdown). Cap a 50 para no traer una pagina entera.
 */
export async function listAuditResourceTypes(): Promise<string[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("audit_logs")
    .select("resource_type")
    .limit(500);

  if (error) throw mapDbError(error);

  const set = new Set<string>();
  for (const row of data ?? []) set.add(row.resource_type);
  return Array.from(set).sort();
}
