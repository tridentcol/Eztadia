# Eztadia — Progress Log

> Última actualización: 2026-05-23 por sesión Claude Code #5 (Phase D segunda ola — D3+D4+D8+D9+D10+D11+D12 + limpieza de deuda)
> Branch: `main`  ·  Último commit (pre-sesión 5): `2a4c4a1`
> Phase activa: **D · Pantallas restantes + multi-property + i18n** — D1-D13 ✅ (excepto D14 que se decidió como cookie+helper, NO refactor URLs)

## 📍 Estado actual

**Phase:** D · Pantallas restantes + multi-property + i18n.
**Último step completado:** D10 `/admin/webhooks` + webhook_logs migration.
**Phase D coverage:** todo lo que se puede sin bloqueos. Quedan **D15-D19 (next-intl)** y **D20 (plan/facturación)** — ambos diferidos deliberadamente.

**Bloqueado por:** Nada hard-blocks. Wompi sandbox creds sigue pendiente para smoke live PSE. Vercel preview deploy pendiente.

## ✅ Steps completados

Phase B (sesión 2): B1–B18 (ver historial PROGRESS sesión 2)
Phase C (sesión 3): C1–C6 + hardening
Phase D primera ola (sesión 4): D1, D2, D5, D6, D7, D13

**Phase D segunda ola (sesión 5):**
- [x] D4 `/dashboard/reports` — ocupación/ADR/RevPAR, bar chart SVG, breakdown room_type+payment_method
- [x] D12 detalle integraciones — WhatsApp config (encrypted token + recent messages) + iCal feeds CRUD + outgoing secret rotation
- [x] D9 `/admin/whatsapp` — log cross-tenant + filtros direction/status
- [x] D8 `/admin/emails` — log cross-tenant + filtros status/template
- [x] D11 `/admin/errors` — Sentry placeholder + privacy disclosure
- [x] D3 `/dashboard/messages` — conversaciones agrupadas + thread con auto-scroll (envío diferido a E2)
- [x] D10 `/admin/webhooks` — migration webhook_logs + helper logWebhook + Wompi instrumentado + admin page con drawer JSON detail + tests RLS

**Limpieza de deuda heredada (sesión 5):**
- [x] Dashboard home wired a queries reales (WeekPulse + AttentionList + UpcomingCheckIns)
- [x] `contact_phone` backend ready en updatePropertySchema + updatePropertyAction
- [x] Badge demo `3` quitado del sidebar admin /errores
- [x] Link a /admin/webhooks restaurado tras crear página real
- [x] `designs/package.json` ocioso eliminado (workspace huérfano)
- [x] Verificado: pills demo vs DB enum — ambos paths funcionan via adapter, no es bug

## 🎯 Próximo step — opciones

**Phase D residual** (todos diferidos por buenas razones):
- **D15-D19 next-intl** — refactor masivo. Recomendado solo cuando feature set esté frozen. Mover `app/*` → `app/[locale]/*`, JSON messages, useTranslations en todo el copy.
- **D20 Plan + facturación tab** — bloqueado por decisión de pricing real del usuario.

**Phase E (External integrations reales)** está disponible:
- E1 Wompi sandbox real (smoke live PSE) — needs sandbox creds
- E2 WhatsApp Cloud API — needs Meta business setup
- E3 iCal sync (node-ical parser + cron) — implementable sin creds externos (la infra de feed config ya está)
- E4 Resend (email_logs ya está listo para recibir inserts)
- E5 Turnstile en login/signup/booking
- E6 Supabase Storage buckets

**Deuda heredada concreta**:
- Property-settings 8 tabs siguen demo (`onSave = setTimeout(250)`) — Phase B6 redo
- "Nueva reserva manual" sin onClick en /dashboard/bookings
- `unreadMessages` sigue demo (no flag de unread en schema)

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesiones 1-4 — ver PROGRESS commits anteriores

### Sesión 5 (2026-05-23) — Phase D segunda ola + limpieza

**D4 — `/dashboard/reports`**
- **Atribución por check-in date** (booking-date method), no stay-night pro-rateo. Estándar hotelero + queries simples. Documentado en footer "Convención:". Si se necesita stay-night después se reescribe en SQL con `generate_series`.
- **Estados realizados = `confirmed` + `completed`**. `cancelled`/`no_show`/`pending_payment` excluidos.
- **SVG bar chart inline** (no FullCalendar, no recharts) — viewBox 800×220, gold para mes actual, sage 100% para max revenue, sage 55% opacity para el resto. Tooltip via `<title>`.
- **`nights` nullable handled** con `?? 0` — DB es nullable pero en prod es auto-generated.
- **PeriodPicker = `<Link>`s server-rendered** — no useState. Cambia URL → re-render. Cero JS extra.
- **Range half-open** `from <= check_in < to`. Label humano calcula `to-1d`.
- 5 presets: this-month, last-month, last-30, last-90, ytd.

**D12 — detalle integraciones**
- **WhatsApp solo-owner** (RLS `whatsapp_configs_owner_write`). iCal manager+. Tres niveles distintos por sensitividad.
- **Access token preservation pattern**: si user no re-pega, no se sobrescribe. Mutation acepta `null` → skip encrypt + skip update de esa columna en upsert.
- **iCal secret rotation requiere confirm dialog** — destructive UX, no silencioso (rota URLs ya pegadas en Booking/Airbnb).
- **Outgoing URL viene de `properties.ical_export_secret`**, no de `ical_feeds`. `ical_feeds direction=outbound` son para casos custom (publicar a URL externa de tercero), opcional.
- **`base64url` 18 bytes** para el secret — 24 chars URL-safe, ~108 bits entropía.
- **Index cards mantienen demo data para feature copy**, solo `status` viene de DB. Wire-up profundo es deuda.

**D8/D9/D11 — admin logs**
- **Filtros client-side** (memoria) consistente con audit-logs. Cap 300 rows.
- **Sin detail drawer** en WhatsApp/Emails — body cabe en row editorial.
- **Errors page super-light** — no caché, no resumen 24h. Sentry es fuente de verdad; replicar UI = superficie de ataque.
- **DSN check sin parsear** — solo "configurado/no" sin extraer org/project. Parseo de DSN brittle.
- **Property links a `/p/{slug}`** — admin viewer quiere "es esta propiedad" rápido, no editarla.

**D3 — `/dashboard/messages`**
- **Agrupamiento por counterpart phone**, no por (counterpart, booking) — un huésped que reserva varias veces ve UN solo hilo.
- **`recentInbound = inbound en últimas 48h`** como proxy de unread. No hay flag de lectura en schema; suficiente para "atención merecida".
- **Compose bar disabled visual** en vez de oculto — comunica feature futura.
- **CSS-only mobile responsive** (hidden md:block) — URL es la fuente de verdad.
- **`/^\+\d{8,15}$/` validation** en searchParam — defense-in-depth contra inyección en `.or()`.
- **Cap 500 mensajes** total + 500 thread — suficiente para propiedad boutique.

**D10 — webhook_logs**
- **`status` como TEXT no enum** — flexibilidad para agregar rechazos sin migration.
- **payload guarda primer 200 chars del raw si no parsea** — debugging sin sobrecargar DB.
- **Best-effort logging** — `logWebhook` tira y come error. Wompi reintenta si nuestra response no llega; preferimos responder rápido que persistir un log.
- **HMAC tri-estado** — `signature_valid` es `null` si provider no firma o test mode. `true`/`false` cuando hubo verificación real.
- **Defense in depth + member visibility** — owner/manager/reception ven sus propios webhooks (útil para debugging). Cross-tenant solo super_admin via admin client.
- **`finish()` helper interno** en route handler — 8 exit paths, todos pasan por single point que escribe log + retorna NextResponse.

**Limpieza de deuda — decisiones**
- **Week-to-date anclado a lunes** (no domingo) — convención hotelera + Colombia. `(getUTCDay() + 6) % 7` shift.
- **Diff de ocupación en `pp` (puntos porcentuales)**, no porcentaje relativo — un 50%→60% es "↑ 10 pp", no "↑ 20%". Más honesto.
- **Attention items: checkin-today antes que pending-payment** — orden lo prioriza visualmente.
- **`hoursAway: 0` hardcodeado** porque no rastreamos hora real de check-in en `bookings` (solo property-level default).
- **`contactPhone` backend ready sin tocar UI demo** — los 8 tabs de property-settings siguen `setTimeout(250)`, wire-up real es Phase B6 territory. Cuando se haga, contactPhone funciona out-of-the-box.
- **Pills demo vs DB enum verificado, no unificado** — ambos paths funcionan via adapter; unificación = refactor cosmético sin forcing function.

## ⚠️ Lo que NO se hizo intencionalmente (deuda conocida)

### De sesiones anteriores

1. ~~UI para capturar `properties.contact_phone`~~ → **Parcialmente resuelto:** schema + action backend ready. UI sigue bloqueada por property-settings demo wire-up.
2. UI para "Nueva reserva manual" desde dashboard — botón sin onClick.
3. Wompi sandbox creds — pendiente smoke live HTTP PSE.
4. Realtime live test 2-tabs no corrido.
5. Vercel deploy no hecho aún (build pasa).
6. `messages: []` en BookingDetail (Phase E2 WhatsApp).
7. `wompi_configs.is_active` column ausente.
8. `refunded` no existe en BookingStatus enum.
9. Mini-cal de precio efectivo por día en `/dashboard/pricing` — futuro D2.5.
10. Sin acción admin sobre bookings/properties (cancelar, suspend) — read-only.
11. ~~Dos sets de pills coexistiendo~~ → **Verificado, no es bug.** Ambos funcionan via adapter.
12. 5 rutas dashboard dynamic (cookie multi-property en layout).
13. `/admin/audit-logs` sin paginación (limit 300).
14. `/admin/audit-logs` sin export CSV.
15. Sidebar muestra "0 propiedades vinculadas" mid-revocation.
16. `snapshot.owner/property` siguen demo (override parcial); ~~`pulse/attention/upcoming` demo~~ → **Resuelto en sesión 5.** `unreadMessages` sigue demo.
17. Phase A `/admin/users` + `/admin/page.tsx` siguen demo data.
18. PostgREST `inet` type mapea a `unknown`, cast `r.ip as string | null`.

### Nuevas de sesión 5

19. **Property-settings 8 tabs siguen demo** (`onSave = setTimeout(250)` sin save real). Phase B6 redo necesario para que cualquier campo persista. `contactPhone` backend está ready, solo necesita UI honesta.
20. **`unreadMessages` sigue demo** — no hay flag de unread en `whatsapp_messages`. Schema decision para Phase E2.
21. **Webhook URL de WhatsApp no se muestra en config form** — route `/api/webhooks/whatsapp` no existe (Phase E2). Cuando se cree, agregar WebhookInfoBlock similar al de Wompi.
22. **Reports sin export CSV** (útil para contabilidad).
23. **Reports sin breakdown por canal `source`** (direct/booking_com/airbnb/manual) — agregar con Phase E3.
24. **Reports sin proyección/forecast** — solo histórico.
25. **Messages sin paginación** — top 500 conversaciones + 500 mensajes por thread.
26. **iCal config sin botón "Sincronizar ahora"** — cron real es Phase E3.
27. **Sin tests RLS específicos para whatsapp_configs/ical_feeds/email_logs/whatsapp_messages** — webhook_logs sí tiene test (sesión 5).
28. **WhatsAppMessagesList sin paginación** — top 20 en config page. Admin /whatsapp ya cubre histórico completo.
29. **`response-time` metric omitido** del WeekPulse — depende de WhatsApp E2 para medir gap inbound↔outbound.

## ❓ Preguntas abiertas para el usuario

1. **Próximo step después de Phase D**: ¿Phase E (integraciones reales) o feature freeze + i18n (D15-D19)?
2. Wompi sandbox creds — ¿cuándo?
3. Vercel preview deploy — ¿hacemos ahora?
4. ¿Definir pricing real para activar D20 (Plan + facturación tab)?

## 📂 Migrations aplicadas en remoto (11 totales — +1 en sesión 5)

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
└── 20260524000000_webhook_logs.sql        ← NUEVA sesión 5
```

## 🧪 Tests / verificaciones corridas

- ✅ `pnpm typecheck` clean tras cada feature
- ✅ `pnpm build` final: **31 rutas generadas** (era 22 al inicio de sesión 4, 28 al inicio de sesión 5, +3 admin/* y +1 messages y +2 integraciones details y +1 reports y +1 webhooks)
- ✅ `pnpm test` — **13/13 RLS tests passing** (era 10, +3 webhook_logs)
- ✅ Migration aplicada via MCP — `mcp__supabase__apply_migration` + types regenerados via `mcp__supabase__generate_typescript_types`
- ✅ Advisors check post-migration: **0 issues nuevos** del schema webhook_logs (las warnings existentes son preexistentes — SECURITY DEFINER functions, leaked password protection — Phase F)
- ⏸️ Live browser test no corrido (necesita login interactivo — typecheck + build + RLS + advisors es la cobertura efectiva)

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
| 5 | 2026-05-23 night2 | ~5h | D3+D4+D8+D9+D10+D11+D12 · 7 pantallas + 1 migration + dashboard home wire-up + limpieza | Sprint Phase D segunda ola. Phase D completa en lo que se puede sin bloqueos. |

## 📜 Historial de commits recientes (pre-sesión 5)

```
2a4c4a1 chore: PROGRESS.md sesion 4 (Phase D primera ola — D1+D2+D5+D6+D7+D13)
9eca1cb feat(D1-D7+D13): Phase D primera ola — 5 pantallas + multi-property switcher
5ac1fa0 chore: PROGRESS.md sesion 3 (Phase C completa C1-C6 + hardening)
e08265a feat: properties.contact_phone + placeholder SVG (deuda C visual)
2a8f7ec feat: wire Confirmar/Rechazar pago en BookingDetailDrawer (C5 dashboard)
d836a74 feat: agrega tablas calendar a publication supabase_realtime
581ee31 feat: persist guest data en booking_holds (no mas placeholder)
8fd7be2 fix: unblock production build (7 JSX type errors + login Suspense)
8e9a268 feat(C1-C6): wire dashboard + Wompi + manual proof + realtime
f31dda1 feat(C3): wire public booking flow /p/[slug]/booking/* a data real
```

(Próximo commit END-SESSION sesión 5 cerrará Phase D segunda ola con este PROGRESS.md actualizado.)
