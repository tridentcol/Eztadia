# Eztadia — Notas de diseño

Notas para la **landing pública** y la **página pública de propiedad**
(`/p/[slug]`). La estética buscada es editorial-orgánica (Cereal/Kinfolk
editado por un ingeniero), no SaaS template ni Airbnb-clone.

> **Índice**
> 1. [Landing — decisiones](#landing-page-decisiones-no-obvias)
> 2. [Property page — decisiones](#property-page-decisiones-no-obvias)
> 3. [Dashboard — decisiones](#dashboard-decisiones-no-obvias)
> 4. [Calendar — decisiones](#calendar-decisiones-no-obvias)
> 5. [Variantes descartadas](#variantes-descartadas)
> 6. [Assets necesarios](#assets-necesarios-unsplash-queries)
> 7. [Tipografía](#tipografía--notas-técnicas)
> 8. [Accesibilidad](#accesibilidad--checklist)
> 9. [Cómo ejecutar](#cómo-ejecutar)
> 10. [Estructura del proyecto](#estructura-del-proyecto)

---

## Landing page — decisiones no obvias

### 1. Hero asimétrico 60/40 — sin screenshot del producto
La columna derecha es **una sola foto vertical 3:4** de habitación boutique,
no un mockup del dashboard. Razón: el producto se vende por confianza estética
("yo quiero hospedar así") más que por features visibles. Una nota tipo Polaroid
rotada -2.4° sobre la foto sí muestra una métrica del producto ("12 reservas
confirmadas") — sugiere el dashboard sin enseñarlo.

### 2. La "Polaroid" no es decoración — es la única prueba social del hero
Reemplaza el típico bloque "trusted by". Es Fraunces italic con oldstyle
numerals, en una tarjeta blanca con shadow-soft y rotación leve. Cumple tres
funciones: prueba que el sistema mide reservas, ancla geográficamente
(Cartagena), y le da textura editorial al hero.

### 3. Subrayado curvo en "habitaciones"
SVG manual con curva de Bezier suave, no `text-decoration: underline`. Lo
posicioné a -18px abajo, ancho 104% para que sobresalga del texto. En --gold
con opacity 0.8 para que no compita con el titular. Es el único ornamento
gráfico del hero junto al trazo de tinta esquinero.

### 4. Trust bar tipográfico, no logos
El brief lo pedía pero refuerzo el razonamiento: Eztadia es Colombia + boutique
+ humano. Logos grises de "Cloudbeds·Mews·Lodgify" comunicarían SaaS
genérico. Tres frases en Fraunces italic separadas por puntos --gold dicen lo
mismo con voz propia.

### 5. Layout 12-col en "Por qué Eztadia" — anti grid 2x2
Cada feature ocupa span variable y tiene offset vertical distinto
(`pt-20`, `pt-10`, `self-end`). Esto rompe el grid simétrico y forza una
lectura editorial diagonal. Los números 01–04 en Fraunces italic oldstyle a
72–96px funcionan como "drop caps" de revista.

### 6. Conectores entre pasos de "Cómo funciona"
En lugar de flechas o numeritos centrados, hay líneas hairline horizontales
con un punto --gold de 6px al centro, entre cada card. Solo visibles en
desktop (lg+). Conecta sin gritar.

### 7. Quote section con comilla fantasma
Una `“` de Fraunces a 180px en --gold/22% absolute arriba-izquierda. Suficiente
peso para anclar la composición, baja saturación para no robarle al texto del
testimonio. Reemplaza el típico card con bordes y avatar centrado.

### 8. Pricing — solo 2 cards, una "Pronto"
Mostrar 3 planes inflaría artificialmente. Dos cards en grid simétrico con la
de Pro en opacity 0.9 + badge "Próximamente" en pill --gold/14% comunica
honestidad: "estamos construyendo, pero ya puedes usar gratis".

### 9. Closing — card cream sobre foto fullbleed
La card está anclada `bottom-left` en desktop (margin 80px), pero en mobile se
extiende horizontalmente (left: 20, right: 20). Esto evita que en pantallas
pequeñas el card quede minúsculo flotando.

### 10. Footer en `--ink` (warm black)
Único bloque "oscuro" de la página. Cumple dos funciones: contraste de cierre
y reverso visual del cream principal. Los headers de columna van en `--gold`
para mantener la voz editorial.

---

## Property page — decisiones no obvias

### 1. Hero NO es el mosaico Airbnb
Una sola foto fullbleed con margen lateral de 32px y `border-radius: 40px`,
en lugar del clásico mosaico de 5–6 fotos pegado al borde. La razón es lo
opuesto a Airbnb: queremos transmitir **calma, no abundancia**. El huésped no
está comparando — está decidiendo si confía en este lugar.

### 2. Card cream sobrepuesto al hero — overhang -80px
El bloque `--cream` con el nombre de la propiedad **sobresale** -80px del
borde inferior de la imagen. Esto crea una composición estilo revista (la
imagen no es un fondo sino un objeto encuadrado) y rompe la jerarquía
visual común "imagen arriba, texto abajo". Sin shadow agresivo — un
`shadow-soft` apenas perceptible.

### 3. La meta-info del hero usa estrella `--gold`, no amarilla
`★ 4.9 (87 reseñas)` — el icono va en `--gold #B8923E`, no en el amarillo
brillante de Airbnb/Google. Mantiene la calma cromática.

### 4. Layout 2-cols + widget sticky **no es** un copy de Airbnb
La diferencia clave: el booking widget está a la derecha **dentro del flujo
del contenido**, no flotando sobre la galería. Y mide 360px, no 480. Hay
respiración entre las dos columnas (`gap-[72px]`). El widget se **separa
visualmente** del contenido mediante `box-shadow: shadow-soft` muy suave —
no por bordes pesados.

### 5. Las habitaciones son **una lista vertical**, no un grid
Cada habitación es una fila horizontal con foto a la izquierda (~38%) y
contenido a la derecha. Esto fuerza al huésped a **leer** cada habitación
en vez de comparar visualmente — alineado con la voz boutique. En mobile
colapsa a vertical con foto 16:9 arriba.

### 6. Precio total **dinámico** según fechas
Las cards de habitación leen el `BookingContext` y actualizan su precio en
tiempo real: si no hay fechas, muestran "$450.000 COP · desde / noche"; si
hay rango, muestran "$1.350.000 total" + "3 noches × $450.000". Mismo
patrón en el widget y en el botón flotante mobile.

### 7. El titular de "Habitaciones" cambia con las fechas
Sin fechas: "Tres formas de quedarte." (afirmativo, calmado).
Con fechas: "Elige tu lugar para estos días." (vocativo, presente).
Microcopy reactivo > microcopy reactivo > microcopy estático.

### 8. Date picker custom — el detalle más importante
**No usé shadcn `Calendar` ni `react-day-picker`.** Lo construí desde cero
porque era el componente con mayor riesgo de "look SaaS". Decisiones:
- Días en **Fraunces oldstyle nums** (no Inter)
- Día seleccionado en `--sage` con `--cream` text
- Rango intermedio en `--sage-tint` sin border-radius (slab continuo)
- Días no disponibles **tachados con line-through** (no opacity sola)
- Header de mes en Fraunces italic 18px con `<span class="oldstyle">2026</span>`
- Navegación con chevrons phosphor, no ‹›
- Botones "Limpiar fechas" (underline link) + "Listo" (ink solid)
- Sin sombras pesadas — `shadow-pop` muy contenido

Esta es la pieza donde se nota más la diferencia con un template default.

### 9. Amenities sin cards, sin background
Solo ícono Phosphor 20px stroke 1.5 + texto. Grid de 2/4 columnas según
ancho. Es lo que pide el brief, pero hago notar la razón: cards/pills para
amenities **infla la sección** y traiciona la calma del resto.

### 10. Map pin custom, no SVG default de Mapbox
Forma orgánica gota-lágrima en `--terracotta` con stroke `--clay` y un
círculo `--cream` adentro. Posicionado `translate(-50%, -100%)` para que la
punta marque el lugar. Drop-shadow suave para que se despegue del mapa.

Decisión técnica: el mockup usa **OpenStreetMap static** (sin auth) en
lugar de Mapbox. Para producción, swap por Mapbox `light-v11` style con
token — el código deja un comentario indicando el patrón URL.

### 11. FAQ accordion con + que rota 45° a ×
En lugar del clásico +/− toggle, el icono `Plus` rota 45° en `transform`
transition para volverse una × — más editorial. El color cambia de
`--ink-soft` a `--sage` al abrir. Transición con la curva cubic-bezier del
sistema, 300ms.

### 12. Mobile floating CTA reaccionando al precio mínimo
El botón terracotta flotante en mobile lee `Math.min(rooms.basePriceCOP)` y
muestra "Reservar · desde COP $220.000". Mismo precio que el widget
desktop arriba. Click abre bottom sheet con drag handle visible
(width: 40px, height: 4px, bg: `--rule-strong`) — gesto de "puedo cerrar
esto".

### 13. Una sola estrella, no cinco
En la meta del hero hay UNA estrella `★ 4.9`. En el header de cada
habitación, UNA estrella `★ Para 2 personas`. Nunca cinco. Cinco estrellas
gritan "review system" — una sugiere "calidad".

### 14. Galería masonry asimétrica, no grid 3×3
8 fotos con `grid-column: span N` y `grid-row: span N` variables. La
primera ocupa 7×5 (hero de la galería), luego varios 5×3, 4×3, 3×4. Esto
crea ritmo visual editorial. En mobile colapsa a un grid 2×N homogéneo.

### 15. Footer mínimo, sin logos de Eztadia
Una sola línea centrada: "Hospedaje gestionado con Eztadia · Cartagena,
Colombia". La propiedad es el protagonista — Eztadia firma con discreción.
"Eztadia" es link clickeable.

---

## Dashboard — decisiones no obvias

### 1. Sidebar EN CREAM, no en negro
Esta es la diferencia más visible vs Trello/Linear/Notion. La sidebar comparte
`--cream` con el contenido principal, separada solo por una hairline
`--rule` a la derecha. La sensación es la de un cuaderno con margen y
contenido en el mismo papel — no la de una app SaaS con chrome oscuro.

### 2. Logo + property switcher arriba, no dropdown header tipo SaaS
"Eztadia" (con su punto `--gold`) sigue siendo identidad de la marca, pero
debajo está el property switcher: foto 32px + nombre en Fraunces italic +
chevron. Click expande lista de propiedades + "Crear nueva propiedad" en
`--sage`. Mucho más boutique que el `<select>` típico arriba a la izquierda.

### 3. Item activo: bg sage-tint + dot sage a la izquierda
El item activo tiene `bg: --sage-tint`, texto e ícono en `--sage`,
font-weight 500. Y además **un punto vertical pequeño de 3×16px en `--sage`
absolute a la izquierda del item** — un marcador editorial que reemplaza
la barra de selección típica gruesa de Notion/Linear.

### 4. Greeting time-aware con día y mes
"Buenas tardes, *Carlos*." en Fraunces 44px italic en la palabra Carlos.
El subtítulo en Inter dice "Hoy es viernes 21 de mayo. Tienes 2 cosas
pendientes y un check-in en 2 horas." con **negritas en las cantidades**
(usando regex split para parametrizarlo automáticamente). Esto es lo que
reemplaza el clásico "Welcome back, Carlos 👋" — más humano, más útil.

### 5. Greeting cambia según contexto
Si no hay pendientes, el subtítulo cambia a "Sin pendientes. Buen momento
para revisar el calendario." (afirmativo, calmado). Esto es microcopy
reactivo — Carlos no necesita ver "0 cosas pendientes 🎉".

### 6. Layout 8/4, NO 4 KPI cards
La diferencia más obvia con dashboards genéricos: NO hay 4 cards en grid 4×1
con `+12% verde` y `-3% rojo`. En lugar de eso, **acciones a la izquierda
(8 cols), pulso a la derecha (4 cols)**. La pregunta del owner no es "cómo
voy" sino "qué hago ahora" — el layout lo responde.

### 7. Métricas SIN cards, hairlines entre ellas
Cuatro métricas en columna, separadas por `border-bottom: 1px var(--rule)`.
Números en Fraunces oldstyle 44px. Pills `--sage-tint` para cambios
positivos, `--linen` para breakdowns. Sin cards, sin sombras, sin colores
de status agresivos. La barra de ocupación es una hairline de 4px de altura
con `border-radius: 999px` — no un progress bar gordo.

### 8. Attention list = lista de cartas tipo "papel"
Cada item es una card `--paper` con border `--rule` (sin shadow base —
shadow-soft solo en hover). Avatar 44px circular: para huéspedes nuevos,
iniciales en `--sage-tint`; para huéspedes con foto, la foto. Pills de
estado en `--gold-tint` (esperando), `--sage-tint` (acción positiva),
`--linen` (informativo).

### 9. Tres acciones distintas, tres botones distintos
- "Ver comprobante" → ghost cream con border `--rule` (acción de revisar)
- "Enviar bienvenida por WhatsApp" → sage solid con ícono WhatsApp inline (acción positiva)
- "Responder" → ghost cream (acción esperada, no positiva)

No usé `--terracotta` para ninguna porque ninguna es "comenzar". La
jerarquía de color refleja la jerarquía emocional de la acción.

### 10. Quote del WhatsApp pendiente en Fraunces italic
Cuando un huésped potencial pregunta por WhatsApp, su pregunta se muestra
**en Fraunces italic 13px** (la única vez en la pantalla que el contenido
del huésped es protagonista). Esto refuerza la voz humana del canal — no
es un "ticket #1234".

### 11. Tabla de check-ins editorial, no data-grid
Headers en Inter 11 uppercase tracking 0.05em --ink-muted. Nombres en
Fraunces italic 15px. Habitación number en `--ink medium` resaltado del
texto del room. Fechas en oldstyle nums con día en mayúscula
("Hoy", "Mañana", "Lun") + fecha pequeña abajo. Filas alternadas con
`--paper` / `--cream`, sin bordes gordos. Hover en `--linen`.

### 12. Empty state editorial cuando no hay attention
Si `items.length === 0`, muestra un ornamento curvo SVG en `--gold opacity 0.5`
+ Fraunces italic "Nada urgente." + sugerencia útil ("Buen momento para
revisar tu calendario o agregar fotos a la propiedad."). Sin emojis 🎉, sin
ilustraciones de stock.

### 13. Topbar minimal: breadcrumb + buscador + bell + lang + avatar
NO hay título de página gigante "Dashboard" en el topbar — el greeting
abajo ya cumple esa función. El breadcrumb "Casa Marina / Resumen" es
suficiente para ubicación.

### 14. Buscador con bg `--linen` que cambia a `--paper` en focus
El buscador no tiene border en estado idle (lo encaja en el topbar como
si fuera parte del fondo). En focus, fondo `--paper` + border `--rule-strong`
— se vuelve un input "real". Detalle: el sutil cambio de fondo basta como
affordance.

### 15. Mobile: drawer slide-in 280px, sin animaciones agresivas
Hamburger en topbar abre un drawer slide-from-left de 280px con
backdrop `rgba(31,27,22,0.4)`. El drawer es el **mismo sidebar**, solo
posicionado fixed. La tabla de check-ins se convierte en cards verticales
con `pill` arriba a la derecha y "Llega/Se va" lado a lado abajo.

---

## Calendar — decisiones no obvias

### 1. CSS Grid custom, NO FullCalendar
El brief sugirió "FullCalendar customizado con CSS overrides", pero terminé
construyéndolo desde cero con CSS Grid. Razones:

- **Resource-timeline es plugin premium** ($480/año por license en producción)
- Override completo del CSS de FullCalendar requiere ~600 líneas para que
  no parezca su default. Construir desde cero son ~350 líneas más limpias
- Control total sobre tipografía, oldstyle nums, animaciones
- No dependencia externa ni `dangerouslySetInnerHTML` para popovers
- Bundle más pequeño (FullCalendar core ~120KB; nuestro custom ~5KB)

La técnica: el calendar entero es UN solo `display: grid` con:
```
grid-template-columns: 200px repeat(31, minmax(38px, 1fr));
grid-auto-rows: 64px;
```
Las habitaciones se posicionan con `grid-row: N; grid-column: 1`, los días
con `grid-row: 1; grid-column: day + 1`, y las reservas con
`grid-row: room-row; grid-column: start+1 / end+1`.

Si en el futuro Eztadia tiene 200+ propiedades por owner y necesita
virtualization, FullCalendar Premium o `tanstack-virtual` sobre esta misma
estructura serían los siguientes pasos.

### 2. Densidad informativa con cell de 64px
La altura `64px` es la decisión más estructural. Es lo suficientemente
alta para dejar 8px de padding arriba/abajo del booking (8+48+8) y mostrar
ícono + apellido + cantidad de personas sin truncar. Más bajo se vuelve
ilegible, más alto pierde densidad.

### 3. Headers de día en Fraunces oldstyle 22px, NO Inter
El número del día (22, 28, etc.) va en Fraunces oldstyle. El DOW abajo
("VIE", "SÁB") en Inter 10 uppercase tracking 0.08em. Esto es lo opuesto
de Linear/Notion calendar (todo en sans). Es lo que da el tono boutique.

### 4. Domingos en `--terracotta`
Solo el TEXTO en terracotta, no la columna entera. Suficiente para que el
ojo identifique fines de semana sin saturar la grid. Sábado se queda en
gris (sutil background `--linen 35%` en cell, sin cambiar el texto del
header).

### 5. Línea vertical de hoy en `--gold` 1.5px opacity 60%
Una sola línea fina cruza TODO el calendario, anclada al centro de la
columna del día 21. Calculada con JS al render (no CSS porque depende del
ancho dinámico de las columnas). Opacity 60% para no competir con bookings.

### 6. Grupos por tipo de habitación con overline `--gold`
"SUITES", "TROPICALES", "ESTÁNDAR" — labels editoriales en lugar de
"GROUP 1, 2, 3". `border-top: 2px var(--rule-strong)` separa visualmente
los grupos. Esto convierte una tabla genérica en una taxonomía leíble.

### 7. Estados con DIFERENTE tratamiento, no solo color
Los 5 estados no se distinguen solo por hue (sería un mapa de colores):
- **Confirmed**: `--sage` solid, texto `--cream`, ícono Check
- **Pending**: outline 2px `--sage` (vacío adentro), ícono Clock
- **Hold**: dashed 1.5px `--ink-muted`, italic, "(hold)" prefix
- **External**: hatching diagonal `--clay` sobre paper, texto UPPERCASE
- **Manual-block**: gris cálido con baja opacidad, texto "Bloqueada · razón"

Cada uno comunica su naturaleza ANTES de leer el texto. Pending = "en
construcción" (outline). Hold = "temporal" (dashed). External = "no es
nuestro" (hatching). Manual = "no rentable" (gris).

### 8. Pulse SOLO si urgente (<4h)
Animación `pulseSoft` (opacity 1 → 0.7 → 1, 3s loop) aplicada únicamente
a bookings pending con `urgent: true`. NO a todos los pending — sería
ansiedad visual. En el demo, Andrea Mendoza (101, 15-18 may) tiene esta
animación.

### 9. Past bookings con `opacity: 0.55`
Las reservas con `end <= today` y status NO pending/hold se renderizan
fadeadas. Esto crea profundidad temporal: el ojo distingue al instante
"qué ya pasó" vs "qué viene".

### 10. Today checkin con ring dorado
Familia Rodríguez (Hab 201, 21 may) tiene `box-shadow: 0 0 0 2px gold,
0 0 0 4px gold/18%`. Es la booking más importante del día — el owner debe
verla primero.

### 11. Popover anclado, NO modal centrado
Click en cualquier booking abre un popover de 320px posicionado al
booking. Si no cabe abajo, se posiciona arriba. Click fuera o Esc cierra.
Esto evita el "context loss" del modal centrado: el owner sigue viendo
el calendar mientras revisa la reserva.

### 12. Same-day checkout/checkin: split block
**Documentado pero no demostrado** en demo data — ningún par de bookings
en mismo cuarto comparte día en el demo. La técnica preparada:
`background: linear-gradient(135deg, colorA 0 50%, colorB 50% 100%)` con
una hairline diagonal divisoria. La implementación se activa cuando hay
overlap.

### 13. Mobile: NO resource-timeline
La vista de grid no funciona en pantallas <768px. En su lugar:
- Pills horizontales scrollables (1 por día, scroll-snap)
- Header grande Fraunces oldstyle del día seleccionado
- Lista vertical de eventos como mini-cards con strip de color
- FAB `--terracotta` flotante "+ Reserva"

Esto NO es la misma información en otra disposición — es una vista
DIFERENTE optimizada para el caso de uso mobile (consultar mientras vas
caminando, no planificar). El owner planificará en desktop.

### 14. Drag interactions documentadas, no implementadas
El brief menciona drag horizontal (mover fechas), drag vertical (reasignar
habitación dentro del mismo tipo), y bloqueo cross-tipo con tooltip. Esto
requiere `@dnd-kit/core` o similar — ~500 líneas adicionales. Lo dejé
fuera del scope inicial. Los datos del modelo (`Booking.room`, `start`,
`end`) ya están preparados para mutaciones. El siguiente PR de calendar
sería implementar drag con confirmación de pricing.

### 15. Panel "Resumen del mes" como side sheet, no modal
Botón "Resumen del mes" en toolbar abre un panel slide-from-right de
320px que NO bloquea el calendar (semi-transparent backdrop). Adentro:
- 4 stats (ocupación, reservas, ingresos, ADR) sin cards, hairlines
- Mini gráfico de barras día-a-día — calculado del array de bookings
- Top 3 días con mejor ocupación

El gráfico es 31 barras Sage muy delgadas (`flex: 1; min-height: 2px`).
Hoy (día 21) se destaca en `--gold`. Sin ejes, sin labels — el calendar
ya es el detalle.

---

## Variantes descartadas

| Variante | Por qué la descarté |
|---|---|
| Hero centrado con CTA único | Demasiado landing-SaaS. Asimétrico 60/40 + 2 CTAs es más editorial. |
| Sticky CTA flotante al hacer scroll | Anti-pattern de marketing agresivo. Eztadia confía en su contenido. |
| Carrusel de testimonios | Un solo quote bien construido vale más que tres mediocres. |
| FAQ accordion sección 7 | Mejor responder dudas en `/pricing` o `/demo`. La landing debe convencer, no aclarar. |
| Comparativa tabular vs Cloudbeds | Pidió evitarlo el brief. Coincidencia con mi instinto: la comparación pone al usuario en modo evaluación, no en modo emoción. |
| Animación scroll-triggered en features | Distrae del texto. Solo fade-in 600ms en hero al cargar. |
| Tarjetas de pricing con "Más popular" badge | Solo hay un plan disponible — el badge sería deshonesto. |

### Property page

| Variante | Por qué la descarté |
|---|---|
| Hero con mosaico 5-6 fotos tipo Airbnb | Brief lo prohíbe y el instinto coincide. Una sola foto fullbleed transmite calma boutique. |
| Sticky CTA flotante "Reservar ahora" en desktop | El widget sticky a la derecha ya cumple esa función. Dos sticky CTAs es ruido. |
| Reviews carousel con flechas | Anti-pattern. Si añado reseñas en el futuro, irán como bloque editorial estático en su propia sección. |
| Date picker shadcn default | Demasiado SaaS. Lo reescribí desde cero (~300 líneas) — vale el costo. |
| Tabla comparativa de habitaciones | Brief lo prohíbe. La lista vertical fuerza lectura, no comparación rápida. |
| Botón "Reservar todo" en hero | Hace que el huésped pueda saltarse leer las habitaciones. Anti-objetivo. |
| Map embed de Google Maps interactivo | Pesado, no se integra con la paleta, pin verde-rojo rompe la calma. Static map + pin custom es mejor. |
| Counter "X personas viendo ahora" | Anti-pattern de presión. Brief explícitamente lo prohíbe. |
| Reviews section debajo de habitaciones | El brief no lo pide. Si se añade, debería ir como bloque editorial sin estrellas en cards. |

### Dashboard

| Variante | Por qué la descarté |
|---|---|
| Sidebar oscura `--ink` | Rompería la calma cromática. Eztadia es claridad cálida — incluso en chrome. |
| 4 KPI cards arriba con % verde/rojo | Anti-pattern explícito del brief. La pregunta del owner es "qué hago ahora", no "cómo voy". |
| Charts (line, bar, donut) en el dashboard home | Brief lo prohíbe. Charts pertenecen a `/dashboard/reports`. |
| "Welcome back, Carlos 👋" | Anti-pattern. Greeting time-aware + contexto del día es más útil. |
| Widget de clima en Cartagena | Decoración sin valor operacional. Carlos no necesita Eztadia para saber el clima. |
| Banner "Did you know? Tip of the day" | Anti-pattern. Si el usuario necesita aprender algo, Eztadia debería guiarlo en el momento exacto, no con tips genéricos. |
| Botón "+ Add" flotante terracotta | El acento terracotta está reservado para la landing pública. En dashboard, las acciones positivas van en `--sage`. |
| Grid de cards iguales para attention items | La diferenciación visual entre tipos de attention (gold/sage/linen pills + ghost/sage/ghost CTAs) comunica jerarquía emocional. Cards iguales aplanaría todo. |
| Sticky "Quick actions" en el header | Saturación. El menú lateral ya tiene el acceso a Calendario, Reservas, etc. |

### Calendar

| Variante | Por qué la descarté |
|---|---|
| FullCalendar resource-timeline + CSS overrides | Premium license + 600 líneas de overrides vs 350 líneas custom. Custom gana en peso y control. |
| Colores por TIPO de habitación (Suite, Tropical, Estándar) | Sería un código de colores extra. El estado importa más que el tipo — el tipo ya está agrupado. |
| Modal centrado al click de booking | Anti-pattern — pierdes contexto del calendar. Popover anclado mantiene la vista. |
| Loading spinner gigante al cambiar mes | Brief lo prohíbe. Skeleton de cells sería más editorial (pendiente de implementar). |
| Charts grandes en la página | El calendar ES el chart. Si quieres números, abre el panel lateral. |
| Drag and drop sin confirmación de pricing | Riesgoso — el owner podría mover una reserva a fecha con tarifa distinta sin darse cuenta. El brief pide confirmación dialog. |
| Búsqueda en el calendar (find booking by guest) | La búsqueda global ya está en topbar — duplicar sería ruido. |
| Indicador de "hoy" como banner arriba del calendar | Línea vertical es más editorial y no roba espacio vertical. |
| Vista de Año (12 meses) | Para 12 habitaciones, una sola página con scroll es suficiente. Multi-año vendría con multi-propiedad. |

---

## Assets necesarios (Unsplash queries)

Todos los placeholders del mockup apuntan a Unsplash directamente.
Si los reemplazas, mantén el ratio y el mood:

| Uso | Ratio | Query Unsplash | Foto actual (placeholder) |
|---|---|---|---|
| Hero foto principal | 3:4 vertical | `boutique hotel room linen morning light tropical window` | `photo-1611892440504-42a792e24d32` |
| PropertyType #1 — Hotel boutique | 4:3 | `boutique hotel lobby warm light artisan furniture colombia` | `photo-1455587734955-081b22074882` |
| PropertyType #2 — Complejo vacacional | 4:3 | `tropical cabin palm roof villa lush garden caribbean` | `photo-1520250497591-112f2f40a3f4` |
| PropertyType #3 — Edificio | 4:3 | `colombian apartment building balconies plants golden hour` | `photo-1568605114967-8130f3a36994` |
| Quote avatar | 1:1 | `friendly hospitality woman portrait warm light 40s` | `photo-1494790108377-be9c29b29330` |
| Closing fullbleed | 16:9 (mín 2000w) | `colombian patio tropical plants hammock golden contemplative` | `photo-1582719478250-c89cae4dc85b` |
| OG image (`/public/og-image.jpg`) | 1.91:1 (1200×630) | Recortar hero con título sobrepuesto | Pendiente — generar manualmente |

### Property page (Casa Marina)

| Uso | Ratio | Query Unsplash | Foto actual |
|---|---|---|---|
| Hero patio principal | 16:9 fullbleed | `colonial courtyard bougainvillea cartagena warm afternoon` | `photo-1545158535-c3f7168c28b6` |
| Room — Suite Marina | 3:2 | `boutique hotel king bed balcony tropical linen` | `photo-1611892440504-42a792e24d32` |
| Room — Habitación Tropical | 3:2 | `colonial bedroom two beds tall ceilings sun` | `photo-1631049307264-da0ec9d70304` |
| Room — Habitación Estándar | 3:2 | `simple white bedroom lime wash warm light` | `photo-1631049035634-c01a8aa1c9d4` |
| Galería 8 fotos | varios | mezcla de "colonial bedroom", "patio bougainvillea", "breakfast coffee colombia", "wooden colonial door", "tropical room ceiling" | varios |
| Map (estático) | 600×320 | OpenStreetMap static API (no auth) | `staticmap.openstreetmap.de` |

**Mapa producción**: cambiar a Mapbox Static (`light-v11`) con un token y un
estilo custom que use cream/sage en lugar de los grises default. El código
de `PropertyMap.tsx` ya tiene el comentario indicando dónde sustituir.

### Recomendación profesional
A mediano plazo, **reemplaza las fotos de Unsplash por una sesión propia** con
2–3 hoteles boutique colombianos reales (Cartagena, Salento, Villa de Leyva).
La autenticidad del lugar es parte del producto. Stock fotos comunican
genérico-aspiracional; sesión propia comunica "esto es real".

---

## Tipografía — notas técnicas

- **Fraunces Variable** se carga con `axes: ["SOFT", "opsz"]` en `next/font`.
  El sistema aplica `font-variation-settings: "SOFT" 50, "opsz" 144` vía la
  clase `.font-serif` / `.serif` para dar el carácter cálido. Si lo bajas a
  `SOFT 0` se vuelve más severo (Fraunces "Serious").
- **Oldstyle numerals** (1, 2, 3 con descendentes) están activados en
  numerales de feature, precios, y la nota Polaroid vía `.oldstyle`. Es lo
  que da el toque editorial vs SaaS.
- **Inter** con `ss01` y `cv11` activos en body — alternativa de la `a` y `g`
  más limpias. Detalle invisible pero acumulativo.

---

## Accesibilidad — checklist

- [x] Contraste AAA en texto principal (`--ink #1F1B16` sobre `--cream #FBF8F2`: 14.7:1)
- [x] Contraste AAA en `--ink-soft` (8.2:1) y AA en `--ink-muted` (4.8:1)
- [x] `--terracotta` sobre `--cream` para CTAs: 4.6:1 (AA — pasa para texto >18px)
- [x] Focus visible con `outline: 2px solid var(--sage)` y offset 3px
- [x] Skip link a `#main`
- [x] `prefers-reduced-motion` respetado (todas las transiciones a 0.01ms)
- [x] Todas las imágenes tienen `alt` descriptivo; la del avatar de quote tiene `alt=""` (decorativa, nombre va en texto)
- [x] ARIA labels en switches de idioma, hamburger, links del footer
- [x] `lang="es"` en `<html>`, con `alternateLocale` en metadata para `en`
- [x] Estructura semántica: `header`/`main`/`section`/`footer`/`article`/`figure`/`blockquote`

---

## Cómo ejecutar

```bash
# 1. Mockups standalone (no requieren instalación)
open mockup.html              # landing pública
open mockup-property.html     # /p/casa-marina
open mockup-dashboard.html    # /dashboard (owner home)
open mockup-calendar.html     # /dashboard/calendar

# 2. Next.js (instalar primero)
pnpm install     # o npm install / yarn
pnpm dev         # http://localhost:3000                       (landing)
                 # http://localhost:3000/p/casa-marina         (property)
                 # http://localhost:3000/dashboard             (owner home)
                 # http://localhost:3000/dashboard/calendar    (calendar)
```

Los `mockup*.html` son páginas autocontenidas con fonts de Google y
imágenes de Unsplash — sirven como referencia visual exacta del Next.js
output. La página de propiedad incluye date picker funcional, stepper de
huéspedes, lightbox de galería, accordion de FAQ y bottom sheet móvil
todos funcionando sin dependencias.

---

## Estructura del proyecto

```
.
├── mockup.html                 ← preview standalone landing
├── mockup-property.html        ← preview standalone /p/casa-marina
├── mockup-dashboard.html       ← preview standalone /dashboard
├── mockup-calendar.html        ← preview standalone /dashboard/calendar
│
├── app/
│   ├── layout.tsx              ← fonts (Fraunces, Inter, JetBrains Mono), metadata bilingüe
│   ├── page.tsx                ← landing — compone las secciones
│   ├── globals.css             ← Tailwind v4 + @theme con tokens tierra
│   ├── p/
│   │   └── [slug]/
│   │       └── page.tsx        ← página pública de propiedad (server, con BookingProvider)
│   └── dashboard/
│       ├── layout.tsx          ← shell global (Sidebar + Topbar) reusable para todo /dashboard/*
│       ├── page.tsx            ← /dashboard home — greeting + attention + pulse + check-ins
│       └── calendar/
│           └── page.tsx        ← /dashboard/calendar — resource-timeline + tabs + panel
│
├── components/
│   ├── icons.tsx               ← SVG inline compartidos (Check, Arrow, Menu, Instagram, X, ornamentos)
│   ├── landing/                ← (ver landing arriba)
│   │   ├── Topbar.tsx
│   │   ├── Hero.tsx
│   │   ├── TrustBar.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── PropertyTypes.tsx
│   │   ├── Quote.tsx
│   │   ├── Pricing.tsx
│   │   ├── Closing.tsx
│   │   └── Footer.tsx
│   ├── property/
│   │   ├── PhosphorIcons.tsx       ← inline Phosphor icons (Wifi, Thermometer, Drop, …)
│   │   ├── BookingProvider.tsx     ← React Context: fechas, adultos, niños, nights
│   │   ├── PropertyTopbar.tsx      ← topbar mínima con nombre + lang + contacto (client)
│   │   ├── PropertyHero.tsx        ← foto fullbleed + card cream overhanging
│   │   ├── PropertyDescription.tsx ← bloque descripción editorial
│   │   ├── PropertyAmenities.tsx   ← grid 2/4 columnas con ícono + texto
│   │   ├── PropertyRooms.tsx       ← lista vertical, precios reactivos (client)
│   │   ├── PropertyGallery.tsx     ← masonry 8 fotos + lightbox (client)
│   │   ├── PropertyMap.tsx         ← static map + pin terracotta + copy/maps (client)
│   │   ├── PropertyFAQ.tsx         ← accordion con + que rota 45° (client)
│   │   ├── BookingWidget.tsx       ← widget sticky derecha (client)
│   │   ├── DateRangePicker.tsx     ← date picker CUSTOM editorial (client)
│   │   └── MobileBookingCTA.tsx    ← floating button + bottom sheet (client)
│   ├── dashboard/
│   │   ├── icons.tsx               ← Phosphor-style nav icons (House, Calendar, Receipt, …)
│   │   ├── DashboardShell.tsx      ← combines Sidebar + Topbar with mobile drawer state (client)
│   │   ├── Sidebar.tsx             ← logo + property switcher + nav sections + user popover (client)
│   │   ├── Topbar.tsx              ← breadcrumb + buscador + bell + lang + avatar (client)
│   │   ├── Greeting.tsx            ← time-aware greeting con subtítulo dinámico
│   │   ├── AttentionList.tsx       ← lista de mini-cards accionables + empty state editorial
│   │   ├── WeekPulse.tsx           ← 4 métricas sin cards, hairlines, Fraunces oldstyle 44px
│   │   └── UpcomingCheckIns.tsx    ← tabla editorial desktop + mini-cards mobile
│   └── calendar/
│       ├── PropertyTabs.tsx        ← subnav property (Resumen · Reservas · Calendario · …) (client)
│       ├── CalendarToolbar.tsx     ← title + view switcher + nav + filters + actions (client)
│       ├── CalendarPageClient.tsx  ← thin client wrapper holding panel state
│       ├── ResourceTimeline.tsx    ← main grid: 32 cols × N rows, bookings as grid items (client)
│       ├── BookingPopover.tsx      ← anchored popover w/ guest data + 3 actions (client)
│       ├── MobileCalendarList.tsx  ← horizontal day pills + event cards + FAB (client)
│       ├── MonthSummaryPanel.tsx   ← side sheet: stats + day-by-day bars + top 3 (client)
│       └── Legend.tsx              ← bottom legend with 5 status swatches
│
├── lib/
│   ├── properties.ts           ← types Property/RoomType/FAQItem + getProperty(slug)
│   ├── dashboard.ts            ← OwnerSnapshot, AttentionItem, WeekMetric, CheckIn + greetingFor / subtitleFor
│   ├── calendar.ts             ← CalendarMonth, RoomGroup, CalendarBooking + getCalendarMonth + occupancyByDay
│   └── format.ts               ← formatCOP, formatDateShort, nightsBetween, isoDate
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

**Server / Client boundary**:
- Server por defecto: `app/p/[slug]/page.tsx`, `PropertyHero`, `PropertyDescription`, `PropertyAmenities`
- Client (estado o interacción): `PropertyTopbar`, `PropertyRooms` (consume context), `PropertyGallery` (lightbox), `PropertyMap` (clipboard), `PropertyFAQ` (accordion), `BookingProvider`, `BookingWidget`, `DateRangePicker`, `MobileBookingCTA`

El `BookingProvider` envuelve el grid post-hero para que `PropertyRooms`,
`BookingWidget` y `MobileBookingCTA` compartan el rango de fechas, sin
necesidad de prop drilling ni state global.
