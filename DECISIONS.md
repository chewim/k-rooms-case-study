# Decisiones

Formato: decisión · porqué · descartado. Orden temático, no cronológico. Añadir al final de cada bloque.

## Narrativa y contenido

**Titular de la portada: aportación, no skills (2026-10-04).** «Ayudo a equipos a convertir problemas complejos en productos digitales claros y fáciles de validar» (EN: *I help teams turn complex problems into clear, testable digital products*). Encierra la tríada Pensar · Diseñar · Construir sin enumerarla: «complejos» = pensar, «claros» = diseñar, «validar» = construir. «Equipos» te posiciona para incorporarte a uno, no como freelance. La entradilla (usuarios y stakeholders; «La IA me acelera, no me sustituye»; «Cada decisión con su porqué») sustituye a la lista de skills y sectores anterior («UX Research y Behavioral Design aplicados a productos con IA, realidad virtual y B2B»). Se evitó «UX/UI» (baja el rol de Product Designer) y «iterate faster» (vago); el porqué pasa de titular a cierre de la entradilla. Origen: replanteo de posicionamiento tomando como referencia la claridad comercial de otro portfolio (sin copiar estética ni especialización). Ojo con la medición: el cambio de portada altera la línea base de GoatCounter.

**Resumen primero, caso largo después.** Los reclutadores leen en menos de 2 min y NN/g indica que solo se leen un 20–28 % de las palabras. El resumen se mide frente al caso (`summary-cta` vs `card-open`) y se revisará con datos tras unas semanas. Descartado: llevar la card directo al caso largo.

**Resumen de K Rooms = bloque de texto + galería de piezas, sin texto nuevo.** El texto es el existente, corregido (qué es, KPIs 40/2.000/90, problema, mi papel, decisiones, resultado). «Mi papel» menciona Firebase, Raspberry Pi propia e IA. Una sola fuente (`<template id="resumen">`).

**El botón de la banda del caso se llama «Resumen», no «Galería».** El botón de galería dejó de tener sentido al unificar flujos. En inglés se usa *Summary* para que no se confunda con *resume* (CV).

**Minutos en el botón principal** («Ver todo el case study · 11 min») en lugar de «14 imágenes»: expectativa de esfuerzo antes de comprometerse. Para el resumen se usa tiempo de escaneo («1 min»), no de lectura.

**Card de Pujobaixo deshabilitada («Próximamente»).** Su resumen aún no está trabajado (sin texto de rol, decisiones y resultado; ver `ROADMAP.md`), así que no abre nada y se muestra atenuada con la etiqueta. Se reactiva quitando `disabled` y devolviendo `popovertarget="draft-drawer"`, `aria-haspopup` y el chevron a la card y quitando la etiqueta de encima de la foto; el panel, la plantilla y la medición siguen en el código.

**Pujobaixo no se vende como pareja de K Rooms.** No es un producto de Konvent. Es el segundo ejemplo de «Ideado · Diseñado · Construido».

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

**Panel de perfil: contacto primero** (email con copiar + LinkedIn), luego lo que aporto en cuatro puntos y una única acción de salida: «Ver CV completo». Los cuatro puntos (convertir problemas poco definidos en producto; conectar usuario, negocio y ejecución; reducir la distancia entre pensar y construir; cuestionar la solución antes de enamorarse de ella) sustituyen a la descripción de perfil (2026-10-04): esa descripción queda solo en la página del CV. Viven en `<template id="profile-points">` de la portada (es/en), no en el CV. Ojo: el punto 4 cita Discogs/LLM, que aún no tiene caso en la web.

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
