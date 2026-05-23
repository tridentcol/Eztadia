# Eztadia — Progress Log

> Última actualización: 2026-05-23 por sesión Claude Code #3 (Phase C + hardening)
> Branch: `main`  ·  Último commit: `e08265a`
> Phase activa: **C · Wire frontend a backend** → **COMPLETA** ✅

## 📍 Estado actual

**Phase:** C · Wire frontend a backend — **TODOS los steps C1→C6 cerrados** + hardening (build prod desbloqueado, guest data persistido, realtime publication, drawer payment actions, contact_phone, placeholder asset).
**Último step completado:** Phase C close + visual deuda fix.
**Próximo step:** **Phase D · Pantallas restantes + multi-property + i18n** (blueprint Sección 17.4 D1-D20).
**Bloqueado por:** Nada para arrancar Phase D. Wompi sandbox creds pendientes para smoke live de PSE (path TS verificado, HTTP no ejercido).

## ✅ Steps completados

Phase B (sesión 2):
- [x] B1–B18 (ver historial PROGRESS sesión 2)

Phase C (sesión 3):
- [x] C1 Calendar con bookings reales · commit `8e9a268`
- [x] C2 Bookings table real + KPIs + detail drawer · commit `8e9a268`
- [x] C3 Public booking flow `/p/[slug]/booking/*` · commit `f31dda1`
- [x] C4 Wompi config + payment_link generation · commit `8e9a268`
- [x] C5 Manual transfer (upload + dashboard confirm) · commits `8e9a268` + `2a8f7ec`
- [x] C6 Realtime updates en calendar + publication migration · commits `8e9a268` + `d836a74`

Hardening (sesión 3):
- [x] Build prod desbloqueado (7 JSX + login Suspense) · commit `8fd7be2`
- [x] Guest data persistido en booking_holds (no más placeholder) · commit `581ee31`
- [x] `properties.contact_phone` + placeholder SVG · commit `e08265a`

## 🎯 Próximo step — detalle

**Step:** Phase D · Pantallas restantes. Blueprint Sección 17.4:
- D1 `/dashboard/rooms` — gestión de habitaciones (lo más pegado al backend ya construido)
- D2 `/dashboard/pricing` — calendario de precios + seasonal_rates (parcial en B5 ya hay query)
- D3 `/dashboard/messages` — bandeja WhatsApp (depende E2)
- D4 `/dashboard/reports` — ocupación/ADR/RevPAR
- D5-D11 `/admin/*` — tablas globales (properties, bookings, audit_logs, etc.)
- D12 Detalle integraciones WhatsApp + iCal (Wompi config UI ya existe)
- D13 PropertySwitcher + decisión URLs vs Zustand
- D15-D19 next-intl + locale switcher
- D20 Billing tab placeholder

Mi recomendación de ordering: **D1 → D2 → D5 → D6 → D13** (priorizar features que el backend ya soporta + multi-property). D3/D9/D12-whatsapp esperan a Phase E2. D15-19 son al final.

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesión 1 (2026-05-22) — ver PROGRESS commits anteriores
### Sesión 2 (2026-05-23) — ver PROGRESS commits anteriores

### Sesión 3 (2026-05-23 PM) — Phase C sprint + hardening

**C1+C6 — Calendar real + Realtime**
- `lib/calendar/adapter.ts` convierte queries a `CalendarMonth` legacy (clamp de spans al mes, occupancy = ocupied_days × rooms / dim × totalRooms).
- `useRealtimeBookings(propertyId)` con channel `property:${id}:bookings`, escucha `postgres_changes` en bookings + booking_holds + external_blocks; **debounce 200ms** para evitar tormentas en bulk inserts (iCal sync futuro).
- **Realtime requería ALTER PUBLICATION** — migration `20260523120200_realtime_publication` agrega las 3 tablas a `supabase_realtime` (estaba vacía). Sin esto los events nunca llegaban al browser. REPLICA IDENTITY default (primary key) ya estaba ok.
- TZ Bogotá hardcodeada UTC-5 (Phase D introduce `date-fns-tz`).
- Calendar acepta `?month=YYYY-MM` para navegación entre meses.

**C2 — Bookings table real**
- `lib/bookings/adapter.ts` mapea `BookingWithJoins → BookingRow + BookingDetail`. `messages: []` (WhatsApp en E2); `history` se deriva de `audit_logs` filtrando por `resource_id = bookingId`.
- KPIs del mes calculados client-side desde `listBookings(...)` (filtro por check_in dentro del mes Bogotá).
- `room.floor` viene como `string | null` en Supabase types — el UI espera `number`; el adapter castea con `Number(...) || 0`.

**C3 — Public booking flow (commit aparte `f31dda1`)**
- Ver decisiones en commit body — adapter `buildDraftHold + buildHoldFromRow`, normalización paymentMethod (`manual` → `manual_transfer`, `PA` → `passport`), holdId como bearer token (admin client en `getHoldById`).

**C4 — Wompi**
- **Arquitectura idempotente:** `payments.raw_payload->>'hold_id'` actúa como lookup key. Si guest clickea pay 2 veces → segundo click encuentra payment existente, no crea booking duplicado. Sin necesidad de SQL function adicional (race window mínimo).
- Encryption: ya existía `lib/crypto.ts` (AES-256-GCM con `ENCRYPTION_KEY` 32 bytes). `upsertWompiConfig` encripta `private_key + events_secret`; `loadWompiCredsForProperty` (admin client) descifra para uso server-side.
- `wompi_configs` NO tiene columna `is_active` — error TS lo cazó. La sola presencia del row + private_key_encrypted indica "configurado".
- Payment link URL hardcoded `https://checkout.wompi.co/l/${id}` (no documentado oficialmente pero estable). Sandbox base `https://sandbox.wompi.co/v1`.
- **Pendiente:** Wompi sandbox creds para smoke real HTTP. El TS path está probado.

**C5 — Manual transfer**
- Endpoint público `/api/public/payment-proof/[holdId]` (anon, holdId = bearer). Convierte hold + sube comprobante en un round-trip.
- Dashboard side: drawer ya tenía botones placeholder "Confirmar pago" / "Rechazar pago" con `type="button"` sin onClick. Wire via `PaymentActions` subcomponent (useTransition + router.refresh). Sin `paymentId` quedan disabled (back-compat con demo data).
- `BookingDetail` extendido con `bookingId?` + `paymentId?` opcionales — Type addition sin breaking change.

**Hardening — build prod**
- Phase A dejaba 7 errores `Cannot find namespace 'JSX'` — React 19's `@types/react` ya no expone JSX globalmente. Fix: `import type { JSX } from "react"` en cada archivo afectado. Sin tocar visual layer.
- `/login` rompía build porque `LoginForm` usa `useSearchParams()` sin `<Suspense>` wrapper (requirement Next 15 para prerender static).
- **`pnpm build` exitoso por primera vez** en el proyecto. 22 páginas generadas. **Vercel deploy desbloqueado.**

**Hardening — guest data**
- Antes: form en `/booking/new` capturaba nombre/document pero el hold solo guardaba `email + phone`. Conversion hold→booking ponía `'Guest pendiente'`.
- Ahora: migration `20260523120100_hold_guest_fields` agrega 4 columnas a booking_holds; `create_booking_hold` SQL function recreada con 4 params nuevos al final (DROP + CREATE, no se puede cambiar signature con CREATE OR REPLACE).
- `convertHoldToBookingAndCreatePayment` ya no toma guest params — los lee del hold directo. `createHoldAction` (dashboard manual) pasa `'Reserva manual'` placeholder porque su UI todavía no captura el nombre (Phase D).

**Hardening — visual deuda final**
- `properties.contact_phone` (migration `20260523120300`) — TEXT NULL, formato libre. Adapter `contactFromProperty()` limpia digits para construir `https://wa.me/...` URL. BookingFlowTopbar + StatusScreen "Necesitas ayuda" ahora rendean número + link funcional.
- `public/placeholder-property.svg` — el adapter ya lo referenciaba (`/placeholder-property.svg`) pero el archivo no existía. SVG neutral cream + sage stroke, "Sin foto disponible" en Inter.
- `public/` dir creado (no existía).

## ⚠️ Lo que NO se hizo intencionalmente (deuda conocida)

1. **UI para capturar `properties.contact_phone`** — la columna existe + adapter la consume, pero no hay form para que el owner la ingrese. Bypass: SQL directo o esperar Phase D (D12 detalle WhatsApp).
2. **UI para "Nueva reserva manual" desde dashboard** — el botón en `/dashboard/bookings` no hace nada todavía. Phase D candidato.
3. **Wompi sandbox creds** — `createPaymentLink` está implementado pero sin creds no se puede smoke live el round-trip HTTP. Path TS verificado, conversion hold→booking+payment verificado, queda solo la llamada a Wompi.
4. **Realtime live test no corrido** — la publication está + el hook está, pero un test end-to-end "abro 2 tabs del calendar y veo el cambio" no se hizo. Auto-mode classifier bloquea `pnpm dev` background.
5. **Próximo build deploy** — el build pasa pero ningún deploy a Vercel real se hizo aún.
6. **`messages: []` en BookingDetail** — WhatsApp integration es Phase E2.
7. **Wompi `is_active` column** — `wompi_configs` NO tiene esta columna (lo descubrió TS al typecheck). Si se necesita "pausar" Wompi sin borrar config, agregar columna en futuro.
8. **`refunded` no existe en BookingStatus enum** — el calendar query y adapter ya lo skipean, pero si en algún momento se necesita el estado "refunded", hay que agregarlo al enum (Phase F refund flow).

## ❓ Preguntas abiertas para el usuario

1. **Phase D — ¿empezar por D1 (`/dashboard/rooms`)?** Es la pantalla más pegada al backend construido. Las queries para rooms+room_types ya existen.
2. **Wompi sandbox creds** — ¿cuándo se tienen? Sin ellas no se puede smoke E2E el PSE flow real.
3. **Vercel deploy** — el build pasa. ¿Hacemos un preview deploy ahora o después de D1?
4. **`designs/package.json` ocioso** — sigue committeado. Pendiente decidir si se borra (no es bloqueante).

## 📂 Migrations aplicadas en remoto (10 totales)

```
supabase/migrations/
├── 20260522230100_pre_rls_housekeeping.sql       (B3)
├── 20260522230200_rls_policies.sql                (B3 — 52 policies)
├── 20260522230300_booking_functions.sql           (B3 — check_availability, create_booking_hold, expire_old_holds)
├── 20260522230400_updated_at_triggers.sql         (B3)
├── 20260522230500_id_defaults.sql                 (B3)
├── 20260523000100_auto_link_property_owner.sql    (B10)
├── 20260523000200_properties_select_via_org.sql   (B10)
├── 20260523120100_hold_guest_fields.sql           (sesión 3 — guest_* cols + recrea create_booking_hold)
├── 20260523120200_realtime_publication.sql        (sesión 3 — supabase_realtime ADD TABLE x3)
└── 20260523120300_properties_contact_phone.sql    (sesión 3 — contact_phone TEXT)
```

## 🧪 Tests / verificaciones corridas

- ✅ `pnpm typecheck` — clean (sin nuevos errores; los 7 JSX previos resueltos).
- ✅ `pnpm build` — **22 páginas generadas (primera vez exitoso).**
- ✅ `pnpm test` — 10/10 RLS isolation tests passing (no regression).
- ✅ Smoke E2E (SQL via MCP):
  - C3: hold PSE, total_cents=75M, conversion + idempotency
  - C5: hold manual_transfer, conversion + payment + raw_payload.hold_id lookup
  - Hardening: hold con `guest_full_name='Andrea Mendoza García'` + document → booking sin placeholder
  - Realtime publication: 3 tablas listadas en `pg_publication_tables`
- ⏸️ Realtime live test (2 tabs browser) — no corrido, auto-mode blockea dev server background.
- ⏸️ Wompi sandbox HTTP test — falta creds.

## 🔧 Setup de entorno actual

(Sin cambios desde sesión 2 — ver PROGRESS commits anteriores para detalle.)
- **Node** v26.0.0, **pnpm** via `npx`.
- **Supabase CLI** linkeada a `fdcgqywnwllfxpjrpako` (us-east-2).
- **DB Postgres 17.6**.
- **Migrations totales: 10** (7 de Phase B + 3 nuevas sesión 3).

## 📊 Bitácora de sesiones

| # | Fecha | Horas | Steps abordados | Notas |
|---|-------|-------|-----------------|-------|
| 1 | 2026-05-22 | ~2h | B0 bootstrap + reconciliación docs + MCP config | Sesión cubrió git init, auditoría blueprint↔código, workflow continuidad. |
| 2 | 2026-05-23 AM | ~4h | B1→B18 + 7 migrations + 10 tests RLS passing | Sprint completo Phase B. Hallazgos: pooler us-east-2 aws-1, Prisma 6 (no 7), helpers en public, 2 gaps Prisma→SQL. |
| 3 | 2026-05-23 PM | ~4h | C1→C6 + 5 hardening commits · 3 migrations · build prod desbloqueado | Sprint completo Phase C + cleanup deuda. Hallazgos: React 19 ya no expone JSX global, supabase_realtime publication vacía por default, payment idempotency via raw_payload->>'hold_id', wompi_configs sin is_active. |

## 📜 Historial de commits recientes

```
e08265a feat: properties.contact_phone + placeholder SVG (deuda C visual)
2a8f7ec feat: wire Confirmar/Rechazar pago en BookingDetailDrawer (C5 dashboard)
d836a74 feat: agrega tablas calendar a publication supabase_realtime
581ee31 feat: persist guest data en booking_holds (no mas placeholder)
8fd7be2 fix: unblock production build (7 JSX type errors + login Suspense)
8e9a268 feat(C1-C6): wire dashboard + Wompi + manual proof + realtime
f31dda1 feat(C3): wire public booking flow /p/[slug]/booking/* a data real
578d1ff chore: PROGRESS.md sesion 2 (Phase B completa B1-B18)
6f533d0 feat(B10): tests RLS aislamiento · 10/10 passing
d9e6a1a feat(B11-B17): route handlers · webhook + uploads + cron + ical + vercel
7bc3de7 feat(B7+B6): server actions + wire critical-path pages a data real
aa8c3f2 feat(B8+B9+B16): Zod schemas + auth helpers + audit log
124a9f7 chore: descomenta ENCRYPTION_KEY y CRON_SECRET en .env.example
63c212e feat(B5): data layer · queries + mutations
b3f2105 feat(B4): Supabase Auth real (reemplaza mock)
```

(Próximo commit END-SESSION sesión 3 cerrará con este PROGRESS.md actualizado.)
