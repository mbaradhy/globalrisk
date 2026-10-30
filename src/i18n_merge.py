import json,re,sys
D='/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/i18n/'
keys=[x['en'] for x in json.load(open(D+'strings.json'))]+[x['en'] for x in json.load(open(D+'strings_extra.json'))]
tag=re.compile(r'</?[a-zA-Z][^>]*>|\{\d\}')
for lg in ['es','de','nl','pl','da','nb','sv','fi','ar','pt','ru','uk','it']:
    import os
    if not (os.path.exists(D+lg+'.json') and os.path.exists(D+lg+'_extra.json')): print(lg,'not ready');continue
    m=json.load(open(D+lg+'.json'));m.update(json.load(open(D+lg+'_extra.json')))
    miss=[k for k in keys if k not in m or not str(m[k]).strip()]
    bad=[k for k in keys if k in m and sorted(tag.findall(k))!=sorted(tag.findall(m[k]))]
    same=sum(1 for k in keys if m.get(k)==k)
    m.pop("'+o.en+'",None)
    if lg=='ru': m.pop('&amp;hl=en-GB&amp;gl=GB&amp;ceid=GB:en',None)
    cyr=re.compile('[\u0400-\u04FF]');arab=re.compile('[\u0600-\u06FF]')
    mix=[v for v in m.values() if (lg=='ar' and cyr.search(v)) or (lg in('ru','uk') and arab.search(v)) or (lg not in ('ar','ru','uk') and (cyr.search(v) or arab.search(v)))]
    if mix: print(lg,'MIXED SCRIPT',mix[:3])
    out={k:m[k] for k in keys if k in m and m[k]!=k}
    json.dump(out,open('/home/claude/atlas/i18n/'+lg+'.json','w'),ensure_ascii=False,separators=(',',':'))
    print(lg,'entries',len(out),'missing',len(miss),'tag-mismatch',len(bad),'unchanged',same, bad[:2])
