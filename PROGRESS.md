# Eztadia — Progress Log

> Última actualización: 2026-05-23 por sesión Claude Code #10 (END-SESSION)
> Branch: `main`  ·  Último commit en origin: `4058cac`  ·  Último commit local sin pushear: `f4e309e` (Prisma cleanup de sesión 9, decisión separada)
> Phase activa: **Phase E segunda ola — DESTRABADA en Vercel.** Deploy productivo responde 200 con HTML real de la app. Listos para validar smoke en browser y avanzar E1/E2.

## 📍 Estado actual

**Phase:** E segunda ola desbloqueada. E4 Resend + E5 Turnstile implementados y pushados (sesión 8). Deploy Vercel destrabado (sesión 10).
**Último step completado:** **Vercel deploy funcional.** Root cause real del 404 NOT_FOUND global encontrado: `framework: null` en project Vercel (descubierto vía `mcp__vercel__get_project`). Fix: `"framework": "nextjs"` explícito en `vercel.json`. Stack actual = Next 16.2.6 + proxy.ts (Node runtime) + webpack opt-out.
**Coverage local:** typecheck ✅ · build ✅ · tests 53/53 ✅.
**Coverage producción:** ✅ `eztadia.vercel.app` responde 200 con HTML real (`<title>Eztadia — La forma serena de gestionar habitaciones.</title>`, tokens del design system, fonts cargando). Vercel Deployment Protection sigue activa (401 SSO para usuarios no autenticados, comportamiento esperado de preview deploys).

**Bloqueado por:** ninguno técnico. Pendientes humanos:
- Wompi sandbox creds (E1) — usuario en standby
- WhatsApp Meta setup (E2) — usuario no se animó
- Verificar dominio en Resend (F10) — emails solo al owner de la cuenta hasta que se verifique

## ✅ Steps completados

Phase B (sesión 2): B1–B18
Phase C (sesión 3): C1–C6 + hardening
Phase D primera ola (sesión 4): D1, D2, D5, D6, D7, D13
Phase D segunda ola (sesión 5): D3, D4, D8, D9, D10, D11, D12
Limpieza transversal (sesión 6): property-settings 8 tabs + admin pages reales + CSV exports + 12 RLS tests
Phase E primera ola (sesión 7): E3 iCal sync + E6 Storage Photos + Wompi is_active + Reports source breakdown + admin/users on-demand
Phase E segunda ola (sesión 8): E4 Resend + E5 Turnstile + push 30 commits a GitHub + crons daily (Hobby) + `.env.vercel.local` generado · Vercel deploy bloqueado al cierre

**Sesión 9 (mid-session restart, 2026-05-23):**
- [x] Vercel MCP server agregado a `~/.claude.json` (scope local). Restart forzado para que apareciera en `/mcp`.
- [x] Commit local `f4e309e` — `chore(vercel): eliminar Prisma completo` (4 archivos, -871/+2 líneas: borra `prisma/schema.prisma`, remueve 7 scripts npm, saca `@prisma/client` de `serverExternalPackages`, `pnpm remove prisma @prisma/client`). **NO pusheado.** Resultó NO ser el bug (sesión 10 lo confirmó) pero sigue siendo dead-code cleanup válido.
- [x] Verde local: typecheck · build (35 rutas) · 53/53 tests.

**Sesión 10 (esta — 2026-05-23) — destrabar Vercel deploy:**

- [x] **Vercel MCP autenticado** vía OAuth al inicio (`/mcp` mostró `vercel ✓ Connected`). Permitió leer runtime logs, build logs, project metadata sin copiar+pegar.
- [x] **Diagnóstico real del bug original** vía `mcp__vercel__get_runtime_logs` con `source=edge-middleware`: `ReferenceError: __dirname is not defined`. Causa: `@supabase/ssr` referencia `__dirname` al bundlearse para Edge runtime (Web Workers spec, sin `__dirname`). **Invalidó las 6 hipótesis de sesión 8** (Prisma, node-ical, `lib/db/index.ts`, etc.) — todas en serverless functions, no Edge.
- [x] **Intento Next 15 + `experimental.nodeMiddleware: true`** — flag existe en runtime pero bundler de Next 15.5.18 lo ignora. Manifest verificado: middleware seguía Edge. NO destrabó. Commit `36509f8`.
- [x] **Upgrade Next 15.5.18 → 16.2.6** (`pnpm install next@^16.2.6`). Next 16 renombra `middleware.ts` → `proxy.ts` con runtime Node default (no flag). Manifest `functions-config-manifest.json` confirma `/_middleware runtime "nodejs"`. Commit `24cf24c`. tsconfig.json auto-actualizado (`jsx: "react-jsx"` + `.next/dev/types`).
- [x] **Opt-out de Turbopack** (`next build --webpack`) — Next 16 usa Turbopack por default. Commit cautelar `27ed551` (hipótesis fallida).
- [x] **Named export `proxy` vs default** — la skill `vercel:nextjs` recomendaba `proxyConfig` (incorrecto). La docs oficial (en `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`) dice `config` (mismo nombre que Next 15) y acepta named o default. Cambio cautelar a named. Commit `5b74d74` (hipótesis fallida).
- [x] **PASO A — desactivar proxy completo** (rename `proxy.ts` → `proxy.ts.disabled`) para aislar si bug era del proxy o de Vercel platform. Deploy sin proxy: **sigue 404**. Confirmó que NO era del proxy. Commit `6e32e97`.
- [x] **ROOT CAUSE descubierto vía `mcp__vercel__get_project`**: `"framework": null` en el proyecto Vercel. Sin framework detectado, Vercel platform no aplica el routing layer de Next.js y rebota 404 a TODO (estáticas Y route handlers), incluso con build OK. NodeVersion 24.x estaba bien (>=20.9 requerido para Next 16).
- [x] **Fix definitivo**: `"framework": "nextjs"` agregado a `vercel.json`. Restaurado `proxy.ts.disabled` → `proxy.ts`. Commits `18a2096` (proxy restaurado) + `4058cac` (vercel.json — quedó separado porque el primer commit omitió el `vercel.json` modificado, NO se hizo amend para respetar la regla).
- [x] **Validación end-to-end**: deploy `dpl_4gXmg6aQSTxbY2WgNCd79rM5FF7K` responde **HTTP 200** con HTML real (`<title>Eztadia — La forma serena...</title>`, tokens `cream`/`terracotta`/`sage`, fonts `_next/static/media/*.woff2`).
- [⏸️] **Commit local `f4e309e` (Prisma cleanup de sesión 9)** NO pusheado — decisión separada, no era el bug, solo cleanup. Usuario puede pushearlo en cualquier momento.

## 🎯 Próximo step

**Prioridad 1 — Smoke real en browser** (ahora que el deploy funciona):
- Login con cuenta del owner. Verificar que `requirePropertyRole` server-side autentica.
- Flujo público: visitar `/p/casa-marina`, iniciar booking, validar Turnstile widget aparece, completar form.
- Dashboard: navegar tabs (overview, calendar, bookings, rooms, pricing, reports), property-settings tabs (8 tabs).
- Validar Resend en runtime real: el `publicCreateHoldAction` debe disparar `booking-pending-payment` email al owner Resend (sandbox limita destinos).
- Validar webhook Wompi: requiere E1 (creds sandbox).
- Live CSV export download desde browser.
- iCal sync con URL real Booking/Airbnb (requiere feed config real).

**Prioridad 2 — Phase E1/E2 (cuando estés listo)**:
- E1 Wompi sandbox creds → smoke live PSE
- E2 WhatsApp Cloud API → setup Meta + webhook + plantillas

**Hardening tras destrabar (recomendado pronto):**
- Rotar Resend API key + Turnstile site/secret (compartidas en chat sesiones 8).
- Agregar hostname Vercel a Turnstile dashboard (`*.vercel.app` + dominio custom).
- Verificar dominio en Resend (F10) — sin esto solo se puede mandar a `carlossanjuan2113@gmail.com`.
- Considerar push de `f4e309e` (Prisma cleanup) — limpia 871 líneas de dead code.

**Phase D residual** (diferidos por buenas razones):
- D15-D19 next-intl — refactor masivo, solo cuando feature set frozen.
- D20 Plan + facturación tab — bloqueado por decisión de pricing.

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesión 10 (2026-05-23) — Destrabar Vercel deploy con Vercel MCP

**Vercel MCP como herramienta principal de diagnóstico**
- Configurado en sesión 9 (`claude mcp add --transport http vercel https://mcp.vercel.com`). En sesión 10 ya estaba OAuth-autenticado.
- Permite `mcp__vercel__get_runtime_logs` filtrando por `source=edge-middleware`/`serverless`, leer build logs, project metadata, deployments, `web_fetch_vercel_url` que bypasea SSO. **Redujo ciclo de diagnóstico ~10x.**
- `mcp__vercel__get_project` fue el que reveló el bug real (`framework: null`).

**Next 16 — upgrade mayor justificado**
- Aceptamos el upgrade porque Next 15.5.18 ignora el flag `experimental.nodeMiddleware` al bundlear. Next 15.6 no es estable (solo canary). Next 16.2.6 (estable) tiene proxy como Node default.
- **Convención cambia**: `middleware.ts` → `proxy.ts`. Función puede ser named (`export function proxy`) o default. Variable de config sigue siendo `config` (la docs Vercel skill estaba mal recomendando `proxyConfig`).
- Edge runtime NO soportado en `proxy`. Si necesitamos Edge en el futuro, hay que mantener `middleware.ts` (que sigue funcionando como compatibilidad).
- React 19.2 + cambios async API (cookies, headers, params, searchParams) — nuestro código ya estaba en 15 con async patterns, no requirió refactor.

**Webpack opt-out (Turbopack por default en Next 16)**
- `next build --webpack` en package.json. Hipótesis cautelar que resultó NO ser el bug, pero la mantenemos hasta validar que Turbopack production funciona en nuestro setup. Cuando confirmemos, podemos revertir a `next build` (Turbopack).

**`framework: nextjs` explícito en `vercel.json`** (root cause real)
- Sin esto, el proyecto Vercel quedaba con `framework: null` y rebotaba 404 a todo. Probablemente la auto-detección se rompió cuando renombramos `middleware.ts` → `proxy.ts` o durante el upgrade.
- Decisión: dejar el `framework` explícito como guard contra futuras re-detecciones fallidas.

**Tres skills de Vercel inyectadas** (aparecieron mid-sesión): `vercel:nextjs`, `vercel:next-upgrade`, `vercel:vercel-cli`, etc. Útiles pero la skill `vercel:nextjs` tenía info incorrecta sobre `proxyConfig`. **Verificar siempre contra docs oficial en `node_modules/next/dist/docs`** antes de aplicar.

**Memoria nueva probable** (a guardar): "Vercel MCP es prerequisito para debugging eficiente de deploys" + "framework auto-detección puede romperse con renames o major upgrades — `framework: nextjs` explícito en vercel.json es la defensa".

### Sesión 9 (2026-05-23) — Vercel MCP setup + Prisma cleanup

**Vercel MCP server** agregado a `~/.claude.json` con scope local del proyecto. Requirió restart de Claude Code para que apareciera en `/mcp`. OAuth flow completado al inicio de sesión 10.

**Prisma cleanup completo** (commit `f4e309e`, NO pusheado):
- Verificado: `@prisma/client` y `prisma` eran 100% dead code (cero imports en `.ts/.tsx`).
- Borra `prisma/schema.prisma` (601 líneas), 7 scripts npm (`db:*` + `postinstall`), saca `@prisma/client` + `.prisma/client` de `serverExternalPackages`.
- 4 archivos, -871/+2 líneas. Verde local (typecheck + build 35 rutas + 53 tests).
- **Resultó NO ser el bug** (sesión 10 lo confirmó). Sigue siendo cleanup válido si queremos eliminar la deuda. Decisión: usuario puede pushear cuando quiera.

### Sesión 8 (2026-05-23) — Phase E segunda ola + Vercel deploy intentos

**E4 Resend**
- **`onboarding@resend.dev` como FROM** para sandbox. Resend solo permite enviar al email-owner de la cuenta (`carlossanjuan2113@gmail.com`) hasta verificar dominio (F10). Documentado en `.env.local`.
- **Best-effort en wire-up**: cada `sendEmail` y dispatchers (`sendPaymentConfirmedEmail`, `sendPaymentRejectedEmail`) hacen try/catch propio. Si Resend falla → fila `failed` en `email_logs`, el flow principal (hold/payment/webhook) no se rompe.
- **Migration additive `email_status_failed`**: agrega valor al enum sin alterar filas existentes. Usuario autorizó explícitamente vía AskUserQuestion porque classifier bloqueó.
- **Templates sin custom fonts**: Fraunces no se puede embed reliable en email clients (Gmail strip @font-face). Fallback a serif del sistema (Cormorant/Garamond/Times). Mantenemos la jerarquía visual.
- **No wire-up de password-reset y staff-invitation templates en sesión 8**: Supabase Auth ya envía los emails estándar. Los templates propios quedan disponibles pero sin disparador hoy — evita duplicar correos al guest.
- **`shortReference(uuid)` helper** para mostrar 8 chars uppercase como código humano. Cuando el `booking.code` existe, gana sobre el short ref.

**E5 Turnstile**
- **Modo "Managed"** en Cloudflare. Mode "Invisible" reportado como más friction-free pero a veces no se confía: Managed escala.
- **Graceful degradation server + cliente**: sin `TURNSTILE_SECRET_KEY` → verify devuelve `ok: true`; sin `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → componente devuelve null y dispara `onToken("")`. Permite dev local sin cuenta Cloudflare.
- **Reset password verify devuelve siempre `ok: true`** aunque turnstile falle — política de "no filtrar existencia de cuentas" (mantenida).
- **Site key + secret compartidas en chat** → recomendación de rotar pronto. Mismo riesgo que con Resend.
- **Hostname `localhost` registrado**. Falta agregar dominio Vercel ahora que deploy funciona.

**Vercel — intentos de deploy preview sesión 8 (6 commits de debugging fallidos)**
- Todos esos commits (path alias middleware, getSession defensivo, middleware no-op, crons daily, lazy node-ical, eliminar `lib/db/index.ts`) estaban atacando la causa equivocada. La causa real era `@supabase/ssr` en Edge (sesión 10 lo confirmó). Documentado por completitud histórica; los fixes son inocuos.
- **Memoria nueva sesión 8**: `feedback_vercel_node_packages` con el patrón completo. Sigue vigente.

### Sesiones 1-7 — ver PROGRESS commits anteriores

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

### Resueltas en sesión 10
- ~~**Vercel deploy preview no carga**~~ ✅ **DESTRABADO** — `framework: nextjs` en vercel.json + upgrade Next 16 + proxy.ts
- ~~Validación end-to-end bloqueada por runtime bug~~ ✅ Desbloqueada (queda smoke browser real)

### Resueltas en sesión 8
- ~~E4 Resend wire-up~~ ✅ 6 templates + dispatch + wire-up booking/payment + migration
- ~~E5 Turnstile wire-up~~ ✅ verify + widget + wire-up 4 forms
- ~~Crons a daily para Hobby~~ ✅ deuda nueva pero deploy desbloqueado de ese ángulo
- ~~Push a GitHub~~ ✅ 30 commits subidos a `origin/main`
- ~~`.env.vercel.local`~~ ✅ generado, 13 vars

### Nuevas deudas creadas en sesión 10
- **Webpack opt-out en build**: `next build --webpack` es cautelar. Cuando validemos que Turbopack production funciona OK con nuestro stack, revertir a `next build` (Turbopack) para perf de builds.
- **`framework: nextjs` explícito en vercel.json**: defensa contra re-detección fallida. Si en el futuro Vercel mejora auto-detección, podríamos remover pero no urge.
- **Validación browser real pendiente**: el deploy carga pero ningún flow se testeó manualmente (login, booking, dashboard navigation, Turnstile widget, Resend email send).

### Nuevas deudas heredadas de sesión 8 (sin cambios)
- **Crons de Vercel a 1/día**: holds vencidos liberan inventario hasta 24h tarde, iCal sync con OTAs solo 1/día (riesgo double-booking real con Booking.com/Airbnb). Critical fix: upgrade Vercel Pro o migrar crons a Upstash QStash/GitHub Actions.
- **Resend `onboarding@resend.dev` sandbox**: emails solo al owner de Resend. Falta verificar dominio (F10).
- **Turnstile site/secret keys compartidas en chat** → rotar.
- **Resend API key compartida en chat** → rotar.
- **Hostname Vercel no agregado a Turnstile** → agregar `*.vercel.app` y el dominio custom cuando exista.
- **Prisma queda como dead code parcial** si no se pushea `f4e309e` (sesión 9): `prisma/schema.prisma` y `postinstall: prisma generate` siguen vivos pero nadie usa el cliente generado.

### Pendientes (sin cambios)
1. Wompi sandbox creds — pendiente smoke live HTTP PSE.
2. Realtime live test 2-tabs no corrido.
3. `messages: []` en BookingDetail (Phase E2 WhatsApp).
4. **`BookingStatus.refunded` enum** — classifier bloqueó la migration en sesión 7 sin OK explícito. Reintentar con autorización previa.
5. Mini-cal de precio efectivo por día en `/dashboard/pricing` — futuro D2.5.
6. Sin acción admin sobre bookings/properties (cancelar, suspend) — read-only.
7. Sidebar muestra "0 propiedades vinculadas" mid-revocation.
8. **`unreadMessages` sigue hardcoded 0** — no hay flag de unread en `whatsapp_messages`. Schema decision Phase E2.
9. **Webhook URL de WhatsApp no se muestra en config form** — route `/api/webhooks/whatsapp` no existe (Phase E2).
10. **Reports sin proyección/forecast** — solo histórico.
11. **Messages sin paginación** — top 500 conversaciones + 500 mensajes por thread.
12. **WhatsAppMessagesList sin paginación** — top 20 en config page.
13. **`response-time` metric omitido** del WeekPulse — depende de WhatsApp E2.
14. **Fiscal tab persistencia** — espera módulo facturación electrónica.
15. **Eliminar propiedad permanentemente** — requiere cascade SQL function + soft-delete UX defense.
16. **Smoke live iCal sync con URL real** Booking/Airbnb sandbox no corrido.

## ❓ Preguntas abiertas para el usuario

1. **Push `f4e309e` (Prisma cleanup sesión 9)** — limpia 871 líneas de dead code. ¿Pushear ahora?
2. **Rotar keys compartidas en chat**: Resend API key + Turnstile secret. Recomendable hacerlo pronto.
3. **Verificar dominio en Resend** — ¿compramos `eztadia.com` o usamos un dominio existente? Sin esto, emails solo al owner de la cuenta Resend.
4. **Vercel Pro trial** — para subir crons de daily a `*/5` y `*/15`. ¿Activamos los 14 días free?
5. Wompi sandbox creds — ¿cuándo?
6. WhatsApp Cloud setup — ¿agendamos sesión dedicada?
7. `BookingStatus.refunded` enum migration — pendiente desde sesión 7.
8. Pricing real para D20 (Plan + facturación tab).
9. Admin actions sobre bookings (cancelar, suspend) — necesita design discussion.

## 📂 Migrations aplicadas en remoto (13 totales — sin cambios sesiones 9 y 10)

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
├── 20260524010000_wompi_configs_is_active.sql
└── 20260524020000_email_status_failed.sql
```

## 🧪 Tests / verificaciones corridas

**Local (sesión 10):**
- ✅ `pnpm typecheck` clean tras upgrade a Next 16
- ✅ `pnpm build` con `--webpack` final: **34 rutas + Proxy registrado** (35 vs Next 15, una diferencia menor en cómo cuenta `/_not-found`)
- ✅ `pnpm test` — **53/53 tests passing** bajo Next 16

**Vercel (sesión 10):**
- ✅ Build completa en ~80s
- ✅ Runtime: HTTP 200 con HTML real de la app, headers OK, fonts cargando
- ✅ Confirmado vía `mcp__vercel__web_fetch_vercel_url` que el contenido es la app real (no SSO page, no 404)

**Pending sin cambios desde sesiones anteriores:**
- ⏸️ Live browser test no corrido (smoke real de login, booking, dashboard)
- ⏸️ Live CSV export download no probado
- ⏸️ Live iCal sync con URL real (Booking/Airbnb)
- ⏸️ Live email send (Resend) en runtime real
- ⏸️ Live Turnstile en runtime real

## 🔧 Setup de entorno actual

- Node v26.0.0 local, pnpm 9.15.0 via npx.
- Supabase CLI linkeada a `fdcgqywnwllfxpjrpako` (us-east-2).
- DB Postgres 17.6.
- Migrations totales: **13** (sin cambios sesión 10).
- **Vercel:** proyecto `eztadia` (`prj_YZO9AhJv4NLorTcx75PUTMIKaUqW`) en team `daniels-projects-8dbbaf4e`. Dominio principal `eztadia.vercel.app`. Plan **Hobby**. **nodeVersion 24.x**. **framework: nextjs** (forzado explícito en vercel.json desde sesión 10).
- **Resend:** cuenta creada, API key configurada, dominio sin verificar (sandbox).
- **Cloudflare Turnstile:** widget "Eztadia" creado, hostname `localhost` registrado (falta agregar dominio Vercel).
- **Vercel MCP server**: configurado en `~/.claude.json` (scope local), OAuth autenticado en sesión 10. Acceso a deployments, build logs, runtime logs, project metadata.
- Dependencies sesión 10: `next ^15.1.0` → `^16.2.6` (resolved 16.2.6).
- Dependencies sesión 8: `resend@^6.12.3`, `@react-email/components@^1.0.12`.

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
| 8 | 2026-05-23 night5 | ~5h | E4 Resend (wrapper + dispatch + 6 templates + wire-up + migration) + E5 Turnstile (verify + widget + wire-up 4 forms) + push 30 commits a GitHub + 6 intentos de fix de Vercel runtime (todos atacando causa equivocada) | Phase E segunda ola **bloqueado en Vercel runtime al cierre**. |
| 9 | 2026-05-23 late | ~1h | Vercel MCP setup + Prisma cleanup completo (commit local `f4e309e` no pusheado) + restart forzado de Claude Code para OAuth | Mid-session restart por requerimiento del MCP. |
| 10 | 2026-05-23 late2 | ~5h | Diagnóstico real vía Vercel MCP runtime logs + intento nodeMiddleware en 15 + upgrade Next 16 + rename middleware→proxy + 6 hipótesis fallidas + PASO A aisló proxy + descubrió `framework: null` en project Vercel + fix `framework: nextjs` en vercel.json + validación HTTP 200 con HTML real | **Vercel deploy DESTRABADO**. End-to-end queda smoke real en browser. |

## 📜 Historial de commits sesión 9 + 10

**Sesión 9 (1 commit local, NO pusheado):**
```
f4e309e chore(vercel): eliminar Prisma completo (dead code, hipótesis #3 deploy bug)
```

**Sesión 10 (7 commits, todos en `origin/main`):**
```
4058cac fix(vercel): framework:nextjs en vercel.json (parte 2)
18a2096 fix(vercel): forzar framework:nextjs + restaurar proxy.ts
6e32e97 debug(proxy): desactivar para aislar bug del 404 NOT_FOUND global
5b74d74 fix(proxy): usar named export en vez de default (Next 16 docs oficial)
27ed551 fix(build): opt-out de Turbopack en production build
24cf24c feat(next16): upgrade a 16.2.6 + rename middleware → proxy
36509f8 fix(middleware): forzar Node runtime para evitar __dirname en Edge
```

(Próximo commit END-SESSION sesión 10 agrega este PROGRESS.md actualizado.)
