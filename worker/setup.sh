#!/bin/sh
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js is needed: https://nodejs.org"; exit 1; }
node setup.js
