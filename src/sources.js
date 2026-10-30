
/* ===== Sources panel: one button instead of the badge row ===== */
function srcAgo(t){if(!t)return "";var m=Math.round((Date.now()-t)/60000);return m<1?T2("à l'instant","just now"):m<60?m+" min":Math.round(m/60)+" h";}
function badgeSt(id){var e=document.getElementById(id);if(!e)return {s:"idle"};var c=e.className;return {s:/\bok\b/.test(c)?"ok":/\bstale\b/.test(c)?"slow":/\boff\b/.test(c)?(performance.now()<30000?"idle":"err"):"idle",t:e.title||""};}
function srcList(){var cfg=relayCfg||{};var rc=function(k){return (typeof rssCache!=="undefined"&&rssCache[k])||null;};
  var news=rc("")||rc("en")||rc("fr")||rc(L),rw=rc("un");
  var G=[[{fr:"Catastrophes & science",en:"Disasters & science"},[
     ["USGS",T2("Séismes M4,5+, 7 jours","M4.5+ earthquakes, 7 days"),badgeSt("fd-usgs")],
     ["NASA EONET",T2("Feux, tempêtes, volcans","Wildfires, storms, volcanoes"),badgeSt("fd-eonet")],
     ["GDACS",T2("Alertes catastrophes ONU / UE","UN / EU disaster alerts"),badgeSt("fd-gdacs")],
     ["NOAA SWPC",T2("Météo spatiale (Kp)","Space weather (Kp)"),badgeSt("fd-kp")]]],
   [{fr:"Actualités",en:"News"},[
     [T2("Flux d'actualités","News feeds"),T2("30 médias, 15 langues","30 outlets, 15 languages")+(news?" · "+news.v.length+" "+T2("titres","headlines"):""),news?{s:"ok",t:srcAgo(news.at)}:{s:"idle"}],
     ["ReliefWeb",T2("Rapports humanitaires","Humanitarian reports"),rw?{s:"ok",t:srcAgo(rw.at)}:{s:"idle"}],
     ["GDELT",T2("Attention médiatique (souvent limité)","Media attention (often rate-limited)"),badgeSt("fd-gdelt")],
     [T2("Comptage des titres","Headline counts"),T2("Chaque heure, dans votre relais","Hourly, in your relay"),typeof attData!=="undefined"&&attData?(attData.fallback?{s:"key",t:T2("KV à lier","KV needed")}:{s:"ok",t:(attData.days||[]).length+" "+T2("jours","days")}):{s:"idle"}]]],
   [{fr:"Marchés & prévisions",en:"Markets & forecasts"},[
     [T2("Bourses","Stock exchanges"),(typeof mktSrc!=="undefined"&&mktSrc?mktSrc:"Yahoo Finance / Stooq")+(mktQ&&mktQ.length?" · "+mktQ.length:""),mktQ==null?{s:"idle"}:mktQ?{s:"ok",t:srcAgo(mktAt)}:{s:"err"}],
     [T2("Taux de change","Exchange rates"),T2("Banque centrale européenne","European Central Bank"),mktFx==null?{s:"idle"}:mktFx?{s:"ok",t:srcAgo(mktAt)}:{s:"err"}],
     ["Polymarket",T2("Marchés prédictifs","Prediction markets"),badgeSt("fd-poly")]]],
   [{fr:"Météo",en:"Weather"},[
     ["Open-Meteo",T2("Prévisions pour votre zone","Forecast for your area"),!AREA?{s:"idle",t:T2("zone non choisie","no area set")}:areaW?{s:"ok",t:srcAgo(areaAt)}:areaW===false?{s:"err"}:{s:"idle"}],
     ["MeteoAlarm / NWS",T2("Alertes officielles","Official warnings"),!AREA?{s:"idle",t:T2("zone non choisie","no area set")}:areaWarn?{s:"ok",t:srcAgo(areaAt)}:areaWarn===false?{s:"err"}:{s:"idle"}]]],
   [{fr:"Carte en direct",en:"Live map"},[
     [T2("Avions","Aircraft"),"adsb.lol",LST.planes&&LST.planes.ok?{s:"ok",t:srcAgo(+LST.planes.at)}:LST.planes&&LST.planes.ok===false?{s:"err"}:{s:"idle"}],
     [T2("Avions (mondial)","Aircraft worldwide"),"OpenSky",cfg.planesGlobal?{s:"ok"}:{s:"key"}],
     [T2("Navires","Ships"),"aisstream.io",cfg.ships?(LST.ships&&LST.ships.ok?{s:"ok",t:srcAgo(+LST.ships.at)}:{s:"idle"}):{s:"key"}],
     [T2("Feux & frappes","Fires & strikes"),"NASA FIRMS",cfg.fires?(LST.fires&&LST.fires.ok?{s:"ok",t:srcAgo(+LST.fires.at)}:{s:"idle"}):{s:"key"}],
     [T2("Coupures d'internet","Internet outages"),"Cloudflare Radar",cfg.outages?(LST.outages&&LST.outages.ok?{s:"ok",t:srcAgo(+LST.outages.at)}:{s:"idle"}):{s:"key"}]]],
   [{fr:"Atlas",en:"Atlas"},[
     [T2("Historique du score","Score history"),T2("Chaque heure, dans votre relais","Hourly, in your relay"),griHist&&griHist.length?{s:"ok",t:griHist.length+" pts"}:{s:"idle"}]]]];
  return G;}
var SRC_L={ok:{fr:"En direct",en:"Live"},slow:{fr:"Lent",en:"Slow"},err:{fr:"En panne",en:"Down"},key:{fr:"Clé à ajouter",en:"Key needed"},idle:{fr:"Pas encore utilisé",en:"Not used yet"}};
var SRC_C={ok:"#5fd39a",slow:"#ffb547",err:"#ff5c4d",key:"#8c9aa8",idle:"#5d6b78"};
function srcCount(G){var n=0,ok=0,slow=0,key=0;G.forEach(function(g){g[1].forEach(function(r){n++;if(r[2].s==="ok")ok++;else if(r[2].s==="slow"||r[2].s==="err")slow++;else if(r[2].s==="key")key++;});});return {n:n,ok:ok,slow:slow,key:key};}
function srcBtn(){var b=document.getElementById("src-b");if(!b)return;var c=srcCount(srcList());
  b.innerHTML='<i style="background:'+(c.slow?"#ffb547":"#5fd39a")+'"></i><span class="srl">'+esc(T2("SOURCES","SOURCES"))+'</span><span class="mono">'+c.ok+'/'+c.n+'</span>'+(c.slow?'<span class="mono srw">● '+c.slow+'</span>':'')+'<span class="lga">▾</span>';}
function srcPanel(){var p=document.getElementById("src-p");if(!p||p.hidden)return;var G=srcList(),c=srcCount(G);
  p.innerHTML='<div class="srh"><b>'+esc(T2("Sources de données","Data sources"))+'</b><span class="note"><span style="color:#5fd39a">●</span> '+c.ok+' '+esc(T2("en direct","live"))+(c.slow?' · <span style="color:#ffb547">●</span> '+c.slow+' '+esc(T2("lentes ou en panne","slow or down")):'')+(c.key?' · <span style="color:#8c9aa8">●</span> '+c.key+' '+esc(T2("clé à ajouter","need a key")):'')+'</span><button type="button" class="btn ic" id="src-x" aria-label="'+esc(u("close"))+'">✕</button></div>'+
   '<div class="srg">'+G.map(function(g){return '<div class="srgr"><h4>'+esc(tx(g[0]))+'</h4>'+g[1].map(function(r){var st=r[2];return '<div class="srr"><i style="background:'+SRC_C[st.s]+'"></i><span><b>'+esc(r[0])+'</b><small>'+esc(r[1])+'</small></span><span class="srs"><em style="color:'+SRC_C[st.s]+';border-color:'+SRC_C[st.s]+'">'+esc(tx(SRC_L[st.s]))+'</em><small class="mono">'+esc(st.t||"")+'</small></span></div>';}).join("")+'</div>';}).join("")+'</div>'+
   '<p class="note">'+esc(T2("Tout passe par votre relais atlas-api ; les clés restent dans Cloudflare. « Clé à ajouter » : voir Méthode.","Everything goes through your atlas-api relay; keys stay in Cloudflare. “Key needed”: see Method."))+'</p>';}
function srcOpen(o){var p=document.getElementById("src-p"),b=document.getElementById("src-b");if(!p)return;var op=o==null?p.hidden:o;p.hidden=!op;b.setAttribute("aria-expanded",op);if(op){relayCfgP().then(function(){srcPanel();srcBtn();});srcPanel();}}
(function(){var st=document.querySelector("header .status");if(!st)return;var lt=document.getElementById("livetag");
  var w=document.createElement("div");w.className="srcw";w.innerHTML='<button type="button" class="srcb" id="src-b" aria-expanded="false" aria-controls="src-p"></button><div class="srcp" id="src-p" hidden></div>';
  (lt&&lt.nextSibling)?st.insertBefore(w,lt.nextSibling):st.appendChild(w);
  document.getElementById("src-b").addEventListener("click",function(e){e.stopPropagation();srcOpen();});
  document.getElementById("src-p").addEventListener("click",function(e){e.stopPropagation();if(e.target.closest("#src-x"))srcOpen(false);});
  document.addEventListener("click",function(){var p=document.getElementById("src-p");if(p&&!p.hidden)srcOpen(false);});
  srcBtn();setInterval(function(){srcBtn();srcPanel();},20000);setTimeout(function(){relayCfgP().then(srcBtn);},4000);})();

/* ===== Method: how the numbers are made ===== */
function methodGuide(){
  var act=NODES.filter(function(n){return n.st!=="ended";}),sum=act.reduce(function(s,n){return s+n.sv*n.lk;},0);
  var hz=byId.hormuz,tw=byId.taiwan;
  var rows=[
   [T2("Crises majeures en cours","Major crises under way"),T2("crises (nombre)","crises (count)"),T2("Risques de gravité 4 ou 5 dont le statut est « en cours », « en escalade » ou « en désescalade ».","Risks with severity 4 or 5 whose status is active, escalating or de-escalating.")],
   [T2("Alertes en direct","Live alerts"),T2("alertes (nombre)","alerts (count)"),T2("Alertes GDACS rouges ou orange + séismes ≥ M6,5 sur 7 jours + Kp ≥ 5. Jamais additionnées à un autre chiffre.","GDACS red or orange alerts + M6.5+ earthquakes in 7 days + Kp ≥ 5. Never added to any other number.")],
   [T2("Score de tension","Tension score"),T2("% du maximum","% of maximum"),T2("Somme de gravité × probabilité de chaque risque actif ÷ (nombre de risques × 25) × 100.","Sum of severity × likelihood of every active risk ÷ (number of risks × 25) × 100.")],
   [T2("Tension par domaine","Domain tension"),T2("% du maximum","% of maximum"),T2("Même calcul, limité aux risques d'un domaine (guerres, énergie…).","Same calculation, limited to one domain's risks (wars, energy…).")],
   [T2("Gravité","Severity"),T2("échelle 1–5","scale 1–5"),T2("Ampleur de l'impact si le risque se réalise, selon la grille ci-dessous (local → mondial et systémique).","Size of the impact if the risk materialises, using the scale below (local → global and systemic).")],
   [T2("Probabilité","Likelihood"),T2("échelle 1–5 = fourchette de %","scale 1–5 = % band"),T2("Chance que le risque se produise ou se poursuive dans les 12 mois : 1 = moins de 5 %, 5 = plus de 80 % ou déjà en cours.","Chance the risk happens or continues within 12 months: 1 = under 5%, 5 = over 80% or already happening.")],
   [T2("Probabilité d'un choc précis","Probability of a specific shock"),"%",T2("Pour un événement daté et vérifiable. Source indiquée : agence officielle, marché prédictif ou estimation de l'atlas (≈).","For a dated, checkable event. Source shown: official agency, prediction market or atlas estimate (≈).")],
   [T2("Intensité d'une cascade","Cascade intensity"),"0–100",T2("Part du choc initial qui atteint un risque en suivant les liens : force du lien (1–3) ÷ 3 × 0,82 × (0,6 + gravité ÷ 12,5), multipliée étape par étape.","Share of the initial shock that reaches a risk along the links: link strength (1–3) ÷ 3 × 0.82 × (0.6 + severity ÷ 12.5), multiplied step by step.")],
   [T2("Exposition d'un pays","Country exposure"),T2("% du total du pays","% of the country's total"),T2("Contribution de chaque risque (direct ou par ricochet) à l'exposition du pays ; les parts font 100 %.","Each risk's contribution (direct or knock-on) to the country's exposure; shares add up to 100%.")],
   [T2("Attention médiatique","Media attention"),T2("titres par jour","headlines per day"),T2("Nombre de titres citant le risque dans les flux d'actualités, comptés chaque heure.","Number of headlines mentioning the risk in the news feeds, counted hourly.")],
   [T2("Marchés","Markets"),T2("% sur la veille","% vs previous close"),T2("Dernier cours comparé à la clôture précédente ; données différées.","Last price compared with the previous close; delayed data.")]];
  return '<div class="card mg" style="grid-column:1/-1"><h2>'+esc(T2("Comment les chiffres sont établis","How the numbers are made"))+'</h2>'+
   '<div class="mgt"><div class="mgh"><span>'+esc(T2("Chiffre","Number"))+'</span><span>'+esc(T2("Unité","Unit"))+'</span><span>'+esc(T2("Calcul","How it is computed"))+'</span></div>'+rows.map(function(r){return '<div class="mgr"><b>'+esc(r[0])+'</b><span class="mono">'+esc(r[1])+'</span><span>'+esc(r[2])+'</span></div>';}).join("")+'</div>'+
   '<h3>'+esc(T2("Comment un risque est évalué","How a risk is evaluated"))+'</h3><ol class="mgo">'+[
     T2("Le risque est formulé comme une question vérifiable : « dans les 12 mois, X se produit-il ou se poursuit-il, avec un impact de niveau Y ? ».","The risk is written as a checkable question: “within 12 months, does X happen or continue, with an impact of level Y?”."),
     T2("Des sources publiques datées sont rassemblées : agences officielles d'abord (FMI, NOAA, FAO, OMS, ONU…), puis sociétés de données, puis presse. Chaque dossier liste ses sources.","Dated public sources are gathered: official agencies first (IMF, NOAA, FAO, WHO, UN…), then data firms, then the press. Each dossier lists its sources."),
     T2("La gravité est fixée avec la grille 1–5 : l'impact plausible si le risque se réalise, pas le pire cas imaginable.","Severity is set with the 1–5 scale: the plausible impact if the risk materialises, not the worst case imaginable."),
     T2("La probabilité est la fourchette qui correspond le mieux aux sources. Une crise déjà en cours reçoit 5.","Likelihood is the band that best matches the sources. A crisis already happening gets 5."),
     T2("La confiance est « élevée » quand plusieurs sources officielles ou de référence concordent, sinon « moyenne ».","Confidence is “high” when several official or reference sources agree, otherwise “medium”."),
     T2("Les liens de cause à effet reçoivent une force (1–3) et un délai en mois, chacun expliqué en une phrase.","Cause-and-effect links get a strength (1–3) and a delay in months, each explained in one sentence."),
     T2("L'ensemble est revu à la date de base affichée ; les flux en direct, eux, se mettent à jour en continu.","Everything is reviewed at the baseline date shown; the live feeds update continuously.")
   ].map(function(t){return '<li>'+esc(t)+'</li>';}).join("")+'</ol>'+
   '<h3>'+esc(T2("Exemple chiffré","Worked example"))+'</h3><p>'+esc(tx(hz.t))+' : '+esc(T2("gravité ","severity "))+hz.sv+' × '+esc(T2("probabilité ","likelihood "))+hz.lk+' = '+(hz.sv*hz.lk)+'/25 ('+Math.round(hz.sv*hz.lk*4)+' %). '+esc(tx(tw.t))+' : '+tw.sv+' × '+tw.lk+' = '+(tw.sv*tw.lk)+'/25 ('+Math.round(tw.sv*tw.lk*4)+' %) — '+esc(T2("aussi grave, mais beaucoup moins probable dans les 12 mois.","just as severe, but much less likely within 12 months."))+'</p>'+
   '<p>'+esc(T2("Score de tension : ","Tension score: "))+sum+' ÷ ('+act.length+' × 25) × 100 = <b>'+nf(100*sum/act.length/25,1)+'</b> '+esc(T2("% du maximum.","% of the maximum."))+'</p>'+
   '<p>'+esc(T2("Cascade : Ormuz → pétrole, lien de force 3, gravité de la source 5 : 3 ÷ 3 × 0,82 × (0,6 + 5 ÷ 12,5) = 0,82, soit une intensité de 82 sur 100.","Cascade: Hormuz → oil, link strength 3, source severity 5: 3 ÷ 3 × 0.82 × (0.6 + 5 ÷ 12.5) = 0.82, an intensity of 82 out of 100."))+'</p>'+
   '<h3>'+esc(T2("Ce que ces chiffres ne sont pas","What these numbers are not"))+'</h3><ul class="mgo">'+[
     T2("Pas des prévisions officielles : gravité et probabilité sont des jugements de l'atlas, documentés et sourcés, compilés avec l'aide d'une IA à partir de sources publiques.","Not official forecasts: severity and likelihood are the atlas's judgements, documented and sourced, compiled with AI assistance from public sources."),
     T2("Le score de tension n'est pas une probabilité : il compare dans le temps et entre domaines.","The tension score is not a probability: it compares over time and between domains."),
     T2("Les scénarios montrent des directions et des délais plausibles, pas des prix ou des dates précis.","Scenarios show plausible directions and delays, not precise prices or dates."),
     T2("En cas d'urgence, suivez les autorités : l'atlas informe, il ne donne pas de consignes.","In an emergency, follow the authorities: the atlas informs, it does not give instructions.")
   ].map(function(t){return '<li>'+esc(t)+'</li>';}).join("")+'</ul></div>';}
var _drawMethod0=drawMethod;drawMethod=function(){_drawMethod0();var m=document.querySelector("#v-method .method");if(m)m.insertAdjacentHTML("afterbegin",methodGuide());};
