# Eztadia — Blueprint

> Generado por The Architect el 2026-05-21
> Archetype: SaaS Web App (multi-tenant)
> Idioma del producto: Español + Inglés (i18n)
> Mercado: Colombia (con vocación regional)

---

## 📦 Paquete del proyecto — documentos relacionados

Este blueprint **no contiene el diseño visual detallado**. El diseño vive en archivos separados que se copian al proyecto:

| Archivo / Carpeta | Qué es | Dónde vive en el proyecto target |
|-------------------|--------|----------------------------------|
| **`eztadia-blueprint.md`** *(este archivo)* | Arquitectura, stack, data model, build order, seguridad | `EZTADIA-BLUEPRINT.md` en raíz |
| **`eztadia-design-brief.md`** | Lenguaje visual completo, anti-patterns, briefs pantalla-por-pantalla, microcopy | `EZTADIA-DESIGN-BRIEF.md` en raíz |
| **`/designs/` *(carpeta)*** | Mockups visuales generados por el usuario en Claude Design / v0 / Figma. Se pega en el proyecto target | `/designs/` en raíz del proyecto |

**Flujo previsto:**
1. El usuario usa `eztadia-design-brief.md` para iterar mockups visuales en Claude Design / v0.
2. Cuando un mockup queda aprobado, lo exporta a `/designs/<nombre-pantalla>/` (PNG/HTML/notas).
3. Antes de implementar cada pantalla, el builder (Claude Code) revisa `/designs/<pantalla>/` y `eztadia-design-brief.md` — en ese orden de prioridad.
4. Si una pantalla no tiene mockup en `/designs/`, el builder se apoya en el design brief + tokens del sistema definidos en sección 7 de este blueprint.

**Regla de prioridad cuando hay conflicto:**
`/designs/<pantalla>/` > `eztadia-design-brief.md` > sección 7 de este blueprint.

---

## ⚡ ESTADO ACTUAL (snapshot 22 mayo 2026)

> **Si estás retomando este proyecto: lee primero la Sección 17 (Estado Actual y Phase B Roadmap) — supersede el Build Order original (Sección 9), que se conserva como referencia arquitectónica.**

**Phase A · Frontend COMPLETO** ✅
Mockups + páginas Next.js implementadas con demo data en `lib/*.ts` (flat). Sistema de diseño compartido en `app/globals.css` + `DESIGN_NOTES.md`. Todas las pantallas críticas del flujo público + dashboard owner + admin construidas. 13 mockups HTML standalone en `designs/mockup-*.html` + ornamentos SVG agrupados en `components/shared/Ornaments.tsx`.

**Decisiones tomadas durante Phase A** (difieren del blueprint original — son canónicas):
- **Single-locale (español)** — i18n con next-intl diferido a Phase D
- **Rutas FLAT en `/dashboard/`** (no `/dashboard/properties/[id]/...`) — multi-property con switcher en sidebar diferido a Phase D
- **Tabs vía query params** (`?tab=...`) en property-settings y settings personales — no nested routes
- **Demo data en `lib/*.ts`** — backend real arranca en Phase B
- **Dependencies mínimas instaladas:** next 15.1, react 19, RHF + Zod + @hookform/resolvers, @tanstack/react-table, zustand (solo onboarding wizard)

**Phase B · Backend Infrastructure** 🔄 NEXT
Supabase project + Prisma schema + RLS policies + Supabase Auth real + data layer + Server Actions. Ver Sección 17 para 18 steps detallados.

**Phase C-F** 📋 outlined en Sección 17.

---

## 1. Project Overview

### Vision

**Eztadia** es una plataforma SaaS multi-tenant para que dueños de hoteles boutique, complejos vacacionales y edificios de habitaciones gestionen sus propiedades **por habitación** — no por noche genérica. Cada propietario obtiene una página pública dedicada (`eztadia.com/p/<slug>`) donde sus huéspedes reservan directamente, sin pasar por un marketplace. La plataforma centraliza calendario, reservas, pagos (PSE vía Wompi o transferencia con comprobante), comunicación por WhatsApp y email, sincronización iCal con OTAs (Booking, Airbnb), y gestión de staff con permisos granulares.

El objetivo es eliminar las fricciones típicas de plataformas tipo Cloudbeds/Hostfully: pagos caros, suscripciones por habitación, falta de integración con métodos de pago colombianos, y falta de WhatsApp nativo.

### Goals

- **MVP funcional** con 3 propiedades reales (30 habitaciones) operando antes de 8 semanas de desarrollo.
- **Cero pasarelas tradicionales:** solo PSE (Wompi) + transferencia manual con comprobante.
- **Stack 100% free tier** hasta superar ~500 reservas/mes.
- **Seguridad de día 1:** RLS en todas las tablas, rate limiting, 2FA, captcha, audit log.
- **Sincronización OTA** desde el día 1 vía iCal (sin overbookings).
- **WhatsApp oficial** (Meta Cloud API) para confirmaciones y recordatorios.
- **Bilingüe** (es + en) en la cara pública y en el dashboard.

### Success Metrics

- **Funcionalidad:** owner puede crear propiedad → agregar habitaciones → recibir reserva PSE → confirmar automáticamente → enviar WhatsApp en < 3 minutos sin intervención manual.
- **Performance:** página pública de propiedad < 1.5s LCP en 4G colombiano.
- **Seguridad:** 0 owner puede leer datos de otro owner (verificado con tests RLS).
- **Confiabilidad:** 0 overbookings cuando hay iCal sync activo.

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 15** (App Router) | Server Components para SEO de páginas públicas, Server Actions para mutaciones, todo en un repo |
| Language | **TypeScript** (strict) | No `any`. Tipos derivados de DB con Prisma |
| Styling | **Tailwind CSS v4** | Estándar de facto. Variables CSS para theming |
| Components | **shadcn/ui** (estilo *new-york*) | Componentes propios sin lock-in. Personalizables |
| Database | **Supabase Postgres** | RLS nativo, Realtime gratis, free 500MB cubre 5x lo proyectado |
| ORM | **Prisma 6** | Tipos derivados de schema, migraciones limpias, DX top |
| Auth | **Supabase Auth** | Integrado con RLS, magic links, TOTP, sin vendor extra |
| Pagos | **Wompi** | Único agregador colombiano con free tier + webhooks confiables. PSE + Bancolombia Transfer |
| Email | **Resend** | Free 3000/mo, 100/día. Plantillas React.email |
| WhatsApp | **Meta WhatsApp Cloud API** (oficial) | 1000 conversaciones/mes gratis. Sin riesgo de baneo (vs OpenWA) |
| Storage | **Supabase Storage** | Free 1GB. Comprobantes, fotos de propiedades |
| Rate limit / cache | **Upstash Redis** | Free 10k cmd/día. Serverless, sliding window |
| Anti-bot | **Cloudflare Turnstile** | Gratis ilimitado. Invisible para humanos |
| Cron / iCal sync | **Vercel Cron Jobs** | Free 2 jobs/día. Hasta 2 schedules en hobby. Si se necesitan más → `pg_cron` en Supabase |
| i18n | **next-intl** | Mejor opción para App Router. Mensajes JSON, locale routing |
| Validación | **Zod** | Schemas reutilizables en server + client |
| Forms | **React Hook Form** + **Zod resolver** | Performance + tipos |
| Tablas | **TanStack Table v8** | Tablas complejas de reservas/usuarios |
| Calendario | **FullCalendar** (open source) | Calendario visual estilo Airbnb host |
| Date | **date-fns** + **date-fns-tz** | Timezone-aware, Colombia = America/Bogota |
| Monitoreo | **Sentry** + **Vercel Analytics** | Errores + métricas básicas |
| Hosting | **Vercel Hobby** | Deploy auto, edge global, preview deploys |
| Package Manager | **pnpm** | Velocidad + disk space + monorepo-ready |
| Node | **20.x LTS** | Estable, soportado por Vercel |
| Testing | **Vitest** + **Playwright** | Unit + E2E modernos |

---

## 3. Directory Structure

```
eztadia/
├── .env.example                    # Plantilla de env vars (commit este, no .env)
├── .env.local                      # Local dev (gitignored)
├── .gitignore
├── .nvmrc                          # Node 20
├── CLAUDE.md                       # Instrucciones para Claude Code (ver sección 15)
├── README.md
├── biome.json                      # Linter + formatter (más rápido que ESLint+Prettier)
├── components.json                 # shadcn/ui config
├── middleware.ts                   # Auth + i18n + rate limit edge middleware
├── next.config.ts                  # Config Next.js + headers CSP
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts              # Design tokens + shadcn theming
├── tsconfig.json                   # TS strict, paths @/
├── vitest.config.ts
├── playwright.config.ts
│
├── EZTADIA-BLUEPRINT.md            # Copia de este blueprint (referencia para el builder)
├── EZTADIA-DESIGN-BRIEF.md         # Copia del design brief (referencia visual)
│
├── designs/                         # ⭐ Mockups visuales aprobados (PNG/HTML/notas)
│   ├── README.md                    # Índice + estado de cada pantalla
│   ├── landing/                     # Landing pública /
│   │   ├── desktop.png
│   │   ├── mobile.png
│   │   └── notes.md
│   ├── property-public/             # /p/[slug]
│   ├── booking-flow/                # form → pay → status
│   ├── auth/                        # login, signup, reset
│   ├── onboarding/
│   ├── dashboard-overview/          # /dashboard
│   ├── calendar/                    # /dashboard/properties/[id]/calendar
│   ├── bookings-table/
│   ├── booking-detail-drawer/
│   ├── property-settings/
│   ├── staff/
│   ├── integrations/
│   ├── owner-settings/
│   ├── admin-dashboard/
│   ├── admin-users/
│   └── empty-states-and-errors/
│
├── prisma/
│   ├── schema.prisma               # Schema completo (ver sección 4)
│   ├── seed.ts                     # Datos de prueba (super_admin, 1 owner, 1 propiedad)
│   └── migrations/                 # Auto-generadas
│
├── messages/                       # next-intl translations
│   ├── es.json                     # Español (default)
│   └── en.json                     # Inglés
│
├── emails/                         # React Email templates
│   ├── booking-confirmation.tsx
│   ├── booking-pending-payment.tsx
│   ├── owner-invitation.tsx
│   ├── staff-invitation.tsx
│   ├── login-from-new-device.tsx
│   └── password-reset.tsx
│
├── supabase/
│   ├── migrations/                 # SQL migrations (RLS policies aquí)
│   │   ├── 0001_init_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   ├── 0003_functions_and_triggers.sql
│   │   └── 0004_seed_admin.sql
│   └── functions/                  # Edge Functions (si se necesitan en futuro)
│
├── public/
│   ├── logo.svg
│   ├── og-image.png
│   └── favicon.ico
│
└── src/
    ├── app/
    │   ├── [locale]/                       # Locale routing: /es/..., /en/...
    │   │   ├── layout.tsx                  # Root layout (HTML + providers)
    │   │   ├── globals.css                 # Tailwind + CSS vars (colores, fuentes)
    │   │   │
    │   │   ├── (marketing)/                # Landing pública de Eztadia
    │   │   │   ├── layout.tsx
    │   │   │   ├── page.tsx                # Home
    │   │   │   ├── pricing/page.tsx        # (futuro)
    │   │   │   └── about/page.tsx
    │   │   │
    │   │   ├── (auth)/                     # Login/signup/reset
    │   │   │   ├── layout.tsx              # Centrado, minimal
    │   │   │   ├── login/page.tsx
    │   │   │   ├── signup/page.tsx
    │   │   │   ├── reset-password/page.tsx
    │   │   │   ├── reset-password/[token]/page.tsx
    │   │   │   └── verify-email/page.tsx
    │   │   │
    │   │   ├── p/                          # Páginas PÚBLICAS de propiedad
    │   │   │   └── [slug]/
    │   │   │       ├── page.tsx            # Landing de la propiedad
    │   │   │       ├── rooms/
    │   │   │       │   └── [roomTypeId]/page.tsx  # Detalle de tipo habitación
    │   │   │       └── booking/
    │   │   │           ├── new/page.tsx    # Formulario de reserva (post-selección)
    │   │   │           └── [holdId]/
    │   │   │               ├── pay/page.tsx       # Instrucciones pago / link PSE
    │   │   │               └── status/page.tsx    # Status (público con token)
    │   │   │
    │   │   ├── dashboard/                  # Owner / staff dashboard
    │   │   │   ├── layout.tsx              # Sidebar + topbar + property switcher
    │   │   │   ├── page.tsx                # Overview (KPIs)
    │   │   │   ├── properties/
    │   │   │   │   ├── page.tsx            # Lista de propiedades del owner
    │   │   │   │   ├── new/page.tsx        # Crear nueva
    │   │   │   │   └── [propertyId]/
    │   │   │   │       ├── layout.tsx      # Layout con tabs de propiedad
    │   │   │   │       ├── page.tsx        # Resumen
    │   │   │   │       ├── calendar/page.tsx       # Calendario visual
    │   │   │   │       ├── bookings/
    │   │   │   │       │   ├── page.tsx            # Tabla con filtros
    │   │   │   │       │   └── [bookingId]/page.tsx  # Detalle + acciones
    │   │   │   │       ├── rooms/
    │   │   │   │       │   ├── page.tsx            # Tipos + habitaciones individuales
    │   │   │   │       │   └── types/[typeId]/page.tsx
    │   │   │   │       ├── pricing/page.tsx        # Tarifas + temporadas
    │   │   │   │       ├── staff/page.tsx          # Invitar + roles
    │   │   │   │       ├── integrations/
    │   │   │   │       │   ├── page.tsx
    │   │   │   │       │   ├── ical/page.tsx       # Feeds entrantes/salientes
    │   │   │   │       │   ├── wompi/page.tsx      # Configurar Wompi del owner
    │   │   │   │       │   └── whatsapp/page.tsx   # Configurar plantillas
    │   │   │   │       ├── settings/page.tsx       # Datos propiedad, fotos, descripción
    │   │   │   │       └── reports/page.tsx        # Ocupación, ingresos (solo manager+)
    │   │   │   └── settings/
    │   │   │       ├── page.tsx            # Perfil
    │   │   │       ├── security/page.tsx   # 2FA, sesiones activas
    │   │   │       └── notifications/page.tsx
    │   │   │
    │   │   └── admin/                       # Super admin
    │   │       ├── layout.tsx
    │   │       ├── page.tsx                # Métricas globales
    │   │       ├── users/
    │   │       │   ├── page.tsx
    │   │       │   └── [userId]/page.tsx
    │   │       ├── properties/page.tsx     # Todas las propiedades
    │   │       ├── audit-logs/page.tsx
    │   │       └── system/
    │   │           ├── emails/page.tsx     # Logs Resend
    │   │           ├── whatsapp/page.tsx   # Logs Meta API
    │   │           └── webhooks/page.tsx
    │   │
    │   ├── api/                            # Route handlers
    │   │   ├── webhooks/
    │   │   │   ├── wompi/route.ts          # POST: confirmar pago
    │   │   │   └── whatsapp/route.ts       # POST: mensajes entrantes
    │   │   ├── cron/
    │   │   │   ├── ical-sync/route.ts      # Llamado por Vercel Cron
    │   │   │   ├── expire-holds/route.ts   # Limpia holds vencidos
    │   │   │   └── send-reminders/route.ts # WhatsApp 24h antes de check-in
    │   │   ├── ical/
    │   │   │   └── [propertyId]/[secret].ics/route.ts  # Export iCal
    │   │   ├── og/
    │   │   │   └── property/[slug]/route.tsx   # OG image dinámica
    │   │   ├── upload/
    │   │   │   ├── property-photo/route.ts
    │   │   │   └── payment-proof/route.ts
    │   │   └── public/
    │   │       └── availability/
    │   │           └── [propertyId]/route.ts   # GET disponibilidad
    │   │
    │   ├── robots.ts
    │   ├── sitemap.ts                      # Genera sitemap por propiedad
    │   └── manifest.ts
    │
    ├── components/
    │   ├── ui/                             # shadcn primitives (button, input, dialog...)
    │   ├── marketing/                       # Hero, features, footer landing
    │   ├── property-public/                 # Componentes página pública
    │   │   ├── property-hero.tsx
    │   │   ├── room-type-card.tsx
    │   │   ├── availability-calendar.tsx
    │   │   ├── booking-form.tsx
    │   │   └── property-gallery.tsx
    │   ├── dashboard/
    │   │   ├── sidebar.tsx
    │   │   ├── property-switcher.tsx
    │   │   ├── topbar.tsx
    │   │   ├── kpi-card.tsx
    │   │   ├── bookings-table.tsx
    │   │   ├── calendar-grid.tsx
    │   │   └── confirm-payment-dialog.tsx
    │   ├── shared/
    │   │   ├── locale-switcher.tsx
    │   │   ├── theme-toggle.tsx            # (opcional, futuro dark mode)
    │   │   ├── turnstile.tsx               # Wrapper Cloudflare
    │   │   ├── empty-state.tsx
    │   │   ├── error-boundary.tsx
    │   │   └── loading-skeleton.tsx
    │   └── icons/
    │       └── index.ts                    # Re-exports de lucide-react
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts                   # Browser client (anon)
    │   │   ├── server.ts                   # Server client (cookies)
    │   │   ├── admin.ts                    # Service role (solo server, casos puntuales)
    │   │   └── middleware.ts               # Refresh session helper
    │   ├── db/
    │   │   ├── index.ts                    # Prisma client singleton
    │   │   ├── queries/                    # Queries reutilizables
    │   │   │   ├── properties.ts
    │   │   │   ├── bookings.ts
    │   │   │   ├── rooms.ts
    │   │   │   └── availability.ts         # Cálculo de disponibilidad
    │   │   └── mutations/
    │   │       ├── bookings.ts             # createBookingHold, confirmBooking...
    │   │       └── payments.ts
    │   ├── auth/
    │   │   ├── session.ts                  # getSession, requireSession
    │   │   ├── permissions.ts              # can(user, action, resource)
    │   │   └── roles.ts                    # Constantes y helpers
    │   ├── wompi/
    │   │   ├── client.ts
    │   │   ├── create-payment-link.ts
    │   │   ├── verify-webhook.ts           # Verifica HMAC
    │   │   └── types.ts
    │   ├── whatsapp/
    │   │   ├── client.ts                   # Cliente Meta Cloud API
    │   │   ├── send-template.ts            # Envío con plantillas
    │   │   ├── verify-webhook.ts
    │   │   └── templates.ts                # IDs y schemas de plantillas
    │   ├── email/
    │   │   ├── client.ts                   # Resend instance
    │   │   ├── send.ts                     # Wrapper con logging
    │   │   └── templates/                  # Re-exports de /emails
    │   ├── ical/
    │   │   ├── parser.ts                   # node-ical
    │   │   ├── generator.ts                # ics
    │   │   └── sync.ts                     # Lógica de sync
    │   ├── rate-limit/
    │   │   ├── client.ts                   # Upstash
    │   │   ├── limits.ts                   # Configuración por endpoint
    │   │   └── apply.ts                    # Helper para route handlers
    │   ├── turnstile/
    │   │   └── verify.ts                   # Server-side validation
    │   ├── i18n/
    │   │   ├── config.ts                   # Locales soportados
    │   │   ├── request.ts                  # next-intl config
    │   │   └── navigation.ts               # Link, redirect wrappers
    │   ├── audit/
    │   │   └── log.ts                      # writeAuditLog(action, payload)
    │   ├── validation/                     # Zod schemas compartidos
    │   │   ├── booking.ts
    │   │   ├── property.ts
    │   │   ├── room.ts
    │   │   ├── user.ts
    │   │   └── payment.ts
    │   ├── env.ts                          # Validación Zod de env vars
    │   ├── constants.ts                    # TIMEZONE, CURRENCY, etc.
    │   ├── errors.ts                       # Clases de error tipadas
    │   ├── url.ts                          # absoluteUrl, getBaseUrl
    │   └── utils.ts                        # cn, formatDate, formatCOP...
    │
    ├── hooks/
    │   ├── use-property.ts                 # Property switcher context
    │   ├── use-debounce.ts
    │   ├── use-permission.ts               # Hook para can(...)
    │   └── use-realtime-bookings.ts        # Supabase Realtime
    │
    ├── types/
    │   ├── index.ts                         # Re-exports
    │   ├── database.ts                       # Auto-generado Supabase
    │   ├── booking.ts
    │   ├── property.ts
    │   └── api.ts                           # Tipos request/response
    │
    └── test/
        ├── setup.ts
        ├── helpers/
        │   ├── db.ts                        # Test DB setup
        │   └── auth.ts                      # Mock sessions
        ├── unit/
        │   ├── availability.test.ts
        │   ├── permissions.test.ts
        │   └── ical.test.ts
        ├── integration/
        │   ├── booking-flow.test.ts
        │   ├── rls.test.ts                  # Crítico: verifica RLS
        │   └── webhooks.test.ts
        └── e2e/
            ├── booking-happy-path.spec.ts
            ├── owner-onboarding.spec.ts
            └── staff-permissions.spec.ts
```

---

## 4. Data Model

### Entidades principales

**profiles** (extiende auth.users de Supabase)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | = auth.users.id |
| email | TEXT UNIQUE NOT NULL | |
| full_name | TEXT | |
| phone | TEXT | E.164: +57... |
| avatar_url | TEXT | Supabase Storage |
| role | ENUM('super_admin','owner','staff_manager','staff_reception','guest') | Default 'owner' al signup |
| locale | TEXT DEFAULT 'es' | 'es' o 'en' |
| totp_enabled | BOOLEAN DEFAULT false | |
| created_at, updated_at | TIMESTAMPTZ | |

**organizations** (un owner agrupa varias propiedades)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | |
| owner_id | UUID FK → profiles | |
| billing_email | TEXT | |
| created_at, updated_at | | |

**properties**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| organization_id | UUID FK → organizations | |
| slug | TEXT UNIQUE NOT NULL | URL: /p/<slug> |
| name | TEXT NOT NULL | |
| description_es, description_en | TEXT | HTML sanitizado |
| address | TEXT | |
| city | TEXT | |
| country | TEXT DEFAULT 'CO' | |
| timezone | TEXT DEFAULT 'America/Bogota' | |
| currency | TEXT DEFAULT 'COP' | |
| cover_image_url | TEXT | |
| gallery | JSONB | Array de URLs |
| amenities | TEXT[] | wifi, parking, pool, etc. |
| check_in_time | TIME DEFAULT '15:00' | |
| check_out_time | TIME DEFAULT '12:00' | |
| min_stay_nights | INT DEFAULT 1 | |
| max_stay_nights | INT | Nullable |
| booking_policy | JSONB | hold_ttl_pse, hold_ttl_manual, cancellation_window... |
| is_active | BOOLEAN DEFAULT true | |
| ical_export_secret | TEXT | Para URL /api/ical/[id]/[secret].ics |
| created_at, updated_at | | |

**property_users** (junction usuario ↔ propiedad con rol)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | |
| user_id | UUID FK → profiles | |
| role | ENUM('owner','manager','reception') | rol *dentro* de esta propiedad |
| invited_by | UUID FK → profiles | |
| invitation_accepted_at | TIMESTAMPTZ | |
| created_at | | |
| UNIQUE(property_id, user_id) | | |

**room_types**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | |
| name_es, name_en | TEXT | "Suite Premium" / "Premium Suite" |
| description_es, description_en | TEXT | |
| base_price_cents | INT | En centavos COP |
| capacity_adults | INT NOT NULL | |
| capacity_children | INT DEFAULT 0 | |
| size_m2 | INT | Opcional |
| bed_configuration | TEXT | "1 King" / "2 Doubles" |
| amenities | TEXT[] | Específicas del tipo |
| gallery | JSONB | URLs |
| is_active | BOOLEAN DEFAULT true | |

**rooms** (instancia física)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | |
| room_type_id | UUID FK | |
| number | TEXT NOT NULL | "101", "Suite Marina" |
| floor | TEXT | Opcional |
| notes | TEXT | Internal |
| is_active | BOOLEAN DEFAULT true | |
| UNIQUE(property_id, number) | | |

**seasonal_rates** (overrides de precio por fecha)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| room_type_id | UUID FK | |
| name | TEXT | "Temporada alta dic" |
| start_date, end_date | DATE | |
| price_cents | INT | |
| priority | INT DEFAULT 0 | Mayor prioridad gana |

**bookings**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | Denormalizado para RLS rápida |
| room_id | UUID FK | Asignado al confirmar |
| room_type_id | UUID FK | El tipo reservado |
| code | TEXT UNIQUE | Código humano: HAB-2026-00123 |
| check_in | DATE NOT NULL | |
| check_out | DATE NOT NULL | |
| nights | INT | Generated column |
| adults, children | INT | |
| guest_full_name | TEXT NOT NULL | |
| guest_document_type | TEXT | 'CC','CE','passport' |
| guest_document_number | TEXT | |
| guest_email | TEXT NOT NULL | |
| guest_phone | TEXT NOT NULL | E.164 |
| guest_country | TEXT DEFAULT 'CO' | |
| total_cents | INT | |
| status | ENUM('pending_payment','confirmed','cancelled','no_show','completed') | |
| payment_method | ENUM('pse','manual_transfer','external','admin_override') | |
| public_token | TEXT | Token para consulta pública /status?token= |
| source | ENUM('direct','booking_com','airbnb','manual') | Quien creó la reserva |
| notes | TEXT | Internal |
| cancelled_at | TIMESTAMPTZ | |
| cancelled_by | UUID | |
| cancellation_reason | TEXT | |
| created_at, updated_at | | |

**booking_holds** (lock temporal pre-pago)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | |
| room_type_id | UUID FK | Bloquea uno del tipo |
| check_in, check_out | DATE | |
| guest_email, guest_phone | TEXT | |
| total_cents | INT | |
| expires_at | TIMESTAMPTZ NOT NULL | TTL: 15min PSE / 24h manual |
| status | ENUM('active','consumed','expired','cancelled') | |
| payment_method | ENUM | |
| created_at | | |

**payments**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| booking_id | UUID FK | |
| amount_cents | INT NOT NULL | |
| currency | TEXT DEFAULT 'COP' | |
| method | ENUM('pse','manual_transfer','admin_override') | |
| wompi_transaction_id | TEXT | Si method='pse' |
| wompi_reference | TEXT | |
| wompi_payment_link_id | TEXT | |
| status | ENUM('pending','approved','declined','voided','refunded') | |
| proof_url | TEXT | Si method='manual_transfer' |
| confirmed_by | UUID FK → profiles | Si manual, quién confirmó |
| confirmed_at | TIMESTAMPTZ | |
| raw_payload | JSONB | Webhook completo |
| created_at, updated_at | | |

**ical_feeds** (URLs externas + nuestra exportada)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | |
| room_id | UUID FK | Nullable: si null, aplica a todo el room_type via room mapping |
| name | TEXT | "Booking.com - Suite 101" |
| direction | ENUM('inbound','outbound') | |
| url | TEXT | Inbound: URL externa. Outbound: la nuestra |
| last_synced_at | TIMESTAMPTZ | |
| last_sync_error | TEXT | |
| is_active | BOOLEAN DEFAULT true | |

**external_blocks** (bloqueos importados)
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| ical_feed_id | UUID FK | |
| room_id | UUID FK | |
| external_uid | TEXT | UID del VEVENT |
| start_date, end_date | DATE | |
| summary | TEXT | "Reserved on Booking" |
| imported_at | TIMESTAMPTZ | |
| UNIQUE(ical_feed_id, external_uid) | | |

**wompi_configs** (cada propiedad puede tener su cuenta Wompi)
| Field | Type | Notes |
|-------|------|-------|
| property_id | UUID PK FK | |
| public_key | TEXT | |
| private_key_encrypted | TEXT | Cifrado con pgsodium |
| events_secret_encrypted | TEXT | Para verificar webhooks |
| is_test_mode | BOOLEAN DEFAULT true | |
| updated_at | | |

**whatsapp_configs**
| Field | Type | Notes |
|-------|------|-------|
| property_id | UUID PK FK | |
| phone_number_id | TEXT | Meta phone number id |
| business_account_id | TEXT | |
| access_token_encrypted | TEXT | |
| is_active | BOOLEAN DEFAULT false | |

**whatsapp_messages**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | |
| booking_id | UUID FK | Nullable |
| direction | ENUM('inbound','outbound') | |
| to, from | TEXT | E.164 |
| template_name | TEXT | Si outbound |
| body | TEXT | |
| meta_message_id | TEXT | |
| status | ENUM('sent','delivered','read','failed') | |
| error | TEXT | |
| created_at | | |

**email_logs**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| property_id | UUID FK | Nullable (emails platform) |
| to | TEXT | |
| template | TEXT | |
| subject | TEXT | |
| resend_id | TEXT | |
| status | ENUM('sent','delivered','bounced','complained') | |
| created_at | | |

**audit_logs**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| actor_id | UUID FK → profiles | NULL para sistema |
| actor_type | ENUM('user','system','webhook') | |
| action | TEXT | "booking.cancelled", "price.changed"... |
| resource_type | TEXT | |
| resource_id | UUID | |
| property_id | UUID | Si aplica, para RLS |
| diff | JSONB | Cambios |
| ip | INET | |
| user_agent | TEXT | |
| created_at | | |

**login_events**
| Field | Type | Notes |
|-------|------|-------|
| id | UUID PK | |
| user_id | UUID FK | |
| event_type | ENUM('login_success','login_failed','password_reset','2fa_enabled') | |
| ip | INET | |
| user_agent | TEXT | |
| country | TEXT | Vía Vercel headers |
| created_at | | |

### Relaciones clave

```
profiles ─┬─< property_users >─┬─ properties ─┬─< rooms ─┬─< bookings
          │                    │              ├─< room_types
          │                    │              ├─< seasonal_rates
          │                    │              ├─< booking_holds
          │                    │              ├─< ical_feeds ─< external_blocks
          │                    │              ├─< wompi_configs (1:1)
          │                    │              ├─< whatsapp_configs (1:1)
          │                    │              ├─< whatsapp_messages
          │                    │              └─< payments (via bookings)
          │                    └─ organizations
          └─< audit_logs / login_events
```

### Reglas críticas del modelo

1. **`property_id` denormalizado** en bookings, holds, payments → RLS rápida sin joins.
2. **`booking_holds.expires_at` con índice** y cron que limpia. La consulta de disponibilidad considera holds *activos*.
3. **Soft delete** solo en `bookings` (con `cancelled_at`). El resto se borra de verdad — los logs ya están en `audit_logs`.
4. **`profiles.role`** es global (admin de plataforma). El rol por propiedad está en `property_users.role`.
5. **Secrets encriptados** (Wompi private key, WhatsApp token): usar `pgsodium` de Supabase o cifrado a nivel app con clave del env.

### Schema Prisma (resumen — completo en `prisma/schema.prisma`)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum UserRole {
  super_admin
  owner
  staff_manager
  staff_reception
  guest
}

enum PropertyUserRole {
  owner
  manager
  reception
}

enum BookingStatus {
  pending_payment
  confirmed
  cancelled
  no_show
  completed
}

enum PaymentMethod {
  pse
  manual_transfer
  external
  admin_override
}

enum PaymentStatus {
  pending
  approved
  declined
  voided
  refunded
}

enum HoldStatus {
  active
  consumed
  expired
  cancelled
}

enum BookingSource {
  direct
  booking_com
  airbnb
  manual
}

model Profile {
  id           String    @id @db.Uuid
  email        String    @unique
  fullName     String?   @map("full_name")
  phone        String?
  avatarUrl    String?   @map("avatar_url")
  role         UserRole  @default(owner)
  locale       String    @default("es")
  totpEnabled  Boolean   @default(false) @map("totp_enabled")
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz()
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz()

  ownedOrganizations Organization[]
  propertyUsers      PropertyUser[]
  invitationsSent    PropertyUser[] @relation("InvitationSentBy")
  auditLogs          AuditLog[]
  loginEvents        LoginEvent[]

  @@map("profiles")
}

// ... (resto de modelos siguiendo el mismo patrón — ver build order paso 4)
```

### Funciones y Triggers SQL críticos

```sql
-- supabase/migrations/0003_functions_and_triggers.sql

-- Auto-create profile al signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función de disponibilidad (núcleo del sistema)
CREATE OR REPLACE FUNCTION public.check_availability(
  p_property_id UUID,
  p_room_type_id UUID,
  p_check_in DATE,
  p_check_out DATE
) RETURNS TABLE (
  available_rooms INT,
  total_rooms INT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_total INT;
  v_taken INT;
BEGIN
  SELECT COUNT(*) INTO v_total
  FROM rooms
  WHERE property_id = p_property_id
    AND room_type_id = p_room_type_id
    AND is_active = true;

  SELECT COUNT(DISTINCT r.id) INTO v_taken
  FROM rooms r
  WHERE r.property_id = p_property_id
    AND r.room_type_id = p_room_type_id
    AND r.is_active = true
    AND (
      EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.room_id = r.id
          AND b.status IN ('confirmed','pending_payment')
          AND b.check_in < p_check_out
          AND b.check_out > p_check_in
      )
      OR EXISTS (
        SELECT 1 FROM external_blocks eb
        WHERE eb.room_id = r.id
          AND eb.start_date < p_check_out
          AND eb.end_date > p_check_in
      )
    );

  -- Considerar holds activos que aún no convirtieron
  v_taken := v_taken + (
    SELECT COUNT(*)
    FROM booking_holds h
    WHERE h.property_id = p_property_id
      AND h.room_type_id = p_room_type_id
      AND h.status = 'active'
      AND h.expires_at > now()
      AND h.check_in < p_check_out
      AND h.check_out > p_check_in
  );

  RETURN QUERY SELECT GREATEST(v_total - v_taken, 0)::INT, v_total;
END;
$$;

-- Creación atómica de hold (previene race condition)
CREATE OR REPLACE FUNCTION public.create_booking_hold(
  p_property_id UUID,
  p_room_type_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_guest_email TEXT,
  p_guest_phone TEXT,
  p_total_cents INT,
  p_payment_method TEXT,
  p_ttl_minutes INT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_hold_id UUID;
  v_available INT;
BEGIN
  -- LOCK en filas relevantes para serialización
  PERFORM 1 FROM rooms
  WHERE property_id = p_property_id AND room_type_id = p_room_type_id
  FOR UPDATE;

  SELECT available_rooms INTO v_available
  FROM check_availability(p_property_id, p_room_type_id, p_check_in, p_check_out);

  IF v_available <= 0 THEN
    RAISE EXCEPTION 'NO_AVAILABILITY' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO booking_holds (
    property_id, room_type_id, check_in, check_out,
    guest_email, guest_phone, total_cents,
    payment_method, status, expires_at
  ) VALUES (
    p_property_id, p_room_type_id, p_check_in, p_check_out,
    p_guest_email, p_guest_phone, p_total_cents,
    p_payment_method::payment_method, 'active',
    now() + (p_ttl_minutes || ' minutes')::INTERVAL
  ) RETURNING id INTO v_hold_id;

  RETURN v_hold_id;
END;
$$;
```

### RLS Policies (esqueleto)

```sql
-- supabase/migrations/0002_rls_policies.sql

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ical_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- ... etc

-- Helper: ¿es super_admin?
CREATE OR REPLACE FUNCTION auth.is_super_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Helper: ¿puede el user acceder a esta propiedad?
CREATE OR REPLACE FUNCTION auth.has_property_access(p_property_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM property_users
    WHERE property_id = p_property_id AND user_id = auth.uid()
  ) OR auth.is_super_admin();
$$;

-- Helper: rol en una propiedad
CREATE OR REPLACE FUNCTION auth.property_role(p_property_id UUID) RETURNS property_user_role
LANGUAGE sql STABLE AS $$
  SELECT role FROM property_users
  WHERE property_id = p_property_id AND user_id = auth.uid();
$$;

-- PROFILES: cada uno ve el suyo + admins ven todos
CREATE POLICY "profiles_self_or_admin_select" ON profiles
  FOR SELECT USING (id = auth.uid() OR auth.is_super_admin());

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (id = auth.uid() OR auth.is_super_admin());

-- PROPERTIES: solo si pertenezco
CREATE POLICY "properties_member_select" ON properties
  FOR SELECT USING (auth.has_property_access(id));

CREATE POLICY "properties_owner_insert" ON properties
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = properties.organization_id AND o.owner_id = auth.uid()
    ) OR auth.is_super_admin()
  );

CREATE POLICY "properties_owner_update" ON properties
  FOR UPDATE USING (
    auth.property_role(id) = 'owner' OR auth.is_super_admin()
  );

-- BOOKINGS: cualquier miembro de la propiedad puede ver
CREATE POLICY "bookings_member_select" ON bookings
  FOR SELECT USING (auth.has_property_access(property_id));

CREATE POLICY "bookings_member_insert" ON bookings
  FOR INSERT WITH CHECK (auth.has_property_access(property_id));

CREATE POLICY "bookings_member_update" ON bookings
  FOR UPDATE USING (auth.has_property_access(property_id));

-- PAYMENTS: solo manager+ ve montos (reception no)
CREATE POLICY "payments_manager_select" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = payments.booking_id
        AND auth.property_role(b.property_id) IN ('owner','manager')
    ) OR auth.is_super_admin()
  );

-- Las páginas PÚBLICAS de propiedad usan el cliente service_role en server components
-- para bypassear RLS de forma controlada (no exponer al cliente).
-- Alternativamente: POLICY pública específica para campos no-sensibles.
```

---

## 5. API Design

### Convención general

- **REST + Server Actions** combinados. Server Actions para mutaciones del dashboard (mejor DX, type-safe). Route handlers para webhooks, crons, endpoints públicos (booking, availability), iCal export.
- **Response shape estándar:**
  ```ts
  // Success
  { ok: true, data: T }
  // Error
  { ok: false, error: { code: string, message: string, details?: unknown } }
  ```
- **Status codes:** 200/201 éxito, 400 validación, 401 no auth, 403 sin permiso, 404 no existe, 409 conflicto (no disponibilidad), 429 rate limit, 500 server.

### Routes Overview

| Method | Path | Description | Auth | Rate limit |
|--------|------|-------------|------|-----------|
| GET | `/api/public/availability/[propertyId]` | Disponibilidad por rango | Público | 30/min/IP |
| POST | `/api/public/booking` | Crear booking_hold | Público + Turnstile | 5/min/IP |
| GET | `/api/public/booking/[holdId]/status` | Status (con token) | Token | 60/min/token |
| POST | `/api/webhooks/wompi` | Confirmar pago PSE | HMAC verify | — |
| POST | `/api/webhooks/whatsapp` | Mensajes entrantes | HMAC + Meta verify | — |
| GET | `/api/webhooks/whatsapp` | Meta verification challenge | Meta token | — |
| GET | `/api/ical/[propertyId]/[secret].ics` | Export iCal | Secret en URL | 60/min/secret |
| POST | `/api/cron/ical-sync` | Sync iCal entrante | `CRON_SECRET` header | — |
| POST | `/api/cron/expire-holds` | Limpia holds | `CRON_SECRET` | — |
| POST | `/api/cron/send-reminders` | WhatsApp 24h | `CRON_SECRET` | — |
| POST | `/api/upload/property-photo` | Sube foto a Supabase Storage | Auth + role | 20/min/user |
| POST | `/api/upload/payment-proof` | Sube comprobante | Token de hold | 5/min/hold |
| GET | `/api/og/property/[slug]` | OG image dinámica | Público | 60/min/IP |

**Server Actions** (no expuestas como endpoints, solo desde RSC):
- `createProperty`, `updateProperty`, `deleteProperty`
- `createRoomType`, `createRoom`
- `confirmManualPayment(bookingId, proofUrl)`
- `cancelBooking(bookingId, reason)`
- `inviteStaff(propertyId, email, role)`
- `updateWompiConfig`, `updateWhatsAppConfig`
- `addIcalFeed`, `syncIcalFeed`

### Detalle: POST `/api/public/booking`

**Request:**
```ts
{
  propertyId: string (uuid),
  roomTypeId: string (uuid),
  checkIn: string (YYYY-MM-DD),
  checkOut: string (YYYY-MM-DD),
  adults: number (>=1),
  children: number (>=0),
  guest: {
    fullName: string (2-100),
    documentType: 'CC' | 'CE' | 'passport',
    documentNumber: string,
    email: string (valid email),
    phone: string (E.164),
    country: string (ISO-2)
  },
  paymentMethod: 'pse' | 'manual_transfer',
  locale: 'es' | 'en',
  turnstileToken: string
}
```

**Validaciones (Zod, en `lib/validation/booking.ts`):**
- `checkOut > checkIn`
- `(checkOut - checkIn) >= property.min_stay_nights`
- `adults + children <= room_type.capacity_*`
- `checkIn >= today` (en timezone de la propiedad)
- Turnstile válido (server-side verify)
- Rate limit: 5/min/IP

**Flujo:**
1. Verificar Turnstile.
2. Verificar disponibilidad con `check_availability`.
3. Calcular precio (base + seasonal_rates aplicables).
4. Llamar `create_booking_hold` (atómico).
5. Si `paymentMethod === 'pse'`: crear payment link Wompi → guardar `wompi_payment_link_id`.
6. Enviar email "reserva pendiente de pago" con link.
7. Enviar WhatsApp (si owner tiene Cloud API config).
8. Responder con `{ holdId, paymentUrl?, expiresAt }`.

**Response 200:**
```ts
{
  ok: true,
  data: {
    holdId: string,
    publicToken: string,        // para /booking/[holdId]/status?token=
    paymentUrl: string | null,  // PSE link, o null para manual
    expiresAt: string (ISO),
    bankInfo: {                 // solo si manual
      bankName: string,
      accountType: string,
      accountNumber: string,
      accountHolder: string,
      reference: string         // mostrar al huésped para incluir en transferencia
    } | null,
    totalCents: number
  }
}
```

**Errores comunes:**
- 400 `VALIDATION_ERROR` (Zod)
- 403 `TURNSTILE_FAILED`
- 409 `NO_AVAILABILITY` — el hold falla por race condition (consumido en otra request)
- 429 `RATE_LIMITED`

### Detalle: POST `/api/webhooks/wompi`

**Verificación:**
1. Extraer header `Checksum` o `X-Event-Checksum`.
2. Recalcular HMAC con `events_secret` del owner (busqueda por `wompi_payment_link_id`).
3. Si no coincide → 401.

**Payload de interés:**
```ts
{
  event: 'transaction.updated',
  data: {
    transaction: {
      id: string,
      reference: string,            // contiene holdId
      status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR',
      amount_in_cents: number,
      payment_link_id: string,
      ...
    }
  }
}
```

**Flujo APPROVED:**
1. Encontrar `booking_holds` por `wompi_payment_link_id`.
2. Verificar hold `status='active'` y no `expired`.
3. Transacción:
   - Asignar un `room` disponible del `room_type` (FOR UPDATE).
   - Crear `bookings` con `status='confirmed'`.
   - Crear `payments` con `status='approved'`.
   - Actualizar hold a `consumed`.
4. Enviar email + WhatsApp confirmación.
5. Audit log.
6. Responder 200.

**Flujo DECLINED:**
1. Marcar hold como `cancelled`.
2. Email "pago rechazado, intenta de nuevo".
3. Audit log.

**Idempotencia:** verificar si ya existe `payment` con ese `wompi_transaction_id` antes de procesar.

### Detalle: GET `/api/ical/[propertyId]/[secret].ics`

- Verificar `secret` coincide con `properties.ical_export_secret`.
- Generar `.ics` con todas las `bookings` (confirmed + pending_payment) de los próximos 365 días.
- Headers: `Content-Type: text/calendar; charset=utf-8`.
- Cache: `Cache-Control: public, max-age=300`.

---

## 6. Frontend Architecture

### Páginas / rutas (mapa completo)

| Route | Auth | Description |
|-------|------|-------------|
| `/[locale]` | Público | Landing Eztadia |
| `/[locale]/login` | Público | Login con email/password + magic link |
| `/[locale]/signup` | Público | Registro (auto-crea Organization) |
| `/[locale]/reset-password` | Público | Pedir reset |
| `/[locale]/verify-email` | Público | Confirmación |
| `/[locale]/p/[slug]` | Público | **Página pública propiedad** |
| `/[locale]/p/[slug]/rooms/[id]` | Público | Detalle room type |
| `/[locale]/p/[slug]/booking/new` | Público | Formulario reserva |
| `/[locale]/p/[slug]/booking/[holdId]/pay` | Público | Instrucciones pago / PSE link |
| `/[locale]/p/[slug]/booking/[holdId]/status` | Token | Status de reserva |
| `/[locale]/dashboard` | Auth (owner+) | Overview |
| `/[locale]/dashboard/properties` | Auth | Lista |
| `/[locale]/dashboard/properties/new` | Auth (owner) | Crear |
| `/[locale]/dashboard/properties/[id]/...` | Auth + property_user | Tabs |
| `/[locale]/dashboard/settings/*` | Auth | Perfil + 2FA |
| `/[locale]/admin/*` | super_admin | Admin panel |

### Server vs Client Components

- **Default: Server Components.** Páginas, layouts, fetch directo a DB.
- **Client Components solo cuando:**
  - Formularios (RHF necesita client)
  - Calendar (FullCalendar es client-only)
  - Realtime (Supabase channels)
  - Modal/Dialog interactivos
  - Tabla con filtros/sort cliente
- **Pattern:** Server Component padre fetcha datos → pasa props a Client Component hijo.

### Componente clave: jerarquía de `/p/[slug]`

```
<PublicPropertyPage>            (Server)
  <PropertyHero />              (Server) — imagen + nombre + check-in/out
  <PropertyDescription />       (Server) — HTML sanitizado por idioma
  <PropertyAmenities />         (Server)
  <PropertyGallery />           (Client) — lightbox
  <DateRangePicker />           (Client) — wraps Calendar de shadcn
  <AvailableRoomTypesList>      (Server) — recibe dates de searchParams
    <RoomTypeCard />            (Server) — por cada disponible
      <BookingCTA />            (Client) — "Reservar"
  <PropertyMap />               (Server) — embed estático Mapbox (opcional)
  <PublicFooter />              (Server)
```

### Componente clave: jerarquía de `/dashboard/properties/[id]/calendar`

```
<CalendarPage>                  (Server)
  <PropertyTabs />              (Server)
  <CalendarFilters />           (Client) — selectores
  <BookingsCalendar>            (Client) — FullCalendar
    <BookingPopover />          (Client) — al click en evento
      <BookingActions />        (Client) — confirmar/cancelar
```

### State management

- **Server state:** Server Components + Supabase queries directos. Cache de Next vía `revalidateTag('bookings:propertyId')`.
- **Mutations:** Server Actions con `revalidatePath`/`revalidateTag`.
- **Realtime:** hook `useRealtimeBookings(propertyId)` que se suscribe a Supabase channel y dispara `router.refresh()` o actualiza local state.
- **Client state:**
  - Zustand para property switcher activo + UI state global (sidebar collapsed).
  - URL state para filtros (`useSearchParams`).
- **Forms:** React Hook Form + Zod resolver. No reinventar la rueda.

### Real-time

Propiedades clave a sincronizar en tiempo real (Supabase Realtime, gratis):
- `bookings` (filter por property_id) → recepción ve nuevas reservas sin refresh
- `payments` → manager ve confirmaciones automáticas

```ts
// hooks/use-realtime-bookings.ts
const channel = supabase
  .channel(`bookings:${propertyId}`)
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings',
    filter: `property_id=eq.${propertyId}`,
  }, () => router.refresh())
  .subscribe();
```

### Performance

- **Imágenes:** `<Image>` de Next con `priority` en hero, `loading="lazy"` resto. Upload con compresión (sharp en server action).
- **Code splitting:** dynamic import de FullCalendar y editor rich text.
- **Caching:** página pública `revalidate = 60` (1 min), tags por property.
- **DB:** índices en `(property_id)`, `(property_id, check_in, check_out)`, `(status, expires_at)` para holds.

---

## 7. Design System

> ⚠️ **El lenguaje visual definitivo NO está en este blueprint.** Lee `EZTADIA-DESIGN-BRIEF.md` (en la raíz del proyecto target, o en la carpeta de blueprints) para el detalle completo: paleta extendida, anti-patterns explícitos, briefs pantalla-por-pantalla, dirección fotográfica, motion y microcopy.
>
> Esta sección 7 es **solo el subset condensado de tokens** suficiente para arrancar a codear el sistema (CSS vars, escala tipográfica, radius). Cuando vayas a implementar una pantalla concreta, **lee primero `/designs/<pantalla>/` y el design brief** — esta sección es el fallback mínimo.

### Filosofía

Booking platform + boutique hotel feel: **profesional + cálido**. Imágenes grandes, mucho whitespace, sin "ruido visual". Estética editorial-orgánica: paleta tierra (cream, sage, terracotta), tipografía serif protagonista (Fraunces), esquinas generosamente redondeadas, sombras casi ausentes (preferir hairlines). NO debe parecer un dashboard SaaS genérico ni "shadcn default". Ver design brief para 12 anti-patterns explícitos.

### Colors (resumen — versión completa en design brief)

Paleta tierra. Modo claro default. Dark mode opcional, no MVP.

| Token | Hex | Uso |
|-------|-----|-----|
| `--ink` | `#1F1B16` | Texto principal (negro cálido) |
| `--ink-soft` | `#5A5147` | Texto secundario |
| `--ink-muted` | `#8B8275` | Captions, placeholders |
| `--cream` | `#FBF8F2` | Background principal (warm off-white) — **nunca uses `#FFF` como bg de página** |
| `--paper` | `#FFFFFF` | Cards, superficies elevadas |
| `--linen` | `#F2EDE2` | Background suave alterno, hover |
| `--sage` | `#5C7567` | **Primary** — color de marca, links, botones |
| `--sage-soft` | `#9CB39E` | Hover de primary |
| `--sage-tint` | `#E5EDE5` | Backgrounds suaves, badges activos |
| `--terracotta` | `#C76F4C` | **Accent** — CTAs principales puntuales (Reservar, Pagar) |
| `--terracotta-tint` | `#F5E3D9` | Bg de accent suave |
| `--clay` | `#A85A3B` | Hover de terracotta |
| `--gold` | `#B8923E` | Ornamentos premium puntuales |
| `--rule` | `#E5DFD3` | Hairlines y separadores |
| `--rule-strong` | `#D4CCB9` | Bordes de inputs |
| `--success` | `#5E8A5F` | Confirmaciones (verde profundo) |
| `--warning` | `#C49A3C` | Avisos (mostaza) |
| `--danger` | `#A8483C` | Destructive (rojo terroso) |
| `--info` | `#5B7B96` | Tips (Payne's grey) |

CSS vars en `globals.css`:

```css
@theme {
  --color-ink: #1F1B16;
  --color-ink-soft: #5A5147;
  --color-ink-muted: #8B8275;
  --color-cream: #FBF8F2;
  --color-paper: #FFFFFF;
  --color-linen: #F2EDE2;
  --color-sage: #5C7567;
  --color-sage-soft: #9CB39E;
  --color-sage-tint: #E5EDE5;
  --color-terracotta: #C76F4C;
  --color-terracotta-tint: #F5E3D9;
  --color-clay: #A85A3B;
  --color-gold: #B8923E;
  --color-rule: #E5DFD3;
  --color-rule-strong: #D4CCB9;
  --color-success: #5E8A5F;
  --color-warning: #C49A3C;
  --color-danger: #A8483C;
  --color-info: #5B7B96;

  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-serif: 'Fraunces Variable', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-xs: 6px;
  --radius-sm: 10px;
  --radius: 14px;
  --radius-md: 20px;
  --radius-lg: 28px;
  --radius-xl: 40px;
  --radius-pill: 999px;

  --shadow-soft: 0 1px 0 0 rgb(31 27 22 / 0.04), 0 2px 8px -2px rgb(31 27 22 / 0.04);
  --shadow-lift: 0 4px 16px -4px rgb(31 27 22 / 0.08), 0 2px 4px -2px rgb(31 27 22 / 0.04);
  --shadow-popover: 0 12px 32px -8px rgb(31 27 22 / 0.12), 0 4px 8px -4px rgb(31 27 22 / 0.06);
  --shadow-modal: 0 24px 48px -16px rgb(31 27 22 / 0.16);
}
```

Reglas críticas (ver design brief sección 4 para reglas extendidas):
- Background dominante: `--cream`, **no blanco puro**.
- `--sage` con moderación (no saturar verde toda la UI).
- `--terracotta` solo para CTAs *importantes* (Reservar, Pagar), no botones cotidianos.
- Hairlines (`border 1px var(--rule)`) > sombras siempre que sea posible.

### Typography (resumen — escala completa en design brief)

- **Display / Headings: `Fraunces Variable`** (serif con personalidad, italics activables, opt-in soft). Pesos 400-700. Activar `font-variation-settings: "SOFT" 50, "opsz" 144`.
- **UI / Body: `Inter Variable`** (no Geist). Pesos 400-600. `font-feature-settings: "ss01", "cv11"`.
- **Mono: `JetBrains Mono`** para códigos de reserva, IDs, timestamps.
- **Numerales:** `oldstyle-nums proportional-nums` en displays largos; `tabular-nums lining-nums` en tablas y precios.

| Nivel | Fuente | Size | Weight | Line-height |
|-------|--------|------|--------|-------------|
| Hero display | Fraunces | 64-96px (clamp) | 500 | 1.02 |
| H1 | Fraunces | 44-56px | 500 | 1.08 |
| H2 | Fraunces | 32-40px | 500 | 1.15 |
| H3 | Fraunces | 24-28px | 500 | 1.25 |
| H4 | Inter | 18-20px | 600 | 1.35 |
| Body | Inter | 15-16px | 400 | 1.55 |
| Body small | Inter | 13-14px | 400 | 1.5 |
| Caption | Inter | 12px | 500 | 1.4 |
| Overline | Inter | 11-12px | 500 UPPERCASE tracking 0.08em | 1.4 |
| Numeric display | Fraunces oldstyle | 36-72px | 500 | 1.0 |
| Mono | JetBrains | 12-14px | 400 | 1.5 |

Reglas clave: nombres de propiedad **siempre en Fraunces italic**. Precios y métricas en Fraunces oldstyle (no Inter). Body largos: **nunca serif** — fatiga.

### Spacing & Layout

- **Spacing scale:** 4px base → 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.
- **Border radius:** 6/10/14/20 según jerarquía (botones 10, cards 14, modales 20).
- **Max content width:** 1280px (dashboard), 1120px (página pública), 768px (auth).
- **Breakpoints:** sm 640, md 768, lg 1024, xl 1280, 2xl 1536.

### Component Style

- **Botones:** medium radius (10px), peso 500, padding generoso (`px-5 py-2.5`), `transition-all duration-150`.
- **Cards:** radius 14, `shadow` ligero, border `stone-200`, padding `p-6`.
- **Inputs:** radius 10, border `stone-300`, focus ring 2px teal, `h-10`.
- **Tablas:** zebra muy sutil (`stone-50` en filas pares), headers en `stone-600` text + `stone-100` bg.
- **Animaciones:** transiciones sutiles 150-200ms ease-out. Loading skeletons con shimmer. Page transitions: instantáneas (sin animaciones agresivas).
- **Iconografía:** Lucide React, 1.5px stroke, tamaño 16/20/24.
- **Mobile-first:** todo responsive, layouts colapsan a stack vertical < 768px.

### shadcn/ui config

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/[locale]/globals.css",
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Components a instalar inicialmente: `button, input, label, textarea, select, dialog, dropdown-menu, toast, table, tabs, badge, card, form, calendar, popover, separator, sheet, skeleton, switch, avatar, alert, alert-dialog`.

---

## 8. Authentication & Authorization

### Auth Flow

**Signup (owner):**
1. `/signup` → email + password + nombre + teléfono → Turnstile.
2. Supabase Auth crea user → trigger crea `profiles` con `role='owner'`.
3. Email de verificación (Resend) con link 24h.
4. Click link → `/verify-email?token=...` → marca verificado.
5. Redirect a `/dashboard` → onboarding wizard (crear Organization + primera Property).

**Signup (staff invitado):**
1. Owner invita por email desde `/dashboard/properties/[id]/staff`.
2. Email con link único (token JWT, 72h TTL).
3. Click → `/signup?invitation=<token>` → completa datos.
4. Trigger crea `profiles` + `property_users` (con rol predefinido).
5. Redirect a la propiedad.

**Login:**
1. `/login` → email + password + Turnstile.
2. Validación de rate limit (5/15min por IP+email).
3. Supabase Auth → session cookie httpOnly.
4. Si TOTP enabled → `/login/2fa` (pide código).
5. Si login desde IP/UA nueva → enviar email "nuevo dispositivo".
6. Redirect a `/dashboard` o `?returnUrl=...`.

**Magic Link (alternativa):**
- `/login` → "Login con email" → Supabase envía link.
- Útil si el usuario olvida password.

**Reset password:**
- `/reset-password` → email → Supabase envía link → `/reset-password/[token]` → nuevo password.

**Logout:**
- POST a `/api/auth/logout` (Server Action) → `supabase.auth.signOut()`.

### Middleware

```ts
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { applyRateLimit } from '@/lib/rate-limit/apply';
import createIntlMiddleware from 'next-intl/middleware';
import { locales } from '@/lib/i18n/config';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'es',
  localePrefix: 'always'
});

export async function middleware(req) {
  // 1. Rate limit global por IP (1000/min, salvaguarda DoS)
  const rl = await applyRateLimit(req, 'global');
  if (!rl.ok) return rl.response;

  // 2. CSP, HSTS, security headers
  const res = NextResponse.next();
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  // CSP: configurado en next.config.ts con nonces

  // 3. Refresh session
  const supabase = createServerClient(/* ... */);
  await supabase.auth.getSession();

  // 4. i18n
  const intl = intlMiddleware(req);
  // merge intl + res

  // 5. Route guards
  const path = req.nextUrl.pathname;
  const { data: { user } } = await supabase.auth.getUser();

  if (path.includes('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (path.includes('/admin')) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();
    if (profile?.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return intl;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

### Roles & Permissions

**Roles globales (`profiles.role`):**

| Rol | Puede |
|-----|-------|
| `super_admin` | Todo. Ver todas las propiedades, suspender usuarios, ver logs |
| `owner` | Crear propiedades, gestionar las suyas |
| `staff_manager` | Solo si invitado a una propiedad |
| `staff_reception` | Solo si invitado a una propiedad |
| `guest` | (futuro) Ver sus reservas |

**Roles por propiedad (`property_users.role`):**

| Rol | Reservas | Precios | Ingresos | Staff | Settings | Refunds |
|-----|----------|---------|----------|-------|----------|---------|
| `owner` | CRUD | CRUD | Ver | CRUD | CRUD | Sí |
| `manager` | CRUD | CRUD | Ver | Solo invitar reception | RU | No |
| `reception` | CRU (no Delete) | — | — | — | — | — |

### Implementación de permisos

```ts
// lib/auth/permissions.ts
type Action =
  | 'property:read' | 'property:update' | 'property:delete'
  | 'booking:read' | 'booking:create' | 'booking:update' | 'booking:cancel'
  | 'payment:confirm' | 'payment:refund' | 'payment:view_amount'
  | 'pricing:read' | 'pricing:update'
  | 'staff:invite' | 'staff:remove'
  | 'integration:read' | 'integration:update'
  | 'report:view'
  | 'audit:view';

type Context = {
  user: Profile,
  propertyRole?: PropertyUserRole
};

const POLICIES: Record<Action, (ctx: Context) => boolean> = {
  'property:read':    (c) => !!c.propertyRole || c.user.role === 'super_admin',
  'property:update':  (c) => c.propertyRole === 'owner' || c.user.role === 'super_admin',
  'property:delete':  (c) => c.propertyRole === 'owner' || c.user.role === 'super_admin',
  'booking:read':     (c) => !!c.propertyRole || c.user.role === 'super_admin',
  'booking:create':   (c) => !!c.propertyRole || c.user.role === 'super_admin',
  'booking:update':   (c) => !!c.propertyRole || c.user.role === 'super_admin',
  'booking:cancel':   (c) => c.propertyRole !== undefined && c.propertyRole !== 'reception' || c.user.role === 'super_admin',
  'payment:confirm':  (c) => !!c.propertyRole,
  'payment:refund':   (c) => c.propertyRole === 'owner',
  'payment:view_amount': (c) => c.propertyRole && c.propertyRole !== 'reception',
  'pricing:read':     (c) => c.propertyRole && c.propertyRole !== 'reception',
  'pricing:update':   (c) => ['owner','manager'].includes(c.propertyRole ?? ''),
  'staff:invite':     (c) => c.propertyRole === 'owner' || (c.propertyRole === 'manager'),
  'staff:remove':     (c) => c.propertyRole === 'owner',
  'integration:read': (c) => !!c.propertyRole,
  'integration:update': (c) => ['owner','manager'].includes(c.propertyRole ?? ''),
  'report:view':      (c) => c.propertyRole && c.propertyRole !== 'reception',
  'audit:view':       (c) => c.user.role === 'super_admin' || c.propertyRole === 'owner',
};

export function can(action: Action, ctx: Context): boolean {
  return POLICIES[action](ctx);
}

// uso en Server Component / Server Action
import { requireProperty } from './session';
const { user, propertyRole } = await requireProperty(propertyId);
if (!can('payment:refund', { user, propertyRole })) throw new ForbiddenError();
```

### Session Management

- **Cookie httpOnly Secure SameSite=Lax** (manejada por `@supabase/ssr`).
- **Refresh automático** en middleware.
- **Sesiones activas:** página `/dashboard/settings/security` lista sesiones (vía `auth.sessions`), permite revocar.
- **Expiración:** Supabase default 1h access + 7d refresh. Configurable.

### 2FA (TOTP)

- Supabase Auth tiene MFA nativo desde v2.
- `/dashboard/settings/security` → "Habilitar 2FA" → muestra QR → user escanea con Google Authenticator → verifica código → activado.
- Owners y super_admins: **obligatorio** activar en primer login (banner persistente hasta que lo hagan).
- Backup codes: 10 códigos generados, mostrados una sola vez.

---

## 9. Build Order

> 🎯 **Esta es la sección más importante.** Sigue paso a paso. Cada paso depende del anterior.
> **Idioma de la conversación con Claude Code durante el build: español** (mantén consistencia con el blueprint).

### Step 1: Scaffolding inicial (~30 min)

```bash
# Crear proyecto
pnpm create next-app@latest eztadia --typescript --tailwind --app --src-dir --import-alias "@/*" --no-eslint
cd eztadia

# Reemplazar ESLint por Biome (más rápido)
pnpm add -D @biomejs/biome
pnpm dlx @biomejs/biome init

# Setup pnpm
echo "node-linker=hoisted" > .npmrc  # Compat con Vercel
echo "20" > .nvmrc

# Crear estructura de carpetas vacías según sección 3
mkdir -p src/app/\[locale\]/{\(marketing\),\(auth\),p,dashboard,admin}
mkdir -p src/{components/{ui,marketing,property-public,dashboard,shared,icons},lib/{supabase,db,auth,wompi,whatsapp,email,ical,rate-limit,turnstile,i18n,audit,validation},hooks,types,test}
mkdir -p prisma supabase/migrations messages emails public
```

**Deliverable:** proyecto compila con `pnpm dev`, abre en `localhost:3000`.

### Step 2: Configurar TypeScript strict + Biome + paths (~20 min)

**`tsconfig.json`:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "incremental": true,
    "allowJs": false,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**`biome.json`:** lint + format con reglas estrictas (incluir `noUnusedVariables`, `useExhaustiveDependencies`).

**Scripts en `package.json`:**
```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "supabase:gen-types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.ts"
  }
}
```

**Deliverable:** `pnpm lint` y `pnpm type-check` pasan limpio.

### Step 3: Setup Supabase project + variables de entorno (~30 min)

1. Crear proyecto Supabase (free tier).
2. Región: `us-east-1` (cercano a Colombia, menor latencia que `eu` o `ap`).
3. Configurar Auth: enable Email + disable signups públicos por endpoint (signup será controlado por la app).
4. Anotar: URL, anon key, service role key, DB URL (con + sin pooler).
5. Setup local CLI: `pnpm add -D supabase` + `npx supabase init` + `npx supabase link --project-ref ...`.

**`.env.example`:**
```env
# === DATABASE ===
DATABASE_URL=postgres://...?pgbouncer=true                # Pooler para queries
DIRECT_URL=postgres://...                                  # Direct para migrations

# === SUPABASE ===
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...                          # SOLO server. Nunca expongas.
SUPABASE_PROJECT_ID=xxx

# === APP ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# === RESEND ===
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Eztadia <reservas@eztadia.com>

# === UPSTASH REDIS ===
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# === CLOUDFLARE TURNSTILE ===
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...

# === WOMPI (sandbox por defecto) ===
# Las credenciales por propiedad se guardan en DB encriptadas.
# Estas son fallback de plataforma + para webhook URL base.
WOMPI_WEBHOOK_BASE_URL=http://localhost:3000

# === WHATSAPP CLOUD API ===
# Similar a Wompi, las credenciales por propiedad se guardan en DB.
META_APP_SECRET=...                                       # Para verificar webhook
META_VERIFY_TOKEN=...                                     # String aleatorio para Meta verification challenge

# === CRON ===
CRON_SECRET=...                                           # Bearer token para /api/cron/*

# === ENCRYPTION ===
ENCRYPTION_KEY=...                                        # 32 bytes hex para cifrar secrets en DB

# === SENTRY ===
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

**`src/lib/env.ts`** (validación Zod al startup):
```ts
import { z } from 'zod';
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith('re_'),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  META_APP_SECRET: z.string().min(1),
  META_VERIFY_TOKEN: z.string().min(1),
  CRON_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(64),  // 32 bytes hex
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development','test','production']).default('development'),
});
export const env = envSchema.parse(process.env);
```

**Deliverable:** `pnpm dev` arranca y `console.log(env)` no truena.

### Step 4: Schema Prisma + migraciones + RLS (~2-3 horas)

1. `pnpm add -D prisma tsx` + `pnpm add @prisma/client`
2. `npx prisma init --datasource-provider postgresql`
3. Escribir `prisma/schema.prisma` COMPLETO (todas las entidades de sección 4).
4. `pnpm db:push` (sincroniza schema con Supabase — más rápido para iteración inicial).
5. Crear migration manual en `supabase/migrations/0002_rls_policies.sql` con TODAS las policies.
6. Aplicar: `npx supabase db push`.
7. Crear `supabase/migrations/0003_functions_and_triggers.sql` con:
   - `handle_new_user` + trigger
   - `check_availability`
   - `create_booking_hold`
   - `expire_old_holds` (función para cron)
   - Helpers `auth.is_super_admin`, `auth.has_property_access`, `auth.property_role`
8. Generar tipos: `pnpm supabase:gen-types`.
9. **Test crítico:** escribir `test/integration/rls.test.ts` que verifica:
   - User A (owner de prop A) NO puede leer bookings de prop B.
   - User B (reception en prop B) NO puede leer payments amounts.
   - Super admin puede leer todo.

**Deliverable:** schema visible en Supabase Studio, tests RLS pasan.

### Step 5: Setup i18n con next-intl (~1 hora)

```bash
pnpm add next-intl
```

`src/lib/i18n/config.ts`:
```ts
export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es';
export type Locale = (typeof locales)[number];
```

`src/lib/i18n/request.ts` (next-intl config). `src/lib/i18n/navigation.ts` (Link, redirect wrappers).

`messages/es.json`:
```json
{
  "common": { "save": "Guardar", "cancel": "Cancelar", "loading": "Cargando..." },
  "auth": { "login": "Iniciar sesión", "signup": "Crear cuenta", ... },
  "dashboard": { ... },
  "booking": { ... }
}
```

`messages/en.json`: mismo árbol, traducido.

Mover `src/app/page.tsx` etc. a `src/app/[locale]/page.tsx`. Configurar middleware con `createIntlMiddleware`.

`<LocaleSwitcher>` component en topbar.

**Deliverable:** `/es` y `/en` funcionan, textos se cambian.

### Step 6: Tailwind v4 + shadcn/ui + design tokens (~2 horas)

**Antes de empezar:** lee `EZTADIA-DESIGN-BRIEF.md` completo (al menos secciones 1-10 + sección 12 component personality). Esto define la estética que todo lo demás respeta.

```bash
pnpm dlx shadcn@latest init  # Configurar con new-york, stone, CSS variables
pnpm dlx shadcn@latest add button input label textarea select dialog dropdown-menu toast table tabs badge card form calendar popover separator sheet skeleton switch avatar alert alert-dialog
```

1. Implementar `globals.css` con TODAS las CSS vars de sección 7 del blueprint (paleta tierra).
2. Configurar `tailwind.config.ts` extendiendo con los tokens del brief.
3. Instalar `Fraunces Variable` (Google Fonts), `Inter Variable`, `JetBrains Mono` vía `next/font`. Activar `font-variation-settings` para Fraunces (`SOFT 50, opsz 144`).
4. Configurar `font-feature-settings` global para activar oldstyle numerals en displays.
5. **Customizar shadcn primitives** para que no parezcan default:
   - Button: aplicar paleta sage/terracotta + radius 14px + transition cubic-bezier del brief.
   - Input: height 44px (no 40), radius 10, focus ring sage-tint 3px.
   - Card: radius 20, border `--rule`, sin shadow por default.
   - Dialog: radius 28, shadow-modal, padding 40.
   - Toast: bottom-right, radius 14, paper + border.
6. Layout root con providers (NextIntlClientProvider, Toaster, Theme placeholder).
7. Crear primitives custom no-shadcn:
   - `<EmptyState>` con copy editorial (ver brief sección 10).
   - `<LoadingSkeleton>` con shimmer 1.5s cream.
   - `<ErrorBoundary>` con copy humano.
   - `<Overline>` typography helper (uppercase tracking 0.08em).
   - `<NumericDisplay>` para precios y métricas (Fraunces oldstyle).
   - `<HairlineSeparator>` (border 1px `--rule`, márgen variable).

**Deliverable:** abrir una página de prueba con un botón primary, un card, un input, un dialog. Compararlo contra el design brief — si parece shadcn default, **rehacer**. No avances hasta que la estética se sienta editorial-orgánica.

### Step 7: Auth completo (signup, login, logout, verify, reset) (~3-4 horas)

1. `pnpm add @supabase/ssr @supabase/supabase-js`
2. Crear `lib/supabase/{client,server,admin,middleware}.ts`.
3. Configurar middleware (sección 8).
4. Páginas:
   - `/[locale]/(auth)/login/page.tsx` (RHF + Zod + Turnstile)
   - `/[locale]/(auth)/signup/page.tsx`
   - `/[locale]/(auth)/reset-password/page.tsx`
   - `/[locale]/(auth)/reset-password/[token]/page.tsx`
   - `/[locale]/(auth)/verify-email/page.tsx`
5. Server Actions: `login(formData)`, `signup(formData)`, `logout()`, `requestReset(email)`.
6. `lib/auth/session.ts`: `getSession()`, `requireSession()`, `requireRole(role)`, `requireProperty(propertyId)`.
7. Logging de `login_events`.
8. Rate limiting en login (5/15min por email+IP).

**Deliverable:** flujo completo signup → verify email → login → logout funciona en `localhost`. Test E2E.

### Step 8: 2FA + seguridad de cuenta (~2 horas)

1. `/[locale]/dashboard/settings/security/page.tsx`.
2. Server Actions: `enableTotp()`, `verifyTotp(code)`, `disableTotp()`, `regenerateBackupCodes()`.
3. Página `/[locale]/(auth)/login/2fa/page.tsx`.
4. Email "nuevo dispositivo" usando Resend.
5. Banner persistente pidiendo 2FA si owner/admin no lo tiene.
6. Lista de sesiones activas + revocar.

**Deliverable:** owner puede activar 2FA, login pide código, sesión nueva dispara email.

### Step 9: Resend setup + plantillas email (~2 horas)

1. `pnpm add resend @react-email/components react-email`
2. Verificar dominio en Resend (`eztadia.com` o uno temporal).
3. Crear plantillas en `emails/`:
   - `booking-confirmation.tsx`
   - `booking-pending-payment.tsx` (con instrucciones + link PSE o datos bancarios)
   - `payment-confirmed.tsx`
   - `payment-rejected.tsx`
   - `owner-invitation.tsx`
   - `staff-invitation.tsx`
   - `login-from-new-device.tsx`
   - `password-reset.tsx`
4. `lib/email/send.ts`: wrapper con logging a `email_logs`.
5. Server Action `previewEmail(template, vars)` para `/[locale]/admin/system/emails` (preview).

**Deliverable:** todos los emails se renderizan correctamente y se loggean.

### Step 10: Property CRUD + onboarding (~3-4 horas)

1. Wizard de onboarding: `/[locale]/dashboard/onboarding` (después de signup verificado).
   - Step 1: nombre Organization
   - Step 2: primera Property (nombre, slug, dirección, fotos)
   - Step 3: primer Room Type + cantidad de rooms
2. `/[locale]/dashboard/properties` (lista) + `/new` (form).
3. `/[locale]/dashboard/properties/[id]/settings` (editar).
4. Server Actions: `createOrganization`, `createProperty`, `updateProperty`, `deleteProperty`.
5. Validación: slug único, sanitización HTML de descripción (DOMPurify).
6. Upload de fotos: `/api/upload/property-photo` con Supabase Storage + sharp compression.
7. RLS test: usuario A no puede ver/editar prop de B.

**Deliverable:** owner puede crear property con fotos. Otro owner no la ve.

### Step 11: Rooms + Room Types + Pricing (~2-3 horas)

1. `/dashboard/properties/[id]/rooms/page.tsx`: tabs "Tipos" + "Habitaciones".
2. CRUD Room Types: form con campos bilingües (es/en), capacidad, precio base, fotos.
3. CRUD Rooms: número, piso, asignar a tipo.
4. `/dashboard/properties/[id]/pricing/page.tsx`: temporadas (seasonal_rates).
5. Función `calculatePrice(roomTypeId, checkIn, checkOut)` aplicando seasonal_rates.

**Deliverable:** owner crea 1 tipo + 10 rooms en < 2 min. Precios variables por fecha funcionan.

### Step 12: Página pública de propiedad `/p/[slug]` (~4-5 horas)

**🎨 Antes de empezar:** consulta `/designs/property-public/` (mockups). Si está vacía, sigue la sección 11.2 de `EZTADIA-DESIGN-BRIEF.md` al pie de la letra. Esta es **la cara del producto** — la pantalla que más impacto visual tiene. No improvises.

1. `/[locale]/p/[slug]/page.tsx` (Server Component, `revalidate=60`).
2. Layout: hero con foto cover, nombre (Fraunces), descripción, amenities.
3. `<DateRangePicker>` (client) con shadcn Calendar.
4. Al seleccionar fechas + adultos/niños → URL con searchParams.
5. `<AvailableRoomTypesList>` (server) fetcha disponibilidad para esas fechas usando `check_availability`.
6. `<RoomTypeCard>`: foto, nombre, precio total, "Reservar".
7. Mobile-first responsive.
8. SEO: metadata dinámica, OG image (`/api/og/property/[slug]`), `<JSON-LD>` con `Hotel` schema.
9. Sitemap.ts incluye `/p/<slug>` para cada propiedad activa.

**Deliverable:** Lighthouse mobile > 90 en performance + SEO. La página se ve preciosa.

### Step 13: Booking flow completo (~5-6 horas)

**🎨 Antes de empezar:** consulta `/designs/booking-flow/`. Sigue secciones 11.3, 11.4, 11.5 del design brief.

#### 13.1 Form de booking `/p/[slug]/booking/new`

- Form RHF + Zod + Turnstile.
- Campos: nombre, documento, email, teléfono, país, método de pago (PSE / transferencia manual).
- Validaciones de capacidad y noches mínimas.
- Mostrar resumen: noches × precio = total.
- Submit → POST `/api/public/booking`.

#### 13.2 Endpoint `POST /api/public/booking`

- Rate limit 5/min/IP.
- Verificar Turnstile.
- Validar Zod.
- Llamar `create_booking_hold` (atómico).
- Si `pse`: crear payment link Wompi → `holdId` en `reference`.
- Si `manual_transfer`: generar `reference` único.
- Enviar email "reserva pendiente".
- Enviar WhatsApp si owner configurado.
- Devolver `{ holdId, paymentUrl, expiresAt, bankInfo? }`.

#### 13.3 Página de pago `/p/[slug]/booking/[holdId]/pay`

- Server Component fetch hold.
- Si PSE: botón "Pagar con PSE" → redirect a Wompi.
- Si manual: mostrar datos bancarios + form para subir comprobante.
- Countdown timer hasta `expiresAt`.
- Tras subir comprobante → estado "esperando confirmación".

#### 13.4 Página status `/p/[slug]/booking/[holdId]/status?token=xxx`

- Verificar token (HMAC con secret de plataforma).
- Mostrar estado actual (pending_payment, confirmed, cancelled).
- Si confirmed: detalles de la reserva + código.

**Deliverable:** flujo end-to-end de reserva con PSE en sandbox de Wompi. Test E2E.

### Step 14: Integración Wompi (PSE) (~3-4 horas)

1. Crear cuenta sandbox Wompi, anotar `public_key`, `private_key`, `events_secret`.
2. `/dashboard/properties/[id]/integrations/wompi/page.tsx`: form para que owner ingrese sus credenciales (encriptadas en `wompi_configs`).
3. `lib/wompi/`:
   - `client.ts`: HTTP client base.
   - `create-payment-link.ts`: crea payment link con `reference=holdId`.
   - `verify-webhook.ts`: HMAC validation.
4. `/api/webhooks/wompi/route.ts`:
   - Verify signature.
   - Identificar hold por reference o `wompi_payment_link_id`.
   - Si APPROVED → atomicamente: asignar room, crear booking + payment, consumir hold.
   - Si DECLINED → cancelar hold, email.
   - Idempotencia: chequear `wompi_transaction_id` existente.
5. Audit log de cada webhook.

**Deliverable:** reserva PSE en sandbox → webhook → booking confirmada automáticamente en DB.

### Step 15: Confirmación manual de transferencia (~2 horas)

1. `/api/upload/payment-proof/route.ts`: recibe imagen, sube a Supabase Storage, vincula a `payments`.
2. En el dashboard, owner ve reservas con `status='pending_payment'` y método `manual_transfer`.
3. `<ConfirmPaymentDialog>` permite ver comprobante + confirmar o rechazar.
4. Server Action `confirmManualPayment(bookingId)`: marca payment approved, asigna room, marca booking confirmed, consume hold.
5. Audit log + email confirmación.

**Deliverable:** flujo manual completo desde upload hasta confirmación.

### Step 16: Calendar visual + bookings table (~3-4 horas)

**🎨 Antes de empezar:** consulta `/designs/calendar/` y `/designs/bookings-table/`. Sigue secciones 11.9, 11.10, 11.11 del brief. El calendar NO debe verse como FullCalendar default — customiza fuertemente los estilos (paleta tierra, hairlines, tipografía Fraunces en headers de días).

1. `pnpm add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/resource-timeline @fullcalendar/interaction`
2. `/dashboard/properties/[id]/calendar/page.tsx`: vista resource-timeline (cada room es un resource).
3. Eventos: bookings + external_blocks + holds activos (diferenciados por color).
4. Click en evento → popover con detalles + acciones.
5. Drag para mover reservas (solo manager+).
6. `/dashboard/properties/[id]/bookings/page.tsx`: tabla TanStack con filtros (fecha, estado, room, source), paginación, búsqueda.
7. Hook `useRealtimeBookings(propertyId)` → refresh en vivo.

**Deliverable:** owner ve calendario interactivo, reservas se actualizan en vivo si llegan de otra sesión.

### Step 17: iCal sync (entrante y saliente) (~3-4 horas)

1. `pnpm add ical ics node-ical`
2. `/dashboard/properties/[id]/integrations/ical/page.tsx`:
   - Lista feeds entrantes (Booking.com, Airbnb URLs).
   - URL exportada nuestra (con secret) por propiedad/room.
3. CRUD `ical_feeds`.
4. `lib/ical/sync.ts`: parsea iCal entrante, upsert `external_blocks` por `external_uid`.
5. `/api/cron/ical-sync/route.ts`: itera todos los feeds inbound activos, syncea, registra `last_synced_at`. Verificar `CRON_SECRET`.
6. `/api/ical/[propertyId]/[secret].ics/route.ts`: genera iCal con bookings confirmed + pending_payment.
7. `vercel.json` cron job `*/15 * * * *`.
8. Verificar disponibilidad considera `external_blocks` (ya cubierto en `check_availability`).

**Deliverable:** crear feed con URL de Booking.com de prueba, ejecutar cron, ver bloqueos en calendario. Importar URL nuestra en otra herramienta y ver bookings.

### Step 18: WhatsApp Cloud API (~3-4 horas)

1. Crear Meta Business Account + WhatsApp Business Account + Phone Number (sandbox para testing).
2. `/dashboard/properties/[id]/integrations/whatsapp/page.tsx`: form para `phone_number_id`, `business_account_id`, `access_token`.
3. Crear plantillas en Meta Business Manager (deben aprobarse — ~24h):
   - `booking_pending_payment`
   - `booking_confirmed`
   - `payment_confirmed`
   - `check_in_reminder` (24h antes)
   - `review_request` (24h después de check-out)
4. `lib/whatsapp/send-template.ts`: envío con plantilla + variables.
5. `/api/webhooks/whatsapp/route.ts`:
   - GET: responder challenge de Meta.
   - POST: verificar firma `X-Hub-Signature-256` con `META_APP_SECRET`.
   - Procesar entrantes → guardar en `whatsapp_messages`.
   - Status updates (sent, delivered, read) → actualizar mensaje.
6. Trigger envíos: post-booking, post-payment, recordatorios (cron).

**Deliverable:** mensaje "reserva confirmada" llega al WhatsApp del huésped al confirmar PSE.

### Step 19: Cron jobs (~1.5 horas)

1. `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/ical-sync", "schedule": "*/15 * * * *" },
    { "path": "/api/cron/expire-holds", "schedule": "*/5 * * * *" }
  ]
}
```
2. Tier hobby permite 2 crons. Si necesitas más (ej. reminders), usa `pg_cron` en Supabase para llamar a `/api/cron/send-reminders`.
3. Todos los `/api/cron/*` validan `Authorization: Bearer ${CRON_SECRET}`.

**Deliverable:** holds vencidos se limpian automáticamente; iCal sync corre cada 15 min.

### Step 20: Rate limiting + Turnstile + audit logs (~2 horas)

1. `pnpm add @upstash/redis @upstash/ratelimit`
2. `lib/rate-limit/`:
   - `client.ts` (Redis).
   - `limits.ts` (configuración por endpoint).
   - `apply.ts` (helper para middleware y route handlers).
3. Aplicar en: middleware global, login, signup, booking submit, OG images.
4. `lib/turnstile/verify.ts` + componente `<Turnstile>`.
5. `lib/audit/log.ts`: `writeAuditLog({ action, resourceType, resourceId, diff, ctx })`.
6. Logging de: booking creado/cancelado, payment confirmado/refunded, property updated, staff invited/removed, role changed, login from new device.
7. `/[locale]/admin/audit-logs/page.tsx`: tabla buscable.

**Deliverable:** rate limit testeable con herramientas tipo `ab` o `hey`. Audit log se llena.

### Step 21: Staff invitations + permisos en UI (~2 horas)

1. `/dashboard/properties/[id]/staff/page.tsx`: lista + form invitar.
2. Server Action `inviteStaff(propertyId, email, role)`: crea token JWT 72h, envía email.
3. `/(auth)/signup?invitation=<token>` consume token, crea profile + property_users.
4. Hook `usePermission(action)` para hide/show botones en UI.
5. Server-side `requireProperty(propertyId)` + `requirePermission(action)` en cada Server Action.
6. Pruebas: reception NO ve sección "Precios", NO ve montos en lista de pagos.

**Deliverable:** invitar reception, ella entra, no ve datos financieros. Tests automáticos.

### Step 22: Super admin panel (~2-3 horas)

1. `/[locale]/admin/page.tsx`: KPIs globales (users totales, propiedades activas, bookings/mes, revenue agregado).
2. `/admin/users/page.tsx`: lista + buscar + filtrar por rol. Acciones: suspender, cambiar rol, ver propiedades.
3. `/admin/users/[id]/page.tsx`: detalle.
4. `/admin/properties/page.tsx`: todas las propiedades + filtros.
5. `/admin/audit-logs/page.tsx`: ya creado.
6. `/admin/system/{emails,whatsapp,webhooks}/page.tsx`: logs.
7. Acceso: `requireRole('super_admin')` en layout.

**Deliverable:** super_admin puede gestionar usuarios y ver estado del sistema.

### Step 23: Landing pública de Eztadia `/[locale]/` (~4-5 horas)

**🎨 Antes de empezar:** consulta `/designs/landing/`. Sigue la sección 11.1 del design brief al detalle — hero asimétrico, propuesta de valor en composición editorial (no grid simétrico), 3 pasos, "para quién es", cierre con foto de patio. SEO bilingüe (es + en).

**Anti-patterns críticos para landing (del brief):**
- ❌ Screenshot gigante del dashboard en el hero (cliché SaaS).
- ❌ "Trusted by" con logos grises.
- ❌ Grid simétrico 2x2 de features con icono arriba.
- ❌ Comparación tabular vs. competencia.

**Deliverable:** landing publicable + Lighthouse mobile > 90 + se siente como Cereal Magazine, no como Stripe-clone.

### Step 24: Pulido + edge cases (~3-4 horas)

- Loading skeletons en todas las páginas.
- Empty states (sin propiedades, sin reservas).
- Error boundaries en cada `(group)/layout`.
- 404 + 500 personalizados.
- Mobile testing exhaustivo (DevTools + dispositivo real).
- Accesibilidad: contraste, ARIA, focus rings, keyboard nav.
- Loader global para Server Actions con `useTransition`.

### Step 25: Testing comprehensivo (~3-4 horas)

- Unit: `availability.test.ts`, `permissions.test.ts`, `ical.test.ts`.
- Integration: `rls.test.ts` (crítico), `booking-flow.test.ts`, `webhooks.test.ts`.
- E2E: `booking-happy-path.spec.ts`, `owner-onboarding.spec.ts`, `staff-permissions.spec.ts`.
- Run con `pnpm test` + `pnpm test:e2e`.
- CI: GitHub Actions corre tests en cada PR.

### Step 26: Deployment a Vercel (~1.5 horas)

1. Push a GitHub.
2. Importar en Vercel.
3. Configurar env vars (todas las de `.env.example` con valores prod).
4. Configurar dominio (cuando se compre).
5. Build + verificar.
6. Configurar Sentry + Vercel Analytics.
7. Cambiar webhook URLs en Wompi y Meta a producción.

**Deliverable:** producción en `eztadia.vercel.app`.

### Step 27: Compra de dominio + DNS (~30 min, post-MVP)

Sugerencias: `eztadia.co`, `eztadia.com`, `useeztadia.com`. Comprar en Cloudflare (es el más barato + DNS gratis). Configurar:
- A record `@` → Vercel
- CNAME `www` → Vercel
- DNS records de Resend (DKIM, SPF)
- DNS verification de Meta (si dominio en WhatsApp)

---

## 10. Environment Setup

### Prerequisites

- **Node.js 20.x LTS** (`nvm use` con `.nvmrc`)
- **pnpm 9.x** (`npm install -g pnpm`)
- **Git**
- **Cuenta Supabase** (free)
- **Cuenta Resend** (free)
- **Cuenta Upstash** (free)
- **Cuenta Cloudflare** (free, para Turnstile)
- **Cuenta Wompi** (sandbox primero — https://comercios.wompi.co)
- **Cuenta Meta Business** (para WhatsApp Cloud API)
- **Cuenta Vercel** (deploy)
- **Cuenta Sentry** (free 5k events/mo)

### Environment Variables

Ver Step 3 para `.env.example` completo. Resumen rápido de dónde obtener cada uno:

| Variable | Where to Get |
|----------|--------------|
| `DATABASE_URL`, `DIRECT_URL` | Supabase → Project Settings → Database → Connection String |
| `NEXT_PUBLIC_SUPABASE_*` | Supabase → Project Settings → API |
| `RESEND_API_KEY` | resend.com → API Keys |
| `UPSTASH_*` | upstash.com → Create Redis DB → REST API |
| `TURNSTILE_*` | dash.cloudflare.com → Turnstile → Add Site |
| `META_*` | developers.facebook.com → My Apps → WhatsApp → Configuration |
| `CRON_SECRET` | `openssl rand -hex 32` |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` |
| `SENTRY_*` | sentry.io → Settings → Auth Tokens |

### Initial Setup Commands

```bash
# 1. Clonar e instalar
git clone <repo> eztadia
cd eztadia
pnpm install

# 2. Configurar env
cp .env.example .env.local
# editar .env.local con valores reales

# 3. Setup Supabase
npx supabase link --project-ref <ref>
npx supabase db push                          # Aplica migrations SQL
pnpm db:push                                  # Sincroniza Prisma
pnpm supabase:gen-types                       # Genera types

# 4. Seed (super_admin + datos demo)
pnpm db:seed

# 5. Verificar
pnpm type-check
pnpm lint
pnpm test

# 6. Dev
pnpm dev
```

### Seed inicial (`prisma/seed.ts`)

```ts
// Crea:
// - 1 super_admin (email del builder/owner inicial)
// - 1 owner demo
// - 1 organization demo
// - 1 property demo "Hotel Boutique Las Flores"
// - 2 room types: Estándar (5 rooms), Suite (3 rooms)
// - Algunas reservas demo en estados variados
```

---

## 11. Dependencies

> ⚠️ Esta sección refleja el plan completo. Para el estado actual de qué está instalado vs. pendiente, ver Sección 17.

### ✅ Instaladas (Phase B0 · 22 may 2026 — scaffold inicial real)

> Nota histórica: el blueprint asumía que estas deps quedaban instaladas al cierre de Phase A. En realidad **no había `package.json` en raíz** al retomar el proyecto (solo un `designs/package.json` mal ubicado con la lista correcta). En Phase B0 se lift-eó a la raíz y se ejecutó `pnpm install`. Versiones resueltas concretas tras instalación:

```
next ^15.1.0           → 15.5.18
react ^19.0.0          → 19.2.6
react-dom ^19.0.0      → 19.2.6
react-hook-form ^7.54.2 → 7.76.0
@hookform/resolvers ^3.9.1 → 3.10.0
zod ^3.24.1            → 3.25.76
@tanstack/react-table ^8.20.5 → 8.21.3
zustand ^5.0.2         → 5.0.13   # solo para onboarding wizard
typescript ^5.6.0      → 5.9.3    (devDep)
tailwindcss ^4.0.0     → 4.3.0
@tailwindcss/postcss ^4.0.0 → 4.3.0
@types/{node,react,react-dom} (devDep)
```

**Package manager:** pnpm (campo `packageManager: pnpm@9.15.0` en package.json). No hay `corepack` ni `pnpm` global en el sistema del usuario; se usa `npx pnpm ...` para invocar.

**Phosphor:** El blueprint mencionaba "Phosphor Regular stroke 1.5". En el código real **NO hay paquete Phosphor instalado**; los iconos son SVG inline propios definidos en `components/icons.tsx` y en cada `components/<dominio>/icons.tsx`. Stroke típico: 1.5–1.7. Mantener este patrón.

### 🔄 A instalar en Phase B (data layer + auth)

| Package | Phase | Purpose |
|---------|-------|---------|
| `@prisma/client`, `prisma` | B2 | ORM |
| `@supabase/ssr`, `@supabase/supabase-js` | B4 | Auth + DB client |
| `tsx` | B2 | Run seed script |
| `supabase` (CLI, devDep) | B1 | Local CLI |

### 📋 A instalar en Phase D (pantallas restantes + i18n)

| Package | Phase | Purpose |
|---------|-------|---------|
| `next-intl` | D-i18n | i18n (es + en) |
| `@fullcalendar/react` + plugins | D-pricing | Pricing calendar visual (calendar de bookings ya está custom-built) |
| `date-fns`, `date-fns-tz` | D | Timezone-aware date math |

### 📋 A instalar en Phase E (integraciones)

| Package | Purpose |
|---------|---------|
| `resend`, `@react-email/components` | Emails transaccionales |
| `ics`, `node-ical` | iCal generator + parser |
| `dompurify`, `isomorphic-dompurify` | Sanitizar HTML descripciones |
| `sharp` | Image processing (uploads de fotos) |

### 📋 A instalar en Phase F (production hardening)

| Package | Purpose |
|---------|---------|
| `@upstash/redis`, `@upstash/ratelimit` | Rate limiting |
| `@sentry/nextjs` | Error tracking |
| `@biomejs/biome` (devDep) | Lint + format |
| `vitest`, `@vitest/ui` (devDep) | Unit + integration tests |
| `@playwright/test` (devDep) | E2E |

### Lucide / iconos
La sección 7 mencionaba Lucide; en Phase A se eligió **Phosphor Regular** stroke 1.5. Mantener Phosphor en Phase B+ — no migrar.

### Notas

- **No instalar shadcn/ui** — durante Phase A se decidió construir primitives propias para respetar la estética editorial (sin look "shadcn default"). Las primitives están **coladas dentro de `components/<dominio>/`** — no existe carpeta `components/ui/` separada.
- **No instalar lucide-react ni `phosphor-react`/`@phosphor-icons/react`** — los iconos son SVG inline propios en `components/icons.tsx` y `components/<dominio>/icons.tsx`.
- `@tailwindcss/postcss` viene incluido con tailwind v4 via plugin oficial.

---

## 12. Deployment Strategy

### Hosting

**Vercel Hobby**, plan free.
- Auto-deploy en push a `main`.
- Preview deploys en cada PR (URL único por branch).
- Environment variables: configurar TODAS en Vercel dashboard, separar por entorno (Production / Preview / Development).
- Edge runtime: middleware corre en edge.
- Node runtime: route handlers, server actions.

### CI/CD

GitHub Actions (`.github/workflows/ci.yml`):

```yaml
name: CI
on:
  pull_request:
  push: { branches: [main] }
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      # E2E solo si secrets disponibles
```

### Environments

| Env | URL | DB | Wompi | WhatsApp |
|-----|-----|----|----|----------|
| Local | `localhost:3000` | Supabase local o branch | Sandbox | Sandbox |
| Preview | `pr-X-eztadia.vercel.app` | Supabase branch | Sandbox | Sandbox |
| Production | `eztadia.com` | Supabase prod | Real | Real |

### Domain & DNS

Comprar dominio (Cloudflare Registrar recomendado, $9-15/año).

DNS config:
- `A @` → `76.76.21.21` (Vercel)
- `CNAME www` → `cname.vercel-dns.com`
- DKIM/SPF de Resend
- Verificación de Meta para WhatsApp

### Monitoring

- **Sentry**: errors + performance.
- **Vercel Analytics**: web vitals.
- **Supabase Dashboard**: queries lentas, errors DB.
- **Upstash**: dashboard de rate limits.

---

## 13. Testing Strategy

### Unit Tests (Vitest)

- `lib/db/queries/availability.test.ts` — cálculo de disponibilidad con holds + external_blocks
- `lib/auth/permissions.test.ts` — matriz completa de `can()`
- `lib/ical/{parser,generator}.test.ts` — parse + generate iCal correcto
- `lib/wompi/verify-webhook.test.ts` — HMAC validation
- `lib/validation/*.test.ts` — schemas Zod

### Integration Tests (Vitest + DB de prueba)

- `test/integration/rls.test.ts` — **CRÍTICO**. Crea 2 owners, verifica que NO pueden ver datos del otro. Por cada tabla.
- `test/integration/booking-flow.test.ts` — create hold → confirm payment → booking confirmed.
- `test/integration/race-condition.test.ts` — 5 requests simultáneos a la última habitación → solo 1 wins.
- `test/integration/webhooks.test.ts` — Wompi webhook idempotente, WhatsApp signature.

### E2E Tests (Playwright)

- `booking-happy-path.spec.ts`: huésped reserva → PSE mock → ve confirmación.
- `owner-onboarding.spec.ts`: signup → verify email → onboarding → crear property → ver dashboard.
- `staff-permissions.spec.ts`: reception NO ve montos, NO puede cancelar.
- `manual-payment.spec.ts`: huésped sube comprobante → owner confirma → booking confirmed.

### Manual QA Checklist (pre-launch)

- [ ] Reserva PSE end-to-end con Wompi sandbox
- [ ] Reserva manual con upload comprobante
- [ ] iCal import de URL de Booking.com de prueba bloquea fechas
- [ ] iCal export es importable en Google Calendar
- [ ] WhatsApp template llega
- [ ] Email confirmación llega
- [ ] 2FA funciona
- [ ] Rate limit en login dispara tras 5 intentos
- [ ] RLS: usuario A no ve nada de B
- [ ] Reception no ve montos
- [ ] Mobile: página pública se ve bien en iPhone SE
- [ ] Lighthouse mobile > 90 en `/p/[slug]`
- [ ] Sin errores en consola

---

## 14. Skills to Use During Build

| Skill | When to Use | Why |
|-------|-------------|-----|
| `/frontend-design` | Steps 6, 12, 16, 23 — **siempre con `/designs/<pantalla>/` y `EZTADIA-DESIGN-BRIEF.md` cargados como contexto** | Diseño production-grade respetando estética editorial-orgánica |
| `/shadcn-ui` | Step 6 (setup) y cuando se necesite agregar componentes | Setup + customización (¡no usar default!) |
| `/seo-audit` | Step 12 (post-build página pública) y Step 23 (landing) | Auditar SEO antes de lanzar |
| `/playwright-cli` | Step 25 (E2E) y QA manual | Browser automation + screenshots |
| `/claude-api` | Si se agregan features con AI (descripción auto, traducción) | Patterns oficiales Anthropic |

**Flujo de trabajo cuando hay mockup en `/designs/`:**
1. Leer todos los archivos de `/designs/<pantalla>/` (imágenes + notes.md si existe).
2. Mapear elementos del mockup contra el design brief (paleta, tipografía, spacing).
3. Implementar como Server Component primero; agregar interactividad con "use client" solo donde se necesite.
4. Comparar resultado real (en `pnpm dev` + viewport 375px y 1440px) contra el mockup.
5. Si no coincide visualmente, iterar hasta que sí. **No marques el step como completo si difiere notablemente del mockup.**

**Cuando NO hay mockup:** apóyate en el brief sección 11.X correspondiente + tokens del blueprint. Si dudas, pregúntale al usuario antes de inventar estética.

Skills útiles complementarias (no críticas):
- `/run` — para arrancar el dev server y verificar visualmente.
- `/verify` — para confirmar que un cambio funciona en runtime.
- `/code-review` — antes de mergear PRs grandes.
- `/security-review` — pre-launch, sobre todo en RLS, webhooks, rate limit.

---

## 15. CLAUDE.md for Target Project

> ⚠️ **Histórico — el CLAUDE.md real ya existe en raíz** (`CLAUDE.md`, creado Phase B0 · 22 may 2026) con paths reconciliados al estado actual del código: componentes en `components/` (no `app/components/ui/`), `lib/` plano (no `lib/demo/`), iconos SVG inline propios (no Phosphor package), `EZTADIA-DESIGN-BRIEF.md` marcado como "no existe aún". La plantilla que sigue se conserva como referencia textual del intent original; **si hay conflicto, el `CLAUDE.md` en raíz manda**.

```markdown
# Eztadia

Plataforma SaaS multi-tenant para gestión de habitaciones de hoteles boutique, complejos y edificios. Por habitación, con página pública por propiedad, reservas con PSE/transferencia, WhatsApp y sincronización iCal con OTAs.

## ⚡ Estado actual (mayo 2026)

**Phase A · Frontend COMPLETO** ✅ — todas las pantallas críticas implementadas con demo data en `lib/*.ts` (flat).
**Phase B · Backend Infrastructure** 🔄 NEXT — Supabase + Prisma + RLS + Auth real. Ver `EZTADIA-BLUEPRINT.md` Sección 17 para los 18 steps detallados.

## 📐 Documentos de referencia (raíz del repo)

| Archivo / Carpeta | Para qué | Cuándo consultarlo |
|------|----------|---------------------|
| `EZTADIA-BLUEPRINT.md` | Arquitectura + roadmap. **Sección 17 supersede el Build Order original** | Siempre. Es la verdad del proyecto. |
| `EZTADIA-DESIGN-BRIEF.md` | Lenguaje visual, anti-patterns, briefs por pantalla, microcopy | Antes de tocar cualquier componente de UI |
| `DESIGN_NOTES.md` | Decisiones de diseño tomadas en Phase A con razonamiento (35 KB) | Cuando dudes por qué algo es así |
| `app/globals.css` | Sistema de diseño consolidado (CSS vars + animations) | Antes de agregar componente UI nuevo |
| `/designs/<pantalla>/` | Mockups visuales aprobados (PNG/HTML/notas) | Antes de modificar o agregar pantallas UI |
| `mockup-*.html` (raíz) | Snapshots HTML standalone — referencia de implementación previa | Si tienes duda de cómo se ve algo en práctica |

**Prioridad cuando hay conflicto:** `app/globals.css` (canónico para tokens) > `/designs/<pantalla>/` > `EZTADIA-DESIGN-BRIEF.md` > Sección 7 del blueprint (referencia, ya implementada).

## ⚠️ Reglas de la realidad actual

1. **NO toques páginas ni componentes visuales en Phase B+.** Solo capa de datos. Si el shape de demo no coincide con query real, ajusta el query.
2. **NO instales shadcn/ui.** Las primitives están coladas en `components/<dominio>/` (no hay carpeta `components/ui/` separada).
3. **NO instales lucide-react ni Phosphor.** Los iconos son SVG inline propios en `components/icons.tsx` y `components/<dominio>/icons.tsx` (stroke 1.5–1.7).
4. **Single-locale (español)** hasta Phase D. NO uses next-intl todavía.
5. **Rutas FLAT en `/dashboard/`** — multi-property con switcher viene en Phase D. No uses `/dashboard/[propertyId]/...` aún.
6. **Tabs vía query params (`?tab=...`)** en property-settings y settings personales — no nested routes.
7. **Demo data en `lib/*.ts` (flat: admin/bookings/calendar/dashboard/staff/etc.)** se reemplaza por `lib/db/queries/*` en Phase B5-B6. NO mezcles.

## Commands

- `pnpm dev` — Dev server (Turbopack)
- `pnpm build` — Production build
- `pnpm start` — Production server local
- `pnpm lint` / `pnpm lint:fix` — Biome
- `pnpm type-check` — TypeScript
- `pnpm test` — Vitest unit + integration
- `pnpm test:e2e` — Playwright
- `pnpm db:push` — Sync Prisma schema (dev)
- `pnpm db:migrate:dev` — Crear migration Prisma
- `pnpm db:generate` — Generate Prisma client
- `pnpm db:seed` — Seed (admin + demo)
- `pnpm db:studio` — Prisma Studio
- `pnpm supabase:gen-types` — Generate Supabase TS types
- `npx supabase db push` — Aplicar migrations SQL (RLS, funciones)

## Tech Stack

Next.js 15 App Router · TypeScript strict · Tailwind v4 · shadcn/ui · Supabase Postgres + Auth · Prisma · Wompi (PSE) · WhatsApp Cloud API · Resend · Upstash Redis · Cloudflare Turnstile · Vercel · pnpm · Node 20.

## Architecture

### Directory Structure
- `src/app/[locale]/` — rutas con i18n (es, en)
- `src/app/[locale]/(marketing)/` — landing pública
- `src/app/[locale]/(auth)/` — login/signup/reset
- `src/app/[locale]/p/[slug]/` — páginas PÚBLICAS de propiedad (donde reservan huéspedes)
- `src/app/[locale]/dashboard/` — owner/staff (protegido por middleware)
- `src/app/[locale]/admin/` — super_admin (protegido)
- `src/app/api/` — route handlers (webhooks, crons, uploads, iCal)
- `src/components/{ui,marketing,property-public,dashboard,shared,icons}/` — UI organizada por dominio
- `src/lib/{supabase,db,auth,wompi,whatsapp,email,ical,rate-limit,turnstile,i18n,audit,validation}/` — lógica de negocio
- `src/hooks/` — React hooks
- `src/types/` — tipos compartidos (incluye `database.ts` generado)
- `prisma/schema.prisma` — schema completo
- `supabase/migrations/` — SQL (RLS, funciones, triggers)
- `emails/` — React Email templates
- `messages/{es,en}.json` — i18n

### Data Flow
- **Lectura:** Server Components hacen queries directos vía Supabase server client. RLS aplica.
- **Escritura:** Server Actions (dashboard) o Route Handlers (públicos, webhooks). Validación Zod, audit log, revalidate.
- **Realtime:** Supabase channels para bookings live updates en el calendar.
- **Disponibilidad:** función SQL `check_availability(property_id, room_type_id, check_in, check_out)` considera bookings + holds activos + external_blocks (iCal).
- **Booking flow:** POST hold (atómico vía SQL function) → PSE link o instrucciones manuales → webhook/upload → confirmación → asignar room → email + WhatsApp.

### Key Patterns
- **Server Components por defecto.** "use client" solo cuando hay interactividad real.
- **RLS first.** Cada query asume que RLS filtra. Tests verifican el aislamiento.
- **Property-scoped permissions.** `requireProperty(propertyId)` retorna `{ user, propertyRole }`. `can(action, ctx)` autoriza.
- **i18n con locale prefix.** Todas las URLs tienen `/es/` o `/en/`. Usa `<Link>` de `@/lib/i18n/navigation`.
- **Secrets cifrados** en DB (wompi private key, whatsapp token) con `ENCRYPTION_KEY` server-side.
- **Webhooks idempotentes.** Siempre verificar si la transaction ya fue procesada antes de actuar.
- **Holds atómicos.** Crear via `create_booking_hold` function (lock + check + insert). Never lo hagas a mano.
- **Audit log** para toda acción no-trivial.
- **Rate limit + Turnstile** en cualquier endpoint público sin auth.

## Code Organization Rules

1. **Una component por archivo.** Max 300 líneas; si crece, extraer sub-components.
2. **Path alias `@/`** para imports desde root (no `src/` — el proyecto usa `app/` directo en root).
3. **Sin barrel exports** (`index.ts` re-export). Importa desde la fuente.
4. **Server Components por defecto.** "use client" solo cuando se necesita estado/efectos/handlers.
5. **Colocate.** Componentes específicos de una página viven cerca de la page (ej: `app/dashboard/calendar/components/`).
6. **Strict TypeScript.** Sin `any`. Sin `as` excepto cuando es genuinamente necesario y justificado.
7. **Zod en TODA Server Action y route handler.** Entrada validada, errores tipados.
8. **Money en cents.** Nunca uses float para dinero. `total_cents` (INT).
9. **Dates en UTC en DB, render en `America/Bogota`.** Usa `date-fns-tz` (se instala en Phase D, por ahora hardcodear timezone está OK).
10. **Strings hardcoded en español** hasta Phase D. NO uses `useTranslations()` todavía — next-intl entra en D15.

## Design System

**Para el detalle completo lee `EZTADIA-DESIGN-BRIEF.md`.** Resumen accionable:

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
- Iconos: Phosphor regular o Lucide, stroke 1.25-1.5px
- Mobile-first responsive

### Anti-patterns (NO HACER — lista corta, ver brief para 12 completos)
- ❌ Sidebar negra con íconos mini
- ❌ KPI cards en grid 2x2 con % verde/rojo
- ❌ Gradientes morados / glassmorphism / neón
- ❌ Botones con shine animado
- ❌ Emojis decorativos (✨🚀💎)
- ❌ Loading spinners (usa skeletons)
- ❌ Look "shadcn default" — customizar siempre

## Environment Variables

Ver `.env.example`. Resumen crítico:
- `DATABASE_URL` / `DIRECT_URL` — Supabase Postgres
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL`
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`
- `META_APP_SECRET` / `META_VERIFY_TOKEN`
- `CRON_SECRET` (32+ chars)
- `ENCRYPTION_KEY` (64 hex chars = 32 bytes)
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SENTRY_DSN`

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
16. **Server Components por defecto.** "use client" requiere justificación.
17. **Secrets de terceros (Wompi, WhatsApp) van cifrados en DB**, nunca en plaintext.
18. **Cron endpoints validan `CRON_SECRET`** antes de hacer cualquier cosa.
19. **Una sola fuente de verdad para disponibilidad:** `check_availability` (SQL function). No reimplementar la lógica en TS.

### Reglas heredadas de Phase A (canónicas — NO violar)

20. **NO instalar shadcn/ui ni lucide-react ni Phosphor.** Primitives propias coladas en `components/<dominio>/`. Iconos = SVG inline propios en `components/icons.tsx` y `components/<dominio>/icons.tsx`.
21. **NO usar `#FFF` como page background.** Siempre `--cream #FBF8F2`. Blanco es solo para cards.
22. **Sombras casi inexistentes.** Preferir hairlines `border 1px var(--rule)`.
23. **Nombres de propiedad SIEMPRE en Fraunces italic.** Precios y métricas grandes en Fraunces oldstyle.
24. **`--terracotta` solo para CTAs *importantes*** (Reservar, Pagar, Comenzar). NO para botones cotidianos.
25. **Mantener single-locale (es)** hasta Phase D. NO hardcodear infraestructura i18n todavía.
26. **Rutas dashboard FLAT** hasta Phase D-13. NO refactorizar a `/dashboard/[propertyId]/...` aún.
27. **Tabs vía `?tab=...`** en property-settings y settings personales. NO crear nested routes.
28. **Anti-patterns visuales** (12 explícitos en design brief) son NO NEGOCIABLES en cualquier UI nueva.
```

---

## 16. Reglas No Negociables (a nivel proyecto)

1. **TypeScript strict, sin `any`.** Si necesitas escapar tipos, justifica en comentario.
2. **RLS en todas las tablas.** Cada nueva tabla incluye policies en la misma migration.
3. **Money en `INT cents`. Dates en `TIMESTAMPTZ` UTC en DB.** Conversión a `America/Bogota` solo en render.
4. **Validación Zod en cada endpoint público y Server Action.** Errores tipados con códigos.
5. **Webhooks verifican HMAC + idempotencia.** Sin excepción.
6. **Holds y conversiones hold→booking son atómicos.** SQL functions, nunca lógica fragmentada en TS.
7. **Rate limit + Turnstile en endpoints anónimos.** Login, signup, booking, password reset, uploads públicos.
8. **Secrets de terceros cifrados en DB.** Plaintext = crítico.
9. **Audit log en cambios sensibles.** Booking cancel, payment refund, price change, role change, property delete.
10. **i18n obligatoria.** Sin strings hardcodeados.
11. **Mobile-first.** Diseñado para 375px primero, escala a desktop.
12. **Server Components por defecto.** "use client" justificado.
13. **Tests RLS obligatorios.** Aislamiento entre tenants es lo más importante.
14. **No commits con `.env*`.** `.gitignore` cubre esto, no override.
15. **CLAUDE.md siempre actualizado.** Cuando se cambien convenciones, actualizar primero el CLAUDE.md.

---

## Apéndice A: Estructura visual de pantallas clave (ASCII)

### `/p/[slug]` (página pública propiedad)

```
┌─────────────────────────────────────────────────────────────┐
│  eztadia         [es ▼]                                    │
├─────────────────────────────────────────────────────────────┤
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║                                                       ║  │
│  ║           [Cover image — full bleed]                  ║  │
│  ║                                                       ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                              │
│  Hotel Boutique Las Flores              (Fraunces, 48px)    │
│  ★ 4.9 · Cartagena, Colombia                                │
│                                                              │
│  [Descripción rica…]                                         │
│                                                              │
│  Amenities: 🛜 Wifi · 🅿 Parking · 🏊 Pool · ☕ Breakfast   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Selecciona fechas                                      │ │
│  │  [📅 Check-in]    [📅 Check-out]    [Adultos -2+]      │ │
│  │  [Buscar disponibilidad]                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Habitaciones disponibles                                   │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │ [foto]                  │  │ [foto]                  │  │
│  │ Suite Marina            │  │ Estándar Doble          │  │
│  │ 1 King · 2 personas     │  │ 2 Doubles · 4 personas  │  │
│  │ COP $450.000 / noche    │  │ COP $280.000 / noche    │  │
│  │ [Reservar]              │  │ [Reservar]              │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                              │
│  [Mapa estático]                                            │
│                                                              │
│  © Hotel Boutique Las Flores · Powered by Eztadia         │
└─────────────────────────────────────────────────────────────┘
```

### `/dashboard/properties/[id]/calendar`

```
┌─────────────────────────────────────────────────────────────┐
│ Eztadia  [Property: Las Flores ▼]   👤 Carlos · 🔔 ⚙       │
├─────────────────────────────────────────────────────────────┤
│ ☰ │  Las Flores                                              │
│ Resumen │ Reservas │ [Calendario] │ Habitaciones │ ...      │
│         ├─────────────────────────────────────────────────  │
│ 📊 Resumen                                                   │
│ 📅 Calendario  Mayo 2026                  [< Hoy >]         │
│ 🛏 Habitaciones                                              │
│ 💰 Precios     Hab\Día   1   2   3   4   5   6   7  ...    │
│ 👥 Staff       ─────────────────────────────────────────    │
│ 🔌 Integr.     101      ░░░░████████░░░░░░░░░░             │
│ ⚙ Settings    102      ████░░░░░░░░░░████████░░             │
│                103      ░░░░░░░░░░██████░░░░░░             │
│                Suite-A  ████████████████░░░░░░             │
│                ...                                          │
│                                                             │
│                Leyenda: ██ Confirmada  ░░ Disponible        │
│                        ▒▒ Hold pago    ▓▓ OTA bloqueada    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### `/p/[slug]/booking/[holdId]/pay` (PSE)

```
┌─────────────────────────────────────────────────────────────┐
│  eztadia                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Confirma tu reserva                                         │
│                                                              │
│  Hotel Boutique Las Flores                                  │
│  Suite Marina · 3 noches                                    │
│  Check-in: 15 jun 2026  Check-out: 18 jun 2026              │
│                                                              │
│  Total: COP $1.350.000                                      │
│                                                              │
│  ⏱  Tu reserva expira en 14:32                              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🏛 Pagar con PSE]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ¿Problemas con el pago? Contáctanos por WhatsApp           │
└─────────────────────────────────────────────────────────────┘
```

---

## Apéndice B: Próximos pasos (post-MVP)

Cosas que NO van en el MVP pero el diseño las soporta:

- **Cuentas de huésped** (futuro)
- **Mensajes en plataforma** (chat owner ↔ guest sin WhatsApp)
- **Channel Manager** activo (no solo iCal, sino API direct con Booking)
- **Reportes avanzados** (RevPAR, ADR, ocupación histórica)
- **Múltiples idiomas adicionales** (pt, fr para destinos turísticos)
- **Dynamic pricing** (sugerencias por IA)
- **Reviews de huéspedes**
- **Cobro por feature** (suscripción cuando crezca, modelo SaaS B2B)
- **Apps móviles** owner/reception (React Native, reusando backend)

---

---

## 17. ESTADO ACTUAL Y PHASE B ROADMAP

> Última actualización: 22 mayo 2026
> Esta sección **supersede el Build Order original (Sección 9)**.
> Sección 9 se conserva como referencia arquitectónica.

### 17.1 · Phase A: Frontend (COMPLETO ✅)

> **Reconciliado 22 may 2026** — el código es la verdad. Esta estructura ya NO menciona idealizaciones del blueprint original que no existían en disco. Diferencias clave vs. snapshots anteriores: componentes en `components/` (raíz, no `app/components/`), `lib/` plano (no `lib/demo/`), no hay route groups `(auth)`, designs = 13 archivos HTML planos en `designs/` (no 16 subcarpetas), ornamentos = un solo archivo `components/shared/Ornaments.tsx` (no carpeta dedicada). `EZTADIA-DESIGN-BRIEF.md` referenciado por el blueprint **no existe aún** en el repo.

#### Estructura real del proyecto

```
eztadia/
├── app/                                # Next.js 15 App Router (sin /[locale]/, sin src/)
│   ├── globals.css                     # ⭐ Sistema de diseño compartido (CSS vars + Tailwind v4 @theme)
│   ├── layout.tsx                      # Root layout
│   ├── page.tsx                        # / landing
│   ├── not-found.tsx                   # 404 boundary
│   ├── error.tsx                       # 500 boundary
│   ├── forbidden/page.tsx              # 403
│   │
│   ├── p/[slug]/
│   │   ├── page.tsx                    # Página pública propiedad
│   │   └── booking/
│   │       ├── new/page.tsx            # Form datos del huésped
│   │       └── [holdId]/
│   │           ├── pay/page.tsx        # PSE / transferencia manual
│   │           └── status/page.tsx     # Confirmed / waiting / failed
│   │
│   ├── login/page.tsx                  # ⚠️ Sin route group (auth) — rutas directas
│   ├── login/2fa/page.tsx
│   ├── signup/page.tsx
│   ├── reset-password/page.tsx
│   ├── reset-password/[token]/page.tsx
│   │
│   ├── onboarding/
│   │   └── page.tsx                    # Wizard 3 steps + welcome screen
│   │
│   ├── dashboard/                      # Owner — rutas FLAT (no /properties/[id]/)
│   │   ├── layout.tsx                  # Sidebar + topbar
│   │   ├── page.tsx                    # Overview
│   │   ├── calendar/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── staff/page.tsx
│   │   ├── integrations/page.tsx
│   │   ├── integrations/wompi/page.tsx
│   │   ├── property-settings/page.tsx  # Tabs vía ?tab=... query param
│   │   └── settings/page.tsx           # Personal — ?tab=...
│   │
│   └── admin/                          # super_admin
│       ├── layout.tsx                  # Variante con badge "ADMIN" gold
│       ├── page.tsx                    # Overview
│       └── users/page.tsx              # Lista + drawer
│
├── components/                         # ⚠️ EN RAÍZ, no en app/. Sin carpeta ui/ separada — primitives coladas por dominio.
│   ├── icons.tsx                       # Iconos SVG inline globales (NO Phosphor package)
│   ├── admin/ {AdminShell, icons, overview/*, users/*}
│   ├── auth/ {AuthSplitLayout, Banner, LoginForm, OTPInput, PasswordStrength,
│   │         ResetNewForm, ResetRequestForm, SignupForm, TwoFAForm, fields, icons}
│   ├── booking-flow/ {BookingFlowTopbar, BookingForm, Countdown, Dropzone,
│   │                  PaySectionManual, PaySectionPSE, StatusScreen, Stepper,
│   │                  SummaryCard, icons}
│   ├── bookings/ {BookingDetailDrawer, BookingsCards, BookingsPageClient,
│   │              BookingsTable, BookingsToolbar, icons, pills}
│   ├── calendar/ {BookingPopover, CalendarPageClient, CalendarToolbar, Legend,
│   │              MobileCalendarList, MonthSummaryPanel, PropertyTabs, ResourceTimeline}
│   ├── dashboard/ {AttentionList, DashboardShell, Greeting, Sidebar, Topbar,
│   │               UpcomingCheckIns, WeekPulse, icons}
│   ├── integrations/ {ComingSoon, IntegrationCards, WompiConfigForm}
│   ├── landing/ {Closing, Features, Footer, Hero, HowItWorks, Pricing,
│   │             PropertyTypes, Quote, Topbar, TrustBar}
│   ├── onboarding/ {NumberStepper, OnboardingShell, OnboardingWizard, PhotoUpload,
│   │                Step1Org, Step2Property, Step3Rooms, Stepper, TypeRadioCards,
│   │                WelcomeFinal, icons}
│   ├── personal-settings/ {SettingsContent, SettingsTabs, TwoFAModal, icons,
│   │                       tabs/{Billing, Language, Notifications, Profile,
│   │                              Security, Sessions}Tab}
│   ├── property/ {BookingProvider, BookingWidget, DateRangePicker, MobileBookingCTA,
│   │              PhosphorIcons, PropertyAmenities, PropertyDescription,
│   │              PropertyFAQ, PropertyGallery, PropertyHero, PropertyMap,
│   │              PropertyRooms, PropertyTopbar}
│   ├── property-settings/ {SaveBar, SettingsContent, SettingsTabs, icons,
│   │                       primitives, tabs/{Advanced, Amenities, Fiscal, General,
│   │                                          Identity, Photos, Policies, Schedules}Tab}
│   ├── shared/ {ConfirmDialog, DotsLoader, EmptyState, ErrorState, ErrorToast,
│   │            InlineFieldError, LoadingButton, OfflineBanner, Ornaments, Skeleton}
│   │            # Ornaments.tsx contiene TODOS los SVG ornamentales en un solo archivo
│   └── staff/ {InviteModal, MemberCard, RolePill, StaffPageClient, icons}
│
├── lib/                                # ⚠️ TODO ES DEMO DATA por ahora — FLAT, no lib/demo/
│   ├── admin.ts · booking-flow.ts · bookings.ts · calendar.ts
│   ├── dashboard.ts · format.ts · integrations.ts · onboarding-store.ts
│   ├── personal-settings.ts · properties.ts · property-settings.ts · staff.ts
│   # En Phase B5-B6 esto se reemplaza por lib/db/queries/* y lib/db/mutations/*
│
├── designs/                            # 13 archivos HTML planos (NO subcarpetas por pantalla)
│   ├── mockup.html                     # Index general
│   └── mockup-{admin, auth, booking-flow, bookings, calendar, dashboard,
│                onboarding, personal-settings, property-settings, property,
│                staff-integrations, states-catalog}.html
│   # ⚠️ designs/package.json existía mal ubicado y fue lift-eado a la raíz como package.json (Phase B0)
│
├── DESIGN_NOTES.md                     # ⭐ 35 KB · Decisiones de diseño con razonamiento
├── EZTADIA-BLUEPRINT.md                # Este archivo (MAYÚSCULAS — Linux/Vercel es case-sensitive)
├── CLAUDE.md                           # Instrucciones para Claude Code (creado Phase B0)
├── README.md
├── package.json                        # Creado Phase B0 (22 may 2026) — antes solo existía en designs/
├── pnpm-lock.yaml                      # Generado por pnpm install
├── tsconfig.json · next.config.ts · postcss.config.mjs · .gitignore
└── (NO existe aún: EZTADIA-DESIGN-BRIEF.md, tailwind.config.ts — Tailwind v4 vive solo en CSS)
```

#### Sistema de diseño consolidado (canónico)

CSS vars en `app/globals.css` + Tailwind v4 `@theme` tokens:

```css
/* Paleta tierra */
--cream: #FBF8F2;        /* bg principal — NUNCA #FFF como page bg */
--paper: #FFFFFF;        /* cards y superficies elevadas */
--linen: #F2EDE2;        /* bg alterno, hover states */
--ink: #1F1B16;          /* texto principal (negro cálido) */
--ink-soft: #5A5147;
--ink-muted: #8B8275;
--sage: #5C7567;         /* primary */
--sage-soft: #9CB39E;
--sage-tint: #E5EDE5;
--terracotta: #C76F4C;   /* accent — solo CTAs importantes */
--clay: #A85A3B;
--gold: #B8923E;
--gold-dark: #8A6E2E;    /* añadido en Phase A */
--gold-tint: rgba(184, 146, 62, 0.14);  /* rgba para overlay sin re-blend */
--rule: #E5DFD3;
--rule-strong: #D4CCB9;
--success: #5E8A5F;
--warning: #C49A3C;
--danger: #A8483C;
--info: #5B7B96;

/* Radius (Phase A definitive) */
--radius-xs: 6px;
--radius-sm: 10px;
--radius: 14px;
--radius-md: 20px;
--radius-lg: 28px;
--radius-xl: 40px;
--radius-pill: 999px;

/* Shadows (4 niveles definitivos) */
--shadow-soft: ...
--shadow-pop: ...
--shadow-drawer: ...
--shadow-modal: ...

/* Animaciones globales */
@keyframes hero-fade { ... }
@keyframes pulseSoft { ... }
@keyframes shimmer { ... }
@keyframes dotpulse { ... }   /* spinner de 3 puntos en botones loading */
```

Fuentes:
- **Fraunces Variable** (Google Fonts) — display, italics nombres propiedad, oldstyle nums
- **Inter Variable** (ss01 + cv11) — UI body
- **JetBrains Mono** — códigos de reserva, IDs

Tokens:
- Spacing scale 4px: 4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128, 160
- Iconografía: Phosphor Regular stroke 1.5
- Ornamentos SVG agrupados en `components/shared/Ornaments.tsx` (un solo archivo, uno por estado: empty-bookings, empty-properties, search, 404, 500, locked, etc.)

#### Páginas implementadas (con demo data)

```
✅ /                              Landing pública
✅ /p/[slug]                      Propiedad pública (Casa Marina demo)
✅ /p/[slug]/booking/new          Form de datos
✅ /p/[slug]/booking/[holdId]/pay Pago PSE / manual + upload comprobante
✅ /p/[slug]/booking/[holdId]/status (3 variantes: confirmed/waiting/failed)
✅ /login + /login/2fa
✅ /signup
✅ /reset-password + /reset-password/[token]
✅ /onboarding                    Wizard 3 steps + welcome
✅ /dashboard                     Overview con greeting editorial + accionables + métricas
✅ /dashboard/calendar            Resource timeline custom (no FullCalendar)
✅ /dashboard/bookings            TanStack Table + drawer detalle
✅ /dashboard/staff               Cards horizontales + invitar modal
✅ /dashboard/integrations        Wompi / WhatsApp / iCal cards
✅ /dashboard/integrations/wompi  Detail con form de credenciales
✅ /dashboard/property-settings   8 tabs vía ?tab=... (General, Identidad, Fotos, Amenities, Políticas, Horarios, Domicilio fiscal, Avanzado)
✅ /dashboard/settings            6 tabs vía ?tab=... (Perfil, Seguridad, Sesiones, Notificaciones, Idioma, Plan)
✅ /admin                         Métricas globales + feed eventos + top propiedades
✅ /admin/users                   Tabla + drawer + filtros
✅ /forbidden + not-found.tsx + error.tsx
```

#### Sistema de estados secundarios (componentes reutilizables)

- `<EmptyState ornament="..." title="..." body="..." cta={{...}} />`
- `<ErrorState variant="404|500|403|offline" />`
- `<LoadingSkeleton variant="table|calendar|drawer|page" />`
- `<ConfirmDialog destructive title="..." body="..." confirmLabel="..." onConfirm={...} />`

---

### 17.2 · Phase B: Backend Infrastructure (NEXT — 18 steps detallados)

**Objetivo:** Reemplazar demo data por backend real (Supabase + Prisma + RLS) **sin tocar las URLs ni romper el layout visual**. El frontend está hecho. Phase B lo enchufa a datos reales.

**Tiempo estimado:** 16-24 horas de trabajo focado.

#### B1. Setup Supabase project (30 min)

```bash
# 1. Crear proyecto Supabase (free tier, región us-east-1)
#    https://supabase.com/dashboard/projects → New project
#    Anotar: project ref, anon key, service role, DB password.

# 2. Instalar CLI local
pnpm add -D supabase
npx supabase init
npx supabase link --project-ref <ref>

# 3. .env.local
cat > .env.local << 'EOF'
DATABASE_URL=postgres://...?pgbouncer=true
DIRECT_URL=postgres://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_PROJECT_ID=xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# 4. Agregar .env.local a .gitignore (verificar)
```

**Deliverable:** Supabase dashboard accesible, env vars cargadas.

#### B2. Schema Prisma + tipos (1-2 h)

```bash
pnpm add -D prisma tsx
pnpm add @prisma/client
npx prisma init --datasource-provider postgresql
```

Copiar el schema completo de Sección 4 a `prisma/schema.prisma`. Modelos críticos: profiles, organizations, properties, property_users, room_types, rooms, seasonal_rates, bookings, booking_holds, payments, ical_feeds, external_blocks, wompi_configs, whatsapp_configs, whatsapp_messages, email_logs, audit_logs, login_events.

```bash
pnpm db:push           # primera sincronización rápida
pnpm db:generate       # generar @prisma/client
```

**Deliverable:** Esquema visible en Supabase Studio, `node_modules/.prisma/client` generado.

#### B3. RLS policies + SQL functions (2-3 h)

Crear migration manual en `supabase/migrations/0002_rls_policies.sql` con todo el contenido de Sección 4 del blueprint:

- Helpers `auth.is_super_admin()`, `auth.has_property_access(id)`, `auth.property_role(id)`
- Policies para CADA tabla con SELECT/INSERT/UPDATE/DELETE diferenciadas
- Trigger `handle_new_user` para auto-crear profile al signup
- Function `check_availability(property_id, room_type_id, check_in, check_out)`
- Function `create_booking_hold(...)` con `FOR UPDATE` + verificación atómica
- Function `expire_old_holds()` para cron

```bash
npx supabase db push
```

**Deliverable crítico:** test manual en Supabase Studio — crear 2 users de prueba, verificar que User A no ve bookings de User B.

#### B4. Supabase Auth real (reemplazar mock auth) (2-3 h)

```bash
pnpm add @supabase/ssr @supabase/supabase-js
```

Crear `lib/supabase/`:
- `client.ts` — browser client (anon)
- `server.ts` — server client (cookies)
- `admin.ts` — service role (solo casos puntuales)
- `middleware.ts` — refresh session helper

Crear `middleware.ts` en root para refresh + route guards (proteger `/dashboard` y `/admin`).

Reemplazar las páginas auth existentes:
- `/login` — Server Action que llama `supabase.auth.signInWithPassword`
- `/signup` — Server Action `signInWithEmail` + auto-trigger crea profile
- `/reset-password` — `resetPasswordForEmail`
- `/login/2fa` — `supabase.auth.mfa.challengeAndVerify`

**Importante:** mantener exactamente el mismo layout/estilo visual. Solo cambiar la lógica.

**Deliverable:** signup real → email de verificación llega → login → redirect a /dashboard. RLS aísla datos por usuario.

#### B5. Data layer · queries (3-4 h)

Crear `lib/db/`:

```
lib/db/
├── index.ts                    # Prisma client singleton
├── queries/
│   ├── property.ts             # getProperty, getPropertyBySlug
│   ├── rooms.ts                # getRoomTypes, getRooms
│   ├── bookings.ts             # listBookings, getBooking
│   ├── availability.ts         # checkAvailability (llama a SQL function)
│   ├── staff.ts                # listStaff
│   └── admin.ts                # globalStats, listUsers
└── mutations/
    ├── bookings.ts             # createHold, confirmBooking, cancelBooking
    ├── payments.ts             # confirmManualPayment
    ├── properties.ts           # createProperty, updateProperty
    └── staff.ts                # inviteStaff, updateRole, removeStaff
```

Cada query/mutation:
- Usa `lib/supabase/server.ts` (NUNCA admin.ts en código que se ejecuta por user)
- Aplica RLS automáticamente
- Devuelve tipos derivados de Prisma
- Maneja errores con clases tipadas en `lib/errors.ts`

#### B6. Reemplazar demo data en páginas (2-3 h)

Para cada página actual, reemplazar imports de `lib/*.ts` (flat, demo) por imports de `lib/db/queries/*`:

```
app/dashboard/page.tsx          → getStatsForOverview()  reemplaza a `@/lib/dashboard`
app/dashboard/calendar/page.tsx → listBookingsForCalendar(propertyId, month)  reemplaza a `@/lib/calendar`
app/dashboard/bookings/page.tsx → listBookings({ filters })  reemplaza a `@/lib/bookings`
app/dashboard/staff/page.tsx    → listStaff(propertyId)  reemplaza a `@/lib/staff`
app/admin/page.tsx              → getGlobalStats()  reemplaza a `@/lib/admin`  (verifica super_admin)
app/admin/users/page.tsx        → listUsers({ filters })  reemplaza a `@/lib/admin`
app/p/[slug]/page.tsx           → getPropertyBySlug(slug) public  reemplaza a `@/lib/properties` (con service role para campos públicos)
```

**Truco:** mantener la SHAPE de los datos igual. Si `getStatsForOverview()` devuelve el mismo shape que el demo, no hay que tocar el componente.

#### B7. Server Actions para mutaciones (2 h)

Crear Server Actions en `app/<ruta>/actions.ts` (Next.js 15 convention):

```typescript
// app/dashboard/bookings/[id]/actions.ts
'use server'
import { z } from 'zod'
import { confirmManualPayment } from '@/lib/db/mutations/payments'
import { requireProperty } from '@/lib/auth/session'

const ConfirmSchema = z.object({
  bookingId: z.string().uuid(),
  proofUrl: z.string().url(),
})

export async function confirmPaymentAction(input: z.infer<typeof ConfirmSchema>) {
  const data = ConfirmSchema.parse(input)
  const { user, propertyRole } = await requireProperty(data.bookingId)
  if (!can('payment:confirm', { user, propertyRole })) throw new Error('FORBIDDEN')
  return await confirmManualPayment(data.bookingId, data.proofUrl, user.id)
}
```

Conectar a los botones existentes de las pantallas (los componentes ya tienen los handlers, solo apuntarlos a estas actions).

#### B8. Zod validation schemas (1 h)

Crear `lib/validation/`:
- `booking.ts` — createBookingSchema, cancelBookingSchema
- `property.ts` — createPropertySchema, updatePropertySchema
- `room.ts` — roomTypeSchema, roomSchema
- `user.ts` — signupSchema, inviteStaffSchema
- `payment.ts` — confirmPaymentSchema

Compartidos entre Server Actions y formularios cliente (RHF resolver).

#### B9. Auth session helpers (1 h)

`lib/auth/session.ts`:
```typescript
export async function getSession()              // returns user | null
export async function requireSession()          // throws if no user
export async function requireRole(role: UserRole)
export async function requireProperty(propertyId: string)
  // returns { user, profile, propertyRole }
```

`lib/auth/permissions.ts`:
- Implementar `can(action, ctx)` con la matriz de Section 8 del blueprint
- 18 acciones tipadas

#### B10. RLS isolation tests (CRÍTICO — 1-2 h)

```bash
pnpm add -D vitest @vitest/ui
```

Crear `tests/integration/rls.test.ts`:
- Helper que crea 2 owners + 2 properties via service role
- Por cada tabla, verificar:
  - Owner A NO puede leer datos de B
  - Owner A puede leer sus propios datos
  - Super admin lee todo

Este test es **obligatorio antes de seguir a Phase C**. Sin él no hay garantía de aislamiento.

#### B11-B18 · Integraciones backend pendientes (más allá de Phase B core)

```
B11. /api/webhooks/wompi/route.ts        # HMAC verify + idempotency + crear booking
B12. /api/upload/payment-proof/route.ts  # Supabase Storage
B13. /api/upload/property-photo/route.ts # Supabase Storage + sharp
B14. /api/cron/expire-holds/route.ts     # Llama expire_old_holds()
B15. /api/ical/[propertyId]/[secret].ics # Export iCal
B16. Audit log helper (lib/audit/log.ts)
B17. vercel.json con cron schedule */5 * * * *
B18. Verificar que el flujo público end-to-end funciona con backend real (booking → hold → pago → confirmed)
```

---

### 17.3 · Phase C: Wire frontend a backend (resumen)

**Objetivo:** Eliminar/migrar TODOS los archivos demo flat en `lib/` (admin.ts, bookings.ts, booking-flow.ts, calendar.ts, dashboard.ts, integrations.ts, onboarding-store.ts, personal-settings.ts, properties.ts, property-settings.ts, staff.ts; `format.ts` se preserva como utility puro).

- C1. Auditar uso de `@/lib/{admin,bookings,calendar,...}` (grep en codebase)
- C2. Migrar página por página (orden: dashboard → bookings → calendar → admin → public)
- C3. Loading states reales (suspense boundaries + skeletons existentes)
- C4. Error boundaries reales (componente `<ErrorState>` ya existe)
- C5. Realtime: implementar `useRealtimeBookings(propertyId)` hook con Supabase Channels
- C6. Eliminar los `lib/<dominio>.ts` demo cuando ya no haya imports (conservar `lib/format.ts` y `lib/onboarding-store.ts` si siguen siendo útiles como UI store)

---

### 17.4 · Phase D: Build pantallas restantes + multi-property + i18n

**Objetivo:** Cerrar las funcionalidades placeholder.

#### Pantallas pendientes (orden de prioridad)

| # | Ruta | Notas |
|---|------|-------|
| D1 | `/dashboard/rooms` | Gestión de habitaciones individuales + tipos. Reutiliza componentes existentes |
| D2 | `/dashboard/pricing` | Calendario de precios + seasonal_rates. Usar FullCalendar customizado |
| D3 | `/dashboard/messages` | Bandeja WhatsApp. Lista conversaciones + thread + composer |
| D4 | `/dashboard/reports` | Ocupación, ADR, RevPAR. Reutiliza patrón editorial sin "KPI cards genéricos" |
| D5 | `/admin/properties` | Tabla similar a `/admin/users` |
| D6 | `/admin/bookings` | Tabla global de reservas |
| D7 | `/admin/audit-logs` | Feed de eventos del sistema |
| D8 | `/admin/emails` | Logs Resend |
| D9 | `/admin/whatsapp` | Logs Meta Cloud API |
| D10 | `/admin/webhooks` | Logs de webhooks |
| D11 | `/admin/errors` | Link a Sentry |
| D12 | Detalle de integraciones WhatsApp e iCal (Wompi ya está) |

#### Multi-property con property switcher

- D13. Agregar `<PropertySwitcher>` en sidebar (combobox foto + nombre Fraunces italic)
- D14. Decidir entre 2 estrategias:
  - **A. URLs con `[propertyId]`:** refactorizar a `/dashboard/[propertyId]/...` — MÁS REST, mejor SEO interno, permite deep links
  - **B. Context store con Zustand:** mantener URLs flat, propertyId en contexto global — menos refactor

Recomendado: **A** si el refactor es manejable. Mantiene URLs limpias y permite que cada owner abra varias propiedades en pestañas.

#### i18n

- D15. `pnpm add next-intl`
- D16. Mover `app/*` → `app/[locale]/*`
- D17. Crear `messages/{es,en}.json` con TODOS los strings
- D18. Pasar TODO el copy hardcoded a `useTranslations()`
- D19. Language switcher en topbar (ya está placeholder visual)

#### Billing flow placeholder
- D20. Activar el tab de Plan + facturación en `/dashboard/settings?tab=plan` cuando se defina pricing real

---

### 17.5 · Phase E: External integrations reales

Detallado en Sección 9 (steps originales 14-19 de Build Order). Resumen:

- **E1. Wompi (PSE)** — cuenta sandbox primero, credenciales por propiedad encriptadas con `pgsodium` o `ENCRYPTION_KEY` server-side, HMAC verification de webhooks, idempotencia.
- **E2. WhatsApp Cloud API** — Meta Business setup, 5 plantillas pre-aprobadas (booking_pending_payment, booking_confirmed, payment_confirmed, check_in_reminder, review_request), webhook con `X-Hub-Signature-256`.
- **E3. iCal sync** — `node-ical` parser, `ics` generator, cron cada 15 min, considerar `external_blocks` en `check_availability`.
- **E4. Resend** — verificar dominio, plantillas React Email en `emails/`, wrapper con logging a `email_logs`.
- **E5. Cloudflare Turnstile** — invisible en login, signup, booking, reset.
- **E6. Supabase Storage** — buckets `property-photos`, `payment-proofs`, `avatars` con policies.

---

### 17.6 · Phase F: Production hardening

- **F1. Rate limiting (Upstash Redis)** — 5/15min login, 3/h signup, 10/min booking submit, 30/min availability lookup.
- **F2. Audit logs** — `lib/audit/log.ts` invocado en mutaciones críticas (cancelaciones, refunds, role changes, deletions, price changes).
- **F3. 2FA real** — Supabase Auth MFA nativo, backup codes en tabla aparte cifrados, banner persistente para owners sin 2FA.
- **F4. CSP + security headers** — configurar en `next.config.ts`.
- **F5. Sentry** — `pnpm add @sentry/nextjs`, init, source maps en CI.
- **F6. Vercel Analytics** — habilitar en dashboard.
- **F7. Test suite completa** — unit (availability, permissions, ical), integration (booking flow, webhooks), E2E (Playwright: booking happy path, owner onboarding, staff permissions).
- **F8. CI/CD** — GitHub Actions: lint + type-check + test en cada PR.
- **F9. Deploy production** — Vercel + env vars + Supabase prod + Wompi prod + WhatsApp prod.
- **F10. Dominio + DNS** — comprar `eztadia.com` o `eztadia.co`, configurar Cloudflare + DKIM/SPF de Resend + Meta verification.
- **F11. Backups** — Supabase tiene daily backups; verificar política de retención y agregar export manual semanal a S3 si se quiere extra resiliencia.

---

### 17.7 · Cómo retomar el proyecto en una sesión nueva

Cuando abras una sesión nueva de Claude Code para continuar Phase B+, mensaje sugerido:

> Estoy retomando el proyecto Eztadia. Ya tengo Phase A completa (frontend con demo data). Necesito construir Phase B (backend infrastructure).
>
> Lee primero:
> 1. `EZTADIA-BLUEPRINT.md` sección 17 (estado actual y roadmap detallado)
> 2. `DESIGN_NOTES.md` (decisiones de diseño tomadas)
> 3. `app/globals.css` (sistema de diseño consolidado)
> 4. La estructura actual de `app/` y `lib/`
>
> Empieza por B1 (Setup Supabase project). Antes de B4 (Auth real) avísame para revisar credenciales juntos.
>
> No toques páginas ni componentes visuales — solo la capa de datos. Si el shape de un demo no coincide con lo que sale del query real, ajusta el query, NO la página.

---

### 17.8 · Notas de migración (para futuras evoluciones)

**Decisiones de Phase A que pueden revisarse en el futuro:**

- **Sin shadcn/ui:** se construyeron primitives propias para la estética. Si en algún momento se quiere migrar a shadcn customizado, mantener los tokens CSS — solo cambiar componentes uno por uno.
- **Rutas dashboard flat:** funcionan asumiendo una propiedad por sesión. Phase D-13 propone refactor a `/dashboard/[propertyId]/...` cuando se active multi-property real.
- **Single-locale:** todo el copy es Spanish-only. Phase D-15..19 introduce next-intl.
- **Zustand solo en onboarding:** decisión deliberada — minimal global state. Para multi-property switcher (Phase D-13) se puede expandir zustand o usar Server Components + cookies para `activePropertyId`.
- **Mockups HTML standalone:** los archivos `mockup-*.html` en raíz son snapshots de referencia, no se sirven en producción. Son útiles para diseño iterativo + share. Mantenerlos en repo pero excluir de build (no están en `app/`).

**Fin del blueprint actualizado.** Este documento + `DESIGN_NOTES.md` + `app/globals.css` son las tres fuentes de verdad para continuar el proyecto.
