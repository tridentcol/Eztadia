# Eztadia — Progress Log

> Última actualización: 2026-05-22 por sesión Claude Code #1 (retrofit)
> Branch: `main`  ·  Último commit: `c936434` (pre-retrofit; el commit retrofit lo agrega esta sesión)
> Phase activa: **B · Backend Infrastructure**

## 📍 Estado actual

**Phase:** B · Backend Infrastructure
**Último step completado:** B0 (bootstrap pre-B1: scaffold + reconciliación de docs + fix bug Phase A + MCP Supabase config)
**Próximo step:** B1 · Setup Supabase project
**Bloqueado por:** Credenciales Supabase (5 env vars + DB password) — pendientes de que el usuario pegue desde dashboard, o se restart de sesión para tener tools MCP `mcp__supabase__*` disponibles y extraerlas vía MCP.

## ✅ Steps completados

(Checklist B1-B18 del blueprint Sección 17.2. Solo se marca lo realmente hecho.)

- [ ] B1 Setup Supabase project
- [ ] B2 Schema Prisma + tipos generados
- [ ] B3 RLS policies + SQL functions
- [ ] B4 Supabase Auth real
- [ ] B5 Data layer · queries
- [ ] B6 Reemplazar demo data en páginas
- [ ] B7 Server Actions para mutaciones
- [ ] B8 Zod validation schemas
- [ ] B9 Auth session helpers
- [ ] B10 Tests de aislamiento RLS
- [ ] B11 Webhook /api/webhooks/wompi
- [ ] B12 Upload /api/upload/payment-proof
- [ ] B13 Upload /api/upload/property-photo
- [ ] B14 Cron /api/cron/expire-holds
- [ ] B15 Export iCal
- [ ] B16 Audit log helper
- [ ] B17 vercel.json con cron schedule
- [ ] B18 Verificación end-to-end

### B0 · Bootstrap pre-B1 (no estaba en el blueprint, agregado por necesidad)

- [x] Repo init + remote `https://github.com/tridentcol/Eztadia.git` (commit `205aa9c`)
- [x] Primer commit del scaffold de Next.js (commit `c936434`, 190 archivos)
- [x] **`package.json` lift-eado a la raíz** desde `designs/package.json` mal ubicado + `npx pnpm install` corrido (deps resueltas: next 15.5.18, react 19.2.6, etc.)
- [x] **Fix bug Phase A:** `components/dashboard/UpcomingCheckIns.tsx` → agregado `"use client"` (pasaba `onClick` desde Server Component → 500 en `/dashboard`)
- [x] Rename `eztadia-blueprint.md` → `EZTADIA-BLUEPRINT.md` (case-sensitive en Linux/Vercel)
- [x] Creación de `CLAUDE.md` en raíz con paths reconciliados al código real
- [x] Reconciliación de `EZTADIA-BLUEPRINT.md` Secciones 17.1, 11, 15, 17.2 B6, 17.3 C1-C6 para reflejar realidad del código
- [x] Verificación de frontend: dev server arranca en ~1s, 12 rutas devuelven 200 (`/`, `/login`, `/signup`, `/onboarding`, `/dashboard`, `/dashboard/calendar`, `/dashboard/bookings`, `/dashboard/staff`, `/dashboard/integrations`, `/dashboard/integrations/wompi`, `/dashboard/property-settings?tab=general`, `/dashboard/settings?tab=profile`, `/admin`, `/admin/users`, `/p/casa-marina`, `/p/casa-marina/booking/new`, `/forbidden`)
- [x] **MCP Supabase agregado** vía `claude mcp add` → `.mcp.json` creado en raíz (project_ref `fdcgqywnwllfxpjrpako`). Auth completada por usuario en otra sesión. ⚠ Las tools MCP no están en esta sesión (se cargan al iniciar) — requiere restart o pegar credenciales manualmente.

## 🎯 Próximo step — detalle

**Step:** B1 · Setup Supabase project (estimado 30 min)

**Lo que hay que hacer:**

1. Recibir/extraer credenciales Supabase del usuario o vía MCP:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (sensible)
   - `DATABASE_URL` (con `?pgbouncer=true`, puerto 6543)
   - `DIRECT_URL` (puerto 5432, sin pgbouncer)
   - `NEXT_PUBLIC_APP_URL` (`http://localhost:3000` en dev)
2. Crear `.env.local` con esas vars (verificar que está en `.gitignore` — ya lo está).
3. Crear `.env.example` con las mismas claves vacías (committeable, sin secretos).
4. Instalar Supabase CLI local: `npx pnpm add -D supabase`
5. Ejecutar `npx supabase init` para crear estructura local (`supabase/config.toml`).
6. Ejecutar `npx supabase link --project-ref fdcgqywnwllfxpjrpako`.
7. Verificar conexión: `npx supabase db remote commit` o equivalente que muestre que la CLI ve el proyecto.

**Restricciones específicas:**

- `SUPABASE_SERVICE_ROLE_KEY` NUNCA en código cliente; solo en `lib/supabase/admin.ts` (Phase B4).
- `.env.local` NO se commitea.
- Región es **us-east-1** (confirmada por usuario; buena latencia para Colombia).

**Definition of done:**

- Dashboard Supabase accesible (verificable vía MCP tools o login web).
- `.env.local` cargado con las 6 env vars y leído por Next.js (`next dev` arranca sin warnings de env faltante en lo referente a Supabase).
- Supabase CLI puede ejecutar comandos contra el proyecto remoto (proxy de auth funciona).

## 🧾 Decisiones tomadas que NO están en el blueprint

**2026-05-22** — `package.json` se creó en raíz como **lift de `designs/package.json` mal ubicado**, no vía `pnpm init`. Razón: el archivo en `designs/` tenía la lista exacta de deps que el blueprint pedía + matcheaba 100% la auditoría de imports del código fuente. Lift evita riesgo de divergencia de versiones. `name` cambió de `"eztadia-landing"` a `"eztadia"`. El `designs/package.json` original sigue ahí (no se borró, está committeado en `c936434` — pendiente decidir si se borra en sesión futura).

**2026-05-22** — **pnpm se usa vía `npx pnpm ...`**, NO instalado globalmente. Razón: el classifier de Auto Mode bloqueó `npm install -g pnpm` por ser cambio de estado global no autorizado. `npx pnpm@9.15.0 install` funciona y queda fijado vía campo `packageManager` en `package.json`. Para todos los comandos futuros (`pnpm dev`, `pnpm add ...`, etc.), prefijar con `npx`.

**2026-05-22** — **Phosphor NO está instalado como paquete**, contra lo que afirmaba el blueprint en múltiples lugares. Los iconos son **SVG inline propios** en `components/icons.tsx` + `components/<dominio>/icons.tsx`. Stroke típico 1.5–1.7. Blueprint Secciones 11, 15 (#3, #20) actualizadas para reflejar esto. Mantener este patrón — NO instalar `@phosphor-icons/react` ni `phosphor-react` ni `lucide-react`.

**2026-05-22** — **`UpcomingCheckIns.tsx` ahora declara `"use client"`**. Razón: era Server Component pero pasaba `onClick={() => window.location.href = href}` a un `<tr>`, lo que rompía `/dashboard` con error 500 ("Event handlers cannot be passed to Client Component props"). Fix mínimo, sin cambio visual. ⚠ Este es el único bug detectado de Phase A — no se hizo barrido sistemático de patrones similares en otros componentes.

**2026-05-22** — **Estructura real difiere del blueprint en 8 puntos clave**, reconciliados en Sección 17.1 del blueprint (no se movieron archivos):
1. Componentes en `components/` (raíz), no en `app/components/`
2. Sin carpeta `components/ui/` separada — primitives coladas por dominio
3. `lib/` plano, no `lib/demo/`
4. Sin route group `(auth)` — rutas auth directas
5. `designs/` tiene 13 archivos HTML planos, no 16 subcarpetas por pantalla
6. Ornamentos en un solo archivo `components/shared/Ornaments.tsx`, no carpeta dedicada
7. No existe `EZTADIA-DESIGN-BRIEF.md` (el blueprint lo asume)
8. No existía `package.json` en raíz hasta hoy

**2026-05-22** — **MCP Supabase agregado a scope project** (`.mcp.json` committeable, sin secretos). Project ref `fdcgqywnwllfxpjrpako`. Región us-east-1 confirmada. Auth completada por usuario en otra sesión Claude Code. ⚠ Tools MCP `mcp__supabase__*` NO están cargadas en la sesión actual (se cargan al boot) — primera sesión que arranque después del commit las tendrá disponibles automáticamente.

**2026-05-22** — Skill oficial `supabase/agent-skills` **NO se instaló** (usuario decidió no, no son necesarias por ahora). Si en B3 (RLS policies, el step más delicado) necesitamos extra ayuda, considerar instalarlo entonces.

## ❓ Preguntas abiertas para el usuario

1. **Credenciales Supabase** (5 env vars + DB password) — pendiente: pegarlas en chat al iniciar B1, o restart de sesión para extraerlas vía MCP.
2. **Supabase CLI local sí/no:** ¿quieres que use `npx supabase init` + `link` + `db push` para manejar migrations desde local, o solo dashboard remoto + Prisma? Recomiendo CLI local (versiona migrations en `supabase/migrations/*.sql` → reproducibilidad). El blueprint asume CLI local.
3. **¿Borro `designs/package.json` ahora ocioso, o lo dejo?** No afecta runtime, pero genera confusión histórica.
4. **Cambios B0 sin commitear (queda fuera de este retrofit por SCOPE STRICT):** `.mcp.json`, `EZTADIA-BLUEPRINT.md` (rename), `package.json`, `pnpm-lock.yaml`, modificación de `UpcomingCheckIns.tsx`. ¿Hago un commit `chore: Phase B0 bootstrap` al inicio de la próxima sesión, o los meto en el commit de B1?

## 📂 Archivos críticos creados/modificados

### Creados (esta sesión)
- `README.md` (commit `205aa9c`)
- `.gitignore` (commit `c936434`)
- Scaffold Next.js completo: `app/**`, `components/**`, `lib/**`, `designs/**`, configs (commit `c936434`)
- `package.json` (uncommitted, B0)
- `pnpm-lock.yaml` (uncommitted, B0)
- `EZTADIA-BLUEPRINT.md` (uncommitted, rename desde `eztadia-blueprint.md`, B0)
- `CLAUDE.md` (uncommitted al momento del retrofit; se commitea en este retrofit junto con `PROGRESS.md`)
- `.mcp.json` (uncommitted, B0)
- `PROGRESS.md` (este archivo, retrofit)

### Modificados (esta sesión)
- `components/dashboard/UpcomingCheckIns.tsx` — agregado `"use client"` (uncommitted, B0)
- `EZTADIA-BLUEPRINT.md` — Secciones 17.1, 11, 15, 17.2 B6, 17.3 C1-C6 actualizadas (uncommitted, B0)

### Eliminados (esta sesión)
- Ninguno.

## 🧪 Tests / verificaciones corridas

- ✅ `npx pnpm install` — 51 paquetes resueltos, 0 errores.
- ✅ `npx pnpm dev` — arranca en ~1s en `http://localhost:3000`.
- ✅ Smoke test de 12 rutas vía `curl` — todas 200 después del fix de `UpcomingCheckIns`. Lista de rutas en sección B0 arriba.
- ❌ `pnpm build` — NO corrido (verificación dev fue suficiente).
- ❌ `pnpm typecheck` / `pnpm lint` — NO corridos (sin tests/lint Phase A todavía).

## 🔧 Setup de entorno actual

- **Node:** v26.0.0 (Homebrew, `/opt/homebrew/bin/node`).
- **npm:** Homebrew (`/opt/homebrew/bin/npm`, prefix `/opt/homebrew`).
- **pnpm:** NO instalado globalmente. Usar `npx pnpm ...` siempre. Versión fijada vía `packageManager: pnpm@9.15.0` en `package.json`.
- **corepack:** NO disponible en PATH (no shipped con este Node de Homebrew).
- **curl:** disponible en `/usr/bin/curl` pero NO en PATH del shell (zsh) — usar ruta absoluta para scripts.
- **git:** funciona; remote `origin` apunta a `https://github.com/tridentcol/Eztadia.git`; `main` está pusheado.

### Env vars necesarias (.env.local, pendientes)
- `DATABASE_URL` (Supabase, pgbouncer puerto 6543)
- `DIRECT_URL` (Supabase, puerto 5432)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (`http://localhost:3000` en dev)

## 📊 Bitácora de sesiones

| # | Fecha | Horas | Steps abordados | Notas |
|---|-------|-------|-----------------|-------|
| 1 | 2026-05-22 | ~2h | repo init + commit primer scaffold + reconciliación docs + scaffold pnpm + fix bug Phase A + MCP Supabase config + retrofit continuidad (este commit) | Sesión cubrió 3 momentos: (1) `git init` y bootstrap; (2) auditoría completa y reconciliación blueprint↔código; (3) retrofit del workflow de continuidad. B1 quedó bloqueado pendiente de credenciales. |

## 📜 Historial de commits recientes

```
c936434 Add Next.js project scaffold
205aa9c first commit
```

(El commit de este retrofit se agregará al final del PASO 4 y aparecerá como tercer entry en la próxima sesión.)
