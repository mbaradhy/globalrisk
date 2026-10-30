import json
a=open('app.html').read()
def r(x,y,cnt=1):
    global a
    assert x in a,x[:80]; a=a.replace(x,y,cnt)
iso=open('/tmp/claude-0/-home-claude/9f8c4616-27f1-5910-b924-209665f78c24/scratchpad/iso.json').read()
js=(open('questions.js').read()+open('analysis.js').read()+open('news.js').read()+open('gri2.js').read()+open('sources.js').read()+open('level.js').read()+(open('impact.js').read() if __import__('os').path.exists('impact.js') else '')+open('phase2.js').read()).replace('/*ISO*/null',iso)
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
@media(max-width:700px){#v-kit .tbl{overflow:visible}#v-kit .tbl table{width:100%!important;min-width:0!important}#v-kit .tbl thead{display:none}#v-kit .tbl table,#v-kit .tbl tbody,#v-kit .tbl tr,#v-kit .tbl td{display:block}#v-kit .tbl tr{padding:10px 0;border-bottom:1px solid var(--line)}#v-kit .tbl td{border:0!important;padding:2px 14px!important;height:auto!important}#v-kit .tbl td:first-child{font-weight:700;font-size:1.02rem;padding-bottom:4px!important}#v-kit .tbl td[data-l]::before{content:attr(data-l);display:block;font-size:.68rem;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-top:4px}}

@media(max-width:900px){#v-kit header.top{display:block!important;grid-template-columns:none!important}#v-kit header.top>*{max-width:100%;min-width:0}#v-kit header.top .lede{width:auto}}

.mct{display:grid;gap:2px;margin:6px 0 10px;font-size:.86rem}.mct>div{display:grid;grid-template-columns:minmax(0,2.2fr) 1fr 1.3fr 1.3fr;gap:8px;align-items:baseline;padding:5px 8px;background:var(--panel2);border-radius:6px}.mct .mch{background:none;color:var(--muted);font-size:.74rem;text-transform:uppercase;letter-spacing:.04em}.mct small{color:var(--muted);font-weight:400}
.mc2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin:6px 0}.mcr{display:flex;justify-content:space-between;gap:10px;padding:5px 8px;border-bottom:1px solid var(--line);font-size:.84rem;cursor:pointer}.mcr:hover{background:var(--panel2)}.mcr b{white-space:nowrap}
.imt{display:grid;gap:3px;margin:8px 0;font-size:.83rem;overflow-x:auto}.imr{display:grid;grid-template-columns:minmax(150px,1.6fr) repeat(4,minmax(86px,1fr));gap:8px;align-items:baseline;padding:6px 8px;background:var(--panel2);border-radius:6px;min-width:560px}.imr.imh{background:none;color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.03em}.imn{cursor:pointer}.imn small{display:block;color:var(--muted)}.ims{grid-column:1/-1;color:var(--muted);font-size:.76rem;line-height:1.4}.ims a{color:var(--accent)}.ims summary{cursor:pointer;color:var(--accent);font-size:.76rem}
.cal{width:100%;max-width:300px;height:auto}.trk .mts{margin-bottom:8px}
@media(max-width:600px){.mcr{flex-wrap:wrap;row-gap:2px}.mcr>span{flex:1 1 100%}.mct>div{grid-template-columns:minmax(0,1.6fr) 1fr 1.2fr;}.mct>div>:nth-child(4){display:none}}

.chain{gap:6px}.chain .ar{color:var(--accent);font-size:1.3rem;font-weight:800;line-height:1;margin:0 1px;text-shadow:0 0 6px rgba(127,209,255,.45)}[dir=rtl] .chain .ar{display:inline-block;transform:scaleX(-1)}

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
.qb{position:relative;display:block;height:10px;background:var(--panel2);border-radius:3px;min-width:90px}.qb span{position:absolute;top:0;bottom:0;border-radius:3px;opacity:.9}
.ql{display:flex;flex-direction:column}.qr{display:grid;grid-template-columns:minmax(0,2.2fr) minmax(90px,150px) auto auto;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid #1b2631;font-size:.9rem;cursor:pointer}.qr .qq small{display:block;color:var(--muted);font-size:.74rem}.qr b{white-space:nowrap;font-size:.86rem}
.qbox{display:flex;flex-direction:column;gap:6px;margin:8px 0;padding:10px;background:var(--panel2);border-radius:4px}.qbox .qq{font-weight:600}
.mts{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}.mt{display:flex;flex-direction:column;gap:2px;background:var(--panel2);border:1px solid var(--line);border-radius:6px;padding:10px 12px;text-decoration:none;color:var(--ink)}.mt:hover{border-color:var(--accent)}.mt b{font-size:1.6rem;font-weight:500;line-height:1.1}.mt span{font-weight:600;font-size:.9rem}.mt small{color:var(--muted);font-size:.74rem}.mt .src{color:var(--accent)}
.lvh{display:grid;grid-template-columns:minmax(260px,1fr) minmax(0,2fr);gap:14px;align-items:stretch}.lvbig{display:flex;align-items:center;gap:14px;border:2px solid;border-radius:8px;padding:12px 16px;background:var(--panel2)}.lvbig svg{width:110px;height:110px;flex:none}.lvbig b{display:block;font-family:'Barlow Condensed',sans-serif;font-size:1.6rem;letter-spacing:.04em;line-height:1.05}.lvbig small{display:block;color:var(--muted);font-size:.8rem;margin-top:4px}
.lvsp{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.gri-row{grid-template-columns:minmax(0,1fr)!important}
.gb2 h3{margin:14px 0 6px;font-size:1rem;display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
@media (max-width:1100px){.lvh{grid-template-columns:minmax(0,1fr)}}
@media (max-width:700px){.lvsp{grid-template-columns:minmax(0,1fr)}.qr{grid-template-columns:minmax(0,1fr) auto}.qr .qb{grid-column:1/-1}.qr .badge{grid-column:2;justify-self:end;white-space:normal;text-align:right;max-width:100%}.qr .qq{grid-column:1/-1}}
.ghc{display:flex;flex-wrap:wrap;gap:8px 22px}.ghc span{display:flex;flex-direction:column}.ghc small{color:var(--muted);font-size:.72rem}.ghc b{font-size:1.1rem}
.ghs{display:block;width:100%;height:auto}
.gri-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:stretch}
.gri-row>.card{margin:0}
@media (max-width:1100px){.gri-row{grid-template-columns:minmax(0,1fr)}}
#gri-hist .seg button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent)}
'''
r('''fetchRSS(L==="fr"?"fr":"en")''','''fetchRSSL()''')
r('''<div class="ticker" id="ticker" role="region" aria-label="News ticker"><span class="tk-l" id="tkl"></span><div class="tk-w"><div class="tk-t" id="tkt"></div></div></div>''','''<div class="ticker" id="ticker" role="region" aria-label="News ticker"><span class="tk-l" id="tkl"></span><div class="tk-w"><div class="tk-t" id="tkt"></div></div></div>
<div class="brk" id="brk" role="alert" hidden></div>''')
css+='''
/* breaking */
.brk{display:flex;align-items:center;gap:10px;margin:8px 0 0;padding:8px 12px;background:linear-gradient(90deg,rgba(224,72,58,.28),rgba(224,72,58,.08));border:1px solid #a8352b;border-radius:4px;min-width:0}
.brk[hidden]{display:none}
.brk-l{font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.12em;color:#fff;background:#e0483a;border-radius:3px;padding:2px 8px;flex:none;animation:brkp 1.6s ease-in-out infinite}
@keyframes brkp{50%{opacity:.55}}
.brk-k{font-size:.78rem;color:#ffb3aa;flex:none}.brk-t{color:var(--ink);font-weight:600;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}.brk-t:hover{text-decoration:underline}
.brk-m,.brk-x{font:inherit;font-size:.8rem;color:var(--ink);background:rgba(0,0,0,.25);border:1px solid #a8352b;border-radius:3px;padding:2px 8px;cursor:pointer;flex:none}
.brkc h2{display:flex;align-items:center;gap:8px}.brk-dot{width:9px;height:9px;border-radius:50%;background:#e0483a;animation:brkp 1.6s infinite}
.brk-i{border-bottom:1px solid #1b2631;padding:8px 0;display:flex;flex-direction:column;gap:4px}.brk-i a{color:var(--ink);text-decoration:none}.brk-i a:hover{text-decoration:underline}.brk-i ul{margin:2px 0 0;padding-left:18px;font-size:.86rem}
.brk-h{display:flex;gap:8px;align-items:center}.badge.crit{background:#e0483a;color:#fff;border-color:#e0483a}
@media (max-width:700px){.brk-k{display:none}.brk{gap:7px;padding:7px 9px}}
/* markets & my area */
.mrow{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:12px;align-items:start}
@media (max-width:1100px){.mrow{grid-template-columns:minmax(0,1fr)}}
.mkg{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:6px 14px}
.mk{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:4px 10px;align-items:baseline;border-bottom:1px solid #1b2631;padding:5px 0;font-size:.88rem}.mk small{grid-column:1/-1;margin-top:-3px}
.mkgg{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:4px 18px}.mkgr h4{margin:6px 0 2px;font-size:.74rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.mrow{grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)!important}
.status .feed{display:none!important}
.srcw{position:relative;display:inline-block}
.srcb{font:inherit;display:inline-flex;align-items:center;gap:7px;color:var(--ink);background:var(--panel);border:1px solid #3a4b5c;border-radius:4px;padding:4px 10px;cursor:pointer;line-height:1.2}
.srcb:hover,.srcb[aria-expanded="true"]{border-color:var(--accent)}.srcb i{width:8px;height:8px;border-radius:50%}.srcb .srl{font-family:'Barlow Condensed',sans-serif;font-weight:700;letter-spacing:.06em}.srcb .mono{font-size:.8rem}.srcb .srw{color:#ffb547}.srcb .lga{font-size:.7em;opacity:.7}
.srcp{position:absolute;right:0;top:calc(100% + 6px);z-index:85;width:min(760px,calc(100vw - 32px));max-height:75vh;overflow:auto;background:#111a25;border:1px solid var(--accent);border-radius:6px;padding:14px 16px;box-shadow:0 16px 40px rgba(0,0,0,.55);text-align:left}
.srcp[hidden]{display:none}
.srh{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px 14px;margin-bottom:6px}.srh b{font-family:'Barlow Condensed',sans-serif;font-size:1.3rem;letter-spacing:.04em}.srh .btn{margin-left:auto;padding:2px 8px}
.srg{columns:2 320px;column-gap:24px}.srgr{break-inside:avoid;margin-bottom:10px}.srgr h4{margin:6px 0 2px;font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em}
.srr{display:grid;grid-template-columns:10px minmax(0,1fr) auto;gap:9px;align-items:center;padding:6px 0;border-bottom:1px solid #1b2631}.srr>i{width:8px;height:8px;border-radius:50%}
.srr span{display:flex;flex-direction:column;min-width:0}.srr small{color:var(--muted);font-size:.74rem}.srs{align-items:flex-end}.srs em{font-style:normal;font-family:var(--f-mono);font-size:.62rem;text-transform:uppercase;border:1px solid;border-radius:3px;padding:1px 5px;white-space:nowrap}
[dir="rtl"] .srcp{right:auto;left:0}
@media (max-width:700px){.srcp{position:fixed;left:0;right:0;bottom:0;top:auto;width:auto;max-height:70vh;border-radius:16px 16px 0 0;border-width:1px 0 0}.srcb .srl{display:none}}
.mg h3{margin:10px 0 4px;font-size:1rem}.mgt{display:flex;flex-direction:column;overflow-x:auto}.mgh,.mgr{display:grid;grid-template-columns:minmax(150px,1fr) minmax(110px,.7fr) minmax(0,2.6fr);gap:12px;padding:7px 0;border-bottom:1px solid #1b2631;font-size:.88rem;min-width:560px}
.mgh{font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}.mgr .mono{font-size:.78rem;color:var(--accent)}
.mgo{margin:0;padding-left:20px;font-size:.9rem;display:flex;flex-direction:column;gap:4px}.mg p{margin:4px 0;font-size:.9rem}
.fxg{display:flex;flex-wrap:wrap;gap:6px}.fxc{display:inline-flex;gap:6px;align-items:baseline;background:var(--panel2);border-radius:4px;padding:4px 8px;font-size:.82rem}.fxc b{font-size:.78rem;color:var(--muted)}
.mkh{margin:6px 0 0;font-size:.95rem;display:flex;gap:8px;align-items:baseline}
.ar-in{display:flex;gap:8px;flex-wrap:wrap}.ar-in input{flex:1;min-width:160px;font:inherit;color:var(--ink);background:var(--panel2);border:1px solid var(--line);border-radius:4px;padding:7px 10px}
.ar-res{display:flex;flex-direction:column}.ar-res button{font:inherit;text-align:left;color:var(--ink);background:none;border:0;border-bottom:1px solid #1b2631;padding:7px 4px;cursor:pointer}.ar-res button:hover{background:var(--panel2)}.ar-res small{color:var(--muted)}
.wx{display:flex;align-items:center;gap:12px}.wx b{font-size:2rem}.wx>span:last-child{display:flex;flex-direction:column}.wxi{font-size:2rem;line-height:1}.wxi.s{font-size:1.3rem}
.wxd{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.wxd>div{background:var(--panel2);border-radius:4px;padding:6px;display:flex;flex-direction:column;align-items:center;gap:2px;font-size:.84rem}
.wr{display:flex;gap:9px;align-items:flex-start;text-decoration:none;color:var(--ink);border-bottom:1px solid #1b2631;padding:6px 0}.wr i{width:10px;height:10px;border-radius:50%;margin-top:5px;flex:none}.wr span{display:flex;flex-direction:column}
'''
r('''(L==="fr"?"Base structurelle = moyenne de gravité × probabilité des risques actifs, ramenée sur 100. Ajustements en direct : +2 par alerte GDACS rouge et +1 par orange (max +6) ; +1 par séisme ≥ M6,5 sur 7 jours (max +3) ; +2 si Kp ≥ 5, +4 si Kp ≥ 7 ; attention médiatique des 10 risques majeurs de −3 à +5. Paliers : < 40 modéré, 40–60 élevé, 60–75 haut, > 75 sévère.":"Structural baseline = average severity × likelihood of active risks, scaled to 100. Live adjustments: +2 per GDACS red alert and +1 per orange (max +6); +1 per M6.5+ earthquake in 7 days (max +3); +2 if Kp ≥ 5, +4 if Kp ≥ 7; media attention on the top 10 risks from −3 to +5. Bands: < 40 moderate, 40–60 elevated, 60–75 high, > 75 severe.")''','''T2("Un niveau de 1 à 5 fixé par une règle publiée (pas une somme), deux quantités avec unité — S, le nombre de perturbations mondiales en cours, et P, la chance d'au moins un nouveau choc mondial sous 12 mois — des mesures datées des agences, et une question vérifiable par risque avec sa fourchette de probabilité et sa source. Détails dans « Comment les chiffres sont établis » ci-dessus.","A level from 1 to 5 set by a published rule (not a sum), two quantities with units — S, the number of global disruptions under way, and P, the chance of at least one new global shock within 12 months — dated agency measurements, and one checkable question per risk with its probability range and source. Details under “How the numbers are made” above.")''')
css+='''
.gb2{display:flex;flex-direction:column;gap:12px}
.gn3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
.gn{font:inherit;color:var(--ink);text-align:left;background:var(--panel2);border:1px solid var(--line);border-radius:6px;padding:10px 12px;display:flex;flex-direction:column;gap:2px;cursor:pointer}
div.gn{cursor:default}button.gn:hover{border-color:var(--accent)}
.gn b{font-size:2rem;line-height:1.05}.gn b small{font-size:.9rem;color:var(--muted)}.gn span{font-weight:600}.gn small{color:var(--muted);font-size:.74rem}
.gb2c{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px}.gb2c h3{margin:0 0 6px;font-size:.95rem}
.gb2r{display:flex;gap:12px;align-items:center}.gb2r .gri-ring{width:110px;flex:none}.gb2r .gri-rows{flex:1;min-width:0}
.shr{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;border-bottom:1px solid #1b2631;padding:5px 0;font-size:.86rem;cursor:pointer}.shr b{font-size:1rem}
.gri-row{grid-template-columns:minmax(0,1fr)!important}
@media (max-width:1400px){.gb2c{grid-template-columns:minmax(0,1fr)}}
@media (max-width:700px){.gn3{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.gn3 .gn:last-child{grid-column:1/-1}.gn b{font-size:1.6rem}}
#gri-pop .gn3{grid-template-columns:minmax(0,1fr)}
'''
r('</style>',css+'</style>')
open('app.html','w').write(a)
print('analysis ok')
