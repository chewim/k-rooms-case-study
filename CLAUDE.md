# CLAUDE.md

Portfolio estático de David Chia (https://davidchia.es). Lee primero `CONTEXT.md`; las decisiones y su porqué están en `DECISIONS.md`, lo pendiente en `ROADMAP.md` y los componentes en `DESIGN_SYSTEM.md`.

## Mapa

- `index.html`, `cv.html`, `k-rooms.html`: páginas en español. `en/` repite las tres en inglés. Cualquier cambio de contenido o marcado se hace en las dos versiones.
- `styles.css` (portada y caso), `cv.css`, `script.js` (portada, caso, visor), `intro.js` (intro de la portada), `cv.js`, `analytics.js` (medición).
- `scripts/bump-version.sh`: actualiza los `?v=` de los HTML. Ejecutarlo tras tocar CSS o JS.
- `assets/img/`: imágenes optimizadas. Los originales pesados están en `.gitignore`.
- `assets/anim/`: vídeo de la card de K Rooms. La fuente es `k-rooms-flow.html`; `python3 scripts/render-k-rooms-flow.py` regenera WebM, MP4 y póster (necesita Chrome y ffmpeg).

## Cómo trabajar

- No hay build. Servidor local: `python3 -m http.server 8790` en la raíz del repo.
- Verificar con clics reales en el navegador local antes de proponer subir. Una auditoría de llaves del CSS y de sintaxis del JS también ayuda.
- **Nunca hacer `git push` sin que el usuario lo confirme en ese momento.** Commits con mensaje en español y atribución de Claude.
- Antes de `git add -A`: revisar `git status` y el peso de las imágenes. Una vez se subió un PNG de 1,7 MB con extensión `.jpg`.
- No inventar texto de los resúmenes ni del CV: usar el que ya existe o preguntar. Ejemplo pendiente: qué son los «productos con IA» de The Wise Dreams.
- Reutilizar componentes existentes (ver `DESIGN_SYSTEM.md`) antes de crear otros. Cohesión de botones y tipografía por encima de novedad.
- Evitar saltos de scroll; al volver atrás se conserva la posición.
- Pujobaixo no es un producto de Konvent: no presentarlo como pareja de K Rooms.
- Decisiones nuevas: añadir entrada a `DECISIONS.md` en el mismo commit. Pendientes: `ROADMAP.md`.
