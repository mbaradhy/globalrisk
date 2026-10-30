a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
r('</style>','''
/* live animation */
@keyframes livePulse{0%{box-shadow:0 0 0 0 rgba(95,211,154,.7)}70%{box-shadow:0 0 0 7px rgba(95,211,154,0)}100%{box-shadow:0 0 0 0 rgba(95,211,154,0)}}
@keyframes liveBlink{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes flashIn{0%{background:rgba(95,211,154,.35)}100%{background:var(--panel)}}
.feed.ok i{animation:livePulse 1.8s infinite}
.feed.flash{animation:flashIn 1.2s ease-out}
.livetag{display:inline-flex;align-items:center;gap:6px;font-family:var(--f-display);font-weight:700;letter-spacing:.12em;font-size:.78rem;color:#ff6b5e;border:1px solid rgba(255,92,77,.5);border-radius:3px;padding:3px 8px;background:rgba(255,92,77,.08)}
.livetag i{width:8px;height:8px;border-radius:50%;background:#ff5c4d;animation:liveBlink 1.2s infinite}
.livetag.off{color:var(--muted);border-color:var(--line);background:var(--panel)}
.livetag.off i{background:var(--dim);animation:none}
.livetag small{font-family:var(--f-mono);font-weight:400;letter-spacing:0;font-size:.66rem;color:var(--muted)}
/* network labels */
.nlbls{position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:2}
.nlbls span{position:absolute;left:0;top:0;white-space:nowrap;font-size:11px;line-height:1;color:#e3e9ee;text-shadow:0 0 3px #0a1018,0 0 6px #0a1018,0 1px 2px #000;will-change:transform;transition:opacity .2s}
.nlbls span.b{font-size:12.5px;font-weight:600}
.nlbls span.s{color:#fff;font-weight:700;font-size:13px}
.nlbls.hide{display:none}
@media (prefers-reduced-motion:reduce){.feed.ok i,.livetag i{animation:none}}
</style>''')
# LIVE tag in header status
r('''  <div class="status">''','''  <div class="status"><span class="livetag off" id="livetag"><i></i><span data-i="liveTag"></span> <small id="livet"></small></span>''')
r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";UI.fr.liveTag="EN DIRECT";UI.en.liveTag="LIVE";UI.fr.names="Noms";UI.en.names="Names";''')
# flash badges on update + live tag state
r('''function badge(id,state,extra){var e=document.getElementById(id);e.className="feed "+state;e.title=extra||"";}''',
'''function badge(id,state,extra){var e=document.getElementById(id);e.className="feed "+state;e.title=extra||"";
  if(state==="ok"){void e.offsetWidth;e.classList.add("flash");var lt=document.getElementById("livetag");if(lt){lt.classList.remove("off");document.getElementById("livet").textContent=new Date().toTimeString().slice(0,5);}}}''')
# network names toggle in path bar
r('''      <button class="btn" type="button" id="pgo" data-i="find"></button>''','''      <button class="btn" type="button" id="pgo" data-i="find"></button>
      <label style="display:flex;gap:5px;align-items:center;margin-left:6px"><input type="checkbox" id="tg-names" checked style="accent-color:var(--accent)"> <span data-i="names"></span></label>''')
r('''/* ---------- boot ---------- */''','''/* ---------- network labels ---------- */
var nlEl=null,nlSpans=[];
function buildNetLabels(){
  var host=document.getElementById("v-net");if(!host||!FG)return;
  if(!nlEl){nlEl=document.createElement("div");nlEl.className="nlbls";nlEl.setAttribute("aria-hidden","true");host.appendChild(nlEl);requestAnimationFrame(netLabelLoop);}
  nlEl.innerHTML=NODES.map(function(n){return '<span data-id="'+n.id+'" class="'+(n.sv>=5?"b":"")+'">'+esc(tx(n.t))+'</span>';}).join("");
  nlSpans=Array.prototype.slice.call(nlEl.children);
}
function netLabelLoop(){
  if(FG&&tab==="net"&&nlEl&&!nlEl.classList.contains("hide")){
    var map={};FG.graphData().nodes.forEach(function(d){map[d.id]=d;});
    var W=nlEl.clientWidth,H=nlEl.clientHeight,nb={};
    if(sel){nb[sel]=1;(OUT[sel]||[]).forEach(function(l){nb[l.t]=1;});(IN[sel]||[]).forEach(function(l){nb[l.s]=1;});}
    var cand=[];
    nlSpans.forEach(function(s){var id=s.getAttribute("data-id"),d=map[id],n=byId[id];s.style.display="none";
      if(!d||d.x==null)return;var p=FG.graph2ScreenCoords(d.x,d.y,d.z);
      if(!p||p.x<-80||p.y<-20||p.x>W+80||p.y>H+20)return;
      var pr=n.sv+(id===sel?20:0)+(nb[id]?10:0)+(hl&&hl.has(id)?8:0);
      var want=id===sel||nb[id]||(hl&&hl.has(id))||(!sel&&!hl&&n.sv>=4);
      if(!want)return;
      cand.push({s:s,id:id,p:p,pr:pr,w:s.textContent.length*6.2+6});});
    cand.sort(function(a,b){return b.pr-a.pr;});
    var boxes=[];
    cand.forEach(function(c){var x0=c.p.x-c.w/2,y0=c.p.y-22,x1=x0+c.w,y1=y0+15;
      if(boxes.some(function(b){return x0<b[2]&&x1>b[0]&&y0<b[3]&&y1>b[1];}))return;
      boxes.push([x0,y0,x1,y1]);c.s.style.display="";
      c.s.style.transform="translate("+c.p.x.toFixed(1)+"px,"+c.p.y.toFixed(1)+"px) translate(-50%,-150%)";
      c.s.style.opacity=(isHl(c.id)?1:.3);c.s.classList.toggle("s",c.id===sel);});
  }
  requestAnimationFrame(netLabelLoop);
}
document.getElementById("tg-names").addEventListener("change",function(e){if(nlEl)nlEl.classList.toggle("hide",!e.target.checked);});
/* ---------- boot ---------- */''')
r('''    FG.d3Force("charge").strength(-90);''','''    FG.d3Force("charge").strength(-240);if(FG.d3Force("link"))FG.d3Force("link").distance(55);setTimeout(buildNetLabels,0);''')
r('''function setLang(l){L=l;''','''function setLang(l){L=l;if(FG)setTimeout(buildNetLabels,0);''')
open('app.html','w').write(a)
print('labels ok')
