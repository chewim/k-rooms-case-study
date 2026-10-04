#!/bin/sh
# Actualiza de una vez el número de versión (?v=...) de styles.css, cv.css, script.js y cv.js en todas las páginas,
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
perl -pi -e "s/((?:styles|cv)\.css|(?:script|cv)\.js)\?v=\d+/\$1?v=$VERSION/g" $FILES

echo "Versión $VERSION aplicada en:"
for f in $FILES; do
  n=$(grep -o "\(styles\|cv\)\.css?v=$VERSION\|\(script\|cv\)\.js?v=$VERSION" "$f" | wc -l | tr -d ' ')
  [ "$n" -gt 0 ] && echo "  $f ($n enlaces)"
done
