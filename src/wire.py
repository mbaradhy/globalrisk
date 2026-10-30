p='template.html';s=open(p).read()
def r(a,b):
    global s
    assert a in s,a[:80]; s=s.replace(a,b,1)

r("footer{color:var(--muted)","""/* dashboard */
.dash{display:flex;flex-direction:column;gap:16px}
.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:4px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;cursor:pointer;min-width:0;border-top:3px solid var(--line)}
.kpi:hover{border-color:#36495b}
.kpi .k-h{display:flex;justify-content:space-between;gap:8px;font-size:.8rem;color:var(--muted)}
.kpi .k-v{font-family:var(--f-mono);font-size:1.7rem;line-height:1;font-variant-numeric:tabular-nums}
.kpi .k-v small{font-size:.8rem;color:var(--muted);margin-left:4px}
.kpi .k-d{font-family:var(--f-mono);font-size:.76rem}
.kpi .k-n{font-size:.74rem;color:var(--dim)}
.kpi svg{width:100%;height:56px;display:block}
.kpi svg text{font-family:var(--f-mono);font-size:8.5px}
.crit{color:var(--crit)}.warn{color:var(--warn)}.okc{color:var(--ok)}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.bars{display:flex;flex-direction:column;gap:6px;font-size:.84rem}
.bar{display:grid;grid-template-columns:150px minmax(0,1fr) 38px;gap:8px;align-items:center;cursor:pointer}
.bar b{height:8px;border-radius:4px;background:var(--panel2);overflow:hidden;display:block}
.bar b i{display:block;height:100%}
.bar span:last-child{font-family:var(--f-mono);text-align:right;font-size:.78rem}
.bar small{display:block;color:var(--muted);font-size:.72rem}
.fc{display:grid;grid-template-columns:minmax(0,1fr) 120px 46px;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line);font-size:.86rem;cursor:pointer}
.fc:last-child{border-bottom:0}
.fc b{height:8px;border-radius:4px;background:var(--panel2);overflow:hidden;display:block}
.fc b i{display:block;height:100%}
.fc .pv{font-family:var(--f-mono);text-align:right}
.fc small{display:block;color:var(--muted);font-size:.74rem}
.fc a{color:var(--ink)}
.tp{font-family:var(--f-mono);font-size:.64rem;border:1px solid currentColor;border-radius:3px;padding:0 5px;margin-right:6px;text-transform:uppercase}
.tp.off{color:var(--accent)}.tp.mkt{color:#e46fb4}.tp.atl{color:var(--warn)}
.cal{display:flex;flex-direction:column;gap:2px;font-size:.86rem}
.cal div{display:grid;grid-template-columns:62px 70px minmax(0,1fr);gap:8px;padding:6px 4px;border-bottom:1px solid var(--line);cursor:pointer}
.cal div:hover{background:var(--panel2)}
.cal .cd{font-family:var(--f-mono);color:var(--warn);font-size:.78rem}
.cal .dt{font-family:var(--f-mono);color:var(--muted);font-size:.78rem}
.wl{display:flex;flex-direction:column;gap:4px;font-size:.86rem}
.wl div{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;padding:5px 4px;border-bottom:1px solid var(--line)}
.wl button.x{all:unset;cursor:pointer;color:var(--muted);padding:0 4px}
.wl .nm{cursor:pointer}
.spk{font-family:var(--f-mono);font-size:.7rem;border-radius:3px;padding:1px 5px;white-space:nowrap}
.spk.hot{background:rgba(255,92,77,.18);color:var(--crit)}.spk.warm{background:rgba(255,181,71,.15);color:var(--warn)}.spk.cool{color:var(--muted)}
.pclose{all:unset;cursor:pointer;font-size:.9rem;line-height:1;border:1px solid var(--line);border-radius:3px;padding:4px 8px;color:var(--muted)}
.pclose:hover,.pclose:focus-visible{color:var(--ink);border-color:var(--accent)}
.star{all:unset;cursor:pointer;font-size:.84rem;border:1px solid var(--line);border-radius:3px;padding:2px 8px;color:var(--warn)}
.star[aria-pressed="true"]{background:rgba(255,181,71,.15)}
.note{font-size:.78rem;color:var(--muted);margin:0}
.news{display:grid;grid-template-columns:340px minmax(0,1fr);gap:16px}
.ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;font-size:.84rem}
.ctl select{background:var(--panel2);color:var(--ink);border:1px solid var(--line);border-radius:3px;font:inherit;font-size:.84rem;padding:3px 6px;max-width:220px}
.arts{display:flex;flex-direction:column}
.art{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:.9rem}
.art .t{font-family:var(--f-mono);font-size:.72rem;color:var(--muted)}
.art a{color:var(--ink);text-decoration:none}
.art a:hover{color:var(--accent);text-decoration:underline}
.art small{display:block;color:var(--muted);font-size:.74rem}
.att{display:flex;flex-direction:column;gap:2px}
.att div{display:grid;grid-template-columns:minmax(0,1fr) 80px 56px;gap:8px;align-items:center;padding:5px 4px;border-bottom:1px solid var(--line);font-size:.84rem;cursor:pointer}
.att div:hover{background:var(--panel2)}
.att svg{width:80px;height:20px;display:block}
.outl{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.outl a{font-size:.8rem;border:1px solid var(--line);border-radius:12px;padding:2px 10px;text-decoration:none}
@media (max-width:1000px){.grid2,.grid3,.news{grid-template-columns:minmax(0,1fr)}.bar{grid-template-columns:120px minmax(0,1fr) 38px}.fc{grid-template-columns:minmax(0,1fr) 70px 46px}}
footer{color:var(--muted)""")

r('<span class="feed off" id="fd-kp"><i></i>Kp <b id="kpv">–</b></span>','<span class="feed off" id="fd-kp"><i></i>Kp <b id="kpv">–</b></span>\n    <span class="feed off" id="fd-gdelt"><i></i>GDELT</span>\n    <span class="feed off" id="fd-poly"><i></i>Polymarket</span>')
r('''  <button role="tab" data-t="globe" aria-selected="true" data-i="tGlobe"></button>''','''  <button role="tab" data-t="dash" aria-selected="true" data-i="tDash"></button>
  <button role="tab" data-t="globe" aria-selected="false" data-i="tGlobe"></button>''')
r('''  <button role="tab" data-t="brief" aria-selected="false" data-i="tBrief"></button>''','''  <button role="tab" data-t="news" aria-selected="false" data-i="tNews"></button>
  <button role="tab" data-t="brief" aria-selected="false" data-i="tBrief"></button>''')
r('''    <div data-v="globe" id="v-globe"></div>''','''    <div data-v="dash" id="v-dash" class="scroll"></div>
    <div data-v="globe" id="v-globe" hidden></div>''')
r('''    <div data-v="brief" id="v-brief" class="scroll" hidden></div>''','''    <div data-v="news" id="v-news" class="scroll" hidden></div>
    <div data-v="brief" id="v-brief" class="scroll" hidden></div>''')

r('''var L="fr";try{''','''var UI2={
 fr:{tDash:"Tableau de bord",tNews:"Actualités",kpiH:"Indicateurs clés et repères",liveH:"En direct",stressH:"Niveau de tension par domaine",frH:"D'où vient l'exposition des foyers français",frN:"Part de chaque risque dans l'exposition, selon le modèle de cascade de l'atlas.",
  fcH:"Prévisions",fcN:"Officiel = agence publique · Marché = probabilité d'un marché prédictif (avis de la foule, pas un fait) · Atlas = estimation de l'atlas.",off:"Officiel",mkt:"Marché",atl:"Atlas",
  calH:"Calendrier des échéances",wlH:"Ma liste de suivi",wlN:"Ajoutez ou retirez des risques avec ☆ dans leur dossier. Liste gardée dans ce navigateur.",follow:"☆ Suivre",following:"★ Suivi",
  spikeH:"Pics d'attention médiatique",spikeN:"Couverture des 3 derniers jours comparée à la moyenne du mois (GDELT).",newsH:"Dernières actualités",newsN:"Titres non vérifiés, issus de GDELT : un signal, pas un fait établi.",
  scope:"Sujet",scopeTop:"Les 10 risques majeurs",scopeWl:"Ma liste de suivi",lang_:"Langue des sources",all:"Toutes",fren:"Français",enen:"Anglais",span:"Période",h24:"24 h",d3:"3 jours",d7:"7 jours",
  loading:"Chargement…",nofeed:"Flux d'actualités indisponible ici. Ouvrez le fichier téléchargé dans un navigateur avec internet, ou utilisez ces liens :",openG:"Google Actualités",openD:"GDELT",
  rwH:"Rapports humanitaires (ONU, ReliefWeb)",rwOff:"ReliefWeb indisponible ici.",mktH:"Marchés prédictifs en direct",mktOff:"Polymarket indisponible ici (fonctionne dans le fichier téléchargé).",
  quakes7:"Séismes M4,5+ (7 j)",gdacsA:"Alertes GDACS orange/rouge",kpL:"Indice Kp (tempête si ≥ 5)",nolive:"en direct dans le fichier téléchargé",
  vs:"vs",today:"aujourd'hui",escal:"en escalade",max:"max",pnews:"Actualités de ce risque"},
 en:{tDash:"Dashboard",tNews:"News",kpiH:"Key indicators and benchmarks",liveH:"Live",stressH:"Stress level by domain",frH:"Where French households' exposure comes from",frN:"Share of each risk in exposure, using the atlas cascade model.",
  fcH:"Forecasts",fcN:"Official = public agency · Market = prediction-market probability (crowd opinion, not fact) · Atlas = atlas estimate.",off:"Official",mkt:"Market",atl:"Atlas",
  calH:"Upcoming dates",wlH:"My watchlist",wlN:"Add or remove risks with ☆ in their dossier. Saved in this browser.",follow:"☆ Follow",following:"★ Following",
  spikeH:"Media attention spikes",spikeN:"Coverage over the last 3 days versus the monthly average (GDELT).",newsH:"Latest news",newsN:"Unverified headlines from GDELT: a signal, not established fact.",
  scope:"Topic",scopeTop:"Top 10 risks",scopeWl:"My watchlist",lang_:"Source language",all:"All",fren:"French",enen:"English",span:"Period",h24:"24 h",d3:"3 days",d7:"7 days",
  loading:"Loading…",nofeed:"News feed unavailable here. Open the downloaded file in a browser with internet, or use these links:",openG:"Google News",openD:"GDELT",
  rwH:"Humanitarian reports (UN ReliefWeb)",rwOff:"ReliefWeb unavailable here.",mktH:"Live prediction markets",mktOff:"Polymarket unavailable here (works in the downloaded file).",
  quakes7:"M4.5+ earthquakes (7 d)",gdacsA:"GDACS orange/red alerts",kpL:"Kp index (storm if ≥ 5)",nolive:"live in the downloaded file",
  vs:"vs",today:"today",escal:"escalating",max:"max",pnews:"News on this risk"}
};
Object.keys(UI2.fr).forEach(function(k){UI.fr[k]=UI2.fr[k];UI.en[k]=UI2.en[k];});
UI.fr.close="Fermer";UI.en.close="Close";
function closePanel(){sel=null;casc=null;hl=null;renderPanel();refreshHl();if(tab==="dash")drawDash();}
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&sel)closePanel();});
var L="fr";try{''')

r('''  var h='<div class="p-sec"><div class="dom" style="color:'+c+'">'+esc(tx(DOMAINS[n.d]))+'</div><h2 class="p-title">''','''  var inWl=WL.indexOf(n.id)>=0;
  var h='<div class="p-sec"><div class="row" style="justify-content:space-between"><div class="dom" style="color:'+c+'">'+esc(tx(DOMAINS[n.d]))+'</div><span class="row" style="gap:6px"><button type="button" class="star" id="star" aria-pressed="'+inWl+'">'+esc(u(inWl?"following":"follow"))+'</button><button type="button" class="pclose" id="pclose" aria-label="'+esc(u("close"))+'" title="'+esc(u("close"))+'">✕</button></span></div><h2 class="p-title">''')
r('''  h+='<div class="p-sec"><div class="lbl">'+esc(u("sources"))+'</div><ol class="src">'+n.src.map(''','''  h+='<div class="p-sec"><div class="lbl">'+esc(u("pnews"))+'</div><div id="pnews" class="arts"><p class="empty">'+esc(u("loading"))+'</p></div></div>';
  h+='<div class="p-sec"><div class="lbl">'+esc(u("sources"))+'</div><ol class="src">'+n.src.map(''')
r('''  p.innerHTML=h;
  if(casc)renderCasc();''','''  p.innerHTML=h;
  if(casc)renderCasc();
  panelNews(n.id);''')
r('''  if(e.target.id==="shock"){runCascade(sel);}''','''  if(e.target.id==="shock"){runCascade(sel);}
  if(e.target.id==="star"){toggleWL(sel);}
  if(e.target.closest("#pclose")){closePanel();}''')

r('''function runCascade(src){
  var best={};''','''function runCascade(src){casc={src:src,best:computeCascade(src)};horizon=24;renderPanel();applyCascHl();}
function computeCascade(src){
  var best={};''')
r('''  casc={src:src,best:best};horizon=24;renderPanel();applyCascHl();
}''','''  return best;
}''')

r('''  if(t==="method")drawMethod();
  overlay();''','''  if(t==="method")drawMethod();
  if(t==="dash")drawDash();
  if(t==="news")drawNews();
  overlay();''')
r('''showTab(["globe","net","mind","matrix","brief","method"].indexOf(h0)>=0?h0:"globe");''','''showTab(["dash","globe","net","mind","matrix","news","brief","method"].indexOf(h0)>=0?h0:"dash");''')
r('''if(tab==="brief")drawBrief();if(tab==="method")drawMethod();}''','''if(tab==="brief")drawBrief();if(tab==="method")drawMethod();if(tab==="dash")drawDash();if(tab==="news")drawNews();}''')
r('''  ]).then(function(){refreshGlobe();overlay();if(tab==="brief")drawBrief();});''','''  ]).then(function(){refreshGlobe();overlay();if(tab==="brief")drawBrief();if(tab==="dash")drawDash();});''')
r('''function refreshAll(){refreshGlobe();refreshNet(true);if(tab==="mind")drawMind();if(tab==="matrix")drawMatrix();overlay();}''','''function refreshAll(){refreshGlobe();refreshNet(true);if(tab==="mind")drawMind();if(tab==="matrix")drawMatrix();if(tab==="dash")drawDash();overlay();}''')

r('''/* ---------- boot ---------- */''',open('modules.js').read()+'''
/* ---------- boot ---------- */''')
r('''loadLive();setInterval(loadLive,15*60*1000);''','''loadLive();setInterval(loadLive,15*60*1000);
loadMarkets();loadReliefWeb();setTimeout(function(){loadAttention();},1500);setInterval(function(){Object.keys(newsCache).forEach(function(k){delete newsCache[k];});loadAttention(true);loadMarkets();},30*60*1000);''')
open('app.html','w').write(s)
print("ok")
