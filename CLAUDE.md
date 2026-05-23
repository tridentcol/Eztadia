# Eztadia

Plataforma SaaS multi-tenant para gestión de habitaciones de hoteles boutique, complejos y edificios. Por habitación, con página pública por propiedad, reservas con PSE/transferencia, WhatsApp y sincronización iCal con OTAs.

## ⚡ Estado actual (mayo 2026)

**Phase A · Frontend COMPLETO** ✅ — todas las pantallas críticas implementadas con demo data en `lib/*.ts` (flat).
**Phase B · Backend Infrastructure** 🔄 NEXT — Supabase + Prisma + RLS + Auth real. Ver `EZTADIA-BLUEPRINT.md` Sección 17 para los 18 steps detallados.

## 📐 Documentos de referencia (raíz del repo)

| Archivo / Carpeta | Para qué | Cuándo consultarlo |
|------|----------|---------------------|
| `EZTADIA-BLUEPRINT.md` | Arquitectura + roadmap. **Sección 17 supersede el Build Order original** | Siempre. Es la verdad del proyecto. |
| `DESIGN_NOTES.md` | Decisiones de diseño tomadas en Phase A con razonamiento (35 KB) | Cuando dudes por qué algo es así |
| `app/globals.css` | Sistema de diseño canónico (CSS vars + animations) | Antes de agregar componente UI nuevo |
| `designs/mockup-*.html` | 13 snapshots HTML standalone — referencia de implementación previa | Si dudas de cómo se ve algo en práctica |

**Prioridad cuando hay conflicto:** `app/globals.css` (canónico para tokens) > `designs/mockup-<pantalla>.html` > Sección 7 del blueprint.

> Nota: `EZTADIA-DESIGN-BRIEF.md` está referenciado en el blueprint pero **no existe aún** en el repo. Si lo necesitas, pide al usuario que lo agregue.

## ⚠️ Reglas de la realidad actual

1. **NO toques páginas ni componentes visuales en Phase B+.** Solo capa de datos. Si el shape de demo no coincide con query real, ajusta el query.
2. **NO instales shadcn/ui ni lucide-react.** Las primitives están coladas dentro de `components/<dominio>/` (no hay carpeta `components/ui/` separada). Los iconos son **SVG inline propios** en `components/icons.tsx` y `components/<dominio>/icons.tsx` (Phosphor NO está instalado como paquete).
3. **Single-locale (español)** hasta Phase D. NO uses next-intl todavía.
4. **Rutas FLAT en `/dashboard/`** — multi-property con switcher viene en Phase D. No uses `/dashboard/[propertyId]/...` aún.
5. **Tabs vía query params (`?tab=...`)** en property-settings y settings personales — no nested routes.
6. **Demo data en `lib/*.ts` (flat)** se reemplaza por `lib/db/queries/*` en Phase B6. NO mezcles.

## Commands

Actualmente disponibles (post-scaffold Phase B0):

- `pnpm dev` — Dev server (Next 15 default, sin Turbopack flag)
- `pnpm build` — Production build
- `pnpm start` — Production server local
- `pnpm lint` — `next lint`
- `pnpm typecheck` — TypeScript (`tsc --noEmit`)

A agregar durante Phase B:

- `pnpm db:push` / `pnpm db:generate` / `pnpm db:migrate:dev` / `pnpm db:seed` / `pnpm db:studio` (Prisma) — Phase B2
- `pnpm supabase:gen-types` — Phase B4
- `npx supabase db push` — Aplicar migrations SQL (RLS, funciones) — Phase B3
- `pnpm test` — Vitest — Phase B10

## Tech Stack

Next.js 15 App Router · React 19 · TypeScript strict · Tailwind v4 · **primitives propias (NO shadcn)** · Supabase Postgres + Auth (Phase B) · Prisma (Phase B) · Wompi (PSE) · WhatsApp Cloud API · Resend · Upstash Redis · Cloudflare Turnstile · Vercel · pnpm · Node 20+.

## Architecture

### Directory Structure (real, no src/, no [locale] todavía)

```
app/                                # Next.js 15 App Router
├── globals.css                     # Sistema de diseño canónico
├── layout.tsx                      # Root layout
├── page.tsx                        # / landing
├── not-found.tsx · error.tsx · forbidden/page.tsx
├── login/ · login/2fa/ · signup/ · reset-password/[token]/
├── onboarding/
├── dashboard/                      # Rutas FLAT, sin /[propertyId]/
│   ├── layout.tsx
│   ├── page.tsx (overview) · calendar/ · bookings/ · staff/
│   ├── integrations/ · integrations/wompi/
│   ├── property-settings/ (tabs vía ?tab=...)
│   └── settings/ (personal, tabs vía ?tab=...)
├── admin/                          # super_admin
│   ├── layout.tsx · page.tsx · users/page.tsx
└── p/[slug]/                       # Página pública + booking flow
    ├── page.tsx
    └── booking/new/ · booking/[holdId]/pay/ · booking/[holdId]/status/

components/                         # En raíz, NO en app/
├── icons.tsx                       # SVG inline globales
└── {admin,auth,booking-flow,bookings,calendar,dashboard,
    integrations,landing,onboarding,personal-settings,
    property,property-settings,shared,staff}/
   # Cada dominio tiene sus propias primitives + icons.tsx local

lib/                                # Demo data flat, se migra a lib/db/* en Phase B5-B6
├── admin.ts · bookings.ts · booking-flow.ts · calendar.ts
├── dashboard.ts · format.ts · integrations.ts · onboarding-store.ts
├── personal-settings.ts · properties.ts · property-settings.ts · staff.ts

designs/                            # 13 archivos HTML planos (no subcarpetas)
└── mockup-{admin,auth,booking-flow,bookings,calendar,dashboard,
    onboarding,personal-settings,property-settings,property,
    staff-integrations,states-catalog}.html · mockup.html
```

### Estructuras que se agregan en Phase B

```
lib/
├── supabase/ {client.ts, server.ts, admin.ts, middleware.ts}    # B4
├── db/
│   ├── index.ts                    # Prisma client singleton
│   ├── queries/ {property, rooms, bookings, availability, staff, admin}.ts   # B5
│   └── mutations/ {bookings, payments, properties, staff}.ts                 # B5
├── auth/ {session.ts, permissions.ts}                            # B9
├── validation/ {booking, property, room, user, payment}.ts       # B8
└── errors.ts

prisma/schema.prisma                # B2
supabase/migrations/                # B3 (RLS, funciones, triggers)
middleware.ts                       # B4 (refresh + route guards)
tests/integration/rls.test.ts       # B10
```

### Data Flow

- **Lectura:** Server Components hacen queries directos vía Supabase server client. RLS aplica.
- **Escritura:** Server Actions (dashboard) o Route Handlers (públicos, webhooks). Validación Zod, audit log, revalidate.
- **Realtime:** Supabase channels para bookings live updates en el calendar (Phase C5).
- **Disponibilidad:** función SQL `check_availability(property_id, room_type_id, check_in, check_out)` considera bookings + holds activos + external_blocks (iCal).
- **Booking flow:** POST hold (atómico vía SQL function `create_booking_hold`) → PSE link o instrucciones manuales → webhook/upload → confirmación → asignar room → email + WhatsApp.

### Key Patterns

- **Server Components por defecto.** `"use client"` solo cuando hay interactividad real (estado/efectos/handlers).
- **RLS first.** Cada query asume que RLS filtra. Tests verifican el aislamiento (B10).
- **Property-scoped permissions.** `requireProperty(propertyId)` retorna `{ user, propertyRole }`. `can(action, ctx)` autoriza.
- **Secrets cifrados** en DB (wompi private key, whatsapp token) con `ENCRYPTION_KEY` server-side.
- **Webhooks idempotentes.** Siempre verificar si la transaction ya fue procesada antes de actuar.
- **Holds atómicos.** Crear vía `create_booking_hold` function (lock + check + insert). Nunca a mano.
- **Audit log** para toda acción no-trivial.
- **Rate limit + Turnstile** en cualquier endpoint público sin auth (Phase E5/F).

## Code Organization Rules

1. **Una component por archivo.** Max 300 líneas; si crece, extraer sub-components.
2. **Path alias `@/`** apunta a la raíz (no `src/`). Definido en `tsconfig.json`.
3. **Sin barrel exports** (`index.ts` re-export). Importa desde la fuente.
4. **Server Components por defecto.** `"use client"` solo cuando se necesita estado/efectos/handlers.
5. **Colocate.** Componentes específicos de un dominio viven en `components/<dominio>/`.
6. **Strict TypeScript.** Sin `any`. Sin `as` excepto cuando es genuinamente necesario y justificado.
7. **Zod en TODA Server Action y route handler.** Entrada validada, errores tipados.
8. **Money en cents.** Nunca uses float para dinero. `total_cents` (INT).
9. **Dates en UTC en DB, render en `America/Bogota`.** Usa `date-fns-tz` (se instala en Phase D; por ahora hardcodear timezone está OK).
10. **Strings hardcoded en español** hasta Phase D. NO uses `useTranslations()` todavía — next-intl entra en D15.

## Design System

**Para el detalle completo lee `DESIGN_NOTES.md`** (no hay `EZTADIA-DESIGN-BRIEF.md` aún). Resumen accionable:

### Colors (paleta tierra)

- Background: `--cream #FBF8F2` (**nunca #FFF como bg de página**)
- Surface: `--paper #FFFFFF`, hover bg `--linen #F2EDE2`
- Primary: `--sage #5C7567` (color de marca — links, botones, badges)
- Accent: `--terracotta #C76F4C` (solo CTAs *importantes*: Reservar, Pagar)
- Ink: `--ink #1F1B16` (no #000), soft `--ink-soft #5A5147`, muted `--ink-muted #8B8275`
- Borders: `--rule #E5DFD3` (preferir hairlines a sombras)
- Destructive: `--danger #A8483C` (rojo terroso)
- Success: `--success #5E8A5F`, Warning: `--warning #C49A3C`

### Typography

- Display/H1-H3 + nombres de propiedad + números prominentes: **Fraunces Variable** (serif con italics, oldstyle nums) — 24-96px, weight 500
- UI/body: **Inter Variable** — 12-18px, weight 400-600
- Mono: **JetBrains Mono** (códigos de reserva, IDs)
- Nombres de propiedad: SIEMPRE Fraunces italic
- Precios y métricas grandes: Fraunces oldstyle; tablas: Inter tabular

### Style

- Border radius: 6/10/14/20/28/40 (xs/sm/default/md/lg/xl) — generosamente redondeado
- Shadows casi inexistentes. Preferir `border: 1px solid var(--rule)`.
- Spacing scale 4px: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128, 160
- Transitions: 150-250ms `cubic-bezier(0.32, 0.72, 0, 1)`
- Iconos: **SVG inline propios** stroke 1.5-1.7 (NO Phosphor package, NO Lucide)
- Mobile-first responsive

### Anti-patterns (NO HACER)

- ❌ Sidebar negra con íconos mini
- ❌ KPI cards en grid 2x2 con % verde/rojo
- ❌ Gradientes morados / glassmorphism / neón
- ❌ Botones con shine animado
- ❌ Emojis decorativos (✨🚀💎)
- ❌ Loading spinners (usa skeletons)
- ❌ Look "shadcn default" — primitives propias siempre

## Environment Variables

Crear `.env.local` (en `.gitignore`). Crítico para Phase B:

- `DATABASE_URL` / `DIRECT_URL` — Supabase Postgres (pgbouncer + direct)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

A agregar en fases posteriores:

- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` (Phase E)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (Phase F)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` (Phase E5)
- `META_APP_SECRET` / `META_VERIFY_TOKEN` (WhatsApp)
- `CRON_SECRET` (32+ chars) — Phase B14
- `ENCRYPTION_KEY` (64 hex chars = 32 bytes) — Phase B
- `NEXT_PUBLIC_SENTRY_DSN` (Phase F)

## Reglas No Negociables

### Phase B+ (a partir de hoy)

1. **RLS habilitada en TODAS las tablas.** Si agregas tabla nueva, agrega policies en la misma migration.
2. **Nunca uses `service_role` en client code.** Solo en `lib/supabase/admin.ts` y solo cuando sea estrictamente necesario y justificado.
3. **Money siempre en cents (INT).** Nunca floats.
4. **Dates en DB en UTC.** Render en zona horaria de la propiedad (`America/Bogota` default).
5. **Validación Zod en cada Server Action y route handler.** Sin excepciones.
6. **Rate limit en endpoints públicos.** Mínimo: login, signup, booking submit, uploads. (Phase F)
7. **Turnstile en formularios anónimos.** Login, signup, booking, password reset. (Phase E5)
8. **Webhooks verifican HMAC.** Sin firma válida → 401 inmediato.
9. **Holds atómicos vía SQL function.** Nunca hagas el check+insert a mano desde TS.
10. **Idempotencia en webhooks.** Verifica si la transaction/mensaje ya fue procesado.
11. **Audit log en acciones críticas** (cambios de precio, cancelaciones, refunds, role changes, eliminaciones).
12. **No commit `.env*` files.** `.env.example` siempre actualizado.
13. **TypeScript strict, sin `any`.** Sin excepciones.
14. **Tests RLS son obligatorios.** Si agregas tabla nueva con policies, agrega test que verifique aislamiento.
15. **Mobile-first.** Cada vista se testea en viewport 375px.
16. **Server Components por defecto.** `"use client"` requiere justificación.
17. **Secrets de terceros (Wompi, WhatsApp) van cifrados en DB**, nunca en plaintext.
18. **Cron endpoints validan `CRON_SECRET`** antes de hacer cualquier cosa.
19. **Una sola fuente de verdad para disponibilidad:** `check_availability` (SQL function). No reimplementar la lógica en TS.

### Reglas heredadas de Phase A (canónicas — NO violar)

20. **NO instalar shadcn/ui ni lucide-react.** Primitives propias coladas en `components/<dominio>/`. Iconos = SVG inline propios (no Phosphor package).
21. **NO usar `#FFF` como page background.** Siempre `--cream #FBF8F2`. Blanco es solo para cards.
22. **Sombras casi inexistentes.** Preferir hairlines `border 1px var(--rule)`.
23. **Nombres de propiedad SIEMPRE en Fraunces italic.** Precios y métricas grandes en Fraunces oldstyle.
24. **`--terracotta` solo para CTAs *importantes*** (Reservar, Pagar, Comenzar). NO para botones cotidianos.
25. **Mantener single-locale (es)** hasta Phase D. NO hardcodear infraestructura i18n todavía.
26. **Rutas dashboard FLAT** hasta Phase D-13. NO refactorizar a `/dashboard/[propertyId]/...` aún.
27. **Tabs vía `?tab=...`** en property-settings y settings personales. NO crear nested routes.
28. **Anti-patterns visuales** (lista en `DESIGN_NOTES.md`) son NO NEGOCIABLES en cualquier UI nueva.

## Workflow de continuidad entre sesiones

Este proyecto mantiene continuidad vía:
- **CLAUDE.md** (este archivo) — reglas inmutables auto-cargadas
- **PROGRESS.md** — estado mutable actualizado al cerrar cada sesión
- **Git commits** — historial técnico

Al INICIAR sesión nueva, el usuario pegará el prompt RESUME-SESSION que te pedirá leer este archivo + PROGRESS.md + git log y arrancar el próximo step AUTOMÁTICAMENTE.

Al CERRAR sesión, el usuario pegará el prompt END-SESSION que te pedirá actualizar PROGRESS.md y commitear AUTOMÁTICAMENTE.

El usuario opera en modo autónomo — no le pidas aprobaciones rutinarias. Solo párate si hay un bloqueo real (decisión que solo él puede tomar, credenciales faltantes, error técnico que no puedes resolver).

PROGRESS.md se modifica SOLO durante END-SESSION (excepto su creación inicial). Mid-session, anota mentalmente para incluir al cerrar.
