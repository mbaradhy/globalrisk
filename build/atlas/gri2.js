
/* ===== Headline numbers with real units; tension score without live add-ons ===== */
function majorCrises(){return NODES.filter(function(n){return n.sv>=4&&["active","escalating","de-escalating"].indexOf(n.st)>=0;}).sort(function(a,b){return b.sv*b.lk-a.sv*a.lk;});}
function liveAlerts(){var a=[];
  live.gdacs.forEach(function(g){if(g.lvl==="Red"||g.lvl==="Orange")a.push({k:g.lvl==="Red"?"red":"orange",t:g.title,url:g.url,src:"GDACS"});});
  live.quakes.forEach(function(e){if(e.mag>=6.5)a.push({k:"quake",t:e.title,url:e.url,src:"USGS"});});
  if(live.kp!=null&&live.kp>=5)a.push({k:"kp",t:T2("Tempête géomagnétique, Kp ","Geomagnetic storm, Kp ")+nf(live.kp,1),url:"https://www.swpc.noaa.gov/",src:"NOAA"});
  return a;}
computeGRI=function(){
  var act=NODES.filter(function(n){return n.st!=="ended";});
  var base=100*act.reduce(function(s,n){return s+n.sv*n.lk;},0)/act.length/25;
  var tot=Math.max(0,Math.min(100,base)),band=tot<40?0:tot<60?1:tot<75?2:3;
  return {tot:tot,band:band,c:[{k:"griBase",v:base,n:u("griBaseN")}],col:["#5fd39a","#ffd25a","#ff9a3d","#ff5c4d"][band],at:new Date(),n:act.length};
};
griRows=function(g){
  var dom={};NODES.forEach(function(n){if(n.st==="ended")return;var d=dom[n.d]||(dom[n.d]={s:0,n:0});d.s+=n.sv*n.lk;d.n++;});
  return Object.keys(dom).map(function(k){return {k:k,v:100*dom[k].s/dom[k].n/25,n:dom[k].n};}).sort(function(a,b){return b.v-a.v;}).slice(0,5).map(function(x){
    return '<div class="cmp"><span>'+esc(tx(DOMAINS[x.k]))+'<small>'+x.n+' '+esc(T2("risques","risks"))+'</small></span><span>'+nf(x.v,0)+'</span></div>';}).join("");
};
updateGRI=function(){
  var g=computeGRI();griPrev=griLast;griLast=g;var cr=majorCrises().length,al=liveAlerts().length,t=g.at.toTimeString().slice(0,5);
  var inner=griRing(g,46,5,false)+'<span class="gri-t"><b>'+cr+' '+esc(T2("crises majeures","major crises"))+'</b><small><span class="gri-live"></span>'+al+' '+esc(T2("alertes en direct","live alerts"))+' · '+esc(T2("tension","tension"))+' '+Math.round(g.tot)+'/100</small></span>';
  document.getElementById("gri").innerHTML=inner;var gf=document.getElementById("gri-f");if(gf)gf.innerHTML=inner;
  var pop=document.getElementById("gri-pop");
  pop.innerHTML=griNums(g)+'<p class="note">'+esc(u("griUpd"))+' '+t+'</p><button class="btn" type="button" data-gdash="1">'+esc(u("griOpen"))+' →</button>';
  var gd=document.getElementById("gri-dash");if(gd)gd.innerHTML=griBig();
  if(typeof griRecord==="function")griRecord(g);
};
function griNums(g){var cr=majorCrises(),al=liveAlerts();
  return '<div class="gn3">'+
   '<button type="button" class="gn" data-gtab="matrix"><b class="mono">'+cr.length+'</b><span>'+esc(T2("crises majeures en cours","major crises under way"))+'</span><small>'+esc(T2("gravité 4–5 sur 5, déjà en cours","severity 4–5 out of 5, already happening"))+'</small></button>'+
   '<button type="button" class="gn" data-gtab="globe"><b class="mono" style="color:'+(al.length?"#ff9a3d":"inherit")+'">'+al.length+'</b><span>'+esc(T2("alertes en direct","live alerts"))+'</span><small>'+esc(T2("catastrophes rouges/orange, séismes ≥ M6,5 (7 j), tempête solaire","red/orange disasters, M6.5+ earthquakes (7 d), solar storm"))+'</small></button>'+
   '<div class="gn"><b class="mono" style="color:'+g.col+'">'+Math.round(g.tot)+'<small>/100</small></b><span>'+esc(T2("score de tension","tension score"))+'</span><small>'+esc(T2("% du maximum possible","% of the maximum possible"))+'</small></div></div>';}
function shockRows(){return FORECASTS.filter(function(f){return f.p!=null;}).map(function(f){var n=byId[f.node];
  return '<div class="shr" data-go="'+f.node+'"><span>'+esc(tx(f.q))+'</span><b class="mono">'+(f.pre||(f.type==="atl"?"≈":""))+Math.round(f.p*100)+' %</b><span class="badge '+(f.type==="off"?"okb":"")+'">'+esc(f.type==="off"?u("off"):f.type==="mkt"?u("mkt"):u("atl"))+(f.by&&f.type!=="atl"?' · '+esc(f.by):'')+'</span></div>';}).join("");}
griBig=function(){var g=griLast||computeGRI(),cr=majorCrises();
  return '<div class="gb2"><h2 style="margin:0">'+esc(T2("Où en est le monde","Where the world stands"))+'</h2>'+griNums(g)+
   '<div class="gb2c"><div><h3>'+esc(T2("Probabilité de chocs dans les 12 mois","Chance of specific shocks within 12 months"))+'</h3>'+shockRows()+'<p class="note">'+esc(u("fcN"))+'</p></div>'+
   '<div><h3>'+esc(T2("Que veut dire le score de tension ?","What does the tension score mean?"))+'</h3><div class="gb2r"><div class="gri-ring">'+griRing(g,110,10,true)+'</div><div class="gri-rows">'+griRows(g)+'</div></div>'+
   '<p class="note" style="color:var(--ink)">'+esc(T2("Chacun des ","Each of the "))+g.n+esc(T2(" risques actifs reçoit une gravité (1–5) et une probabilité sur 12 mois (1–5). Le score est la moyenne de gravité × probabilité, en % du maximum : 100 voudrait dire que tous les risques sont au maximum de gravité et quasi certains. Ce n'est pas une probabilité : c'est un repère pour comparer dans le temps et entre domaines (ci-dessus, les 5 domaines les plus tendus)."," active risks gets a severity (1–5) and a 12-month likelihood (1–5). The score is the average severity × likelihood, as a % of the maximum: 100 would mean every risk at maximum severity and near certain. It is not a probability: it is a yardstick to compare over time and between domains (above, the 5 most strained domains)."))+'</p>'+
   '<p class="note">'+esc(T2("Les séismes, alertes et l'attention médiatique ne sont plus ajoutés au score : ils sont comptés à part, comme alertes en direct.","Earthquakes, disaster alerts and media attention are no longer added to the score: they are counted separately as live alerts."))+'</p></div></div></div>';};
document.addEventListener("click",function(e){var b=e.target.closest("[data-gtab]");if(b)showTab(b.dataset.gtab);});
