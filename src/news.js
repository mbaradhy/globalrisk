
/* ===== News in the reader's language, breaking news, news by country ===== */
function fetchRSSL(){if(L==="fr"||L==="en")return fetchRSS(L);return fetchRSS(L).then(function(v){return v&&v.length?v:fetchRSS("en");},function(){return fetchRSS("en");});}
var BRK_STOP={};("the a an and or of to in on for at by with from as is are was were be been this that these those after over under into about amid says said say new more than will would could its it his her their they he she we you not no but up out off how why what who when where which while into onto les des une un le la et ou de du au aux en pour par sur avec dans est sont après selon plus que qui quoi ce cette ces ses son leurs leur pas ne il elle ils elles nous vous"
  ).split(" ").forEach(function(w){BRK_STOP[w]=1;});
function brkTok(t){var o={};(t.toLowerCase().replace(/[’'"“”«»:;,.!?()\[\]|]/g," ").split(/\s+/)).forEach(function(w){w=w.replace(/^-+|-+$/g,"");if(w.length>=4&&!BRK_STOP[w]&&!/^\d+$/.test(w))o[w]=1;});return o;}
var brkItems=[],brkAt=0,brkHidden={};try{brkHidden=JSON.parse(sessionStorage.getItem("gra-brk")||"{}");}catch(e){}
function brkCompute(arts){
  var now=Date.now(),out=[],win=3*3600e3;
  var rec=arts.filter(function(a){return a.ts&&now-a.ts<win&&now-a.ts>-600e3;});
  var used={},toks=rec.map(function(a){return brkTok(a.title);});
  rec.forEach(function(a,i){if(used[i])return;var cl=[i],srcs={};srcs[a.dom]=1;
    rec.forEach(function(b,j){if(j<=i||used[j]||srcs[b.dom])return;var n=0;for(var w in toks[i])if(toks[j][w])n++;if(n>=2){cl.push(j);srcs[b.dom]=1;}});
    var flag=/\b(breaking|urgent|alerte|dernière minute|eilmeldung|última hora|ultim'ora|срочно|терміново|عاجل)\b/i.test(a.title);
    if(Object.keys(srcs).length>=3||flag){cl.forEach(function(k){used[k]=1;});var its=cl.map(function(k){return rec[k];}).sort(function(x,y){return y.ts-x.ts;});
      out.push({id:"n:"+Object.keys(toks[i]).sort().slice(0,4).join("-"),kind:"news",title:its[0].title,url:its[0].url,n:Object.keys(srcs).length,items:its,ts:its[0].ts,flag:flag});}});
  live.quakes.forEach(function(e){if(e.mag>=6.5&&e.ts&&now-e.ts<12*3600e3)out.push({id:"q:"+e.title,kind:"quake",title:e.title,url:e.url,ts:e.ts});});
  live.gdacs.forEach(function(g){if(g.lvl==="Red")out.push({id:"g:"+g.title,kind:"alert",title:g.title,url:g.url,ts:Date.now()});});
  if(live.kp!=null&&live.kp>=7)out.push({id:"k:"+new Date().toISOString().slice(0,10),kind:"space",title:T2("Tempête géomagnétique sévère (Kp ","Severe geomagnetic storm (Kp ")+nf(live.kp,1)+")",url:"https://www.swpc.noaa.gov/",ts:now});
  out.sort(function(a,b){var p={alert:0,quake:1,space:2,news:3};return (p[a.kind]-p[b.kind])||((b.n||0)-(a.n||0))||(b.ts-a.ts);});
  return out.slice(0,8);
}
function brkLoad(){var ps=[fetchRSS("").catch(function(){return [];})];if(L!=="fr"&&L!=="en")ps.push(fetchRSS(L).catch(function(){return [];}));
  return Promise.all(ps).then(function(r){var seen={},all=[];[].concat.apply([],r).forEach(function(a){if(!seen[a.url]){seen[a.url]=1;all.push(a);}});brkItems=brkCompute(all);brkAt=Date.now();brkBanner();if(tab==="news")brkCard();return brkItems;});}
var BRK_KIND={news:{fr:"Événement en cours",en:"Developing story"},quake:{fr:"Séisme majeur",en:"Major earthquake"},alert:{fr:"Alerte catastrophe rouge",en:"Red disaster alert"},space:{fr:"Météo spatiale",en:"Space weather"}};
function brkBanner(){var el=document.getElementById("brk");if(!el)return;var v=brkItems.filter(function(b){return !brkHidden[b.id];});
  if(!v.length){el.hidden=true;return;}var b=v[0];el.hidden=false;
  el.innerHTML='<span class="brk-l">'+esc(T2("FLASH","BREAKING"))+'</span><span class="brk-k">'+esc(tx(BRK_KIND[b.kind]))+(b.n?' · '+b.n+' '+esc(T2("sources","sources")):'')+'</span><a class="brk-t" href="'+esc(b.url||"#")+'" target="_blank" rel="noopener">'+esc(b.title)+'</a>'+(v.length>1?'<button type="button" class="brk-m" data-brk="more">+'+(v.length-1)+'</button>':'')+'<button type="button" class="brk-x" data-brk="x" aria-label="'+esc(u("close"))+'">✕</button>';}
document.addEventListener("click",function(e){var b=e.target.closest("[data-brk]");if(!b)return;
  if(b.dataset.brk==="x"){var v=brkItems.filter(function(x){return !brkHidden[x.id];});if(v[0])brkHidden[v[0].id]=1;try{sessionStorage.setItem("gra-brk",JSON.stringify(brkHidden));}catch(x){}brkBanner();}
  else{showTab("news");setTimeout(function(){var c=document.getElementById("brk-card");if(c)c.scrollIntoView({behavior:"smooth",block:"start"});},200);}});
function brkCard(){var el=document.getElementById("brk-card");if(!el)return;
  if(!brkItems.length){el.innerHTML='<h2>'+esc(T2("Flash info","Breaking news"))+'</h2><p class="note">'+esc(brkAt?T2("Rien de majeur en ce moment : une alerte apparaît quand 3 médias ou plus couvrent le même événement en 3 h, ou en cas d'alerte rouge, de séisme ≥ M6,5 ou de tempête géomagnétique.","Nothing major right now: an alert appears when 3 or more outlets cover the same event within 3 h, or on a red disaster alert, an M6.5+ earthquake or a geomagnetic storm."):u("loading"))+'</p>';return;}
  el.innerHTML='<h2><span class="brk-dot"></span>'+esc(T2("Flash info","Breaking news"))+'</h2>'+brkItems.map(function(b){var ago=Math.max(0,Math.round((Date.now()-b.ts)/60000));
    return '<div class="brk-i"><div class="brk-h"><span class="badge '+(b.kind==="news"?"":"crit")+'">'+esc(tx(BRK_KIND[b.kind]).toUpperCase())+'</span><span class="note">'+(ago<60?ago+" min":Math.round(ago/60)+" h")+(b.n?' · '+b.n+' '+esc(T2("sources","sources")):'')+'</span></div><a href="'+esc(b.url||"#")+'" target="_blank" rel="noopener"><b>'+esc(b.title)+'</b></a>'+
     (b.items&&b.items.length>1?'<ul>'+b.items.slice(1,5).map(function(a){return '<li><a href="'+esc(a.url)+'" target="_blank" rel="noopener">'+esc(a.title)+'</a> <span class="note">'+esc(a.dom)+'</span></li>';}).join("")+'</ul>':'')+'</div>';}).join("")+
   '<p class="note">'+esc(T2("Détection automatique : même événement couvert par 3 médias ou plus en 3 h, alertes GDACS rouges, séismes ≥ M6,5, Kp ≥ 7. Vérifiez auprès des sources.","Detected automatically: the same event covered by 3+ outlets within 3 h, GDACS red alerts, M6.5+ earthquakes, Kp ≥ 7. Check the sources."))+'</p>';}
setInterval(function(){if(!document.hidden)brkLoad();},5*60e3);setTimeout(brkLoad,2500);

/* news by country */
var ncC="";try{ncC=localStorage.getItem("gra-ncc")||"";}catch(e){}
function ctryNames(code){var c=ISO[code];if(!c)return [];var n=[c[3],c[4],cName(code)].map(function(x){return (x||"").toLowerCase();}).filter(Boolean);
  var extra={"840":["u.s.","united states","états-unis","washington"],"826":["britain","british","royaume-uni","london","londres"],"643":["russian","russe","moscow","moscou","kremlin"],"250":["french","français","française","paris","macron"],"804":["ukrainian","ukrainien","kyiv","kiev"],"364":["iranian","iranien","tehran","téhéran"],"156":["chinese","chinois","beijing","pékin"],"276":["german","allemand","berlin"],"376":["israeli","israélien"],"275":["palestinian","gaza","west bank","cisjordanie"],"724":["spanish","espagnol","madrid"],"380":["italian","italien","rome"],"392":["japanese","japonais","tokyo"],"356":["indian","indien","delhi"],"586":["pakistani","pakistanais"],"729":["sudanese","soudanais","khartoum","darfur","darfour"],"158":["taiwanese","taïwanais","taipei"],"528":["dutch","néerlandais","amsterdam","rotterdam","the hague","la haye"],"616":["polish","polonais","warsaw","varsovie"],"752":["swedish","suédois","stockholm"],"578":["norwegian","norvégien","oslo"],"208":["danish","danois","copenhagen","copenhague"],"246":["finnish","finlandais","helsinki"],"620":["portuguese","portugais","lisbon","lisbonne"],"682":["saudi","saoudien","riyadh","riyad"],"887":["yemeni","yéménite","houthi"],"422":["lebanese","libanais","beirut","beyrouth","hezbollah"],"760":["syrian","syrien","damascus","damas"],"408":["north korea","corée du nord","pyongyang"],"410":["south korea","corée du sud","seoul","séoul"],"180":["congolese","kinshasa","goma"]}[code]||[];
  return n.concat(extra).filter(function(x,i,a){return x.length>2&&a.indexOf(x)===i;});}
function ncDraw(){var el=document.getElementById("nc-card");if(!el)return;var codes=Object.keys(ISO).sort(function(a,b){return cName(a).localeCompare(cName(b),L);});
  el.innerHTML='<h2>'+esc(T2("Actualités par pays","News by country"))+'</h2><div class="ctl"><label>'+esc(T2("Pays","Country"))+' <select id="nc-s"><option value="">—</option>'+codes.map(function(k){return '<option value="'+k+'"'+(k===ncC?" selected":"")+'>'+esc(cName(k))+'</option>';}).join("")+'</select></label>'+(ncC?'<button type="button" class="btn" id="nc-go">'+esc(T2("Fiche pays","Country page"))+' →</button>':'')+'</div><div class="arts" id="nc-l"></div>';
  document.getElementById("nc-s").onchange=function(e){ncC=e.target.value;try{localStorage.setItem("gra-ncc",ncC);}catch(x){}ncDraw();};
  var g=document.getElementById("nc-go");if(g)g.onclick=function(){ctry=ncC;try{localStorage.setItem("gra-ctry",ctry);}catch(x){}anaSub="country";showTab("ana");};
  var box=document.getElementById("nc-l");if(!ncC){box.innerHTML='<p class="note">'+esc(T2("Choisissez un pays pour voir les titres qui le citent, dans toutes les sources de l'atlas.","Pick a country to see the headlines that mention it, across all the atlas sources."))+'</p>';return;}
  box.innerHTML='<p class="note">'+esc(u("loading"))+'</p>';var names=ctryNames(ncC);
  Promise.all([fetchRSS("").catch(function(){return [];}),(L!=="fr"&&L!=="en")?fetchRSS(L).catch(function(){return [];}):Promise.resolve([])]).then(function(r){var seen={},hit=[];[].concat.apply([],r).forEach(function(a){if(seen[a.url])return;seen[a.url]=1;var t=" "+a.title.toLowerCase()+" ";if(names.some(function(n){return t.indexOf(n)>=0;}))hit.push(a);});
    hit.sort(function(a,b){return b.ts-a.ts;});var b2=document.getElementById("nc-l");if(!b2)return;
    b2.innerHTML=hit.length?hit.slice(0,15).map(function(a){return '<a class="hl" href="'+esc(a.url)+'" target="_blank" rel="noopener"><span class="mono">'+esc(a.dom||"")+(a.ts?' · '+esc(new Date(a.ts).toLocaleString(LOC(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})):'')+'</span>'+esc(a.title)+'</a>';}).join(""):'<p class="note">'+esc(T2("Aucun titre récent ne cite ce pays.","No recent headline mentions this country."))+'</p>';});}
var _drawNews0=drawNews;drawNews=function(){_drawNews0();var g=document.querySelector("#v-news .news");if(!g)return;
  g.insertAdjacentHTML("afterbegin",'<div class="card brkc" id="brk-card" style="grid-column:1/-1"></div>');g.insertAdjacentHTML("beforeend",'<div class="card" id="nc-card" style="grid-column:1/-1"></div>');brkCard();ncDraw();if(!brkAt)brkLoad();};

/* ===== Markets: indices, commodities, exchange rates ===== */
var MKT_N={"^spx":"S&P 500","^ndq":"Nasdaq 100","^dji":"Dow Jones","^cac":"CAC 40","^dax":"DAX","^ukx":"FTSE 100","^nkx":"Nikkei 225","^hsi":"Hang Seng","cb.f":{fr:"Pétrole Brent",en:"Brent crude"},"gc.f":{fr:"Or",en:"Gold"},"ng.f":{fr:"Gaz naturel (US)",en:"Natural gas (US)"},"zw.f":{fr:"Blé (Chicago)",en:"Wheat (Chicago)"}};
var mktQ=null,mktFx=null,mktAt=0,mktErr="";
function mktLoad(){if(mktAt&&Date.now()-mktAt<10*60e3)return Promise.resolve();mktAt=Date.now();
  return Promise.all([relay("quotes",15000).then(function(j){mktQ=j.quotes||[];},function(e){mktQ=false;mktErr=String(e&&e.message||e);}),
    relay("fx",15000).then(function(j){mktFx=j&&j.rates?j:false;},function(){mktFx=false;})]).then(function(){drawMarkets();});}
function chgSpan(v){if(v==null||isNaN(v))return '<span class="note">—</span>';return '<span class="mono" style="color:'+(v>0.05?"var(--ok)":v<-0.05?"var(--crit)":"var(--muted)")+'">'+(v>0?"+":v<0?"−":"±")+nf(Math.abs(v),2)+' %</span>';}
function drawMarkets(){var el=document.getElementById("mkt-card");if(!el)return;
  if(mktQ==null&&mktFx==null){el.innerHTML='<h2>'+esc(T2("Marchés","Markets"))+'</h2><p class="note">'+esc(u("loading"))+'</p>';mktLoad();return;}
  var rows=(mktQ||[]).map(function(q){var p=q.prev||q.open;var ch=p?(q.close-p)/p*100:null;return '<div class="mk"><span>'+esc(tx(MKT_N[q.s]||q.s.toUpperCase()))+'</span><b class="mono">'+nf(q.close,q.close<1000?2:0)+'</b>'+chgSpan(ch)+'</div>';}).join("");
  var fx="";if(mktFx&&mktFx.rates){var ds=Object.keys(mktFx.rates).sort(),last=mktFx.rates[ds[ds.length-1]],prev=mktFx.rates[ds[ds.length-2]]||last,m30=mktFx.rates[ds[0]];
    fx=Object.keys(last).map(function(c){var d1=(last[c]-prev[c])/prev[c]*100,d30=(last[c]-m30[c])/m30[c]*100;return '<div class="mk"><span>EUR → '+c+'</span><b class="mono">'+nf(last[c],last[c]<10?4:2)+'</b>'+chgSpan(d1)+'<small class="note">30 '+esc(T2("j","d"))+' '+(d30>0?"+":"−")+nf(Math.abs(d30),1)+' %</small></div>';}).join("");}
  el.innerHTML='<div class="ah"><h2>'+esc(T2("Marchés","Markets"))+'</h2><span class="note">'+esc(T2("Variation du jour","Day change"))+'</span></div>'+
   (mktQ?'<div class="mkg">'+rows+'</div>':'<p class="note">'+esc(T2("Cours indisponibles pour le moment (relais à mettre à jour ?).","Quotes unavailable right now (relay needs updating?)."))+'</p>')+
   (mktFx?'<h3 class="mkh">'+esc(T2("Taux de change (BCE)","Exchange rates (ECB)"))+'</h3><div class="mkg">'+fx+'</div>':'')+
   '<p class="note">'+esc(T2("Indices et matières premières : Stooq, données différées. Changes : Banque centrale européenne, 1 fois par jour ouvré. Pas un conseil financier.","Indices and commodities: Stooq, delayed data. Exchange rates: European Central Bank, once per working day. Not financial advice."))+'</p>';}

/* ===== My area: local weather and official warnings ===== */
var AREA=null;try{AREA=JSON.parse(localStorage.getItem("gra-area")||"null");}catch(e){}
var areaW=null,areaWarn=null,areaAt=0;
var WMO={0:["☀",{fr:"Ciel clair",en:"Clear"}],1:["🌤",{fr:"Peu nuageux",en:"Mostly clear"}],2:["⛅",{fr:"Partiellement nuageux",en:"Partly cloudy"}],3:["☁",{fr:"Couvert",en:"Overcast"}],45:["🌫",{fr:"Brouillard",en:"Fog"}],48:["🌫",{fr:"Brouillard givrant",en:"Freezing fog"}],51:["🌦",{fr:"Bruine",en:"Drizzle"}],53:["🌦",{fr:"Bruine",en:"Drizzle"}],55:["🌦",{fr:"Bruine forte",en:"Heavy drizzle"}],61:["🌧",{fr:"Pluie faible",en:"Light rain"}],63:["🌧",{fr:"Pluie",en:"Rain"}],65:["🌧",{fr:"Forte pluie",en:"Heavy rain"}],66:["🌧",{fr:"Pluie verglaçante",en:"Freezing rain"}],67:["🌧",{fr:"Pluie verglaçante",en:"Freezing rain"}],71:["🌨",{fr:"Neige faible",en:"Light snow"}],73:["🌨",{fr:"Neige",en:"Snow"}],75:["🌨",{fr:"Forte neige",en:"Heavy snow"}],77:["🌨",{fr:"Grésil",en:"Snow grains"}],80:["🌦",{fr:"Averses",en:"Showers"}],81:["🌧",{fr:"Averses",en:"Showers"}],82:["⛈",{fr:"Averses violentes",en:"Violent showers"}],85:["🌨",{fr:"Averses de neige",en:"Snow showers"}],86:["🌨",{fr:"Averses de neige",en:"Snow showers"}],95:["⛈",{fr:"Orage",en:"Thunderstorm"}],96:["⛈",{fr:"Orage et grêle",en:"Thunderstorm, hail"}],99:["⛈",{fr:"Orage et grêle",en:"Thunderstorm, hail"}]};
function areaSave(a){AREA=a;try{localStorage.setItem("gra-area",JSON.stringify(a));}catch(e){}areaAt=0;areaW=null;areaWarn=null;drawArea();}
function areaLoad(){if(!AREA||areaAt&&Date.now()-areaAt<15*60e3)return;areaAt=Date.now();
  var qs="latitude="+AREA.lat+"&longitude="+AREA.lon+"&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max&timezone=auto&forecast_days=4";
  tryFetch(viaProxy("meteo","https://api.open-meteo.com/v1/forecast",qs),12000).then(function(j){areaW=j;drawArea();},function(){areaW=false;drawArea();});
  relay("warnings?cc="+encodeURIComponent(AREA.cc||"")+"&lat="+AREA.lat+"&lon="+AREA.lon,15000).then(function(j){areaWarn=j;drawArea();},function(){areaWarn=false;drawArea();});}
function areaSearch(q){var box=document.getElementById("ar-res");if(!box)return;if(q.length<2){box.innerHTML="";return;}
  tryFetch(viaProxy("geo","https://geocoding-api.open-meteo.com/v1/search","name="+encodeURIComponent(q)+"&count=6&language="+(L==="nb"?"no":L)),10000).then(function(j){var b=document.getElementById("ar-res");if(!b)return;
    b.innerHTML=(j.results||[]).map(function(r,i){return '<button type="button" data-ar="'+i+'">'+esc(r.name)+'<small> '+esc([r.admin1,r.country].filter(Boolean).join(", "))+'</small></button>';}).join("")||'<p class="note">—</p>';
    b.querySelectorAll("[data-ar]").forEach(function(x){x.onclick=function(){var r=j.results[+x.dataset.ar];areaSave({name:r.name,admin:r.admin1||"",admin2:r.admin2||"",cc:r.country_code,lat:+r.latitude.toFixed(3),lon:+r.longitude.toFixed(3)});};});},function(){});}
function areaLocate(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(function(p){var lat=+p.coords.latitude.toFixed(3),lon=+p.coords.longitude.toFixed(3);
  /* nearest named place via reverse lookup of the country from the atlas table */
  var best=null,bd=1e9;Object.keys(ISO).forEach(function(k){var c=ISO[k];var d=Math.pow(c[1]-lat,2)+Math.pow(c[2]-lon,2);if(d<bd){bd=d;best=c;}});
  areaSave({name:T2("Ma position","My location"),admin:"",cc:best?best[0]:"",lat:lat,lon:lon});},function(){var b=document.getElementById("ar-res");if(b)b.innerHTML='<p class="note">'+esc(T2("Position refusée : cherchez une ville.","Location refused: search for a town instead."))+'</p>';},{timeout:10000,maximumAge:3600e3});}
function drawArea(){var el=document.getElementById("area-card");if(!el)return;
  var head='<div class="ah"><h2>'+esc(T2("Ma zone","My area"))+'</h2>'+(AREA?'<button type="button" class="btn" id="ar-ch">'+esc(AREA.name)+' ✎</button>':'')+'</div>';
  if(!AREA||el.dataset.edit==="1"){el.innerHTML=head+'<p class="note">'+esc(T2("Météo et alertes officielles pour l'endroit de votre choix. Rien n'est envoyé ailleurs que vers les services météo.","Weather and official warnings for a place you choose. Nothing is sent anywhere except to the weather services."))+'</p>'+
    '<div class="ar-in"><input type="search" id="ar-q" placeholder="'+esc(T2("Ville…","Town or city…"))+'" autocomplete="off"><button type="button" class="btn" id="ar-loc">⌖ '+esc(T2("Ma position","Use my location"))+'</button></div><div class="ar-res" id="ar-res"></div>';
    var q=document.getElementById("ar-q"),tm;q.oninput=function(){clearTimeout(tm);tm=setTimeout(function(){areaSearch(q.value.trim());},300);};document.getElementById("ar-loc").onclick=areaLocate;
    var c0=document.getElementById("ar-ch");if(c0)c0.onclick=function(){el.dataset.edit="";drawArea();};el.dataset.edit="";return;}
  areaLoad();
  var w=areaW,cur="",days="";
  if(w&&w.current){var c=w.current,m=WMO[c.weather_code]||["·",{fr:"",en:""}];
    cur='<div class="wx"><span class="wxi">'+m[0]+'</span><b class="mono">'+Math.round(c.temperature_2m)+'°</b><span><span>'+esc(tx(m[1]))+'</span><small class="note">'+esc(T2("Ressenti ","Feels like "))+Math.round(c.apparent_temperature)+'° · '+esc(T2("vent ","wind "))+Math.round(c.wind_speed_10m)+' km/h'+(c.wind_gusts_10m?' ('+Math.round(c.wind_gusts_10m)+')':'')+'</small></span></div>';
    var d=w.daily;days='<div class="wxd">'+d.time.map(function(t,i){var mm=WMO[d.weather_code[i]]||["·"];return '<div><span class="note">'+esc(new Date(t+"T12:00").toLocaleDateString(LOC(),{weekday:"short"}))+'</span><span class="wxi s">'+mm[0]+'</span><span class="mono">'+Math.round(d.temperature_2m_max[i])+'° / '+Math.round(d.temperature_2m_min[i])+'°</span>'+(d.precipitation_sum[i]>=1?'<small class="note">'+nf(d.precipitation_sum[i],0)+' mm</small>':'')+'</div>';}).join("")+'</div>';}
  else cur='<p class="note">'+esc(w===false?T2("Météo indisponible.","Weather unavailable."):u("loading"))+'</p>';
  var wr="";if(areaWarn&&areaWarn.items){var key=[AREA.admin,AREA.admin2,AREA.name].filter(Boolean).map(function(x){return x.toLowerCase();});
    var its=areaWarn.items.map(function(x){x.mine=key.some(function(k){return (x.area||"").toLowerCase().indexOf(k)>=0;});return x;}).sort(function(a,b){return (b.mine-a.mine)||(sevN(b)-sevN(a));});
    var mine=its.filter(function(x){return x.mine;});
    wr='<h3 class="mkh">'+esc(T2("Alertes officielles","Official warnings"))+' <span class="note">'+esc(areaWarn.src||"")+'</span></h3>'+(its.length?(mine.length?'':'<p class="note">'+esc(T2("Aucune alerte pour votre zone ; alertes en cours ailleurs dans le pays :","No warning for your area; warnings elsewhere in the country:"))+'</p>')+
      its.slice(0,6).map(function(x){var s=sevN(x);return '<a class="wr" href="'+esc(x.url||"#")+'" target="_blank" rel="noopener"><i style="background:'+(["#5fd39a","#ffd25a","#ff9a3d","#ff5c4d"][s]||"#8c9aa8")+'"></i><span><b>'+esc(x.event||x.title)+'</b><small class="note">'+esc((x.area||"").slice(0,90))+(x.expires?' · '+esc(T2("jusqu'au ","until "))+esc(new Date(x.expires).toLocaleString(LOC(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})):'')+'</small></span></a>';}).join(""):
      '<p class="note">'+esc(areaWarn.note?T2("Pas de flux d'alertes officiel connecté pour ce pays.","No official warning feed connected for this country."):T2("Aucune alerte en cours.","No warning in force."))+'</p>');}
  else if(areaWarn===false)wr='<p class="note">'+esc(T2("Alertes indisponibles (relais à mettre à jour ?).","Warnings unavailable (relay needs updating?)."))+'</p>';
  el.innerHTML=head+cur+days+wr+'<p class="note">'+esc(T2("Prévisions : Open-Meteo. En cas d'alerte, suivez les consignes des autorités locales.","Forecast: Open-Meteo. If a warning is in force, follow local authorities' instructions."))+'</p>';
  document.getElementById("ar-ch").onclick=function(){el.dataset.edit="1";drawArea();};}
function sevN(x){var s=(x.severity||"").toLowerCase(),l=(x.level||"").toLowerCase();if(/extreme|red|4/.test(s+l))return 3;if(/severe|orange|3/.test(s+l))return 2;if(/moderate|yellow|2/.test(s+l))return 1;return 0;}
var _drawDash1=drawDash;drawDash=function(){_drawDash1();var g=document.getElementById("gri-row")||document.querySelector(".gri-row");if(g&&!document.getElementById("mkt-card")){g.insertAdjacentHTML("afterend",'<div class="mrow"><div class="card" id="mkt-card"></div><div class="card" id="area-card"></div></div>');}drawMarkets();drawArea();};
