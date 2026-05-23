# Eztadia — Progress Log

> Última actualización: 2026-05-23 por sesión Claude Code #6 (Limpieza de deuda crítica + admin pages + CSV exports + RLS coverage)
> Branch: `main`  ·  Último commit (pre-sesión 6): `4a36475`
> Phase activa: **Phase D cerrada en sesión 5.** Sesión 6 = limpieza transversal de deuda heredada.

## 📍 Estado actual

**Phase:** D cerrada (en lo implementable sin bloqueos externos). Phase E disponible.
**Último step completado:** Limpieza de deuda crítica + admin pages wire-up + CSV exports + RLS coverage adicional.
**Coverage:** typecheck ✅ · build ✅ (31 rutas) · tests ✅ **25/25** (era 13).

**Bloqueado por:** Nada hard-blocks. Wompi sandbox creds y Vercel deploy siguen pendientes.

## ✅ Steps completados

Phase B (sesión 2): B1–B18
Phase C (sesión 3): C1–C6 + hardening
Phase D primera ola (sesión 4): D1, D2, D5, D6, D7, D13
Phase D segunda ola (sesión 5): D3, D4, D8, D9, D10, D11, D12

**Sesión 6 — limpieza transversal:**

- [x] Property-settings 8 tabs wire-up real (Phase B6 redo pendiente)
  - General/Identity/Amenities/Schedules/Policies/Advanced → `updatePropertyAction`
  - Fiscal + Photos → disclaimer "Próximamente" honesto (sin SaveBar fake)
  - Botón "Desactivar propiedad" wireado a `is_active`
  - Modal "Eliminar" → "contáctanos por WhatsApp" (no fake delete)
- [x] "Nueva reserva manual" con drawer + action real (createManualBookingAction)
- [x] `/admin/users` wireado a query real cross-tenant (profiles + property_users + login_events + adapter)
- [x] `/admin/page.tsx` overview wireado a DB real (getAdminOverview con 14 queries paralelas)
- [x] CSV export utility (`lib/csv.ts` con RFC 4180 + BOM UTF-8 + download helper)
- [x] Reports → botón Exportar CSV (descarga bookings del periodo)
- [x] `/admin/audit-logs` → paginación cursor-based ("Cargar 200 más") + Exportar CSV (cap 10k)
- [x] Tests RLS para whatsapp_configs, whatsapp_messages, ical_feeds, email_logs (12 tests nuevos)
- [x] Dashboard owner real (cover_image_url de DB + initials calculados + placeholder.svg fallback)
- [x] Limpieza de demo data muerta (DEMO_SNAPSHOT, getOwnerSnapshot, getAdminUsers, getRevenueSnapshot, getGlobalKpis, etc.)

## 🎯 Próximo step — opciones

**Phase E (External integrations reales):**
- E1 Wompi sandbox real (smoke live PSE) — needs sandbox creds
- E2 WhatsApp Cloud API — needs Meta business setup
- **E3 iCal sync (node-ical parser + cron)** — implementable sin creds externos (la infra de feed config ya está) ← RECOMENDADO
- E4 Resend (email_logs ya está listo para recibir inserts)
- E5 Turnstile en login/signup/booking
- E6 Supabase Storage buckets (desbloquea Photos tab + payment proof uploads)

**Phase D residual** (diferidos por buenas razones):
- D15-D19 next-intl — refactor masivo. Recomendado solo cuando feature set frozen.
- D20 Plan + facturación tab — bloqueado por decisión de pricing.

**Deuda residual menor**:
- `/admin/users` carga 50 detalles upfront (>50 sería fetch on-demand)
- Reports sin export CSV por canal `source` (Phase E3 traerá data más rica)
- Messages sin paginación (top 500)
- Property-settings: Photos upload real (Phase E6)
- Property-settings: Fiscal datos sin destino (módulo facturación electrónica futuro)
- Borrado real de propiedad (cascade SQL + soft-delete strategy)
- `wompi_configs.is_active` column no existe (migration pequeña)
- `refunded` no existe en BookingStatus enum (migration pequeña)
- Mini-cal de precio efectivo por día en `/dashboard/pricing` (D2.5 futuro)
- Sin acciones admin sobre bookings/properties (cancelar, suspend) — read-only
- Sidebar muestra "0 propiedades vinculadas" mid-revocation (race condition defensible)
- `unreadMessages` hardcoded 0 (necesita flag de unread en `whatsapp_messages` — Phase E2)

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesiones 1-5 — ver PROGRESS commits anteriores

### Sesión 6 (2026-05-23) — Limpieza transversal

**Property-settings wire-up**
- **`booking_policy` jsonb shape estructurado** (cancellation/pets/children/smoking/events/schedules/advanced) pero schema con `.passthrough()` — agregar keys nuevas no requiere migration.
- **Merge shallow del `booking_policy` se hace server-side** en `updatePropertyAction` (lee actual + mergea top-level keys + escribe). No depende del client. Más robusto.
- **"Eliminar permanentemente" intencionalmente NO implementado** — requiere cascade SQL function + soft-delete UX defense. Modal ofrece "contáctanos por WhatsApp" como flow honesto.
- **Photos + Fiscal con disclaimer "Próximamente"** en vez de SaveBar fake. Photos espera Storage (E6); Fiscal espera módulo facturación electrónica.
- **`useSettingsSave()` hook común** para los 6 tabs wireados — `updatePropertyAction` + `router.refresh()` + error state.

**Nueva reserva manual**
- **No pasa por holds** — staff ya cerró la confirmación. Crea booking directo con `status=confirmed, source=manual`.
- **Check disponibilidad previo** via `check_availability` RPC para no doble-bookear.
- **Total auto-sugerido** (`base_price_cents × nights`) pero editable. El staff puede sobrescribir si negoció descuento.
- **Audit log redacta email + phone** (no se loggea PII en `diff`).
- **Removí botón "Exportar" no-funcional** del header de bookings — era placeholder silencioso. Cuando se implemente export real, vuelve.

**/admin/users wire-up**
- **Role inference**: `property_users.role` gana sobre `profiles.role` cuando hay link — refleja el rol *operativo*, no el flag global.
- **Status `pending`/`active`**: derivado de `invitation_accepted_at`. "Suspended" diferido (no hay ban field — cuando agreguemos `auth.users.banned_until`, lo mapeamos).
- **Last seen real** desde `login_events` (event_type=login_success más reciente).
- **50 detalles pre-cargados** (cabe en una página normal). Para >50, fetch on-demand sería el next step.
- **`formatRelativeEs()` helper** con escala minutos→horas→días→meses→años, "hace un momento" para <60s, "nunca" si null.
- **Device parser de User-Agent** simple: Desktop/Mobile/Tablet + Chrome/Safari/Firefox/Edge. No queremos depender de UA library.

**/admin/page.tsx wire-up**
- **`getAdminOverview()` single entrypoint** con 14 queries paralelas (counts + aggregates + audit + top + attention). Una sola round-trip de hits.
- **Atribución revenue por `created_at`** del booking (no por check_in). Lectura natural de super_admin = "ingresos *registrados* este mes".
- **Top properties**: agrupado client-side desde el query con JOIN. `confirmed + completed` solo. Top 5 por revenue desc.
- **Attention threshold 14 días** grace para no flagear propiedades en onboarding como "sin reservas".
- **Eventos del feed** vienen de `audit_logs` cross-tenant via admin client. Mapeados a `EventKind` por `resource_type` (booking→reserva, property→usuario, etc.) o `actor_type=webhook`.
- **Trend bookings real** vs mes anterior (count delta + %). Si prev=0, fallback a "X este mes".

**CSV exports**
- **`lib/csv.ts` reusable**: `toCsv()` con RFC 4180 (quote+escape `"` cuando hay coma/quote/newline), CRLF terminators, BOM UTF-8 al inicio para que Excel detecte UTF-8 sin "Importar texto".
- **Reports CSV** client-side: server pasa bookings pre-cargadas al `<ExportCsvButton/>`. Filename: `reportes-{from}_{to}.csv`. 17 columnas (incluye huésped/contacto/total/canal/método).
- **Audit-logs CSV server-side**: Server Action `exportAuditLogsAction` retorna string CSV (cap 10k filas hard). Truncated flag en respuesta avisa al user si hubo cap.
- **Paginación cursor-based** en audit-logs: cursor = `created_at < X`. Mantenemos filtros client-side (search/actor/resource) — el server query trae más data, los filtros UI siguen aplicándose sobre lo cargado.

**Tests RLS adicionales (+12)**
- **whatsapp_configs** (3 tests): SELECT propio, NO SELECT cross-tenant, NO UPDATE cross-tenant. Confirma policy `owner_write` + `owner_select`.
- **whatsapp_messages** (3 tests): SELECT propio, NO SELECT cross, NO INSERT cross. Confirma `member_select` + `member_insert`.
- **ical_feeds** (3 tests): SELECT propio, NO SELECT cross, NO DELETE cross. Confirma `member_select` + `manager_write`.
- **email_logs** (3 tests): SELECT propio, NO SELECT cross, NO INSERT (no hay write policy — solo service_role). Confirma `member_select`.
- Cleanup en `afterAll` incluye nuevas tablas (whatsapp_messages → whatsapp_configs → ical_feeds → email_logs → bookings → ...) en orden de FK.

**Dashboard owner real**
- **`property.photo`** ahora viene de `properties.cover_image_url`. Si NULL → `/placeholder.svg` (ya existe en `public/`). Antes era Unsplash hardcoded.
- **`owner.initials`** calculado de `full_name` o email. No demo.
- **`unreadMessages: 0`** hasta que tengamos flag en `whatsapp_messages` (Phase E2 schema decision). Antes era `3` demo misleading.
- **Layout pasa `attention/pulse/upcoming: []`** porque solo la home los muestra. El shell solo necesita owner + property + unreadMessages.
- **Eliminados `DEMO_SNAPSHOT` + `getOwnerSnapshot()`** de `lib/dashboard.ts` — tipos y helpers (`greetingFor`, `subtitleFor`) se mantienen.

**Limpieza de demo muerta**
- `lib/admin.ts`: eliminadas funciones demo `getGlobalKpis`, `getRevenueSnapshot`, `getRecentEvents`, `getTopProperties`, `getAttentionProperties`, `getAdminUsers`, `getAdminUserDetail`, `DETAILS`. Quedan solo tipos + `ROLE_LABEL`/`STATUS_LABEL`.
- `lib/property-settings.ts`: eliminado `getPropertySettings()` (no se usaba tras wire-up).
- `lib/dashboard.ts`: eliminados `DEMO_SNAPSHOT` + `getOwnerSnapshot()`.

## ⚠️ Lo que NO se hizo intencionalmente (deuda conocida actualizada)

### Resueltas en sesión 6
- ~~Property-settings 8 tabs siguen demo~~ ✅ 6 wireados + 2 con disclaimer honesto
- ~~"Nueva reserva manual" sin onClick~~ ✅ Drawer + action implementados
- ~~Phase A `/admin/users` + `/admin/page.tsx` siguen demo data~~ ✅ Ambos wire-up real
- ~~`snapshot.owner/property/photo` demo en dashboard~~ ✅ Real
- ~~`/admin/audit-logs` sin paginación~~ ✅ Cursor-based "Cargar 200 más"
- ~~`/admin/audit-logs` sin export CSV~~ ✅ Server Action con cap 10k
- ~~Reports sin export CSV~~ ✅ Client-side download de bookings del periodo
- ~~Sin tests RLS específicos para whatsapp_configs/ical_feeds/email_logs/whatsapp_messages~~ ✅ 12 tests nuevos

### Pendientes (sin cambios)
1. Wompi sandbox creds — pendiente smoke live HTTP PSE.
2. Realtime live test 2-tabs no corrido.
3. Vercel deploy no hecho aún (build pasa).
4. `messages: []` en BookingDetail (Phase E2 WhatsApp).
5. `wompi_configs.is_active` column ausente.
6. `refunded` no existe en BookingStatus enum.
7. Mini-cal de precio efectivo por día en `/dashboard/pricing` — futuro D2.5.
8. Sin acción admin sobre bookings/properties (cancelar, suspend) — read-only.
9. Sidebar muestra "0 propiedades vinculadas" mid-revocation.
10. PostgREST `inet` type mapea a `unknown`, cast `r.ip as string | null`.
11. **`unreadMessages` sigue hardcoded 0** — no hay flag de unread en `whatsapp_messages`. Schema decision Phase E2.
12. **Webhook URL de WhatsApp no se muestra en config form** — route `/api/webhooks/whatsapp` no existe (Phase E2).
13. **Reports sin breakdown por canal `source`** — agregar con Phase E3.
14. **Reports sin proyección/forecast** — solo histórico.
15. **Messages sin paginación** — top 500 conversaciones + 500 mensajes por thread.
16. **iCal config sin botón "Sincronizar ahora"** — cron real es Phase E3.
17. **WhatsAppMessagesList sin paginación** — top 20 en config page.
18. **`response-time` metric omitido** del WeekPulse — depende de WhatsApp E2.
19. **Photos upload real** — Phase E6 Storage.
20. **Fiscal tab persistencia** — espera módulo facturación electrónica.
21. **Eliminar propiedad permanentemente** — requiere cascade SQL + soft-delete strategy.
22. **`/admin/users` carga 50 detalles upfront** — para >50, fetch on-demand sería next step.

## ❓ Preguntas abiertas para el usuario

1. **Próximo step**: ¿Phase E (integraciones reales — E3 iCal recomendado, self-contained) o feature freeze + i18n (D15-D19)?
2. Wompi sandbox creds — ¿cuándo?
3. Vercel preview deploy — ¿hacemos ahora?
4. ¿Definir pricing real para activar D20 (Plan + facturación tab)?

## 📂 Migrations aplicadas en remoto (11 totales — sin cambios en sesión 6)

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
└── 20260524000000_webhook_logs.sql
```

## 🧪 Tests / verificaciones corridas

- ✅ `pnpm typecheck` clean tras cada feature
- ✅ `pnpm build` final: **31 rutas generadas** (sin cambios, `/admin` ahora dinámico al traer queries reales)
- ✅ `pnpm test` — **25/25 RLS tests passing** (era 13, +12 cobertura whatsapp_configs/whatsapp_messages/ical_feeds/email_logs)
- ⏸️ Live browser test no corrido (necesita login interactivo — typecheck + build + RLS es la cobertura efectiva)
- ⏸️ Live CSV export download no probado en browser real (helper testeado por typecheck)

## 🔧 Setup de entorno actual

(Sin cambios desde sesión 4.)
- Node v26.0.0, pnpm via npx.
- Supabase CLI linkeada a `fdcgqywnwllfxpjrpako` (us-east-2).
- DB Postgres 17.6.
- Migrations totales: **11**.

## 📊 Bitácora de sesiones

| # | Fecha | Horas | Steps abordados | Notas |
|---|-------|-------|-----------------|-------|
| 1 | 2026-05-22 | ~2h | B0 bootstrap + reconciliación docs + MCP config | git init, auditoría blueprint↔código, workflow continuidad. |
| 2 | 2026-05-23 AM | ~4h | B1→B18 + 7 migrations + 10 tests RLS passing | Sprint completo Phase B. |
| 3 | 2026-05-23 PM | ~4h | C1→C6 + 5 hardening commits · 3 migrations · build prod desbloqueado | Sprint Phase C + cleanup deuda. |
| 4 | 2026-05-23 night | ~4h | D1+D2+D5+D6+D7+D13 · 5 pantallas + multi-property switcher | Sprint Phase D primera ola. |
| 5 | 2026-05-23 night2 | ~5h | D3+D4+D8+D9+D10+D11+D12 · 7 pantallas + 1 migration + dashboard home wire-up + limpieza | Sprint Phase D segunda ola. |
| 6 | 2026-05-23 night3 | ~5h | Limpieza transversal: property-settings 8 tabs + nueva reserva manual + /admin/users + /admin overview + CSV exports + 12 RLS tests + dashboard owner real | Cierre de deuda heredada de Phase A/B/C. |

## 📜 Historial de commits recientes (pre-sesión 6)

```
4a36475 chore: PROGRESS.md sesion 5 (Phase D segunda ola — D3+D4+D8-D12 + limpieza)
348896b feat(D3+D4+D8+D9+D10+D11+D12): Phase D segunda ola + limpieza
2a4c4a1 chore: PROGRESS.md sesion 4 (Phase D primera ola — D1+D2+D5+D6+D7+D13)
9eca1cb feat(D1-D7+D13): Phase D primera ola — 5 pantallas + multi-property switcher
5ac1fa0 chore: PROGRESS.md sesion 3 (Phase C completa C1-C6 + hardening)
```

(Próximo commit END-SESSION sesión 6 cerrará la limpieza transversal con este PROGRESS.md actualizado.)
