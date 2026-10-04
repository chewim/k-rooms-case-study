# Decisiones

Formato: decisión · porqué · descartado. Orden temático, no cronológico. Añadir al final de cada bloque.

## Narrativa y contenido

**Portada: hero, Selected work, Gallery y How I work (2026-10-04).** Titular: «Ayudo a equipos a convertir problemas complejos en productos que se pueden probar y validar» (EN: *I help teams turn complex problems into products that can be tested and validated*), con una sola frase debajo: «Trabajo con usuarios y stakeholders, desde entender el problema hasta diseñar y construir la solución». Sustituye a la lista de skills y sectores anterior. Encierra la tríada Pensar · Diseñar · Construir sin enumerarla; «equipos» posiciona para incorporarse a uno, no como freelance. Se evitó «UX/UI» (baja el rol de Product Designer). Los principios salen del hero y pasan a «How I work» (tres columnas con icono, título y una línea de apoyo): «No investigo para confirmar ideas. Investigo para no construir lo equivocado», «Uso la IA para construir más rápido, probar antes y aprender antes» (la IA no toma las decisiones por mí) y «Cada decisión de diseño tiene un porqué» (con «tiene», no «debería»: afirma, no aspira). Orden: hero → Selected work → How I work → Gallery (Gallery baja al final como prueba: si casi nadie abre `gallery-open`, se descarta). Se probó antes hero → Selected work → Gallery → How I work. La evidencia va antes que los principios y, en móvil, las cards no salen de la primera pantalla; el mockup de referencia pone los principios antes, lo que en escritorio funciona y en móvil no. La fila «Ideado · Diseñado · Construido» se sustituye por «Selected work»: no decía qué había debajo, no se correspondía con las cards y repetía la tríada sin prueba. Etiquetas de sección en inglés en ambas versiones (como Gallery); el título del panel de perfil pasa a «What I bring» en las dos. Del mockup se adapta contenido y estructura al sistema de diseño actual; queda fuera por ahora la navegación (Writing y Playground no existen), el Venn, About en la home, la tipografía en negrita y las etiquetas de skills. Medición: este cambio altera la línea base de GoatCounter.

**Una sola definición de rol: «Product Designer & Builder» (2026-10-04).** Sustituye a «Product Designer / Owner», «Product Designer · UX/UI Designer» y «Product Designer y Product Owner» en el overline y la intro, el subtítulo del CV y del panel de perfil, los títulos y descripciones de las páginas, la entrada de K-Rooms en el CV y el pie del caso. «UX/UI» se evita porque baja el rol a ejecutor de interfaces. Se mantienen tal cual los cargos reales de empresas anteriores (Smartvel «UX/UI Designer», BBDO «UX/UI Assistant»…), porque son hechos del historial. El panel de perfil lleva el título «What I bring» («Lo que aporto» en español) sobre los cuatro puntos. Pendiente de decidir: el párrafo de Perfil del CV y la categoría «UX/UI» de las skills siguen con el vocabulario anterior.

**Estado de la cabecera: rotatorio, no una frase larga (2026-10-04).** «Disponible» pasa a rotar cada 3 s entre «Disponible», «Remoto / híbrido» y «Madrid–Barcelona» (EN: Available · Remote / hybrid · Madrid–Barcelona). Una sola frase con las tres cosas no cabía bajo el nombre en móvil; rotando, la cabecera toma el ancho de la frase más larga y no se mueve. Solo CSS (sin JavaScript), así funciona igual en la portada, el caso y el CV. Con movimiento reducido queda solo «Disponible». El panel de perfil rota igual (la columna junto a la foto es estrecha y las tres frases juntas ocupaban dos líneas). Dice para qué estás disponible (equipo, remoto o híbrido en esas ciudades), no solo que lo estás.

**Color de acento: de verde a ocre (2026-10-04).** El acento pasa de `#3a5a40` (verde) a `#7a5f00` (ocre), el amarillo del jersey de la foto con la misma oscuridad que tenía el verde, y el fondo tintado `--color-accent-soft` de verde pálido a `#f7e9a8`. Afecta al hover del botón principal, los anillos de foco, los chevrons al pasar por encima, la selección de texto, los avisos y los números del índice del caso. Contrastes: ocre sobre el fondo 5,8:1; sobre la card 5,3:1; ocre sobre el amarillo suave 4,96:1 (todos por encima de 4,5:1). El amarillo claro `#ffe100` solo vale como relleno con texto negro (14,4:1); como texto, borde o anillo tiene 1,25:1 y no pasa. Probadas tres opciones (verde actual, ocre oscuro, amarillo relleno con tinta y anillo bicolor): se eligió el ocre. Los enlaces a Calendly llevan el mismo color en la dirección (`primary_color`). El punto de «Disponible» sigue verde, porque ese verde significa «activo» y no es el acento.

**Resumen primero, caso largo después.** Los reclutadores leen en menos de 2 min y NN/g indica que solo se leen un 20–28 % de las palabras. El resumen se mide frente al caso (`summary-cta` vs `card-open`) y se revisará con datos tras unas semanas. Descartado: llevar la card directo al caso largo.

**Resumen de K Rooms = bloque de texto + galería de piezas, sin texto nuevo.** El texto es el existente, corregido (qué es, KPIs 40/2.000/90, problema, mi papel, decisiones, resultado). «Mi papel» menciona Firebase, Raspberry Pi propia e IA. Una sola fuente (`<template id="resumen">`).

**El botón de la banda del caso se llama «Resumen», no «Galería».** El botón de galería dejó de tener sentido al unificar flujos. En inglés se usa *Summary* para que no se confunda con *resume* (CV).

**Minutos en el botón principal** («Ver todo el case study · 11 min») en lugar de «14 imágenes»: expectativa de esfuerzo antes de comprometerse. Para el resumen se usa tiempo de escaneo («1 min»), no de lectura.

**Card de Pujobaixo deshabilitada («Próximamente»).** Su resumen aún no está trabajado (sin texto de rol, decisiones y resultado; ver `ROADMAP.md`), así que no abre nada y se muestra atenuada con la etiqueta. Se reactiva quitando `disabled` y devolviendo `popovertarget="draft-drawer"`, `aria-haspopup` y el chevron a la card y quitando la etiqueta de encima de la foto; el panel, la plantilla y la medición siguen en el código.

**Pujobaixo no se vende como pareja de K Rooms.** No es un producto de Konvent. Es el segundo proyecto de «Selected work».

**Gallery = carpeta con 4 piezas que abre un visor propio.** La carpeta (Crowd predict, Parking, Giant Loop, Idealista; «Ver galería · 12 piezas») ya no despliega una retícula: quien pulsa «galería» espera ver imágenes grandes. Abre un visor con las 12 piezas en una fila (`scroll-snap`: gesto horizontal del trackpad, rueda, dedo y flechas) y una tira de miniaturas debajo para saltar a cualquiera. La rueda vertical avanza una pieza por gesto, con umbral, porque la inercia del trackpad dispara decenas de eventos. Descartado: la retícula inline (un paso extra) y dejar un «ver todas» dentro del visor (más superficie que mantener). El icono 2×2 de la carpeta mide 108 px (1,5× la primera versión) para que se aprecien las piezas.

**La portada termina en Gallery.** Se retiró la sección de botones de cierre; la barra fija ya lleva el contacto.

**Intro de la portada: una pila de piezas del mismo tamaño que se convierte en la portada (~6,5 s).** Referencia de ritmo: Mendesaltaren (abre con su trabajo, no con una explicación). Primera versión (piezas dispersas de distintos tamaños, máscaras y palabras grandes Investigar · Decidir · Diseñar · Construir) descartada por el usuario: pidió ser **minimal, aportar valor y no sorprender**, todas las imágenes **del mismo tamaño superponiéndose** (como el momento final de K Rooms + Pujobaixo) y **proyectos de valor visual**. Versión actual: el nombre se descubre centrado de abajo arriba (sin silueta gris previa: el usuario no quería que se leyera antes de la carga), como una batería que se carga (1.200 ms, `cubic-bezier(0.7, 0, 0.18, 1)`: arranque pesado, impulso y asiento, con el nombre subiendo 0,06em a la vez; petición del usuario), y se retira; en su lugar, centrada, se forma una pila irregular de ocho cuadrados del mismo tamaño que se posan uno sobre otro cada 380 ms, **sin pies ni frase** (la pila es decorativa y los títulos metían ruido): Smartvel B2B, Hablar, Shortcat, Crowd predict, Cuantofaltapapatum, Madres, Cappy y, con más aire, K Rooms. Al final K Rooms vuela (FLIP) a su card, el resto se retira y el fondo deja ver la portada. Imágenes sacadas de chia.framer.website (descartadas las fotos que parecen de banco: RRE, Hablar) y de Dribbble (mismas 12 piezas que Gallery; Crowd predict es un vídeo de plano fijo), recortadas en cuadrado en `assets/img/intro/` a 800 y 480 px con `srcset` (~400 KB en escritorio, ~170 KB en móvil). Reglas: una vez por sesión (`introSeen`); nunca al volver atrás, con ancla, con `summaryReturn` pendiente, con movimiento reducido ni en pestaña en segundo plano; se salta con clic, Esc/Espacio/flechas o scroll (salta al vuelo final); si las imágenes no llegan en 1,5 s, no hay intro. Web Animations API, solo transform/opacity, sin dependencias. Evento `intro-skip`. El escenario no se pinta hasta que arranca la coreografía (clase `is-running`): mientras cargaban las imágenes asomaba un fotograma con la pila montada y K Rooms encima. Pujobaixo, retirado de la pila: en la mano se parecía demasiado a K Rooms. Descartado: que el nombre se compactara en una bola que se aleja hasta el tamaño del punto «Disponible», vuelve y estalla en las piezas (probado y retirado por el usuario); vídeo showreel, GSAP, pantalla «Entrar», reproducirla en cada visita.

**Fila Drafts (Shortcat, Hablar, RRE, Patum) retirada.** Diluía la autoridad de los dos proyectos fuertes. Recuperable con `git revert f495815`; la clase `.draft-card__img` queda reservada.

## Flujos de navegación

**Subflujo «Ir al texto → / Volver al resumen».** Tras ir al texto no había forma de volver. Se eligió la opción 3 porque no pierde la conversión: el botón de resumen cambia a «← Volver al resumen» y no se toca la barra «Agendar / Ver CV». Funciona también desde la portada (guarda `summaryReturn` en sessionStorage, 30 min).

**Chapter-accordion en el resumen: probado y revertido** («no encaja»). Se volvió a lista abierta + botón fijo (`git revert`).

**Botones de la portada: «Agendar encuentro / Ver CV».** «Ver CV» antes que «Descargar CV»: la acción principal es verlo; la descarga se ofrece dentro del CV.

**Posición de scroll al volver atrás: se conserva manualmente** (sessionStorage) porque el navegador la restauraba +16 px. Navegar a `#fig-N` desplaza explícitamente y destella la figura.

## Diseño y componentes

**Reutilizar componentes antes que crear otros** (`.btn`, `.lang-switch`, `.contact-card`, chevron de volver): cohesión. El selector de idioma del CV y de la portada es el mismo ESP/EN. El contacto del CV reutiliza la tarjeta del panel de perfil.

**Panel de perfil: contacto primero** (email con copiar + LinkedIn), luego lo que aporto en cuatro puntos y una única acción de salida: «Ver CV completo». Los cuatro puntos (convertir problemas poco definidos en producto; conectar usuario, negocio y ejecución; reducir la distancia entre pensar y construir; cuestionar la solución antes de enamorarse de ella) sustituyen a la descripción de perfil (2026-10-04): esa descripción queda solo en la página del CV. Viven en `<template id="profile-points">` de la portada (es/en), no en el CV. Ojo: el punto 4 cita Discogs/LLM, que aún no tiene caso en la web. La línea de ubicación («Barcelona, España») sale del panel porque el estado rotatorio ya dice «Madrid–Barcelona».

**CV: la foto viaja a la barra superior** con el scroll (copia fija `cv-fly`); respeta `prefers-reduced-motion`.

**Imágenes de cards: foto de mano + móvil, recorte cuadrado, JPG 800×800** (versión B elegida tras probar dos lenguajes). Originales PNG fuera del repo.

## Técnica

**Sitio estático sin build**, versionado de caché manual: mínima dependencia y despliegue gratuito. Coste: hay que acordarse de `bump-version.sh`.

**Constructor de galería compartido** (`buildGallery`) con lectores por origen: el caso de K Rooms se lee de `k-rooms.html`, el de Pujobaixo de su web externa.

**Medición con GoatCounter** (sin cookies, sin banner de consentimiento, gratis). Descartado Google Analytics por consentimiento y peso. Los eventos son por intención (card-open, summary-cta, depth…) y no por página vista.

**Bfcache**: la reapertura del resumen también escucha `pageshow` con `persisted`, porque al volver «sin recargar» el arranque no se ejecuta. No reproducible en el navegador de pruebas; validado simulando el evento.

## Errores que condicionan cómo trabajar

- `git add -A` subió un PNG de 1,7 MB con extensión `.jpg`. Ahora: revisar `git status` y optimizar antes de commitear. El blob queda en el historial (no se reescribió).
- Una llave `}` suelta en `styles.css` anuló un componente. Auditar llaves tras editar CSS.
- Un reemplazo global alteró cadenas de `data-drawer*`; se renombró la variable a `aboutDrawer`. Cuidado con los reemplazos masivos: la clase `.drawer` está compartida por tres componentes.
