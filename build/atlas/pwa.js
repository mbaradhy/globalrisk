
/* ===== Installable app, offline, alerts, share links ===== */
var PWA_OK=("serviceWorker" in navigator)&&/github\.io$/.test(location.hostname);
var swReg=null,instEvt=null;
if(PWA_OK){navigator.serviceWorker.register("sw.js").then(function(r){swReg=r;},function(){});}
function hdrSlot(){var s=document.getElementById("hdr-x");if(s)return s;var lg=document.getElementById("lang");if(!lg)return null;s=document.createElement("span");s.id="hdr-x";lg.parentNode.insertBefore(s,lg);return s;}
function hdrDraw(){var s=hdrSlot();if(!s)return;var on=alertsOn();
  s.innerHTML=(instEvt?'<button type="button" class="hx" id="hx-inst" title="'+esc(T2("Installer l'application","Install the app"))+'">⤓ <span>'+esc(T2("Installer","Install"))+'</span></button>':'')+
   (("Notification" in window)?'<button type="button" class="hx'+(on?' on':'')+'" id="hx-al" aria-pressed="'+on+'" title="'+esc(on?T2("Alertes activées : cliquer pour couper","Alerts on: click to turn off"):T2("Recevoir une alerte quand le niveau change ou en cas d'alerte rouge","Get an alert when the level changes or on a red alert"))+'">'+(on?"🔔":"🔕")+'</button>':'')+
   (!navigator.onLine?'<span class="hx off" title="'+esc(T2("Hors ligne : données enregistrées","Offline: saved data"))+'">'+esc(T2("Hors ligne","Offline"))+'</span>':'');}
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();instEvt=e;hdrDraw();});
window.addEventListener("appinstalled",function(){instEvt=null;hdrDraw();});
window.addEventListener("online",hdrDraw);window.addEventListener("offline",hdrDraw);
document.addEventListener("click",function(e){
  if(e.target.closest("#hx-inst")&&instEvt){instEvt.prompt();instEvt.userChoice.then(function(){instEvt=null;hdrDraw();});}
  if(e.target.closest("#hx-al")){if(alertsOn()){try{localStorage.setItem("gra-alerts","0");}catch(x){}hdrDraw();return;}
    Notification.requestPermission().then(function(p){try{localStorage.setItem("gra-alerts",p==="granted"?"1":"0");}catch(x){}hdrDraw();if(p==="granted")notify(T2("Alertes activées","Alerts on"),T2("Vous serez prévenu quand le niveau change ou en cas d'alerte rouge, tant que l'atlas est ouvert ou installé.","You will be told when the level changes or a red alert appears, while the atlas is open or installed."),"on");});}
});
function alertsOn(){try{return localStorage.getItem("gra-alerts")==="1"&&("Notification" in window)&&Notification.permission==="granted";}catch(e){return false;}}
function notify(title,body,tag){if(!alertsOn())return;var o={body:body,tag:"gra-"+tag,icon:"icon-192.png",badge:"icon-192.png"};
  if(swReg&&swReg.showNotification)swReg.showNotification(title,o).catch(function(){});else try{new Notification(title,o);}catch(e){}}
/* level change */
(function(){var o=updateGRI;updateGRI=function(){o();var g=griLast;if(!g||!g.linked)return;var prev;try{prev=localStorage.getItem("gra-lastlvl");localStorage.setItem("gra-lastlvl",String(g.level));}catch(e){}
  if(prev&&+prev!==g.level)notify(T2("Niveau de risque mondial : ","Global risk level: ")+prev+" → "+g.level,tx(g.L.k)+" · "+T2("règle : ","rule: ")+tx(g.L.rule),"lvl");};})();
/* red alerts and major quakes */
(function(){var o=brkBanner;brkBanner=function(){o();var seen;try{seen=JSON.parse(localStorage.getItem("gra-ntf")||"{}");}catch(e){seen={};}var now=Date.now(),ch=false;
  (brkItems||[]).forEach(function(b){if(seen[b.id]||(b.kind!=="alert"&&b.kind!=="quake"&&!(b.kind==="news"&&(b.n||0)>=5)))return;seen[b.id]=now;ch=true;notify(tx(BRK_KIND[b.kind]),b.title,b.id.slice(0,40));});
  Object.keys(seen).forEach(function(k){if(now-seen[k]>7*864e5){delete seen[k];ch=true;}});if(ch)try{localStorage.setItem("gra-ntf",JSON.stringify(seen));}catch(e){}};})();
/* share links: #r=<risk id> opens that risk's dossier */
function openHash(){var m=/[#&]r=([a-z0-9-]+)/.exec(location.hash);if(m&&byId[m[1]])setTimeout(function(){showTab("globe");setTimeout(function(){select(m[1],true,true);},300);},200);}
window.addEventListener("hashchange",openHash);setTimeout(openHash,600);
function shareRisk(id){var n=byId[id];if(!n)return;var url=location.origin+location.pathname+"#r="+id,q=QUESTIONS[id];
  var text=tx(n.t)+(q?" · "+tx(q.q)+" · "+(q.kind==="ended"?"✓":q.lo+"–"+q.hi+" %"):"");
  if(navigator.share)navigator.share({title:tx(n.t)+" · Global Risk Atlas",text:text,url:url}).catch(function(){});
  else if(navigator.clipboard)navigator.clipboard.writeText(text+"\n"+url).then(function(){var b=document.getElementById("p-share");if(b){b.textContent="✓ "+T2("Lien copié","Link copied");}});}
(function(){var o=renderPanel;renderPanel=function(){o();if(!sel)return;var p=document.getElementById("panel");if(!p||p.querySelector("#p-share"))return;var h=p.querySelector("h2,h3");if(!h)return;
  var b=document.createElement("button");b.type="button";b.className="btn";b.id="p-share";b.style.marginTop="6px";b.textContent="↗ "+T2("Partager ce risque","Share this risk");b.onclick=function(){shareRisk(sel);};h.parentNode.insertBefore(b,h.nextSibling);};})();
(function(){var o=setLang;setLang=function(l){o(l);hdrDraw();};})();
setTimeout(hdrDraw,300);
/* live map: the strait card closes when you pan away from that strait; thin AIS coverage is said plainly */
(function(){if(typeof lmDraw!=="function")return;var o=lmDraw;lmDraw=function(){o();try{if(LMAP.box&&LMAP.card&&lmCv){var b=BOXES[LMAP.box];var x=(mx_(b[0][1])+mx_(b[1][1]))/2,y=(my_(b[0][0])+my_(b[1][0]))/2,w=1000/LMAP.k,h=w*lmCv.height/lmCv.width;
  if(Math.abs(x-LMAP.cx)>w*0.6||Math.abs(y-LMAP.cy)>h*0.6){LMAP.card=false;var el=document.getElementById("lm-card");if(el)el.hidden=true;}}}catch(e){}};})();
(function(){if(typeof lmCard!=="function")return;var o=lmCard;lmCard=function(){o();var el=document.getElementById("lm-card");if(!el||el.hidden||!LMAP.box||LMAP.box==="finland"||LMAP.box==="channel")return;
  var p=document.createElement("p");p.className="note";p.textContent=T2("Couverture AIS limitée ici : aisstream dépend de récepteurs bénévoles sur les côtes. Un chiffre bas peut signifier « pas de récepteur » plutôt que « pas de navires ».","Thin AIS coverage here: aisstream relies on volunteer receivers on the coast. A low count can mean “no receiver” rather than “no ships”.");el.appendChild(p);};})();
