# Roadmap

Estado a 2026-10-05. Todo lo descrito en `CONTEXT.md` está publicado.

## Próximo

1. **Probar «Volver al resumen» en navegadores reales** (bfcache). Si falla, anotar navegador y dispositivo.
2. **Resumen de Pujobaixo**: hacer el audit comparativo caso completo vs resumen y escribir el bloque de texto (rol, decisiones, resultado) como en K Rooms. Decidir si lleva una fila pequeña con pujobaixo.cat y el código. Las 3 imágenes se leen de otra web (dependencia); el caso solo está en ES. Mientras tanto la card está deshabilitada («Próximamente»): reactivarla al terminar (ver `DECISIONS.md`).
3. **Longitud del resumen de K Rooms**: en móvil mide ~17 pantallas. Opciones: imágenes más bajas, dos columnas o retícula. Sin decidir.
4. **Cierre del caso de K Rooms**: elegir frase (recomendada A: «Esto es lo que aporto: decisiones con porqué, de la investigación a un MVP funcional.») y decidir si el bloque final lleva «Ver CV». Hoy mantiene «Agendar encuentro» + «Descargar CV».

5. **Intro de la portada**: verla en dispositivos reales (iPhone Safari, Android Chrome, Windows con barra de scroll clásica) y medir `intro-cue` y el scroll frente a visitas tras unas semanas. Si muchos la saltan en el primer segundo, acortar el momento 02. Pendiente del usuario: decir de qué es la foto de David presentando en chia.framer.website (no se ha usado por no saber su proyecto).

6. **Replanteo de la home (hecho: hero y Selected work; «How I work» se probó y se retiró, ver `DECISIONS.md`)**: pendiente de decidir (a) Discogs/LLM no existe en la web, así que no prometer esa capacidad sin una prueba a un clic; (b) mantener la barra fija «Agendar encuentro / Ver CV» en lugar de una sección Contact; (c) si el Venn del mockup, una sección About en la home y la navegación (solo cuando existan Writing y Playground) entran; (d) apoyar «usuarios y stakeholders» en un dato comprobable de K Rooms (no inventarlo); (e) si GoTogether es el nuevo nombre de Pujobaixo y cuándo se reactiva su card; (f) etiquetas de capacidad en las cards (por ejemplo «Design + Build») en lugar de etiquetas de skills; (g) atar los principios (investigar para no construir lo equivocado, IA, porqué) a un proyecto como línea de evidencia en la card. Medición: el cambio altera la línea base de GoatCounter.

## Después

- **PDF del CV** (`assets/cv-es.pdf`, `cv-en.pdf`): desactualizados; añadir BBDO & Proximity y los cargos de LinkedIn (The Wise Dreams: UX Researcher / Product Designer · Product Owner, oct 2024 – abr 2026). El usuario lo aparcó expresamente. `assets/cv.pdf` está sin uso, se conserva por posibles enlaces antiguos.
- **Pies de Dribbble**: nombres y tipos de las 12 piezas deducidos de los títulos; el usuario no los ha revisado.
- **Acceso «Ver resumen» dentro del caso** para quien llega por enlace directo (propuesto, no hecho).
- **Medir tiempo real en el resumen** (tramos) para sustituir la estimación de «1 min».
- Carpeta Gallery: icono (Giant Loop e Idealista se leen como franja). Probar el visor con trackpad, rueda y dedo en dispositivos reales.
- Alinear la primera línea del Perfil del CV con el titular de la portada.
- Concretar los «productos con IA» de The Wise Dreams (**no inventar**, preguntar).
- Renombrar el evento de Calendly (`new-meeting`); hoy se registra como `book-meeting`.

## Limpieza técnica

Auditoría del 2026-10-05: deuda baja. Las seis páginas cargan sin errores ni recursos rotos, no hay JS muerto y solo una clase CSS sin uso (`.draft-card__img`, reservada para Drafts). Pendiente, por prioridad (aparcado por decisión del usuario):

- **Proceso: una sesión por carpeta.** Dos sesiones sobre el mismo árbol de trabajo provocaron un cambio de rama inesperado y un push de un commit no confirmado. Usar una sola sesión a la vez o worktrees separados, y revisar `git log origin/main..main` antes de cada push.
- **Imágenes de Drafts sin uso**: 20 archivos en `assets/img/drafts/` (~1,8 MB). Se pueden borrar; se recuperan del historial junto con `git revert f495815`.
- **Ramas y archivos de prueba**: `portada-hanzo` ya está publicada en `main` (se puede borrar); `intro-fisica` e `intro-fuerzas`, pendientes de decidir; `prueba-ia.*` y `prueba-murmuracion.*` ignorados en git; añadir `.claude/` al `.gitignore`.
- **`styles.css` fragmentado**: 1.746 líneas y unos 40 selectores repartidos en varios bloques (`.project-list` y `.drawer` en tres sitios cada uno); comentarios que aún hablan de «Drafts». Reordenar por componente en una sesión dedicada, con revisión visual.
- **Podar `DECISIONS.md`**: 36 entradas y unas 4.500 palabras, varias superadas (el titular ha cambiado cuatro veces). Añadir arriba un apartado de «estado actual» y marcar lo superado.
- **Colores sueltos**: 26 `rgba(...)` y 8 `#000` (sombras y máscaras), frente a la regla de usar tokens.
- **Imágenes del caso algo pesadas** (hasta 388 KB, `contexto-papel-antes.jpg`): recomprimir.
- **Nombres heredados**: además de `.drawer` (abajo), `.draft-card` son ya las cards de proyecto y `.drawer__when` hace de etiqueta en el panel de perfil.

- Renombrar la clase `.drawer`, compartida por la galería del caso, el panel de perfil y el resumen. Hacerlo en una sesión aparte y con revisión visual de los tres.
- `borrador-estructura.md` (reestructura del caso K Rooms: resumen, fusionar secciones, tablas más cortas, aprendizajes de 5 a 3): ignorado en git; retomar cuando se decida reordenar el caso.
- `prueba-ia.html/.css/.js` (prueba de búsqueda con IA): ignorados a propósito; no publicar salvo petición.

## Medición: qué revisar y cuándo

Tras unas semanas de tráfico real, en https://dcb.goatcounter.com:

- `gallery-open` frente a visitas de la portada: Gallery está al final de la portada a prueba. Si casi nadie la abre tras unas semanas, descartarla (y quitar visor, miniaturas y carpeta).
- `summary-cta` frente a `card-open`: ¿el resumen empuja al caso completo?
- `summary-seen/<proyecto>/<n>`: cuántas piezas ven antes de cerrar (¿14 son demasiadas?).
- `depth/k-rooms/*`: hasta dónde llegan en el caso.
- `book-meeting`, `mail-click`, `mail-copy`, `linkedin-click`, `cv-open`, `cv-download`: conversión.

**Antes**: abrir `davidchia.es/#toggle-goatcounter` en cada navegador propio y borrar las visitas de prueba del panel.
