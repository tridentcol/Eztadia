# Eztadia — Progress Log

> Última actualización: 2026-05-23 por sesión Claude Code #2 (Phase B sprint)
> Branch: `main`  ·  Último commit: `6f533d0`
> Phase activa: **B · Backend Infrastructure** → **COMPLETA** ✅

## 📍 Estado actual

**Phase:** B · Backend Infrastructure — **TODOS los steps B1→B18 cerrados.**
**Último step completado:** B18 · Verificación end-to-end (signup→login→property creation via RLS verificada).
**Próximo step:** **Phase C · Booking flow + payments** (blueprint Sección 17.3 C1-C6).
**Bloqueado por:** Nada para arrancar Phase C. Notas en "Lo que NO se hizo intencionalmente" abajo.

## ✅ Steps completados

- [x] B1 Setup Supabase project · commit `16e28cc`
- [x] B2 Schema Prisma + tipos generados · commit `0e1ebae`
- [x] B3 RLS policies + SQL functions · commit `14d74b1` (5 migrations)
- [x] B4 Supabase Auth real · commit `b3f2105`
- [x] B5 Data layer · queries · commit `63c212e`
- [x] B6 Reemplazar demo data en páginas · commit `7bc3de7` (parcial — ver notas)
- [x] B7 Server Actions para mutaciones · commit `7bc3de7`
- [x] B8 Zod validation schemas · commit `aa8c3f2`
- [x] B9 Auth session helpers · commit `aa8c3f2`
- [x] B10 Tests de aislamiento RLS · commit `6f533d0` (10/10 passing)
- [x] B11 Webhook /api/webhooks/wompi · commit `d9e6a1a`
- [x] B12 Upload /api/upload/payment-proof · commit `d9e6a1a`
- [x] B13 Upload /api/upload/property-photo · commit `d9e6a1a`
- [x] B14 Cron /api/cron/expire-holds · commit `d9e6a1a`
- [x] B15 Export iCal · commit `d9e6a1a`
- [x] B16 Audit log helper · commit `aa8c3f2`
- [x] B17 vercel.json con cron schedule · commit `d9e6a1a`
- [x] B18 Verificación end-to-end · esta sesión (smoke directo a REST + middleware)

## 🎯 Próximo step — detalle

**Step:** Phase C · Booking flow + payments. Blueprint Sección 17.3 C1-C6:
- C1 Calendar con bookings reales (Supabase Realtime channel)
- C2 Bookings table (lista + filtros + acciones)
- C3 Public booking flow `/p/[slug]/booking/new` cableado a `publicCreateHoldAction`
- C4 PSE/Wompi integration completa (payment_link generation + redirect)
- C5 Confirmación manual de transferencia (upload proof + confirmar)
- C6 Realtime updates en calendar

Empezar por leer `EZTADIA-BLUEPRINT.md` Sección 17.3 al detalle.

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesión 1 (2026-05-22)

- `package.json` se creó en raíz como **lift de `designs/package.json` mal ubicado**. Nombre cambió a `"eztadia"`. `designs/package.json` original sigue ahí (sin borrar — committeado en `c936434`).
- **pnpm vía `npx pnpm ...`**, NO instalado global. Versión fijada via `packageManager: pnpm@9.15.0`.
- **Phosphor NO instalado.** SVG inline propios en `components/icons.tsx`. NO instalar `lucide-react` tampoco.
- **`UpcomingCheckIns.tsx` declara `"use client"`** (fix bug Phase A — onClick en Server Component).
- **8 puntos de divergencia blueprint↔código real** reconciliados en Sección 17.1 del blueprint (sin mover archivos).
- **MCP Supabase scope project** (`.mcp.json` committeable). Project ref `fdcgqywnwllfxpjrpako`.

### Sesión 2 (2026-05-23) — Phase B sprint completa

**B1 — Setup Supabase**
- **Región real: `us-east-2` (Ohio)**, NO `us-east-1` como afirmaba PROGRESS sesión 1. Pooler host correcto: **`aws-1-us-east-2.pooler.supabase.com`** (no `aws-0-...`) — confirmado por `supabase db push` exitoso. Para proyectos nuevos en us-east-2, Supabase usa cluster `aws-1`.
- **CLI auth via macOS keychain** (`supabase login` interactivo del usuario en otra terminal; CLI subsiguiente la lee del keychain).
- **3 keys extraídas vía MCP** (URL, anon JWT, publishable key `sb_publishable_...`). SERVICE_ROLE + DB password los pegó el usuario.
- DB Postgres **17.6** confirmado.

**B2 — Prisma schema**
- **Prisma pin a 6.19.3** (NO 7.x). Prisma 7 sacó `url`/`directUrl` del schema.prisma y los movió a un `prisma.config.ts` aparte — breaking change que el blueprint no contempla. Bajamos a 6 estable.
- Connection string config: `dotenv -e .env.local --` wrapper en cada script `db:*` porque Prisma no lee `.env.local` nativo (Next sí).
- 18 modelos + 12 enums (Prisma genera enum types case-sensitive: `"PropertyUserRole"`, etc.).
- Diferidos a B3 (Prisma no expresa): generated col `nights`, defaults `code`/`public_token`/`ical_export_secret`, FK `profiles→auth.users`.

**B3 — RLS + SQL functions**
- **`auth` schema está locked en Supabase managed** (owned por `supabase_admin`, no `postgres`). Helpers del blueprint (`auth.is_super_admin()`, etc.) tuvieron que ir a **`public.` schema**. Blueprint Sección 4 desactualizado en este punto.
- **2 gaps Prisma↔Supabase cazados por smoke test:**
  - `@default(uuid())` NO genera `DEFAULT` SQL → fix: `gen_random_uuid()` defaults en migration 0005.
  - `@updatedAt` NO genera trigger ni default → fix: trigger `set_updated_at BEFORE UPDATE` en migration 0004.
- **5 migrations B3** + **2 más en B10** (auto-link trigger + select policy fallback) = **7 migrations totales**.
- Smoke test atómico (check_availability, create_booking_hold con FOR UPDATE, expire_old_holds) — todos green.

**B4 — Supabase Auth**
- **Supabase rechaza `@example.com`** como `email_address_invalid` — tests usan `@gmail.com` (alias `+...`).
- **Email confirmation queda ON** (Supabase default). Pendiente decisión del usuario si desactivar en dev — por ahora confirmamos manualmente via MCP en cada smoke test.
- `URL.clone()` NO existe en standard URL — usar `new URL(path, origin)`.
- 7 errores JSX namespace en componentes Phase A pre-existentes (NO tocados; regla anti-visual).

**B5 — Data layer**
- `database.types.ts` (1286 LOC) generado via `supabase gen types typescript --linked`.
- Patron: Supabase server client por default (RLS aplica). Prisma client singleton solo para admin/cron/batch.
- `asAdmin` opt-in en mutations que necesitan bypass (webhook Wompi, public booking flow, cron sync iCal).

**B6 — Reemplazo demo (PARCIAL intencionalmente)**
- Solo `/dashboard` + `/onboarding` cableadas a data real. Resto (`/admin`, `/dashboard/{calendar,bookings,staff,integrations,property-settings,settings}`, `/p/[slug]`) siguen con demo + **TODO header comments** apuntando a las queries que les corresponden.
- Razón: los componentes demo tienen shapes muy ricos (faq, photos, métricas calculadas) que requieren data real desplegada para tener sentido. Wireing piecemeal en Phase C+ cuando haya bookings reales.

**B10 — Tests RLS (10/10 passing)**
- **Bug crítico descubierto: PostgREST `INSERT().select()` gotcha.** Cuando un user autenticado inserta una property y pide RETURNING (vía supabase-js `.insert().select().single()`), la SELECT policy `properties_member_select` (que requiere link en `property_users`) bloquea el retorno → error misleading "violates RLS".
- Fix de dos capas:
  1. **Trigger `auto_link_property_owner`** AFTER INSERT en properties que crea `property_users(owner)` desde `organizations.owner_id`.
  2. **Policy `properties_org_owner_select`** alternativa (defensive) — permite SELECT si el user es owner de la org. Cubre el race PostgREST INSERT→RETURNING.
- Tests usan `@supabase/supabase-js` directo con anon key + signin; verifican aislamiento user A vs B en properties, bookings, profiles, UPDATE/DELETE guards.

**Buckets storage creados via MCP (no migration en repo):**
- `payment-proofs` (privado, 10MB max, png/jpeg/webp/pdf)
- `property-photos` (público, 5MB max, png/jpeg/webp)

**Secrets generados localmente (`.env.local`):**
- `ENCRYPTION_KEY` (32 bytes hex) para AES-256-GCM en `lib/crypto.ts`
- `CRON_SECRET` (32 bytes hex) para validar `/api/cron/*`

## ⚠️ Lo que NO se hizo intencionalmente (deuda conocida)

1. **Email confirmation queda ON.** Usuario decidió mantener; smoke tests confirman email manualmente via MCP. Para producción ya está como debe estar.
2. **B6 parcial.** 6 páginas dashboard + admin + /p/[slug] siguen con demo data + TODO comments. Wiring real en Phase C+ cuando haya data desplegada.
3. **Wompi credentials no configuradas.** El blueprint diseña que cada propiedad guarda sus credenciales cifradas en DB (`wompi_configs` table). B11 deja el webhook listo + estructura para `encrypt()` desde `lib/crypto.ts`. Cada owner configura desde `/dashboard/property-settings/wompi` (esa UI viene en Phase C4).
4. **2FA backup codes.** Supabase MFA no provee backup codes out-of-box. TODO B8 comment en `TwoFAForm.tsx` — implementar storage propio cuando llegue Phase D.
5. **`designs/package.json` ocioso.** Sigue committeado en `c936434`. No afecta runtime, pendiente decidir si se borra.
6. **`prisma db push` NO usar directo desde B3.** El schema en remoto tiene generated cols, defaults, FKs y RLS que `db push` revertiría. Para cambios: `prisma migrate dev --create-only` + editar + commit, o nueva supabase migration manual. Drift warning en `prisma/schema.prisma`.

## ❓ Preguntas abiertas para el usuario

1. **Phase C empezar por C1 (calendar real) o C3 (public booking flow)?** El blueprint los lista en orden, pero C3 es donde el flow E2E "guest → reserva" cobra vida. Mi recomendación: C3 primero (mostrable a stakeholders), C1 después.
2. **`designs/package.json` ocioso — ¿borrar?** No es bloqueante.
3. **Deploy a Vercel — ¿cuándo?** Aún no se hizo. Una vez Phase C esté lista, conviene un primer deploy preview.

## 📂 Migrations aplicadas en remoto (7 totales)

```
supabase/migrations/
├── 20260522230100_pre_rls_housekeeping.sql      (B3 #1)
├── 20260522230200_rls_policies.sql              (B3 #2 — 5 helpers + 18 RLS + 52 policies)
├── 20260522230300_booking_functions.sql         (B3 #3 — check_availability, create_booking_hold, expire_old_holds)
├── 20260522230400_updated_at_triggers.sql       (B3 #4 — gap detected en smoke test)
├── 20260522230500_id_defaults.sql               (B3 #5 — gap detected en smoke test)
├── 20260523000100_auto_link_property_owner.sql  (B10 — gap detected en RLS tests)
└── 20260523000200_properties_select_via_org.sql (B10 — defensive policy)
```

Estado en remoto verificable via `npx supabase migration list --linked --password '<DB-pwd>'`.

## 🧪 Tests / verificaciones corridas

- ✅ `pnpm test` — **10/10 RLS isolation tests passing** (5s, conecta a remoto real).
- ✅ `pnpm typecheck` — clean en código nuevo (7 errores JSX Phase A pre-existentes, NO tocados).
- ✅ E2E smoke: signup REST → trigger profile → login JWT → INSERT org+property → trigger auto-link → getFirstAccessibleProperty → getProperty → /p/[slug] anon SELECT.
- ✅ Route handlers: `/api/cron/expire-holds` (401 sin bearer, 200 con), `/api/ical/.../bad.ics` (404), `/api/webhooks/wompi` (200 con note), `/api/upload/payment-proof` (401 sin auth), middleware `/dashboard` (307 → `/login`).
- ❌ `pnpm build` — NO corrido (verificación dev fue suficiente para Phase B).

## 🔧 Setup de entorno actual

- **Node:** v26.0.0 (Homebrew).
- **pnpm:** NO global. Usar `npx pnpm ...` siempre.
- **curl:** usar `/usr/bin/curl` (no en PATH del shell zsh).
- **git:** remote `origin` = `https://github.com/tridentcol/Eztadia.git`; `main` local **NO pusheado** (12 commits ahead).
- **Supabase CLI:** linkeada a `fdcgqywnwllfxpjrpako` (eztadia, us-east-2). Auth via macOS keychain.

### Env vars en `.env.local` (gitignored)

```
NEXT_PUBLIC_SUPABASE_URL=https://fdcgqywnwllfxpjrpako.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        (extraído via MCP)
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... (extraído via MCP, no usado todavía)
SUPABASE_SERVICE_ROLE_KEY=...            (pegado por usuario sesión 2)
DATABASE_URL=postgresql://postgres.fdcgqywnwllfxpjrpako:<pwd>@aws-1-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.fdcgqywnwllfxpjrpako:<pwd>@aws-1-us-east-2.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=...        (32 bytes hex, generado en sesión 2)
CRON_SECRET=...           (32 bytes hex, generado en sesión 2)
```

### Pendientes para Phase E/F (no Phase B)

- `RESEND_API_KEY` (Phase E)
- `UPSTASH_REDIS_REST_*` (Phase F)
- `NEXT_PUBLIC_TURNSTILE_*` (Phase E5)
- `META_APP_SECRET` (WhatsApp, Phase C/D)
- `NEXT_PUBLIC_SENTRY_DSN` (Phase F)

## 📊 Bitácora de sesiones

| # | Fecha | Horas | Steps abordados | Notas |
|---|-------|-------|-----------------|-------|
| 1 | 2026-05-22 | ~2h | B0 (bootstrap + scaffold + reconciliación docs + MCP config + retrofit continuidad) | Sesión cubrió git init, auditoría blueprint↔código, workflow continuidad. B1 quedó bloqueado pendiente credenciales. |
| 2 | 2026-05-23 | ~4h | B1→B18 completa · 12 commits · 13K LOC · 7 migrations · 10 tests RLS passing | Sprint full Phase B. Hallazgos: pooler us-east-2 aws-1, Prisma 6 (no 7), helpers en public (no auth), trigger auto-link property owner, 2 gaps Prisma→SQL (uuid + updatedAt). B6 parcial intencionalmente. |

## 📜 Historial de commits recientes

```
6f533d0 feat(B10): tests RLS aislamiento · 10/10 passing
d9e6a1a feat(B11-B17): route handlers · webhook + uploads + cron + ical + vercel
7bc3de7 feat(B7+B6): server actions + wire critical-path pages a data real
aa8c3f2 feat(B8+B9+B16): Zod schemas + auth helpers + audit log
124a9f7 chore: descomenta ENCRYPTION_KEY y CRON_SECRET en .env.example
63c212e feat(B5): data layer · queries + mutations
b3f2105 feat(B4): Supabase Auth real (reemplaza mock)
14d74b1 feat(B3): RLS + 5 SQL migrations + drift warning
0e1ebae feat(B2): Prisma schema + first db push
16e28cc feat(B1): setup Supabase project + CLI link
e94b2a3 chore: Phase B0 bootstrap
be6fbc9 infra: agrega CLAUDE.md y PROGRESS.md para continuidad entre sesiones
c936434 Add Next.js project scaffold
205aa9c first commit
```

(El commit de END-SESSION de la sesión 2 se agrega al final y aparecerá como nuevo entry en la próxima sesión.)
