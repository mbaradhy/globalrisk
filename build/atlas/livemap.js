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
