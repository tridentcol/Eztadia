# Eztadia — Progress Log

> Última actualización: 2026-05-23 por sesión Claude Code #7 (Phase E primera ola — iCal sync inbound + Storage Photos wire-up + Wompi pause/resume + deuda transversal)
> Branch: `main`  ·  Último commit (pre-sesión 7): `2e51bf0`
> Phase activa: **Phase E primera ola.** E3 (iCal sync) implementado · E6 (Storage Photos) wired-up · Wompi pause/resume listo.

## 📍 Estado actual

**Phase:** E primera ola (E3 + E6 + deuda residual). E1/E2/E4/E5 esperando creds externos.
**Último step completado:** Phase E3 iCal sync inbound + cron + UI · E6 Storage Photos wire-up · Wompi `is_active` toggle · Reports breakdown por canal · /admin/users on-demand · helpers/parsers extraídos.
**Coverage:** typecheck ✅ · build ✅ (32 rutas) · tests ✅ **53/53** (era 25 al inicio · +22 unit iCal parser, +3 external_blocks, +3 wompi_configs).

**Bloqueado por:** Nada hard-blocks para el trabajo actual. Wompi sandbox creds, Resend, Turnstile, Vercel deploy y WhatsApp Cloud setup siguen pendientes para Phase E1/E2/E4/E5.

## ✅ Steps completados

Phase B (sesión 2): B1–B18
Phase C (sesión 3): C1–C6 + hardening
Phase D primera ola (sesión 4): D1, D2, D5, D6, D7, D13
Phase D segunda ola (sesión 5): D3, D4, D8, D9, D10, D11, D12
Limpieza transversal (sesión 6): property-settings 8 tabs + admin pages reales + CSV exports + 12 RLS tests
**Phase E primera ola (sesión 7):**

- [x] **E3 iCal sync (entrante)** — `lib/ical/sync.ts` con full-sync por feed (delete-not-in + upsert), fetch con timeout 20s + cap 5MB, concurrencia 4 paralelos, skip <60s para evitar tormentas
- [x] **Parser iCal aislado** — extraído a `lib/ical/parser.ts` (sin server-only) para testabilidad
- [x] **`/api/cron/ical-sync`** route con Bearer CRON_SECRET + audit log + maxDuration 60s
- [x] **vercel.json** cron `*/15 * * * *` para ical-sync
- [x] **node-ical** instalado · `serverExternalPackages: ["node-ical"]` para evitar BigInt error en page-data collection
- [x] **Botón "Sincronizar ahora"** en feeds inbound + Server Action `syncIcalFeedNowAction` (cierra deuda #16)
- [x] **E6 Storage Photos wire-up** — Server Actions upload/delete/setCover/reorder en `app/actions/photos.ts`; PhotosTab acción-inmediata; gallery jsonb + cover_image_url sync atómico
- [x] **Wompi `is_active` migration** aplicada vía MCP + repo file `20260524010000_wompi_configs_is_active.sql`
- [x] **Wompi pause/resume** — `setWompiActiveAction` + toggle optimista en UI + `loadWompiCredsForProperty` retorna null si !active (bloquea nuevos PSE; webhooks intactos)
- [x] **Status "Pausada"** badge en wompi config page + status `partial` en `/dashboard/integrations` index
- [x] **Reports breakdown por canal `source`** — `getBreakdownBySource` + SourceTable en ReportsView (cierra deuda #13)
- [x] **/admin/users fetch-on-demand** — `getAdminUserDetailAction` + useEffect cache; pre-load reducido 50→25 (cierra deuda #22)
- [x] **inet helper** — `lib/db/inet.ts` con `inetToString()`, reemplaza 3 casts en admin.ts (cierra deuda #10)
- [x] **Regenerated TS types** post-migration
- [x] **+28 tests** — 22 unit parser iCal + 3 external_blocks + 3 wompi_configs RLS

## 🎯 Próximo step — opciones

**Phase E (External integrations reales, restante):**
- E1 Wompi sandbox real (smoke live PSE) — needs sandbox creds
- E2 WhatsApp Cloud API — needs Meta business setup
- E4 Resend (email_logs) — usuario pidió "cuando vuelva"
- E5 Turnstile en login/signup/booking — usuario pidió "cuando vuelva"

**Phase D residual** (diferidos por buenas razones):
- D15-D19 next-intl — refactor masivo. Recomendado solo cuando feature set frozen.
- D20 Plan + facturación tab — bloqueado por decisión de pricing.

**Deuda residual restante**:
- `BookingStatus.refunded` enum — classifier bloqueó la migration sin OK explícito (sesión 7). Reintentar con `dangerouslyDisableSandbox` o autorización previa.
- `wompi_configs.is_active` UI test connection button — necesita Wompi sandbox creds (E1)
- Live browser test no corrido (necesita login interactivo — typecheck + build + 53 tests es la cobertura efectiva)
- Live CSV export download no probado en browser real
- Smoke live iCal sync con URL real Booking/Airbnb sandbox no corrido
- Realtime live test 2-tabs no corrido
- Vercel deploy no hecho aún (build pasa)
- Reports sin proyección/forecast — solo histórico (necesita ML/heurísticas)
- Messages sin paginación (top 500 conversaciones + 500 mensajes por thread)
- WhatsAppMessagesList sin paginación (top 20 en config page) — espera E2
- `messages: []` en BookingDetail — Phase E2 WhatsApp
- `response-time` metric omitido del WeekPulse — depende WhatsApp E2
- `unreadMessages` sigue hardcoded 0 — schema decision Phase E2
- Webhook URL de WhatsApp no se muestra en config form — Phase E2
- Mini-cal precio efectivo por día en `/dashboard/pricing` — futuro D2.5
- Sin acciones admin sobre bookings/properties (cancelar, suspend) — read-only, necesita design discussion
- Sidebar muestra "0 propiedades vinculadas" mid-revocation (race condition defensible)
- Property-settings: Fiscal datos sin destino (módulo facturación electrónica futuro)
- Borrado real de propiedad (cascade SQL + soft-delete strategy)

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesiones 1-6 — ver PROGRESS commits anteriores

### Sesión 7 (2026-05-23) — Phase E primera ola

**iCal sync inbound (E3)**
- **Full-sync por feed** (delete-not-in + upsert) vs. diff incremental — más simple e idempotente; el costo es O(n) por sync pero n = reservas-por-room es bajo (~docena).
- **`feed.room_id` obligatorio para sincronizar inbound** — `external_blocks.room_id` es NOT NULL en schema; si feed no tiene room, se marca `last_sync_error="Feed entrante requiere habitación asignada"` y se skipea. Bloqueo "a nivel propiedad" requiere repensar schema; no toco eso ahora.
- **`MIN_SYNC_INTERVAL_MS = 60s`** — el cron corre cada 15min pero si alguien re-dispara manualmente + cron coincide, evitamos doble fetch al mismo endpoint OTA.
- **`MAX_ICS_BYTES = 5MB`** — feeds Booking/Airbnb típicos son <100KB; 5MB es cap defensivo contra payloads abusivos. Validamos `content-length` antes del body para abortar early.
- **`serverExternalPackages: ["node-ical"]`** en `next.config.ts` — única forma viable de bundle. node-ical depende de rrule (BigInt intensivo) y modules nativos. Sin esto: `g.BigInt is not a function` en page-data collection. Documentado en el comentario.
- **Botón "Sincronizar" solo en feeds inbound activos** — outbound son consumidos por terceros (no se "sincronizan" desde nuestro lado); botón disabled si feed inactivo.
- **Concurrencia limitada a 4 paralelos** en `syncAllActiveInbound` — evita saturar el host externo (mismo dominio en varios feeds, p.ej. Booking.com).

**Parser iCal extraído**
- **`lib/ical/parser.ts`** sin `server-only` — `parseBlocks`, `vEventToBlock`, `toDateOnly`, `addOneDay`, `parameterValueToString` son funciones puras testables sin mock de Supabase. `sync.ts` delega.
- **22 unit tests** cubren: VALUE=DATE all-day, STATUS:CANCELLED, dedupe UID (último gana), dates UTC normalizadas, fallback DTEND = start+1, leap year, fin de mes/año, parámetros tipo `{val, params}`, VTODO/VTIMEZONE ignorados, calendarios vacíos.

**Wompi `is_active` (column + UI)**
- **`loadWompiCredsForProperty` retorna null si `!is_active`** — bloquea creación de nuevos payment_links pero NO los webhooks (webhook usa `events_secret` directamente). Los pagos en vuelo siguen confirmándose aunque el owner haya pausado.
- **Toggle es separado del save de credenciales** — `setWompiActive(propertyId, isActive)` independiente. `upsertWompiConfig` setea `is_active: true` por default al guardar creds (asume owner las quiere activas).
- **`partial` status en `/dashboard/integrations` cards** cuando Wompi conectada pero pausada — distingue de "disconnected" (sin creds) en el index visual.
- **Audit logs separados** `wompi.config_activated` / `wompi.config_paused` (no genérico "updated") — querer trazar específicamente cambios de estado.

**E6 Storage Photos wire-up**
- **Buckets ya existían** (`property-photos` public, `payment-proofs` private) — la infra fue creada antes vía Supabase UI. Sin RLS policies en `storage.objects`, lo cual es correcto: sin policies + RLS habilitada = nadie con anon/auth key puede tocar; todo va por service_role tras requirePropertyRole. Defensa en profundidad sin sobre-engineering.
- **Server Actions atómicas** (no SaveBar) — cada upload/delete/setCover persiste inmediato. Archivos huérfanos imposibles: write gallery DB primero → si falla el insert, no se subió; al borrar, gallery primero (orfan en bucket si delete falla, pero no referenciable).
- **`cover_image_url` derivado del primer item de `gallery`** — escrito server-side en `writeGallery()`. No hay edición independiente. El primer item es la portada; `setCoverPhotoAction` re-ordena.
- **`gallery[].path` opcional** — items legacy sin path no se borran del bucket (legacy demo data). Items nuevos siempre llevan `path` para poder borrar.
- **Failed batch upload corta en primer error** — no llena storage si las credenciales o el formato están mal.
- **Max 30 fotos por propiedad** validado client + server.

**Reports breakdown por canal `source`**
- **Section va arriba de la grid 2-col** (room_type + payment_method) — `direct` vs OTAs es la métrica de "dependencia de marketplace", crítica para decisiones de marketing/pricing.
- **Color `--gold`** para las barras (diferencia visual del breakdown de pago que es `--sage`).
- **CSV ya incluía `source`** desde sesión 6 — solo agregamos la visualización en UI.

**/admin/users fetch-on-demand**
- **Pre-load reducido 50 → 25** — el fallback on-demand cubre el resto sin degradar UX (Drawer ya tenía `<Skeleton/>` para `detail=null`).
- **`getAdminUserDetailAction`** llama `requireSuperAdmin` internamente — defense in depth aunque la action solo se invoca desde una página ya gated.
- **Cache local con `Record<string, AdminUserDetail | null>`** — `null` significa "ya fetcheado, no existe" (UI no re-intenta).
- **Race entre fetches inocua** — diferentes keys en cache; el último resuelto setea su key sin race.

**RLS tests adicionales (+6)**
- **external_blocks** (3 tests): SELECT propio, NO SELECT cross-tenant, NO DELETE cross. Crea feed + room dedicados para no acoplar a describes vecinos.
- **wompi_configs** (3 tests): SELECT propio incluyendo is_active, NO SELECT cross, NO UPDATE de is_active ajeno (con verificación admin de que la fila quedó intacta). Confirma policy `owner_write` + `owner_select`.

**inet helper**
- **`inetToString(value: unknown): string | null`** — narrow runtime explícito. Reemplaza `value as string | null` que silenciaba potenciales non-string values. PostgREST devuelve `inet` como `unknown` en typed gen.

**Otros**
- **Banner success/error tipado** en IcalPageClient + PhotosTab — `{ kind: "error" | "success"; text }`. Reusable pattern para acciones inmediatas.
- **Migration `wompi_configs.is_active` doblemente persistida** — aplicada vía MCP `apply_migration` (live) + archivo en `supabase/migrations/20260524010000_wompi_configs_is_active.sql` (para reset/push). Pattern: cada cambio de schema debe quedar reproducible desde el repo clean.

## ⚠️ Lo que NO se hizo intencionalmente (deuda conocida actualizada)

### Resueltas en sesión 7
- ~~`/admin/users` carga 50 detalles upfront~~ ✅ Reducido a 25 + fetch on-demand
- ~~`r.ip as string | null` cast~~ ✅ Helper `inetToString()`
- ~~Reports sin breakdown por canal `source`~~ ✅ Sección "Por canal" agregada
- ~~iCal config sin botón "Sincronizar ahora"~~ ✅ Implementado
- ~~Photos upload real (espera E6)~~ ✅ Wire-up completo (buckets ya existían)
- ~~Wompi sin toggle pause/resume~~ ✅ `is_active` column + UI
- ~~Sin tests RLS específicos para external_blocks~~ ✅ 3 tests
- ~~Sin tests RLS específicos para wompi_configs~~ ✅ 3 tests

### Pendientes
1. Wompi sandbox creds — pendiente smoke live HTTP PSE.
2. Realtime live test 2-tabs no corrido.
3. Vercel deploy no hecho aún (build pasa).
4. `messages: []` en BookingDetail (Phase E2 WhatsApp).
5. **`BookingStatus.refunded` enum** — classifier bloqueó la migration en sesión 7 sin OK explícito. Reintentar con autorización previa.
6. Mini-cal de precio efectivo por día en `/dashboard/pricing` — futuro D2.5.
7. Sin acción admin sobre bookings/properties (cancelar, suspend) — read-only.
8. Sidebar muestra "0 propiedades vinculadas" mid-revocation.
9. **`unreadMessages` sigue hardcoded 0** — no hay flag de unread en `whatsapp_messages`. Schema decision Phase E2.
10. **Webhook URL de WhatsApp no se muestra en config form** — route `/api/webhooks/whatsapp` no existe (Phase E2).
11. **Reports sin proyección/forecast** — solo histórico.
12. **Messages sin paginación** — top 500 conversaciones + 500 mensajes por thread.
13. **WhatsAppMessagesList sin paginación** — top 20 en config page.
14. **`response-time` metric omitido** del WeekPulse — depende de WhatsApp E2.
15. **Fiscal tab persistencia** — espera módulo facturación electrónica.
16. **Eliminar propiedad permanentemente** — requiere cascade SQL function + soft-delete UX defense.
17. **Smoke live iCal sync con URL real** Booking/Airbnb sandbox no corrido.

## ❓ Preguntas abiertas para el usuario

1. **Próximo step**: ¿E4 Resend + E5 Turnstile (cuando regreses con creds)? ¿O explorar E1 Wompi sandbox primero?
2. Wompi sandbox creds — ¿cuándo?
3. Vercel preview deploy — ¿hacemos ahora?
4. ¿Autorizar `BookingStatus.refunded` enum migration (classifier blocked en sesión 7)?
5. ¿Definir pricing real para activar D20 (Plan + facturación tab)?
6. ¿Cuándo agregamos admin actions sobre bookings (cancelar, suspend) — necesita design discussion?

## 📂 Migrations aplicadas en remoto (12 totales — +1 en sesión 7)

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
├── 20260523120300_properties_contact_phone.sql
├── 20260524000000_webhook_logs.sql
└── 20260524010000_wompi_configs_is_active.sql   ← NUEVA en sesión 7
```

## 🧪 Tests / verificaciones corridas

- ✅ `pnpm typecheck` clean tras cada feature
- ✅ `pnpm build` final: **32 rutas generadas** (+1 vs sesión 6: `/api/cron/ical-sync`)
- ✅ `pnpm test` — **53/53 tests passing** (era 25 al inicio de sesión)
  - 31 integration RLS tests (`tests/integration/rls.test.ts`)
  - 22 unit parser iCal tests (`tests/unit/ical-parser.test.ts`)
- ✅ Smoke node-ical parser CJS — 3 VEVENTs incluido CANCELLED parseados correcto
- ⏸️ Live browser test no corrido (necesita login interactivo)
- ⏸️ Live CSV export download no probado en browser
- ⏸️ Live iCal sync con URL real (Booking/Airbnb) no corrido — necesita feed config real

## 🔧 Setup de entorno actual

(Sin cambios desde sesión 4.)
- Node v26.0.0, pnpm via npx.
- Supabase CLI linkeada a `fdcgqywnwllfxpjrpako` (us-east-2).
- DB Postgres 17.6.
- Migrations totales: **12** (+1 sesión 7).
- Dependencies nuevas sesión 7: `node-ical@0.26.1`.

## 📊 Bitácora de sesiones

| # | Fecha | Horas | Steps abordados | Notas |
|---|-------|-------|-----------------|-------|
| 1 | 2026-05-22 | ~2h | B0 bootstrap + reconciliación docs + MCP config | git init, auditoría blueprint↔código, workflow continuidad. |
| 2 | 2026-05-23 AM | ~4h | B1→B18 + 7 migrations + 10 tests RLS passing | Sprint completo Phase B. |
| 3 | 2026-05-23 PM | ~4h | C1→C6 + 5 hardening commits · 3 migrations · build prod desbloqueado | Sprint Phase C + cleanup deuda. |
| 4 | 2026-05-23 night | ~4h | D1+D2+D5+D6+D7+D13 · 5 pantallas + multi-property switcher | Sprint Phase D primera ola. |
| 5 | 2026-05-23 night2 | ~5h | D3+D4+D8+D9+D10+D11+D12 · 7 pantallas + 1 migration + dashboard home wire-up + limpieza | Sprint Phase D segunda ola. |
| 6 | 2026-05-23 night3 | ~5h | Limpieza transversal: property-settings 8 tabs + nueva reserva manual + /admin/users + /admin overview + CSV exports + 12 RLS tests + dashboard owner real | Cierre de deuda heredada de Phase A/B/C. |
| 7 | 2026-05-23 night4 | ~6h | E3 iCal sync inbound + E6 Storage Photos + Wompi pause/resume + Reports source breakdown + /admin/users on-demand + inet helper + parser extracted + 28 tests nuevos | Sprint Phase E primera ola. |

## 📜 Historial de commits recientes (pre-sesión 7)

```
2e51bf0 chore: PROGRESS.md sesion 6 (limpieza transversal — property-settings + admin + CSV + RLS)
c0c185c feat: limpieza transversal — property-settings wire-up, admin pages reales, CSV exports, RLS coverage
4a36475 chore: PROGRESS.md sesion 5 (Phase D segunda ola — D3+D4+D8-D12 + limpieza)
348896b feat(D3+D4+D8+D9+D10+D11+D12): Phase D segunda ola + limpieza
2a4c4a1 chore: PROGRESS.md sesion 4 (Phase D primera ola — D1+D2+D5+D6+D7+D13)
```

(Próximo commit END-SESSION sesión 7 cerrará Phase E primera ola con este PROGRESS.md actualizado.)
