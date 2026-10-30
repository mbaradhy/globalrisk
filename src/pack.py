import zipfile
f=open('/home/claude/global-risk-atlas.html').read()
assert f.startswith('<title>')
j=f.index('</style>')+len('</style>')
head=f[:j]; body=f[j:]
out='<!doctype html>\n<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+head+'</head><body>'+body.lstrip('\n').join(['\n\n',''])+'\n</body></html>'
open('/home/claude/global-risk-atlas-file.html','w').write(out)
open('/home/claude/cf/global-risk-atlas/index.html','w').write(out)
with zipfile.ZipFile('/home/claude/cf/global-risk-atlas.zip','w',zipfile.ZIP_DEFLATED) as z: z.write('/home/claude/cf/global-risk-atlas/index.html','index.html')
print('packed',len(out))
