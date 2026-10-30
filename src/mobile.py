a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)

# ---------- CSS: fill the screen + phone layout
r('.wrap{max-width:1600px;','.wrap{max-width:2400px;')
r('.stage{display:grid;grid-template-columns:minmax(0,1fr) 380px;','.stage{display:grid;grid-template-columns:minmax(0,1fr) clamp(340px,22vw,440px);')
r('height:min(74vh,760px);min-height:420px;overflow:hidden}','height:var(--stageH,min(74vh,760px));min-height:360px;overflow:hidden}')
r('aside.panel{background:var(--panel);border:1px solid var(--line);border-radius:4px;max-height:min(74vh,760px);','aside.panel{background:var(--panel);border:1px solid var(--line);border-radius:4px;max-height:var(--stageH,min(74vh,760px));')
r('</style>','''#ftoggle{display:none}
.scrim{display:none}
@media (max-width:700px){
  .wrap{padding-block:10px calc(70px + env(safe-area-inset-bottom,0px));gap:8px}
  header.top{gap:6px;padding-bottom:8px;align-items:flex-start}
  .brand h1{font-size:1.55rem}
  .byline{font-size:.66rem}
  .status{gap:4px}
  .feed{font-size:.6rem;padding:2px 5px}
  .lang button{padding:3px 10px}
  .tabs{position:fixed;left:0;right:0;bottom:0;z-index:30;background:rgba(10,16,24,.97);border-top:1px solid var(--line);border-bottom:0;
        padding:0 max(6px,env(safe-area-inset-right,0px)) env(safe-area-inset-bottom,0px) max(6px,env(safe-area-inset-left,0px));-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);scrollbar-width:none}
  .tabs::-webkit-scrollbar{display:none}
  .tabs button{font-size:.9rem;padding:13px 11px 12px;border-bottom:0;border-top:3px solid transparent}
  .tabs button[aria-selected="true"]{border-top-color:var(--accent)}
  #ftoggle{display:inline-flex}
  .filters{display:none}
  .filters.open{display:flex}
  .stage{grid-template-columns:minmax(0,1fr)}
  .view{min-height:340px}
  aside.panel{position:fixed;left:0;right:0;bottom:0;z-index:45;max-height:80vh!important;min-height:0;border-radius:14px 14px 0 0;border-bottom:0;
        transform:translateY(105%);transition:transform .25s ease;box-shadow:0 -12px 32px rgba(0,0,0,.55);padding-bottom:env(safe-area-inset-bottom,0px)}
  aside.panel::before{content:"";display:block;width:40px;height:4px;border-radius:2px;background:#3a4b5c;margin:8px auto 0}
  body.sheet aside.panel{transform:none}
  body.sheet .scrim{display:block;position:fixed;inset:0;z-index:44;background:rgba(0,0,0,.45)}
  .stage.wide aside.panel{display:none}
  .toggles{top:auto;bottom:42px;right:8px;flex-direction:row;gap:10px;padding:6px 8px}
  .overlay .ovl:nth-child(n+2){display:none}
  .path{top:8px;left:8px;right:8px;max-width:none}
  .path select{max-width:42vw}
  .kpis{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
  .kpi{padding:10px}
  .kpi .k-v{font-size:1.3rem}
  .kpi .k-h{font-size:.72rem}
  .kpi svg{height:44px}
  .kpi .k-n{display:none}
  .card{padding:12px}
  .view .scroll{padding:10px}
  .fc{grid-template-columns:minmax(0,1fr) 54px 44px}
  .bar{grid-template-columns:112px minmax(0,1fr) 34px}
  footer{padding-bottom:8px}
  .stage.flow .view{height:auto!important;min-height:0;overflow:visible;background:transparent;border:0}
  .stage.flow .view > div.scroll{position:relative;inset:auto;padding:0}
}
</style>''')

# ---------- HTML: filter toggle + scrim
r('<div class="filters" id="filters"></div>','<button type="button" class="chip" id="ftoggle" aria-expanded="false"></button>\n<div class="filters" id="filters"></div>\n<div class="scrim" id="scrim"></div>')

# ---------- JS
r('''UI.fr.close="Fermer";UI.en.close="Close";''','''UI.fr.close="Fermer";UI.en.close="Close";UI.fr.filt="Filtres";UI.en.filt="Filters";''')
r('''function closePanel(){sel=null;casc=null;hl=null;renderPanel();refreshHl();if(tab==="dash")drawDash();}''',
'''function closePanel(){sel=null;casc=null;hl=null;document.body.classList.remove("sheet");renderPanel();refreshHl();if(tab==="dash")drawDash();}
function isPhone(){return window.matchMedia("(max-width:700px)").matches;}
function fitStage(){var st=document.querySelector(".stage");if(!st)return;var top=st.getBoundingClientRect().top+window.scrollY;
  var h=Math.round(window.innerHeight-top-(isPhone()?92:46));document.documentElement.style.setProperty("--stageH",Math.max(isPhone()?340:420,h)+"px");}
function ftLabel(){var b=document.getElementById("ftoggle");if(!b)return;var n=Object.keys(on).filter(function(k){return on[k];}).length;b.textContent=u("filt")+" ("+n+"/"+Object.keys(on).length+")"+(q?" · "+q:"");}''')
r('''  if(window.innerWidth<1000&&!fromPanel)document.getElementById("panel").scrollIntoView({behavior:"smooth",block:"start"});''',
'''  if(isPhone())document.body.classList.add("sheet");
  else if(window.innerWidth<1000&&!fromPanel)document.getElementById("panel").scrollIntoView({behavior:"smooth",block:"start"});''')
# resize + tab change refit
r('''window.addEventListener("resize",function(){sizeGlobe();sizeNet();''','''window.addEventListener("resize",function(){fitStage();sizeGlobe();sizeNet();''')
r('''function showTab(t){
  tab=t;''','''function showTab(t){
  tab=t;document.body.classList.remove("sheet");''')
r('''  document.getElementById("filters").hidden=t==="kit";''','''  document.getElementById("filters").hidden=t==="kit";document.getElementById("ftoggle").hidden=t==="kit";document.querySelector(".stage").classList.toggle("flow",["dash","brief","news","matrix","method"].indexOf(t)>=0);fitStage();''')
r('''/* ---------- boot ---------- */''','''document.getElementById("ftoggle").addEventListener("click",function(){var f=document.getElementById("filters");var o=f.classList.toggle("open");this.setAttribute("aria-expanded",o);setTimeout(function(){fitStage();sizeGlobe();sizeNet();},30);});
document.getElementById("scrim").addEventListener("click",function(){closePanel();});
document.getElementById("pgo").addEventListener("click",function(){if(isPhone())document.body.classList.add("sheet");});
/* ---------- boot ---------- */''')
r('''function renderFilters(){''','''function renderFilters(){setTimeout(ftLabel,0);''')
r('''document.getElementById("filters").addEventListener("input",function(e){if(e.target.id==="q"){q=e.target.value.trim().toLowerCase();refreshAll();}});''',
'''document.getElementById("filters").addEventListener("input",function(e){if(e.target.id==="q"){q=e.target.value.trim().toLowerCase();refreshAll();ftLabel();}});''')
r('''applyI18n();renderFilters();renderPanel();fillPathSelects();''','''applyI18n();renderFilters();renderPanel();fillPathSelects();fitStage();''')
open('app.html','w').write(a)
print('mobile ok')
