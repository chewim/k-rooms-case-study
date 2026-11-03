# Contexto

## Qué es

Portfolio personal de David Chia, product designer en Barcelona, publicado en https://davidchia.es. Repo `chewim/k-rooms-case-study` en GitHub Pages, dominio en IONOS. Bilingüe: español en la raíz, inglés en `/en/`. El nombre del repo es un resto de cuando solo contenía el caso de K Rooms; hoy es el portfolio completo.

## Objetivo

Que lo contraten estudios de producto digital de primer nivel (referencia: Mendesaltaren). La web debe mostrar criterio, decisiones con su porqué, oficio y capacidad de ejecución (de la investigación a un producto funcional), no solo resultados bonitos.

## Audiencia y lectura

Responsables de diseño y reclutadores. Se asume poco tiempo: los reclutadores dedican menos de 2 min; muchos responsables de diseño, 5–10 min. De ahí el patrón central: **resumen de lectura rápida primero, caso completo después** (ver `DECISIONS.md`).

## Estructura

- **Textura del fondo** (`intro.js`): la retícula ocre de toda la web. La intro animada (enjambre y pila de piezas) se retiró con la portada en retícula; el código sigue en `intro.js` y no se ejecuta sin el bloque `.intro`.
- **Portada** (`index.html` y `en/index.html`): cabecera fija (foto + «Disponible» abren el panel de perfil) y una retícula (referencia offgrid.inc): primera celda con la entradilla y «Sobre mí»; Pagopero (New, Online; vídeo que abre en el visor, «Cuéntame sobre el proceso» y «Ver producto online») y K Rooms (Case study; mapa del caso de portada y animación al pasar el ratón) como celdas destacadas, en bloques de 2 × 2 en escritorio; cinco piezas de Gallery (Dribbble: Crowd predict, Idealista, Parking, El Far del Nord, Hablar) como celdas que abren el visor en esa pieza; Pujobaixo «Próximamente» al final. Barra fija «Ver CV / Agendar 15 min». Tres columnas (12 pistas, cortes en 4 y 8) desde 1100 px, dos en tableta y en móvil (la entradilla y los proyectos a lo ancho).
- **Resumen de proyecto** (`#draft-drawer`): panel que abre cada card. K Rooms: texto de resumen + 14 piezas. Pujobaixo: solo 3 figuras de su caso externo (falta su texto, ver roadmap); su card está deshabilitada («Próximamente») hasta entonces. Botón fijo «Ver todo el case study» con el tiempo de lectura.
- **Caso K Rooms** (`k-rooms.html`): ~2.400 palabras, 17 figuras. Botón «Resumen» (píldora con texto) en la banda superior, junto a «Secciones».
- **CV** (`cv.html`): foto que viaja a la barra superior con el scroll, contacto, descarga de PDF.
- **Panel de perfil**: se abre desde la foto, «Disponible» o «Sobre mí»; en escritorio es un modal centrado en dos franjas, en móvil un panel lateral; contacto, «What I bring» en cuatro tarjetas visuales (número, dibujo, título, etiqueta y una línea; `<template id="profile-points">`) y «Ver CV completo» fijo abajo. El perfil largo y la experiencia (basada en LinkedIn) están en la página del CV.

## Flujos clave

- Card → resumen → «Ver todo el case study».
- «Ir al texto →» desde una pieza del resumen lleva a la figura del caso; el botón de resumen pasa a «← Volver al resumen» y reabre el resumen en esa pieza (`sessionStorage` `summaryReturn`, 30 min; también al volver desde bfcache con `pageshow`).
- Single source of truth: el texto del resumen de K Rooms vive en `<template id="resumen">` de `k-rooms.html` (y `en/`); la portada y el caso lo leen. Las piezas de detalle se omiten con `data-gskip` (fig-6, 14, 16).

## Medición

GoatCounter (cuenta `dcb`, sin cookies, respeta DNT/GPC, no cuenta localhost). Eventos documentados en la cabecera de `analytics.js`. Depuración: `localStorage.analyticsDebug='1'`. Excluir visitas propias: abrir `davidchia.es/#toggle-goatcounter` en cada navegador y dispositivo.

## Tiempos de lectura

Caso completo = palabras/220, calculado del propio contenido (K Rooms 11 min ES / 10 EN). Pujobaixo, 8 min fijo en la plantilla. Resumen: «1 min» (estimación = palabras×0.28/220, pendiente de medir tiempo real).

## Proyectos relacionados (fuera de este repo)

- **App K Rooms** (gestión de habitaciones de Konvent): su `DESIGN-SYSTEM.md` y `tokens.css` están aparte. No confundir con el sistema de diseño de este portfolio.
- **Pujobaixo** (pujobaixo.cat): carpooling Berguedà ⇄ Barcelona; Supabase + GitHub Pages. Código: github.com/chewim/pujobaixo. Caso en `chewim.github.io/davidchiaresearcher` (solo ES; de ahí se leen 3 imágenes: dependencia externa).

## Sitio estático, sin build

HTML + CSS + JS vanilla. Caché versionada a mano con `?v=` (`scripts/bump-version.sh`). Sin dependencias. Usa Popover API, `<details>`, `<template>`, IntersectionObserver y View Transitions entre documentos.
