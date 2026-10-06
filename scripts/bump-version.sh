#!/bin/sh
# Actualiza de una vez el número de versión (?v=...) de styles.css, cv.css, script.js, cv.js, analytics.js, intro.js y el vídeo
# de la card de K Rooms (assets/anim/k-rooms-flow*) en todas las páginas,
# para que el navegador no mezcle HTML nuevo con estilos o scripts en caché.
#
# Uso:  scripts/bump-version.sh            (versión = fecha y hora actuales, AAAAMMDDHHMM)
#       scripts/bump-version.sh 202610051200
set -eu
cd "$(dirname "$0")/.."

VERSION="${1:-$(date +%Y%m%d%H%M)}"
case "$VERSION" in
  ''|*[!0-9]*) echo "La versión debe ser numérica (por ejemplo 202610051200)." >&2; exit 1 ;;
esac

# Solo las páginas publicadas (la página de prueba, ignorada en git, no entra)
FILES=$(git ls-files '*.html')
[ -n "$FILES" ] || { echo "No hay páginas HTML versionadas." >&2; exit 1; }

# shellcheck disable=SC2086
perl -pi -e "s/((?:styles|cv)\.css|(?:script|cv|analytics|intro)\.js|k-rooms-flow(?:-poster)?\.(?:webm|mp4|jpg))\?v=\d+/\$1?v=$VERSION/g" $FILES

echo "Versión $VERSION aplicada en:"
for f in $FILES; do
  n=$(grep -o "\(styles\|cv\)\.css?v=$VERSION\|\(script\|cv\|analytics\|intro\)\.js?v=$VERSION\|k-rooms-flow[a-z-]*\.[a-z0-9]*?v=$VERSION" "$f" | wc -l | tr -d ' ')
  [ "$n" -gt 0 ] && echo "  $f ($n enlaces)"
done
