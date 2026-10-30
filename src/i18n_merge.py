import json,re,os
D='/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/i18n/'
keys=[]
import glob
def _n(p):
    m=re.search(r'_extra(\d*)\.json$',p);return 0 if not m else (1 if m.group(1)=='' else int(m.group(1)))
EXTRA=sorted([os.path.basename(p) for p in glob.glob(D+'strings_extra*.json')],key=_n)
for f in ['strings.json']+EXTRA:
    keys+=[x['en'] for x in json.load(open(D+f))]
tag=re.compile(r'</?[a-zA-Z][^>]*>|\{\d\}')
cyr=re.compile('[Ѐ-ӿ]');arab=re.compile('[؀-ۿ]')
for lg in ['es','de','nl','pl','da','nb','sv','fi','ar','pt','ru','uk','it']:
    m={}
    for suf in ['','_extra','_extra2','_full']+['_extra%d'%i for i in range(3,40)]:
        p=D+lg+suf+'.json'
        if os.path.exists(p):
            try:m.update(json.load(open(p)))
            except Exception as e:print(lg,suf,'unreadable',e)
    base=[k for k in keys[:1032] if k in m]
    if len(base)<1000: print(lg,'not ready',len(base));continue
    m.pop("'+o.en+'",None)
    if lg=='ru': m.pop('&amp;hl=en-GB&amp;gl=GB&amp;ceid=GB:en',None)
    mix=[v for v in m.values() if (lg=='ar' and cyr.search(v)) or (lg in('ru','uk') and arab.search(v)) or (lg not in ('ar','ru','uk') and (cyr.search(v) or arab.search(v)))]
    if mix: print(lg,'MIXED SCRIPT',mix[:3])
    bad=[k for k in keys if k in m and sorted(tag.findall(k))!=sorted(tag.findall(m[k]))]
    out={k:m[k] for k in keys if k in m and m[k]!=k}
    json.dump(out,open('/home/claude/atlas/i18n/'+lg+'.json','w'),ensure_ascii=False,separators=(',',':'))
    print(lg,'entries',len(out),'missing',sum(1 for k in keys if k not in m),'tag-mismatch',len(bad))
