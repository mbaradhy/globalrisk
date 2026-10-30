a=open('app.html').read()
def r(x,y,cnt=1):
    global a
    assert a.count(x)>=1,x[:70]; a=a.replace(x,y,cnt)

# ---- markup
r('''      <span data-i="howX"></span>
      <select id="pa" aria-label="From"></select><span>→</span><select id="pb" aria-label="To"></select>
      <button class="btn" type="button" id="pgo" data-i="find"></button>''','''      <button class="btn pm" type="button" id="pmode" aria-pressed="false"></button>
      <div class="ppick" id="pslots" hidden>
        <div class="pcol" id="colA"><div class="ph"><i style="background:#5fd39a"></i><b>A</b> <span id="hA"></span></div><input type="search" class="pq" id="qa" autocomplete="off"><div class="plist" id="la" role="listbox"></div></div>
        <div class="pmid"><span class="parr">→</span><button class="btn ic" type="button" id="pswap" title="⇄">⇄</button><button class="btn ic" type="button" id="preset" title="✕">✕</button></div>
        <div class="pcol" id="colB"><div class="ph"><i style="background:#ff5c4d"></i><b>B</b> <span id="hB"></span></div><input type="search" class="pq" id="qb" autocomplete="off"><div class="plist" id="lb" role="listbox"></div></div>
      </div>''')

# ---- remove old select logic, replace with click-to-pick
i0=a.index('function fillPathSelects(){')
i1=a.index('document.getElementById("pgo").addEventListener("click",function(){\n  var a=document.getElementById("pa")')
end_marker="'</div></div>';\n});"
i2=a.index(end_marker,i1)+len(end_marker)
new='''function fillPathSelects(){pathUI();}
var pathMode=false,pA=null,pB=null,pNext="a";
function bfsPath(a,b){var prev={},seen={};seen[a]=1;var qq=[a],found=false;
  while(qq.length&&!found){var c=qq.shift();(OUT[c]||[]).forEach(function(l){if(found||l.k==="mitigates"||seen[l.t])return;seen[l.t]=1;prev[l.t]=l;if(l.t===b)found=true;qq.push(l.t);});}
  if(!found)return null;var chain=[],x=b;while(x!==a){chain.unshift(prev[x]);x=prev[x].s;}return chain;}
function findPath(a,b){
  var p=document.getElementById("panel");sel=null;casc=null;
  var chain=a!==b?bfsPath(a,b):null,rev=false;
  if(!chain&&a!==b){chain=bfsPath(b,a);if(chain){rev=true;var t=a;a=b;b=t;}}
  if(!chain){hl=new Set([a,b]);refreshHl();p.innerHTML='<div class="p-sec"><div class="lbl">'+esc(u("pathRes"))+'</div><p><b>'+esc(tx(byId[a].t))+'</b> → <b>'+esc(tx(byId[b].t))+'</b></p><p class="empty">'+esc(u("noPath"))+'</p></div>';if(isPhone())document.body.classList.add("sheet");return;}
  hl=new Set([a]);chain.forEach(function(l){hl.add(l.t);});refreshHl();
  var lag=chain.reduce(function(s,l){return s+l.lag;},0);
  p.innerHTML='<div class="p-sec"><div class="lbl">'+esc(u("pathRes"))+' · '+chain.length+' '+esc(L==="fr"?"étape(s)":"step(s)")+' · +'+lag+' '+esc(u("months"))+'</div>'+(rev?'<p class="note" style="color:var(--warn)">'+esc(u("revPath"))+'</p>':'')+'<div class="casc">'+
    '<div class="c" data-go="'+a+'" style="border-left-color:#5fd39a"><span class="t">A</span><span><b>'+esc(tx(byId[a].t))+'</b></span><span></span></div>'+
    chain.map(function(l,i){var n=byId[l.t];var last=i===chain.length-1;return '<div class="c" data-go="'+n.id+'" style="border-left-color:'+(last?"#ff5c4d":col(n))+'"><span class="t">'+(last?"B":(i+1))+'</span><span><b>'+esc(tx(n.t))+'</b><small>'+esc(u("kinds")[l.k])+' · '+esc(tx(l.m))+'</small></span><span class="v">+'+l.lag+'</span></div>';}).join("")+'</div></div>';
  if(isPhone())document.body.classList.add("sheet");
}
var pQ={a:"",b:""};
function plist(which){
  var q=pQ[which].trim().toLowerCase(),cur=which==="a"?pA:pB,other=which==="a"?pB:pA;
  var arr=NODES.filter(function(n){if(!q)return true;return (n.t.fr+" "+n.t.en+" "+DOMAINS[n.d].fr+" "+DOMAINS[n.d].en).toLowerCase().indexOf(q)>=0;});
  arr.sort(function(x,y){if(x.id===cur)return -1;if(y.id===cur)return 1;return q?tx(x.t).localeCompare(tx(y.t)):(y.score-x.score);});
  var max=window.innerWidth<700?5:7,more=arr.length-max;arr=arr.slice(0,max);
  var el=document.getElementById(which==="a"?"la":"lb");
  el.innerHTML=arr.map(function(n){return '<button type="button" role="option" class="pit'+(n.id===cur?" on":"")+(n.id===other?" dis":"")+'" data-pick="'+n.id+'" data-w="'+which+'" aria-selected="'+(n.id===cur)+'"><i style="background:'+col(n)+'"></i><span>'+esc(tx(n.t))+'<small>'+esc(tx(DOMAINS[n.d]))+'</small></span></button>';}).join("")+
    (arr.length?"":'<p class="note">—</p>')+(more>0?'<p class="note pmore">+'+more+' '+esc(L==="fr"?"autres : tapez pour filtrer":"more: type to filter")+'</p>':"");
}
function pathUI(){
  var m=document.getElementById("pmode");if(!m)return;
  m.setAttribute("aria-pressed",pathMode);m.innerHTML='<span aria-hidden="true">⇢</span> '+esc(u(pathMode?"pathOn":"pathOff"));
  document.getElementById("pslots").hidden=!pathMode;
  document.getElementById("hA").textContent=pA?tx(byId[pA].t):u("pickA");document.getElementById("hB").textContent=pB?tx(byId[pB].t):u("pickB");
  document.getElementById("qa").placeholder=u("search");document.getElementById("qb").placeholder=u("search");
  document.getElementById("colA").classList.toggle("next",pathMode&&pNext==="a");document.getElementById("colB").classList.toggle("next",pathMode&&pNext==="b");
  plist("a");plist("b");
  document.getElementById("v-net").classList.toggle("picking",pathMode);
  refreshNet(false);
}
function setPick(which,id){
  if(which==="a"){pA=id;if(pB===id)pB=null;}else{if(id===pA)return;pB=id;}
  pNext=pA&&pB?"done":(pA?"b":"a");pathUI();
  if(pA&&pB)findPath(pA,pB);else{hl=new Set([id]);refreshHl();}
}
document.getElementById("pslots").addEventListener("click",function(e){var b=e.target.closest("[data-pick]");if(b&&!b.classList.contains("dis"))setPick(b.dataset.w,b.dataset.pick);});
["a","b"].forEach(function(w){var inp=document.getElementById(w==="a"?"qa":"qb");
  inp.addEventListener("input",function(){pQ[w]=inp.value;plist(w);});
  inp.addEventListener("focus",function(){pNext=w;document.getElementById("colA").classList.toggle("next",w==="a");document.getElementById("colB").classList.toggle("next",w==="b");});
  inp.addEventListener("keydown",function(e){if(e.key==="Enter"){var f=document.querySelector("#"+(w==="a"?"la":"lb")+" .pit:not(.dis)");if(f){setPick(w,f.dataset.pick);inp.value="";pQ[w]="";plist(w);if(w==="a")document.getElementById("qb").focus();}}});
});
function pickPath(id){
  if(pNext==="done"){pB=null;setPick("a",id);return;}
  setPick(pNext,id);
}
document.getElementById("pmode").addEventListener("click",function(){pathMode=!pathMode;if(pathMode){pNext=pA?(pB?"done":"b"):"a";}else{hl=null;refreshHl();}pathUI();});
document.getElementById("pswap").addEventListener("click",function(){var t=pA;pA=pB;pB=t;pathUI();if(pA&&pB)findPath(pA,pB);});
document.getElementById("preset").addEventListener("click",function(){pA=null;pB=null;pNext="a";hl=null;sel=null;casc=null;refreshHl();renderPanel();pathUI();});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&pathMode){pathMode=false;pathUI();}});'''
a=a[:i0]+new+a[i2:]
r('''document.getElementById("pgo").addEventListener("click",function(){if(isPhone())document.body.classList.add("sheet");});''','')
# node click in path mode, node colours for A/B
r('''.onNodeClick(function(x){select(x.id,false);focusNet(x.id);})''','''.onNodeClick(function(x){if(pathMode){pickPath(x.id);return;}select(x.id,false);focusNet(x.id);})''')
r('''     .nodeColor(function(x){return isHl(x.id)''','''     .nodeColor(function(x){if(x.id===pA&&(pathMode||pB))return "#5fd39a";if(x.id===pB&&(pathMode||pA))return "#ff5c4d";return isHl(x.id)''')
# labels: always show A and B
r('''      var pr=n.sv+(id===sel?20:0)+(nb[id]?10:0)+(hl&&hl.has(id)?8:0);
      var want=id===sel||nb[id]||(hl&&hl.has(id))||(!sel&&!hl&&n.sv>=4);''','''      var isAB=(id===pA||id===pB)&&(pathMode||(pA&&pB));
      var pr=n.sv+(id===sel?20:0)+(isAB?30:0)+(nb[id]?10:0)+(hl&&hl.has(id)?8:0);
      var want=isAB||id===sel||nb[id]||(hl&&hl.has(id))||(!sel&&!hl&&n.sv>=4);''')
# strings
r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";
UI.fr.pathOff="Trouver un chemin causal";UI.en.pathOff="Find a causal path";UI.fr.pathOn="Chemin causal : choisissez A puis B";UI.en.pathOn="Causal path: choose A then B";
UI.fr.pickA="Départ";UI.en.pickA="Start";UI.fr.pickB="Arrivée";UI.en.pickB="End";
UI.fr.revPath="Pas de chemin dans ce sens : voici le chemin inverse.";UI.en.revPath="No path in that direction: here is the reverse path.";''')
# css
r('</style>','''
.pm[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#0a1018;font-weight:600}
.path{flex-direction:column;align-items:stretch!important;background:rgba(10,16,24,.96)!important;z-index:7!important}
.path > .pm{align-self:flex-start}
.ppick{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;width:min(620px,calc(100vw - 60px));margin-top:4px}
.pcol{display:flex;flex-direction:column;gap:6px;min-width:0;border:1px solid var(--line);border-radius:6px;padding:8px;background:rgba(10,16,24,.6)}
.pcol.next{border-color:var(--accent);box-shadow:0 0 0 2px rgba(127,209,255,.18)}
.ph{display:flex;align-items:center;gap:6px;font-size:.8rem;min-width:0}
.ph i{width:9px;height:9px;border-radius:50%;flex:none}
.ph b{font-family:var(--f-mono)}
.ph span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.pq{background:var(--panel2);border:1px solid var(--line);border-radius:4px;color:var(--ink);font:inherit;font-size:.82rem;padding:5px 8px;min-width:0}
.pq:focus{outline:none;border-color:var(--accent)}
.plist{display:flex;flex-direction:column;gap:1px}
.pit{all:unset;cursor:pointer;display:grid;grid-template-columns:10px minmax(0,1fr);gap:7px;align-items:center;padding:4px 6px;border-radius:4px;font-size:.8rem}
.pit i{width:8px;height:8px;border-radius:50%}
.pit span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pit small{color:var(--muted);font-size:.68rem;margin-left:6px}
.pit:hover,.pit:focus-visible{background:var(--panel2)}
.pit.on{background:rgba(127,209,255,.16);color:#fff;font-weight:600}
.pit.dis{opacity:.35;cursor:default}
.pmore{margin:2px 0 0 6px!important}
.pmid{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.slot{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;border:1px dashed #3a4b5c;border-radius:14px;padding:3px 10px;font-size:.8rem;max-width:210px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--muted)}
.slot i{width:9px;height:9px;border-radius:50%;flex:none}
.slot .sl{font-family:var(--f-mono);font-weight:500;color:var(--ink)}
.slot.set{border-style:solid;color:var(--ink);background:var(--panel2)}
.slot.next{border-color:var(--accent);box-shadow:0 0 0 2px rgba(127,209,255,.25);animation:liveBlink 1.6s infinite}
.slot:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.parr{color:var(--muted)}
.btn.ic{padding:3px 9px}
#v-net.picking canvas{cursor:crosshair}
@media (max-width:700px){.pm{font-size:.78rem}.ppick{grid-template-columns:minmax(0,1fr) minmax(0,1fr);width:calc(100vw - 68px)}.pmid{grid-column:1/-1;grid-row:2;flex-direction:row}.pit small{display:none}}

</style>''')
open('app.html','w').write(a)
print('path ui ok')
