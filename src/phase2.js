
/* ===== Phases 2 and 3 of the measurement audit =====
   2a · linked risks: Monte Carlo over the link network, marginals held equal to the question bands
   2b · expected impact in units (Layer 3), from sourced conditional ranges (IMPACT)
   3  · forecast record: band versions archived by the relay, outcomes, Brier score and calibration */

/* --- round level gauge: 5 arc segments around the level number --- */
levelSvg=function(g,size){var s=size||46,c=s/2,sw=Math.max(3,s*0.085),r=c-sw/2-1,gap=16;
  var o='<svg viewBox="0 0 '+s+' '+s+'" width="'+s+'" height="'+s+'" role="img" aria-label="'+esc(T2("Niveau ","Level ")+g.level+"/5 · "+tx(g.L.k))+'">';
  for(var i=0;i<5;i++){var a0=(-90+i*72+gap/2)*Math.PI/180,a1=(-90+(i+1)*72-gap/2)*Math.PI/180;
    o+='<path d="M'+(c+r*Math.cos(a0)).toFixed(2)+' '+(c+r*Math.sin(a0)).toFixed(2)+' A'+r.toFixed(2)+' '+r.toFixed(2)+' 0 0 1 '+(c+r*Math.cos(a1)).toFixed(2)+' '+(c+r*Math.sin(a1)).toFixed(2)+'" fill="none" stroke="'+(i<g.level?g.col:"#1d2a37")+'" stroke-width="'+sw.toFixed(2)+'" stroke-linecap="round"/>';}
  o+='<text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="'+g.col+'" font-family="JetBrains Mono, monospace" font-size="'+(s*0.44).toFixed(1)+'" font-weight="600">'+g.level+'</text></svg>';return o;};
griRing=function(g,size){return levelSvg(g,size);};

/* --- 2a · linked Monte Carlo --- */
var MC=null,MC_RUN=false;
var MC_OR={1:1.5,2:2.5,3:4};           /* odds ratio on the target when the source event is on, by link strength */
var MC_N=40000,MC_OUT=120,MC_IN=2000;
function mcRng(seed){var s=seed>>>0;return function(){s=s+0x6D2B79F5|0;var t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function mcLg(p){p=Math.min(0.9999,Math.max(0.0001,p));return Math.log(p/(1-p));}
function mcSg(x){return 1/(1+Math.exp(-x));}
function mcGraph(){
  var ids=Object.keys(QUESTIONS).filter(function(k){return QUESTIONS[k].kind!=="ended"&&byId[k];}),ix={},m=ids.length;ids.forEach(function(k,i){ix[k]=i;});
  var kids=ids.map(function(){return [];}),used=0,skipped=0;
  LINKS.forEach(function(l){var a=ix[l[0]],b=ix[l[1]];if(a==null||b==null||a===b)return;if((l[4]||0)>12){skipped++;return;}
    var be=Math.log(MC_OR[l[3]]||1.5);if(l[2]==="same-actor")be/=2;if(l[2]==="mitigates")be=-be;kids[a].push({t:b,b:be});used++;});
  /* drop back edges so the network is acyclic; the reverse post-order is then a valid simulation order */
  var st=new Uint8Array(m),post=[],dropped=0,par=ids.map(function(){return [];});
  function visit(i){st[i]=1;kids[i]=kids[i].filter(function(e){if(st[e.t]===1){dropped++;return false;}if(!st[e.t])visit(e.t);return true;});st[i]=2;post.push(i);}
  var roots=ids.map(function(k,i){return i;}).sort(function(a,b){return (byId[ids[b]].sv-byId[ids[a]].sv)||(a-b);});
  roots.forEach(function(i){if(!st[i])visit(i);});
  var order=post.reverse();kids.forEach(function(es,i){es.forEach(function(e){par[e.t].push({s:i,b:e.b});});});
  var p=ids.map(function(k){return qMid(QUESTIONS[k])/100;});
  var Nset=[],sys=[];ids.forEach(function(k,i){var q=QUESTIONS[k];if(q.sys){sys.push(i);if(q.kind==="occur")Nset.push(i);}});
  return {ids:ids,ix:ix,m:m,order:order,par:par,p:p,N:Nset,sys:sys,used:used,dropped:dropped,skipped:skipped};
}
function mcU(n,m,seed){var r=mcRng(seed),U=new Float32Array(n*m);for(var i=0;i<U.length;i++)U[i]=r();return U;}
/* calibrate the intercept of each node so that its simulated frequency equals its band mid, given its parents */
function mcCalib(G,U,n,mult,pv){var m=G.m,S=new Uint8Array(n*m),a=new Float64Array(m),pp=pv||G.p;
  G.order.forEach(function(i){var par=G.par[i],hist={},d,z,k;
    for(d=0;d<n;d++){z=0;for(k=0;k<par.length;k++)if(S[d*m+par[k].s])z+=par[k].b*mult;var key=z.toFixed(4);hist[key]=(hist[key]||0)+1;}
    var zs=Object.keys(hist).map(Number),cs=Object.keys(hist).map(function(x){return hist[x];});
    var lo=-16,hi=16;for(var it=0;it<46;it++){var mid=(lo+hi)/2,f=0;for(k=0;k<zs.length;k++)f+=cs[k]*mcSg(mid+zs[k]);if(f/n<pp[i])lo=mid;else hi=mid;}
    a[i]=(lo+hi)/2;
    for(d=0;d<n;d++){z=0;for(k=0;k<par.length;k++)if(S[d*m+par[k].s])z+=par[k].b*mult;S[d*m+i]=U[d*m+i]<mcSg(a[i]+z)?1:0;}});
  return a;}
/* simulate: returns P(>=1 new global shock), P(>=2), E[k], per-node frequency, and the state matrix */
function mcRun(G,U,n,a,mult,force,row0){var m=G.m,S=new Uint8Array(n*m),c1=0,c2=0,ek=0,fr=new Float64Array(m);row0=row0||0;
  for(var d=0;d<n;d++){var base=(row0+d)%(U.length/m|0)*m,sb=d*m;
    for(var oi=0;oi<G.order.length;oi++){var i=G.order[oi],on;
      if(force&&force[i]!=null)on=force[i];else{var z=a[i],par=G.par[i];for(var k=0;k<par.length;k++)if(S[sb+par[k].s])z+=par[k].b*mult;on=U[base+i]<mcSg(z)?1:0;}
      S[sb+i]=on;if(on)fr[i]++;}
    var kk=0;for(var j=0;j<G.N.length;j++)if(S[sb+G.N[j]])kk++;if(kk>=1)c1++;if(kk>=2)c2++;ek+=kk;}
  for(var i2=0;i2<m;i2++)fr[i2]/=n;return {P1:100*c1/n,P2:100*c2/n,EK:ek/n,fr:fr,S:S,n:n};}
function mcIndep(ps){var dp=[1,0,0];ps.forEach(function(p){var n0=dp[0]*(1-p),n1=dp[1]*(1-p)+dp[0]*p,n2=dp[2]+dp[1]*p;dp=[n0,n1,n2];});return {P1:100*(1-dp[0]),P2:100*dp[2],EK:ps.reduce(function(s,p){return s+p;},0)};}
function mcPct(arr,q){var b=arr.slice().sort(function(x,y){return x-y;});var i=Math.min(b.length-1,Math.max(0,Math.round(q*(b.length-1))));return b[i];}
/* steps run one per frame so the page never freezes */
function mcStart(){if(MC||MC_RUN)return;MC_RUN=true;var G=mcGraph(),U=mcU(MC_N,G.m,20261030),R={G:G,U:U,drv:[],ifs:[]},steps=[];
  steps.push(function(){R.a=mcCalib(G,U,MC_N,1);R.c=mcRun(G,U,MC_N,R.a,1);R.ind=mcIndep(G.N.map(function(i){return G.p[i];}));});
  steps.push(function(){var a=mcCalib(G,U,MC_N/2,0.5);R.lo=mcRun(G,U,MC_N/2,a,0.5);});
  steps.push(function(){var a=mcCalib(G,U,MC_N/2,1.5);R.hi=mcRun(G,U,MC_N/2,a,1.5);});
  /* drivers: every event upstream of a global-systemic one, switched off (ended / never happens) */
  var up={},q=G.N.slice();while(q.length){var t=q.pop();G.par[t].forEach(function(e){if(!up[e.s]&&G.N.indexOf(e.s)<0){up[e.s]=1;q.push(e.s);}});}
  Object.keys(up).map(Number).forEach(function(i){steps.push(function(){var f={};f[i]=0;var r=mcRun(G,U,MC_N,R.a,1,f);R.drv.push({id:G.ids[i],P1:r.P1,P2:r.P2});});});
  /* if one global shock happens, chance of at least one more */
  G.N.forEach(function(i){steps.push(function(){var f={};f[i]=1;var r=mcRun(G,U,MC_N,R.a,1,f);var c=0,m=G.m;for(var d=0;d<r.n;d++){var k=0;for(var j=0;j<G.N.length;j++)if(G.N[j]!==i&&r.S[d*m+G.N[j]])k++;if(k)c++;}
    var oth=G.N.filter(function(j){return j!==i;}).map(function(j){return G.p[j];});R.ifs.push({id:G.ids[i],linked:100*c/r.n,ind:mcIndep(oth).P1});});});
  /* band uncertainty: draw every band value, shift the intercepts, rerun */
  var r2=mcRng(77),out=[],outI=[],out2=[];
  for(var s=0;s<MC_OUT;s+=10)(function(s0){steps.push(function(){for(var s=s0;s<Math.min(MC_OUT,s0+10);s++){
    var pv=G.ids.map(function(k){var qq=QUESTIONS[k];return (qq.lo+(qq.hi-qq.lo)*r2())/100;});
    var a2=new Float64Array(G.m);for(var i=0;i<G.m;i++)a2[i]=R.a[i]+mcLg(pv[i])-mcLg(G.p[i]);
    var r=mcRun(G,U,MC_IN,a2,1,null,s*397);out.push(r.P1);out2.push(r.P2);outI.push(mcIndep(G.N.map(function(i){return pv[i];})).P1);}});})(s);
  steps.push(function(){R.P1={lo:mcPct(out,0.05),mid:R.c.P1,hi:mcPct(out,0.95)};R.P2={lo:mcPct(out2,0.05),mid:R.c.P2,hi:mcPct(out2,0.95)};R.P1i={lo:mcPct(outI,0.05),mid:R.ind.P1,hi:mcPct(outI,0.95)};
    R.drv.sort(function(x,y){return (R.c.P1-y.P1+R.c.P2-y.P2)-(R.c.P1-x.P1+R.c.P2-x.P2);});R.imp=impSim(G,R.c);});
  var k=0;(function nx(){if(k>=steps.length){MC=R;MC_RUN=false;try{updateGRI();}catch(e){}return;}var t0=performance.now();while(k<steps.length&&performance.now()-t0<30)steps[k++]();setTimeout(nx,0);})();
}
/* level now uses the linked P once the simulation is done */
(function(){var o=computeGRI;computeGRI=function(){var g=o();if(MC){g.Pi=g.P;g.P={lo:MC.P1.lo,mid:MC.P1.mid,hi:MC.P1.hi};g.linked=true;g.level=levelOf(g.S.length,g.P.mid,sysState().crit.length);g.L=LEVELS[g.level-1];g.col=g.L.c;g.band=g.level-1;g.tot=g.P.mid;}return g;};})();
setTimeout(mcStart,1500);

function pc(v){return (v<1&&v>0?nf(v,1):Math.round(v))+" %";}
function mcSection(){if(!MC)return '<p class="note">'+esc(T2("Simulation du réseau de liens en cours…","Simulating the link network…"))+'</p>';
  var R=MC,nm=function(id){return esc(tx(byId[id].t));};
  var tbl='<div class="mct"><div class="mch"><span></span><span>'+esc(T2("indépendants","independent"))+'</span><span>'+esc(T2("liés","linked"))+'</span><span>'+esc(T2("liens ×0,5 / ×1,5","links ×0.5 / ×1.5"))+'</span></div>'+
   '<div><span>'+esc(T2("Au moins un nouveau choc mondial","At least one new global shock"))+'</span><b class="mono">'+pc(R.ind.P1)+'</b><b class="mono">'+pc(R.c.P1)+'<small> ('+Math.round(R.P1.lo)+'–'+Math.round(R.P1.hi)+')</small></b><span class="mono">'+pc(R.lo.P1)+' / '+pc(R.hi.P1)+'</span></div>'+
   '<div><span>'+esc(T2("Deux ou plus en même temps","Two or more at once"))+'</span><b class="mono">'+pc(R.ind.P2)+'</b><b class="mono">'+pc(R.c.P2)+'<small> ('+nf(R.P2.lo,1)+'–'+nf(R.P2.hi,1)+')</small></b><span class="mono">'+pc(R.lo.P2)+' / '+pc(R.hi.P2)+'</span></div>'+
   '<div><span>'+esc(T2("Nombre attendu de nouveaux chocs","Expected number of new shocks"))+'</span><b class="mono">'+nf(R.ind.EK,2)+'</b><b class="mono">'+nf(R.c.EK,2)+'</b><span class="mono">'+nf(R.lo.EK,2)+' / '+nf(R.hi.EK,2)+'</span></div></div>';
  var ifs=R.ifs.slice().sort(function(a,b){return (b.linked-b.ind)-(a.linked-a.ind);}).map(function(x){return '<div class="mcr" data-go="'+x.id+'"><span>'+nm(x.id)+' <small class="note">'+esc(T2("s'il survient","if it happens"))+'</small></span><b class="mono">'+pc(x.ind)+' → '+pc(x.linked)+'</b></div>';}).join("");
  var drv=R.drv.slice(0,6).map(function(x){return '<div class="mcr" data-go="'+x.id+'"><span>'+nm(x.id)+' <small class="note">'+esc(T2("s'il prenait fin","if it ended"))+'</small></span><b class="mono">P '+pc(R.c.P1)+' → '+pc(x.P1)+' · ≥2 '+pc(R.c.P2)+' → '+pc(x.P2)+'</b></div>';}).join("");
  return tbl+'<div class="mc2"><div><div class="lbl">'+esc(T2("Contagion : chance d'un autre choc mondial, indépendants → liés","Contagion: chance of another global shock, independent → linked"))+'</div>'+ifs+'</div><div><div class="lbl">'+esc(T2("Ce qui pèse le plus : P et ≥2 chocs, aujourd'hui → sans cet événement","What drives it most: P and ≥2 shocks, today → without this event"))+'</div>'+drv+'</div></div>'+
   '<p class="note">'+esc(T2("Chaque lien du réseau multiplie la cote de sa cible quand sa source est en cours : ×1,5, ×2,5 ou ×4 selon sa force (1–3), ×√ pour un même acteur, inverse pour « atténue ». Les fréquences de chaque événement restent égales au milieu de sa fourchette : les liens changent la façon dont les chocs arrivent ensemble, pas la chance de chacun. ","Each link multiplies its target's odds when its source is under way: ×1.5, ×2.5 or ×4 by strength (1–3), square-rooted for a shared actor, inverted for “mitigates”. Each event's own frequency stays at the middle of its band: links change how shocks arrive together, not each one's chance. ")+
   nf(MC_N,0)+T2(" tirages × "," draws × ")+MC_OUT+T2(" tirages des fourchettes (90 % entre parenthèses) · "," band draws (90 % in brackets) · ")+R.G.used+T2(" liens, "," links, ")+R.G.dropped+T2(" retirés pour casser les boucles, "," removed to break loops, ")+R.G.skipped+T2(" à délai > 12 mois ignorés."," with lags over 12 months ignored."))+'</p>';}

/* --- 2b · expected impact (Layer 3) --- */
var IMP_U=[["deaths",{fr:"morts",en:"deaths"},"p"],["gdp_usd",{fr:"production mondiale perdue",en:"world output lost"},"$"],["food_insecure",{fr:"personnes en plus en insécurité alimentaire aiguë",en:"more people in acute food insecurity"},"p"],["displaced",{fr:"nouveaux déplacés",en:"newly displaced"},"p"]];
function fmtU(v,t){if(v==null)return "—";if(t==="$"){if(v>=1e12)return "$"+nf(v/1e12,v>=1e13?0:1)+T2(" T"," tn");if(v>=1e9)return "$"+nf(v/1e9,0)+T2(" Md"," bn");return "$"+nf(v/1e6,0)+" M";}
  if(v>=1e6)return nf(v/1e6,v>=1e7?0:1)+" M";if(v>=1e4)return nf(v/1e3,0)+" k";return nf(v,0);}
function impSim(G,c){if(typeof IMPACT==="undefined")return null;var r=mcRng(4242),m=G.m,res={};
  IMP_U.forEach(function(uu){var key=uu[0],vals=new Float64Array(c.n);
    for(var d=0;d<c.n;d++){var s=0;G.sys.forEach(function(i){var im=IMPACT[G.ids[i]];if(!im||!im[key]||im[key][0]==null||!c.S[d*m+i])return;var lo=Math.max(1,im[key][0]),hi=im[key][1]==null?lo:Math.max(lo,im[key][1]);s+=Math.exp(Math.log(lo)+(Math.log(hi)-Math.log(lo))*r());});vals[d]=s;}
    var arr=Array.prototype.slice.call(vals),mean=arr.reduce(function(a,b){return a+b;},0)/c.n;res[key]={mean:mean,lo:mcPct(arr,0.05),hi:mcPct(arr,0.95),med:mcPct(arr,0.5)};});
  return res;}
function impactSection(){if(typeof IMPACT==="undefined")return '<p class="note">—</p>';
  var tiles=MC&&MC.imp?IMP_U.map(function(uu){var x=MC.imp[uu[0]];return '<div class="mt"><b class="mono">≈ '+fmtU(x.mean,uu[2])+'</b><span>'+esc(tx(uu[1]))+'</span><small>'+esc(T2("90 % : ","90 %: "))+fmtU(x.lo,uu[2])+' – '+fmtU(x.hi,uu[2])+'</small></div>';}).join(""):'<p class="note">'+esc(T2("Calcul…","Computing…"))+'</p>';
  var ids=Object.keys(IMPACT).filter(function(k){return QUESTIONS[k]&&byId[k];}).sort(function(a,b){return qMid(QUESTIONS[b])-qMid(QUESTIONS[a]);});
  var rows=ids.map(function(k){var im=IMPACT[k],q=QUESTIONS[k];
    return '<div class="imr"><span class="imn" data-go="'+k+'"><span style="color:'+col(byId[k])+'">●</span> '+esc(tx(byId[k].t))+'<small>'+q.lo+'–'+q.hi+' %</small></span>'+IMP_U.map(function(uu){var v=im[uu[0]];return '<span class="mono">'+(!v?'—':v[1]==null?'≥ '+fmtU(v[0],uu[2]):v[0]==null?'≤ '+fmtU(v[1],uu[2]):v[0]===v[1]?fmtU(v[0],uu[2]):fmtU(v[0],uu[2])+'–'+fmtU(v[1],uu[2]))+'</span>';}).join("")+
     '<details class="ims"><summary>'+esc(T2("Base du calcul et sources","Basis and sources"))+' ('+(im.src||[]).length+')</summary>'+esc(tx(im.basis))+(im.tail?' <b>'+esc(T2("Queue exclue : ","Tail left out: "))+'</b>'+esc(tx(im.tail)):'')+' · '+(im.src||[]).map(function(s){return '<a href="'+esc(s.u)+'" target="_blank" rel="noopener">'+esc(s.t)+'</a>';}).join(" · ")+'</details></div>';}).join("");
  return '<div class="mts">'+tiles+'</div><div class="imt"><div class="imr imh"><span>'+esc(T2("Si l'événement survient ou continue (12 mois)","If the event happens or continues (12 months)"))+'</span>'+IMP_U.map(function(uu){return '<span>'+esc(tx(uu[1]))+'</span>';}).join("")+'</div>'+rows+'</div>'+
   '<p class="note">'+esc(T2("Espérance = moyenne sur les tirages du réseau lié : chaque événement mondial en cours dans un tirage ajoute une valeur tirée dans sa fourchette (log-uniforme). Seuls les événements racines comptent : leurs conséquences en aval (pétrole, fret, faim) sont déjà dans leur fourchette, rien n'est compté deux fois. Les fourchettes viennent des sources citées ; les queues extrêmes (nucléaire, guerre totale) sont exclues et signalées. Les totaux sont des planchers : une case sans source compte pour 0, « ≥ » compte à sa valeur basse, « ≤ » n'est pas comptée.","Expectation = mean over the linked-network draws: each global event on in a draw adds a value drawn from its range (log-uniform). Only root events count: their downstream effects (oil, freight, hunger) are inside their range, so nothing is counted twice. Ranges come from the sources cited; extreme tails (nuclear, all-out war) are left out and flagged. Totals are floors: an unsourced cell counts as 0, “≥” counts at its low value, “≤” is not counted."))+'</p>';}

/* --- 3 · forecast record --- */
var FC=null;
function fcBands(){var o={};Object.keys(QUESTIONS).sort().forEach(function(k){var q=QUESTIONS[k];if(q.kind!=="ended")o[k]=[q.lo,q.hi];});return o;}
function fcLoad(){
  try{var d=new Date().toISOString().slice(0,10);if(localStorage.getItem("gra-fcday")!==d){localStorage.setItem("gra-fcday",d);relay("fc?v="+encodeURIComponent(JSON.stringify(fcBands())),12000).catch(function(){});}}catch(e){}
  relay("fc",12000).then(function(j){FC=j;},function(){FC={versions:[],outcomes:{},off:1};}).then(function(){try{updateGRI();}catch(e){}if(typeof anaSub!=="undefined"&&anaSub==="questions"&&document.querySelector("#v-ana .trk"))drawAna();});}
setTimeout(fcLoad,2500);
function fcOutcome(id){var q=QUESTIONS[id];if(!q)return null;if(q.out!=null)return {o:q.out,d:q.t,n:""};return (FC&&FC.outcomes&&FC.outcomes[id])||null;}
function fcForecast(id,until){var vs=(FC&&FC.versions)||[],q=QUESTIONS[id];
  var pts=vs.filter(function(v){return v.b&&v.b[id]&&v.d<=until;}).map(function(v){return {d:Date.parse(v.d),p:(v.b[id][0]+v.b[id][1])/200};});
  if(!pts.length)return {p:qMid(q)/100,n:0};var end=Date.parse(until),sum=0,w=0;
  pts.forEach(function(x,i){var e=i<pts.length-1?pts[i+1].d:end;var dt=Math.max(86400000,e-x.d);sum+=x.p*dt;w+=dt;});return {p:sum/w,n:pts.length};}
function fcRecord(){var res=[];Object.keys(QUESTIONS).forEach(function(k){var oc=fcOutcome(k);if(!oc)return;var f=fcForecast(k,oc.d||QUESTIONS[k].t);res.push({id:k,f:f.p,o:oc.o,b:Math.pow(f.p-oc.o,2),d:oc.d});});
  var br=res.length?res.reduce(function(s,x){return s+x.b;},0)/res.length:null;
  var B=[0,10,33,66,90,100],bins=B.slice(1).map(function(h,i){var xs=res.filter(function(x){var p=x.f*100;return p>=B[i]&&(p<h||(h===100&&p<=100));});return {lo:B[i],hi:h,n:xs.length,f:xs.length?xs.reduce(function(s,x){return s+x.f;},0)/xs.length:null,o:xs.length?xs.reduce(function(s,x){return s+x.o;},0)/xs.length:null};});
  var next=Object.keys(QUESTIONS).filter(function(k){return QUESTIONS[k].kind!=="ended"&&!fcOutcome(k);}).map(function(k){return QUESTIONS[k].t;}).sort();
  var by={};next.forEach(function(t){by[t]=(by[t]||0)+1;});
  return {res:res,brier:br,bins:bins,next:Object.keys(by).sort().slice(0,4).map(function(t){return [t,by[t]];}),vers:((FC&&FC.versions)||[]).length,total:Object.keys(QUESTIONS).filter(function(k){return QUESTIONS[k].kind!=="ended";}).length};}
function fmtDate(t){try{return new Date(t+"T12:00:00Z").toLocaleDateString(LOC(),{day:"numeric",month:"short",year:"numeric"});}catch(e){return t;}}
function trackLine(){var r=fcRecord();return esc(T2("Suivi : ","Track record: "))+r.res.length+' / '+r.total+esc(T2(" résolues"," resolved"))+' · '+esc(T2("Brier ","Brier "))+(r.brier==null?"—":nf(r.brier,3))+' · '+esc(T2("prochaine échéance ","next resolution "))+(r.next[0]?fmtDate(r.next[0][0])+' ('+r.next[0][1]+')':"—");}
function calibSvg(bins){var W=260,H=150,pad=26,o='<svg viewBox="0 0 '+W+' '+H+'" class="cal" role="img" aria-label="'+esc(T2("Calibration","Calibration"))+'">';
  var X=function(v){return pad+(W-pad-6)*v;},Y=function(v){return H-pad+-(H-pad-8)*v;};
  o+='<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(1)+'" y2="'+Y(1)+'" stroke="#3a4a5a" stroke-dasharray="3 3"/>';
  o+='<line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(1)+'" y2="'+Y(0)+'" stroke="#3a4a5a"/><line x1="'+X(0)+'" y1="'+Y(0)+'" x2="'+X(0)+'" y2="'+Y(1)+'" stroke="#3a4a5a"/>';
  bins.forEach(function(b){if(!b.n)return;o+='<circle cx="'+X(b.f).toFixed(1)+'" cy="'+Y(b.o).toFixed(1)+'" r="'+(3+Math.min(8,Math.sqrt(b.n)*2)).toFixed(1)+'" fill="#7fd1ff" fill-opacity=".75"/>';});
  o+='<text x="'+X(0.5)+'" y="'+(H-6)+'" fill="#8c9aa8" font-size="10" text-anchor="middle">'+esc(T2("probabilité annoncée","forecast probability"))+'</text>';
  o+='<text x="10" y="'+Y(0.5)+'" fill="#8c9aa8" font-size="10" text-anchor="middle" transform="rotate(-90 10 '+Y(0.5)+')">'+esc(T2("fréquence observée","observed frequency"))+'</text></svg>';return o;}
function trackCard(){var r=fcRecord();
  var tiles='<div class="mts"><div class="mt"><b class="mono">'+r.res.length+' / '+r.total+'</b><span>'+esc(T2("questions résolues","questions resolved"))+'</span></div>'+
   '<div class="mt"><b class="mono">'+(r.brier==null?"—":nf(r.brier,3))+'</b><span>'+esc(T2("score de Brier moyen","mean Brier score"))+'</span><small>'+esc(T2("0 = parfait · 0,25 = toujours dire 50 %","0 = perfect · 0.25 = always saying 50 %"))+'</small></div>'+
   '<div class="mt"><b class="mono">'+r.vers+'</b><span>'+esc(T2("versions des fourchettes archivées","band versions archived"))+'</span><small>'+esc(FC&&FC.off?T2("relais injoignable","relay unreachable"):T2("par le relais, à chaque changement","by the relay, on every change"))+'</small></div>'+
   '<div class="mt"><b class="mono">'+(r.next[0]?fmtDate(r.next[0][0]):"—")+'</b><span>'+esc(T2("prochaines échéances","next resolutions"))+'</span><small>'+r.next.map(function(x){return fmtDate(x[0])+' · '+x[1];}).join(" — ")+'</small></div></div>';
  var body=r.res.length?'<div class="mc2"><div>'+calibSvg(r.bins)+'</div><div>'+r.res.slice().sort(function(a,b){return a.d<b.d?1:-1;}).map(function(x){return '<div class="mcr" data-go="'+x.id+'"><span>'+(x.o?"✓ ":"✗ ")+esc(tx(QUESTIONS[x.id].q))+'</span><b class="mono">'+Math.round(x.f*100)+' % · '+nf(x.b,3)+'</b></div>';}).join("")+'</div></div>'+(r.res.length<10?'<p class="note">'+esc(T2("Moins de 10 résolutions : le score n'est pas encore significatif.","Fewer than 10 resolutions: the score is not meaningful yet."))+'</p>':''):'';
  return '<div class="card trk"><div class="ah"><h2>'+esc(T2("Le suivi : l'atlas a-t-il eu raison ?","Track record: was the atlas right?"))+'</h2></div>'+tiles+body+
   '<p class="note">'+esc(T2("Chaque question est notée à son échéance : score de Brier = (probabilité annoncée − résultat)², la probabilité étant la moyenne dans le temps des fourchettes publiées, archivées par le relais. La calibration compare, par tranche de probabilité, ce qui était annoncé et ce qui est arrivé : un atlas bien calibré suit la diagonale.","Each question is scored at its date: Brier score = (forecast probability − outcome)², the probability being the time-average of the published bands, archived by the relay. Calibration compares, per probability band, what was forecast and what happened: a well-calibrated atlas follows the diagonal."))+'</p></div>';}
/* resolved questions show their outcome */
(function(){var o=qRow;qRow=function(id,opt){var h=o(id,opt),oc=fcOutcome(id);if(!oc)return h;return h.replace(/<b class="mono">[^<]*<\/b>/,'<b class="mono" style="color:'+(oc.o?"#ff8a65":"#5fd39a")+'">'+(oc.o?"✓ ":"✗ ")+esc(oc.o?T2("oui","yes"):T2("non","no"))+'</b>');};})();
(function(){var o=anaQuestions;anaQuestions=function(el){o(el);var d=document.createElement("div");d.innerHTML=trackCard();el.insertBefore(d.firstChild,el.firstChild);};})();

/* scenario builder on the linked model: the shocks you set move their own events; the network carries the rest */
var MC_SC={};
(function(){var o=scenGRI;scenGRI=function(eff){if(!MC)return o(eff);
  var seed={};SHOCKS.forEach(function(sh){var a=shockVal(sh);if(!a)return;Object.keys(sh.src).forEach(function(id){if(MC.G.ix[id]==null)return;var w=a*sh.src[id];seed[id]=(seed[id]||0)+(sh.relief?-w:w);});});
  var key=JSON.stringify(seed);if(MC_SC[key])return MC_SC[key];
  var G=MC.G,a2=new Float64Array(MC.a),force={},S=0,Nrest=[];
  Object.keys(seed).forEach(function(id){var i=G.ix[id],w=Math.max(-1,Math.min(1,seed[id])),p=G.p[i],q=QUESTIONS[id];
    if(q.sys&&q.kind==="occur"&&w>=0.5){force[i]=1;return;}
    if(q.kind==="persist"&&w<=-0.4){force[i]=0;return;}
    var p2=w>=0?p+(1-p)*w:p*(1+0.6*w);a2[i]=MC.a[i]+mcLg(p2)-mcLg(p);});
  Object.keys(QUESTIONS).forEach(function(k){var q=QUESTIONS[k],i=G.ix[k];if(!q.sys||i==null)return;if(q.kind==="persist"){if(force[i]!==0)S++;}else if(force[i]===1)S++;else Nrest.push(i);});
  var n=MC_N/4,r=mcRun(G,MC.U,n,a2,1,force),c1=0,m=G.m;for(var d=0;d<n;d++){for(var j=0;j<Nrest.length;j++)if(r.S[d*m+Nrest[j]]){c1++;break;}}
  var Pm=100*c1/n,dl=MC.P1.mid-MC.P1.lo,dh=MC.P1.hi-MC.P1.mid,P={lo:Math.max(0,Pm-dl),mid:Pm,hi:Math.min(100,Pm+dh)};
  var lv=levelOf(S,P.mid,0),L_=LEVELS[lv-1];var g={tot:P.mid,band:lv-1,col:L_.c,level:lv,L:L_,S:S,P:P,c:[],linked:true};MC_SC[key]=g;return g;};})();
