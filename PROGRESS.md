# Eztadia — Progress Log

> Última actualización: 2026-05-23 por sesión Claude Code #4 (Phase D — 5 pantallas + multi-property switcher)
> Branch: `main`  ·  Último commit (pre-sesión 4): `5ac1fa0`
> Phase activa: **D · Pantallas restantes + multi-property + i18n** — D1, D2, D5, D6, D7, D13 ✅

## 📍 Estado actual

**Phase:** D · Pantallas restantes + multi-property + i18n.
**Último step completado:** D7 `/admin/audit-logs`.
**Próximo step:** decisión usuario — opciones razonables:
- **D3 `/dashboard/messages`** (bloqueado por Phase E2 WhatsApp — UI placeholder posible)
- **D4 `/dashboard/reports`** (ocupación/ADR/RevPAR — backend ya provee data)
- **D12 detalle integraciones WhatsApp + iCal** (UI placeholder — los configs ya existen para Wompi)
- **D8/D10 admin emails/webhooks** (bloqueados — tablas email_logs/webhook_logs Phase E pending)
- **D15-D19 next-intl** (refactor grande, mejor cuando feature set esté completo)

**Bloqueado por:** Nada hard-blocks. Wompi sandbox creds sigue pendiente para smoke live PSE.

## ✅ Steps completados

Phase B (sesión 2): B1–B18 (ver historial PROGRESS sesión 2)

Phase C (sesión 3): C1–C6 + hardening (ver sesión 3)

Phase D (sesión 4):
- [x] D1 `/dashboard/rooms` — gestión rooms + room_types
- [x] D2 `/dashboard/pricing` — seasonal_rates por room_type
- [x] D5 `/admin/properties` — listing cross-tenant + detail drawer (org, owner, members, recent bookings)
- [x] D6 `/admin/bookings` — listing cross-tenant + detail drawer (estancia, huésped, habitación, pago, actividad audit)
- [x] D13 PropertySwitcher + cookie + getActivePropertyId helper (multi-property real)
- [x] D7 `/admin/audit-logs` — timeline cross-tenant + diff JSON drawer

## 🎯 Próximo step — detalle

Mi recomendación: **D4 `/dashboard/reports`** porque el backend ya provee toda la data (bookings + payments + room_types) y no depende de Phase E. **D3/D8/D10** quedan después de E2/E4. **D12** es UI placeholder buena para cerrar la suite property-owner.

D14-D19 (refactor URLs / i18n) son refactors masivos que se hacen mejor con feature set cerrado.

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesiones 1-3 — ver PROGRESS commits anteriores

### Sesión 4 (2026-05-23 night) — Phase D sprint (5 pantallas + switcher)

**D1 — `/dashboard/rooms`**
- `lib/validation/room.ts`: agregado `updateRoomTypeSchema`, `updateRoomSchema`, campo `descriptionEs` en create.
- `lib/db/queries/rooms.ts`: nuevo `listRoomTypesWithRooms()` con nested rooms ordenados por número (`localeCompare` con `{numeric:true}` para "101"<"2" no funcione mal).
- `lib/db/mutations/rooms.ts`: `createRoomType`/`updateRoomType`/`createRoom`/`updateRoom`. UNIQUE(property_id, number) → ConflictError.
- `app/actions/rooms.ts`: Server Actions con Zod + `requirePropertyRole("manager")` + `can("room.write")` + audit log + revalidate.
- Update actions hacen pequeño SELECT `property_id` antes de autorizar (RLS no permite shortcut sin saber a qué propiedad pertenece el row).
- Money input: COP enteros (sin decimales) × 100 → DB cents.
- `components/rooms/Drawer.tsx` extraído inmediatamente a `components/shared/Drawer.tsx` (D2 también lo usa).
- `RoomFormDrawer` recibe `roomTypeId` opcional → cuando viene preset desde "agregar a este tipo" lo bloquea; cuando llega desde el botón global muestra el select.

**D2 — `/dashboard/pricing`**
- **Sin FullCalendar.** El blueprint sugiere FullCalendar pero CLAUDE.md prohíbe paquetes no aprobados. La vista lista de rates con "P{n}" pill para prioridad cubre el caso real (overrides estacionales). Si más adelante se quiere mini-cal del precio efectivo por día, reusar `lib/calendar/adapter.ts`.
- Reusé `listRoomTypes()` que ya joinea seasonal_rates (no añadí query nueva).
- `app/actions/pricing.ts`: 3 Server Actions con `resolvePropertyIdForRate()` helper (resuelve property_id via JOIN para autorizar). seasonal_rates solo tiene room_type_id, no property_id.
- Format de fechas sin Date constructor (TZ shift) — parseo manual de ISO.
- Delete con `window.confirm()` inline (no usé shared/ConfirmDialog para mantener drawer simple).

**D5 — `/admin/properties`** (decisión arquitectónica clave)
- **Defense-in-depth en queries admin:** `requireSuperAdmin()` se invoca **dentro** del query, no solo en el page. Cierra el agujero "alguien importa el query desde otra ruta sin gating".
- **`createAdminClient()` con justificación documentada:** los RLS de properties/bookings/audit_logs filtran por miembro/owner, NO por super_admin (Phase B3 deliberate — defense in depth: admin pages se validan server-side y usan admin client). Patrón análogo a `logAudit`.
- **PostgREST nested count** (`.select("*, rooms(count), bookings(count)")`) — devuelve `[{count: N}]` y mi adapter lo aplana a número.
- **Sin tanstack/react-table** para esta tabla — máx ~200 rows, search + filter en memoria son suficientes. Bundle más liviano.
- **Precarga 50 details en server:** evita N+1 round trips al abrir drawer. Si la plataforma crece >50 props, refactorizar a fetch on-open via Server Action.

**D6 — `/admin/bookings`**
- **Pills basados en enum real** (`pending_payment`/`no_show`/etc). `components/admin/bookings/pills.tsx` con `BookingStatusPill` + `PaymentStatusPill` + `paymentMethodLabel`. El `StatusPill` de `components/bookings/pills.tsx` usa el demo type (`pending`/`no-show`) que NO matchea DB → no se puede reusar para data real.
- Hit del typecheck: las columnas de bookings son `adults`/`children`, NO `guests_adults`/`guests_children`.
- Detail más rico que dashboard drawer: incluye actividad `audit_logs` (resource_type IN booking|booking_hold|payment) + link al public page de la propiedad.
- 6 status chips (todos los enum + "Todas").

**D13 — Multi-property switcher** (decisión arquitectónica vía AskUserQuestion)
- **Cookie + getActivePropertyId()** elegido por usuario sobre URLs con [propertyId]. URLs siguen FLAT (`/dashboard/calendar` etc).
- `ACTIVE_PROPERTY_COOKIE = "eztadia.active_property"` httpOnly + lax + 1 año.
- `getActivePropertyId()` cached: lee cookie → valida ownership via `hasAccessToProperty()` → fallback a `getFirstAccessibleProperty()`.
- Validación silenciosa: si cookie apunta a propiedad sin acceso (revocaron), se usa fallback sin error.
- `setActivePropertyAction({propertyId})` usa `requireProperty()` para autorizar antes de set cookie + `revalidatePath("/dashboard", "layout")`.
- `app/dashboard/layout.tsx` async server component: carga `activeId` + `properties` en paralelo. Sobrescribe `snapshot.property` con la activa real desde DB; `snapshot.owner/attention/pulse/upcoming/unreadMessages` siguen demo (no migrado).
- Sidebar switcher mapea propiedades reales — `useTransition` + `router.refresh()` al cambiar. Item activa: bg sage-tint + label "Actual".
- **Trade-off:** las 5 rutas dashboard que antes eran `○ Static` ahora son `ƒ Dynamic` (layout lee cookies → invalida prerender). Aceptable.
- 6 pages migradas a `getActivePropertyId`: dashboard, calendar, bookings, rooms, pricing, integrations/wompi. Onboarding mantiene `getFirstAccessibleProperty` (semántica correcta — chequea si YA tiene cualquier propiedad para skip).

**D7 — `/admin/audit-logs`**
- audit_logs tiene RLS habilitada **sin policies SELECT** — defense in depth. logAudit() escribe con admin client; lectura cross-tenant idem (justificado).
- **Batch lookup en vez de embedded JOIN** para actor + property. PostgREST nested join requiere FK declarada; con admin + `in()` batch es más simple.
- Timeline-like UI (no tabla) — icono por resource_type categoría (booking→IconReceipt, payment→IconDollar, room→IconDoor, property→IconHouse, auth→IconKey, etc).
- Diff JSON pretty-print en `<pre>` con max-h-[40vh] scroll. No "diff visual" — overkill para Phase D early.
- Hit del typecheck: `AuditActorType` enum solo tiene `"user" | "system" | "webhook"` — eliminé `cron`/`service` de los filtros.
- Relative time con tooltip absoluto: "hace 5 min" + tooltip UTC completo.

**Refactor lateral durante sesión 4**
- `components/admin/properties/PropertyDetailDrawer.tsx` migrado a usar `BookingStatusPill` shared (eliminé `BOOKING_STATUS_LABEL` local con claves inválidas del enum como `checked_in`/`checked_out` que nunca aplicaron — runtime fallback los hacía silenciosos).
- 6 dashboard pages: `getFirstAccessibleProperty` → `getActivePropertyId` via sed (mantienen mismo shape de retorno).

## ⚠️ Lo que NO se hizo intencionalmente (deuda conocida)

### De sesiones anteriores (no resueltas aún)
1. UI para capturar `properties.contact_phone` — columna existe pero no hay form (bypass: SQL directo o D12).
2. UI para "Nueva reserva manual" desde dashboard — botón sin onClick.
3. Wompi sandbox creds — pendiente smoke live HTTP PSE.
4. Realtime live test 2-tabs no corrido.
5. Vercel deploy no hecho aún (build pasa).
6. `messages: []` en BookingDetail (Phase E2 WhatsApp).
7. `wompi_configs.is_active` column ausente.
8. `refunded` no existe en BookingStatus enum.

### Nuevas de sesión 4
9. **Mini-cal de precio efectivo por día** en `/dashboard/pricing` — futuro D2.5. Vista lista de rates cubre el use case real.
10. **Sin acción admin** sobre bookings/properties (cancelar, suspend) — admin pages son read-only (consistente con `/admin/users` scope original).
11. **Dos sets de pills** (demo + real) coexistiendo — Phase D futuro podría unificar cuando se migre `lib/bookings.ts` demo a queries reales.
12. **5 rutas dashboard ahora dynamic** (antes static): `property-settings`, `staff`, `settings`, `integrations` index, `dashboard` page. Trade-off de leer cookie multi-property en layout. Si se quiere optimizar, sacar cookie read del layout y diferirlo a las pages que lo usan.
13. **`/admin/audit-logs` sin paginación** (limit 300). Si crece, agregar keyset cursor `created_at`.
14. **`/admin/audit-logs` sin export CSV** (útil para compliance).
15. **Sidebar muestra "0 propiedades vinculadas"** si user no tiene ninguna — pero pages redirigen a /onboarding antes de mostrar el sidebar, así que solo se ve mid-revocation.
16. **`snapshot.owner/attention/pulse/upcoming/unreadMessages`** siguen demo data. Owner real wire es step separado (no-blocker).
17. **Phase A `/admin/users` + `/admin/page.tsx`** siguen demo data. NO refactor mío — preexistente.
18. **PostgREST `inet` type** se mapea a `unknown` en TS; cast `r.ip as string | null` en audit logs query. Casi siempre null en wild — acceptable.

## ❓ Preguntas abiertas para el usuario

1. **Próximo step Phase D** — recomiendo D4 reports o D12 integraciones detalle. D3/D8/D10 esperan a Phase E. D15-19 i18n son al final.
2. Wompi sandbox creds — ¿cuándo?
3. Vercel deploy — ¿hacemos preview deploy ahora?
4. `designs/package.json` ocioso — sigue committeado.

## 📂 Migrations aplicadas en remoto (10 totales — SIN cambios sesión 4)

```
supabase/migrations/
├── 20260522230100_pre_rls_housekeeping.sql
├── 20260522230200_rls_policies.sql
├── 20260522230300_booking_functions.sql
├── 20260522230400_updated_at_triggers.sql
├── 20260522230500_id_defaults.sql
├── 20260523000100_auto_link_property_owner.sql
├── 20260523000200_properties_select_via_org.sql
├── 20260523120100_hold_guest_fields.sql
├── 20260523120200_realtime_publication.sql
└── 20260523120300_properties_contact_phone.sql
```

Sesión 4 NO agregó migrations — toda la data layer reutilizó schema existente.

## 🧪 Tests / verificaciones corridas

- ✅ `pnpm typecheck` clean tras cada feature (2 hits resueltos: `JSX namespace` ya estaba ok; `adults/children` columnas en booking detail; `AuditActorType` enum values).
- ✅ `pnpm build` final: **28 rutas generadas** (antes 22, +6: rooms, pricing, admin properties, admin bookings, admin audit-logs).
- ✅ `pnpm test` — RLS isolation tests siguen passing (no regression).
- ✅ Smoke SQL via MCP:
  - Schema check room_types/rooms/seasonal_rates/audit_logs vs payload de mutations
  - RLS introspection: confirmé que `properties`/`bookings`/`audit_logs` NO tienen super_admin bypass → uso justificado de admin client (documentado en código + en este PROGRESS)
  - PostgREST nested aggregate equivalente: confirmado shape `[{count: N}]`
  - JOIN nested queries devuelven shape esperado (rows vacíos por DB poblada solo con RLS test data)
- ⏸️ Live admin pages no testeadas en browser (necesita login como super_admin local — typecheck + build + RLS introspection es la cobertura efectiva).

## 🔧 Setup de entorno actual

(Sin cambios desde sesión 3.)
- Node v26.0.0, pnpm via npx.
- Supabase CLI linkeada a `fdcgqywnwllfxpjrpako` (us-east-2).
- DB Postgres 17.6.
- Migrations totales: 10.

## 📊 Bitácora de sesiones

| # | Fecha | Horas | Steps abordados | Notas |
|---|-------|-------|-----------------|-------|
| 1 | 2026-05-22 | ~2h | B0 bootstrap + reconciliación docs + MCP config | git init, auditoría blueprint↔código, workflow continuidad. |
| 2 | 2026-05-23 AM | ~4h | B1→B18 + 7 migrations + 10 tests RLS passing | Sprint completo Phase B. |
| 3 | 2026-05-23 PM | ~4h | C1→C6 + 5 hardening commits · 3 migrations · build prod desbloqueado | Sprint Phase C + cleanup deuda. |
| 4 | 2026-05-23 night | ~4h | D1+D2+D5+D6+D7+D13 · 5 pantallas + multi-property switcher | Sprint Phase D primera ola. Decisión arquitectónica multi-property (cookie+helper) vía AskUserQuestion. Confirmación defense-in-depth admin (RLS sin super_admin bypass → admin client en queries gated). Sin migrations nuevas. |

## 📜 Historial de commits recientes (pre-sesión 4)

```
5ac1fa0 chore: PROGRESS.md sesion 3 (Phase C completa C1-C6 + hardening)
e08265a feat: properties.contact_phone + placeholder SVG (deuda C visual)
2a8f7ec feat: wire Confirmar/Rechazar pago en BookingDetailDrawer (C5 dashboard)
d836a74 feat: agrega tablas calendar a publication supabase_realtime
581ee31 feat: persist guest data en booking_holds (no mas placeholder)
8fd7be2 fix: unblock production build (7 JSX type errors + login Suspense)
8e9a268 feat(C1-C6): wire dashboard + Wompi + manual proof + realtime
f31dda1 feat(C3): wire public booking flow /p/[slug]/booking/* a data real
578d1ff chore: PROGRESS.md sesion 2 (Phase B completa B1-B18)
6f533d0 feat(B10): tests RLS aislamiento · 10/10 passing
```

(Próximo commit END-SESSION sesión 4 cerrará Phase D primera ola con este PROGRESS.md actualizado.)
