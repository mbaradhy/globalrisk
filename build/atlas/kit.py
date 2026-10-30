import re
k=open('/home/claude/kit-2-semaines.html').read()
css=k[k.index('<style>')+7:k.index('</style>')]
body=k[k.index('<input class="lgr"'):k.index('<script>')]
js=k[k.index('<script>')+8:k.rindex('</script>')]

# ---- scope CSS under #v-kit
css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
def split_rules(t):
    out=[];i=0;n=len(t)
    while i<n:
        j=t.find('{',i)
        if j<0:break
        sel=t[i:j].strip()
        depth=1;m=j+1
        while depth and m<n:
            if t[m]=='{':depth+=1
            elif t[m]=='}':depth-=1
            m+=1
        out.append((sel,t[j+1:m-1]));i=m
    return out
SKIP=(':root','body','.lgr','#lg-','.lang')
def pref(sel):
    parts=[]
    for s in sel.split(','):
        s=s.strip()
        if not s:continue
        if any(x in s for x in SKIP):continue
        parts.append('#v-kit '+s if s!='*' else '#v-kit *')
    return ','.join(parts)
res=[]
for sel,inner in split_rules(css):
    if sel.startswith('@media'):
        if 'prefers-color-scheme' in sel:continue
        sub=[]
        for s2,i2 in split_rules(inner):
            p=pref(s2)
            if p:sub.append(p+'{'+i2+'}')
        if sub:res.append(sel+'{'+''.join(sub)+'}')
    else:
        p=pref(sel)
        if p:res.append(p+'{'+inner+'}')
tokens='''#v-kit{--bg:#0d151e;--surface:#111a25;--ink:#e3e9ee;--muted:#8c9aa8;--line:#24323f;--accent:#7fd1ff;--accent-soft:#11283a;--accent-ink:#0a1018;
--ess:#ef8a55;--rec:#6db3d4;--opt:#9aa3a6;--good:#6cc28e;--good-soft:#1c3326;
--f-display:"Barlow Condensed","Arial Narrow",Arial,sans-serif;--f-body:"Source Sans 3",system-ui,sans-serif;--f-mono:"JetBrains Mono",ui-monospace,Menlo,monospace;
color:var(--ink);font-family:var(--f-body);font-size:15px;line-height:1.55;background:transparent}
#v-kit.lg-fr [lang="en"],#v-kit.lg-en [lang="fr"]{display:none!important}
#v-kit .wrap{max-width:none!important;padding:4px 0 24px!important}
#v-kit header.top{border-bottom:1px solid var(--line)!important;padding-bottom:16px!important;margin-bottom:22px!important;gap:8px!important}
#v-kit footer{border-top-color:var(--line)}
#v-kit h1{font-size:clamp(1.6rem,3vw,2.1rem)!important;text-transform:uppercase;letter-spacing:.02em}
#v-kit h2{text-transform:uppercase;letter-spacing:.03em}
#v-kit nav.idx{top:0!important}
#v-kit .bar{display:block;cursor:default}
.stage.wide{grid-template-columns:minmax(0,1fr)}
.stage.wide aside.panel{display:none}
.stage.wide .view{height:auto;min-height:0;overflow:visible;background:transparent;border:0;border-radius:0}
.stage.wide #v-kit{position:relative;inset:auto}
'''
kcss=tokens+'\n'.join(res)

# ---- HTML: drop radios and the kit's own switch
body=re.sub(r'<input class="lgr"[^>]*>\s*','',body)
body=body.replace('<div class="lang" role="group" aria-label="Langue / Language"><label for="lg-fr">FR</label><label for="lg-en">EN</label></div>','')
body=re.sub(r'\s*<div class="byline">.*?</div>','',body,flags=re.S)
body=body.replace('<p>© 2026 M. BARADHY</p>','')
assert 'M. BARADHY' not in body
body=body.replace('<a href="#','<a data-kj="#')  # in-page jumps handled by script
# ---- JS: language follows the atlas
old=js[js.index("  var rf=document.getElementById('lg-fr')"):js.index("  function T(o)")]
js=js.replace(old,"  var L=(document.documentElement.lang==='en')?'en':'fr';\n  window.kitLang=function(l){L=l;S.lang=l;render();};\n\n")

# ---- per-country shops and currency (window.KITC is set by the atlas)
def _r(x,y,c=1):
    global js
    assert js.count(x)>=c,(x[:60],js.count(x))
    js=js.replace(x,y)
_r("function eur(x){return Math.round(x).toLocaleString('fr-FR')+' €';}","function eur(x){var c=window.KITC&&window.KITC.cur&&window.KITC.cur();if(!c||c.code==='EUR')return Math.round(x).toLocaleString(c&&c.loc||'fr-FR')+' €';return '≈ '+Math.round(x*c.rate).toLocaleString(c.loc)+' '+c.sym;}")
_r("function link(b){var s=SHOPS[b.s];return s.url?s.url+encodeURIComponent(b.q):null;}","function SH(){return (window.KITC&&window.KITC.shops&&window.KITC.shops())||SHOPS;}\n  function link(b,it){var s=SH()[b.s];if(!s||!s.url)return null;if(s.site)return 'https://www.google.com/search?q='+encodeURIComponent((it?P(it.n):b.q)+' site:'+s.site);return s.url+encodeURIComponent(b.q);}")
js=js.replace("SHOPS[","SH()[")
_r("esc(link(b))","esc(link(b,it))")
_r("link(x.b)","link(x.b,x.it)",2)
_r("function render(){","window.addEventListener('kitc',function(){render();});\n  function render(){")
js+='''
document.getElementById("v-kit").addEventListener("click",function(e){var a=e.target.closest("a[data-kj]");if(!a)return;e.preventDefault();var t=document.querySelector("#v-kit "+a.getAttribute("data-kj"));if(t)t.scrollIntoView({behavior:"smooth",block:"start"});});
'''

a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
r('footer{color:var(--muted)',kcss+'\nfooter{color:var(--muted)')
r('''  <button role="tab" data-t="globe" aria-selected="false" data-i="tGlobe"></button>''','''  <button role="tab" data-t="kit" aria-selected="false" data-i="tKit"></button>
  <button role="tab" data-t="globe" aria-selected="false" data-i="tGlobe"></button>''')
r('''    <div data-v="globe" id="v-globe" hidden></div>''','''    <div data-v="kit" id="v-kit" class="lg-fr" hidden>'''+body+'''</div>
    <div data-v="globe" id="v-globe" hidden></div>''')
r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";UI.fr.tKit="Réserve 14 jours";UI.en.tKit="14-day reserve";UI.fr.openKit="Ouvrir la Réserve 14 jours";UI.en.openKit="Open the 14-day reserve";''')
# language sync
r('''function applyI18n(){
  document.documentElement.lang=L;''','''function applyI18n(){
  document.documentElement.lang=L;var vk=document.getElementById("v-kit");if(vk)vk.className="lg-"+L;if(window.kitLang)window.kitLang(L);''')
# tab layout
r('''  document.getElementById("pathbar").hidden=t!=="net";''','''  document.getElementById("pathbar").hidden=t!=="net";
  document.querySelector(".stage").classList.toggle("wide",t==="kit");
  document.getElementById("filters").hidden=t==="kit";''')
r('''showTab(["dash","globe","net","mind","matrix","news","brief","method"].indexOf(h0)>=0?h0:"dash");''','''showTab(["dash","kit","globe","net","mind","matrix","news","brief","method"].indexOf(h0)>=0?h0:"dash");''')
# link from the France households node
r('''  if(n.h)h+='<div class="p-sec"><div class="lbl">'+esc(u("house"))+'</div><p>'+esc(tx(n.h))+'</p></div>';''','''  if(n.h)h+='<div class="p-sec"><div class="lbl">'+esc(u("house"))+'</div><p>'+esc(tx(n.h))+'</p></div>';
  if(n.id==="fr-households"||n.h)h+='<div class="p-sec"><button class="btn" type="button" data-kit="1">'+esc(u("openKit"))+' →</button></div>';''')
r('''  if(e.target.closest("#pclose")){closePanel();}''','''  if(e.target.closest("#pclose")){closePanel();}
  if(e.target.closest("[data-kit]")){showTab("kit");window.scrollTo({top:0,behavior:"smooth"});}''')
# kit script after atlas script
r('''</script>
''','''</script>
''',)
a=a.rstrip()
assert a.endswith('</script>')
a=a+'\n<script>\n'+js+'\n</script>\n'
open('app.html','w').write(a)
print('kit merged',len(kcss))

# ---- final tab order
import re as _re
a=open('app.html').read()
order=["dash","brief","news","globe","net","mind","matrix","kit","method"]
keys={"dash":"tDash","brief":"tBrief","news":"tNews","globe":"tGlobe","net":"tNet","mind":"tMind","matrix":"tMatrix","kit":"tKit","method":"tMethod"}
nav='<nav class="tabs" role="tablist" id="tabs">\n'+''.join('  <button role="tab" data-t="%s" aria-selected="%s" data-i="%s"></button>\n'%(t,"true" if t=="dash" else "false",keys[t]) for t in order)+'</nav>'
a,n=_re.subn(r'<nav class="tabs" role="tablist" id="tabs">.*?</nav>',nav,a,flags=_re.S)
assert n==1
open('app.html','w').write(a)
print('tabs reordered')
