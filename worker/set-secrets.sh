#!/bin/sh
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "Node.js is not installed. Get it from https://nodejs.org (LTS), then run this again."; exit 1; }
node set-secrets.js
