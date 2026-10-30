a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)

# ---------- relay: try same-site /api, then atlas-api.bmapps.co, then direct
r('''function tFetch(url,ms){''','''var PROXY_BASES=(function(){var b=[];if(/^https?:$/.test(location.protocol)&&!/claude\\.ai|claudeusercontent|anthropic/.test(location.hostname)){b.push(location.origin+"/api");}b.push("https://atlas-api.bmapps.co");b.push("https://atlas-api.mbaradhy.workers.dev");return b;})();
var proxyOk=null;
function viaProxy(k,base,qs){var u=[];PROXY_BASES.forEach(function(p){u.push(p+"/"+k+(qs?"?"+qs:""));});u.push(base+(qs?"?"+qs:""));return u;}
function tryFetch(urls,ms){var i=0;return new Promise(function(res,rej){(function next(){if(i>=urls.length){rej(new Error("all failed"));return;}var u=urls[i++];
  tFetch(u,ms).then(function(j){if(j&&j.error&&!j.articles&&!j.timeline&&!j.data&&!j.features){throw new Error("proxy error");}res(j);}).catch(next);})();});}
function tFetch(url,ms){''')
r('''tFetch(GD+"?"+job.params+"&format=json",15000)''','''tryFetch(viaProxy("gdelt",GD,job.params+"&format=json"),15000)''')
r('''tFetch("https://api.reliefweb.int/v2/reports?appname=global-risk-atlas&profile=list&preset=latest&limit=12",12000)''','''tryFetch(viaProxy("reliefweb","https://api.reliefweb.int/v2/reports","appname=global-risk-atlas&profile=list&preset=latest&limit=12"),12000)''')
r('''tFetch("https://gamma-api.polymarket.com/events?closed=false&active=true&limit=400&order=volume24hr&ascending=false",12000)''','''tryFetch(viaProxy("poly","https://gamma-api.polymarket.com/events","closed=false&active=true&limit=400&order=volume24hr&ascending=false"),12000)''')
# GDACS through relay too
i=a.index('feed("gdacs","https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP"')
r('''function feed(key,url,parse,badgeId){
  return tFetch(url)''','''function feed(key,url,parse,badgeId){
  var urls=key==="gdacs"?viaProxy("gdacs","https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP",""):[url];
  return tryFetch(urls,9000)''')

# ---------- attention list: no dashes when data is missing
r('''  el.innerHTML=ids.map(function(id){var n=byId[id];return '<div data-go="'+id+'"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</span>'+(volCache[id]?spark(volCache[id].s,80,20):'<span class="note">'+(gdOk===false?"—":esc(u("loading")))+'</span>')+spkBadge(id)+'</div>';}).join("")+
   (gdOk===false?'<p class="note" style="margin-top:8px">'+esc(u("nofeed"))+'</p>':"");''',
'''  if(gdOk===false&&!Object.keys(volCache).length){el.innerHTML='<div class="nodata"><b>'+esc(u("attOffH"))+'</b><p class="note">'+esc(u("attOffP"))+'</p></div>'+ids.map(function(id){var n=byId[id];return '<div data-go="'+id+'" class="go"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</span><span></span><span class="chev">›</span></div>';}).join("");return;}
  el.innerHTML=ids.map(function(id){var n=byId[id];return '<div data-go="'+id+'" class="go"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</span>'+(volCache[id]?spark(volCache[id].s,80,20):'<span class="note">'+esc(u("loading"))+'</span>')+(volCache[id]?spkBadge(id):'<span class="chev">›</span>')+'</div>';}).join("");''')
r('''var spH=sp.length?''','''var spH=(gdOk===false&&!Object.keys(volCache).length)?'<div class="nodata"><b>'+esc(u("attOffH"))+'</b><p class="note">'+esc(u("attOffP"))+'</p></div>':sp.length?''')
r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";
UI.fr.attOffH="Données d'attention médiatique indisponibles";UI.en.attOffH="Media-attention data unavailable";
UI.fr.attOffP="GDELT, la source de ces courbes, est saturé et refuse les requêtes pour le moment. Nouvel essai automatique ; les courbes s'afficheront dès qu'il répondra.";UI.en.attOffP="GDELT refuses direct browser requests. Once the \\"atlas-api\\" relay is set up on Cloudflare, the curves and spikes will appear here.";
UI.fr.clickHint="Astuce : chaque carte, barre ou ligne est cliquable et ouvre le dossier du risque.";UI.en.clickHint="Tip: every card, bar and row is clickable and opens the risk's dossier.";
UI.fr.details="Détails";UI.en.details="Details";''')

# ---------- make clickable things look clickable
r('''  el.innerHTML='<div class="dash">'+''','''  el.innerHTML='<div class="dash"><p class="hint">☞ '+esc(u("clickHint"))+'</p>'+''')
r('''+kpiChart(k)+'<div class="k-n">'+esc(tx(k.note))+'</div></div>';}).join("");''','''+kpiChart(k)+'<div class="k-n">'+esc(tx(k.note))+'</div><div class="k-more">'+esc(u("details"))+' ›</div></div>';}).join("");''')
r('</style>','''
.hint{margin:0;font-size:.82rem;color:var(--accent);background:rgba(127,209,255,.07);border:1px solid rgba(127,209,255,.25);border-radius:4px;padding:6px 10px}
.k-more{margin-top:auto;font-size:.74rem;color:var(--accent);opacity:.7;transition:opacity .15s}
.kpi:hover .k-more,.kpi:focus-within .k-more{opacity:1}
.kpi{transition:transform .12s,border-color .12s}.kpi:hover{transform:translateY(-2px)}
.chev{color:var(--muted);font-size:1.1rem;line-height:1;text-align:right;transition:transform .15s,color .15s}
.att div,.bar,.fc[data-go],.cal div,.wl .nm{position:relative;border-radius:4px;transition:background .12s}
.att div:hover,.bar:hover,.fc[data-go]:hover,.cal div:hover{background:var(--panel2)}
.att div:hover .chev{color:var(--accent);transform:translateX(3px)}
.bar::after,.fc[data-go]::after,.cal div::after{content:"›";position:absolute;right:-12px;top:50%;transform:translateY(-50%);color:var(--muted);opacity:0;transition:opacity .15s,right .15s}
.bar:hover::after,.fc[data-go]:hover::after,.cal div:hover::after{opacity:1;right:-10px;color:var(--accent)}
.nodata{border:1px dashed #3a4b5c;border-radius:4px;padding:8px 10px;margin-bottom:6px;display:flex;flex-direction:column;gap:3px;font-size:.84rem}
@media (hover:none){.bar::after,.fc[data-go]::after,.cal div::after{opacity:.7;right:-8px}.k-more{opacity:1}}
</style>''')
open('app.html','w').write(a)
print('ux ok')

# ---------- news ticker (all pages)
a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
r('nofeed:"Flux d\'actualités indisponible ici. Ouvrez le fichier téléchargé dans un navigateur avec internet, ou utilisez ces liens :"','nofeed:"Flux en direct momentanément indisponible (sources saturées ou hors ligne). En attendant, ouvrez :"')
r('nofeed:"News feed unavailable here. Open the downloaded file in a browser with internet, or use these links:"','nofeed:"Live feed temporarily unavailable (sources overloaded or offline). Meanwhile, open:"')
r('</nav>','''</nav>
<div class="ticker" id="ticker" role="region" aria-label="News ticker"><span class="tk-l" id="tkl"></span><div class="tk-w"><div class="tk-t" id="tkt"></div></div></div>''')
r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";UI.fr.tkLive="À LA UNE";UI.en.tkLive="HEADLINES";UI.fr.tkBase="L'ESSENTIEL";UI.en.tkBase="KEY FACTS";''')
r('''/* ---------- boot ---------- */''','''/* ---------- ticker ---------- */
var tkArts=null;
function tkItems(){
  if(tkArts&&tkArts.length)return tkArts.slice(0,24).map(function(x){return '<a href="'+esc(x.url)+'" target="_blank" rel="noopener"><i class="tk-dot"></i>'+esc(x.title)+' <small>'+esc(x.dom||"")+' · '+esc(ago(x.ts))+'</small></a>';});
  var it=INDICATORS.slice(0,6).map(function(k){var n=byId[k.node];return '<button type="button" data-go="'+k.node+'"><i class="tk-dot" style="background:'+col(n)+'"></i><b>'+esc(tx(k.t))+'</b> '+nf(k.now,k.dec)+' '+esc(k.unit)+' <small>'+esc(lbl(k.nowD))+'</small></button>';});
  BRIEF.top.forEach(function(id){var n=byId[id];it.push('<button type="button" data-go="'+id+'"><i class="tk-dot" style="background:'+col(n)+'"></i><b>'+esc(tx(n.t))+'</b> · '+esc(u("status")[n.st])+'</button>');});
  CAL.slice(0,4).forEach(function(c){it.push('<button type="button" data-go="'+c.node+'"><i class="tk-dot" style="background:#ffb547"></i>'+esc(c.d.slice(8,10)+"/"+c.d.slice(5,7))+' · '+esc(tx(c.t))+'</button>');});
  return it;
}
function drawTicker(){
  var t=document.getElementById("tkt");if(!t)return;var it=tkItems();var live=!!(tkArts&&tkArts.length);
  var l=document.getElementById("tkl");l.innerHTML=(live?'<i class="tk-live"></i>':'')+esc(u(live?"tkLive":"tkBase"));l.className="tk-l"+(live?" on":"");
  var html=it.join('<span class="tk-sep">◆</span>');t.innerHTML=html+'<span class="tk-sep">◆</span>'+html;
  var len=t.scrollWidth/2;t.style.animationDuration=Math.max(40,len/55)+"s";
}
function loadTicker(){
  fetchArts('("Strait of Hormuz" OR Iran OR Ukraine OR "El Nino" OR Sudan OR Taiwan OR Ebola OR "gas prices" OR "food prices" OR sabotage)',"1d",L==="fr"?"":"",true,40)
   .then(function(v){if(v&&v.length){tkArts=v;drawTicker();}},function(){});
}
document.getElementById("ticker").addEventListener("click",function(e){var g=e.target.closest("[data-go]");if(g){if(["globe","net","mind","matrix"].indexOf(tab)<0&&!isPhone()){}select(g.dataset.go,true);}});
setInterval(loadTicker,15*60*1000);
/* ---------- boot ---------- */''')
r('''loadMarkets();loadReliefWeb();''','''drawTicker();setTimeout(loadTicker,800);loadMarkets();loadReliefWeb();''')
r('''if(tab==="dash")drawDash();if(tab==="news")drawNews();updateGRI();}''','''if(tab==="dash")drawDash();if(tab==="news")drawNews();updateGRI();drawTicker();}''')
r('</style>','''
.ticker{display:flex;align-items:stretch;border:1px solid var(--line);border-radius:4px;background:#0d1620;overflow:hidden;height:34px;font-size:.84rem}
.tk-l{flex:none;display:flex;align-items:center;gap:7px;padding:0 12px;font-family:var(--f-display);font-weight:700;letter-spacing:.1em;font-size:.78rem;color:var(--muted);background:#121e2b;border-right:1px solid var(--line)}
.tk-l.on{color:#ff6b5e}
.tk-live{width:8px;height:8px;border-radius:50%;background:#ff5c4d;animation:liveBlink 1.2s infinite}
.tk-w{flex:1;overflow:hidden;position:relative;mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)}
.tk-t{display:inline-flex;align-items:center;white-space:nowrap;height:100%;animation:tkMove 90s linear infinite;will-change:transform}
.ticker:hover .tk-t,.ticker:focus-within .tk-t{animation-play-state:paused}
@keyframes tkMove{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.tk-t a,.tk-t button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:0 4px;color:var(--ink)}
.tk-t a:hover,.tk-t button:hover{color:var(--accent);text-decoration:underline}
.tk-t small{color:var(--muted);font-size:.74rem}
.tk-t b{font-weight:600}
.tk-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex:none}
.tk-sep{color:#3a4b5c;font-size:.6rem;padding:0 12px}
@media (max-width:700px){.ticker{height:30px;font-size:.78rem}.tk-l{padding:0 8px;font-size:.66rem}}
@media (prefers-reduced-motion:reduce){.tk-t{animation:none}.tk-w{overflow-x:auto}}
</style>''')
open('app.html','w').write(a)
print('ticker ok')

# ---------- fallbacks: RSS via relay, then atlas summaries
a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
r('''     if(res.every(function(x){return x===null;})){e2.innerHTML='<p class="note">'+esc(u("nofeed"))+'</p>'+jobs.map(function(j){return outLinks(j.q);}).join("");drawAtt();return;}''',
'''     if(res.every(function(x){return x===null;})){newsFallback(e2,jobs,tag);drawAtt();return;}''')
r('''/* ---------- ticker ---------- */''','''/* ---------- news fallbacks ---------- */
var rssCache={};
function fetchRSS(lang){var k=lang||"all";var c=rssCache[k];if(c&&Date.now()-c.at<10*60e3)return Promise.resolve(c.v);
  return tryFetch(PROXY_BASES.map(function(p){return p+"/rss"+(lang?"?lang="+lang:"");}),12000).then(function(j){if(!j||!j.items||!j.items.length)throw new Error("empty");
    var v=j.items.map(function(x){return {title:x.title,url:x.url,ts:Date.parse(x.date)||0,dom:x.source,lang:x.lang};});rssCache[k]={at:Date.now(),v:v};return v;});}
function qWords(q){return (q||"").replace(/sourcelang:\\w+/g,"").replace(/\\bOR\\b|\\bAND\\b/g," ").replace(/[()"]/g," ").split(/\\s+/).filter(function(w){return w.length>=4;}).map(function(w){return w.toLowerCase();});}
function newsFallback(el,jobs,tag){
  var words=[];jobs.forEach(function(j){words=words.concat(qWords(j.q));});
  fetchRSS(nLang).then(function(v){if(tag!==nScope+nLang+nSpan)return;
    var hit=v.filter(function(a){var t=a.title.toLowerCase();return words.some(function(w){return t.indexOf(w)>=0;});});
    var list=hit.length?hit:v;
    el.innerHTML='<p class="note fbk">'+esc(u(hit.length?"rssMatch":"rssAll"))+'</p>'+list.slice(0,40).map(function(x){return artHtml(x);}).join("");
  },function(){if(tag!==nScope+nLang+nSpan)return;
    var ids=nScope==="top"?BRIEF.top:nScope==="wl"?WL:[nScope];
    el.innerHTML='<div class="nodata"><b>'+esc(u("newsOffH"))+'</b><p class="note">'+esc(u("nofeed"))+'</p>'+jobs.map(function(j){return outLinks(j.q);}).join("")+'</div>'+
      '<p class="note fbk">'+esc(u("atlasSum"))+'</p>'+ids.filter(function(id){return byId[id];}).map(function(id){var n=byId[id];
        return '<div class="art"><span class="t">'+esc(BASELINE_DATE.slice(8,10)+"/"+BASELINE_DATE.slice(5,7))+'</span><span><a href="#" data-go="'+id+'" style="color:var(--ink)"><b style="color:'+col(n)+'">'+esc(tx(n.t))+'</b></a><small>'+esc(tx(n.s))+'</small></span></div>';}).join("");
  });
}
document.getElementById("v-news").addEventListener("click",function(e){var a2=e.target.closest('a[data-go]');if(a2){e.preventDefault();}},true);
/* ---------- ticker ---------- */''')
r('''   .then(function(v){if(v&&v.length){tkArts=v;drawTicker();}},function(){});''','''   .then(function(v){if(v&&v.length){tkArts=v;drawTicker();}},function(){fetchRSS(L==="fr"?"fr":"").then(function(v){tkArts=v;drawTicker();},function(){});});''')
r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";
UI.fr.rssMatch="Titres des médias (France 24, Le Monde, BBC, Al Jazeera) correspondant à ce sujet :";UI.en.rssMatch="Media headlines (France 24, Le Monde, BBC, Al Jazeera) matching this topic:";
UI.fr.rssAll="Aucun titre récent sur ce sujet précis ; voici les derniers titres internationaux :";UI.en.rssAll="No recent headline on this exact topic; here are the latest world headlines:";
UI.fr.newsOffH="Flux d'actualités en direct indisponible";UI.en.newsOffH="Live news feed unavailable";UI.fr.atlasSum="En attendant, le résumé de l'atlas (base du 29 oct.) :";UI.en.atlasSum="Meanwhile, the atlas summary (29 Oct baseline):";''')
r('</style>','''
.att .nodata{display:flex!important;grid-template-columns:none!important;cursor:default}
.att .nodata:hover{background:transparent!important}
.fbk{margin:6px 0 4px!important;color:var(--accent)!important}
</style>''')
open('app.html','w').write(a)
print('fallback ok')

# ---------- faster relay use, instant headlines, ReliefWeb RSS
a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
r('''function viaProxy(k,base,qs){var u=[];PROXY_BASES.forEach(function(p){u.push(p+"/"+k+(qs?"?"+qs:""));});u.push(base+(qs?"?"+qs:""));return u;}''',
'''try{var pg=localStorage.getItem("gra-proxy");if(pg)proxyOk=pg;}catch(e){}
function orderedBases(){var b=PROXY_BASES.slice();if(proxyOk){b=b.filter(function(x){return x!==proxyOk;});b.unshift(proxyOk);}return b;}
function viaProxy(k,base,qs){var u=[];orderedBases().forEach(function(p){u.push(p+"/"+k+(qs?"?"+qs:""));});u.push(base+(qs?"?"+qs:""));return u;}''')
r('''  tFetch(u,ms).then(function(j){if(j&&j.error&&!j.articles&&!j.timeline&&!j.data&&!j.features){throw new Error("proxy error");}res(j);}).catch(next);})();});}''',
'''  tFetch(u,ms).then(function(j){if(j&&j.error&&!j.articles&&!j.timeline&&!j.data&&!j.features){throw new Error("proxy error");}
    PROXY_BASES.forEach(function(p){if(u.indexOf(p+"/")===0&&proxyOk!==p){proxyOk=p;try{localStorage.setItem("gra-proxy",p);}catch(e){}}});res(j);}).catch(next);})();});}''')
r('''function fetchRSS(lang){var k=lang||"all";var c=rssCache[k];if(c&&Date.now()-c.at<10*60e3)return Promise.resolve(c.v);
  return tryFetch(PROXY_BASES.map(function(p){return p+"/rss"+(lang?"?lang="+lang:"");}),12000)''','''function fetchRSS(lang){var k=lang||"all";var c=rssCache[k];if(c&&Date.now()-c.at<10*60e3)return Promise.resolve(c.v);
  return tryFetch(orderedBases().map(function(p){return p+"/rss"+(lang?"?lang="+lang:"");}),12000)''')
# instant RSS headlines while GDELT is queued
r('''  Promise.all(jobs.map(function(j){return fetchArts(j.q,nSpan,nLang,true,nScope==="wl"?15:60)''','''  var gotG=false,words=[];jobs.forEach(function(j){words=words.concat(qWords(j.q));});
  fetchRSS(nLang).then(function(v){if(gotG||tag!==nScope+nLang+nSpan)return;var e3=document.getElementById("arts");if(!e3)return;
    var hit=v.filter(function(a){var t=a.title.toLowerCase();return words.some(function(w){return t.indexOf(w)>=0;});});
    e3.innerHTML='<p class="note fbk">'+esc(u(hit.length?"rssMatch":"rssAll"))+' <span class="pend">'+esc(u("gdPend"))+'</span></p>'+(hit.length?hit:v).slice(0,30).map(function(x){return artHtml(x);}).join("");},function(){});
  Promise.all(jobs.map(function(j){return fetchArts(j.q,nSpan,nLang,true,nScope==="wl"?15:60)''')
r('''     var all=[].concat.apply([],res.filter(Boolean)).sort(function(a,b){return b.ts-a.ts;}).slice(0,60);''','''     gotG=true;var all=[].concat.apply([],res.filter(Boolean)).sort(function(a,b){return b.ts-a.ts;}).slice(0,60);''')
# ReliefWeb: API, then RSS through relay
r('''   .catch(function(){rw=false;if(tab==="news")drawRW();});''','''   .catch(function(){fetchRSS("un").then(function(v){rw=v.slice(0,15);if(tab==="news")drawRW();},function(){rw=false;if(tab==="news")drawRW();});});''')
r('''UI.fr.atlasSum=''','''UI.fr.gdPend="(analyse GDELT en cours…)";UI.en.gdPend="(GDELT analysis loading…)";UI.fr.atlasSum=''')
r('</style>','''
.pend{color:var(--muted);font-size:.74rem}
</style>''')
open('app.html','w').write(a)
print('speed ok')

a=open('app.html').read()
old=a[a.index('function loadTicker(){'):a.index('document.getElementById("ticker").addEventListener')]
a=a.replace(old,'''function loadTicker(){
  fetchRSS(L==="fr"?"fr":"en").then(function(v){if(v&&v.length){tkArts=v;drawTicker();}},function(){
    fetchArts('("Strait of Hormuz" OR Iran OR Ukraine OR "El Nino" OR Sudan OR Taiwan OR Ebola OR "gas prices" OR "food prices" OR sabotage)',"1d","",true,40).then(function(v){if(v&&v.length){tkArts=v;drawTicker();}},function(){});});
}
''',1)
a=a.replace('''function setLang(l){L=l;''','''function setLang(l){L=l;setTimeout(function(){if(typeof loadTicker==="function")loadTicker();},0);''',1)
open('app.html','w').write(a)
print('ticker rss-first ok')

# ---------- relay-only, cleaner fallbacks
a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
import re as _re
a,n=_re.subn(r'var PROXY_BASES=\(function\(\)\{.*?\}\)\(\);','var PROXY_BASES=["https://atlas-api.mbaradhy.workers.dev"];',a,count=1,flags=_re.S)
assert n==1
r('''  var urls=key==="gdacs"?viaProxy("gdacs","https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP",""):[url];''',
'''  var rk={gdacs:"gdacs",quakes:"usgs",eonet:"eonet"}[key];var qi=url.indexOf("?");
  var urls=key==="gdacs"?viaProxy("gdacs","https://www.gdacs.org/xml/rss.xml","").slice(0,-1):rk?viaProxy(rk,qi>0?url.slice(0,qi):url,qi>0?url.slice(qi+1):""):[url];''')
r('''tFetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json")''','''tryFetch(viaProxy("kp","https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",""),9000)''')
r('''tryFetch(viaProxy("reliefweb","https://api.reliefweb.int/v2/reports","appname=global-risk-atlas&profile=list&preset=latest&limit=12"),12000)
   .then(function(j){''','''Promise.reject(new Error("use rss"))
   .then(function(j){''')
open('app.html','w').write(a)
print('relay-only ok')

# ---------- GDELT back-off
a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
r('''tryFetch(viaProxy("gdelt",GD,job.params+"&format=json"),15000)''','''(Date.now()<gdPause?Promise.reject(new Error("paused")):tryFetch(viaProxy("gdelt",GD,job.params+"&format=json").slice(0,-1),25000).then(function(j){gdFails=0;return j;},function(e){if(++gdFails>=2){gdPause=Date.now()+30*60e3;gdFails=0;}throw e;}))''')
r('''var GD="https://api.gdeltproject.org/api/v2/doc/doc",''','''var gdPause=0,gdFails=0;var GD="https://api.gdeltproject.org/api/v2/doc/doc",''')
r('''    if(i>=ids.length||gdOk===false){attRunning=false;''','''    if(i>=ids.length||gdOk===false||Date.now()<gdPause){attRunning=false;''')
r('''UI.fr.attOffP=''','''UI.fr.gdBusy="GDELT est saturé et refuse temporairement les requêtes ; nouvel essai automatique dans 30 min. Les titres ci-dessus viennent des médias.";UI.en.gdBusy="GDELT is overloaded and temporarily refusing requests; automatic retry in 30 min. The headlines above come from news sites.";
UI.fr.attOffP=''')
r('''  if(gdOk===false&&!Object.keys(volCache).length){''','''  if(Date.now()<gdPause&&!ids.every(function(id){return volCache[id];})){var miss=ids.filter(function(id){return !volCache[id];}).length;
    el.innerHTML='<div class="nodata"><b>'+esc(u("attOffH"))+' ('+miss+'/'+ids.length+')</b><p class="note">'+esc(u("gdBusy"))+'</p></div>'+ids.map(function(id){var n=byId[id];return '<div data-go="'+id+'" class="go"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</span>'+(volCache[id]?spark(volCache[id].s,80,20):'<span></span>')+(volCache[id]?spkBadge(id):'<span class="chev">›</span>')+'</div>';}).join("");return;}
  if(gdOk===false&&!Object.keys(volCache).length){''')
open('app.html','w').write(a)
print('backoff ok')

# ---------- first-party visit counter
a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
r('''/* ---------- boot ---------- */''','''/* ---------- visit counter (own relay, no cookies) ---------- */
var hitSent={},firstHit=true;
function sendHit(t){if(!/^https?:$/.test(location.protocol)||/claude\\.ai|claudeusercontent/.test(location.hostname))return;
  if(hitSent[t])return;hitSent[t]=1;
  var ref="";try{if(document.referrer){var h=new URL(document.referrer).hostname;if(h!==location.hostname)ref=h.replace(/^www\\./,"");}}catch(e){}
  var newVisit=false;try{if(!sessionStorage.getItem("gra-v")){sessionStorage.setItem("gra-v","1");newVisit=true;}}catch(e){newVisit=firstHit;}
  firstHit=false;
  try{fetch(PROXY_BASES[0]+"/hit?t="+encodeURIComponent(t)+"&r="+encodeURIComponent(ref)+"&l="+L+(newVisit?"&v=1":""),{mode:"cors",keepalive:true}).catch(function(){});}catch(e){}}
/* ---------- boot ---------- */''')
r('''  try{history.replaceState(null,"","#"+t);}catch(e){}''','''  try{history.replaceState(null,"","#"+t);}catch(e){}
  setTimeout(function(){sendHit(t);},400);''')
open('app.html','w').write(a)
print('counter ok')
