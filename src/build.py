import json,re,sys
t=open('app.html').read()
w=json.dumps(json.load(open('/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/node_modules/world-atlas/countries-110m.json')),separators=(',',':'))
d=open('data.js').read()
out=t.replace('/*WORLD*/',w).replace('/*DATA*/',d)
open('/home/claude/global-risk-atlas.html','w').write(out)
loc=out.replace('https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js','file:///tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/node_modules/d3/dist/d3.min.js') .replace('https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/dist/topojson-client.min.js','file:///tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/node_modules/topojson-client/dist/topojson-client.min.js') .replace('https://cdn.jsdelivr.net/npm/globe.gl@2.46.1/dist/globe.gl.min.js','file:///tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/node_modules/globe.gl/dist/globe.gl.min.js') .replace('https://cdn.jsdelivr.net/npm/3d-force-graph@1.80.0/dist/3d-force-graph.min.js','file:///tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/node_modules/3d-force-graph/dist/3d-force-graph.min.js')
open('/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/local.html','w').write('<!doctype html><html><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"></head><body>'+loc+'</body></html>')
print(len(out))
