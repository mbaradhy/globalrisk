
/* ===== Phase 1 of the measurement audit: level by rule, measured counts, questions with probability bands ===== */
function qOf(id){return QUESTIONS[id];}
function qMid(q){return (q.lo+q.hi)/2;}
function pAtLeastOne(ids,key){var p=1;ids.forEach(function(id){var q=QUESTIONS[id];var v=key==="lo"?q.lo:key==="hi"?q.hi:qMid(q);p*=1-v/100;});return 100*(1-p);}
function sysState(){
  var S=Object.keys(QUESTIONS).filter(function(k){var q=QUESTIONS[k];return q.sys&&q.kind==="persist";});
  var N=Object.keys(QUESTIONS).filter(function(k){var q=QUESTIONS[k];return q.sys&&q.kind==="occur";});
  var crit=Object.keys(QUESTIONS).filter(function(k){return QUESTIONS[k].critical&&QUESTIONS[k].kind==="persist";});
  return {S:S,N:N,crit:crit,P:{lo:pAtLeastOne(N,"lo"),mid:pAtLeastOne(N,"mid"),hi:pAtLeastOne(N,"hi")}};
}
function levelOf(S,P,crit){if(crit)return 5;if(S>=2||(S>=1&&P>=50))return 4;if(S>=1||P>=33)return 3;if(P>=10)return 2;return 1;}
computeGRI=function(){
  var st=sysState(),lv=levelOf(st.S.length,st.P.mid,st.crit.length),L_=LEVELS[lv-1];
  return {tot:st.P.mid,band:lv-1,c:[],col:L_.c,at:new Date(),level:lv,L:L_,S:st.S,N:st.N,P:st.P,n:NODES.filter(function(n){return n.st!=="ended";}).length};
};
function fmtP(p){return Math.round(p.lo)+"–"+Math.round(p.hi)+" %";}
function levelSvg(g,size){var s=size||46,seg=(s-4*2)/5;var o='<svg viewBox="0 0 '+s+' '+s+'" role="img" aria-label="'+esc(T2("Niveau ","Level ")+g.level+"/5 · "+tx(g.L.k))+'">';
  for(var i=0;i<5;i++){o+='<rect x="'+(2+i*(seg+2)-2)+'" y="'+(s-10)+'" width="'+seg+'" height="6" rx="1.5" fill="'+(i<g.level?g.col:"#1d2a37")+'"/>';}
  o+='<text x="50%" y="'+(s*0.56)+'" text-anchor="middle" dominant-baseline="middle" fill="'+g.col+'" font-family="JetBrains Mono, monospace" font-size="'+(s*0.5)+'" font-weight="500">'+g.level+'</text></svg>';return o;}
griRing=function(g,size){return levelSvg(g,size);};
griRows=function(g){return '<div class="cmp"><span>'+esc(T2("Perturbations mondiales en cours (S)","Global disruptions under way (S)"))+'<small>'+g.S.map(function(k){return esc(tx(byId[k].t));}).join(" · ")+'</small></span><span>'+g.S.length+'</span></div>'+
  '<div class="cmp"><span>'+esc(T2("Chance d'un nouveau choc mondial sous 12 mois (P)","Chance of a new global shock within 12 months (P)"))+'<small>'+g.N.map(function(k){return esc(tx(byId[k].t));}).join(" · ")+'</small></span><span>'+fmtP(g.P)+'</span></div>'+
  '<div class="cmp"><span>'+esc(T2("Règle du niveau ","Level rule "))+g.level+'<small>'+esc(tx(g.L.rule))+'</small></span><span></span></div>';};
updateGRI=function(){
  var g=computeGRI();griPrev=griLast;griLast=g;var t=g.at.toTimeString().slice(0,5),al=liveAlerts().length;
  var inner=levelSvg(g,46)+'<span class="gri-t"><b style="color:'+g.col+'">'+esc(T2("Niveau ","Level ")+g.level+" · "+tx(g.L.k).toUpperCase())+'</b><small><span class="gri-live"></span>'+g.S.length+' '+esc(T2("perturbations mondiales","global disruptions"))+' · P '+Math.round(g.P.mid)+' % · '+al+' '+esc(T2("alertes","alerts"))+'</small></span>';
  document.getElementById("gri").innerHTML=inner;var gf=document.getElementById("gri-f");if(gf)gf.innerHTML=inner;
  var pop=document.getElementById("gri-pop");
  pop.innerHTML='<div class="tot"><span>'+esc(T2("Niveau de risque mondial","Global risk level"))+'</span><span style="color:'+g.col+'">'+g.level+'/5 · '+esc(tx(g.L.k))+'</span></div>'+griRows(g)+'<p class="note">'+esc(T2("Un niveau fixé par une règle, pas une somme : rien n'est pondéré ni additionné. Détails dans Méthode.","A level set by a rule, not a sum: nothing is weighted or added. Details in Method."))+'</p><p class="note">'+esc(u("griUpd"))+' '+t+'</p><button class="btn" type="button" data-gdash="1">'+esc(u("griOpen"))+' →</button>';
  var gd=document.getElementById("gri-dash");if(gd)gd.innerHTML=griBig();
  if(typeof griRecord==="function")griRecord(g);
};
var BY_L={off:{fr:"OFFICIEL",en:"OFFICIAL"},mkt:{fr:"MARCHÉ",en:"MARKET"},atl:{fr:"ATLAS ≈",en:"ATLAS ≈"}};
var BY_C={off:"#5fd39a",mkt:"#7fd1ff",atl:"#ffb547"};
function qBar(q){return '<span class="qb"><span style="left:'+q.lo+'%;width:'+(q.hi-q.lo)+'%;background:'+BY_C[q.by]+'"></span></span>';}
function qRow(id,opt){var q=QUESTIONS[id],n=byId[id];opt=opt||{};
  return '<div class="qr" data-go="'+id+'"><span class="qq"><span style="color:'+col(n)+'">●</span> '+esc(tx(q.q))+(opt.res?'<small>'+esc(tx(q.res))+' · '+esc(T2("Échéance ","Resolves "))+esc(q.t)+'</small>':'')+'</span>'+qBar(q)+'<b class="mono">'+(q.kind==="ended"?"✓":q.lo+"–"+q.hi+" %")+'</b><span class="badge" style="background:'+BY_C[q.by]+';color:#0a1018;border-color:'+BY_C[q.by]+'">'+esc(tx(BY_L[q.by]))+(q.src?' · '+esc(q.src):'')+'</span></div>';}
function fmtBig(v){if(v>=1e6)return nf(v/1e6,1)+" M";if(v>=1e3)return nf(v,0);return String(v);}
function measuredTiles(){return MEASURED.map(function(m){return '<a class="mt" href="'+esc(m.url)+'" target="_blank" rel="noopener"><b class="mono">'+fmtBig(m.v)+'</b><span>'+esc(tx(m.t))+'</span><small>'+esc(tx(m.unit))+' · '+esc(tx(m.n))+'</small><small class="src">'+esc(m.src)+'</small></a>';}).join("");}
griBig=function(){var g=griLast||computeGRI();
  var top=Object.keys(QUESTIONS).filter(function(k){return QUESTIONS[k].kind!=="ended";}).sort(function(a,b){var qa=QUESTIONS[a],qb=QUESTIONS[b];return (qb.sys-qa.sys)||(byId[b].sv-byId[a].sv)||(qMid(qb)-qMid(qa));}).slice(0,10);
  return '<div class="gb2"><div class="lvh"><div class="lvbig" style="border-color:'+g.col+'">'+levelSvg(g,110)+'<div><b style="color:'+g.col+'">'+esc(T2("Niveau ","Level ")+g.level+" / 5 · "+tx(g.L.k).toUpperCase())+'</b><small>'+esc(T2("Règle : ","Rule: ")+tx(g.L.rule))+'</small></div></div>'+
   '<div class="lvsp"><div class="gn"><b class="mono">'+g.S.length+'</b><span>'+esc(T2("perturbations mondiales en cours","global disruptions under way"))+'</span><small>'+g.S.map(function(k){return esc(tx(byId[k].t));}).join(" · ")+'</small></div>'+
   '<div class="gn"><b class="mono" style="color:'+g.col+'">'+Math.round(g.P.mid)+' %<small> ('+fmtP(g.P)+')</small></b><span>'+esc(T2("chance d'au moins un nouveau choc mondial sous 12 mois","chance of at least one new global shock within 12 months"))+'</span><small>'+esc(g.linked?T2("Simulé sur le réseau de liens (Monte Carlo) · ","Simulated on the link network (Monte Carlo) · ")+T2("si indépendants : ","if independent: ")+Math.round(g.Pi.mid)+" %":T2("Combinaison des questions ci-dessous ; simulation du réseau en cours…","Combined from the questions below; network simulation running…"))+'</small></div>'+
   '<div class="gn" data-gtab="globe"><b class="mono">'+liveAlerts().length+'</b><span>'+esc(T2("alertes en direct","live alerts"))+'</span><small>'+esc(T2("catastrophes rouges/orange, séismes ≥ M6,5, tempête solaire · jamais additionnées","red/orange disasters, M6.5+ quakes, solar storm · never added"))+'</small></div></div></div>'+
   '<h3>'+esc(T2("1 · État du monde, mesuré","1 · Measured state of the world"))+' <span class="note">'+esc(T2("compté par l'agence citée · daté · aucun jugement","counted by the agency named · dated · no judgement"))+'</span></h3><div class="mts">'+measuredTiles()+'</div>'+
   '<h3>'+esc(T2("2 · Chance d'événements nommés","2 · Chance of named events"))+' <span class="note">'+esc(T2("fourchette · source · se résout à la date de la question","range · source · resolves at the date in the question"))+'</span></h3><div class="ql">'+top.map(function(k){return qRow(k);}).join("")+'</div>'+
   '<div class="row-b" style="margin-top:8px"><button type="button" class="btn" data-qall="1">'+esc(T2("Toutes les questions","All questions"))+' →</button><span class="note" style="align-self:center">'+trackLine()+'</span></div>'+
   '<h3>'+esc(T2("2b · Risques liés : comment les chocs arrivent ensemble","2b · Linked risks: how shocks arrive together"))+'</h3>'+mcSection()+
   '<h3>'+esc(T2("3 · Impact attendu, en unités","3 · Expected impact, in units"))+' <span class="note">'+esc(T2("événements mondiaux · 12 mois · fourchettes sourcées","global events · 12 months · sourced ranges"))+'</span></h3>'+impactSection()+'</div>';};
document.addEventListener("click",function(e){if(e.target.closest("[data-qall]")){anaSub="questions";showTab("ana");}});
/* questions view in Analysis */
ANA_SUBS.unshift(["questions",{fr:"Questions",en:"Questions"}]);
var qDom="";
function anaQuestions(el){
  var ids=Object.keys(QUESTIONS).filter(function(k){return !qDom||byId[k].d===qDom;}).sort(function(a,b){var qa=QUESTIONS[a],qb=QUESTIONS[b];return (qa.kind==="ended")-(qb.kind==="ended")||(qb.sys-qa.sys)||(qMid(qb)-qMid(qa));});
  var g=griLast||computeGRI();
  el.innerHTML='<div class="card"><div class="ah"><h2>'+esc(T2("Chaque risque, formulé comme une question vérifiable","Every risk, written as a checkable question"))+'</h2><span class="note">'+esc(T2("Fourchette = probabilité sur l'horizon de la question · ","Range = probability over the question's horizon · "))+Object.keys(QUESTIONS).length+'</span></div>'+
   '<p class="note" style="color:var(--ink)">'+esc(T2("Une question se résout par oui ou non à sa date, selon la règle indiquée. Les fourchettes « atlas ≈ » sont des estimations de l'atlas sur les bandes du GIEC (très improbable < 10 %, improbable 10–33 %, aussi probable qu'improbable 33–66 %, probable 66–90 %, très probable > 90 %) ; les officielles viennent de l'agence citée. Chaque question est notée (score de Brier) une fois résolue.","A question resolves yes or no at its date, by the rule shown. “Atlas ≈” ranges are atlas estimates on the IPCC bands (very unlikely < 10 %, unlikely 10–33 %, about as likely as not 33–66 %, likely 66–90 %, very likely > 90 %); official ones come from the agency named. Each question is scored (Brier score) once resolved."))+'</p>'+
   '<div class="seg" style="margin:6px 0 10px"><button type="button" data-qd="" aria-pressed="'+(!qDom)+'">'+esc(T2("Tous","All"))+'</button>'+Object.keys(DOMAINS).map(function(d){return '<button type="button" data-qd="'+d+'" aria-pressed="'+(qDom===d)+'"><span style="color:'+DOMAINS[d].c+'">●</span> '+esc(tx(DOMAINS[d]))+'</button>';}).join("")+'</div>'+
   '<div class="ql">'+ids.map(function(k){return qRow(k,{res:true});}).join("")+'</div>'+
   '<div class="note" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px"><span><span class="badge" style="background:#5fd39a;color:#0a1018;border-color:#5fd39a">'+esc(tx(BY_L.off))+'</span> '+esc(T2("prévision d'agence","agency forecast"))+'</span><span><span class="badge" style="background:#7fd1ff;color:#0a1018;border-color:#7fd1ff">'+esc(tx(BY_L.mkt))+'</span> '+esc(T2("marché prédictif","prediction market"))+'</span><span><span class="badge" style="background:#ffb547;color:#0a1018;border-color:#ffb547">'+esc(tx(BY_L.atl))+'</span> '+esc(T2("estimation de l'atlas","atlas estimate"))+'</span><span>'+esc(T2("Les questions « mondiales » (S/P) : ","Global-systemic questions (S/P): "))+g.S.concat(g.N).map(function(k){return esc(tx(byId[k].t));}).join(", ")+'</span></div></div>';
  el.querySelectorAll("[data-qd]").forEach(function(b){b.onclick=function(){qDom=b.dataset.qd;anaQuestions(el);};});
}
var _drawAna0=drawAna;drawAna=function(){if(anaSub==="questions"){var el=document.getElementById("v-ana");if(!el)return;var stg=document.querySelector(".stage");if(stg)stg.classList.remove("wide");
  el.innerHTML='<nav class="asub">'+ANA_SUBS.map(function(s){return '<button type="button" data-as="'+s[0]+'" aria-pressed="'+(anaSub===s[0])+'">'+esc(tx(s[1]))+'</button>';}).join("")+'</nav><div id="ana-b"></div>';anaQuestions(document.getElementById("ana-b"));return;}_drawAna0();};
/* dossier: the question replaces the 1–5 likelihood meter */
var _renderPanel0=renderPanel;renderPanel=function(){_renderPanel0();if(!sel||!QUESTIONS[sel])return;var p=document.getElementById("panel"),q=QUESTIONS[sel];var ms=p.querySelectorAll(".meter");if(ms.length>=2)ms[1].remove();var SEVW=[{fr:"local, limité",en:"local, limited"},{fr:"national, réversible",en:"national, reversible"},{fr:"régional, effets économiques notables",en:"regional, notable economic effects"},{fr:"mondial pour un secteur",en:"global for one sector"},{fr:"mondial et systémique",en:"global and systemic"}];var n0=byId[sel];if(ms[0])ms[0].outerHTML='<div class="meta"><span class="pill n">'+esc(u("sev"))+' : '+esc(tx(SEVW[n0.sv-1]))+'</span></div>';
  var first=p.querySelector(".p-sec");if(!first)return;var m0=p.querySelector(".meter");var box=document.createElement("div");box.className="qbox";
  box.innerHTML='<div class="lbl">'+esc(T2("La question","The question"))+'</div><div class="qq">'+esc(tx(q.q))+'</div>'+qBar(q)+'<div class="row" style="justify-content:space-between;gap:8px"><b class="mono">'+(q.kind==="ended"?"✓ "+esc(T2("survenu","occurred")):q.lo+"–"+q.hi+" %")+'</b><span class="badge" style="background:'+BY_C[q.by]+';color:#0a1018;border-color:'+BY_C[q.by]+'">'+esc(tx(BY_L[q.by]))+(q.src?' · '+esc(q.src):'')+'</span></div><small class="note">'+esc(tx(q.res))+' · '+esc(T2("Échéance ","Resolves "))+esc(q.t)+(q.sys?' · '+esc(T2("compte pour le niveau (S/P)","counts for the level (S/P)")):'')+'</small>';
  if(m0)m0.parentNode.insertBefore(box,m0.nextSibling);else first.appendChild(box);};
/* history chart now tracks P (chance of a new global shock) */
(function(){var o=drawGriHist;drawGriHist=function(){o();var el=document.getElementById("gri-hist");if(!el)return;var h=el.querySelector("h2");if(h)h.textContent=T2("Historique de P : chance d'un nouveau choc mondial","History of P: chance of a new global shock");
  var ns=el.querySelectorAll("p.note");var last=ns[ns.length-1];if(last)last.textContent=T2("P combine les questions « mondiales » non encore survenues. Un point par heure ; les fourchettes des questions sont archivées par le relais à chaque changement, pour noter chaque prévision à son échéance.","P combines the global-systemic questions not yet under way. One point per hour; the question bands are archived by the relay on every change, so each forecast can be scored when it resolves.");};})();
/* scenario: level before/after, P before/after */
scenGRI=function(eff){var S=0,N=[];Object.keys(QUESTIONS).forEach(function(k){var q=QUESTIONS[k];if(!q.sys)return;var e=eff[k]||0;if(q.kind==="persist"){if(e>-0.4)S++;}else if(q.kind==="occur"){if(e>0.5)S++;else N.push({lo:Math.min(100,q.lo*(1+e)),hi:Math.min(100,q.hi*(1+e)),id:k});}});
  var P={lo:0,mid:0,hi:0};["lo","mid","hi"].forEach(function(key){var p=1;N.forEach(function(x){var v=key==="lo"?x.lo:key==="hi"?x.hi:(x.lo+x.hi)/2;p*=1-v/100;});P[key]=100*(1-p);});
  var lv=levelOf(S,P.mid,0),L_=LEVELS[lv-1];return {tot:P.mid,band:lv-1,col:L_.c,level:lv,L:L_,S:S,P:P,c:[]};};
/* sources panel: measured counts */
(function(){var o=srcList;srcList=function(){var G=o();G.splice(1,0,[{fr:"Mesures (couche 1)",en:"Measured counts (layer 1)"},MEASURED.map(function(m){return [esc(tx(m.t)),m.src,{s:"ok",t:T2("daté","dated")}];})]);return G;};})();
