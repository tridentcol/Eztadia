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

/* ─── OVERVIEW (admin home) ─── */

export type AdminOverview = {
  kpis: {
    users: {
      total: number;
      newThisMonth: number;
      byRole: Record<string, number>;
    };
    properties: {
      total: number;
      newThisMonth: number;
      active: number;
      inactive: number;
    };
    bookings: {
      total: number;
      thisMonth: number;
      prevMonth: number;
      byStatus: Record<string, number>;
    };
  };
  revenue: {
    monthLabel: string;
    totalCents: number;
    averagePerBookingCents: number;
    bestDay: { date: string; cents: number } | null;
    days: { day: number; cents: number; isToday: boolean; isFuture: boolean }[];
  };
  recentEvents: AdminAuditLogRow[];
  topProperties: {
    id: string;
    name: string;
    slug: string;
    bookingsCount: number;
    revenueCents: number;
  }[];
  attentionProperties: {
    id: string;
    name: string;
    slug: string;
    reason: string;
  }[];
};

function monthBoundsUtc(d: Date) {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const start = new Date(Date.UTC(y, m, 1));
  const end = new Date(Date.UTC(y, m + 1, 1));
  return { start, end };
}

/**
 * Carga TODO el shape de /admin overview en un solo entrypoint. Una sola
 * round-trip de hits a Postgres (todas las queries van en paralelo).
 */
export async function getAdminOverview(): Promise<AdminOverview> {
  await requireSuperAdmin();
  const admin = createAdminClient();
  const now = new Date();
  const { start: monthStart, end: monthEnd } = monthBoundsUtc(now);
  const prevMonth = new Date(monthStart.getTime() - 86_400_000);
  const { start: prevStart, end: prevEnd } = monthBoundsUtc(prevMonth);
  const [
    profilesAllR,
    profilesMonthR,
    profilesByRoleR,
    propsAllR,
    propsActiveR,
    propsMonthR,
    bookingsAllR,
    bookingsMonthR,
    bookingsPrevR,
    bookingsByStatusR,
    revenueR,
    auditR,
    topR,
    inactivePropsR,
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString()),
    admin.from("profiles").select("role"),
    admin.from("properties").select("id", { count: "exact", head: true }),
    admin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    admin
      .from("properties")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString()),
    admin.from("bookings").select("id", { count: "exact", head: true }),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString()),
    admin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", prevStart.toISOString())
      .lt("created_at", prevEnd.toISOString()),
    admin.from("bookings").select("status"),
    admin
      .from("bookings")
      .select("created_at, total_cents, status, property_id")
      .gte("created_at", monthStart.toISOString())
      .lt("created_at", monthEnd.toISOString())
      .in("status", ["confirmed", "completed"]),
    listAdminAuditLogs({ limit: 12 }),
    admin
      .from("bookings")
      .select("property_id, total_cents, status, properties(id, name, slug)")
      .gte("created_at", monthStart.toISOString())
      .lt("created_at", monthEnd.toISOString())
      .in("status", ["confirmed", "completed"]),
    admin
      .from("properties")
      .select("id, name, slug, is_active, created_at"),
  ]);

  if (profilesByRoleR.error) throw mapDbError(profilesByRoleR.error);
  if (bookingsByStatusR.error) throw mapDbError(bookingsByStatusR.error);
  if (revenueR.error) throw mapDbError(revenueR.error);
  if (topR.error) throw mapDbError(topR.error);
  if (inactivePropsR.error) throw mapDbError(inactivePropsR.error);

  const byRole: Record<string, number> = {};
  for (const r of profilesByRoleR.data ?? []) byRole[r.role] = (byRole[r.role] ?? 0) + 1;

  const byStatus: Record<string, number> = {};
  for (const r of bookingsByStatusR.data ?? []) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

  // Revenue por día del mes actual
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const todayDay = now.getUTCDate();
  const dayCents = new Array<number>(daysInMonth).fill(0);
  let totalCents = 0;
  let bookingsCount = 0;
  for (const b of revenueR.data ?? []) {
    const d = new Date(b.created_at);
    if (d.getUTCFullYear() !== now.getUTCFullYear() || d.getUTCMonth() !== now.getUTCMonth()) continue;
    const idx = d.getUTCDate() - 1;
    const cents = b.total_cents ?? 0;
    dayCents[idx] = (dayCents[idx] ?? 0) + cents;
    totalCents += cents;
    bookingsCount++;
  }
  const days = dayCents.map((cents, i) => ({
    day: i + 1,
    cents,
    isToday: i + 1 === todayDay,
    isFuture: i + 1 > todayDay,
  }));
  const bestIdx = days.reduce((bi, cur, i, arr) => (cur.cents > (arr[bi]?.cents ?? 0) ? i : bi), 0);
  const best = days[bestIdx];
  const bestDay = best && best.cents > 0
    ? {
        date: `${best.day} ${now.toLocaleDateString("es-CO", { month: "short" })}`,
        cents: best.cents,
      }
    : null;

  // Top properties (agregado client-side desde el query revenueR/topR — usamos topR
  // que ya trae el JOIN a properties).
  type TopRow = {
    property_id: string;
    total_cents: number;
    status: string;
    properties: { id: string; name: string; slug: string } | null;
  };
  const propAgg = new Map<
    string,
    { name: string; slug: string; bookings: number; cents: number }
  >();
  for (const raw of topR.data ?? []) {
    const r = raw as unknown as TopRow;
    if (!r.properties) continue;
    const entry = propAgg.get(r.property_id) ?? {
      name: r.properties.name,
      slug: r.properties.slug,
      bookings: 0,
      cents: 0,
    };
    entry.bookings++;
    entry.cents += r.total_cents ?? 0;
    propAgg.set(r.property_id, entry);
  }
  const topProperties = Array.from(propAgg.entries())
    .map(([id, v]) => ({ id, name: v.name, slug: v.slug, bookingsCount: v.bookings, revenueCents: v.cents }))
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, 5);

  // Attention: inactive recientes + propiedades sin bookings este mes
  const allProps = (inactivePropsR.data ?? []) as { id: string; name: string; slug: string; is_active: boolean; created_at: string }[];
  const propsWithBookings = new Set(propAgg.keys());
  const attentionProperties: AdminOverview["attentionProperties"] = [];
  for (const p of allProps) {
    if (!p.is_active) {
      attentionProperties.push({ id: p.id, name: p.name, slug: p.slug, reason: "Desactivada" });
    } else if (!propsWithBookings.has(p.id)) {
      // Solo flag si la propiedad lleva al menos 14 días creada (evita ruido en onboarding).
      const ageMs = Date.now() - new Date(p.created_at).getTime();
      if (ageMs > 14 * 86_400_000) {
        attentionProperties.push({ id: p.id, name: p.name, slug: p.slug, reason: "Sin reservas este mes" });
      }
    }
  }
  attentionProperties.splice(5);

  const avgCents = bookingsCount > 0 ? Math.round(totalCents / bookingsCount) : 0;
  const monthLabel = now.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  return {
    kpis: {
      users: {
        total: profilesAllR.count ?? 0,
        newThisMonth: profilesMonthR.count ?? 0,
        byRole,
      },
      properties: {
        total: propsAllR.count ?? 0,
        newThisMonth: propsMonthR.count ?? 0,
        active: propsActiveR.count ?? 0,
        inactive: (propsAllR.count ?? 0) - (propsActiveR.count ?? 0),
      },
      bookings: {
        total: bookingsAllR.count ?? 0,
        thisMonth: bookingsMonthR.count ?? 0,
        prevMonth: bookingsPrevR.count ?? 0,
        byStatus,
      },
    },
    revenue: {
      monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      totalCents,
      averagePerBookingCents: avgCents,
      bestDay,
      days,
    },
    recentEvents: auditR,
    topProperties,
    attentionProperties,
  };
}

/* ─── USERS (admin, enriched) ─── */

export type AdminUserPropertyLink = {
  id: string;
  name: string;
  slug: string;
  role: Database["public"]["Enums"]["PropertyUserRole"];
};

export type AdminUserViewRow = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: Database["public"]["Enums"]["UserRole"];
  createdAt: string;
  properties: AdminUserPropertyLink[];
  /** Última invitación aceptada — proxy de "miembro activo de alguna prop". */
  acceptedAt: string | null;
  /** Último login_event timestamp, si lo hay. */
  lastLoginAt: string | null;
};

/**
 * Lista users del sistema enriquecidos con sus property_users + properties +
 * último login. Cross-tenant via admin client (super_admin scope).
 */
export async function listAdminUsersFull(opts: {
  limit?: number;
  search?: string;
} = {}): Promise<AdminUserViewRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  let q = admin
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at");

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(`email.ilike.%${s}%,full_name.ilike.%${s}%`);
  }
  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 200);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  const profiles = data ?? [];
  if (profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.id);

  // Property memberships + property names (1 query each, JOIN via property_users).
  const [linksR, loginsR] = await Promise.all([
    admin
      .from("property_users")
      .select("user_id, role, invitation_accepted_at, properties(id, name, slug)")
      .in("user_id", userIds),
    admin
      .from("login_events")
      .select("user_id, created_at")
      .in("user_id", userIds)
      .eq("event_type", "login_success")
      .order("created_at", { ascending: false })
      .limit(1000),
  ]);

  if (linksR.error) throw mapDbError(linksR.error);
  if (loginsR.error) throw mapDbError(loginsR.error);

  type LinkRow = {
    user_id: string;
    role: Database["public"]["Enums"]["PropertyUserRole"];
    invitation_accepted_at: string | null;
    properties: { id: string; name: string; slug: string } | null;
  };

  const linksByUser = new Map<string, LinkRow[]>();
  for (const raw of linksR.data ?? []) {
    const row = raw as unknown as LinkRow;
    const arr = linksByUser.get(row.user_id) ?? [];
    arr.push(row);
    linksByUser.set(row.user_id, arr);
  }

  // login_events ordenados desc — primer hit por user es el último login.
  const lastLoginByUser = new Map<string, string>();
  for (const ev of loginsR.data ?? []) {
    if (!ev.user_id) continue;
    if (!lastLoginByUser.has(ev.user_id)) {
      lastLoginByUser.set(ev.user_id, ev.created_at);
    }
  }

  return profiles.map((p) => {
    const links = linksByUser.get(p.id) ?? [];
    const properties: AdminUserPropertyLink[] = links
      .map((l) => (l.properties ? { ...l.properties, role: l.role } : null))
      .filter((v): v is AdminUserPropertyLink => v !== null);
    const acceptedAt =
      links
        .map((l) => l.invitation_accepted_at)
        .filter((v): v is string => v !== null)
        .sort()
        .pop() ?? null;

    return {
      id: p.id,
      email: p.email,
      fullName: p.full_name,
      phone: p.phone,
      role: p.role,
      createdAt: p.created_at,
      properties,
      acceptedAt,
      lastLoginAt: lastLoginByUser.get(p.id) ?? null,
    };
  });
}

export type AdminUserDetailFull = AdminUserViewRow & {
  recentLogins: {
    eventType: Database["public"]["Enums"]["LoginEventType"];
    ip: string | null;
    userAgent: string | null;
    country: string | null;
    createdAt: string;
  }[];
};

/**
 * Detalle profundo de un user para super_admin. Mismo shape que la row +
 * últimos 10 login_events (todos los tipos: success/failed/reset/2fa).
 */
export async function getAdminUserDetailFull(
  userId: string,
): Promise<AdminUserDetailFull | null> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  const profR = await admin
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .eq("id", userId)
    .maybeSingle();
  if (profR.error) throw mapDbError(profR.error);
  if (!profR.data) return null;
  const p = profR.data;

  const [linksR, loginsR] = await Promise.all([
    admin
      .from("property_users")
      .select("role, invitation_accepted_at, properties(id, name, slug)")
      .eq("user_id", userId),
    admin
      .from("login_events")
      .select("event_type, ip, user_agent, country, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (linksR.error) throw mapDbError(linksR.error);
  if (loginsR.error) throw mapDbError(loginsR.error);

  type LinkRow = {
    role: Database["public"]["Enums"]["PropertyUserRole"];
    invitation_accepted_at: string | null;
    properties: { id: string; name: string; slug: string } | null;
  };

  const links = (linksR.data ?? []) as unknown as LinkRow[];
  const properties: AdminUserPropertyLink[] = links
    .map((l) => (l.properties ? { ...l.properties, role: l.role } : null))
    .filter((v): v is AdminUserPropertyLink => v !== null);

  const acceptedAt =
    links
      .map((l) => l.invitation_accepted_at)
      .filter((v): v is string => v !== null)
      .sort()
      .pop() ?? null;

  // Último login_success entre los 10 más recientes (puede no estar — si pedimos
  // más amplio cae al adapter para mostrar "nunca").
  const lastLoginAt =
    (loginsR.data ?? []).find((ev) => ev.event_type === "login_success")?.created_at ?? null;

  return {
    id: p.id,
    email: p.email,
    fullName: p.full_name,
    phone: p.phone,
    role: p.role,
    createdAt: p.created_at,
    properties,
    acceptedAt,
    lastLoginAt,
    recentLogins: (loginsR.data ?? []).map((ev) => ({
      eventType: ev.event_type,
      ip: ev.ip as string | null,
      userAgent: ev.user_agent,
      country: ev.country,
      createdAt: ev.created_at,
    })),
  };
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
  cursor?: string;       // ISO timestamp — paginate via created_at < cursor
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
  if (opts.cursor) q = q.lt("created_at", opts.cursor);

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

/* ─── WHATSAPP (admin) ─── */

type WhatsappStatus = Database["public"]["Enums"]["WhatsappMessageStatus"];
type MessageDirection = Database["public"]["Enums"]["MessageDirection"];

export type AdminWhatsappRow = {
  id: string;
  direction: MessageDirection;
  status: WhatsappStatus;
  fromPhone: string;
  toPhone: string;
  body: string | null;
  templateName: string | null;
  error: string | null;
  metaMessageId: string | null;
  bookingId: string | null;
  createdAt: string;
  property: { id: string; name: string; slug: string } | null;
};

/**
 * Lista whatsapp_messages cross-tenant para super_admin.
 *
 * Por que admin client: las policies de whatsapp_messages requieren
 * membership en la propiedad (`has_property_access`). Admin cross-tenant
 * pasa por requireSuperAdmin + admin client (mismo patron que audit_logs).
 */
export async function listAdminWhatsappMessages(opts: {
  search?: string;        // body or phone
  status?: WhatsappStatus;
  direction?: MessageDirection;
  propertyId?: string;
  from?: string;          // ISO timestamp created_at >=
  to?: string;            // ISO timestamp created_at <=
  limit?: number;
} = {}): Promise<AdminWhatsappRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  let q = admin
    .from("whatsapp_messages")
    .select(
      "id, direction, status, from_phone, to_phone, body, template_name, error, meta_message_id, booking_id, property_id, created_at",
    );

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(`body.ilike.%${s}%,from_phone.ilike.%${s}%,to_phone.ilike.%${s}%`);
  }
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.direction) q = q.eq("direction", opts.direction);
  if (opts.propertyId) q = q.eq("property_id", opts.propertyId);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 200);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  const rows = data ?? [];

  const propertyIds = Array.from(
    new Set(rows.map((r) => r.property_id).filter((v): v is string => Boolean(v))),
  );

  const propsR = propertyIds.length > 0
    ? await admin.from("properties").select("id, name, slug").in("id", propertyIds)
    : { data: [] as { id: string; name: string; slug: string }[], error: null };
  if (propsR.error) throw mapDbError(propsR.error);

  const propertyMap = new Map(
    (propsR.data ?? []).map((p) => [p.id, p]),
  );

  return rows.map((r) => ({
    id: r.id,
    direction: r.direction,
    status: r.status,
    fromPhone: r.from_phone,
    toPhone: r.to_phone,
    body: r.body,
    templateName: r.template_name,
    error: r.error,
    metaMessageId: r.meta_message_id,
    bookingId: r.booking_id,
    createdAt: r.created_at,
    property: r.property_id ? propertyMap.get(r.property_id) ?? null : null,
  }));
}

/* ─── WEBHOOKS (admin) ─── */

export type AdminWebhookLogRow = {
  id: string;
  provider: string;
  eventType: string | null;
  requestId: string | null;
  status: string;
  httpStatus: number | null;
  signatureValid: boolean | null;
  error: string | null;
  durationMs: number | null;
  ip: string | null;
  userAgent: string | null;
  payload: AuditLogRow["diff"];
  response: AuditLogRow["diff"];
  createdAt: string;
  property: { id: string; name: string; slug: string } | null;
};

export async function listAdminWebhookLogs(opts: {
  search?: string;          // event_type / request_id / error
  provider?: string;
  status?: string;
  propertyId?: string;
  from?: string;
  to?: string;
  limit?: number;
} = {}): Promise<AdminWebhookLogRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  let q = admin
    .from("webhook_logs")
    .select(
      `id, provider, event_type, request_id, status, http_status, signature_valid,
       error, duration_ms, ip, user_agent, payload, response, property_id, created_at`,
    );

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(
      `event_type.ilike.%${s}%,request_id.ilike.%${s}%,error.ilike.%${s}%`,
    );
  }
  if (opts.provider) q = q.eq("provider", opts.provider);
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.propertyId) q = q.eq("property_id", opts.propertyId);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 300);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  const rows = data ?? [];

  const propertyIds = Array.from(
    new Set(
      rows.map((r) => r.property_id).filter((v): v is string => Boolean(v)),
    ),
  );
  const propsR = propertyIds.length > 0
    ? await admin
        .from("properties")
        .select("id, name, slug")
        .in("id", propertyIds)
    : { data: [] as { id: string; name: string; slug: string }[], error: null };
  if (propsR.error) throw mapDbError(propsR.error);

  const propertyMap = new Map(
    (propsR.data ?? []).map((p) => [p.id, p]),
  );

  return rows.map((r) => ({
    id: r.id,
    provider: r.provider,
    eventType: r.event_type,
    requestId: r.request_id,
    status: r.status,
    httpStatus: r.http_status,
    signatureValid: r.signature_valid,
    error: r.error,
    durationMs: r.duration_ms,
    ip: r.ip as string | null,
    userAgent: r.user_agent,
    payload: r.payload,
    response: r.response,
    createdAt: r.created_at,
    property: r.property_id ? propertyMap.get(r.property_id) ?? null : null,
  }));
}

export async function listAdminWebhookProviders(): Promise<string[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhook_logs")
    .select("provider")
    .limit(500);
  if (error) throw mapDbError(error);
  const set = new Set<string>();
  for (const r of data ?? []) set.add(r.provider);
  return Array.from(set).sort();
}

/* ─── EMAILS (admin) ─── */

type EmailStatus = Database["public"]["Enums"]["EmailStatus"];

export type AdminEmailRow = {
  id: string;
  status: EmailStatus;
  subject: string;
  template: string;
  toEmail: string;
  resendId: string | null;
  createdAt: string;
  property: { id: string; name: string; slug: string } | null;
};

/**
 * Lista email_logs cross-tenant. property_id es nullable (emails sistema —
 * password reset, etc. — no son property-scoped).
 */
export async function listAdminEmailLogs(opts: {
  search?: string;        // subject or to_email
  status?: EmailStatus;
  template?: string;
  propertyId?: string;
  from?: string;
  to?: string;
  limit?: number;
} = {}): Promise<AdminEmailRow[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();

  let q = admin
    .from("email_logs")
    .select(
      "id, status, subject, template, to_email, resend_id, property_id, created_at",
    );

  if (opts.search) {
    const s = opts.search.replace(/[%_]/g, (m) => "\\" + m);
    q = q.or(`subject.ilike.%${s}%,to_email.ilike.%${s}%`);
  }
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.template) q = q.eq("template", opts.template);
  if (opts.propertyId) q = q.eq("property_id", opts.propertyId);
  if (opts.from) q = q.gte("created_at", opts.from);
  if (opts.to) q = q.lte("created_at", opts.to);

  q = q.order("created_at", { ascending: false }).limit(opts.limit ?? 200);

  const { data, error } = await q;
  if (error) throw mapDbError(error);
  const rows = data ?? [];

  const propertyIds = Array.from(
    new Set(rows.map((r) => r.property_id).filter((v): v is string => Boolean(v))),
  );

  const propsR = propertyIds.length > 0
    ? await admin.from("properties").select("id, name, slug").in("id", propertyIds)
    : { data: [] as { id: string; name: string; slug: string }[], error: null };
  if (propsR.error) throw mapDbError(propsR.error);

  const propertyMap = new Map(
    (propsR.data ?? []).map((p) => [p.id, p]),
  );

  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    subject: r.subject,
    template: r.template,
    toEmail: r.to_email,
    resendId: r.resend_id,
    createdAt: r.created_at,
    property: r.property_id ? propertyMap.get(r.property_id) ?? null : null,
  }));
}

/**
 * Distinct templates (para popular filter dropdown).
 */
export async function listAdminEmailTemplates(): Promise<string[]> {
  await requireSuperAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("email_logs")
    .select("template")
    .limit(500);
  if (error) throw mapDbError(error);
  const set = new Set<string>();
  for (const r of data ?? []) set.add(r.template);
  return Array.from(set).sort();
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
