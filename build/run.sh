#!/bin/sh
# Rebuilds the Global Risk Atlas from build/ and copies the result to the repo root.
# Usage: sh build/run.sh   (needs python3, node and npm; installs Pillow and the node helpers if missing)
set -e
B=$(cd "$(dirname "$0")" && pwd); REPO=$(dirname "$B")
# the build scripts use fixed working paths; recreate them here
SP=/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad
mkdir -p "$SP/i18n" /home/claude/cf/global-risk-atlas
if [ ! -e /home/claude/atlas ]; then ln -s "$B/atlas" /home/claude/atlas; fi
cp "$B/kit-2-semaines.html" /home/claude/
cp "$B/sp/iso.json" "$SP/"
cp "$B"/sp/i18n/*.json "$SP/i18n/"
if [ ! -d "$SP/node_modules/acorn-walk" ] || [ ! -d "$SP/node_modules/world-atlas" ]; then
  (cd "$SP" && npm install --no-save --silent acorn@8 acorn-walk@8 world-atlas@2 d3@7 >/dev/null)
fi
python3 -c "import PIL" 2>/dev/null || pip install --quiet --break-system-packages pillow
cd /home/claude/atlas
rm -f i18n/*.json
python3 i18n_merge.py
for s in wire kit mobile gauge labels phone pathui ux analysis i18n build pack; do python3 "$s.py" >/dev/null; done
ATLAS_OG_OUT="$REPO/og.png" python3 og.py
cp /home/claude/global-risk-atlas-file.html "$REPO/index.html"
mkdir -p "$REPO/src/i18n"
cp /home/claude/atlas/i18n/*.json "$REPO/src/i18n/"
echo "Built: $REPO/index.html ($(wc -c < "$REPO/index.html") bytes)"
