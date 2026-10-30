/* ---------- watchlist ---------- */
var WL=null;try{WL=JSON.parse(localStorage.getItem("gra-wl"));}catch(e){}
if(!Array.isArray(WL))WL=["hormuz","eu-gas","ukr-war","hybrid","el-nino"];
function saveWL(){try{localStorage.setItem("gra-wl",JSON.stringify(WL));}catch(e){}}
function toggleWL(id){var i=WL.indexOf(id);if(i>=0)WL.splice(i,1);else WL.push(id);saveWL();var on_=WL.indexOf(id)>=0;var b=document.getElementById("star");if(b){b.setAttribute("aria-pressed",on_);b.textContent=u(on_?"following":"follow");}if(tab==="dash")drawDash();if(on_)loadAttention();}

/* ---------- helpers ---------- */
var MONTHS={Jan:"janv.",Feb:"févr.",Mar:"mars",Apr:"avr.",May:"mai",Jun:"juin",Jul:"juil.",Aug:"août",Sep:"sept.",Oct:"oct.","late Aug":"fin août","pre-war":"avant-guerre","2027f":"2027p"};
function lbl(x){if(L!=="fr")return x;return String(x).replace(/late Aug|pre-war|2027f|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct/g,function(m){return MONTHS[m]||m;});}
function nf(v,d){return Number(v).toLocaleString(L==="fr"?"fr-FR":"en-GB",{minimumFractionDigits:d,maximumFractionDigits:d});}
function gdDate(s){var m=/^(\d{4})(\d\d)(\d\d)T(\d\d)(\d\d)(\d\d)Z$/.exec(s||"");return m?Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5],+m[6]):Date.parse(s);}
function ago(ts){if(!ts)return "";var m=Math.round((Date.now()-ts)/60000);if(m<60)return m+" min";var h=Math.round(m/60);if(h<48)return h+" h";return Math.round(h/24)+" "+(L==="fr"?"j":"d");}
function gNews(q){return "https://news.google.com/search?q="+encodeURIComponent(q.replace(/[()"]/g," ").replace(/\s+OR\s+/g," OR ").replace(/\s+/g," ").trim())+(L==="fr"?"&hl=fr&gl=FR&ceid=FR:fr":"&hl=en-GB&gl=GB&ceid=GB:en");}
function gdHtml(q){return "https://api.gdeltproject.org/api/v2/doc/doc?query="+encodeURIComponent(q)+"&mode=artlist&maxrecords=75&timespan=3d&sort=datedesc";}

/* ---------- GDELT queue (GDELT asks for one request every ~5 s) ---------- */
var GD="https://api.gdeltproject.org/api/v2/doc/doc",gdQ=[],gdBusy=false,gdLast=0,gdOk=null,newsCache={},volCache={};
try{var vc=JSON.parse(localStorage.getItem("gra-vol")||"{}");if(vc&&vc.at&&Date.now()-vc.at<3*3600e3)volCache=vc.v||{};}catch(e){}
function gdelt(params,prio){return new Promise(function(res,rej){var job={params:params,res:res,rej:rej};if(prio)gdQ.unshift(job);else gdQ.push(job);gdPump();});}
function gdPump(){
  if(gdBusy||!gdQ.length)return;gdBusy=true;
  var wait=Math.max(0,gdLast+5300-Date.now());
  setTimeout(function(){var job=gdQ.shift();gdLast=Date.now();
    tFetch(GD+"?"+job.params+"&format=json",15000).then(function(j){gdOk=true;badge("fd-gdelt","ok",u("updated")+" "+fmt(Date.now()));job.res(j);},
      function(e){if(gdOk!==true){gdOk=false;badge("fd-gdelt","off","");}job.rej(e);})
     .then(function(){gdBusy=false;gdPump();},function(){gdBusy=false;gdPump();});
  },wait);
}
function fetchArts(q,span,lang,prio,max){
  var qq=q+(lang==="fr"?" sourcelang:french":lang==="en"?" sourcelang:english":"");
  var key=qq+"|"+span;var c=newsCache[key];
  if(c&&Date.now()-c.at<15*60e3)return Promise.resolve(c.v);
  return gdelt("query="+encodeURIComponent(qq)+"&mode=artlist&maxrecords="+(max||40)+"&timespan="+span+"&sort=datedesc",prio).then(function(j){
    var seen={};var v=(j.articles||[]).filter(function(a){var k=(a.title||"").toLowerCase().slice(0,60);if(!a.title||seen[k])return false;seen[k]=1;return true;})
      .map(function(a){return {title:a.title,url:a.url,ts:gdDate(a.seendate),dom:a.domain,lang:a.language,ctry:a.sourcecountry};});
    newsCache[key]={at:Date.now(),v:v};return v;});
}
function artHtml(a,node){return '<div class="art"><span class="t">'+esc(ago(a.ts))+'</span><span><a href="'+esc(a.url)+'" target="_blank" rel="noopener">'+esc(a.title)+'</a><small>'+esc(a.dom||"")+(a.lang?" · "+esc(a.lang):"")+(node?' · <span style="color:'+col(node)+'">'+esc(tx(node.t))+'</span>':"")+'</small></span></div>';}
function outLinks(q){return '<div class="outl"><a href="'+esc(gNews(q))+'" target="_blank" rel="noopener">'+esc(u("openG"))+' ↗</a><a href="'+esc(gdHtml(q))+'" target="_blank" rel="noopener">'+esc(u("openD"))+' ↗</a></div>';}
function panelNews(id){
  var el=document.getElementById("pnews");if(!el)return;var q=NEWSQ[id];if(!q){el.innerHTML="";return;}
  if(gdOk===false){el.innerHTML='<p class="note">'+esc(u("nofeed"))+'</p>'+outLinks(q);return;}
  fetchArts(q,"3d","",true,12).then(function(v){if(sel!==id)return;var e2=document.getElementById("pnews");if(!e2)return;
    e2.innerHTML=(v.length?v.slice(0,6).map(function(a){return artHtml(a);}).join(""):'<p class="empty">—</p>')+outLinks(q);},
   function(){if(sel!==id)return;var e2=document.getElementById("pnews");if(e2)e2.innerHTML='<p class="note">'+esc(u("nofeed"))+'</p>'+outLinks(q);});
}

/* ---------- media attention (timelinevol) ---------- */
function attIds(){var a=BRIEF.top.slice();WL.forEach(function(x){if(a.indexOf(x)<0)a.push(x);});return a;}
var attRunning=false;
function loadAttention(force){
  if(attRunning&&!force)return;attRunning=true;
  var ids=attIds().filter(function(id){return force||!volCache[id];});
  (function next(i){
    if(i>=ids.length||gdOk===false){attRunning=false;if(tab==="dash")drawDash();if(tab==="news")drawAtt();return;}
    var id=ids[i];
    gdelt("query="+encodeURIComponent(NEWSQ[id])+"&mode=timelinevol&timespan=1m",false).then(function(j){
      var d=(j.timeline&&j.timeline[0]&&j.timeline[0].data)||[];var vals=d.map(function(x){return +x.value||0;});
      if(vals.length>4){var n=vals.length,k=Math.max(1,Math.round(n*0.1));var recent=vals.slice(n-k).reduce(function(a,b){return a+b;},0)/k;var avg=vals.reduce(function(a,b){return a+b;},0)/n;
        volCache[id]={r:avg>0?recent/avg:1,s:vals};try{localStorage.setItem("gra-vol",JSON.stringify({at:Date.now(),v:volCache}));}catch(e){}}
      if(tab==="dash")drawDash();if(tab==="news")drawAtt();
      next(i+1);
    },function(){next(i+1);});
  })(0);
}
function spark(vals,w,h){if(!vals||vals.length<2)return "";var mx=Math.max.apply(null,vals)||1;var pts=vals.map(function(v,i){return (i/(vals.length-1)*w).toFixed(1)+","+(h-1-(v/mx)*(h-3)).toFixed(1);}).join(" ");return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true"><polyline fill="none" stroke="#7fd1ff" stroke-width="1.2" points="'+pts+'"/></svg>';}
function spkBadge(id){var v=volCache[id];if(!v)return '<span class="spk cool">–</span>';var r=v.r;return '<span class="spk '+(r>=1.6?"hot":r>=1.2?"warm":"cool")+'">'+(r>=1?"↑":"↓")+" ×"+nf(r,1)+'</span>';}

/* ---------- news tab ---------- */
var nScope="top",nLang="",nSpan="1d";
function drawNews(){
  var el=document.getElementById("v-news");
  var opts='<option value="top">'+esc(u("scopeTop"))+'</option><option value="wl">'+esc(u("scopeWl"))+'</option>'+NODES.slice().sort(function(a,b){return tx(a.t).localeCompare(tx(b.t));}).map(function(n){return '<option value="'+n.id+'">'+esc(tx(n.t))+'</option>';}).join("");
  el.innerHTML='<div class="news"><div class="card"><h2>'+esc(u("spikeH"))+'</h2><p class="note">'+esc(u("spikeN"))+'</p><div class="att" id="att"></div></div>'+
   '<div class="card"><h2>'+esc(u("newsH"))+'</h2><div class="ctl"><label>'+esc(u("scope"))+' <select id="n-scope">'+opts+'</select></label>'+
   '<label>'+esc(u("lang_"))+' <select id="n-lang"><option value="">'+esc(u("all"))+'</option><option value="fr">'+esc(u("fren"))+'</option><option value="en">'+esc(u("enen"))+'</option></select></label>'+
   '<label>'+esc(u("span"))+' <select id="n-span"><option value="1d">'+esc(u("h24"))+'</option><option value="3d">'+esc(u("d3"))+'</option><option value="7d">'+esc(u("d7"))+'</option></select></label></div>'+
   '<p class="note">'+esc(u("newsN"))+'</p><div class="arts" id="arts"><p class="empty">'+esc(u("loading"))+'</p></div></div>'+
   '<div class="card" style="grid-column:1/-1"><h2>'+esc(u("rwH"))+'</h2><div class="arts" id="rw"></div></div></div>';
  document.getElementById("n-scope").value=nScope;document.getElementById("n-lang").value=nLang;document.getElementById("n-span").value=nSpan;
  drawAtt();loadArts();drawRW();
}
document.getElementById("v-news").addEventListener("change",function(e){
  if(e.target.id==="n-scope")nScope=e.target.value;else if(e.target.id==="n-lang")nLang=e.target.value;else if(e.target.id==="n-span")nSpan=e.target.value;else return;loadArts();});
document.getElementById("v-news").addEventListener("click",function(e){var g=e.target.closest("[data-go]");if(g)select(g.dataset.go,false);});
function drawAtt(){
  var el=document.getElementById("att");if(!el)return;
  var ids=attIds().sort(function(a,b){return ((volCache[b]||{}).r||0)-((volCache[a]||{}).r||0);});
  el.innerHTML=ids.map(function(id){var n=byId[id];return '<div data-go="'+id+'"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</span>'+(volCache[id]?spark(volCache[id].s,80,20):'<span class="note">'+(gdOk===false?"—":esc(u("loading")))+'</span>')+spkBadge(id)+'</div>';}).join("")+
   (gdOk===false?'<p class="note" style="margin-top:8px">'+esc(u("nofeed"))+'</p>':"");
}
function loadArts(){
  var el=document.getElementById("arts");if(!el)return;el.innerHTML='<p class="empty">'+esc(u("loading"))+'</p>';
  var jobs=[],tag=nScope+nLang+nSpan;
  if(nScope==="top"){jobs=[{q:'("Strait of Hormuz" OR Iran OR Ukraine OR "El Nino" OR Sudan OR Taiwan OR Ebola OR "gas prices" OR "food prices" OR sabotage)',n:null}];}
  else if(nScope==="wl"){jobs=WL.slice(0,6).map(function(id){return {q:NEWSQ[id],n:byId[id]};});}
  else jobs=[{q:NEWSQ[nScope],n:byId[nScope]}];
  Promise.all(jobs.map(function(j){return fetchArts(j.q,nSpan,nLang,true,nScope==="wl"?15:60).then(function(v){return v.map(function(a){a.node=j.n;return a;});},function(){return null;});}))
   .then(function(res){if(tag!==nScope+nLang+nSpan)return;var e2=document.getElementById("arts");if(!e2)return;
     if(res.every(function(x){return x===null;})){e2.innerHTML='<p class="note">'+esc(u("nofeed"))+'</p>'+jobs.map(function(j){return outLinks(j.q);}).join("");drawAtt();return;}
     var all=[].concat.apply([],res.filter(Boolean)).sort(function(a,b){return b.ts-a.ts;}).slice(0,60);
     e2.innerHTML=all.length?all.map(function(a){return artHtml(a,a.node);}).join(""):'<p class="empty">—</p>';});
}

/* ---------- ReliefWeb ---------- */
var rw=null;
function loadReliefWeb(){
  tFetch("https://api.reliefweb.int/v2/reports?appname=global-risk-atlas&profile=list&preset=latest&limit=12",12000)
   .then(function(j){rw=(j.data||[]).map(function(d){var f=d.fields||{};return {title:f.title,url:f.url_alias||f.url||("https://reliefweb.int/node/"+d.id),ts:Date.parse((f.date&&(f.date.created||f.date.original))||""),dom:(f.source&&f.source[0]&&(f.source[0].shortname||f.source[0].name))||"ReliefWeb"};});if(tab==="news")drawRW();})
   .catch(function(){rw=false;if(tab==="news")drawRW();});
}
function drawRW(){var el=document.getElementById("rw");if(!el)return;
  if(rw===null){el.innerHTML='<p class="empty">'+esc(u("loading"))+'</p>';return;}
  if(rw===false||!rw.length){el.innerHTML='<p class="note">'+esc(u("rwOff"))+'</p><div class="outl"><a href="https://reliefweb.int/updates" target="_blank" rel="noopener">ReliefWeb ↗</a></div>';return;}
  el.innerHTML=rw.map(function(a){return artHtml(a);}).join("");}

/* ---------- prediction markets (Polymarket) ---------- */
var mkts=null;
function loadMarkets(){
  tFetch("https://gamma-api.polymarket.com/events?closed=false&active=true&limit=400&order=volume24hr&ascending=false",12000).then(function(j){
    var out=[];(Array.isArray(j)?j:(j.data||[])).forEach(function(ev){
      var tl=(ev.title||"").toLowerCase();if(!MKT_KEYS.some(function(k){return tl.indexOf(k)>=0;}))return;
      var ms=(ev.markets||[]).filter(function(m){return !m.closed;});if(!ms.length)return;
      ms.sort(function(a,b){return (+b.volume||0)-(+a.volume||0);});var m=ms[0];
      var pr=m.outcomePrices;try{if(typeof pr==="string")pr=JSON.parse(pr);}catch(e){pr=null;}
      var p=pr&&pr.length?parseFloat(pr[0]):NaN;if(isNaN(p))return;
      out.push({q:m.question||ev.title,p:p,vol:+ev.volume||+m.volume||0,end:(m.endDate||ev.endDate||"").slice(0,10),url:"https://polymarket.com/event/"+ev.slug});
    });
    mkts=out.sort(function(a,b){return b.vol-a.vol;}).slice(0,14);badge("fd-poly",mkts.length?"ok":"stale",u("updated")+" "+fmt(Date.now()));if(tab==="dash")drawDash();
  }).catch(function(){mkts=false;badge("fd-poly","off","");if(tab==="dash")drawDash();});
}

/* ---------- dashboard ---------- */
function kpiDelta(k){
  if(!k.bench.length)return "";var b=k.bench[0];var bad;
  if(k.unit==="$/b"||k.unit==="€/MWh"||k.unit==="Mb"){var r=k.now/b.v;bad=(k.bad==="up"?r>1.15:r<0.85);
    return '<span class="'+(bad?"crit":"okc")+'">'+(r>=1?"×"+nf(r,1):"−"+Math.round((1-r)*100)+" %")+'</span> '+esc(u("vs"))+" "+esc(tx(b.l));}
  var d=k.now-b.v;bad=(k.bad==="up"?d>0:d<0);
  return '<span class="'+(bad?"crit":"okc")+'">'+(d>=0?"+":"−")+nf(Math.abs(d),k.dec)+" "+esc(k.unit)+'</span> '+esc(u("vs"))+" "+esc(tx(b.l));
}
function kpiChart(k){
  if(!k.bench.length){if(k.series.length<2)return '<div style="height:56px"></div>';
    return '<div style="height:56px;display:flex;align-items:center;gap:10px;font-family:var(--f-mono);font-size:.8rem;color:var(--muted)">'+k.series.map(function(x){return esc(lbl(x[0]))+' <b style="color:var(--ink)">'+nf(x[1],k.dec)+' '+esc(k.unit)+'</b>';}).join(' → ')+'</div>';}
  var W=220,H=56,pl=2,pr=2,pt=8,pb=12;var vals=k.series.map(function(x){return x[1];});var bv=k.bench.map(function(b){return b.v;});
  var all=vals.concat(bv);var lo=Math.min.apply(null,all),hi=Math.max.apply(null,all);if(k.unit==="%"||k.unit==="pts"||k.unit==="°C"||k.unit==="$/b"||k.unit==="€/MWh"||k.unit==="Mb")lo=Math.min(lo,0);
  if(hi===lo)hi=lo+1;var y=function(v){return pt+(1-(v-lo)/(hi-lo))*(H-pt-pb);};
  var c=col(byId[k.node]);var bl=k.bench.map(function(b,i){var yy=y(b.v).toFixed(1);return '<line x1="0" x2="'+W+'" y1="'+yy+'" y2="'+yy+'" stroke="#8c9aa8" stroke-dasharray="3 3" stroke-width="0.8"/><text x="'+(W-2)+'" y="'+(+yy-2)+'" text-anchor="end" fill="#8c9aa8">'+esc(tx(b.l))+'</text>';}).join("");
  if(vals.length<3){
    var x0=pl,x1=W-pr;var xs=function(v){return x0+(v-lo)/(hi-lo)*(x1-x0);};
    var ticks=k.bench.map(function(b){var xx=xs(b.v).toFixed(1);return '<line x1="'+xx+'" x2="'+xx+'" y1="16" y2="34" stroke="#8c9aa8" stroke-width="1"/><text x="'+xx+'" y="46" text-anchor="middle" fill="#8c9aa8">'+esc(nf(b.v,k.dec))+'</text>';}).join("");
    var prev=vals.length===2?'<circle cx="'+xs(vals[0]).toFixed(1)+'" cy="25" r="3" fill="none" stroke="'+c+'"/>':"";
    return '<svg viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><rect x="'+x0+'" y="22" width="'+(x1-x0)+'" height="6" rx="3" fill="#16212e"/><rect x="'+x0+'" y="22" width="'+Math.max(2,xs(k.now)-x0).toFixed(1)+'" height="6" rx="3" fill="'+c+'"/>'+ticks+prev+'<circle cx="'+xs(k.now).toFixed(1)+'" cy="25" r="4.5" fill="'+c+'" stroke="#0a1018" stroke-width="1.5"/></svg>';
  }
  var pts=vals.map(function(v,i){return [pl+i/(vals.length-1)*(W-pl-pr),y(v)];});
  var line=pts.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ");
  var area="M"+pts[0][0].toFixed(1)+","+(H-pb)+" L"+line.split(" ").join(" L")+" L"+pts[pts.length-1][0].toFixed(1)+","+(H-pb)+" Z";
  var last=pts[pts.length-1];
  return '<svg viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><path d="'+area+'" fill="'+hexA(c,.14)+'"/>'+bl+'<polyline points="'+line+'" fill="none" stroke="'+c+'" stroke-width="1.6"/><circle cx="'+last[0].toFixed(1)+'" cy="'+last[1].toFixed(1)+'" r="3.2" fill="'+c+'" stroke="#0a1018" stroke-width="1.2"/>'+
    '<text x="'+pl+'" y="'+(H-2)+'" fill="#5d6b78">'+esc(lbl(k.series[0][0]))+'</text><text x="'+(W-pr)+'" y="'+(H-2)+'" text-anchor="end" fill="#5d6b78">'+esc(lbl(k.series[k.series.length-1][0]))+'</text></svg>';
}
function drawDash(){
  var el=document.getElementById("v-dash");if(!el||tab!=="dash")return;
  /* KPI tiles */
  var kp=INDICATORS.map(function(k){var n=byId[k.node];
    return '<div class="kpi" data-go="'+k.node+'" style="border-top-color:'+col(n)+'"><div class="k-h"><span>'+esc(tx(k.t))+'</span><span>'+esc(lbl(k.nowD))+'</span></div>'+
     '<div class="k-v">'+nf(k.now,k.dec)+'<small>'+esc(k.unit)+'</small></div><div class="k-d">'+kpiDelta(k)+'</div>'+kpiChart(k)+'<div class="k-n">'+esc(tx(k.note))+'</div></div>';}).join("");
  /* live tiles */
  var qk=live.quakes,mx=qk.reduce(function(a,e){return Math.max(a,e.mag||0);},0);
  var lv='<div class="kpi" data-tab="globe" style="border-top-color:#c9a27a"><div class="k-h"><span>'+esc(u("quakes7"))+'</span><span class="okc">USGS</span></div><div class="k-v">'+(qk.length?qk.length:"–")+(qk.length?'<small>'+esc(u("max"))+' M'+nf(mx,1)+'</small>':"")+'</div><div class="k-n">'+(qk.length?"":esc(u("nolive")))+'</div></div>'+
   '<div class="kpi" data-tab="globe" style="border-top-color:#ffb547"><div class="k-h"><span>'+esc(u("gdacsA"))+'</span><span class="okc">GDACS</span></div><div class="k-v">'+(live.gdacs.length?live.gdacs.length:"–")+'</div><div class="k-n">'+(live.gdacs.length?esc(live.gdacs.slice(0,2).map(function(g){return g.title;}).join(" · ")):esc(u("nolive")))+'</div></div>'+
   '<div class="kpi" data-go="space" style="border-top-color:#c9a27a"><div class="k-h"><span>'+esc(u("kpL"))+'</span><span class="okc">NOAA</span></div><div class="k-v '+(live.kp>=5?"crit":"")+'">'+(live.kp!=null?nf(live.kp,1):"–")+'</div><div class="k-n">'+(live.kp!=null?"":esc(u("nolive")))+'</div></div>';
  /* domain stress */
  var st=Object.keys(DOMAINS).map(function(d){var ns=NODES.filter(function(n){return n.d===d&&n.st!=="ended";});if(!ns.length)return null;
    var v=Math.round(100*ns.reduce(function(a,n){return a+n.sv*n.lk;},0)/ns.length/25);return {d:d,v:v,e:ns.filter(function(n){return n.st==="escalating";}).length,n:ns.length};}).filter(Boolean).sort(function(a,b){return b.v-a.v;});
  var stH=st.map(function(x){return '<div class="bar" data-dom="'+x.d+'"><span>'+esc(tx(DOMAINS[x.d]))+'<small>'+x.n+' · '+x.e+' '+esc(u("escal"))+'</small></span><b><i style="width:'+x.v+'%;background:'+DOMAINS[x.d].c+'"></i></b><span>'+x.v+'</span></div>';}).join("");
  /* France exposure */
  var fr=[],tot=0;NODES.forEach(function(n){if(n.id==="fr-households")return;var b=computeCascade(n.id)["fr-households"];if(!b)return;var v=b.imp*n.sv*n.lk/25;tot+=v;fr.push({n:n,v:v,b:b});});
  fr.sort(function(a,b){return b.v-a.v;});
  var frH=fr.slice(0,8).map(function(x){var pct=Math.round(100*x.v/tot);return '<div class="bar" data-go="'+x.n.id+'"><span>'+esc(tx(x.n.t))+'<small>'+(x.b.hop)+' '+(L==="fr"?"étape(s)":"step(s)")+' · +'+x.b.t+' '+esc(u("months"))+'</small></span><b><i style="width:'+Math.min(100,pct*3)+'%;background:'+col(x.n)+'"></i></b><span>'+pct+'%</span></div>';}).join("");
  /* forecasts */
  var fcRows=FORECASTS.map(function(f){var w=f.p==null?0:Math.round(f.p*100);var c=f.type==="off"?"var(--accent)":"var(--warn)";
    return '<div class="fc" data-go="'+f.node+'"><span><span class="tp '+f.type+'">'+esc(u(f.type))+'</span>'+esc(tx(f.q))+'<small>'+esc(f.by)+'</small></span><b><i style="width:'+w+'%;background:'+c+'"></i></b><span class="pv">'+(f.p==null?esc(tx(f.txt)):(f.pre||"")+Math.round(f.p*100)+"%")+'</span></div>';}).join("");
  var mk=mkts===null?'<p class="empty">'+esc(u("loading"))+'</p>':(mkts===false||!mkts.length)?'<p class="note">'+esc(u("mktOff"))+'</p>':
    mkts.map(function(m){return '<div class="fc"><span><span class="tp mkt">'+esc(u("mkt"))+'</span><a href="'+esc(m.url)+'" target="_blank" rel="noopener">'+esc(m.q)+'</a><small>Polymarket'+(m.end?" · "+esc(m.end):"")+'</small></span><b><i style="width:'+Math.round(m.p*100)+'%;background:#e46fb4"></i></b><span class="pv">'+Math.round(m.p*100)+'%</span></div>';}).join("");
  /* calendar */
  var today=new Date();today.setHours(0,0,0,0);
  var cal=CAL.filter(function(c){return Date.parse((c.end||c.d)+"T23:59:59")>=today.getTime();}).map(function(c){var dd=Math.round((Date.parse(c.d+"T00:00:00")-today.getTime())/86400e3);var n=byId[c.node];
    var cd=dd<=0?(c.end?(L==="fr"?"en cours":"ongoing"):u("today")):(L==="fr"?"J-"+dd:dd+" d");
    var dt=new Date(c.d+"T12:00:00").toLocaleDateString(L==="fr"?"fr-FR":"en-GB",{day:"numeric",month:"short",year:c.d.slice(0,4)!=="2026"?"numeric":undefined});
    return '<div data-go="'+c.node+'"><span class="cd">'+(c.approx?"≈ ":"")+esc(cd)+'</span><span class="dt">'+esc(dt)+'</span><span><span style="color:'+col(n)+'">●</span> '+esc(tx(c.t))+'</span></div>';}).join("");
  /* watchlist */
  var wl=WL.filter(function(id){return byId[id];}).map(function(id){var n=byId[id];return '<div><span class="nm" data-go="'+id+'"><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+' <span class="pill '+n.st+'" style="margin-left:4px">'+esc(u("status")[n.st])+'</span></span>'+spkBadge(id)+'<button type="button" class="x" data-unwl="'+id+'" aria-label="Remove">✕</button></div>';}).join("")||'<p class="empty">—</p>';
  /* spikes */
  var sp=attIds().filter(function(id){return volCache[id]&&volCache[id].r>=1.2;}).sort(function(a,b){return volCache[b].r-volCache[a].r;});
  var spH=sp.length?sp.map(function(id){var n=byId[id];return '<div data-go="'+id+'"><span><span style="color:'+col(n)+'">●</span> '+esc(tx(n.t))+'</span>'+spark(volCache[id].s,80,20)+spkBadge(id)+'</div>';}).join(""):'<p class="note">'+(gdOk===false?esc(u("nofeed")):Object.keys(volCache).length?"—":esc(u("loading")))+'</p>';
  el.innerHTML='<div class="dash">'+
   '<div class="card"><h2>'+esc(u("kpiH"))+'</h2><div class="kpis">'+kp+'</div></div>'+
   '<div class="card"><h2>'+esc(u("liveH"))+'</h2><div class="kpis">'+lv+'</div></div>'+
   '<div class="grid2"><div class="card"><h2>'+esc(u("stressH"))+'</h2><div class="bars">'+stH+'</div></div><div class="card"><h2>'+esc(u("frH"))+'</h2><p class="note">'+esc(u("frN"))+'</p><div class="bars">'+frH+'</div></div></div>'+
   '<div class="card"><h2>'+esc(u("fcH"))+'</h2><p class="note">'+esc(u("fcN"))+'</p><div>'+fcRows+'</div><h2 style="margin-top:8px;font-size:1.05rem">'+esc(u("mktH"))+'</h2><div>'+mk+'</div></div>'+
   '<div class="grid3"><div class="card"><h2>'+esc(u("calH"))+'</h2><div class="cal">'+cal+'</div></div><div class="card"><h2>'+esc(u("wlH"))+'</h2><p class="note">'+esc(u("wlN"))+'</p><div class="wl">'+wl+'</div></div><div class="card"><h2>'+esc(u("spikeH"))+'</h2><p class="note">'+esc(u("spikeN"))+'</p><div class="att">'+spH+'</div></div></div>'+
   '</div>';
}
document.getElementById("v-dash").addEventListener("click",function(e){
  var x=e.target.closest("[data-unwl]");if(x){toggleWL(x.dataset.unwl);drawDash();return;}
  var t=e.target.closest("[data-tab]");if(t){showTab(t.dataset.tab);return;}
  var d=e.target.closest("[data-dom]");if(d){Object.keys(on).forEach(function(k){on[k]=(k===d.dataset.dom);});renderFilters();refreshAll();showTab("matrix");return;}
  var g=e.target.closest("[data-go]");if(g&&!e.target.closest("a"))select(g.dataset.go,false);
});
