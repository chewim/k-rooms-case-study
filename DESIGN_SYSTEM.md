# Sistema de diseño del portfolio

Es el de este sitio, definido en los tokens `:root` de `styles.css`. **No** es el de la app K Rooms (`DESIGN-SYSTEM.md` y `tokens.css`, fuera del repo). Ante la duda, mirar `styles.css`: es la fuente de verdad.

## Tokens

- **Color**: `--color-bg` #fafaf7 (fondo cálido), `--color-surface`, `--color-card` #f2f0e9 (tarjetas), `--color-ink` / `-mute` / `-faint`, `--color-line` / `-soft`, `--color-accent` #7a5f00 (ocre, el amarillo del jersey oscurecido hasta pasar WCAG) con `--color-accent-soft` #f7e9a8 para fondos tintados, `--color-warm` #a8481c, `--color-highlight`, `--color-available` #22a447 (punto «Disponible»).
- **Tipografía**: pila del sistema (`--font-sans`). Escala con un tamaño por función: `--fs-hero`, `--fs-numeral`, `--fs-h2`, `--fs-h3`, `--fs-lead`, `--fs-body` (17 px), `--fs-small`, `--fs-eyebrow`, `--fs-micro`. Pesos 300/400/500. Interlineado `--lh-tight/snug/body`.
- **Espaciado**: `--space-1` … `--space-8`. Ancho de lectura `--measure` 68ch; página `--page-max` 1100px.
- **Forma**: `--radius` 2px, `--radius-image` 16px, `--border-hair`.
- **Movimiento**: `--transition` 150 ms. Respetar `prefers-reduced-motion`.

No usar valores sueltos de color, tamaño o espaciado: si hace falta uno nuevo, añadir un token.

## Componentes reutilizables

| Componente | Uso |
|---|---|
| `.btn`, `.btn--primary` | Botones. El principal (relleno oscuro) se usa para la acción de conversión: «Ver todo el case study», «Agendar encuentro». |
| `.lang-switch` | Selector ESP/EN, igual en portada, caso y CV. |
| `.contact-card`, `.about__*` | Email (con copiar y check de confirmación) + LinkedIn. En el panel de perfil y el CV. |
| `.kpis` | Cifras destacadas del resumen (40 / 2.000 / 90). |
| `.draft-summary*` | Bloque de texto del resumen: meta, lead, KPIs y lista Problema / Mi papel / Decisiones / Resultado. |
| `.drawer*` | Panel lateral/popover: cabecera (`.drawer__eyebrow`, `.drawer__headline`), lista de piezas, pie con botón fijo (`.drawer__cta`, `.drawer__goto`). Nombre compartido por tres usos: ver `ROADMAP.md`. |
| `.project-card`, `.draft-card` | Cards de la fila «Selected work». |
| `.gallery-folder`, `.gallery` | Carpeta de Gallery y su visor (`.gallery__track`, `.gallery__slide`, `.gallery__thumbs`, `.gallery__thumb`), que reutiliza `.viewer`. |
| `.home__about` | Botón «Sobre mí» de la entradilla: foto, rótulo («Perfil y contacto») y chevron; es un `<a data-drawer-open>` que abre el panel de perfil. Uno solo para móvil (bajo las viñetas) y escritorio (al pie de la columna izquierda). |
| `.toc`, `.toc__button`, `.toc__summary` | Banda superior del caso; el botón de resumen tiene modo `.is-return`. |
| `.intro*` | Intro de la portada: primera sección (`.intro`, alto de pantalla menos la cabecera), enjambre en `.intro__canvas` (debajo de la pila), pila de cuadrados del mismo tamaño (`.intro__pile`, `.intro__card`) e indicación `.intro__cue` con la voz del eyebrow. Reutiliza tokens de color, eyebrow y `--radius-image`; la simulación, los wireframes y la retícula de posiciones viven en `intro.js`. |
| `.has-texture` | Textura de fondo de la portada: la retícula plana de la intro (un trazo horizontal por celda de 22 px, 18 en móvil, ocre al 10 %) como `background-image` del body, generada por `intro.js` en `--texture`. Se mueve con el scroll. |
| `.cta-bar` | Barra fija inferior «Agendar encuentro / Ver CV». |
| `.cv-toolbar`, `.cv__photo` | Barra fija del CV y foto que viaja a ella. |

## Reglas

- Reutilizar antes de crear. Un botón nuevo suele ser un `.btn` con modificador.
- Iconos de volver y copiar: los existentes (chevron de volver; icono de dos papeles con check).
- El resumen y el caso comparten texto: no duplicarlo en HTML (ver `CONTEXT.md`).
- Imágenes de card cuadradas 800×800 JPG; miniaturas de Gallery en `assets/img/dribbble/thumbs/` (600 px).
