# Eztadia — Progress Log

> Última actualización: 2026-05-25 por sesión Claude Code #13 (END-SESSION)
> Branch: `main`  ·  Último commit en origin: `2217eb4`  ·  Working tree clean.
> Phase activa: **Phase E + multi-tenant payments + página pública real + deuda chica histórica drenada.** Owner real puede crear cuenta, configurar bank account / Wompi, publicar página `/p/{slug}` con datos propios, y eliminar la propiedad con cascade real. Mini-cal de precios efectivos y badge unread de WhatsApp funcionales.

## 📍 Estado actual

**Phase:** E avanzada · payments multi-tenant resuelto · `/p/[slug]` ya no depende de demo data · deuda chica de Phase A drenada.
**Último step completado:** **Batch autónomo B+C** (sesión 13) — Language/Format real, Notifications real, delete property cascade, mini-cal pricing, WhatsApp unread end-to-end. Plus toda la sesión 13 cerró 6 deudas históricas: `/p/[slug]` wire-up + bank_accounts feature + lib/properties cleanup + sidebar race + onboarding checklist payments OR + Turbopack revert.
**Coverage local:** typecheck ✅ · build Turbopack ✅ (46 rutas) · tests 53/53 ✅
**Coverage producción:** todos los pushes deployados. Falta smoke browser asistido del flow nuevo (bank tab, mini-cal, delete cascade, unread badge).

**Bloqueado por:** ninguno técnico. Pendientes humanos:
- Wompi sandbox creds (E1) — standby
- WhatsApp Meta setup (E2 prod) — standby
- Verificar dominio en Resend (F10) — workaround "Confirm email OFF" sigue en pie
- Org "Casona" huérfana en DB (cleanup chico, 1 query Studio)

## ✅ Steps completados

Phase B (sesión 2): B1–B18
Phase C (sesión 3): C1–C6 + hardening
Phase D primera ola (sesión 4): D1, D2, D5, D6, D7, D13
Phase D segunda ola (sesión 5): D3, D4, D8, D9, D10, D11, D12
Limpieza transversal (sesión 6): property-settings 8 tabs + admin pages reales + CSV exports + 12 RLS tests
Phase E primera ola (sesión 7): E3 iCal sync + E6 Storage Photos + Wompi is_active + Reports source breakdown + admin/users on-demand
Phase E segunda ola (sesión 8): E4 Resend + E5 Turnstile + push 30 commits a GitHub + crons daily (Hobby) + `.env.vercel.local` generado · Vercel deploy bloqueado al cierre
Sesión 11 (signup + onboarding flow real): 7 fixes encadenados en signup/turnstile/wizard + MVP opción D onboarding progresivo
Sesión 12 (no documentada al cierre, recuperada en sesión 13): D-completo (drawer roomType + dismiss + celebración + analytics) + UX acento neutral + sidebar consistente + dashboard wire-ups reales (hoursAway/checkInTime/AttentionList) + perfil /settings tab conectado a BD
Sesión 13: bank_accounts multi-tenant + /p/[slug] real + 5 features autónomas (Language/Notifications/delete-property/mini-cal/WhatsApp unread) + reconciliación drift de migrations + 10 commits / 5 migrations aplicadas

**Sesión 13 (2026-05-25) — bank_accounts + /p/[slug] real + batch autónomo B+C:**

Sesión larga focalizada en cerrar deuda histórica acumulada de Phase A/B. Daniel autorizó modo "haz todo lo que puedas de manera autónoma" tras los primeros wins. 10 commits pusheados, 5 migrations aplicadas al remoto, 1 feature multi-tenant crítica resuelta.

Orden cronológico:

1. **Turbopack opt-out revertido** (`dd15b0f`) — `next build --webpack` (cautelar de sesión 10) → `next build` (Turbopack default Next 16). Verde verificado: 46 rutas. Builds más rápidos en CI/Vercel.
2. **`/p/[slug]` wire-up a BD real** (`dfa39c8`) — `lib/db/queries/public-property.ts` con `getPublicPropertyBySlug` (joins room_types + rooms para units count + adapter DB→Property con defaults para campos sin schema). Ruta pasa a `force-dynamic`, elimina demo CASA_MARINA. Documento como B6 incremental.
3. **`/p/[slug]` degrada bien con datos mínimos** (`7da8108`) — fixes en PropertyHero (usa photos[0] real / oculta rating si 0 / oculta neighborhood si duplica city), PropertyMap (oculta OSM si coords {0,0}), PropertyFAQ + Amenities + Description (return null si vacíos), PropertyGallery (sin "Casa Marina" hardcoded, count real, link "#" muerto fixed). 7 archivos.
4. **lib/properties.ts cleanup** (`ffec2be`) — drop CASA_MARINA + getProperty + getAllPropertySlugs. Solo quedan tipos (consumidos por components). 142→13 líneas.
5. **bank_accounts feature multi-tenant** (`577fbc5` + `455affe`) — **Bug grave resuelto:** `CASA_MARINA_BANK` hardcoded en `lib/booking-flow.ts` significaba que cualquier owner que ofreciera transferencia mostraba al guest "transfiere a Casa Marina S.A.S." Implementado end-to-end:
   - Schema `bank_accounts` (1:1 con property, UNIQUE constraint, enums BankAccountHolderDocumentType y BankAccountType, RLS anon SELECT si is_active + owner/manager write)
   - Tab "Pagos" nuevo en property-settings con form completo + delete con confirmación
   - `PaySectionManual` recibe `bank: BankAccount | null` (fallback WhatsApp si null)
   - `BookingForm` esconde opción "Transferencia" si bank no configurada
   - Defensa server en `publicCreateHoldAction` rechaza manual_transfer si bank null
   - Type `BankAccount` evolucionado: docType dinámico CC/CE/NIT + notes opcional
6. **Onboarding checklist payments OR** (`4cae8d3`) — item "payments" ahora se completa con Wompi O bank (antes solo Wompi). Label dinámico según método configurado, href dinámico al tab correspondiente.
7. **Sidebar race "0 propiedades vinculadas"** (`58716fa`) — 3 capas de defensa: layout redirect a /onboarding si properties=[], /onboarding muestra mensaje "Esperando invitación" para staff sin asignaciones (en lugar del wizard que requiere owner), sidebar empty state con CTA "Crear nueva propiedad" como defense in depth.
8. **Batch B+C** (`b6ca041`) — 5 features en un commit:
   - **B1 Language/Format** real: migration `profile_format_prefs` (date_format + number_format text con CHECK) + getLanguagePrefs query + updateLanguagePrefsAction. LanguageTab persiste real, timezone sigue demo (per-property, no per-user).
   - **B2 Notifications prefs** real: migration `profile_notification_prefs` (jsonb) + getNotificationPrefs query con sanitize sobre DEFAULT_PREFS al leer + updateNotificationPrefsAction. NotificationsTab con optimistic toggle (revert si action falla).
   - **C1 Eliminar propiedad cascade**: migration `delete_property_cascade` (SQL function security definer + GRANT) + deletePropertyAction valida confirmSlug match + clean cookie active_property + redirect según haya otras properties. DeletePropertyModal reescrito con input que pide typear el slug exacto.
   - **C2 Mini-cal precio efectivo**: PricingMiniCalendar (nuevo) — grid 30 días con precio efectivo por día (rate aplicable con mayor priority o base), tooltip con nombre del rate, color dorado para overrides, botones prev/next periodo. Integrado en RoomTypeRow.
   - **C3 WhatsApp unread end-to-end**: migration `whatsapp_messages_read_at` (read_at timestamptz + índice parcial) + ConversationSummary.recentInbound (hack 48h) → unreadCount real + getUnreadMessagesCount + markConversationAsRead. Dashboard layout carga unread real (antes hardcoded 0). Messages page auto-marca al abrir conversación. Badge "N sin leer" sage en ConversationsList.
9. **chore types regen** (`2217eb4`) — pnpm supabase:gen-types tras aplicar las 4 migrations. Solo 1+/-4 diff cosmetic (CLI formatea delete_property_cascade en 1 línea vs mis 3).

**Reconciliación drift de migrations** (mid-sesión, antes de poder hacer push de bank_accounts):
- Estado original: 6 migrations en remoto sin tracking local (timestamps 20260523141452-191913) + 6 locales sin tracking remoto (20260523120100-300 + 20260524000000-020000). Causa: sesiones 2/7/8 aplicaron via `mcp__supabase__apply_migration` que usa el timestamp del momento de aplicación en lugar del nombre del archivo.
- Fix: `supabase migration repair --status reverted` ×6 para olvidar entries fantasma + `--status applied` ×6 para sincronizar locales ya aplicadas físicamente. Luego `db push` aplicó solo bank_accounts (la realmente nueva).
- Aprendizaje: **NUNCA usar `mcp__supabase__apply_migration` sin también escribir el archivo local con el mismo timestamp**. Mejor flujo: archivo local primero → `npx supabase db push --linked`.

**Tareas diferidas en sesión 13:**
- **A2 org Casona huérfana**: requiere acción manual (Supabase MCP no se autenticó por OAuth fail, Daniel puede correr el query en Studio en 30s).
- **B3 Sessions tab**: complejidad alta (SQL function en schema auth + parsing user_agent + geolocation IP) vs ROI bajo para owners boutique. Sigue demo.

**Sesión 12 (recuperada de git log al inicio de sesión 13 — no había sido documentada al cierre):**

5 commits no documentados encontrados via `git log` al arrancar sesión 13:

- `b04d6f8` **D-completo**: Drawer roomType inline en checklist + dismiss persistente cookie 1 año + OnboardingCelebration 5/5 + audit_log `onboarding.item_completed` + bitmask + rollback de org si property falla + mensaje 23505 "Esa URL pública ya está tomada" + cleanup RoomsData dead code.
- `edb69be` **UX acento neutral + sidebar consistente**: sin voseos, rename Configuración → "Mi cuenta" / "Ajustes".
- `6ebb91f` **Dashboard wire-ups reales**: UpcomingCheckIns fecha real, hoursUntilCheckIn UTC-5, AttentionList "Ver comprobante"/"Enviar bienvenida" wire-up real (wa.me/{phone}).
- `f0a7460` **Perfil settings tab real**: `/dashboard/settings?tab=profile` conectado a BD (queries/profile.ts + validation/profile.ts + actions/profile.ts). Resto de tabs (Sessions/Notifications/Security backupCodes/Language formatos/Billing) sigue demo.
- `c523a0b` PROGRESS.md sesión 11.

Lección: **siempre cerrar sesión con END-SESSION** o esa información queda solo en git log.

**Sesión 9 (mid-session restart, 2026-05-23):**
- [x] Vercel MCP server agregado a `~/.claude.json` (scope local). Restart forzado para que apareciera en `/mcp`.
- [x] Commit local `f4e309e` — `chore(vercel): eliminar Prisma completo` (4 archivos, -871/+2 líneas: borra `prisma/schema.prisma`, remueve 7 scripts npm, saca `@prisma/client` de `serverExternalPackages`, `pnpm remove prisma @prisma/client`). **NO pusheado.** Resultó NO ser el bug (sesión 10 lo confirmó) pero sigue siendo dead-code cleanup válido.
- [x] Verde local: typecheck · build (35 rutas) · 53/53 tests.

**Sesión 11 (2026-05-23 madrugada) — smoke real + bug fixes encadenados + MVP opción D:**

Arrancada: continuar desde sesión 10 (deploy destrabado) para correr smoke real en browser. Daniel hizo los clicks, encontró 7 bugs en cascada, y al llegar al dashboard cuestionó el modelo del onboarding wizard (recolectaba datos que se descartaban). Decisión de pivot a onboarding progresivo estilo Linear/Notion.

Bugs encontrados y arreglados (en orden cronológico):

- [x] **Hostname Vercel no en whitelist Turnstile** (Cloudflare dashboard). NO bug nuestro — Daniel agregó `eztadia.vercel.app` + `eztadia-git-main-...vercel.app` en el dashboard de Cloudflare Turnstile.
- [x] **Bug: acceptTerms checkbox no validaba** (commit `75b60fc`). Causa: SignupForm usaba `useState` local + `<input type="hidden">` con `value={accept ? "true" : ""}` (string) pero el schema esperaba `z.literal(true)` (boolean). Fix: `setValue("acceptTerms", v, { shouldValidate: true })` en el onChange del Checkbox. Hidden input eliminado.
- [x] **Bug: Turnstile token reusado tras error** (commit `b803f92`). Causa: tokens Turnstile son single-use, y cualquier error post-verify (validación, double-click) reusaba el mismo token → `timeout-or-duplicate`. Fix: `key={turnstileResetKey}` incremental en los 4 forms (signup/login/booking/reset) — re-mount fuerza widget fresh. Además: `console.error("turnstile_failed action=X reason=Y")` server-side en 4 actions para diagnosticar futuras fallas via runtime logs.
- [x] **Mejora mensajes signup específicos** (commit `7a7be1f`). Antes: cualquier error de Supabase Auth devolvía "No pudimos crear tu cuenta. Intenta de nuevo." Ahora: buckets por `registered` (ya existe), `invalid + email` (dominio mal), `password` (no cumple). `console.error` con status/code/message de Supabase para futuros casos.
- [x] **Diagnóstico vía Supabase Auth logs (MCP)**: encontré que Daniel escribió `gmail.om` (sin "c") — Supabase rechazó. Tras corregir, Daniel pegó contra **429 email rate limit exceeded** (Supabase default: 2 emails/h GLOBAL por proyecto, no por email).
- [x] **Mensaje específico para rate limit** (commit `8f7f421`). Mensaje claro: "Demasiados intentos. Esperá unos minutos y volvé a probar."
- [x] **SMTP custom configurado en Supabase Auth** (Daniel, manual en dashboard). Datos: `smtp.resend.com:465`, user `resend`, password = `RESEND_API_KEY`, sender `onboarding@resend.dev`. Esto destrabó el rate limit de 2/h.
- [x] **Daniel hit Resend sandbox 550** ("only owner email" — Resend solo deja mandar a `danielmartinezvivero@gmail.com`). Workaround: **deshabilitar "Confirm email"** en Supabase Auth Providers → Email (Daniel, manual). Cuentas se crean sin verificar (deuda de seguridad para prod — re-habilitar tras verificar dominio en Resend F10).
- [x] **UX: widget Turnstile abajo del botón submit** (commit `2e9f375`). Daniel reportó "no queda claro el flujo". Movido arriba del botón en los 4 forms. No agregué `disabled={!turnstileToken}` porque rompe dev local sin keys.
- [x] **Bug crítico: React error #185 "Maximum update depth exceeded"** en `/onboarding` (commit `451ca81`). Stack apuntaba al wizard. Root cause: en los 3 steps el patrón `const values = watch(); useEffect(() => setX(values), [values, setX])` — `watch()` sin args devuelve objeto nuevo cada render → dep cambiada → setState → re-render → loop infinito. Fix: subscription pattern `useEffect(() => { const sub = watch(d => setX(d)); return () => sub.unsubscribe(); }, [watch, setX])`. Pre-existente, no apareció antes porque nadie había llegado al wizard real (Phase A demo data). Aplicado a Step1Org, Step2Property, Step3Rooms (este último después eliminado en MVP D).
- [x] **Bug: "Ya existe un registro con esos datos" tras completar wizard** (commit `a13d86b`). Causa: WelcomeFinal disparó `createPropertyOnboardingAction` 2 veces (re-mount reseteó `submittedRef`). Primer intento creó org+property; segundo chocó con `properties_slug_key` UNIQUE → 23505. Fix: idempotencia en el action — `getFirstAccessibleProperty()` early return si ya tiene property.
- [x] **Manual: verifiqué state DB de Daniel via Supabase MCP**: user `pepito@gmail.com` ya tenía org `Casona` (1 huérfana duplicada) y property `la-casona`. Daniel fue manualmente a `/dashboard` y entró OK.

**Pivot conceptual: opción D (onboarding progresivo)** — Daniel notó que el wizard pedía 14 campos pero solo persistía 5 (Step 3 entero descartado, billingEmail/country/type/description/photos descartados). Le presenté 3 opciones (C wizard híbrido, A wire-up completo, B encuesta ligera) más una D que improvisé (onboarding progresivo estilo Linear/Notion/Stripe — signup mínimo + checklist persistente en dashboard). Daniel eligió D pero con scope MVP en esta sesión + D-completo en sesión dedicada.

- [x] **MVP opción D implementado** (commit `ed80f80`, **NO pusheado al cierre**):
  - Wizard recortado a 2 steps (org + property). `Step3Rooms.tsx` eliminado del filesystem (recuperable de git history).
  - Stepper actualizado a 2 dots con grid template ajustado.
  - Store: tipo `OnboardingStep` cambia `1|2|3|"done"` → `1|2|"done"`. `nextStep(2) → "done"`.
  - Nueva query: `lib/db/queries/onboarding-checklist.ts` → `getChecklistStatus(propertyId)` computa 5 flags en paralelo (room_type, photos, pricing, payments, publish) y devuelve items con label + href + done. Tipo `ChecklistStatus`.
  - Nuevo componente: `components/dashboard/OnboardingChecklist.tsx` (server component). Panel con header "Configurá tu propiedad", contador X/5, progress bar, lista clickeable. Items completados muestran check verde + line-through. Items pendientes muestran descripción + arrow. Self-hide cuando `allDone=true`.
  - Icon nuevo: `IconCheck` en `components/dashboard/icons.tsx` (no usamos lucide/shadcn — SVG inline propio).
  - Wire-up en `app/dashboard/page.tsx`: agregado a `Promise.all` y renderizado entre `Greeting` y la grid principal.
  - 5 items con hrefs verificados: `/dashboard/rooms`, `/dashboard/property-settings?tab=photos`, `/dashboard/pricing`, `/dashboard/integrations/wompi`, `/dashboard/property-settings?tab=general`.
  - Verificado: typecheck ✅ + production build ✅ (35 rutas).

**Sesión 10 (2026-05-23) — destrabar Vercel deploy:**

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

**Prioridad 1 — Smoke browser asistido del flow nuevo de sesión 13:**
- Daniel clickea, Claude monitorea Vercel runtime logs + Supabase logs via MCP.
- Cubrir: tab Pagos (crear/editar/eliminar bank_account) + `/p/{slug}` con datos reales + flow guest con transferencia + delete propiedad con cascade real (probar en property test, NO la principal) + mini-cal pricing + badge unread WhatsApp (requiere insertar fake messages).
- Cubrir también lo que quedó pendiente de sesiones previas: calendar, bookings, rooms (otra vez tras pagos), reports, property-settings (los 9 tabs ahora con Payments incluido), nueva reserva manual.

**Prioridad 2 — E1/E2 humano (cuando Daniel pueda)**:
- E1 Wompi sandbox creds → smoke live PSE end-to-end
- E2 WhatsApp Cloud API → setup Meta + webhook handler + plantillas. Schema base ya está (whatsapp_messages.read_at agregado en sesión 13).
- F10 Verificar dominio en Resend (eztadia.co u otro) → re-habilitar "Confirm email" en Supabase Auth

**Cleanup DB (1 query Studio, ~30s):**
```sql
DELETE FROM organizations
WHERE name='Casona'
  AND owner_id='58255331-963b-4d54-b680-f7b722f9f286'
  AND id NOT IN (SELECT organization_id FROM properties WHERE name='La Casona');
```

**Deudas diferidas (a re-priorizar):**
- **B3 Sessions tab**: SQL function en schema auth + parsing user_agent + geolocation IP. Complejidad alta vs ROI bajo. Sigue demo.
- **Onboarding checklist autom-add bank**: hoy el checklist solo lista 5 items fijos. Si quisiéramos "configura método de cobro" con sub-items expandibles (PSE + Transfer), requiere refactor del shape ChecklistItem.
- **WhatsApp config form completar**: el form de `/dashboard/integrations/whatsapp` muestra business_account_id + phone_number_id pero falta el access_token rotation UX limpio y el preview del webhook URL.
- **PaymentMethod en booking puede ser "external"/"admin_override"**: hoy NewBookingTrigger soporta los 4 pero la UI pública solo expone PSE + manual_transfer. Para reservas manuales internas (sin guest), está OK; bug edge si admin crea con un tipo y guest visita el flow.

**Hardening pendiente:**
- Rotar Resend API key + Turnstile site/secret (compartidas en chat sesiones 8).
- Crons Vercel a daily (Hobby plan) — holds vencen hasta 24h tarde, iCal sync 1/día (riesgo double-booking real).

**Phase D residual** (diferidos por buenas razones):
- D15-D19 next-intl — refactor masivo, solo cuando feature set frozen.
- D20 Plan + facturación tab — bloqueado por decisión de pricing.

## 🧾 Decisiones tomadas que NO están en el blueprint

### Sesión 13 (2026-05-25) — payments multi-tenant + batch autónomo

**bank_accounts: 1:1 con property (UNIQUE), no 1:N**
- Daniel eligió simple sobre flexible. Cubre el 95% de casos boutique. Si owner quiere cuenta USD + COP en el futuro, evolucionar a 1:N con `is_primary`.
- Tab dedicado "Pagos" en property-settings (entre Horarios y Domicilio fiscal). Wompi sigue en `/integrations/wompi` por ahora — eventualmente migrar a un solo "Métodos de cobro" en property-settings.

**Fallback flow guest si bank no configurada: desactivar opción Transferencia**
- Daniel eligió la opción más estricta (vs mostrar mensaje "contactá por WhatsApp"). UX más clara: solo ofrecemos lo que sí podemos cobrar. Defensa server-side adicional: `publicCreateHoldAction` rechaza `manual_transfer` si bank no existe (defensa contra POST manuales).
- `PaySectionManual` igual incluye un fallback (CTA WhatsApp) por si llegan via URL antigua tras eliminar bank.

**Type BankAccount evolucionado de {bank, accountType, accountNumber, holder, nit} → agrega holderDocType (CC/CE/NIT) + notes opcional**
- El field `nit` asumía empresa colombiana. Realidad: muchos owners son persona natural (CC). Schema enum cubre los 3 tipos comunes.
- Label dinámico en PaySectionManual: "CC: 1.024.567.890" o "NIT: 900.123.456-7" según corresponda.

**delete_property_cascade SQL function vs DELETE en TS**
- Function security definer es el patrón correcto: borrado atómico, RLS bypass controlado, validación interna `is_property_owner` defense in depth (además de la del action). DELETEs explícitos en orden para no depender de CASCADE de FKs (algunas tablas creadas via Prisma original sin CASCADE garantizado).
- Audit_logs NO se borran — quedan como registro histórico. Si compliance "right to be forgotten" requiere borrarlos también, agregar `DELETE FROM audit_logs WHERE property_id = p_id` al inicio (es seguro porque están sanitizados).

**UX confirmación delete: typear slug exacto (no "DELETE")**
- Slug es el identificador público que el owner ya conoce y verá frecuentemente. Más natural escribirlo que "DELETE all caps". El input usa font-mono para que distinga del prosa normal.

**Onboarding checklist payments OR (Wompi || bank), no AND**
- Daniel eligió OR. Razón: ambos métodos habilitan cobros igual. Forzar AND empuja al owner a configurar Wompi aunque solo planee transferencia (fricción innecesaria para owners que aún no abrieron cuenta de comercio).
- Label dinámico según método configurado evita ambigüedad ("PSE conectado con Wompi" vs "Transferencia bancaria configurada").

**Notification prefs: jsonb en profiles, no tabla dedicada**
- ~30 toggles total, todos del mismo user, sin FKs. Una columna alcanza. Si en el futuro queremos analytics agregados ("cuántos owners desactivaron weekly-summary"), migramos a tabla con tracking.
- Query sanitiza al leer (merge sobre DEFAULT_PREFS, descarta keys desconocidas). Resiliente a evolución del shape sin migration cada vez.

**Sessions tab DIFERIDO (no implementado)**
- Requiere SQL function en schema `auth` (auth.sessions no es accesible via PostgREST) + parsing user_agent + geolocation IP. Complejidad alta (~3h).
- ROI bajo para owners boutique (cada uno tiene 1-2 dispositivos). Re-priorizar si llega feedback de owners con staff distribuido.

**Drift de migrations reconciliado (lección crítica)**
- Estado pre-sesión 13: 6 entries fantasma en remoto + 6 locales sin tracking. Causa: `mcp__supabase__apply_migration` aplica el SQL pero usa el timestamp del momento como version, no el del archivo local.
- Fix: `repair --status reverted` para fantasmas + `repair --status applied` para locales aplicadas físicamente. Sin tocar el schema real.
- **REGLA NUEVA**: NUNCA usar `mcp__supabase__apply_migration` sin también escribir el archivo local con el mismo timestamp. Mejor flujo: archivo local primero → `npx supabase db push --linked`.

**Modo autónomo extendido funcionó bien**
- Daniel dio "haz todo lo que puedas autónomamente" → completé 7 de 8 tareas planeadas con tasks tracked, sin pausas innecesarias para clarificación. Las 2 diferidas (A2 cleanup DB, B3 Sessions) lo fueron por buenos motivos (autenticación faltante / complejidad vs ROI).
- Para próximas sesiones de scope grande: presentar plan en batches A/B/C, dar autorización general, reportar al final. Más eficiente que ir consultando cada step.

### Sesión 12 (2026-05-23 noche tarde) — Recuperada de git log

**D-completo: drawer roomType inline + dismiss + celebración + analytics**
- Item 1 del checklist abre RoomTypeFormDrawer inline (no link-out) — primera "completable in-place" del checklist. Items 2-5 mantienen link-out porque sus forms son más complejos (mejor en sus páginas dedicadas).
- Dismiss persistente cookie `eztadia.onboarding_dismissed` (1 año). Owner puede skip aunque no esté 5/5.
- OnboardingCelebration al llegar 5/5: banner one-shot con CTA "Ver página pública", cookie `eztadia.onboarding_celebrated` evita re-show.
- Analytics: bitmask en cookie + `audit_log` action `onboarding.item_completed` cada vez que un item pasa pending → done. Permite analizar drop-off por item.

**Rollback de org si createProperty falla**
- Antes: si `createPropertyOnboardingAction` fallaba en el step de property (ej. slug duplicado), la org quedaba huérfana. Ahora hace rollback explícito.

**Mensaje específico 23505 properties_slug_key**
- "Ese slug ya está en uso" → "Esa URL pública ya está tomada" (slug no es palabra común).

**Acento neutral en UI (sin voseos)**
- Daniel reportó voseos argentinos en textos UI. Cambios: "Configurá → Configura", "Hacelos → Hazlos", "tenés/podés → tienes/puedes", "Esperá → Espera", "Probá → Prueba".
- También: rename "Configuración" duplicada (sidebar Cuenta + topnav PropertyTabs apuntaban a páginas distintas) → "Mi cuenta" (perfil) vs "Ajustes" (property-settings). Sidebar agrega item "Ajustes" siempre accesible.

**Dashboard wire-ups reales**
- UpcomingCheckIns: fecha real del booking (antes hardcoded "21 may").
- getAttentionItems: acepta `propertyCheckInTime` + computa `hoursUntilCheckIn` real asumiendo timezone America/Bogota.
- AttentionList: "Ver comprobante" → `/dashboard/bookings/{id}` (antes ancla muerta). "Enviar bienvenida" → `wa.me/{phone}` con plantilla en español (degrada a "Ver reserva" si guest sin phone).

**Perfil /settings real**
- ProfileTab conectado a BD via getOwnerProfileForSettings + updateProfileAction. Bio field eliminado (no existe en schema profiles; si lo agregamos, migration aparte).
- Resto de tabs (Sessions/Notifications/Security backupCodes/Language/Billing) sigue demo — sesión 13 conectó Language + Notifications.

### Sesión 11 (2026-05-23 madrugada) — Smoke real + opción D onboarding

**Opción D (onboarding progresivo) elegida sobre el wizard tradicional**
- Daniel cuestionó que el wizard pidiera 14 campos pero solo persistiera 5. Le presenté 3 opciones (C híbrido, A wire-up completo, B encuesta) más D que improvisé.
- D = signup mínimo + checklist persistente en dashboard, estilo Linear/Notion/Stripe. Daniel valoró el approach por la fluidez/menos fricción.
- **Implicación**: el wizard ya NO pretende ser setup completo. Es solo "crea tu organización + propiedad" (lo mínimo para que el dashboard pueda renderizar). El resto se hace en el dashboard mismo con el checklist como guía.
- **MVP**: wizard 2 steps + componente OnboardingChecklist en dashboard. **D-completo** (modals, celebración, dismiss, analytics) queda para sesión dedicada.

**Daniel prefiere UX progresivo > wizards largos** (preferencia general detectada)
- Aplica también a otras decisiones futuras: cuando haya tensión "wizard up-front vs. progressive disclosure", inclinar hacia progressive disclosure.
- Tono que valora: "una herramienta que te acompaña" vs "una herramienta que te hace llenar formularios". Hotelería boutique es relacional — ese tono importa.

**SMTP custom de Resend configurado en Supabase Auth dashboard** (Daniel, manual)
- Datos: host `smtp.resend.com`, port 465, user `resend`, password = `RESEND_API_KEY`, sender `onboarding@resend.dev`.
- **Destraba el rate limit GLOBAL de Supabase Auth** (2 emails/h sin SMTP custom, confirmado en sesión 11). Ahora rate limit es el de Resend (100/día sandbox, ilimitado en plan paid).

**"Confirm email" deshabilitado en Supabase Auth Providers** (Daniel, manual — workaround temporal)
- Razón: Resend sandbox solo permite enviar al email-owner de la cuenta (`danielmartinezvivero@gmail.com`). Cualquier signup con otro email choca con 550. Deshabilitar confirm email evita disparar Resend en signup → owner puede crear cuenta con cualquier email.
- **Deuda crítica para prod**: cuentas se crean sin verificar email. Re-habilitar tras verificar dominio en Resend (F10).

**Mejoras estructurales en signup/turnstile** (aplicables a futuros forms con captcha)
- Patron `key={resetKey}` para reset Turnstile en error — ya aplicado a 4 forms; replicar en cualquier form nuevo con Turnstile.
- Logs `console.error("X_failed action=Y reason=Z")` en server actions con verify externo — visible en Vercel runtime logs filtrando por level=error.
- Buckets de error en mensajes UI (registered/invalid+email/password/rate-limit) en lugar de fallback genérico — el genérico oculta bugs reales que son data entry.

**Subscription pattern para react-hook-form + Zustand** (importante para futuros forms)
- NO hacer `useEffect(() => setStore(watch()), [watch(), setStore])` — loop infinito por nueva ref cada render.
- SÍ hacer `useEffect(() => { const sub = watch(d => setStore(d)); return () => sub.unsubscribe(); }, [watch, setStore])`.
- Aplicar también si en el futuro se persiste otro form externo (booking flow, settings, etc.).

**Vercel teamId correcto detectado**: `team_3bbaiNSZp6e3Zp500LOSGP6I` (no `team_jzNCAcVc4U6Ut1WohcRgsDYn` que tenía PROGRESS de sesión 10 mal). Corregido en setup actual.

**Idempotencia en server actions que crean recursos UNIQUE** (lección)
- `createPropertyOnboardingAction` ahora hace early-return si el user ya tiene property. Pattern aplicable a cualquier server action invocada desde `useEffect` que puede re-disparar en remount/refresh.

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

### Resueltas en sesión 13
- ~~Turbopack opt-out cautelar~~ ✅ `dd15b0f` (verificado verde, revertido a `next build`)
- ~~`/p/[slug]` 100% demo data (deuda B6 incremental)~~ ✅ `dfa39c8` + `7da8108` (wire-up + degrada bien)
- ~~lib/properties.ts demo CASA_MARINA dead code~~ ✅ `ffec2be` (142→13 líneas, solo tipos)
- ~~`CASA_MARINA_BANK` hardcoded en flow guest (bug grave multi-tenant)~~ ✅ `577fbc5` (bank_accounts feature completa)
- ~~Onboarding checklist payments solo Wompi~~ ✅ `4cae8d3` (ahora Wompi OR bank)
- ~~Sidebar "0 propiedades vinculadas" race~~ ✅ `58716fa` (3 capas defensa)
- ~~Language/Format tab sigue demo~~ ✅ `b6ca041` (B1)
- ~~Notifications tab sigue demo~~ ✅ `b6ca041` (B2)
- ~~"Eliminar propiedad permanentemente" requiere cascade SQL function~~ ✅ `b6ca041` (C1)
- ~~Mini-cal precio efectivo en /pricing (D2.5)~~ ✅ `b6ca041` (C2)
- ~~`unreadMessages` hardcoded 0 + sin schema unread~~ ✅ `b6ca041` (C3)
- ~~Drift de migrations local vs remoto~~ ✅ reconciliado mid-sesión

### Nuevas deudas creadas en sesión 13
- **B3 Sessions tab DIFERIDA**: complejidad alta vs ROI (ver razonamiento en decisiones).
- **Onboarding checklist no expandible**: si en el futuro queremos "configura método de cobro" con sub-items, requiere refactor del shape ChecklistItem.
- **Wire-up sesión 12 sin documentar al cierre**: 5 commits que tuvimos que recuperar de git log al arrancar sesión 13. Lección capturada: siempre END-SESSION.

### Resueltas en sesión 11
- ~~SignupForm acceptTerms bug~~ ✅ commit `75b60fc`
- ~~Turnstile token reuso tras error~~ ✅ commit `b803f92` (reset via key + log reason)
- ~~Signup mensajes opacos~~ ✅ commits `7a7be1f` + `8f7f421` (buckets registered/invalid/password/rate-limit)
- ~~Hostname Vercel no en whitelist Turnstile~~ ✅ Daniel manual en Cloudflare
- ~~Supabase Auth rate limit 2/h~~ ✅ Daniel configuró SMTP custom Resend en Supabase dashboard
- ~~UX widget Turnstile abajo del botón~~ ✅ commit `2e9f375` (movido arriba en 4 forms)
- ~~React error #185 loop en wizard~~ ✅ commit `451ca81` (subscription pattern en 3 steps)
- ~~Wizard creaba duplicados en re-mount~~ ✅ commit `a13d86b` (idempotencia)
- ~~Wizard recolectaba 14 campos pero descartaba 9~~ ✅ commit `ed80f80` (recortado a 2 steps + checklist en dashboard)

### Nuevas deudas creadas en sesión 11
- **"Confirm email" deshabilitado en Supabase Auth** — workaround temporal hasta F10. Cuentas se crean sin verificar email. **CRÍTICO para prod**: re-habilitar tras verificar dominio en Resend.
- **D-completo pendiente**: modals/drawers contextuales, celebración, dismiss persistente, analytics de completitud (próxima sesión dedicada).
- **`RoomsData` + `rooms` field en onboarding-store.ts** — dead code post-MVP D. Limpieza pendiente.
- **1 organization "Casona" huérfana en DB de Daniel** (intentos de signup duplicados pre-fix idempotencia). Cleanup query en "Próximo step".
- **Mensaje específico para 23505 en `properties_slug_key`** — hoy queda genérico "Ya existe un registro". Mejor: "Esa URL pública ya está tomada".
- **Transacción org+property en createPropertyOnboardingAction** — sin transacción, si property falla la org queda huérfana.

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

1. **Rotar keys compartidas en chat**: Resend API key + Turnstile secret. Recomendable pronto.
2. **Verificar dominio en Resend (F10)** — ¿compramos `eztadia.co` o usamos uno existente? Sin esto: "Confirm email" sigue OFF en Supabase Auth (deuda de seguridad).
3. **Vercel Pro trial** — para subir crons de daily a `*/5` y `*/15`. ¿Activamos los 14 días free?
4. Wompi sandbox creds — ¿cuándo?
5. WhatsApp Cloud setup — ¿agendamos sesión dedicada?
6. `BookingStatus.refunded` enum migration — pendiente desde sesión 7.
7. Pricing real para D20 (Plan + facturación tab).
8. Admin actions sobre bookings (cancelar, suspend) — necesita design discussion.
9. **D-completo**: cuándo agendamos sesión dedicada (3-4h)? Idealmente antes de invitar betas reales — el checklist actual es funcional pero los items linkean a páginas externas (rompe el flow). Modals/drawers contextuales mejoran mucho la sensación.

## 📂 Migrations aplicadas en remoto (18 totales — +5 en sesión 13)

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
├── 20260524020000_email_status_failed.sql
├── 20260524030000_bank_accounts.sql                 # sesión 13
├── 20260524040000_profile_format_prefs.sql          # sesión 13
├── 20260524050000_profile_notification_prefs.sql    # sesión 13
├── 20260524060000_delete_property_cascade.sql       # sesión 13
└── 20260524070000_whatsapp_messages_read_at.sql     # sesión 13
```

Drift tracking remoto reconciliado: 6 entries fantasma (`20260523141452-191913`) marcadas como reverted + 6 locales sin tracking marcadas como applied. Schema real intacto.

## 🧪 Tests / verificaciones corridas

**Local (sesión 13):**
- ✅ `npx tsc --noEmit` clean tras cada batch (10+ runs)
- ✅ `npx next build` — **46 rutas + Proxy registrado** con Turbopack
- ✅ `npx pnpm test` — **53/53 passing** post bank_accounts + post batch B+C

**Producción (sesión 13):**
- ✅ Vercel re-deploys automáticos para cada push (10 deploys exitosos)
- ⏸️ Smoke browser asistido del flow nuevo NO corrido (siguiente prioridad):
  - Bank tab end-to-end
  - `/p/{slug}` con datos reales
  - Mini-cal pricing visual
  - Badge unread WhatsApp (requiere fake messages para probar)
  - Delete propiedad cascade (probar en property test, NO la principal)

**Pending sin cambios desde sesiones anteriores:**
- ⏸️ Live CSV export download
- ⏸️ Live iCal sync con URL real (Booking/Airbnb)
- ⏸️ Live booking flow PSE (requiere Wompi creds E1)
- ⏸️ Live WhatsApp message (requiere Meta setup E2)

## 🔧 Setup de entorno actual

- Node v26.0.0 local, pnpm 9.15.0 via npx.
- Supabase CLI linkeada a `fdcgqywnwllfxpjrpako` (us-east-2).
- DB Postgres 17.6.
- Migrations totales: **18** (+5 en sesión 13 — bank_accounts, profile_format_prefs, profile_notification_prefs, delete_property_cascade, whatsapp_messages_read_at).
- **Vercel:** proyecto `eztadia` (`prj_YZO9AhJv4NLorTcx75PUTMIKaUqW`) en team `daniels-projects-8dbbaf4e` (**teamId real: `team_3bbaiNSZp6e3Zp500LOSGP6I`** — corregido en sesión 11). Dominio principal `eztadia.vercel.app`. Plan **Hobby**. **nodeVersion 24.x**. **framework: nextjs** (forzado explícito en vercel.json desde sesión 10).
- **Resend:** cuenta creada, API key configurada, dominio sin verificar (sandbox). **SMTP custom configurado en Supabase Auth** (sesión 11).
- **Cloudflare Turnstile:** widget "Eztadia" creado, hostnames: `localhost` + `eztadia.vercel.app` + `eztadia-git-main-daniels-projects-8dbbaf4e.vercel.app` (sesión 11).
- **Supabase Auth: "Confirm email" deshabilitado** (sesión 11, workaround temporal). Re-habilitar tras F10.
- **Vercel MCP server**: configurado en `~/.claude.json` (scope local), OAuth autenticado en sesión 10. Acceso a deployments, build logs, runtime logs, project metadata. **Supabase MCP** también activo y útil para `get_logs(auth)` y `execute_sql`.
- Dependencies sesión 10: `next ^15.1.0` → `^16.2.6` (resolved 16.2.6).
- Dependencies sesión 8: `resend@^6.12.3`, `@react-email/components@^1.0.12`.
- Sesiones 11–13: sin nuevas dependencies. Sesión 13 confirma Turbopack production OK (script `build` revertido a `next build`).

## 🗃️ Datos en DB de testing (sesión 11)

- User `pepito@gmail.com` (Daniel Martinez, id `58255331-963b-4d54-b680-f7b722f9f286`)
- 2 organizations "Casona" (1 huérfana del intento de signup duplicado pre-fix idempotencia — limpiar en sesión 12)
- 1 property "La Casona" slug `la-casona` (id `618e8c5e-b699-4e23-b30d-a0fe9a8e5cbd`)
- Link owner OK en property_users
- Sin room_types · sin gallery · sin wompi_config · is_active=false (checklist debería marcar 0/5)

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
| 11 | 2026-05-23 madrugada | ~4h | Smoke real iniciado por Daniel + 7 bugs en cascada arreglados (acceptTerms checkbox, Turnstile reuso, signup mensajes opacos, rate limit Supabase, UX Turnstile, React #185 wizard, idempotencia onboarding) + SMTP Resend manual + Confirm email OFF (workaround) + pivot a opción D + MVP D implementado (wizard 2 steps + OnboardingChecklist en dashboard) | **Signup → dashboard funcional end-to-end**. D-completo queda para sesión 12. |
| 12 | 2026-05-23 noche tarde | ~3h | D-completo (drawer roomType + dismiss + celebración + analytics) · UX acento neutral + sidebar consistente · dashboard wire-ups reales · perfil settings tab a BD | Sesión NO documentada al cierre — recuperada de git log al inicio de sesión 13. |
| 13 | 2026-05-25 | ~6h | bank_accounts multi-tenant (schema+UI+flow público) · /p/[slug] wire-up a BD real + degrada bien · lib/properties cleanup · Turbopack revert · sidebar race fix · onboarding checklist payments OR · batch B+C (Language/Notifications/delete-property/mini-cal/WhatsApp unread) · drift de migrations reconciliado · 5 migrations aplicadas + 10 commits pusheados | **Deuda chica histórica drenada + payments multi-tenant resuelto.** B3 Sessions diferida. |

## 📜 Historial de commits sesión 13 (10 commits, todos en origin/main)

```
2217eb4 chore(types): regen database.types post 4 migrations (B+C batch)
b6ca041 feat(batch): B1+B2+C1+C2+C3 — language/notifications/delete-property/mini-cal/whatsapp-unread
58716fa fix(dashboard): elimina race '0 propiedades vinculadas' mid-revocation
4cae8d3 feat(onboarding): item 'payments' se completa con Wompi O transferencia
455affe chore(types): regen database.types post bank_accounts migration
577fbc5 feat(payments): bank_accounts por property + tab Pagos + flow publico real
ffec2be chore(cleanup): lib/properties.ts solo tipos (drop CASA_MARINA demo + funciones)
7da8108 fix(public): /p/[slug] degrada bien con datos minimos
dfa39c8 feat(public): /p/[slug] wire-up a BD real (B6 incremental)
dd15b0f chore(build): revertir Turbopack opt-out (verificado verde en Next 16)
```

## 📜 Historial de commits sesión 12 (5 commits, todos en origin/main)

```
f0a7460 fix(profile): conectar /dashboard/settings perfil a BD real
6ebb91f fix(dashboard): hoursAway + checkInTime reales + wire-up botones AttentionList
edb69be fix(ux): acento neutral + sidebar consistente para property-settings
b04d6f8 feat(onboarding): D-completo — drawer roomType + dismiss + celebracion + analytics
c523a0b chore: PROGRESS.md sesion 11 (smoke real + 7 fixes encadenados + MVP opcion D)
```

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

**Sesión 11 (8 commits — primeros 7 en `origin/main`, `ed80f80` local sin pushear al cierre):**
```
ed80f80 feat(onboarding): MVP opcion D — wizard 2 steps + checklist en dashboard   [LOCAL]
a13d86b fix(onboarding): idempotencia en createPropertyOnboardingAction
451ca81 fix(onboarding): infinite render loop en los 3 steps del wizard
2e9f375 fix(ux): mover widget Turnstile arriba del boton submit en 4 forms
8f7f421 fix(signup): mensaje claro para Supabase email rate limit (429)
7a7be1f fix(signup): mensajes de error especificos + log de Supabase Auth
b803f92 fix(turnstile): reset widget en error + log reason server-side
75b60fc fix(signup): aceptTerms desde useState a setValue de RHF
```

(Próximo commit END-SESSION sesión 11 agrega este PROGRESS.md actualizado.)
