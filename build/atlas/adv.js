
/* ===== Advanced features: my risk, market odds, live history, early-warning signals, embed, printable reports ===== */

/* ---------- 1. My risk: personal exposure ---------- */
var SECTORS={
 household:{n:{fr:"Foyer (budget, énergie, nourriture)",en:"Household (budget, energy, food)"},ids:["inflation","oil","eu-gas","food","grid","heat","fr-households"]},
 energy:{n:{fr:"Énergie & carburants",en:"Energy & fuels"},d:["energy"],ids:["hormuz","iran-war"]},
 food:{n:{fr:"Agriculture & alimentation",en:"Farming & food"},d:["food"],ids:["fertilizer","el-nino","heat"]},
 transport:{n:{fr:"Transport & logistique",en:"Transport & logistics"},ids:["hormuz","bab","freight","oil","houthis","scs","trade","space"]},
 manuf:{n:{fr:"Industrie & électronique",en:"Manufacturing & electronics"},ids:["chips","minerals","trade","freight","eu-gas","global-growth","taiwan"]},
 tech:{n:{fr:"Numérique & télécoms",en:"Digital & telecoms"},d:["hybrid"],ids:["chips","ai","space","grid","taiwan"]},
 finance:{n:{fr:"Finance & marchés",en:"Finance & markets"},d:["econ"],ids:["us-politics","oil"]},
 health:{n:{fr:"Santé",en:"Health"},d:["health"],ids:["heat"]},
 travel:{n:{fr:"Tourisme & voyages",en:"Tourism & travel"},ids:["heat","wildfires","cyclones","ebola","mpox","h5n1","lebanon","iran-war","global-growth","oil"]},
 public:{n:{fr:"Secteur public & sécurité",en:"Public sector & security"},ids:["hybrid","disinfo","grid","cables","migration","displacement","alliance","aid-cuts","baltic"]}};
var MY=(function(){try{return JSON.parse(localStorage.getItem("gra-my")||"null");}catch(e){return null;}})();
function myDefault(){var c="250";try{if(typeof AREA!=="undefined"&&AREA&&AREA.cc&&ISO2N[String(AREA.cc).toUpperCase()])c=ISO2N[String(AREA.cc).toUpperCase()];}catch(e){}return {c:c,sec:["household"],sup:[]};}
if(!MY)MY=myDefault();
function mySave(){try{localStorage.setItem("gra-my",JSON.stringify(MY));}catch(e){}}
var EXPC={};
function ctryExp(code){if(EXPC[code])return EXPC[code];if(!anaCountry.cc){anaCountry.cc={};NODES.forEach(function(n){anaCountry.cc[n.id]=computeCascade(n.id);});}
  var direct=NODES.filter(function(n){return n.c.indexOf(code)>=0;}),out={};
  NODES.forEach(function(n){var best=null;direct.forEach(function(d){var imp=n.id===d.id?1:((anaCountry.cc[n.id][d.id]||{}).imp||0);if(imp&&(!best||imp>best.imp))best={imp:imp,via:d.id};});if(best)out[n.id]=best;});
  EXPC[code]=out;return out;}
function myCompute(){var home=ctryExp(MY.c),sup=MY.sup.map(function(c){return [c,ctryExp(c)];}),secIds={};
  MY.sec.forEach(function(s){var S=SECTORS[s];if(!S)return;(S.ids||[]).forEach(function(i){secIds[i]=secIds[i]||s;});NODES.forEach(function(n){if((S.d||[]).indexOf(n.d)>=0)secIds[n.id]=secIds[n.id]||s;});});
  var rows=[];NODES.forEach(function(n){var q=QUESTIONS[n.id];if(!q||q.kind==="ended"||n.id==="fr-households")return;var r=0,why=null;
    var h=home[n.id];if(h&&h.imp>r){r=h.imp;why={k:"home",via:h.via};}
    sup.forEach(function(x){var e=x[1][n.id];if(e&&e.imp*0.8>r){r=e.imp*0.8;why={k:"sup",c:x[0],via:e.via};}});
    if(secIds[n.id]&&0.7>r){r=0.7;why={k:"sec",s:secIds[n.id]};}
    if(r<0.15)return;var p=qMid(q)/100;rows.push({id:n.id,r:r,p:p,s:r*p*n.sv/5,why:why,q:q});});
  rows.sort(function(a,b){return b.s-a.s;});
  var occ=rows.filter(function(x){return x.q.kind==="occur"&&x.r>=0.5&&x.q.sys;}),likely=rows.filter(function(x){return x.q.kind==="occur"&&x.r>=0.5&&x.p>=0.66;}),run=rows.filter(function(x){return x.q.kind==="persist"&&x.r>=0.5;});
  var chance=null;if(MC&&MC.c&&MC.G){var G=MC.G,S=MC.c.S,m=G.m,n=MC.c.n,ix=occ.map(function(x){return G.ix[x.id];}).filter(function(i){return i!=null;}),c=0;for(var d=0;d<n;d++){for(var j=0;j<ix.length;j++)if(S[d*m+ix[j]]){c++;break;}}chance=100*c/n;}
  var ind=100*(1-occ.reduce(function(a,x){return a*(1-x.p);},1));
  return {rows:rows,occ:occ,run:run,likely:likely,chance:chance,ind:ind};}
function whyTxt(w,id){if(!w)return "";if(w.k==="home")return T2("votre pays","your country")+" · "+(w.via===id?T2("direct","direct"):w.via==="fr-households"?T2("par le coût de la vie","through the cost of living"):T2("via ","via ")+tx(byId[w.via].t));
  if(w.k==="sup")return T2("fournisseur/marché : ","supplier/market: ")+cName(w.c)+" · "+(w.via===id?T2("direct","direct"):T2("via ","via ")+tx(byId[w.via].t));return T2("votre secteur : ","your sector: ")+tx(SECTORS[w.s].n);}
function ctryOpts(sel){return Object.keys(ISO).filter(function(k){return ISO[k][3];}).sort(function(a,b){return cName(a).localeCompare(cName(b),LOC());}).map(function(k){return '<option value="'+k+'"'+(k===sel?" selected":"")+'>'+esc(cName(k))+'</option>';}).join("");}
function anaMy(el){var R=myCompute();
  var form='<div class="card my-f"><div class="ah"><h2>'+esc(T2("Mon risque","My risk"))+'</h2><span class="note">'+esc(T2("Enregistré dans ce navigateur, jamais envoyé","Saved in this browser, never sent"))+'</span></div>'+
   '<div class="my-g"><label>'+esc(T2("Pays où vous vivez","Country you live in"))+'<select id="my-c">'+ctryOpts(MY.c)+'</select></label>'+
   '<label>'+esc(T2("Pays fournisseurs ou marchés (jusqu'à 5)","Supplier or market countries (up to 5)"))+'<span class="my-sup">'+MY.sup.map(function(c){return '<button type="button" class="chip" data-mysx="'+c+'">'+esc(cName(c))+' ✕</button>';}).join("")+(MY.sup.length<5?'<select id="my-s"><option value="">'+esc(T2("+ ajouter…","+ add…"))+'</option>'+ctryOpts("")+'</select>':'')+'</span></label></div>'+
   '<div class="my-sec">'+Object.keys(SECTORS).map(function(k){return '<label class="chip'+(MY.sec.indexOf(k)>=0?" on":"")+'"><input type="checkbox" data-mysec="'+k+'"'+(MY.sec.indexOf(k)>=0?" checked":"")+'> '+esc(tx(SECTORS[k].n))+'</label>';}).join("")+'</div></div>';
  var kp='<div class="mts"><div class="mt"><b class="mono">'+(R.chance==null?Math.round(R.ind):Math.round(R.chance))+' %</b><span>'+esc(T2("chance qu'un nouveau choc mondial qui vous concerne survienne d'ici un an","chance that a new global shock relevant to you starts within a year"))+'</span><small>'+R.occ.length+' '+esc(T2("chocs mondiaux possibles : ","possible global shocks: "))+R.occ.map(function(x){return esc(tx(byId[x.id].t));}).join(", ")+(R.chance!=null?' · '+esc(T2("réseau lié ; si indépendants : ","linked network; if independent: "))+Math.round(R.ind)+' %':'')+'</small></div>'+
   '<div class="mt"><b class="mono">'+R.run.length+'</b><span>'+esc(T2("crises déjà en cours qui vous touchent","crises already under way that affect you"))+'</span><small>'+R.run.slice(0,3).map(function(x){return esc(tx(byId[x.id].t));}).join(" · ")+'</small></div>'+
   '<div class="mt"><b class="mono">'+R.likely.length+'</b><span>'+esc(T2("événements probables (≥ 66 %) qui vous concernent","likely events (66 % or more) that concern you"))+'</span><small>'+R.likely.slice(0,3).map(function(x){return esc(tx(byId[x.id].t));}).join(" · ")+'</small></div>'+'<div class="mt"><b class="mono">'+R.rows.length+'</b><span>'+esc(T2("risques suivis qui vous concernent","tracked risks that concern you"))+'</span><small>'+esc(T2("sur ","of "))+NODES.length+'</small></div></div>';
  var list='<div class="card"><div class="ah"><h2>'+esc(T2("Ce qui vous expose le plus","What exposes you most"))+'</h2><span class="note">'+esc(T2("pertinence × probabilité × gravité","relevance × chance × severity"))+'</span></div>'+R.rows.slice(0,15).map(function(x){var n=byId[x.id];
    return '<div class="my-r" data-go="'+x.id+'"><span><span style="color:'+col(n)+'">●</span> <b>'+esc(tx(n.t))+'</b><small>'+esc(tx(x.q.q))+'</small><small class="my-w">'+esc(whyTxt(x.why,x.id))+'</small></span><span class="xb"><i style="width:'+Math.round(x.r*100)+'%;background:'+col(n)+'"></i></span><b class="mono">'+(x.q.kind==="persist"?esc(T2("en cours","under way"))+' · ':'')+x.q.lo+'–'+x.q.hi+' %</b></div>';}).join("")+
   '<p class="note">'+esc(T2("Pertinence : 100 % si le risque touche votre pays directement, la part qui arrive par les liens sinon ; × 0,8 pour un pays fournisseur ; 70 % pour votre secteur. La chance d'un nouveau choc est simulée sur le réseau lié, avec les mêmes tirages que le niveau.","Relevance: 100 % if the risk hits your country directly, otherwise the share that reaches it through the links; × 0.8 for a supplier country; 70 % for your sector. The chance of a new shock is simulated on the linked network, with the same draws as the level."))+'</p>'+
   '<div class="row-b"><button type="button" class="btn" data-rep="my">⎙ '+esc(T2("Imprimer mon rapport (PDF)","Print my report (PDF)"))+'</button><button type="button" class="btn" data-kit="1">'+esc(T2("Ouvrir la réserve 14 jours","Open the 14-day reserve"))+'</button></div></div>';
  el.innerHTML=form+kp+list;
  var g=function(id){return document.getElementById(id);};
  g("my-c").onchange=function(){MY.c=this.value;mySave();anaMy(el);};
  if(g("my-s"))g("my-s").onchange=function(){if(this.value&&MY.sup.indexOf(this.value)<0&&this.value!==MY.c)MY.sup.push(this.value);mySave();anaMy(el);};
  el.querySelectorAll("[data-mysx]").forEach(function(b){b.onclick=function(e){e.stopPropagation();MY.sup=MY.sup.filter(function(c){return c!==b.dataset.mysx;});mySave();anaMy(el);};});
  el.querySelectorAll("[data-mysec]").forEach(function(c){c.onchange=function(){var k=c.dataset.mysec;MY.sec=MY.sec.filter(function(x){return x!==k;});if(c.checked)MY.sec.push(k);mySave();anaMy(el);};});}
ANA_SUBS.splice(1,0,["my",{fr:"Mon risque",en:"My risk"}]);

/* ---------- 2. Live market odds next to the questions ---------- */
var MKT_MAP={taiwan:[["taiwan"],["blockade","invade","invasion","attack","military","war"]],korea:[["korea"],["war","clash","strike","military","attack","invade"]],"india-pak":[["india","pakistan"],[]],baltic:[["nato"],["russia"]],
 "ukr-war":[["ukraine"],["ceasefire","peace","war end"]],"iran-war":[["iran"],["strike","war","ceasefire","israel","regime"]],ai:[["nasdaq"],[]],oil:[["oil"],["brent","wti","$1","price"]],gaza:[["gaza"],["ceasefire","war"]],
 "global-growth":[["recession"],[]],inflation:[["inflation"],[]],h5n1:[["h5n1","bird flu"],[]],"us-politics":[["midterm","house","senate","congress"],["democrat","republican","control","win"]],venezuela:[["venezuela"],["election","maduro"]],sudan:[["sudan"],["ceasefire","war"]]};
var QMKT={},qmktAt=0;
function qmktLoad(){if(qmktAt&&Date.now()-qmktAt<600000)return;qmktAt=Date.now();
  relay("poly?closed=false&active=true&limit=500&order=volume24hr&ascending=false",15000).then(function(j){var evs=Array.isArray(j)?j:(j.data||[]);var out={};
    Object.keys(MKT_MAP).forEach(function(id){var all=MKT_MAP[id][0],any=MKT_MAP[id][1];var best=null;
      evs.forEach(function(ev){(ev.markets||[]).forEach(function(m){if(m.closed)return;var t=((ev.title||"")+" "+(m.question||"")).toLowerCase();
        var okAll=id==="h5n1"||id==="us-politics"?all.some(function(w){return t.indexOf(w)>=0;}):all.every(function(w){return t.indexOf(w)>=0;});if(!okAll)return;if(any.length&&!any.some(function(w){return t.indexOf(w)>=0;}))return;
        var pr=m.outcomePrices;try{if(typeof pr==="string")pr=JSON.parse(pr);}catch(e){pr=null;}var p=pr&&pr.length?parseFloat(pr[0]):NaN;if(isNaN(p))return;var v=+m.volume||+ev.volume||0;
        if(!best||v>best.vol)best={q:m.question||ev.title,p:p,vol:v,end:(m.endDate||ev.endDate||"").slice(0,10),url:"https://polymarket.com/event/"+ev.slug};});});
      if(best&&best.vol>=10000)out[id]=best;});
    QMKT=out;if(typeof anaSub!=="undefined"&&tab==="ana"&&anaSub==="questions")drawAna();},function(){});}
function fmtVol(v){return v>=1e6?"$"+nf(v/1e6,1)+" M":v>=1e3?"$"+nf(v/1e3,0)+" k":"$"+Math.round(v);}
function mktLine(id){var m=QMKT[id];if(!m)return "";return '<a class="qmk" href="'+esc(m.url)+'" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="badge" style="background:#7fd1ff;color:#0a1018;border-color:#7fd1ff">'+esc(T2("MARCHÉ","MARKET"))+'</span> '+esc(m.q)+' · <b>'+Math.round(m.p*100)+' %</b> · '+fmtVol(m.vol)+(m.end?' · '+esc(m.end):'')+' ↗</a>';}
(function(){var o=qRow;qRow=function(id,opt){var h=o(id,opt);if(!opt||!opt.res||!QMKT[id])return h;var i=h.lastIndexOf("</div>");return h.slice(0,i)+'<span class="qmw">'+mktLine(id)+'</span>'+h.slice(i);};})();
(function(){var o=renderPanel;renderPanel=function(){o();if(!sel||!QMKT[sel])return;var b=document.querySelector("#panel .qbox");if(b&&!b.querySelector(".qmk")){var d=document.createElement("div");d.innerHTML='<small class="note">'+esc(T2("Marché prédictif apparenté (référence, formulation différente) :","Related prediction market (reference, its own wording):"))+'</small>'+mktLine(sel);b.appendChild(d);}};})();
setTimeout(qmktLoad,3000);document.addEventListener("click",function(e){if(e.target.closest('button[data-t="ana"]')||e.target.closest('[data-as="questions"]'))qmktLoad();});

/* ---------- 3. History & replay of live metrics ---------- */
var SNAPS=null,snapsAt=0,histSer="p",histIx=-1;
function snapsLoad(cb){if(SNAPS&&Date.now()-snapsAt<900000){cb&&cb();return;}relay("snaps?days=30",15000).then(function(j){SNAPS=j.points||[];snapsAt=Date.now();cb&&cb();},function(){SNAPS=SNAPS||[];cb&&cb();});}
function histSeries(){var s=[["p",T2("P : chance d'un nouveau choc mondial (%)","P: chance of a new global shock (%)")],["sh",T2("Navires suivis (monde)","Ships tracked (world)")],["pl",T2("Avions (OpenSky)","Aircraft (OpenSky)")],["hl",T2("Titres du jour (cumul)","Headlines today (running total)")]];
  Object.keys(BOXES).forEach(function(b){s.push(["st."+b,T2("Navires : ","Ships: ")+tx(AIS_NAMES[b])]);});return s;}
function histVal(pt,k){var o=pt[1];if(k.indexOf("st.")===0)return o.st?o.st[k.slice(3)]:null;var v=o[k];return v==null?null:v;}
function histCard(){if(!SNAPS)return '<p class="note">'+esc(u("loading"))+'</p>';var pts=SNAPS;
  var sel_='<select id="hs-s">'+histSeries().map(function(s){return '<option value="'+s[0]+'"'+(s[0]===histSer?" selected":"")+'>'+esc(s[1])+'</option>';}).join("")+'</select>';
  if(pts.length<2)return '<div class="ah"><h2>'+esc(T2("Historique et relecture","History and replay"))+'</h2>'+sel_+'</div><p class="note">'+esc(T2("L'enregistrement a commencé : un point par heure. La courbe et la relecture apparaissent après quelques heures.","Recording has started: one point an hour. The chart and replay appear after a few hours."))+'</p>';
  var vals=pts.map(function(p){return histVal(p,histSer);}),ok=vals.filter(function(v){return v!=null;});var W=800,H=150,pd=26,mx=Math.max.apply(null,ok.concat([1])),mn=Math.min.apply(null,ok.concat([0]));if(histSer==="p"){mn=0;mx=Math.max(60,mx);}
  var X=function(i){return pd+(W-pd-8)*i/(pts.length-1);},Y=function(v){return H-18-(H-30)*(v-mn)/((mx-mn)||1);};
  var d="";vals.forEach(function(v,i){if(v==null)return;d+=(d?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1);});
  if(histIx<0||histIx>=pts.length)histIx=pts.length-1;var cur=pts[histIx];
  var days={};pts.forEach(function(p,i){var dd=p[0].slice(0,10);if(!(dd in days))days[dd]=i;});
  var ticks=Object.keys(days).filter(function(x,i,a){return a.length<=10||i%Math.ceil(a.length/8)===0;}).map(function(dd){var i=days[dd];return '<text x="'+X(i).toFixed(1)+'" y="'+(H-3)+'" font-size="10" fill="#8c9aa8" text-anchor="middle">'+esc(new Date(dd+"T12:00:00Z").toLocaleDateString(LOC(),{day:"numeric",month:"short"}))+'</text>';}).join("");
  var svg='<svg viewBox="0 0 '+W+' '+H+'" class="hs-svg" role="img" aria-label="'+esc(T2("Courbe","Chart"))+'"><text x="2" y="12" font-size="10" fill="#8c9aa8">'+esc(fmtN(mx))+'</text><text x="2" y="'+(H-20)+'" font-size="10" fill="#8c9aa8">'+esc(fmtN(mn))+'</text><path d="'+d+'" fill="none" stroke="#7fd1ff" stroke-width="2"/><line x1="'+X(histIx).toFixed(1)+'" x2="'+X(histIx).toFixed(1)+'" y1="6" y2="'+(H-16)+'" stroke="#ffb547" stroke-dasharray="3 3"/>'+ticks+'</svg>';
  var c=cur[1],st=c.st||{};
  var read='<div class="hs-read"><b class="mono">'+esc(new Date(cur[0]).toLocaleString(LOC(),{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}))+'</b>'+
   [["P",c.p!=null?Math.round(c.p)+" %":"—"],[T2("Navires","Ships"),c.sh!=null?fmtN(c.sh):"—"],[T2("Avions","Aircraft"),c.pl!=null?fmtN(c.pl):"—"],[T2("Titres","Headlines"),c.hl!=null?fmtN(c.hl):"—"]].concat(Object.keys(BOXES).map(function(b){return [tx(AIS_NAMES[b]),st[b]!=null?st[b]:"—"];})).map(function(x){return '<span><small>'+esc(x[0])+'</small><b class="mono">'+x[1]+'</b></span>';}).join("")+'</div>';
  if(histCard.part)return {svg:svg,read:read};return '<div class="ah"><h2>'+esc(T2("Historique et relecture","History and replay"))+'</h2>'+sel_+'</div><div id="hs-plot">'+svg+'</div><input type="range" id="hs-r" min="0" max="'+(pts.length-1)+'" value="'+histIx+'" aria-label="'+esc(T2("Relecture","Replay"))+'" style="width:100%"><div id="hs-rd">'+read+'</div>'+'<p class="note">'+esc(T2("Un point par heure, enregistré par votre relais : glissez pour revoir l'état du monde à un moment donné.","One point an hour, recorded by your relay: slide to see the state of the world at any moment."))+'</p>';}
function fmtN(v){return v==null?"—":(Math.round(v)).toLocaleString(LOC());}
function histDraw(){var el=document.getElementById("hs-card");if(!el)return;el.innerHTML=histCard();var s=document.getElementById("hs-s"),r=document.getElementById("hs-r");
  if(s)s.onchange=function(){histSer=this.value;histDraw();};if(r)r.oninput=function(){histIx=+this.value;histCard.part=true;var x=histCard();histCard.part=false;if(x&&x.svg){document.getElementById("hs-plot").innerHTML=x.svg;document.getElementById("hs-rd").innerHTML=x.read;}};}

/* ---------- 4. Early-warning signals ---------- */
function median(a){var b=a.filter(function(x){return x!=null;}).sort(function(x,y){return x-y;});if(!b.length)return null;var m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2;}
function sigCompute(){var P=SNAPS||[];if(P.length<2)return {ready:false,list:[]};var first=Date.parse(P[0][0]),span=(Date.now()-first)/864e5;var out=[],last=P[P.length-1],now=last[1],wk=P.filter(function(p){return Date.parse(p[0])>Date.now()-7*864e5&&p!==last;});
  if(span>=3){Object.keys(BOXES).forEach(function(b){var md=median(wk.map(function(p){return p[1].st?p[1].st[b]:null;})),c=now.st?now.st[b]:null;if(md!=null&&md>=5&&c!=null&&c<md*0.5)out.push({k:"ship",id:b,sev:2,t:T2("Trafic maritime en baisse : ","Shipping down: ")+tx(AIS_NAMES[b]),d:T2("navires suivis : ","ships tracked: ")+c+T2(" contre "," vs ")+Math.round(md)+T2(" d'habitude (médiane 7 jours)"," usually (7-day median)"),go:{hormuz:"hormuz",bab:"bab",suez:"bab",malacca:"freight",taiwan:"taiwan",finland:"baltic",channel:"freight"}[b]});});
    var mp=median(wk.map(function(p){return p[1].pl;}));if(mp&&now.pl!=null&&now.pl<mp*0.6)out.push({k:"air",sev:1,t:T2("Moins d'avions signalés","Fewer aircraft reported"),d:fmtN(now.pl)+T2(" contre "," vs ")+fmtN(mp)+T2(" d'habitude : panne de données ou perturbation"," usually: data outage or disruption")});}
  if(now.hc&&span>=2){var hr=new Date(last[0]).getUTCHours()+1,prev={};P.forEach(function(p){var dd=p[0].slice(0,10);if(dd!==last[0].slice(0,10)&&p[1].hc)prev[dd]=p[1].hc;});var nd=Object.keys(prev).length;
    if(nd){Object.keys(now.hc).forEach(function(id){var avg=Object.keys(prev).reduce(function(s,dd){return s+(prev[dd][id]||0);},0)/nd*hr/24,c=now.hc[id];if(c>=10&&c>=2.5*Math.max(avg,2)&&byId[id])out.push({k:"news",id:id,sev:c>=5*Math.max(avg,2)?2:1,t:T2("Pic médiatique : ","Media spike: ")+tx(byId[id].t),d:c+T2(" titres aujourd'hui, ≈ "," headlines today, ≈ ")+(Math.round(c/Math.max(avg,1)*10)/10)+T2(" × la normale"," × normal"),go:id});});}}
  var p7=P.filter(function(p){return Date.parse(p[0])<=Date.now()-6.5*864e5&&p[1].p!=null;});if(p7.length&&now.p!=null){var a=p7[p7.length-1][1].p;if(Math.abs(now.p-a)>=5)out.push({k:"p",sev:2,t:T2("P a bougé de ","P moved by ")+(now.p>a?"+":"−")+Math.round(Math.abs(now.p-a))+T2(" points en 7 jours"," points in 7 days"),d:Math.round(a)+" % → "+Math.round(now.p)+" %"});}
  out.sort(function(a,b){return b.sev-a.sev;});return {ready:span>=3,list:out,since:first};}
function sigCard(){var S=sigCompute();var startD=SNAPS&&SNAPS.length?new Date(Date.parse(SNAPS[0][0])+3*864e5):new Date(Date.now()+3*864e5);
  return '<div class="ah"><h2>'+esc(T2("Signaux d'alerte précoce","Early-warning signals"))+'</h2><span class="note">'+esc(T2("écarts par rapport à la normale, détectés automatiquement","departures from normal, detected automatically"))+'</span></div>'+
   (S.list.length?S.list.map(function(x){return '<div class="sig'+(x.sev>1?' hi':'')+'"'+(x.go?' data-go="'+x.go+'"':'')+'><b>'+esc(x.t)+'</b><small>'+esc(x.d)+'</small></div>';}).join(""):'<p class="note">'+esc(S.ready?T2("Rien d'anormal en ce moment.","Nothing unusual right now."):T2("Constitution de la référence : les signaux sur le trafic démarrent vers le ","Building the baseline: traffic signals start around ")+startD.toLocaleDateString(LOC(),{day:"numeric",month:"long"})+T2(" (3 jours de données)."," (3 days of data)."))+'</p>')+
   '<p class="note">'+esc(T2("Règles : navires d'un détroit < 50 % de leur médiane sur 7 jours ; titres sur un risque ≥ 2,5 × leur rythme habituel ; P qui bouge de 5 points ou plus en 7 jours ; avions < 60 % de la normale.","Rules: a strait's ships below 50 % of their 7-day median; headlines on a risk at 2.5 × their usual pace or more; P moving 5 points or more in 7 days; aircraft below 60 % of normal."))+'</p>';}
function sigNotify(){if(typeof notify!=="function")return;var S=sigCompute(),seen;try{seen=JSON.parse(localStorage.getItem("gra-sig")||"{}");}catch(e){seen={};}var day_=new Date().toISOString().slice(0,10),ch=false;
  S.list.forEach(function(x){var k=x.k+":"+(x.id||"")+":"+day_;if(seen[k])return;seen[k]=1;ch=true;notify(x.t,x.d,"sig-"+x.k+(x.id||""));});if(ch)try{localStorage.setItem("gra-sig",JSON.stringify(seen));}catch(e){}}
(function(){var o=drawDash;drawDash=function(){o();var row=document.querySelector("#v-dash .gri-row");if(!row)return;var c=document.getElementById("sig-card");if(!c){c=document.createElement("section");c.className="card";c.id="sig-card";row.parentNode.insertBefore(c,row.nextSibling);}
  c.innerHTML=SNAPS?sigCard():'<p class="note">'+esc(u("loading"))+'</p>';if(!SNAPS)snapsLoad(function(){var c2=document.getElementById("sig-card");if(c2)c2.innerHTML=sigCard();sigNotify();});};})();
setInterval(function(){snapsAt=0;snapsLoad(function(){var c=document.getElementById("sig-card");if(c)c.innerHTML=sigCard();sigNotify();histDraw();});},3600000);

/* ---------- 5. Embed code ---------- */
function embedCode(){var base="https://mbaradhy.github.io/globalrisk/";return '<iframe src="'+base+'widget.html?lang='+L+'" width="340" height="92" style="border:0;border-radius:12px" title="Global Risk Atlas"></iframe>';}
(function(){var o=methodGuide;methodGuide=function(){var h=o();var i=h.lastIndexOf("</div>");return h.slice(0,i)+'<h3>'+esc(T2("Intégrer le niveau sur un autre site","Embed the level on another site"))+'</h3><p class="note">'+esc(T2("Copiez ce code dans une page web : un badge qui affiche le niveau et P à jour, avec un lien vers l'atlas.","Paste this code into a web page: a badge showing the current level and P, linking to the atlas."))+'</p><pre class="emb" id="emb">'+esc(embedCode())+'</pre><button type="button" class="btn" data-emb="1">'+esc(T2("Copier le code","Copy the code"))+'</button>'+h.slice(i);};})();
document.addEventListener("click",function(e){var b=e.target.closest("[data-emb]");if(!b)return;try{navigator.clipboard.writeText(embedCode()).then(function(){b.textContent="✓ "+T2("Copié","Copied");});}catch(x){}});

/* ---------- 6. Printable reports ---------- */
function repHTML(kind){var g=griLast||computeGRI(),dt=new Date().toLocaleDateString(LOC(),{day:"numeric",month:"long",year:"numeric"});
  var rows=[],title="",sub="";
  if(kind==="my"){var R=myCompute();title=T2("Mon exposition aux risques mondiaux","My exposure to global risks");sub=cName(MY.c)+(MY.sup.length?" · "+T2("fournisseurs/marchés : ","suppliers/markets: ")+MY.sup.map(cName).join(", "):"")+(MY.sec.length?" · "+MY.sec.map(function(s){return tx(SECTORS[s].n);}).join(", "):"");
    rows=R.rows.slice(0,15).map(function(x){return [tx(byId[x.id].t),tx(x.q.q),(x.q.kind==="persist"?T2("en cours · ","under way · "):"")+x.q.lo+"–"+x.q.hi+" %",whyTxt(x.why,x.id)];});
    sub+=" · "+T2("chance d'un nouveau choc pertinent sous 12 mois : ","chance of a new relevant shock within 12 months: ")+Math.round(R.chance!=null?R.chance:R.ind)+" %";}
  else{var ex=ctryExp(ctry),ids=Object.keys(ex).filter(function(k){return QUESTIONS[k]&&QUESTIONS[k].kind!=="ended";}).sort(function(a,b){var na=byId[a],nb=byId[b];return ex[b].imp*nb.sv*nb.lk-ex[a].imp*na.sv*na.lk;}).slice(0,15);
    title=T2("Rapport pays : ","Country report: ")+cName(ctry);sub=T2("Risques qui touchent le pays directement ou par les liens","Risks that hit the country directly or through the links");
    rows=ids.map(function(k){var q=QUESTIONS[k];return [tx(byId[k].t),tx(q.q),(q.kind==="persist"?T2("en cours · ","under way · "):"")+q.lo+"–"+q.hi+" %",ex[k].imp===1?T2("direct","direct"):T2("via ","via ")+tx(byId[ex[k].via].t)];});}
  var css='body{font:12px/1.45 -apple-system,Segoe UI,Inter,Arial,sans-serif;color:#111;margin:28px}h1{font-size:20px;margin:0}h2{font-size:14px;margin:18px 0 6px;border-bottom:1px solid #ccc;padding-bottom:3px}.top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.lv{border:2px solid '+g.col+';border-radius:8px;padding:8px 12px;text-align:center;min-width:150px}.lv b{font-size:26px;color:'+g.col+';display:block}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #e3e3e3;padding:5px 4px;text-align:left;vertical-align:top}th{font-size:10px;text-transform:uppercase;color:#555}.n{white-space:nowrap;font-weight:600}.s{color:#555;font-size:11px}.foot{margin-top:18px;color:#666;font-size:10px}@page{margin:14mm}';
  var meas=MEASURED.map(function(m){return '<tr><td>'+esc(tx(m.t))+'</td><td class="n">'+esc(fmtBig(m.v))+'</td><td class="s">'+esc(m.src)+'</td></tr>';}).join("");
  return '<!doctype html><html lang="'+L+'" dir="'+(L==="ar"?"rtl":"ltr")+'"><head><meta charset="utf-8"><title>'+esc(title)+'</title><style>'+css+'</style></head><body><div class="top"><div><h1>'+esc(title)+'</h1><div class="s">'+esc(sub)+'</div><div class="s">Global Risk Atlas · '+esc(dt)+'</div></div><div class="lv"><b>'+esc(T2("Niveau ","Level "))+g.level+' / 5</b>'+esc(tx(g.L.k))+'<div class="s">S = '+g.S.length+' · P = '+Math.round(g.P.mid)+' %</div></div></div>'+
   '<h2>'+esc(T2("Risques, sous forme de questions vérifiables","Risks, as checkable questions"))+'</h2><table><tr><th>'+esc(T2("Risque","Risk"))+'</th><th>'+esc(T2("Question","Question"))+'</th><th>'+esc(T2("Probabilité","Chance"))+'</th><th>'+esc(T2("Pourquoi","Why"))+'</th></tr>'+rows.map(function(r){return '<tr><td class="n">'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td class="n">'+esc(r[2])+'</td><td class="s">'+esc(r[3])+'</td></tr>';}).join("")+'</table>'+
   '<h2>'+esc(T2("État du monde, mesuré","Measured state of the world"))+'</h2><table>'+meas+'</table>'+
   '<p class="foot">'+esc(T2("Niveau fixé par une règle publiée sur S (perturbations mondiales en cours) et P (chance d'un nouveau choc mondial sous 12 mois, simulée sur le réseau de liens). Les fourchettes « atlas » sont des estimations ; chaque question est notée à son échéance. Analyse informative, pas un conseil officiel.","Level set by a published rule on S (global disruptions under way) and P (chance of a new global shock within 12 months, simulated on the link network). “Atlas” ranges are estimates; each question is scored at its date. Informational analysis, not official advice."))+' · mbaradhy.github.io/globalrisk</p></body></html>';}
function printReport(kind){var f=document.getElementById("rep-f");if(f)f.remove();f=document.createElement("iframe");f.id="rep-f";f.style.cssText="position:fixed;right:0;bottom:0;width:0;height:0;border:0";document.body.appendChild(f);
  var d=f.contentWindow.document;d.open();d.write(repHTML(kind));d.close();setTimeout(function(){try{f.contentWindow.focus();f.contentWindow.print();}catch(e){var w=window.open("","_blank");if(w){w.document.write(repHTML(kind));w.document.close();w.print();}}},300);}
document.addEventListener("click",function(e){var b=e.target.closest("[data-rep]");if(b){printReport(b.dataset.rep);}});

/* ---------- views: hook into Analysis ---------- */
(function(){var o=drawAna;drawAna=function(){if(anaSub==="my"){var el=document.getElementById("v-ana");if(!el)return;var stg=document.querySelector(".stage");if(stg)stg.classList.remove("wide");
  el.innerHTML='<nav class="asub">'+ANA_SUBS.map(function(s){return '<button type="button" data-as="'+s[0]+'" aria-pressed="'+(anaSub===s[0])+'">'+esc(tx(s[1]))+'</button>';}).join("")+'</nav><div id="ana-b"></div>';anaMy(document.getElementById("ana-b"));return;}
  o();if(anaSub==="live"){var b=document.getElementById("ana-b");if(b&&!document.getElementById("hs-card")){var c=document.createElement("section");c.className="card";c.id="hs-card";c.style.marginTop="12px";b.appendChild(c);histDraw();snapsLoad(histDraw);}}
};})();
(function(){var o=anaCountry;anaCountry=function(el){o(el);var t=el.querySelector(".ctop");if(t&&!t.querySelector("[data-rep]")){var bt=document.createElement("button");bt.type="button";bt.className="btn";bt.dataset.rep="country";bt.textContent="⎙ "+T2("Imprimer le rapport (PDF)","Print report (PDF)");t.appendChild(bt);}};anaCountry.cc=o.cc;})();
