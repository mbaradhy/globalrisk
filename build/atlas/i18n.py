import json,os,re,subprocess,glob
SP='/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad'
a=open('app.html').read()
def r(x,y,cnt=1):
    global a
    assert x in a,x[:80]; a=a.replace(x,y,cnt)
# 1. the one sentence built with a date
r('''"Baseline compiled on "+BASELINE_DATE+" from dated public sources; the situation moves fast."''','''TRf("Baseline compiled on {0} from dated public sources; the situation moves fast.",BASELINE_DATE)''')
# 2. rewrite ternaries in the main script (the one with "use strict")
i=a.index('(function(){\n"use strict";');j=a.index('</script>',i)
open(SP+'/i18n/main_in.js','w').write(a[i:j])
env=dict(os.environ,SP=SP)
print(subprocess.run(['node','i18n_ast.js',SP+'/i18n/main_in.js',SP+'/i18n/main_out.js'],env=env,capture_output=True,text=True).stdout.strip())
a=a[:i]+open(SP+'/i18n/main_out.js').read()+a[j:]
# 2b. the reserve script
i=a.index("  var KEY='kit14-v2';");i=a.rindex('<script>',0,i)+len('<script>');j=a.index('</script>',i)
open(SP+'/i18n/kit_in.js','w').write(a[i:j])
print(subprocess.run(['node','i18n_kit.js',SP+'/i18n/kit_in.js',SP+'/i18n/kit_out.js'],env=env,capture_output=True,text=True))
a=a[:i]+open(SP+'/i18n/kit_out.js').read()+a[j:]
# 3. runtime helpers
TR={}
for f in sorted(glob.glob('i18n/*.json')):
    TR[os.path.basename(f)[:-5]]=json.load(open(f))
helpers='''
var LANGS=[["fr","Français"],["en","English"],["es","Español"],["de","Deutsch"],["it","Italiano"],["pt","Português"],["nl","Nederlands"],["pl","Polski"],["da","Dansk"],["nb","Norsk"],["sv","Svenska"],["fi","Suomi"],["uk","Українська"],["ru","Русский"],["ar","العربية"]];
var TR=%s;
LANGS=LANGS.filter(function(x){return x[0]==="fr"||x[0]==="en"||TR[x[0]];});
function TRs(s){if(L==="fr"||L==="en"||typeof s!=="string")return s;var d=TR[L];if(!d)return s;var v=d[s];if(v!=null)return v;var t=s.trim();if(t&&t!==s&&d[t]!=null)return s.replace(t,d[t]);return s;}
function TRx(v){if(L==="fr"||L==="en")return v;if(typeof v==="string")return TRs(v);if(Array.isArray(v))return v.map(TRx);if(v&&typeof v==="object"&&!(v instanceof Date)){var o={};for(var k in v)o[k]=TRx(v[k]);return o;}return v;}
function TRf(s){var a=arguments;return (L==="fr"?s:TRs(s)).replace(/\\{(\\d)\\}/g,function(m,i){return a[+i+1];});}
function LOC(){return {fr:"fr-FR",en:"en-GB",es:"es-ES",de:"de-DE",it:"it-IT",pt:"pt-PT",nl:"nl-NL",pl:"pl-PL",da:"da-DK",nb:"nb-NO",sv:"sv-SE",fi:"fi-FI",uk:"uk-UA",ru:"ru-RU",ar:"ar-u-nu-latn"}[L]||"en-GB";}
window.TRk=function(s){return TRs(s);};
var FLAG={
 fr:'<rect width="8" height="16" fill="#0055A4"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#EF4135"/>',
 en:'<rect width="24" height="16" fill="#012169"/><path d="M0 0L24 16M24 0L0 16" stroke="#fff" stroke-width="3.2"/><path d="M0 0L24 16M24 0L0 16" stroke="#C8102E" stroke-width="1.2"/><path d="M12 0V16M0 8H24" stroke="#fff" stroke-width="5"/><path d="M12 0V16M0 8H24" stroke="#C8102E" stroke-width="3"/>',
 es:'<rect width="24" height="16" fill="#AA151B"/><rect y="4" width="24" height="8" fill="#F1BF00"/>',
 de:'<rect width="24" height="5.34" fill="#000"/><rect y="5.33" width="24" height="5.34" fill="#DD0000"/><rect y="10.66" width="24" height="5.34" fill="#FFCE00"/>',
 it:'<rect width="8" height="16" fill="#009246"/><rect x="8" width="8" height="16" fill="#fff"/><rect x="16" width="8" height="16" fill="#CE2B37"/>',
 pt:'<rect width="24" height="16" fill="#DA291C"/><rect width="9.6" height="16" fill="#046A38"/><circle cx="9.6" cy="8" r="3.2" fill="#FFE900"/>',
 nl:'<rect width="24" height="5.34" fill="#AE1C28"/><rect y="5.33" width="24" height="5.34" fill="#fff"/><rect y="10.66" width="24" height="5.34" fill="#21468B"/>',
 pl:'<rect width="24" height="8" fill="#fff"/><rect y="8" width="24" height="8" fill="#DC143C"/>',
 da:'<rect width="24" height="16" fill="#C8102E"/><path d="M9 0V16M0 8H24" stroke="#fff" stroke-width="2.6"/>',
 nb:'<rect width="24" height="16" fill="#BA0C2F"/><path d="M9 0V16M0 8H24" stroke="#fff" stroke-width="4"/><path d="M9 0V16M0 8H24" stroke="#00205B" stroke-width="2"/>',
 sv:'<rect width="24" height="16" fill="#006AA7"/><path d="M9 0V16M0 8H24" stroke="#FECC02" stroke-width="2.6"/>',
 fi:'<rect width="24" height="16" fill="#fff"/><path d="M9 0V16M0 8H24" stroke="#002F6C" stroke-width="2.6"/>',
 uk:'<rect width="24" height="8" fill="#0057B7"/><rect y="8" width="24" height="8" fill="#FFD700"/>',
 ru:'<rect width="24" height="5.34" fill="#fff"/><rect y="5.33" width="24" height="5.34" fill="#0039A6"/><rect y="10.66" width="24" height="5.34" fill="#D52B1E"/>',
 ar:'<rect width="24" height="16" rx="2" fill="#1f7a4d"/><text x="12" y="12.2" text-anchor="middle" font-size="11" font-family="Arial,sans-serif" fill="#fff">ع</text>'};
function flag(c){return '<svg class="flg" viewBox="0 0 24 16" aria-hidden="true">'+(FLAG[c]||"")+'</svg>';}
function langMenu(){var b=document.getElementById("lg-b"),m=document.getElementById("lg-m");if(!b)return;
  var cur=LANGS.filter(function(x){return x[0]===L;})[0]||LANGS[1];
  b.innerHTML=flag(cur[0])+'<span class="lgc">'+cur[0].toUpperCase()+'</span><span class="lgn">'+cur[1]+'</span><span class="lga">▾</span>';
  m.innerHTML=LANGS.map(function(x){return '<li role="option" tabindex="-1" data-lg="'+x[0]+'" lang="'+x[0]+'" aria-selected="'+(x[0]===L)+'">'+flag(x[0])+'<span>'+x[1]+'</span></li>';}).join("");}
function langOpen(o){var b=document.getElementById("lg-b"),m=document.getElementById("lg-m");if(!m)return;var op=o==null?m.hidden:o;m.hidden=!op;b.setAttribute("aria-expanded",op);if(op){var s=m.querySelector('[aria-selected="true"]')||m.firstChild;if(s)s.focus();}}
function kitTr(){var k=document.getElementById("v-kit");if(!k)return;k.querySelectorAll('[lang="en"]').forEach(function(e){if(e._en==null)e._en=e.innerHTML;var t=(L==="fr"||L==="en")?e._en:TRs(e._en);if(e.innerHTML!==t)e.innerHTML=t;});}
'''%json.dumps(TR,ensure_ascii=False,separators=(',',':'))
r('''(function(){\n"use strict";''','''(function(){\n"use strict";'''+helpers)
# 4. lookups
r('''function u(k){return UI[L][k];}''','''function u(k){return UI[L]?UI[L][k]:TRx(UI.en[k]);}''')
r('''function tx(o){return o==null?"":(typeof o==="string"?o:(o[L]||o.en||""));}''','''function tx(o){return o==null?"":(typeof o==="string"?o:(o[L]||TRx(o.en)||""));}''')
r('''function cName(code){var c=ISO[code];return c?(L==="fr"?c[4]:c[3]):code;}''','''var DN={};function cName(code){var c=ISO[code];if(!c)return code;if(L==="fr")return c[4];if(L==="en")return c[3];try{DN[L]=DN[L]||new Intl.DisplayNames([L],{type:"region"});return DN[L].of(c[0])||c[3];}catch(e){return c[3];}}''')
r('''Object.keys(UI[L].kinds)''','''Object.keys(UI.en.kinds)''')
# 5. language at start
r('''var L="fr";try{var sl=localStorage.getItem("gra-lang");if(sl)L=sl;else if((navigator.language||"").toLowerCase().indexOf("fr")!==0)L="en";}catch(e){}''',
  '''var L="en";try{var sl=localStorage.getItem("gra-lang"),nl_=(navigator.language||"en").toLowerCase().slice(0,2);var ok_=LANGS.map(function(x){return x[0];}).concat(["no"]);var ok0_=["fr","en","es","de","it","pt","nl","pl","da","nb","sv","fi","no","uk","ru","ar"];if(nl_==="no"||nl_==="nn")nl_="nb";if(sl&&ok_.indexOf(sl)>=0)L=sl;else if(ok_.indexOf(nl_)>=0)L=nl_;}catch(e){}''')
# 6. apply language: dir, dropdown, kit
r('''document.documentElement.lang=L;var vk=document.getElementById("v-kit");if(vk)vk.className="lg-"+L;if(window.kitLang)window.kitLang(L);''',
  '''document.documentElement.lang=L;document.documentElement.dir=L==="ar"?"rtl":"ltr";var vk=document.getElementById("v-kit");if(vk)vk.className="lg-"+(L==="fr"?"fr":"en");if(window.kitLang)window.kitLang(L);kitTr();langMenu();''')
r('''  document.getElementById("lg-fr").setAttribute("aria-pressed",L==="fr");
  document.getElementById("lg-en").setAttribute("aria-pressed",L==="en");
''','')
r('''document.getElementById("lg-fr").addEventListener("click",function(){setLang("fr");});
document.getElementById("lg-en").addEventListener("click",function(){setLang("en");});''','''document.getElementById("lg-b").addEventListener("click",function(e){e.stopPropagation();langOpen();});
document.getElementById("lg-m").addEventListener("click",function(e){var li=e.target.closest("[data-lg]");if(!li)return;langOpen(false);if(li.dataset.lg!==L)setLang(li.dataset.lg);document.getElementById("lg-b").focus();});
document.getElementById("lg-m").addEventListener("keydown",function(e){var it=[].slice.call(this.querySelectorAll("[data-lg]")),i=it.indexOf(document.activeElement);
  if(e.key==="ArrowDown"){e.preventDefault();(it[i+1]||it[0]).focus();}else if(e.key==="ArrowUp"){e.preventDefault();(it[i-1]||it[it.length-1]).focus();}else if(e.key==="Enter"||e.key===" "){e.preventDefault();if(document.activeElement.dataset.lg)document.activeElement.click();}else if(e.key==="Escape"){langOpen(false);document.getElementById("lg-b").focus();}});
document.addEventListener("click",function(e){if(!e.target.closest("#lang"))langOpen(false);});''')
# header markup
r('''<div class="lang" role="group" aria-label="Language"><button type="button" id="lg-fr" aria-pressed="true">FR</button><button type="button" id="lg-en" aria-pressed="false">EN</button></div>''',
  '''<div class="lang lgdd" id="lang"><button type="button" id="lg-b" aria-haspopup="listbox" aria-expanded="false" aria-label="Language"></button><ul id="lg-m" role="listbox" aria-label="Language" hidden></ul></div>''')
# 7. kit script
r('''  var L=(document.documentElement.lang==='en')?'en':'fr';''','''  var L=document.documentElement.lang||'fr';''')
r('''return '<span lang="fr">'+o.fr+'</span><span lang="en">'+o.en+'</span>';}''','''return '<span lang="fr">'+o.fr+'</span><span lang="en">'+(window.TRk?TRk(o.en):o.en)+'</span>';}''')
r('''function P(o){return typeof o==='string'?o:o[L];}''','''function P(o){return typeof o==='string'?o:(o[L]||(window.TRk?TRk(o.en):o.en));}''')
css='''
/* ---- language dropdown & right-to-left ---- */
.lang.lgdd{position:relative;overflow:visible;border:0;display:inline-block}
#lg-b{display:inline-flex;align-items:center;gap:7px;background:var(--panel);border:1px solid #3a4b5c;border-radius:4px;color:var(--ink);font:inherit;font-weight:700;padding:4px 9px;cursor:pointer;line-height:1.2}
#lg-b:hover{border-color:var(--accent)}#lg-b .lgn{font-weight:500;font-family:var(--f-body,inherit)}#lg-b .lga{font-size:.7em;opacity:.7}
.flg{width:20px;height:14px;border-radius:2px;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.15)}
#lg-m{position:absolute;right:0;top:calc(100% + 4px);z-index:80;list-style:none;margin:0;padding:4px;min-width:190px;background:#111a25;border:1px solid var(--line);border-radius:6px;box-shadow:0 12px 30px rgba(0,0,0,.55);max-height:70vh;overflow:auto}
#lg-m[hidden]{display:none}
#lg-m li{display:flex;align-items:center;gap:10px;padding:7px 10px;border-radius:4px;cursor:pointer;font-weight:500;font-family:var(--f-body,inherit);letter-spacing:0;text-transform:none}
#lg-m li:hover,#lg-m li:focus{background:var(--panel2);outline:none}#lg-m li[aria-selected="true"]{background:rgba(127,209,255,.14);color:var(--accent)}
@media (max-width:700px){#lg-b .lgn{display:none}#lg-b{padding:3px 7px}}
[dir="rtl"] #lg-m{right:auto;left:0}
[dir="rtl"] body{direction:rtl}
[dir="rtl"] #v-globe,[dir="rtl"] #v-net,[dir="rtl"] #v-mind,[dir="rtl"] .lmw,[dir="rtl"] .ttmap,[dir="rtl"] .ghs,[dir="rtl"] .gnt .gb,[dir="rtl"] .tk-w,[dir="rtl"] .mono,[dir="rtl"] .hrow,[dir="rtl"] .hax{direction:ltr}
[dir="rtl"] .ttax span,[dir="rtl"] .gax span{direction:ltr}
'''
r('</style>',css+'</style>')
open('app.html','w').write(a)
print('i18n ok',sorted(TR))
