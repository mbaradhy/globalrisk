a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)

r('</style>','''
.gri{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:10px;padding:4px 12px 4px 4px;border:1px solid var(--line);border-radius:30px;background:var(--panel)}
.gri:hover,.gri:focus-visible{border-color:var(--accent)}
.gri svg{width:46px;height:46px;display:block}
.gri-t{display:flex;flex-direction:column;line-height:1.1}
.gri-t b{font-family:var(--f-display);font-size:1rem;letter-spacing:.04em;text-transform:uppercase}
.gri-t small{font-family:var(--f-mono);font-size:.66rem;color:var(--muted)}
.gri-live{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--ok);margin-right:4px;vertical-align:middle;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
.gri-wrap{position:relative}
.gri-pop{position:absolute;top:calc(100% + 8px);left:0;z-index:60;width:min(340px,86vw);background:#101923;border:1px solid #2c3d4d;border-radius:6px;padding:14px 16px;box-shadow:0 14px 34px rgba(0,0,0,.55);display:flex;flex-direction:column;gap:8px;font-size:.84rem}
.cmp{display:grid;grid-template-columns:minmax(0,1fr) 52px;gap:8px;border-bottom:1px solid var(--line);padding-bottom:5px}
.cmp span:last-child{font-family:var(--f-mono);text-align:right}
.cmp small{display:block;color:var(--muted);font-size:.72rem}
.gri-pop .tot{font-family:var(--f-display);font-size:1.1rem;display:flex;justify-content:space-between}
.gri-float{position:fixed;right:max(12px,env(safe-area-inset-right,0px));top:calc(10px + env(safe-area-inset-top,0px));z-index:50;transform:translateY(-160%);transition:transform .2s;box-shadow:0 8px 22px rgba(0,0,0,.5)}
.gri-float.show{transform:none}
.gri-big{display:grid;grid-template-columns:150px minmax(0,1fr);gap:20px;align-items:center}
.gri-big svg{width:150px;height:150px}
@media (max-width:700px){.gri svg{width:38px;height:38px}.gri-t b{font-size:.86rem}.gri-float{top:auto;bottom:calc(64px + env(safe-area-inset-bottom,0px));transform:translateY(calc(100% + 90px))}.gri-big{grid-template-columns:110px minmax(0,1fr);gap:12px}.gri-big svg{width:110px;height:110px}}
@media (prefers-reduced-motion:reduce){.gri-live{animation:none}}
</style>''')

r('''  <div class="status">''','''  <div class="gri-wrap"><button type="button" class="gri" id="gri" aria-expanded="false" aria-controls="gri-pop"></button><div class="gri-pop" id="gri-pop" hidden></div></div>
  <div class="status">''')
r('''<div class="scrim" id="scrim"></div>''','''<div class="scrim" id="scrim"></div>
<button type="button" class="gri gri-float" id="gri-f" aria-label="Global Risk Index"></button>''')

r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";
UI.fr.gri="Indice de risque mondial";UI.en.gri="Global Risk Index";
UI.fr.griBands=["Modéré","Élevé","Haut","Sévère"];UI.en.griBands=["Moderate","Elevated","High","Severe"];
UI.fr.griBase="Base structurelle";UI.en.griBase="Structural baseline";
UI.fr.griBaseN="Moyenne gravité × probabilité des 55 risques actifs (base du 29 oct.)";UI.en.griBaseN="Average severity × likelihood of the 55 active risks (29 Oct baseline)";
UI.fr.griDis="Catastrophes en cours (GDACS)";UI.en.griDis="Ongoing disasters (GDACS)";
UI.fr.griQ="Séismes forts (USGS, 7 j)";UI.en.griQ="Strong earthquakes (USGS, 7 d)";
UI.fr.griK="Météo spatiale (Kp)";UI.en.griK="Space weather (Kp)";
UI.fr.griM="Attention médiatique (GDELT)";UI.en.griM="Media attention (GDELT)";
UI.fr.griNoLive="pas de donnée en direct";UI.en.griNoLive="no live data";
UI.fr.griUpd="Recalculé à";UI.en.griUpd="Recalculated at";
UI.fr.griHow="Indice de l'atlas, pas une mesure officielle : base structurelle + ajustements en direct (voir Méthode).";UI.en.griHow="An atlas index, not an official measure: structural baseline plus live adjustments (see Method).";
UI.fr.griOpen="Ouvrir le tableau de bord";UI.en.griOpen="Open the dashboard";''')

r('''/* ---------- boot ---------- */''','''/* ---------- Global Risk Index ---------- */
var griLast=null,griPrev=null;
function computeGRI(){
  var act=NODES.filter(function(n){return n.st!=="ended";});
  var base=100*act.reduce(function(s,n){return s+n.sv*n.lk;},0)/act.length/25;
  var c=[{k:"griBase",v:base,n:u("griBaseN")}];
  var red=live.gdacs.filter(function(g){return g.lvl==="Red";}).length,org=live.gdacs.length-red;
  var dis=Math.min(6,red*2+org);c.push({k:"griDis",v:dis,n:(live.gdacs.length||document.getElementById("fd-gdacs").className.indexOf("ok")>=0)?(red+" "+(L==="fr"?"rouge(s)":"red")+", "+org+" orange"):u("griNoLive")});
  var big=live.quakes.filter(function(e){return e.mag>=6.5;}).length;var qv=Math.min(3,big);c.push({k:"griQ",v:qv,n:live.quakes.length?(big+" ≥ M6.5 · "+live.quakes.length+" ≥ M4.5"):u("griNoLive")});
  var kv=live.kp==null?0:(live.kp>=7?4:live.kp>=5?2:0);c.push({k:"griK",v:kv,n:live.kp==null?u("griNoLive"):("Kp "+nf(live.kp,1))});
  var rs=BRIEF.top.filter(function(id){return volCache[id];}).map(function(id){return volCache[id].r;});
  var mv=0,mn=u("griNoLive");if(rs.length){var avg=rs.reduce(function(a,b){return a+b;},0)/rs.length;mv=Math.max(-3,Math.min(5,(avg-1)*10));mn="×"+nf(avg,2)+" · "+rs.length+"/10";}
  c.push({k:"griM",v:mv,n:mn});
  var tot=Math.max(0,Math.min(100,c.reduce(function(s,x){return s+x.v;},0)));
  var band=tot<40?0:tot<60?1:tot<75?2:3;
  return {tot:tot,band:band,c:c,col:["#5fd39a","#ffd25a","#ff9a3d","#ff5c4d"][band],at:new Date()};
}
function griRing(g,size,stroke,big){
  var r=(size-stroke)/2,C=2*Math.PI*r,f=g.tot/100;
  var ticks="";if(big){[40,60,75].forEach(function(t){var a=(t/100)*2*Math.PI-Math.PI/2;var x1=size/2+Math.cos(a)*(r-stroke/2-2),y1=size/2+Math.sin(a)*(r-stroke/2-2),x2=size/2+Math.cos(a)*(r+stroke/2+2),y2=size/2+Math.sin(a)*(r+stroke/2+2);ticks+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" stroke="#0a1018" stroke-width="2"/>';});}
  return '<svg viewBox="0 0 '+size+' '+size+'" role="img" aria-label="'+esc(u("gri"))+' '+Math.round(g.tot)+'/100"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="#1d2a37" stroke-width="'+stroke+'"/>'+
   '<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="'+g.col+'" stroke-width="'+stroke+'" stroke-linecap="round" stroke-dasharray="'+(C*f).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')" style="transition:stroke-dasharray .6s"/>'+ticks+
   '<text x="50%" y="'+(big?"47%":"52%")+'" text-anchor="middle" dominant-baseline="middle" fill="#e3e9ee" font-family="JetBrains Mono, monospace" font-size="'+(big?size*0.26:size*0.32)+'" font-weight="500">'+Math.round(g.tot)+'</text>'+
   (big?'<text x="50%" y="66%" text-anchor="middle" fill="'+g.col+'" font-family="Barlow Condensed, Arial Narrow, sans-serif" font-size="'+(size*0.11)+'" font-weight="700" letter-spacing="1">'+esc(u("griBands")[g.band].toUpperCase())+'</text>':'')+'</svg>';
}
function griRows(g){return g.c.map(function(x,i){return '<div class="cmp"><span>'+esc(u(x.k))+'<small>'+esc(x.n)+'</small></span><span>'+(i===0?nf(x.v,1):(x.v>0?"+":x.v<0?"−":"±")+nf(Math.abs(x.v),1))+'</span></div>';}).join("");}
function updateGRI(){
  var g=computeGRI();griPrev=griLast;griLast=g;
  var tr=griPrev&&Math.abs(g.tot-griPrev.tot)>=0.5?(g.tot>griPrev.tot?" ▲":" ▼"):"";
  var t=g.at.toTimeString().slice(0,5);
  var inner=griRing(g,46,5,false)+'<span class="gri-t"><b style="color:'+g.col+'">'+esc(u("griBands")[g.band])+esc(tr)+'</b><small><span class="gri-live"></span>'+esc(u("gri"))+' · '+t+'</small></span>';
  document.getElementById("gri").innerHTML=inner;document.getElementById("gri-f").innerHTML=inner;
  var pop=document.getElementById("gri-pop");
  pop.innerHTML='<div class="tot"><span>'+esc(u("gri"))+'</span><span style="color:'+g.col+'">'+Math.round(g.tot)+'/100 · '+esc(u("griBands")[g.band])+'</span></div>'+griRows(g)+
    '<p class="note">'+esc(u("griHow"))+'</p><p class="note">'+esc(u("griUpd"))+' '+t+'</p><button class="btn" type="button" data-gdash="1">'+esc(u("griOpen"))+' →</button>';
  var gd=document.getElementById("gri-dash");if(gd)gd.innerHTML=griBig();
}
function griBig(){var g=griLast||computeGRI();return '<div class="gri-big">'+griRing(g,150,13,true)+'<div><h2 style="margin:0 0 6px">'+esc(u("gri"))+'</h2>'+griRows(g)+'<p class="note" style="margin-top:6px">'+esc(u("griHow"))+'</p></div></div>';}
function griToggle(open){var p=document.getElementById("gri-pop"),b=document.getElementById("gri");var o=open==null?p.hidden:open;p.hidden=!o;b.setAttribute("aria-expanded",o);}
document.getElementById("gri").addEventListener("click",function(e){e.stopPropagation();griToggle();});
document.getElementById("gri-f").addEventListener("click",function(){window.scrollTo({top:0,behavior:"smooth"});setTimeout(function(){griToggle(true);},350);});
document.getElementById("gri-pop").addEventListener("click",function(e){e.stopPropagation();if(e.target.closest("[data-gdash]")){griToggle(false);showTab("dash");}});
document.addEventListener("click",function(){griToggle(false);});
document.addEventListener("keydown",function(e){if(e.key==="Escape")griToggle(false);});
(function(){var hdr=document.querySelector("header.top"),fl=document.getElementById("gri-f");
  if("IntersectionObserver" in window){new IntersectionObserver(function(es){fl.classList.toggle("show",!es[0].isIntersecting);}).observe(hdr);}})();
setInterval(updateGRI,60000);
/* ---------- boot ---------- */''')

# recompute hooks
r('''  ]).then(function(){refreshGlobe();overlay();if(tab==="brief")drawBrief();if(tab==="dash")drawDash();});''','''  ]).then(function(){refreshGlobe();overlay();updateGRI();if(tab==="brief")drawBrief();if(tab==="dash")drawDash();});''')
r('''        volCache[id]={r:avg>0?recent/avg:1,s:vals};''','''        volCache[id]={r:avg>0?recent/avg:1,s:vals};setTimeout(updateGRI,0);''')
r('''applyI18n();renderFilters();renderPanel();fillPathSelects();fitStage();''','''applyI18n();renderFilters();renderPanel();fillPathSelects();updateGRI();fitStage();''')
r('''if(tab==="dash")drawDash();if(tab==="news")drawNews();}''','''if(tab==="dash")drawDash();if(tab==="news")drawNews();updateGRI();}''')
# big gauge on top of dashboard
r('''  el.innerHTML='<div class="dash">'+
   '<div class="card"><h2>'+esc(u("kpiH"))''','''  el.innerHTML='<div class="dash">'+
   '<div class="card" id="gri-dash">'+griBig()+'</div>'+
   '<div class="card"><h2>'+esc(u("kpiH"))''')
# refresh hazards every 10 minutes instead of 15
r('''loadLive();setInterval(loadLive,15*60*1000);''','''loadLive();setInterval(loadLive,10*60*1000);''')
# method note
r('''   '<div class="card"><h2>'+esc(u("limits"))+'</h2>''','''   '<div class="card"><h2>'+esc(u("gri"))+'</h2><p style="margin:0;font-size:.86rem">'+(L==="fr"?"Base structurelle = moyenne de gravité × probabilité des risques actifs, ramenée sur 100. Ajustements en direct : +2 par alerte GDACS rouge et +1 par orange (max +6) ; +1 par séisme ≥ M6,5 sur 7 jours (max +3) ; +2 si Kp ≥ 5, +4 si Kp ≥ 7 ; attention médiatique des 10 risques majeurs de −3 à +5. Paliers : < 40 modéré, 40–60 élevé, 60–75 haut, > 75 sévère.":"Structural baseline = average severity × likelihood of active risks, scaled to 100. Live adjustments: +2 per GDACS red alert and +1 per orange (max +6); +1 per M6.5+ earthquake in 7 days (max +3); +2 if Kp ≥ 5, +4 if Kp ≥ 7; media attention on the top 10 risks from −3 to +5. Bands: < 40 moderate, 40–60 elevated, 60–75 high, > 75 severe.")+'</p></div>'+
   '<div class="card"><h2>'+esc(u("limits"))+'</h2>''')
open('app.html','w').write(a)
print('gauge ok')
