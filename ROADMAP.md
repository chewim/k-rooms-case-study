# Roadmap

Estado a 2026-10-04. Todo lo descrito en `CONTEXT.md` está publicado.

## Próximo

1. **Probar «Volver al resumen» en navegadores reales** (bfcache). Si falla, anotar navegador y dispositivo.
2. **Resumen de Pujobaixo**: hacer el audit comparativo caso completo vs resumen y escribir el bloque de texto (rol, decisiones, resultado) como en K Rooms. Decidir si lleva una fila pequeña con pujobaixo.cat y el código. Las 3 imágenes se leen de otra web (dependencia); el caso solo está en ES.
3. **Longitud del resumen de K Rooms**: en móvil mide ~17 pantallas. Opciones: imágenes más bajas, dos columnas o retícula. Sin decidir.
4. **Cierre del caso de K Rooms**: elegir frase (recomendada A: «Esto es lo que aporto: decisiones con porqué, de la investigación a un MVP funcional.») y decidir si el bloque final lleva «Ver CV». Hoy mantiene «Agendar encuentro» + «Descargar CV».

5. **Intro de la portada**: verla en dispositivos reales (iPhone Safari, Android Chrome, Windows con barra de scroll clásica) y medir `intro-skip` frente a visitas tras unas semanas. Si muchos la saltan en el primer segundo, acortar el momento 02. Pendiente del usuario: decir de qué es la foto de David presentando en chia.framer.website (no se ha usado por no saber su proyecto).

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

- Renombrar la clase `.drawer`, compartida por la galería del caso, el panel de perfil y el resumen. Hacerlo en una sesión aparte y con revisión visual de los tres.
- `borrador-estructura.md` (reestructura del caso K Rooms: resumen, fusionar secciones, tablas más cortas, aprendizajes de 5 a 3): ignorado en git; retomar cuando se decida reordenar el caso.
- `prueba-ia.html/.css/.js` (prueba de búsqueda con IA): ignorados a propósito; no publicar salvo petición.

## Medición: qué revisar y cuándo

Tras unas semanas de tráfico real, en https://dcb.goatcounter.com:

- `summary-cta` frente a `card-open`: ¿el resumen empuja al caso completo?
- `summary-seen/<proyecto>/<n>`: cuántas piezas ven antes de cerrar (¿14 son demasiadas?).
- `depth/k-rooms/*`: hasta dónde llegan en el caso.
- `book-meeting`, `mail-click`, `mail-copy`, `linkedin-click`, `cv-open`, `cv-download`: conversión.

**Antes**: abrir `davidchia.es/#toggle-goatcounter` en cada navegador propio y borrar las visitas de prueba del panel.
