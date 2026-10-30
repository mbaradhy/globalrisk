import zipfile
f=open('/home/claude/global-risk-atlas.html').read()
assert f.startswith('<title>')
j=f.index('</style>')+len('</style>')
head=f[:j]; body=f[j:]
OGU='https://mbaradhy.github.io/globalrisk/'
META=('<meta name="description" content="Global risks as checkable questions: a level from 1 to 5, probabilities with sources, a live map and a 14-day household reserve.">'
 '<meta property="og:type" content="website"><meta property="og:site_name" content="Global Risk Atlas"><meta property="og:title" content="Global Risk Atlas">'
 '<meta property="og:description" content="Global risks as checkable questions: level 1–5, probabilities with sources, live map, 14-day reserve. · Les risques mondiaux en questions vérifiables.">'
 '<meta property="og:url" content="'+OGU+'"><meta property="og:image" content="'+OGU+'og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">'
 '<link rel="manifest" href="manifest.webmanifest"><meta name="theme-color" content="#0a1018"><link rel="apple-touch-icon" href="icon-192.png"><link rel="icon" type="image/png" href="icon-192.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">')
out='<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+META+head+'</head><body>'+body.lstrip('\n').join(['\n\n',''])+'\n</body></html>'
open('/home/claude/global-risk-atlas-file.html','w').write(out)
open('/home/claude/cf/global-risk-atlas/index.html','w').write(out)
with zipfile.ZipFile('/home/claude/cf/global-risk-atlas.zip','w',zipfile.ZIP_DEFLATED) as z: z.write('/home/claude/cf/global-risk-atlas/index.html','index.html')
print('packed',len(out))
