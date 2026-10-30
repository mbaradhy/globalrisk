/* ---------- Analysis tab: scenarios, time travel, countries, media attention, confidence, live layers ---------- */
var ISO=/*ISO*/null;
var ISO2N={};Object.keys(ISO).forEach(function(k){ISO2N[ISO[k][0]]=k;});
function T2(fr,en){return L==="fr"?fr:en;}
function cName(code){var c=ISO[code];return c?(L==="fr"?c[4]:c[3]):code;}
Object.assign(UI.fr,{tAna:"Analyse",layers:"Couches"});Object.assign(UI.en,{tAna:"Analysis",layers:"Layers"});
var anaSub="scen";try{anaSub=localStorage.getItem("gra-ana")||"scen";}catch(e){}
var ANA_SUBS=[["scen",{fr:"Scénarios",en:"Scenarios"}],["time",{fr:"Machine à remonter le temps",en:"Time travel"}],["country",{fr:"Pays",en:"Countries"}],["att",{fr:"Attention médiatique",en:"Media attention"}],["conf",{fr:"Fiabilité & sources",en:"Confidence"}],["live",{fr:"Couches en direct",en:"Live layers"}]];
function anaH(t,sub){return '<div class="ah"><h2>'+esc(t)+'</h2>'+(sub?'<span class="note">'+esc(sub)+'</span>':'')+'</div>';}
function drawAna(){
  var el=document.getElementById("v-ana");if(!el)return;
  var nav='<nav class="asub" aria-label="'+esc(u("tAna"))+'">'+ANA_SUBS.map(function(s){return '<button type="button" data-as="'+s[0]+'" aria-pressed="'+(anaSub===s[0])+'">'+esc(tx(s[1]))+'</button>';}).join("")+'</nav>';
  var body={scen:anaScen,time:anaTime,country:anaCountry,att:anaAtt,conf:anaConf,live:anaLive}[anaSub]||anaScen;
  var stg=document.querySelector(".stage");if(stg)stg.classList.toggle("wide",anaSub==="live");
  el.innerHTML=nav+'<div id="ana-b"></div>';body(document.getElementById("ana-b"));
}
document.addEventListener("click",function(e){
  var b=e.target.closest("#v-ana [data-as]");if(b){anaSub=b.dataset.as;try{localStorage.setItem("gra-ana",anaSub);}catch(x){}drawAna();return;}
  var g=e.target.closest("#v-ana [data-go]");if(g&&byId[g.dataset.go]){select(g.dataset.go,false);return;}
  var k=e.target.closest("#v-ana [data-kit]");if(k){showTab("kit");}
});
function lvl(e){var a=Math.abs(e);if(a<0.06)return {t:T2("Pas d'effet","No change"),c:"var(--muted)",a:""};
  if(e<0)return {t:a>0.3?T2("Nette détente","Clear easing"):T2("Légère détente","Slight easing"),c:"var(--ok)",a:"↓"};
  return a>0.5?{t:T2("Forte pression","Strong pressure"),c:"var(--crit)",a:"▲"}:a>0.2?{t:T2("Pression modérée","Moderate pressure"),c:"#ff9a3d",a:"▲"}:{t:T2("Légère pression","Slight pressure"),c:"var(--warn)",a:"△"};}

/* ===== 1. Scenarios ===== */
var SHOCKS=[
 {id:"hz",t:{fr:"Fermeture du détroit d'Ormuz",en:"Strait of Hormuz closure"},src:{hormuz:1},kind:"range",max:12,unit:{fr:"mois",en:"months"},f:function(v){return v?Math.min(1,0.45+0.05*v):0;}},
 {id:"win",t:{fr:"Hiver en Europe",en:"European winter"},src:{"eu-gas":1,grid:0.6},kind:"lv",lv:[[{fr:"Normal",en:"Normal"},0],[{fr:"Froid",en:"Cold"},0.45],[{fr:"Très froid",en:"Very cold"},0.8]]},
 {id:"nino",t:{fr:"El Niño",en:"El Niño"},src:{"el-nino":1},kind:"lv",lv:[[{fr:"Comme prévu",en:"As forecast"},0],[{fr:"Plus fort",en:"Stronger"},0.5],[{fr:"Historique",en:"Historic"},0.9]]},
 {id:"hyb",t:{fr:"Attaques hybrides en Europe",en:"Hybrid attacks in Europe"},src:{hybrid:1,cables:0.8,ransomware:0.6},kind:"lv",lv:[[{fr:"Niveau actuel",en:"Current level"},0],[{fr:"Escalade",en:"Escalation"},0.5],[{fr:"Attaque majeure",en:"Major attack"},0.9]]},
 {id:"bab",t:{fr:"Reprise des attaques en mer Rouge",en:"Red Sea attacks resume"},src:{bab:1,houthis:0.6},kind:"on",v:0.7},
 {id:"tw",t:{fr:"Blocus de Taïwan",en:"Taiwan blockade"},src:{taiwan:1},kind:"on",v:1},
 {id:"ukr",t:{fr:"Cessez-le-feu en Ukraine",en:"Ukraine ceasefire"},src:{"ukr-war":1},kind:"on",v:0.6,relief:true}
];
var PRESETS={base:{},worse:{hz:6,win:2,nino:2,hyb:1,bab:1},better:{ukr:1,hz:0}};
var scen={hz:0,win:0,nino:0,hyb:0,bab:0,tw:0,ukr:0},scenPreset="base";
try{var sv_=JSON.parse(localStorage.getItem("gra-scen")||"null");if(sv_){scen=Object.assign(scen,sv_.v);scenPreset=sv_.p||"custom";}}catch(e){}
function shockVal(s){var v=scen[s.id]||0;if(s.kind==="range")return s.f(v);if(s.kind==="lv")return s.lv[v][1];return v?s.v:0;}
function shockLabel(s){var v=scen[s.id]||0;if(s.kind==="range")return v?v+" "+tx(s.unit):T2("Non","No");if(s.kind==="lv")return tx(s.lv[v][0]);return v?T2("Oui","Yes"):T2("Non","No");}
function runScen(){
  var p={},rel={},t={},via={};
  SHOCKS.forEach(function(s){var a=shockVal(s);if(!a)return;
    Object.keys(s.src).forEach(function(id){if(!byId[id])return;var w=a*s.src[id];var best=computeCascade(id);
      Object.keys(best).forEach(function(k){var imp=w*best[k].imp;if(imp<0.04)return;
        if(s.relief){rel[k]=Math.max(rel[k]||0,imp);}else{var old=p[k]||0;p[k]=1-(1-old)*(1-imp);}
        if(t[k]==null||best[k].t<t[k]){t[k]=best[k].t;via[k]=best[k].prev||null;}});});});
  var eff={};Object.keys(t).forEach(function(k){var e=(p[k]||0)-0.6*(rel[k]||0);if(Math.abs(e)>=0.04)eff[k]=Math.max(-0.6,Math.min(1,e));});
  return {eff:eff,t:t,via:via};
}
function scenGRI(eff){
  var g0=griLast||computeGRI();var act=NODES.filter(function(n){return n.st!=="ended";});
  var base=100*act.reduce(function(s,n){var e=eff[n.id]||0;var sv=Math.max(1,Math.min(5,n.sv+2.5*e)),lk=Math.max(1,Math.min(5,n.lk+2*e));return s+sv*lk;},0)/act.length/25;
  var tot=Math.max(0,Math.min(100,base+g0.c.slice(1).reduce(function(s,x){return s+x.v;},0)));var band=tot<40?0:tot<60?1:tot<75?2:3;
  return {tot:tot,band:band,c:g0.c,col:["#5fd39a","#ffd25a","#ff9a3d","#ff5c4d"][band]};
}
function scenRes(){
  var r=runScen(),eff=r.eff,g0=griLast||computeGRI(),g1=scenGRI(eff),any=Object.keys(eff).length>0;
  var rows=INDICATORS.map(function(i){var e=eff[i.node]||0;if(i.bad==="down")e=e;var l=lvl(e);
    return '<div class="irow" data-go="'+i.node+'"><span>'+esc(tx(i.t))+' <small>'+esc(i.nowD)+'</small></span><span class="mono">'+nf(i.now,i.dec||0)+' '+esc(i.unit)+'</span><span style="color:'+l.c+'">'+(i.bad==="down"&&e>0.06?"▼ "+esc(l.t)+T2(" à la baisse"," downward"):l.a+' '+esc(l.t))+'</span></div>';}).join("");
  var hh=[["oil",T2("Carburant","Fuel")],["eu-gas",T2("Chauffage & électricité","Heating & power")],["food",T2("Alimentation","Food")],["fr-households",T2("Budget global","Overall budget")]].map(function(x){var l=lvl(eff[x[0]]||0);return '<div class="hh"><span class="note">'+esc(x[1])+'</span><b style="color:'+l.c+'">'+l.a+' '+esc(l.t)+'</b></div>';}).join("");
  var arr=Object.keys(eff).filter(function(k){return eff[k]>0.06;}).sort(function(a,b){return r.t[a]-r.t[b]||eff[b]-eff[a];}).slice(0,16);
  var mo=T2("m","mo");
  var gantt=arr.length?'<div class="gnt"><span></span><div class="gax">'+[0,2,4,6,8,10,12].map(function(m){return '<span style="left:'+(m/12*100)+'%">'+m+'</span>';}).join("")+'</div>'+arr.map(function(k){var n=byId[k],t0=Math.min(12,r.t[k]);
    return '<button type="button" class="gl" data-go="'+k+'"><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</button><div class="gb" title="+'+r.t[k]+' '+mo+'"><i style="left:'+(t0/12*100)+'%;background:'+col(n)+';opacity:'+(0.35+0.65*eff[k]).toFixed(2)+'"></i><span class="gv">+'+r.t[k]+' '+mo+' · '+Math.round(eff[k]*100)+'</span></div>';}).join("")+'</div>':'<p class="note">'+esc(T2("Activez au moins un choc à gauche.","Turn on at least one shock on the left."))+'</p>';
  var eased=Object.keys(eff).filter(function(k){return eff[k]<-0.06;}).sort(function(a,b){return eff[a]-eff[b];}).slice(0,8);
  var watch=[];SHOCKS.forEach(function(s){if(shockVal(s))Object.keys(s.src).slice(0,1).forEach(function(id){if(byId[id]&&byId[id].w)watch.push([id,tx(byId[id].w)]);});});
  var html=''+
    '<div class="agrid2"><section class="card"><div class="gri2"><div><div class="ring">'+griRing(g0,96,9,true)+'</div><span class="note">'+esc(T2("Aujourd'hui","Today"))+'</span></div><span class="arr">→</span><div><div class="ring">'+griRing(g1,96,9,true)+'</div><span class="note">'+esc(T2("Scénario","Scenario"))+'</span></div><div><h3>'+esc(T2("Niveau de risque mondial","Global risk level"))+'</h3><p class="note">'+(any?esc(T2("Niveau ","Level ")+g0.level+" → "+g1.level+" · P "+Math.round(g0.tot)+" % → "+Math.round(g1.tot)+" %"):esc(T2("Aucun choc actif","No shock active")))+'</p></div></div></section>'+
    '<section class="card">'+anaH(T2("Foyer en France","Household in France"))+'<div class="hhg">'+hh+'</div><button type="button" class="btn" data-kit="1">'+esc(T2("Ouvrir la réserve 14 jours","Open the 14-day reserve"))+'</button></section></div>'+
    '<section class="card">'+anaH(T2("Indicateurs clés : aujourd'hui → direction dans le scénario","Key indicators: today → direction in the scenario"))+'<div class="itab">'+rows+'</div></section>'+
    '<section class="card">'+anaH(T2("Quand les effets arrivent","When the effects arrive"),T2("Mois après le choc · intensité 0–100","Months after the shock · intensity 0–100"))+gantt+
     (eased.length?'<p class="note" style="margin-top:6px"><b style="color:var(--ok)">'+esc(T2("En détente : ","Easing: "))+'</b>'+eased.map(function(k){return esc(tx(byId[k].t));}).join(" · ")+'</p>':'')+'</section>'+
    (watch.length?'<section class="card">'+anaH(T2("À surveiller","Watch for"))+watch.map(function(w){return '<p style="margin:0" data-go="'+w[0]+'" class="go"><b>'+esc(tx(byId[w[0]].t))+' : </b>'+esc(w[1])+'</p>';}).join("")+'</section>':'')+
   '';
  return {html:html,any:any};
}
function anaScen(el){
  var pres=[["base",T2("Situation actuelle","Base case")],["worse",T2("Aggravation","Deterioration")],["better",T2("Amélioration","Improvement")],["custom",T2("Personnalisé","Custom")]];
  var ctr=SHOCKS.map(function(s){var v=scen[s.id]||0;var inp;
    if(s.kind==="range")inp='<input type="range" min="0" max="'+s.max+'" value="'+v+'" data-sh="'+s.id+'" aria-label="'+esc(tx(s.t))+'">';
    else if(s.kind==="lv")inp='<div class="seg">'+s.lv.map(function(x,i){return '<button type="button" data-sh="'+s.id+'" data-v="'+i+'" aria-pressed="'+(v===i)+'">'+esc(tx(x[0]))+'</button>';}).join("")+'</div>';
    else inp='<label class="sw"><input type="checkbox" data-sh="'+s.id+'"'+(v?" checked":"")+'> '+esc(T2("Activer","Turn on"))+'</label>';
    var n=byId[Object.keys(s.src)[0]];
    return '<div class="shk"><div class="shk-h"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(s.t))+'</span><b id="shl-'+s.id+'">'+esc(shockLabel(s))+'</b></div>'+inp+'</div>';}).join("");
  el.innerHTML='<div class="agrid">'+
   '<section class="card scen-l">'+anaH(T2("Construire un scénario","Build a scenario"))+
    '<div class="seg pres">'+pres.map(function(p){return '<button type="button" data-pre="'+p[0]+'" aria-pressed="'+(scenPreset===p[0])+'">'+esc(p[1])+'</button>';}).join("")+'</div>'+ctr+
    '<div class="row-b"><button type="button" class="btn" id="sc-net">'+esc(T2("Voir dans le réseau","Show in the network"))+'</button><button type="button" class="btn" id="sc-reset">'+esc(T2("Réinitialiser","Reset"))+'</button></div>'+
    '<p class="note">'+esc(T2("Les chocs se propagent par les 100 liens de cause à effet de l'atlas, avec leurs délais. C'est un modèle simple pour explorer, pas une prévision.","Shocks spread through the atlas's 100 cause-and-effect links, with their delays. It is a simple model to explore with, not a forecast."))+'</p></section>'+
   '<div class="scen-r" id="scen-r"></div></div>';
  function paintRes(){var x=scenRes();var box=document.getElementById("scen-r");if(!box)return;box.innerHTML=x.html;var b=document.getElementById("sc-net");if(b)b.disabled=!x.any;}
  paintRes();
  function save(){try{localStorage.setItem("gra-scen",JSON.stringify({v:scen,p:scenPreset}));}catch(e){}}
  el.querySelectorAll("[data-pre]").forEach(function(b){b.onclick=function(){var p=b.dataset.pre;scenPreset=p;if(p!=="custom"){Object.keys(scen).forEach(function(k){scen[k]=0;});Object.assign(scen,PRESETS[p]);}save();anaScen(el);};});
  el.querySelectorAll("[data-sh]").forEach(function(c){var ev=c.type==="range"?"input":c.type==="checkbox"?"change":"click";c.addEventListener(ev,function(){var id=c.dataset.sh;
    scen[id]=c.type==="range"?+c.value:c.type==="checkbox"?(c.checked?1:0):+c.dataset.v;scenPreset="custom";save();
    if(c.type==="range"){var s_=SHOCKS.filter(function(z){return z.id===id;})[0];document.getElementById("shl-"+id).textContent=shockLabel(s_);
      el.querySelectorAll("[data-pre]").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.pre==="custom");});
      if(!anaScen.raf)anaScen.raf=requestAnimationFrame(function(){anaScen.raf=0;paintRes();});}else anaScen(el);});});
  document.getElementById("sc-reset").onclick=function(){Object.keys(scen).forEach(function(k){scen[k]=0;});scenPreset="base";save();anaScen(el);};
  document.getElementById("sc-net").onclick=function(){var eff=runScen().eff;var s=new Set(Object.keys(eff).filter(function(k){return eff[k]>0.06;}));showTab("net");sel=null;casc=null;hl=s;refreshHl();};
}

/* ===== 2. Time travel ===== */
var ttMonth=null,ttTimer=null,ttPath=null;
function ymIdx(ym){var p=ym.split("-");return (+p[0]-2020)*12+(+p[1]-1);}
function idxYm(i){var y=2020+Math.floor(i/12),m=i%12+1;return y+"-"+(m<10?"0":"")+m;}
function ymLabel(ym){var p=ym.split("-");return new Date(+p[0],+p[1]-1,15).toLocaleDateString(L==="fr"?"fr-FR":"en-GB",{month:"short",year:"numeric"});}
function ttMax(){var d=new Date(BASELINE_DATE);return (d.getFullYear()-2020)*12+d.getMonth();}
function anaTime(el){
  var mx=ttMax();if(ttMonth==null)ttMonth=mx;
  if(!ttPath&&typeof d3!=="undefined"&&typeof topojson!=="undefined"){try{var topo=JSON.parse(document.getElementById("world").textContent);var fs=topojson.feature(topo,topo.objects.countries);var pr=d3.geoEquirectangular().scale(1000/(2*Math.PI)).translate([500,250]);ttPath=d3.geoPath(pr)(fs);}catch(e){ttPath="";}}
  var evs=NODES.filter(function(n){return n.since>="2020-01";}).sort(function(a,b){return a.since<b.since?-1:1;});
  el.innerHTML='<div class="agrid"><section class="card tt-m">'+anaH(T2("Le monde à une date","The world at a date"),T2("Plein : actif à cette date · Contour : pas encore commencé","Filled: active on that date · Outline: not started yet"))+
   '<div class="ttmap"><svg viewBox="0 0 1000 500" role="img" aria-label="'+esc(T2("Carte des risques","Risk map"))+'"><path d="'+(ttPath||"")+'" fill="#1c2a37" stroke="#2c3d4d" stroke-width="0.5"></path><g id="tt-dots"></g></svg><div class="ttdate mono" id="tt-date"></div></div>'+
   '<div class="ttc"><button type="button" class="btn ttp" id="tt-play" aria-label="Play">▶</button><div style="flex:1;min-width:0"><input type="range" id="tt-r" min="0" max="'+mx+'" value="'+ttMonth+'" aria-label="'+esc(T2("Date","Date"))+'"><div class="ttax">'+[2020,2021,2022,2023,2024,2025,2026].map(function(y){return '<span style="left:'+((y-2020)*12/mx*100)+'%">'+y+'</span>';}).join("")+'</div></div></div></section>'+
   '<aside class="aside"><section class="card">'+anaH(T2("À cette date","On this date"))+'<div class="kp2"><div><b class="mono" id="tt-n"></b><span class="note">'+esc(T2("risques actifs sur 56","of 56 risks active"))+'</span></div><div><b class="mono" id="tt-s"></b><span class="note">'+esc(T2("de gravité 5","at severity 5"))+'</span></div></div><div class="note">'+esc(T2("Commencés ce mois-ci","Started this month"))+'</div><div id="tt-new"></div></section>'+
   '<section class="card">'+anaH(T2("Débuts des crises depuis 2020","Crisis start dates since 2020"))+'<div class="ttev">'+evs.map(function(n){return '<button type="button" data-ym="'+n.since+'"><span class="mono">'+esc(ymLabel(n.since))+'</span><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</span></button>';}).join("")+'</div></section>'+
   '<p class="note">'+esc(T2("Les tailles reprennent la gravité évaluée le ","Dot sizes use the severity assessed on ")+BASELINE_DATE+T2(". Les scores passés nécessitent un instantané mensuel à partir de maintenant.",". Past scores would need a monthly snapshot from now on."))+'</p></aside></div>';
  function paint(){var ym=idxYm(ttMonth);var g="",n=0,s5=0,nw=[];
    NODES.forEach(function(x){var on_=x.since<=ym;var X=(x.lo+180)/360*1000,Y=(90-x.la)/180*500;
      if(on_){n++;if(x.sv>=5)s5++;}if(x.since===ym)nw.push(x);
      g+='<circle cx="'+X.toFixed(1)+'" cy="'+Y.toFixed(1)+'" r="'+(on_?3+x.sv*1.6:3)+'" fill="'+(on_?col(x):"none")+'" stroke="'+(on_?col(x):"#4a5a6a")+'" stroke-width="1" opacity="'+(on_?0.85:0.6)+'" data-go="'+x.id+'" style="cursor:pointer"><title>'+esc(tx(x.t))+' · '+esc(ymLabel(x.since.length===7?x.since:x.since))+'</title></circle>';});
    document.getElementById("tt-dots").innerHTML=g;document.getElementById("tt-date").textContent=ymLabel(ym).toUpperCase();
    document.getElementById("tt-n").textContent=n;document.getElementById("tt-s").textContent=s5;
    document.getElementById("tt-new").innerHTML=nw.length?nw.map(function(x){return '<div class="go" data-go="'+x.id+'"><span style="color:'+col(x)+'">●</span> <b>'+esc(tx(x.t))+'</b></div>';}).join(""):'<p class="note">—</p>';
    document.getElementById("tt-r").value=ttMonth;
    el.querySelectorAll(".ttev button").forEach(function(b){b.setAttribute("aria-current",b.dataset.ym===ym?"true":"false");});}
  paint();
  document.getElementById("tt-r").addEventListener("input",function(e){ttMonth=+e.target.value;paint();});
  el.querySelectorAll(".ttev button").forEach(function(b){b.onclick=function(){ttMonth=Math.max(0,ymIdx(b.dataset.ym));paint();};});
  var pb=document.getElementById("tt-play");
  function stop(){clearInterval(ttTimer);ttTimer=null;pb.textContent="▶";}
  pb.onclick=function(){if(ttTimer){stop();return;}if(ttMonth>=mx)ttMonth=0;pb.textContent="❚❚";ttTimer=setInterval(function(){if(!document.getElementById("tt-r")){clearInterval(ttTimer);ttTimer=null;return;}ttMonth++;if(ttMonth>=mx){ttMonth=mx;paint();stop();return;}paint();},260);};
}

/* ===== 3. Countries ===== */
var ctry="250";try{ctry=localStorage.getItem("gra-ctry")||"250";}catch(e){}
var ctryQ="";
function ctryList(){var s={};NODES.forEach(function(n){n.c.forEach(function(c){if(ISO[c])s[c]=(s[c]||0)+1;});});return Object.keys(s).sort(function(a,b){return cName(a).localeCompare(cName(b),L);});}
function anaCountry(el){
  var list=ctryList();if(list.indexOf(ctry)<0)ctry=list.indexOf("250")>=0?"250":list[0];
  var direct=NODES.filter(function(n){return n.c.indexOf(ctry)>=0;});
  var dset={};direct.forEach(function(n){dset[n.id]=1;});
  if(!anaCountry.cc){anaCountry.cc={};NODES.forEach(function(n){anaCountry.cc[n.id]=computeCascade(n.id);});}
  var ex=[],tot=0;NODES.forEach(function(n){var best=null;direct.forEach(function(d){var imp=n.id===d.id?1:((anaCountry.cc[n.id][d.id]||{}).imp||0);if(imp&&(!best||imp>best.imp))best={imp:imp,via:d.id,b:anaCountry.cc[n.id][d.id]};});
    if(!best)return;var v=best.imp*n.sv*n.lk/25;tot+=v;ex.push({n:n,v:v,via:best.via,b:best.b,dir:!!dset[n.id]});});
  ex.sort(function(a,b){return b.v-a.v;});tot=tot||1;
  var kn={};ex.forEach(function(x){if(!x.dir)kn[x.n.id]=1;});var knA=Object.keys(kn);
  var top={};ex.slice(0,12).forEach(function(x){top[x.n.id]=1;});var cal=CAL.filter(function(c){return top[c.node];});
  var nm=cName(ctry),c=ISO[ctry],fr=ctry==="250";
  el.innerHTML='<div class="ctop"><h2 class="cn">'+esc(nm.toUpperCase())+'</h2><span class="badge">'+direct.length+' '+esc(T2("risques directs","direct risks"))+' · '+knA.length+' '+esc(T2("par ricochet","knock-on"))+'</span>'+
   '<div class="cpick"><input type="search" id="cq" placeholder="'+esc(T2("Autre pays…","Another country…"))+'" value="'+esc(ctryQ)+'" autocomplete="off" aria-label="'+esc(T2("Chercher un pays","Search a country"))+'"><div class="clist" id="cl" role="listbox"></div></div></div>'+
   '<div class="agrid3"><section class="card">'+anaH(T2("Ce qui expose le plus ","What exposes ")+nm+T2(""," most"),T2("Part de gravité × probabilité","Share of severity × likelihood"))+
    ex.slice(0,12).map(function(x){var n=x.n,v=x.v/tot*100,mx=ex[0].v/tot*100;return '<button type="button" class="xbar" data-go="'+n.id+'"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'<small>'+(x.dir?esc(T2("direct","direct")):esc(T2("via ","via "))+esc(tx(byId[x.via].t))+(x.b?' · +'+x.b.t+' '+esc(T2("mois","mo")):''))+'</small></span><span class="xb"><i style="width:'+Math.max(3,v/mx*100).toFixed(0)+'%;background:'+col(n)+'"></i></span><span class="mono">'+Math.round(v)+' %</span></button>';}).join("")+
    '<p class="note">'+esc(T2("Risques qui touchent le pays directement, ou par les liens de cause à effet (même calcul que le tableau de bord).","Risks that hit the country directly, or through the cause-and-effect links (same method as the dashboard)."))+'</p></section>'+
   '<section class="card">'+anaH(T2("Titres sur ","Headlines about ")+nm,"France 24 · Le Monde · BBC · Al Jazeera · ReliefWeb")+'<div id="c-hl"><p class="note">'+esc(u("loading"))+'</p></div></section>'+
   '<aside class="aside"><section class="card">'+anaH(T2("Dates à surveiller","Dates to watch"))+(cal.length?cal.map(function(x){return '<div class="cal1 go" data-go="'+x.node+'"><span class="mono">'+esc(new Date(x.d).toLocaleDateString(L==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short"}))+(x.approx?"~":"")+'</span><span>'+esc(tx(x.t))+'</span></div>';}).join(""):'<p class="note">—</p>')+'</section>'+
   (fr?'<section class="card" style="border-color:#3a5a2c">'+anaH(T2("Votre foyer","Your household"))+ex.map(function(x){return x.n;}).filter(function(n){return n.h&&n.id!=="fr-households";}).slice(0,4).map(function(n){return '<p class="note" style="color:var(--ink)"><b>'+esc(tx(n.t))+'</b> — '+esc(tx(n.h))+'</p>';}).join("")+'<button type="button" class="btn ok" data-kit="1">'+esc(T2("Ouvrir la réserve 14 jours","Open the 14-day reserve"))+'</button></section>':
    '<section class="card">'+anaH(T2("Se préparer","Be prepared"))+'<p class="note">'+esc(T2("La liste de la réserve 14 jours vaut partout ; les prix et magasins sont ceux de la France.","The 14-day reserve list works anywhere; prices and shops are for France."))+'</p><button type="button" class="btn" data-kit="1">'+esc(T2("Ouvrir la réserve 14 jours","Open the 14-day reserve"))+'</button></section>')+
   '</aside></div>';
  var cq=document.getElementById("cq"),cl=document.getElementById("cl");
  function fill(){var q=cq.value.trim().toLowerCase();ctryQ=cq.value;var m=list.filter(function(k){return !q||cName(k).toLowerCase().indexOf(q)>=0||(ISO[k][3]||"").toLowerCase().indexOf(q)>=0;});
    cl.innerHTML=m.slice(0,40).map(function(k){var n=NODES.filter(function(x){return x.c.indexOf(k)>=0;}).length;return '<button type="button" role="option" data-c="'+k+'" aria-selected="'+(k===ctry)+'">'+esc(cName(k))+' <small>'+n+'</small></button>';}).join("")||'<p class="note">—</p>';}
  cq.addEventListener("focus",function(){cl.classList.add("open");fill();});cq.addEventListener("input",function(){cl.classList.add("open");fill();});
  cq.addEventListener("blur",function(){setTimeout(function(){cl.classList.remove("open");},200);});
  cl.addEventListener("mousedown",function(e){var b=e.target.closest("[data-c]");if(!b)return;e.preventDefault();ctry=b.dataset.c;ctryQ="";try{localStorage.setItem("gra-ctry",ctry);}catch(x){}anaCountry(el);});
  var names=[(c[3]||"").toLowerCase(),(c[4]||"").toLowerCase()].filter(Boolean);
  if(ctry==="840")names.push("u.s.","united states","états-unis","washington");if(ctry==="826")names.push("britain","royaume-uni","uk ");if(ctry==="643")names.push("russian","russe","moscow","moscou","kremlin");if(ctry==="250")names.push("french","français","française","paris","macron");if(ctry==="804")names.push("ukrainian","ukrainien","kyiv","kiev");if(ctry==="364")names.push("iranian","iranien","tehran","téhéran");if(ctry==="156")names.push("chinese","chinois","beijing","pékin");if(ctry==="276")names.push("german","allemand","berlin");
  fetchRSS("").then(function(v){return v;},function(){return [];}).then(function(v){var all=v||[];var hit=all.filter(function(a){var t=" "+a.title.toLowerCase()+" ";return names.some(function(n){return t.indexOf(n)>=0;});}).slice(0,10);
    var box=document.getElementById("c-hl");if(!box)return;
    box.innerHTML=hit.length?hit.map(function(a){return '<a class="hl" href="'+esc(a.url)+'" target="_blank" rel="noopener"><span class="mono">'+esc(a.dom||"")+(a.ts?' · '+esc(new Date(a.ts).toLocaleDateString(L==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short"})):'')+'</span>'+esc(a.title)+'</a>';}).join(""):'<p class="note">'+esc(all.length?T2("Aucun titre récent ne cite ce pays.","No recent headline mentions this country."):T2("Flux d'actualités indisponible.","News feed unavailable."))+'</p>';});
}

/* ===== 4. Media attention ===== */
var attData=null,attErr=null,attAt=0;
var ATT_KW={"iran-war":["iran","iranian","iranien","iranienne","tehran","téhéran"],hormuz:["hormuz","ormuz"],"ukr-war":["ukraine","ukrainian","ukrainien","ukrainienne","kyiv","kiev","zelensky","zelenski"],gaza:["gaza"],lebanon:["hezbollah","lebanon","liban"],houthis:["houthi","houthis"],sudan:["sudan","soudan","darfur","darfour"],sahel:["sahel","mali","burkina"],drc:["congo","m23","rdc"],taiwan:["taiwan","taïwan"],korea:["north korea","corée du nord","pyongyang","kim jong un"],"india-pak":["pakistan","kashmir","cachemire"],baltic:["baltic","baltique","estonia","estonie","latvia","lettonie","lithuania","lituanie"],venezuela:["venezuela"],hybrid:["sabotage","hybrid","hybride","drone incursion","survol de drones"],ransomware:["cyberattack","cyber-attack","cyberattaque","ransomware","hackers","piratage"],oil:["oil","brent","pétrole","crude","opec","opep"],"eu-gas":["gas price","gas prices","prix du gaz","lng","gnl","gas storage"],inflation:["inflation"],trade:["tariff","tariffs","droits de douane","trade war","guerre commerciale"],food:["food prices","prix alimentaires","wheat","blé","fao"],"el-nino":["el niño","el nino"],hunger:["famine","hunger","faim","malnutrition"],ebola:["ebola"],h5n1:["bird flu","h5n1","grippe aviaire"],heat:["heatwave","canicule","cop31","climate","climat"],migration:["migrants","migrant","migration","asylum","asile"],cables:["undersea cable","câble sous-marin","pipeline"],"us-politics":["midterm","midterms","mi-mandat"]};
var ATT_RE={};Object.keys(ATT_KW).forEach(function(k){ATT_RE[k]=new RegExp("(^|[^a-z0-9à-ÿ])("+ATT_KW[k].map(function(w){return w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).join("|")+")([^a-z0-9à-ÿ]|$)","i");});
function attToday(items){var c={};items.forEach(function(it){Object.keys(ATT_RE).forEach(function(k){if(ATT_RE[k].test(it.title))c[k]=(c[k]||0)+1;});});return {d:BASELINE_DATE,n:items.length,c:c,live:true};}
function loadAtt(){if(attData&&Date.now()-attAt<10*60e3)return Promise.resolve(attData);
  return tryFetch(orderedBases().map(function(p){return p+"/attention";}),15000).then(function(j){if(!j||!j.days)throw new Error(j&&j.error||"no data");attData=j;attAt=Date.now();attErr=null;return j;})
   .catch(function(e){attErr=String(e&&e.message||e);return fetchRSS("").then(function(v){attData={days:[attToday(v)],fallback:true};attAt=Date.now();return attData;},function(){attData={days:[],fallback:true};return attData;});});}
function anaAtt(el){
  el.innerHTML='<p class="note">'+esc(u("loading"))+'</p>';
  loadAtt().then(function(j){if(!document.getElementById("ana-b")||anaSub!=="att")return;
    var days=j.days||[];var ids=Object.keys(ATT_KW).filter(function(k){return byId[k];});
    var totals={};ids.forEach(function(k){totals[k]=days.reduce(function(s,d){return s+((d.c||{})[k]||0);},0);});
    var rows=ids.slice().sort(function(a,b){return totals[b]-totals[a];}).slice(0,14);
    var head='<div class="atop">'+anaH(T2("Attention médiatique · ","Media attention · ")+(days.length>1?days.length+T2(" jours"," days"):T2("aujourd'hui","today")),T2("Titres qui citent chaque risque","Headlines mentioning each risk"))+(j.fallback?'<span class="badge warn">'+esc(T2("COLLECTE PAS ENCORE ACTIVE","COLLECTION NOT ACTIVE YET"))+'</span>':days.length<30?'<span class="badge">'+esc(T2("Collecte depuis le ","Collecting since "))+esc(days[0]?days[0].d:"")+'</span>':'')+'</div>';
    var gmx=Math.max.apply(null,[0].concat.apply([0],rows.map(function(k){return days.map(function(d){return d.n?((d.c||{})[k]||0)/d.n:0;});})))||1;
    var grid=days.length?'<div class="hm" style="--nd:'+days.length+'">'+rows.map(function(k){var n=byId[k];var mx=gmx;
      return '<button type="button" class="hl0" data-go="'+k+'"><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</button><div class="hrow">'+days.map(function(d){var c=(d.c||{})[k]||0;var v=d.n?c/d.n/mx:0;return '<span title="'+esc(d.d)+' · '+c+'" style="background:rgba(127,209,255,'+(0.06+v*0.88).toFixed(2)+')"></span>';}).join("")+'</div><span class="mono hn">'+totals[k]+'</span>';}).join("")+
      '<span></span><div class="hax mono"><span>'+esc(days[0].d.slice(5))+'</span><span>'+esc(days[days.length-1].d.slice(5))+'</span></div><span></span></div>':'<p class="note">'+esc(T2("Aucune donnée pour l'instant.","No data yet."))+'</p>';
    var sp=[];if(days.length>=4){var last=days.slice(-2),prev=days.slice(0,-2);ids.forEach(function(k){var a=last.reduce(function(s,d){return s+((d.c||{})[k]||0);},0)/last.length;var b=prev.reduce(function(s,d){return s+((d.c||{})[k]||0);},0)/prev.length;if(a>=3&&a>=2*Math.max(b,0.5))sp.push([k,a/Math.max(b,0.5)]);});sp.sort(function(a,b){return b[1]-a[1];});}
    var all=ids.reduce(function(s,k){return s+totals[k];},0)||1;
    var under=ids.filter(function(k){return byId[k].sv>=4;}).sort(function(a,b){return totals[a]/byId[a].sv-totals[b]/byId[b].sv;}).slice(0,4);
    el.innerHTML='<div class="agrid"><section class="card">'+head+grid+'<div class="note" style="display:flex;gap:8px;align-items:center">'+esc(T2("Moins de titres","Fewer headlines"))+' <span class="lg"></span> '+esc(T2("Plus de titres","More headlines"))+'</div></section>'+
     '<aside class="aside"><section class="card" style="border-color:#5a4a1c">'+anaH(T2("Pics","Spikes"),T2("2 derniers jours vs avant","Last 2 days vs before"))+(sp.length?sp.slice(0,4).map(function(s){var n=byId[s[0]];return '<div class="go" data-go="'+s[0]+'"><span style="color:'+col(n)+'">●</span> <b>'+esc(tx(n.t))+'</b> <span class="mono" style="color:var(--warn)">×'+nf(s[1],1)+'</span></div>';}).join(""):'<p class="note">'+esc(days.length>=4?T2("Pas de pic net.","No clear spike."):T2("Il faut au moins 4 jours de données.","Needs at least 4 days of data."))+'</p>')+'</section>'+
     '<section class="card">'+anaH(T2("Graves mais peu couverts","Severe but under-covered"))+under.map(function(k){var n=byId[k];return '<div class="go" data-go="'+k+'"><b>'+esc(tx(n.t))+'</b><div class="note">'+esc(T2("Gravité ","Severity "))+n.sv+' · '+Math.round(totals[k]/all*100)+' % '+esc(T2("des mentions","of mentions"))+'</div></div>';}).join("")+'</section>'+
     '<section class="card">'+anaH(T2("Comment c'est mesuré","How it is measured"))+'<p class="note" style="color:var(--ink)">'+esc(T2("Chaque heure, le relais compte les titres de France 24, Le Monde, BBC, Al Jazeera et ReliefWeb qui citent chaque risque (mots-clés FR et EN), et garde 30 jours.","Every hour, the relay counts headlines from France 24, Le Monde, BBC, Al Jazeera and ReliefWeb that mention each risk (FR and EN keywords), and keeps 30 days."))+'</p>'+
      (j.fallback?'<p class="note">'+esc(T2("Le relais ne renvoie pas encore d'historique","The relay doesn't return history yet")+(attErr?" ("+attErr+")":"")+T2(" : affichage des titres du moment uniquement."," — showing current headlines only."))+'</p>':'<p class="note">'+esc(T2("Remplace GDELT, limité en nombre de requêtes.","Replaces GDELT, which is rate-limited."))+'</p>')+'</section></aside></div>';
  });
}

/* ===== 5. Confidence ===== */
var MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
function asOf(s){var m=String(s).toLowerCase().match(/(\d{1,2})?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/);if(!m)return null;var y=new Date(BASELINE_DATE).getFullYear();var d=new Date(y,MON[m[2]],m[1]?+m[1]:15);if(d>new Date(BASELINE_DATE))d.setFullYear(y-1);return {d:d,approx:!m[1]};}
var OFFICIAL=/imf\.org|noaa\.gov|fao\.org|gov\.uk|ukhsa|who\.int|un\.org|unhcr|wfp\.org|reliefweb|usgs\.gov|nasa\.gov|europa\.eu|acer|iea\.org|worldbank|ipcc|ec\.europa|gouv\.fr|insee|ecb\.europa|federalreserve|ocha|ipcinfo|unicef/i;
var DATAF=/kpler|ukmto|lloyd|ais|bloomberg|reuters|tradingeconomics|fastmarkets|crudeoilprice|oilprice/i;
function srcTier(u_){return OFFICIAL.test(u_)?0:/polymarket/.test(u_)?3:DATAF.test(u_)?1:2;}
function anaConf(el){
  var now=new Date();
  var rows=INDICATORS.map(function(i){var a=asOf(i.nowD);var age=a?Math.max(0,Math.round((now-a.d)/864e5)):null;var c=age==null?"var(--muted)":age<10?"var(--ok)":age<=30?"var(--warn)":"var(--crit)";var s=(i.src||[])[0];return {i:i,age:age,approx:a&&a.approx,c:c,s:s};}).sort(function(a,b){return (b.age||0)-(a.age||0);});
  var allS={};NODES.forEach(function(n){(n.src||[]).forEach(function(s){allS[s[1]]=s[0];});});INDICATORS.forEach(function(i){(i.src||[]).forEach(function(s){allS[s[1]]=s[0];});});
  var tiers=[0,0,0,0];Object.keys(allS).forEach(function(k){tiers[srcTier(k)]++;});
  var hi=NODES.filter(function(n){return n.cf==="high";}).length,md=NODES.filter(function(n){return n.cf==="medium";}).length,lo=NODES.length-hi-md;
  var feeds=[["fd-usgs","USGS"],["fd-eonet","NASA EONET"],["fd-gdacs","GDACS"],["fd-kp","NOAA Kp"],["fd-poly","Polymarket"],["fd-gdelt","GDELT"]].map(function(f){var e=document.getElementById(f[0]);var ok=e&&/\bok\b/.test(e.className),bad=e&&/\b(err|off|bad|fail)\b/.test(e.className);return '<span class="fdot"><i style="background:'+(ok?"var(--ok)":bad?"var(--crit)":"var(--warn)")+'"></i>'+esc(f[1])+'</span>';}).join("");
  var worst=rows[0];
  el.innerHTML='<div class="agrid"><section class="card">'+anaH(T2("Fraîcheur de chaque chiffre","How fresh each figure is"),T2("Âge au ","Age on ")+now.toLocaleDateString(L==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short",year:"numeric"}))+
   '<div class="ctab"><div class="ch"><span>'+esc(T2("Indicateur","Indicator"))+'</span><span>'+esc(T2("Date","As of"))+'</span><span>'+esc(T2("Âge","Age"))+'</span><span>'+esc(T2("Source","Source"))+'</span><span></span></div>'+
   rows.map(function(r){return '<div class="cr"><span class="go" data-go="'+r.i.node+'">'+esc(tx(r.i.t))+'</span><span class="mono">'+esc(r.i.nowD)+'</span><span class="mono"><i class="dot" style="background:'+r.c+'"></i>'+(r.age==null?"?":(r.approx?"~":"")+r.age+" "+T2("j","d"))+'</span><span class="note">'+esc(r.s?r.s[0]:"—")+'</span>'+(r.s?'<a href="'+esc(r.s[1])+'" target="_blank" rel="noopener">'+esc(T2("Vérifier","Verify"))+'</a>':'<span></span>')+'</div>';}).join("")+'</div>'+
   '<div class="note" style="display:flex;flex-wrap:wrap;gap:14px"><span><i class="dot" style="background:var(--ok)"></i>'+esc(T2("moins de 10 jours","under 10 days"))+'</span><span><i class="dot" style="background:var(--warn)"></i>10–30 '+esc(T2("jours","days"))+'</span><span><i class="dot" style="background:var(--crit)"></i>'+esc(T2("plus de 30 jours : à rafraîchir","over 30 days: needs refresh"))+'</span><span>~ '+esc(T2("date approximative (mois seul)","approximate (month only)"))+'</span></div>'+
   anaH(T2("Flux en direct","Live feeds"))+'<div class="fds">'+feeds+'</div></section>'+
   '<aside class="aside"><section class="card">'+anaH(T2("Confiance dans les 56 risques","Confidence in the 56 risks"))+'<div class="cbar"><i style="flex:'+hi+';background:var(--ok)"></i><i style="flex:'+md+';background:var(--warn)"></i><i style="flex:'+Math.max(lo,0.001)+';background:var(--crit)"></i></div><div style="display:flex;gap:16px"><span><b class="mono">'+hi+'</b> '+esc(T2("élevée","high"))+'</span><span><b class="mono">'+md+'</b> '+esc(T2("moyenne","medium"))+'</span><span><b class="mono">'+lo+'</b> '+esc(T2("faible","low"))+'</span></div><p class="note">'+esc(T2("Élevée : plusieurs sources officielles ou de référence concordent.","High: several official or reference sources agree."))+'</p></section>'+
   '<section class="card">'+anaH(T2("Types de sources","Source types"),Object.keys(allS).length+" "+T2("sources","sources"))+
    [[T2("OFFICIEL","OFFICIAL"),"var(--ok)",0,"IMF · NOAA · FAO · UKHSA · UN · USGS"],[T2("DONNÉES","DATA FIRMS"),"var(--accent)",1,"Kpler · UKMTO · Bloomberg · Fastmarkets"],[T2("PRESSE","PRESS"),"var(--warn)",2,"Al Jazeera · Le Monde · France 24 · Wikipedia"],[T2("MARCHÉ","MARKET"),"#9fb0c4",3,"Polymarket"]].map(function(t){return '<div class="tier"><span class="tg" style="background:'+t[1]+'">'+esc(t[0])+'</span><b class="mono">'+tiers[t[2]]+'</b><span class="note">'+esc(t[3])+'</span></div>';}).join("")+'</section>'+
   (worst&&worst.age>30?'<section class="card" style="border-color:#6a2a24">'+anaH(T2("À rafraîchir","Needs a refresh"))+'<b>'+esc(tx(worst.i.t))+' · '+worst.age+' '+esc(T2("jours","days"))+'</b>'+(worst.s?'<a class="btn crit" href="'+esc(worst.s[1])+'" target="_blank" rel="noopener">'+esc(T2("Vérifier la dernière source","Check the latest source"))+'</a>':'')+'</section>':'')+
   '</aside></div>';
}

/* ===== 6. Live layers (globe) ===== */
var LYR={planes:false,ships:false,outages:false,fires:false},LBASE="dark",LST={},LDATA={planes:[],ships:null,outages:[],fires:[]},lyrCfg=null;
try{var ls_=JSON.parse(localStorage.getItem("gra-lyr")||"null");if(ls_){Object.assign(LYR,ls_.l||{});LBASE=ls_.b||"dark";}}catch(e){}
var LYR_DEF=[["planes",{fr:"Trafic aérien",en:"Air traffic"},"#ffffff",{fr:"ADS-B · adsb.lol (données ouvertes)",en:"ADS-B · adsb.lol (open data)"}],["ships",{fr:"Navires (AIS)",en:"Ships (AIS)"},"#4fc3e0",{fr:"aisstream.io · clé requise",en:"aisstream.io · key needed"}],["outages",{fr:"Coupures d'internet",en:"Internet outages"},"#a98af6",{fr:"Cloudflare Radar · 7 jours",en:"Cloudflare Radar · 7 days"}],["fires",{fr:"Feux & frappes (Ukraine, Russie, Moyen-Orient)",en:"Fires & strikes (Ukraine, Russia, Middle East)"},"#ff9a3d",{fr:"NASA FIRMS · 24 h",en:"NASA FIRMS · 24 h"}]];
var BASES=[["dark",{fr:"Sombre",en:"Dark"}],["sat",{fr:"Satellite (hier)",en:"Satellite (yesterday)"}],["night",{fr:"Lumières de nuit",en:"Night lights"}]];
var PLANE_R=["gulf","levant","blacksea","baltic","taiwan","europe","london","madrid","rome","warsaw","istanbul","nordic","alps","nyc","chicago","atlanta","dallas","la","florida","denver","seattle","tokyo","shanghai","beijing","delhi","singapore","seoul","dubai","paris","frankfurt","amsterdam","athens","lisbon","dublin","moscow","kyiv","toronto","sf","phoenix","houston","dc","boston","minneapolis","mexico","saopaulo","bogota","buenosaires","lima","cairo","johannesburg","lagos","nairobi","casablanca","riyadh","tehran","mumbai","bangkok","hongkong","chengdu","jakarta","manila","sydney","melbourne","auckland","natrack","anchorage"];
var TRAIL={},planeSrc="",relayCfg=null;
function relayCfgP(){if(relayCfg)return Promise.resolve(relayCfg);return relay("layers",10000).then(function(j){relayCfg=j;return j;},function(){return {};});}
function poolMap(arr,n,fn){var i=0,out=[],act=0;return new Promise(function(res){function nx(){if(i>=arr.length&&!act){res(out);return;}while(act<n&&i<arr.length){(function(k){act++;fn(arr[k]).then(function(v){out[k]=v;},function(){out[k]=null;}).then(function(){act--;nx();});})(i++);}}nx();});}
function addTrail(h,la,lo){var t=TRAIL[h]||(TRAIL[h]=[]);var l=t[t.length-1];if(!l||Math.abs(l[0]-la)>0.01||Math.abs(l[1]-lo)>0.01)t.push([la,lo]);if(t.length>40)t.shift();}
var oskErr;
function loadPlanes(){var now=Date.now();
  function cfgRegions(){return (relayCfg&&relayCfg.regions)||PLANE_R;}
  function regional(){return poolMap(cfgRegions(),6,function(r){return relay("planes?r="+r,15000);}).then(function(a){var seen={},out=[];
    a.forEach(function(j){((j&&(j.ac||j.aircraft))||[]).forEach(function(x){if(typeof x.lat!=="number"||seen[x.hex])return;seen[x.hex]=1;var ago=(x.seen_pos||x.seen||0)*1000;
      out.push({h:x.hex,cs:(x.flight||"").trim(),og:x.r||"",ty:x.t||"",la:x.lat,lo:x.lon,alt:x.alt_baro==="ground"?0:(+x.alt_baro||0),gs:+x.gs||0,trk:+x.track||0,gnd:x.alt_baro==="ground",t:now-ago});});});
    planeSrc="ADS-B · "+a.filter(Boolean).length+" "+T2("zones","regions");return out;});}
  return relayCfgP().then(function(cfg){
    if(cfg&&cfg.planesGlobal)return relay("planes?r=all",30000).then(function(j){var st=j.states||[];var out=[];var t0=(j.time||now/1000)*1000;
      st.forEach(function(a){if(a[6]==null||a[5]==null)return;out.push({h:a[0],cs:(a[1]||"").trim(),og:a[2],la:a[6],lo:a[5],alt:a[8]?0:Math.round((a[7]||a[13]||0)*3.281),gs:(a[9]||0)*1.944,trk:a[10]||0,gnd:!!a[8],t:(a[3]?a[3]*1000:t0)});});
      if(!out.length)throw new Error("empty");planeSrc="OpenSky";oskErr=null;return out;}).catch(function(e){oskErr=String(e&&e.message||e).slice(0,120);return regional();});
    return regional();});
}
var AIS_NAMES={hormuz:{fr:"Ormuz",en:"Hormuz"},bab:{fr:"Bab el-Mandeb",en:"Bab el-Mandeb"},suez:{fr:"Suez",en:"Suez"},malacca:{fr:"Malacca",en:"Malacca"},taiwan:{fr:"Détroit de Taïwan",en:"Taiwan Strait"},finland:{fr:"Golfe de Finlande",en:"Gulf of Finland"},channel:{fr:"Manche",en:"English Channel"}};
function lyrSave(){try{localStorage.setItem("gra-lyr",JSON.stringify({l:LYR,b:LBASE}));}catch(e){}}
function relay(path,ms){return relayText(path).then(function(t){var j=JSON.parse(t);if(j&&j.error&&!j.ships&&!j.ac)throw new Error(j.error);return j;});}
function relayText(path){var bs=orderedBases(),i=0;return new Promise(function(res,rej){(function nx(){if(i>=bs.length){rej(new Error("failed"));return;}fetch(bs[i++]+"/"+path,{mode:"cors"}).then(function(r){if(!r.ok)return r.text().then(function(t){var m=t;try{m=JSON.parse(t).error||t;}catch(x){}var er=new Error(String(m).slice(0,140));er.final=r.status===503||r.status===400;throw er;});return r.text();}).then(res).catch(function(e){if(e.final||i>=bs.length)rej(e);else nx();});})();});}
function lyrLoad(k){
  if(LST[k]==="loading")return;LST[k]="loading";lyrPanel();
  var p;
  if(k==="planes")p=loadPlanes();
  else if(k==="ships")p=relay("ships",25000).then(function(j){if(j.error)throw new Error(j.error);LDATA.ships=j;return (j.ships||[]).length+" "+T2("navires","ships");});
  else if(k==="outages")p=relay("outages",15000).then(function(j){if(j.error)throw new Error(j.error);var an=(j.result&&j.result.annotations)||[];var out=[];an.forEach(function(a){(a.locations||[]).forEach(function(cc){var n=ISO2N[cc];if(!n)return;var c=ISO[n];out.push({lat:c[1],lng:c[2],cc:cc,name:cName(n),cause:((a.outage||{}).outageCause||a.eventType||"").replace(/_/g," ").toLowerCase(),type:((a.outage||{}).outageType||"").toLowerCase(),start:a.startDate,end:a.endDate,desc:a.description||"",url:a.linkedUrl||""});});});LDATA.outages=out;return out.length+" "+T2("coupures","outages");});
  else if(k==="fires")p=relayText("fires").then(function(t){if(/^\s*\{/.test(t)){var j=JSON.parse(t);throw new Error(j.error||"error");}var ln=t.trim().split(/\r?\n/);var h=ln.shift().split(",");var ia=h.indexOf("latitude"),io=h.indexOf("longitude"),ic=h.indexOf("confidence"),ifr=h.indexOf("frp");var out=[];ln.forEach(function(l){var c=l.split(",");if(c[ic]==="l")return;var la=+c[ia],lo=+c[io];if(isNaN(la))return;out.push([la,lo,+c[ifr]||0]);});out.sort(function(a,b){return b[2]-a[2];});LDATA.fires=out.slice(0,5000);return LDATA.fires.length+" "+T2("points chauds","hotspots");});
  if(k==="planes")p=p.then(function(out){if(!out.length)throw new Error(T2("aucun avion reçu","no aircraft received"));out.forEach(function(a){addTrail(a.h,a.la,a.lo);});LDATA.planes=out;return out.length.toLocaleString()+" "+T2("avions","aircraft")+" · "+planeSrc;});
  p.then(function(m){LST[k]={ok:true,m:m,at:new Date()};lyrPanel();lyrApply();if(k==="outages")refreshGlobe();lmUpd(k);},function(e){LST[k]={ok:false,m:String(e&&e.message||e)};lyrPanel();lmUpd(k);});
}
function lmUpd(k){var sm=document.getElementById("lms-"+k);if(sm)sm.textContent=lyrMsg(k);if(typeof liveMapPaint==="function")liveMapPaint();}
function lyrMsg(k){var s=LST[k];if(!s)return "";if(s==="loading")return u("loading");if(s.ok)return s.m+" · "+s.at.toLocaleTimeString(L==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"});
  var m=s.m;if(/AISSTREAM_KEY/.test(m))return T2("À activer : clé aisstream.io dans le relais","To enable: aisstream.io key in the relay");if(/CF_RADAR_TOKEN/.test(m))return T2("À activer : jeton Cloudflare Radar dans le relais","To enable: Cloudflare Radar token in the relay");if(/FIRMS_KEY/.test(m))return T2("À activer : clé NASA FIRMS dans le relais","To enable: NASA FIRMS key in the relay");return T2("Indisponible","Unavailable")+" ("+m.slice(0,60)+")";}
function gibsUrl(layer,date){return "https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS="+layer+"&STYLES=&SRS=EPSG:4326&BBOX=-180,-90,180,90&WIDTH=2048&HEIGHT=1024&FORMAT=image/jpeg"+(date?"&TIME="+date:"");}
function setBase(b){LBASE=b;lyrSave();if(!G){lyrPanel();return;}var m=G.globeMaterial();
  if(b==="dark"){G.globeImageUrl(null);if(m){m.map=null;if(m.color)m.color.set("#0c1a2a");if(m.emissive)m.emissive.set("#06101c");m.needsUpdate=true;}LST.base=null;lyrPanel();return;}
  var y=new Date(Date.now()-36*3600e3).toISOString().slice(0,10);
  var tries=b==="sat"?[gibsUrl("VIIRS_SNPP_CorrectedReflectance_TrueColor",y),gibsUrl("MODIS_Terra_CorrectedReflectance_TrueColor",y),gibsUrl("BlueMarble_ShadedRelief_Bathymetry","")]:[gibsUrl("VIIRS_SNPP_DayNightBand_ENCC",y),gibsUrl("VIIRS_Black_Marble","")];
  LST.base="loading";lyrPanel();var i=0;
  (function nx(){if(i>=tries.length){LST.base={ok:false,m:"GIBS"};lyrPanel();return;}var url=tries[i++];var im=new Image();im.crossOrigin="anonymous";
    im.onload=function(){if(LBASE!==b)return;G.globeImageUrl(url);if(m){if(m.color)m.color.set("#ffffff");if(m.emissive)m.emissive.set("#000000");}LST.base={ok:true,m:"NASA GIBS",at:new Date()};lyrPanel();};
    im.onerror=nx;im.src=url;})();
}
var lyrSig="",lyrAcc=false;
function lyrApply(){
  if(!G||typeof G.particlesData!=="function")return;
  var sig=[LYR.planes?LDATA.planes.length+"@"+(LST.planes&&LST.planes.at?+LST.planes.at:0):"",LYR.ships&&LDATA.ships?(LDATA.ships.at||"")+(LDATA.ships.ships||[]).length:"",LYR.fires?LDATA.fires.length:""].join("|");
  if(sig===lyrSig)return;lyrSig=sig;
  if(!lyrAcc){lyrAcc=true;G.particlesList(function(d){return d.pts;}).particleLat(function(p){return p[0];}).particleLng(function(p){return p[1];}).particleAltitude(function(p){return p[2];}).particlesColor(function(d){return d.c;}).particlesSize(function(d){return d.s;}).particlesSizeAttenuation(false);}
  var sets=[];
  if(LYR.planes&&LDATA.planes.length)sets.push({c:"rgba(255,255,255,0.9)",s:2.2,pts:LDATA.planes.map(function(p){return [p.la,p.lo,0.004+Math.min(p.alt,45000)/45000*0.04];})});
  if(LYR.ships&&LDATA.ships&&LDATA.ships.ships)sets.push({c:"#4fc3e0",s:3.2,pts:LDATA.ships.ships.map(function(s){return [s[0],s[1],0.003];})});
  if(LYR.fires&&LDATA.fires.length)sets.push({c:"#ff9a3d",s:2.6,pts:LDATA.fires.map(function(f){return [f[0],f[1],0.003];})});
  G.particlesData(sets);
}
function lyrPanel(){
  var el=document.getElementById("lyr");if(!el)return;
  var ais=LYR.ships&&LDATA.ships&&LDATA.ships.counts?LDATA.ships:null;
  el.innerHTML='<div class="lyh"><b>'+esc(u("layers"))+'</b><button type="button" class="btn ic" id="lyr-x" aria-label="'+esc(u("close"))+'">✕</button></div>'+
   '<div class="seg">'+BASES.map(function(b){return '<button type="button" data-base="'+b[0]+'" aria-pressed="'+(LBASE===b[0])+'">'+esc(tx(b[1]))+'</button>';}).join("")+'</div>'+
   (LST.base&&LBASE!=="dark"?'<p class="note">'+esc(LST.base==="loading"?u("loading"):LST.base.ok?T2("Image NASA GIBS (jour précédent)","NASA GIBS image (previous day)"):T2("Image satellite indisponible","Satellite image unavailable"))+'</p>':'')+
   LYR_DEF.map(function(d){return '<label class="ly"><input type="checkbox" data-ly="'+d[0]+'"'+(LYR[d[0]]?" checked":"")+'><span><span style="color:'+d[2]+'">●</span> '+esc(tx(d[1]))+'<small>'+esc(LYR[d[0]]&&LST[d[0]]?lyrMsg(d[0]):tx(d[3]))+'</small></span></label>';}).join("")+
   (ais?'<div class="ais"><div class="note">'+esc(T2("Navires vus en ","Ships seen in "))+(ais.window||9)+' s'+(ais.avg?' · '+esc(T2("moy. ","avg "))+ais.avg._days+T2(" j"," d"):'')+'</div>'+Object.keys(AIS_NAMES).map(function(k){var c=ais.counts[k]||0,a=ais.avg&&ais.avg[k];var low=a!=null&&a>4&&c<a*0.5;return '<div class="aisr"><span>'+esc(tx(AIS_NAMES[k]))+'</span><b class="mono"'+(low?' style="color:var(--crit)"':'')+'>'+c+(a!=null?' <small>/ '+a+'</small>':'')+'</b></div>';}).join("")+'<p class="note">'+esc(T2("Dans le Golfe, beaucoup de navires coupent leur AIS ou sont brouillés : la carte en montre moins qu'en réalité.","In the Gulf many ships switch AIS off or are jammed: the map shows fewer than there really are."))+'</p></div>':'')+
   '<p class="note">'+esc(T2("Positions en direct via le relais atlas-api. Survolez un point violet pour le détail d'une coupure.","Live positions via the atlas-api relay. Hover a purple marker for outage details."))+'</p>';
}
function lyrOpen(o){var el=document.getElementById("lyr"),b=document.getElementById("lyr-b");if(!el)return;var open=o==null?el.hidden:o;el.hidden=!open;var gt=document.getElementById("gtoggles");if(gt)gt.classList.toggle("lyopen",open);if(b)b.setAttribute("aria-expanded",open);if(open)lyrPanel();}
(function(){
  var gt=document.getElementById("gtoggles");if(!gt)return;
  gt.insertAdjacentHTML("beforeend",'<button type="button" class="btn lyb" id="lyr-b" aria-expanded="false" aria-controls="lyr"><svg class="ti" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg> <span data-i="layers"></span></button>');
  var v=document.getElementById("v-globe");v.insertAdjacentHTML("afterend",'<div class="lyr" id="lyr" hidden></div>');
  document.getElementById("lyr-b").addEventListener("click",function(){lyrOpen();});
  document.getElementById("lyr").addEventListener("click",function(e){if(e.target.closest("#lyr-x")){lyrOpen(false);return;}var b=e.target.closest("[data-base]");if(b){setBase(b.dataset.base);}});
  document.getElementById("lyr").addEventListener("change",function(e){var k=e.target.dataset.ly;if(!k)return;LYR[k]=e.target.checked;lyrSave();if(LYR[k]&&(!LST[k]||!LST[k].ok))lyrLoad(k);if(k==="outages")refreshGlobe();lyrApply();lyrPanel();});
})();
function lyrInit(){if(LBASE!=="dark")setBase(LBASE);Object.keys(LYR).forEach(function(k){if(LYR[k])lyrLoad(k);});}
setInterval(function(){if(tab!=="globe"&&!(tab==="ana"&&anaSub==="live"))return;["planes","ships"].forEach(function(k){if(LYR[k]&&LST[k]&&LST[k].ok&&Date.now()-LST[k].at>(k==="planes"?90e3:600e3))lyrLoad(k);});},30000);
var LMAP={box:null,q:true,k:1,cx:500,cy:250,sel:null,card:true};
var BOXES={hormuz:[[24,54],[27.6,58.6]],bab:[[11,42],[15.5,45]],suez:[[29.5,32.2],[31.6,32.8]],malacca:[[1,100],[4.5,104]],taiwan:[[22,118],[26,121.5]],finland:[[59,22],[60.7,30]],channel:[[49.8,-2],[51.3,2]]};
function mx_(lo){return (lo+180)/360*1000;}function my_(la){return (90-la)/180*500;}
var lmLand=null,lmImg=null,lmImgUrl="",lmTimer=null,lmCv=null;
function liveBaseUrl(){if(LBASE==="dark")return "";var y=new Date(Date.now()-36*3600e3).toISOString().slice(0,10);return LBASE==="sat"?gibsUrl("VIIRS_SNPP_CorrectedReflectance_TrueColor",y):gibsUrl("VIIRS_Black_Marble","");}
/* dead reckoning: where the aircraft or ship should be now, from its speed and heading */
function drPos(la,lo,kn,hd,t){var dt=Math.min(600e3,Math.max(0,Date.now()-t))/3600e3;if(!kn||!dt)return [la,lo];var d=kn*dt/60,r=hd*Math.PI/180;return [la+d*Math.cos(r),lo+d*Math.sin(r)/Math.max(0.2,Math.cos(la*Math.PI/180))];}
function lmXY(la,lo){var c=lmCv,s0=c.width/1000*LMAP.k;return [(mx_(lo)-LMAP.cx)*s0+c.width/2,(my_(la)-LMAP.cy)*s0+c.height/2];}
function lmInv(px,py){var c=lmCv,s0=c.width/1000*LMAP.k;return [(px-c.width/2)/s0+LMAP.cx,(py-c.height/2)/s0+LMAP.cy];}
function lmClamp(){LMAP.k=Math.max(1,Math.min(60,LMAP.k));var ar=lmCv?lmCv.height/lmCv.width:0.5,hw=500/LMAP.k,hh=500*ar/LMAP.k;LMAP.cx=Math.max(hw,Math.min(1000-hw,LMAP.cx));LMAP.cy=hh>=250?250:Math.max(hh,Math.min(500-hh,LMAP.cy));}
function lmTri(x,y,hd,sz,ctx){var r=hd*Math.PI/180,c=Math.cos(r),s=Math.sin(r);ctx.moveTo(x+s*sz,y-c*sz);ctx.lineTo(x-s*sz*0.6+c*sz*0.55,y+c*sz*0.6+s*sz*0.55);ctx.lineTo(x-s*sz*0.6-c*sz*0.55,y+c*sz*0.6-s*sz*0.55);ctx.closePath();}
function lmDraw(){
  var c=lmCv;if(!c||!document.body.contains(c)){lmCv=null;return;}
  var ctx=c.getContext("2d"),W=c.width,H=c.height,dpr=window.devicePixelRatio||1,s0=W/1000*LMAP.k;
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#0d1620";ctx.fillRect(0,0,W,H);
  ctx.setTransform(s0,0,0,s0,W/2-LMAP.cx*s0,H/2-LMAP.cy*s0);
  var bu=liveBaseUrl();
  if(bu){if(lmImgUrl!==bu){lmImgUrl=bu;lmImg=new Image();lmImg.crossOrigin="anonymous";lmImg.onload=function(){lmDraw();};lmImg.src=bu;}if(lmImg&&lmImg.complete&&lmImg.naturalWidth)ctx.drawImage(lmImg,0,0,1000,500);}
  if(!lmLand&&ttPath)lmLand=new Path2D(ttPath);
  if(lmLand){if(!bu||!(lmImg&&lmImg.naturalWidth)){ctx.fillStyle="#1c2a37";ctx.fill(lmLand);}ctx.strokeStyle=bu?"rgba(255,255,255,.35)":"#2f4253";ctx.lineWidth=0.6/s0*dpr;ctx.stroke(lmLand);}
  ctx.setTransform(1,0,0,1,0,0);
  var z=Math.max(1,Math.min(2.4,0.8+LMAP.k*0.12))*dpr,vis=function(p){return p[0]>-20&&p[0]<W+20&&p[1]>-20&&p[1]<H+20;};
  if(LYR.fires){ctx.fillStyle="rgba(255,154,61,.85)";LDATA.fires.forEach(function(f){var p=lmXY(f[0],f[1]);if(vis(p))ctx.fillRect(p[0]-1.5*z,p[1]-1.5*z,3*z,3*z);});}
  if(LMAP.q){ctx.strokeStyle="#c9a27a";ctx.lineWidth=1*dpr;live.quakes.forEach(function(e){var p=lmXY(e.lat,e.lng);if(!vis(p))return;ctx.beginPath();ctx.arc(p[0],p[1],(2+(e.mag-4)*2)*dpr,0,7);ctx.stroke();});}
  if(LYR.outages){ctx.strokeStyle="#a98af6";ctx.lineWidth=1.6*dpr;LDATA.outages.forEach(function(o){var p=lmXY(o.lat,o.lng);if(vis(p))ctx.strokeRect(p[0]-5*dpr,p[1]-5*dpr,10*dpr,10*dpr);});}
  var sel=LMAP.sel;
  if(sel&&sel.k==="p"&&TRAIL[sel.o.h]){var tr=TRAIL[sel.o.h].concat([drPos(sel.o.la,sel.o.lo,sel.o.gs,sel.o.trk,sel.o.t)]);ctx.strokeStyle="#ffd25a";ctx.lineWidth=2*dpr;ctx.beginPath();tr.forEach(function(q,i){var p=lmXY(q[0],q[1]);if(i)ctx.lineTo(p[0],p[1]);else ctx.moveTo(p[0],p[1]);});ctx.stroke();
    var a=drPos(sel.o.la,sel.o.lo,sel.o.gs,sel.o.trk,sel.o.t),pa=lmXY(a[0],a[1]);var fw=drPos(a[0],a[1],sel.o.gs*6,sel.o.trk,Date.now()-600e3);var pf=lmXY(fw[0],fw[1]);ctx.setLineDash([4*dpr,4*dpr]);ctx.beginPath();ctx.moveTo(pa[0],pa[1]);ctx.lineTo(pf[0],pf[1]);ctx.stroke();ctx.setLineDash([]);}
  if(LYR.planes){ctx.beginPath();LDATA.planes.forEach(function(a){if(a.gnd)return;var q=drPos(a.la,a.lo,a.gs,a.trk,a.t),p=lmXY(q[0],q[1]);if(vis(p))lmTri(p[0],p[1],a.trk,3.2*z,ctx);});ctx.fillStyle="rgba(255,255,255,.85)";ctx.fill();}
  if(LYR.ships&&LDATA.ships&&LDATA.ships.ships){ctx.beginPath();LDATA.ships.ships.forEach(function(x){var q=drPos(x[0],x[1],x[2],x[3],Date.parse(LDATA.ships.at)||Date.now()),p=lmXY(q[0],q[1]);if(vis(p))lmTri(p[0],p[1],x[3],3.6*z,ctx);});ctx.fillStyle="#4fc3e0";ctx.fill();}
  if(sel){var o=sel.o,q=sel.k==="p"?drPos(o.la,o.lo,o.gs,o.trk,o.t):drPos(o[0],o[1],o[2],o[3],Date.parse(LDATA.ships.at)||Date.now()),p=lmXY(q[0],q[1]);ctx.strokeStyle="#ffd25a";ctx.lineWidth=2*dpr;ctx.beginPath();ctx.arc(p[0],p[1],9*dpr,0,7);ctx.stroke();}
}
function lmResize(){var c=lmCv;if(!c)return;var dpr=window.devicePixelRatio||1,w=c.parentNode.clientWidth;var h=Math.min(w/2,Math.max(260,window.innerHeight*0.72));c.style.height=h+"px";c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);lmDraw();}
function lmFit(b){var x0=mx_(b[0][1]),x1=mx_(b[1][1]),y0=my_(b[1][0]),y1=my_(b[0][0]);LMAP.cx=(x0+x1)/2;LMAP.cy=(y0+y1)/2;var c=lmCv;var ar=c?c.height/c.width:0.5;LMAP.k=Math.min(1000/((x1-x0)*1.5),500/((y1-y0)*1.5)*(ar*2));lmClamp();lmDraw();}
function lmPick(px,py){var dpr=window.devicePixelRatio||1,best=null,bd=(12*dpr)*(12*dpr);
  if(LYR.ships&&LDATA.ships&&LDATA.ships.ships)LDATA.ships.ships.forEach(function(x){var q=drPos(x[0],x[1],x[2],x[3],Date.parse(LDATA.ships.at)||Date.now()),p=lmXY(q[0],q[1]),d=(p[0]-px)*(p[0]-px)+(p[1]-py)*(p[1]-py);if(d<bd){bd=d;best={k:"s",o:x};}});
  if(LYR.planes)LDATA.planes.forEach(function(a){if(a.gnd)return;var q=drPos(a.la,a.lo,a.gs,a.trk,a.t),p=lmXY(q[0],q[1]),d=(p[0]-px)*(p[0]-px)+(p[1]-py)*(p[1]-py);if(d<bd){bd=d;best={k:"p",o:a};}});
  if(!best&&LYR.outages)LDATA.outages.forEach(function(o){var p=lmXY(o.lat,o.lng),d=(p[0]-px)*(p[0]-px)+(p[1]-py)*(p[1]-py);if(d<bd){bd=d;best={k:"o",o:o};}});
  return best;}
function lmInfo(){var el=document.getElementById("lm-info");if(!el)return;var s=LMAP.sel;if(!s){el.hidden=true;return;}el.hidden=false;var h;
  if(s.k==="p"){var a=s.o;h='<div class="lmh"><b>✈ '+esc(a.cs||a.h.toUpperCase())+'</b><button type="button" class="btn ic" data-lmx="info" aria-label="'+esc(u("close"))+'">✕</button></div><div class="note">'+esc([a.ty,a.og].filter(Boolean).join(" · "))+'</div>'+
    '<div class="kp3"><span>'+esc(T2("Altitude","Altitude"))+'<b class="mono">'+(a.alt?Math.round(a.alt).toLocaleString()+" ft":"—")+'</b></span><span>'+esc(T2("Vitesse","Speed"))+'<b class="mono">'+Math.round(a.gs)+' kn</b></span><span>'+esc(T2("Cap","Heading"))+'<b class="mono">'+Math.round(a.trk)+'°</b></span></div>'+
    '<div class="note">'+esc(T2("Trajet jaune : positions vues depuis l'ouverture de la page · pointillé : 1 h de vol si le cap ne change pas.","Yellow trail: positions seen since you opened the page · dashed: 1 h ahead if the heading holds."))+'</div>'+
    '<div class="row-b">'+(a.cs?'<a class="btn" href="https://www.flightradar24.com/'+encodeURIComponent(a.cs)+'" target="_blank" rel="noopener">Flightradar24</a>':'')+'<a class="btn" href="https://globe.adsb.lol/?icao='+encodeURIComponent(a.h)+'" target="_blank" rel="noopener">'+esc(T2("Trajet complet (ADS-B)","Full track (ADS-B)"))+'</a></div>';}
  else if(s.k==="s"){var x=s.o;h='<div class="lmh"><b>⛴ '+esc(x[4]||"MMSI "+(x[5]||""))+'</b><button type="button" class="btn ic" data-lmx="info" aria-label="'+esc(u("close"))+'">✕</button></div><div class="kp3"><span>'+esc(T2("Vitesse","Speed"))+'<b class="mono">'+x[2]+' kn</b></span><span>'+esc(T2("Cap","Course"))+'<b class="mono">'+x[3]+'°</b></span><span>MMSI<b class="mono">'+esc(x[5]||"—")+'</b></span></div>'+(x[5]?'<div class="row-b"><a class="btn" href="https://www.marinetraffic.com/en/ais/details/ships/mmsi:'+encodeURIComponent(x[5])+'" target="_blank" rel="noopener">MarineTraffic</a></div>':'');}
  else {var o=s.o;h='<div class="lmh"><b>'+esc(o.name)+'</b><button type="button" class="btn ic" data-lmx="info" aria-label="'+esc(u("close"))+'">✕</button></div><div class="note">'+esc(o.cause+(o.type?" · "+o.type:""))+' · '+esc((o.start||"").slice(0,10))+'</div>'+(o.desc?'<p class="note" style="color:var(--ink)">'+esc(o.desc)+'</p>':'')+(o.url?'<a class="btn" href="'+esc(o.url)+'" target="_blank" rel="noopener">'+esc(T2("Source","Source"))+'</a>':'');}
  el.innerHTML=h;}
function lmCard(){var el=document.getElementById("lm-card");if(!el)return;var b=LMAP.box;if(!b||!LMAP.card){el.hidden=true;return;}el.hidden=false;
  var ais=LDATA.ships&&LDATA.ships.counts,c=ais?ais[b]||0:null,a=ais&&LDATA.ships.avg?LDATA.ships.avg[b]:null;
  el.innerHTML='<div class="lmh"><b>'+esc(tx(AIS_NAMES[b]).toUpperCase())+'</b><button type="button" class="btn ic" data-lmx="card" aria-label="'+esc(u("close"))+'">✕</button></div>'+
   '<div class="kp2"><div><span class="note">'+esc(T2("Navires visibles","Ships visible now"))+'</span><b class="mono"'+(a!=null&&a>4&&c<a*0.5?' style="color:var(--crit)"':'')+'>'+(c==null?"–":c)+'</b></div><div><span class="note">'+esc(T2("Jour normal","Normal day"))+'</span><b class="mono">'+(a==null?"–":a)+'</b></div></div>'+
   (LYR.ships&&LDATA.ships?'':'<p class="note">'+esc(LYR.ships&&LST.ships&&!LST.ships.ok?lyrMsg("ships"):T2("Activez « Navires » pour voir le trafic.","Turn on “Ships” to see traffic."))+'</p>')+
   (b==="hormuz"?'<p class="note" style="color:#ff9a9a">'+esc(T2("Brouillage GPS fréquent : beaucoup de navires coupent leur AIS ici.","Frequent GPS jamming: many ships switch AIS off here."))+'</p>':'');}
function liveMapPaint(){lmDraw();lmCard();lmInfo();var st=document.getElementById("lm-st");if(st)st.textContent=Object.keys(LYR).filter(function(k){return LYR[k]&&LST[k]&&LST[k].ok;}).map(function(k){return LST[k].m;}).join(" · ")||"—";}
function anaLive(el){
  if(!ttPath&&typeof d3!=="undefined"&&typeof topojson!=="undefined"){try{var topo=JSON.parse(document.getElementById("world").textContent);var fs=topojson.feature(topo,topo.objects.countries);ttPath=d3.geoPath(d3.geoEquirectangular().scale(1000/(2*Math.PI)).translate([500,250]))(fs);}catch(e){ttPath="";}}
  el.innerHTML='<div class="lmg"><aside class="card lml">'+anaH(T2("Couches en direct","Live layers"))+
   '<div class="seg">'+BASES.map(function(b){return '<button type="button" data-lb="'+b[0]+'" aria-pressed="'+(LBASE===b[0])+'">'+esc(tx(b[1]))+'</button>';}).join("")+'<button type="button" id="lm-3d">'+esc(T2("Globe 3D","3D globe"))+'</button></div>'+
   LYR_DEF.map(function(d){return '<label class="ly"><input type="checkbox" data-lly="'+d[0]+'"'+(LYR[d[0]]?" checked":"")+'><span><span style="color:'+d[2]+'">●</span> '+esc(tx(d[1]))+'<small id="lms-'+d[0]+'">'+esc(LYR[d[0]]&&LST[d[0]]?lyrMsg(d[0]):tx(d[3]))+'</small></span></label>';}).join("")+
   '<label class="ly"><input type="checkbox" id="lm-q"'+(LMAP.q?" checked":"")+'><span><span style="color:#c9a27a">○</span> '+esc(T2("Séismes ≥ M4,5","Earthquakes ≥ M4.5"))+'<small>USGS · 7 '+esc(T2("jours","days"))+'</small></span></label>'+
   '<div class="note">'+esc(T2("Aller à","Go to"))+'</div><div class="seg"><button type="button" data-box="" aria-pressed="'+(!LMAP.box)+'">'+esc(T2("Monde","World"))+'</button>'+Object.keys(BOXES).map(function(k){return '<button type="button" data-box="'+k+'" aria-pressed="'+(LMAP.box===k)+'">'+esc(tx(AIS_NAMES[k]))+'</button>';}).join("")+'</div>'+
   '<div id="lv-st" class="lvst"></div></aside>'+
   '<section class="card lmc"><div class="atop"><span class="ah"><h2>'+esc(T2("Monde · en direct","World · live"))+'</h2></span><span class="note" id="lm-st"></span></div>'+
   '<div class="lmw"><canvas id="lm-cv" aria-label="'+esc(T2("Carte en direct : molette ou pincement pour zoomer, glisser pour déplacer, cliquer sur un avion ou un navire","Live map: wheel or pinch to zoom, drag to pan, click a plane or ship"))+'"></canvas>'+
    '<div class="lmz"><button type="button" class="btn" data-z="1" aria-label="Zoom +">+</button><button type="button" class="btn" data-z="-1" aria-label="Zoom −">−</button><button type="button" class="btn" data-z="0" aria-label="'+esc(T2("Vue monde","World view"))+'">⤢</button></div>'+
    '<div class="lmo" id="lm-card" hidden></div><div class="lmo lmi" id="lm-info" hidden></div></div>'+
   '<div class="note lmleg"><span><span style="color:#4fc3e0">▲</span> '+esc(T2("Navires","Ships"))+'</span><span><span style="color:#fff">▲</span> '+esc(T2("Avions","Aircraft"))+'</span><span><span style="color:#ff9a3d">■</span> '+esc(T2("Feux","Fires"))+'</span><span><span style="color:#a98af6">□</span> '+esc(T2("Coupure d'internet","Internet outage"))+'</span><span><span style="color:#c9a27a">○</span> '+esc(T2("Séisme","Earthquake"))+'</span><span style="margin-left:auto">'+esc(T2("Positions estimées entre deux mises à jour (vitesse et cap)","Positions estimated between updates (speed and heading)"))+'</span></div></section></div>';
  lmCv=document.getElementById("lm-cv");lmResize();liveMapPaint();
  clearInterval(lmTimer);lmTimer=setInterval(function(){if(!lmCv||!document.body.contains(lmCv)){clearInterval(lmTimer);lmCv=null;return;}if(!document.hidden)lmDraw();},500);
  var cv=lmCv,pts={},drag=null,moved=false,pinch=null,dpr=function(){return window.devicePixelRatio||1;};
  function zoomAt(f,px,py){var a=lmInv(px,py);LMAP.k*=f;lmClamp();var b=lmInv(px,py);LMAP.cx+=a[0]-b[0];LMAP.cy+=a[1]-b[1];lmClamp();lmDraw();}
  cv.addEventListener("wheel",function(e){e.preventDefault();var r=cv.getBoundingClientRect();zoomAt(Math.exp(-e.deltaY*0.0018),(e.clientX-r.left)*dpr(),(e.clientY-r.top)*dpr());},{passive:false});
  cv.addEventListener("pointerdown",function(e){cv.setPointerCapture(e.pointerId);pts[e.pointerId]=[e.clientX,e.clientY];moved=false;var ids=Object.keys(pts);if(ids.length===1)drag=[e.clientX,e.clientY];else if(ids.length===2){var a=pts[ids[0]],b=pts[ids[1]];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])};drag=null;}});
  cv.addEventListener("pointermove",function(e){if(!pts[e.pointerId])return;pts[e.pointerId]=[e.clientX,e.clientY];var ids=Object.keys(pts),r=cv.getBoundingClientRect();
    if(ids.length===2&&pinch){var a=pts[ids[0]],b=pts[ids[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch.d){zoomAt(d/pinch.d,((a[0]+b[0])/2-r.left)*dpr(),((a[1]+b[1])/2-r.top)*dpr());}pinch.d=d;moved=true;return;}
    if(drag){var dx=e.clientX-drag[0],dy=e.clientY-drag[1];if(Math.abs(dx)+Math.abs(dy)>3)moved=true;var s0=cv.width/1000*LMAP.k/dpr();LMAP.cx-=dx/s0;LMAP.cy-=dy/s0;lmClamp();drag=[e.clientX,e.clientY];lmDraw();}});
  function up(e){var r=cv.getBoundingClientRect();if(!moved&&Object.keys(pts).length===1){var hit=lmPick((e.clientX-r.left)*dpr(),(e.clientY-r.top)*dpr());LMAP.sel=hit;lmInfo();lmDraw();}delete pts[e.pointerId];if(Object.keys(pts).length<2)pinch=null;drag=null;}
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",function(e){delete pts[e.pointerId];drag=null;pinch=null;});
  cv.style.touchAction="none";
  el.querySelectorAll("[data-z]").forEach(function(b){b.onclick=function(){var z=+b.dataset.z;if(!z){LMAP.k=1;LMAP.cx=500;LMAP.cy=250;LMAP.box=null;el.querySelectorAll("[data-box]").forEach(function(x){x.setAttribute("aria-pressed",x.dataset.box==="");});lmCard();lmDraw();return;}zoomAt(z>0?1.6:1/1.6,cv.width/2,cv.height/2);};});
  el.addEventListener("click",function(e){var x=e.target.closest("[data-lmx]");if(!x)return;if(x.dataset.lmx==="card"){LMAP.card=false;lmCard();}else{LMAP.sel=null;lmInfo();lmDraw();}});
  el.querySelectorAll("[data-lly]").forEach(function(c){c.onchange=function(){var k=c.dataset.lly;LYR[k]=c.checked;lyrSave();if(LYR[k]&&(!LST[k]||!LST[k].ok))lyrLoad(k);var sm=document.getElementById("lms-"+k);if(sm)sm.textContent=LYR[k]&&LST[k]?lyrMsg(k):tx(LYR_DEF.filter(function(d){return d[0]===k;})[0][3]);liveMapPaint();if(G){lyrApply();refreshGlobe();}};});
  document.getElementById("lm-q").onchange=function(e){LMAP.q=e.target.checked;lmDraw();};
  el.querySelectorAll("[data-lb]").forEach(function(b){b.onclick=function(){LBASE=b.dataset.lb;lyrSave();if(G)setBase(LBASE);el.querySelectorAll("[data-lb]").forEach(function(x){x.setAttribute("aria-pressed",x===b);});lmDraw();};});
  el.querySelectorAll("[data-box]").forEach(function(b){b.onclick=function(){var k=b.dataset.box;el.querySelectorAll("[data-box]").forEach(function(x){x.setAttribute("aria-pressed",x===b);});
    if(!k){LMAP.box=null;LMAP.k=1;LMAP.cx=500;LMAP.cy=250;lmCard();lmDraw();return;}LMAP.box=k;LMAP.card=true;lmCard();lmFit(BOXES[k]);};});
  document.getElementById("lm-3d").onclick=function(){showTab("globe");setTimeout(function(){lyrOpen(true);},200);};
  Object.keys(LYR).forEach(function(k){if(LYR[k]&&!LST[k])lyrLoad(k);});
  relayCfg=null;relayCfgP().then(function(j){var b=document.getElementById("lv-st");if(!b||!j)return;var rows=[[T2("Avions (mondial)","Planes (worldwide)"),j.planesGlobal,"OPENSKY"],[T2("Navires","Ships"),j.ships,"AISSTREAM"],[T2("Coupures d'internet","Internet outages"),j.outages,"RADAR"],[T2("Feux","Fires"),j.fires,"FIRMS"],[T2("Attention médiatique","Media attention"),j.attention,"KV"]];
    b.innerHTML='<div class="note">'+esc(T2("État du relais","Relay status"))+'</div>'+rows.map(function(r){return '<div class="lvr"><span>'+esc(r[0])+'</span><span class="badge'+(r[1]?' okb':' warn')+'">'+esc(r[1]?T2("PRÊT","READY"):r[2]+T2(" À AJOUTER"," NEEDED"))+'</span></div>';}).join("")+(j.planesGlobal?'':'<p class="note">'+esc(T2("Sans OpenSky : avions autour de 28 grands aéroports et zones sensibles seulement.","Without OpenSky: planes around 28 major airports and hotspots only."))+'</p>');});
}
window.addEventListener("resize",function(){if(lmCv)lmResize();});

/* ===== Global Risk Index history ===== */
var griHist=null,griHistAt=0,griRange=7;try{griRange=+localStorage.getItem("gra-grir")||7;}catch(e){}
function griLocal(){try{return JSON.parse(localStorage.getItem("gra-grih3")||"[]");}catch(e){return [];}}
function griRecord(g){
  if(performance.now()<45000)return; /* wait until the live feeds have loaded */
  var hk=new Date().toISOString().slice(0,13)+":00Z",loc=griLocal();
  if(loc.length&&loc[loc.length-1][0]===hk)return;
  loc.push([hk,Math.round(g.tot*10)/10]);if(loc.length>2200)loc=loc.slice(-2200);
  try{localStorage.setItem("gra-grih3",JSON.stringify(loc));}catch(e){}
  if(/^https?:$/.test(location.protocol))try{fetch(orderedBases()[0]+"/gri?s=3&v="+g.tot.toFixed(1),{mode:"cors"}).catch(function(){});}catch(e){}
  griHistAt=0;if(document.getElementById("gri-hist"))drawGriHist();
}
function loadGriHist(){if(griHist&&Date.now()-griHistAt<15*60e3)return Promise.resolve(griHist);
  return relay("gri?s=3&days=90",12000).then(function(j){return j.points||[];},function(){return [];}).then(function(srv){
    var m={};griLocal().forEach(function(p){m[p[0]]=p[1];});srv.forEach(function(p){m[p[0]]=p[1];});
    griHist=Object.keys(m).sort().map(function(k){return [Date.parse(k),m[k]];});griHistAt=Date.now();return griHist;});}
function drawGriHist(){
  var el=document.getElementById("gri-hist");if(!el)return;
  if(!el.firstChild)el.innerHTML='<p class="note">'+esc(u("loading"))+'</p>';
  loadGriHist().then(function(all){el=document.getElementById("gri-hist");if(!el)return;
    var now=Date.now(),g=griLast||computeGRI(),from=now-griRange*864e5;
    var pts=all.filter(function(p){return p[0]>=from;});pts.push([now,Math.round(g.tot*10)/10]);
    var W=Math.max(320,Math.round(el.clientWidth-32)),H=200,pl=34,pr=12,pt=10,pb=26,y0=20,y1=100;
    var vals=pts.map(function(p){return p[1];});var lo=Math.min.apply(null,vals),hi=Math.max.apply(null,vals);y0=Math.max(0,Math.floor((lo-8)/10)*10);y1=Math.min(100,Math.ceil((hi+8)/10)*10);if(y1-y0<30){y1=Math.min(100,y0+30);}
    var X=function(t){return pl+(t-from)/(now-from)*(W-pl-pr);},Y=function(v){return pt+(1-(v-y0)/(y1-y0))*(H-pt-pb);};
    var bands=[[0,40,"#5fd39a"],[40,60,"#ffd25a"],[60,75,"#ff9a3d"],[75,100,"#ff5c4d"]].map(function(b){var a=Math.max(b[0],y0),c=Math.min(b[1],y1);if(c<=a)return "";return '<rect x="'+pl+'" y="'+Y(c).toFixed(1)+'" width="'+(W-pl-pr)+'" height="'+(Y(a)-Y(c)).toFixed(1)+'" fill="'+b[2]+'" opacity=".07"/>';}).join("");
    var grid="";for(var v=y0;v<=y1;v+=10)grid+='<line x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'" stroke="#1f2c39"/><text x="'+(pl-6)+'" y="'+(Y(v)+4).toFixed(1)+'" text-anchor="end" font-size="11" fill="#8c9aa8" font-family="JetBrains Mono,monospace">'+v+'</text>';
    var ticks="",nT=Math.max(3,Math.min(griRange<=2?4:griRange<=7?7:6,Math.floor(W/90)));for(var i=0;i<=nT;i++){var t=from+(now-from)*i/nT;var d=new Date(t);ticks+='<text x="'+X(t).toFixed(1)+'" y="'+(H-6)+'" text-anchor="'+(i===0?"start":i===nT?"end":"middle")+'" font-size="11" fill="#8c9aa8" font-family="JetBrains Mono,monospace">'+esc(griRange<=2?d.toLocaleTimeString(L==="fr"?"fr-FR":"en-GB",{hour:"2-digit",minute:"2-digit"}):d.toLocaleDateString(L==="fr"?"fr-FR":"en-GB",(L==="fr"||L==="en")?{day:"numeric",month:"short"}:{day:"numeric",month:"numeric"}))+'</text>';}
    /* break the line where there is a gap of more than 3 hours */
    var path="",prev=null;pts.forEach(function(p){path+=(prev&&p[0]-prev[0]<3*3600e3?"L":"M")+X(p[0]).toFixed(1)+" "+Y(p[1]).toFixed(1)+" ";prev=p;});
    var dots=pts.length<60?pts.map(function(p){return '<circle cx="'+X(p[0]).toFixed(1)+'" cy="'+Y(p[1]).toFixed(1)+'" r="3" fill="'+(p[1]<40?"#5fd39a":p[1]<60?"#ffd25a":p[1]<75?"#ff9a3d":"#ff5c4d")+'"><title>'+esc(new Date(p[0]).toLocaleString(L==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}))+' · '+p[1]+'</title></circle>';}).join(""):"";
    function ago(h){var t=now-h*3600e3,b=null;all.forEach(function(p){if(Math.abs(p[0]-t)<2*3600e3&&(!b||Math.abs(p[0]-t)<Math.abs(b[0]-t)))b=p;});return b;}
    var d1=ago(24),d7=ago(168);
    function chg(b,l){if(!b)return '<span><small>'+esc(l)+'</small><b class="mono" style="color:var(--muted)">—</b></span>';var dv=g.tot-b[1];return '<span><small>'+esc(l)+'</small><b class="mono" style="color:'+(dv>0.5?"var(--crit)":dv<-0.5?"var(--ok)":"var(--ink)")+'">'+(dv>0?"+":dv<0?"−":"±")+nf(Math.abs(dv),1)+'</b></span>';}
    var first=all.length?new Date(all[0][0]):null;
    el.innerHTML='<div class="ah"><h2>'+esc(T2("Historique de P : chance d'un nouveau choc mondial","History of P: chance of a new global shock"))+'</h2><div class="seg">'+[[2,"48 h"],[7,T2("7 j","7 d")],[30,T2("30 j","30 d")],[90,T2("90 j","90 d")]].map(function(r){return '<button type="button" data-grr="'+r[0]+'" aria-pressed="'+(griRange===r[0])+'">'+r[1]+'</button>';}).join("")+'</div></div>'+
     '<div class="ghc">'+chg(d1,T2("vs il y a 24 h","vs 24 h ago"))+chg(d7,T2("vs il y a 7 j","vs 7 days ago"))+'<span><small>'+esc(T2("Min · max de la période","Period low · high"))+'</small><b class="mono">'+nf(lo,0)+' · '+nf(hi,0)+'</b></span></div>'+
     '<svg viewBox="0 0 '+W+' '+H+'" class="ghs" role="img" aria-label="'+esc(T2("Courbe de l'indice mondial des risques","Global Risk Index curve"))+'">'+bands+grid+'<path d="'+path+'" fill="none" stroke="#7fd1ff" stroke-width="2.2" stroke-linejoin="round"/>'+dots+'<circle cx="'+X(now).toFixed(1)+'" cy="'+Y(g.tot).toFixed(1)+'" r="5" fill="'+g.col+'" stroke="#0a1018" stroke-width="2"/>'+ticks+'</svg>'+
     '<p class="note">'+esc(all.length<3?T2("L'enregistrement vient de commencer : un point par heure, la courbe se remplit au fil du temps.","Recording has just started: one point per hour, the curve fills in over time."):T2("Un point par heure depuis le ","One point per hour since ")+first.toLocaleDateString(L==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short",year:"numeric"})+T2(" (médiane des navigateurs ouverts). P ne bouge que lorsque les fourchettes des questions sont mises à jour."," (median across open browsers). P only moves when the question bands are updated."))+'</p>';
    el.querySelectorAll("[data-grr]").forEach(function(b){b.onclick=function(){griRange=+b.dataset.grr;try{localStorage.setItem("gra-grir",griRange);}catch(e){}drawGriHist();};});
  });
}
var _drawDash0=drawDash;drawDash=function(){_drawDash0();drawGriHist();};
window.addEventListener("resize",function(){clearTimeout(drawGriHist.t);drawGriHist.t=setTimeout(function(){if(document.getElementById("gri-hist"))drawGriHist();},200);});
