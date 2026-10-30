import json
a=open('app.html').read()
def r(x,y,cnt=1):
    global a
    assert x in a,x[:80]; a=a.replace(x,y,cnt)
iso=open('/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/iso.json').read()
js=open('analysis.js').read().replace('/*ISO*/null',iso)
# tab + view
r('''  <button role="tab" data-t="kit" aria-selected="false">''','''  <button role="tab" data-t="ana" aria-selected="false"><svg class="ti" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg><span data-i="tAna"></span></button>
  <button role="tab" data-t="kit" aria-selected="false">''')
r('''    <div data-v="method" id="v-method" class="scroll" hidden></div>''','''    <div data-v="method" id="v-method" class="scroll" hidden></div>
    <div data-v="ana" id="v-ana" class="scroll" hidden></div>''')
r('''["dash","brief","news","matrix","method"].indexOf(t)>=0''','''["dash","brief","news","matrix","method","ana"].indexOf(t)>=0''')
r('''  if(t==="news")drawNews();\n''','''  if(t==="news")drawNews();
  if(t==="ana")drawAna();
  if(t!=="globe"&&typeof lyrOpen==="function")lyrOpen(false);
  document.querySelector(".stage").classList.toggle("ana",t==="ana");
''')
# globe: outages as points, particles, init
r('''  if(p.k==="q")return "#c9a27a";''','''  if(p.k==="o")return "#a98af6";
  if(p.k==="q")return "#c9a27a";''')
r('''    live.gdacs.forEach(function(e){pts.push({k:"g",e:e,lat:e.lat,lng:e.lng});});
  }''','''    live.gdacs.forEach(function(e){pts.push({k:"g",e:e,lat:e.lat,lng:e.lng});});
  }
  if(typeof LYR!=="undefined"&&LYR.outages)LDATA.outages.forEach(function(o){pts.push({k:"o",lat:o.lat,lng:o.lng,e:{title:o.name+(o.cause?" — "+o.cause:""),src:"Cloudflare Radar"+(o.type?" · "+o.type:""),when:(o.start||"").slice(0,10)+(o.end?" → "+o.end.slice(0,10):" → "+(L==="fr"?"en cours":"ongoing")),url:o.url}});});''')
r('''    sizeGlobe();refreshGlobe();
  }catch(err)''','''    sizeGlobe();refreshGlobe();
    setTimeout(function(){if(typeof lyrInit==="function")lyrInit();},300);
  }catch(err)''')
r('''  G.pointsData(globePoints()).arcsData(arcsData());''','''  G.pointsData(globePoints()).arcsData(arcsData());
  if(typeof lyrApply==="function")lyrApply();''')
# language refresh
r('''function setLang(l){L=l;''','''function setLang(l){L=l;setTimeout(function(){if(tab==="ana")drawAna();if(typeof lyrPanel==="function")lyrPanel();},0);''')
# js before boot
r('''/* ---------- boot ---------- */''',js+'''
/* ---------- boot ---------- */''')
css='''
/* ---- analysis ---- */
.asub{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}
.asub button,.seg button{font:inherit;font-size:.86rem;color:#c7d2dc;background:var(--panel2);border:1px solid var(--line);border-radius:16px;padding:6px 13px;cursor:pointer}
.asub button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#0a1018;font-weight:600}
.seg{display:flex;flex-wrap:wrap;gap:5px}
.seg button{font-size:.8rem;padding:4px 11px}
.seg button[aria-pressed="true"]{background:var(--warn);border-color:var(--warn);color:#0a1018;font-weight:600}
.ah{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;gap:4px 10px}
.ah h2{margin:0;font-family:var(--f-head,'Barlow Condensed',sans-serif);font-size:1.15rem;letter-spacing:.04em;text-transform:uppercase}
.agrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,340px);gap:14px;align-items:start}
.agrid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}
.agrid3{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr) minmax(240px,320px);gap:14px;align-items:start}
.aside{display:flex;flex-direction:column;gap:14px;min-width:0}
.scen-l{position:sticky;top:0}
#v-ana .agrid:has(.scen-l){grid-template-columns:minmax(280px,360px) minmax(0,1fr)}
.scen-r{display:flex;flex-direction:column;gap:14px;min-width:0}
.shk{display:flex;flex-direction:column;gap:6px;border-top:1px solid var(--line);padding-top:10px}
.shk-h{display:flex;justify-content:space-between;gap:8px;font-weight:600;font-size:.92rem}
.shk-h b{font-family:var(--f-mono);font-size:.78rem;color:var(--warn);font-weight:500;white-space:nowrap}
.shk input[type=range],#tt-r{width:100%;accent-color:var(--warn)}
.sw{display:flex;gap:8px;align-items:center;font-size:.86rem;cursor:pointer}.sw input{width:18px;height:18px;accent-color:var(--warn)}
.row-b{display:flex;flex-wrap:wrap;gap:8px}
.btn.ok{background:var(--ok);color:#0a1018;border-color:var(--ok);font-weight:600}
.btn.crit{background:#e0483a;color:#fff;border-color:#e0483a;font-weight:600;text-decoration:none;align-self:flex-start}
.btn[disabled]{opacity:.45;cursor:default}
.gri2{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.gri2>div{display:flex;flex-direction:column;align-items:center;gap:2px}.gri2 h3{margin:0;font-size:1rem}.gri2 .arr{font-size:1.5rem;color:var(--muted)}
.hhg{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.hh{background:var(--panel2);border-radius:4px;padding:7px 9px;display:flex;flex-direction:column;font-size:.88rem}
.itab{display:flex;flex-direction:column}.irow{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) minmax(0,1.3fr);gap:10px;padding:7px 0;border-bottom:1px solid #1b2631;font-size:.9rem;cursor:pointer;align-items:center}.irow small{color:var(--muted)}
.mono{font-family:var(--f-mono)}
.gnt{display:grid;grid-template-columns:minmax(120px,210px) minmax(0,1fr);gap:5px 12px;align-items:center}
.gax{position:relative;height:16px;font-family:var(--f-mono);font-size:.68rem;color:var(--muted)}.gax span{position:absolute;transform:translateX(-50%)}.gax span:first-child{transform:none}
.gl{font:inherit;font-size:.84rem;color:var(--ink);background:none;border:0;padding:0;text-align:left;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gb{position:relative;height:16px;background:var(--panel2);border-radius:3px}.gb i{position:absolute;top:0;bottom:0;right:0;border-radius:3px}.gv{position:absolute;right:6px;top:0;font-family:var(--f-mono);font-size:.66rem;line-height:16px;color:#0a1018;mix-blend-mode:normal;text-shadow:0 0 2px rgba(255,255,255,.4)}
.go,[data-go]{cursor:pointer}
.ttmap{position:relative}.ttmap svg{display:block;width:100%;height:auto;background:#0d1620;border-radius:4px}
.ttdate{position:absolute;left:12px;top:8px;font-size:clamp(1.2rem,3vw,2rem);color:#fff;text-shadow:0 2px 8px #000;pointer-events:none}
.ttc{display:flex;gap:12px;align-items:center}.ttp{width:42px;height:42px;border-radius:50%;padding:0;flex:none;background:var(--accent);color:#0a1018;border:0;font-size:1rem}
.ttax{position:relative;height:16px;font-family:var(--f-mono);font-size:.68rem;color:var(--muted)}.ttax span{position:absolute}
.kp2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.kp2>div{background:var(--panel2);border-radius:4px;padding:8px 10px;display:flex;flex-direction:column}.kp2 b{font-size:1.5rem}
.ttev{display:flex;flex-direction:column;max-height:380px;overflow:auto}.ttev button{font:inherit;font-size:.86rem;color:var(--ink);background:none;border:0;border-bottom:1px solid #1b2631;padding:6px 2px;display:grid;grid-template-columns:78px minmax(0,1fr);gap:8px;text-align:left;cursor:pointer}.ttev button .mono{font-size:.72rem;color:var(--warn)}.ttev button[aria-current="true"]{background:rgba(255,181,71,.12)}
.ctop{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:center;margin-bottom:12px}.cn{margin:0;font-family:'Barlow Condensed',sans-serif;font-size:2.2rem;letter-spacing:.03em;line-height:1}
.badge{font-family:var(--f-mono);font-size:.7rem;border:1px solid var(--line);border-radius:3px;padding:3px 8px;color:var(--muted)}.badge.warn{background:var(--warn);color:#0a1018;border-color:var(--warn)}.badge.okb{background:var(--ok);color:#0a1018;border-color:var(--ok)}
.cpick{position:relative;margin-left:auto;flex:0 1 300px;min-width:200px}.cpick input{width:100%;box-sizing:border-box;font:inherit;color:var(--ink);background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:7px 14px}
.clist{display:none;position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:20;background:var(--panel);border:1px solid var(--line);border-radius:6px;max-height:300px;overflow:auto;box-shadow:0 10px 30px rgba(0,0,0,.5)}.clist.open{display:block}
.clist button{display:flex;justify-content:space-between;width:100%;font:inherit;font-size:.9rem;color:var(--ink);background:none;border:0;border-bottom:1px solid #1b2631;padding:7px 12px;text-align:left;cursor:pointer}.clist button:hover,.clist button[aria-selected="true"]{background:var(--panel2)}.clist small{color:var(--muted)}
.xbar{font:inherit;color:var(--ink);background:none;border:0;padding:3px 0;display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr) 42px;gap:10px;align-items:center;text-align:left;cursor:pointer;font-size:.88rem}.xbar>span:first-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.xb{height:11px;background:var(--panel2);border-radius:3px;display:block}.xb i{display:block;height:100%;border-radius:3px}.xbar .mono{font-size:.78rem;text-align:right}
.kn{font-size:.86rem}.kn small{color:var(--muted)}
a.hl{display:block;text-decoration:none;color:var(--ink);border-bottom:1px solid #1b2631;padding:0 0 8px;font-size:.9rem}a.hl .mono{display:block;font-size:.66rem;color:var(--accent);text-transform:uppercase}
.cal1{display:grid;grid-template-columns:66px minmax(0,1fr);gap:8px;border-bottom:1px solid #1b2631;padding:5px 0;font-size:.88rem}.cal1 .mono{font-size:.74rem;color:var(--warn)}
.atop{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;align-items:center}
.hm{display:grid;grid-template-columns:minmax(110px,180px) minmax(0,1fr) 36px;gap:4px 10px;align-items:center;overflow-x:auto}
.hl0{font:inherit;font-size:.82rem;color:var(--ink);background:none;border:0;padding:0;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.hrow{display:grid;grid-template-columns:repeat(var(--nd),minmax(6px,1fr));gap:2px;min-width:0}.hrow span{height:20px;border-radius:2px}
.hn{font-size:.72rem;color:var(--muted);text-align:right}.hax{display:flex;justify-content:space-between;font-size:.66rem;color:var(--muted)}
.lg{display:inline-block;width:120px;height:9px;border-radius:2px;background:linear-gradient(90deg,rgba(127,209,255,.06),rgba(127,209,255,.94))}
.ctab{display:flex;flex-direction:column;overflow-x:auto}.ch,.cr{display:grid;grid-template-columns:minmax(130px,1.4fr) 70px 80px minmax(140px,1.8fr) 64px;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid #1b2631;font-size:.88rem;min-width:560px}
.ch{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;border-bottom-color:var(--line)}.cr .mono{font-size:.76rem}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px;vertical-align:middle}
.fds{display:flex;flex-wrap:wrap;gap:12px;font-size:.84rem}.fdot i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}
.cbar{display:flex;height:14px;border-radius:3px;overflow:hidden}.cbar i{display:block}
.tier{display:grid;grid-template-columns:96px 34px minmax(0,1fr);gap:8px;align-items:center;font-size:.86rem}.tg{font-family:var(--f-mono);font-size:.64rem;color:#0a1018;border-radius:3px;padding:2px 6px;text-align:center}
.lvst{display:flex;flex-direction:column;gap:6px}.lvr{display:flex;justify-content:space-between;gap:10px;align-items:center;border-bottom:1px solid #1b2631;padding:5px 0;font-size:.9rem}
.lyb{display:inline-flex;align-items:center;gap:5px;font-size:.82rem;padding:4px 10px}.lyb .ti{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round}
.lyr{position:absolute;right:10px;top:10px;z-index:25;width:min(320px,calc(100% - 20px));max-height:calc(100% - 60px);overflow:auto;background:rgba(13,22,32,.96);border:1px solid var(--line);border-radius:6px;padding:12px;display:flex;flex-direction:column;gap:9px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.lyr[hidden]{display:none}
.lmg{display:grid;grid-template-columns:minmax(240px,300px) minmax(0,1fr);gap:14px;align-items:start}
.lml .seg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent)}
.lmc{overflow:hidden}
#v-ana .card{min-width:0}
.stage.wide #v-ana{position:relative;inset:auto;height:auto;overflow:visible;padding:0}
.lmw{position:relative}.lmw canvas{display:block;width:100%;border-radius:4px;background:#0d1620;cursor:grab}.lmw canvas:active{cursor:grabbing}
.lmz{position:absolute;left:10px;top:10px;display:flex;flex-direction:column;gap:4px}.lmz .btn{width:34px;height:34px;padding:0;font-size:1.1rem;background:rgba(13,22,32,.9)}
.lmo{position:absolute;right:10px;bottom:10px;width:min(270px,calc(100% - 20px));background:rgba(13,22,32,.95);border:1px solid var(--warn);border-radius:5px;padding:10px;display:flex;flex-direction:column;gap:7px}
.lmo[hidden]{display:none}.lmi{top:10px;bottom:auto;border-color:#ffd25a}
.kp3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;font-size:.74rem;color:var(--muted)}.kp3 b{display:block;color:var(--ink);font-size:.95rem}
.lmo .btn{text-decoration:none;color:var(--ink)}
.lmh{display:flex;justify-content:space-between;align-items:baseline}.lmh b{font-family:'Barlow Condensed',sans-serif;letter-spacing:.04em}
.lmin .kp2 b{font-size:1.2rem}.lmleg{display:flex;flex-wrap:wrap;gap:12px}
@media (max-width:1100px){.lmw{grid-template-columns:minmax(0,1fr)}}
@media (max-width:900px){.lmg{grid-template-columns:minmax(0,1fr)}}
.toggles.lyopen{visibility:hidden}
.ring{width:96px;height:96px}.ring svg{display:block;width:100%;height:100%}
.xbar small{display:block;color:var(--muted);font-size:.72rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lyh{display:flex;justify-content:space-between;align-items:center}.lyh .btn{padding:2px 8px}
.ly{display:flex;gap:9px;align-items:flex-start;border-top:1px solid #1b2631;padding-top:8px;cursor:pointer;font-size:.9rem}.ly input{width:17px;height:17px;accent-color:var(--accent);margin-top:2px;flex:none}.ly small{display:block;color:var(--muted);font-size:.74rem}
.ais{border-top:1px solid #1b2631;padding-top:8px;display:flex;flex-direction:column;gap:3px}.aisr{display:flex;justify-content:space-between;font-size:.86rem}.aisr small{color:var(--muted)}
@media (max-width:1100px){.agrid3{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.agrid3>.aside{grid-column:1/-1}}
@media (max-width:900px){.agrid,.agrid3,#v-ana .agrid:has(.scen-l){grid-template-columns:minmax(0,1fr)}.scen-l{position:static}.cpick{margin-left:0;flex:1 1 100%}}
@media (max-width:700px){.irow{grid-template-columns:minmax(0,1fr) auto;}.irow>span:last-child{grid-column:1/-1;font-size:.82rem}.gnt{grid-template-columns:minmax(96px,130px) minmax(0,1fr)}.hhg{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.cn{font-size:1.8rem}.lyr{top:auto;bottom:10px;max-height:60%}}
'''
r('''   '<div class="card" id="gri-dash">'+griBig()+'</div>'+''','''   '<div class="gri-row"><div class="card" id="gri-dash">'+griBig()+'</div>'+
   '<div class="card" id="gri-hist"></div></div>'+''')
r('''  var gd=document.getElementById("gri-dash");if(gd)gd.innerHTML=griBig();
}''','''  var gd=document.getElementById("gri-dash");if(gd)gd.innerHTML=griBig();
  if(typeof griRecord==="function")griRecord(g);
}''')
r('''  if(t==="ana")drawAna();''','''  if(t==="ana")drawAna();
  if(t==="dash"&&typeof drawGriHist==="function")setTimeout(drawGriHist,0);''')
css+='''
.ghc{display:flex;flex-wrap:wrap;gap:8px 22px}.ghc span{display:flex;flex-direction:column}.ghc small{color:var(--muted);font-size:.72rem}.ghc b{font-size:1.1rem}
.ghs{display:block;width:100%;height:auto}
.gri-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:stretch}
.gri-row>.card{margin:0}
@media (max-width:1100px){.gri-row{grid-template-columns:minmax(0,1fr)}}
#gri-hist .seg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent)}
'''
r('</style>',css+'</style>')
open('app.html','w').write(a)
print('analysis ok')
