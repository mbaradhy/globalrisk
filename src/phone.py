a=open('app.html').read()
def r(x,y):
    global a
    assert x in a,x[:70]; a=a.replace(x,y,1)
# GRI big card: ring | head ; rows below on phone
r('''function griBig(){var g=griLast||computeGRI();return '<div class="gri-big">'+griRing(g,150,13,true)+'<div><h2 style="margin:0 0 6px">'+esc(u("gri"))+'</h2>'+griRows(g)+'<p class="note" style="margin-top:6px">'+esc(u("griHow"))+'</p></div></div>';}''',
'''function griBig(){var g=griLast||computeGRI();return '<div class="gri-big"><div class="gri-ring">'+griRing(g,150,13,true)+'</div><div class="gri-head"><h2 style="margin:0">'+esc(u("gri"))+'</h2><p class="note">'+esc(u("griHow"))+'</p></div><div class="gri-rows">'+griRows(g)+'</div></div>';}''')
# live tag shows how many feeds are connected
r('''document.getElementById("livet").textContent=new Date().toTimeString().slice(0,5);''','''var fs=document.querySelectorAll(".status .feed"),ok=document.querySelectorAll(".status .feed.ok").length;document.getElementById("livet").textContent=ok+"/"+fs.length+" · "+new Date().toTimeString().slice(0,5);''')
# filters only where they matter
r('''document.getElementById("filters").hidden=t==="kit";document.getElementById("ftoggle").hidden=t==="kit";''','''var nf_=["globe","net","mind","matrix"].indexOf(t)<0;document.getElementById("filters").hidden=nf_;document.getElementById("ftoggle").hidden=nf_;''')
r('</style>','''
.lang{font-size:.82rem;border-width:1px;border-color:#3a4b5c}.lang button{padding:3px 9px;line-height:1.2}
.gri-big{display:grid;grid-template-columns:150px minmax(0,1fr);grid-template-areas:"ring head" "ring rows";gap:6px 22px;align-items:start}
.gri-ring{grid-area:ring;align-self:center}.gri-head{grid-area:head;display:flex;flex-direction:column;gap:4px}.gri-rows{grid-area:rows}
@media (max-width:700px){
  header.top{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"brand gri" "status status";gap:8px 10px;align-items:center;padding-bottom:8px}
  .brand{grid-area:brand;min-width:0}.gri-wrap{grid-area:gri}.status{grid-area:status;justify-content:space-between;flex-wrap:nowrap}
  .brand h1{font-size:1.28rem;white-space:nowrap}
  .byline{font-size:.6rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .status .feed{display:none}
  .livetag{font-size:.72rem;padding:3px 8px}
  .gri{gap:6px;padding:3px 10px 3px 3px}
  .gri svg{width:36px;height:36px}
  .gri-t b{font-size:.8rem}
  .gri-t small{font-size:0;line-height:0}
  .gri-t small .gri-live{display:none}
  .gri-pop{left:auto;right:0}
  .gri-big{grid-template-columns:92px minmax(0,1fr);grid-template-areas:"ring head" "rows rows";gap:10px 14px}
  .gri-ring svg{width:92px!important;height:92px!important}
  .gri-head h2{font-size:1.05rem}
  .gri-rows .cmp{grid-template-columns:minmax(0,1fr) 46px;font-size:.82rem;padding-bottom:4px}
  .gri-rows .cmp small{font-size:.68rem}
  .card h2{font-size:1.05rem}
  .tabs button{font-size:.82rem;padding:12px 9px 11px;letter-spacing:.03em}
  #ftoggle{align-self:flex-start}
  .kpi div[style*="height:56px"]{height:auto!important;min-height:24px;font-size:.72rem!important;flex-wrap:wrap;gap:4px!important}
  .kpi .k-h{gap:4px}
  .lang{font-size:.68rem;letter-spacing:.04em}.lang button{padding:2px 7px!important;line-height:1.3}
}
</style>''')
open('app.html','w').write(a)
print('phone ok')

# ---- phone bottom navigation: icons + clearer tab bar
import re as _re
a=open('app.html').read()
IC={
 "dash":'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 "brief":'<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7M9 7h4"/>',
 "news":'<rect x="3" y="5" width="15" height="15" rx="1.5"/><path d="M18 9h3v9a2 2 0 0 1-2 2M6 9h9M6 13h9M6 17h6"/>',
 "globe":'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
 "net":'<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="7" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7.3 6.3l9.4.6M6.3 8.2l4.6 7.6M17.8 9.2l-4.6 6.7"/>',
 "mind":'<circle cx="12" cy="12" r="2.5"/><circle cx="4" cy="5" r="1.8"/><circle cx="20" cy="5" r="1.8"/><circle cx="4" cy="19" r="1.8"/><circle cx="20" cy="19" r="1.8"/><path d="M10 10.3L5.4 6.3M14 10.3l4.6-4M10 13.7l-4.6 4M14 13.7l4.6 4"/>',
 "matrix":'<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 9h18M3 15h18M9 3v18"/>',
 "kit":'<path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><rect x="4" y="7" width="16" height="14" rx="3"/><path d="M4 12h16M12 10v4"/>',
 "method":'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'
}
def rep(m):
    t,sel,key=m.group(1),m.group(2),m.group(3)
    return '<button role="tab" data-t="%s" aria-selected="%s"><svg class="ti" viewBox="0 0 24 24" aria-hidden="true">%s</svg><span data-i="%s"></span></button>'%(t,sel,IC[t],key)
a,n=_re.subn(r'<button role="tab" data-t="(\w+)" aria-selected="(\w+)" data-i="(\w+)"></button>',rep,a)
assert n==9,n
a=a.replace('</style>','''
.tabs button{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;font-size:1rem}
.tabs .ti{display:block;width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;opacity:.85}
.tabs button[aria-selected="true"] .ti{opacity:1;stroke:var(--accent)}
@media (max-width:700px){
  .tabs{background:#152131!important;border-top:1px solid #2d4053!important;box-shadow:0 -8px 24px rgba(0,0,0,.45);gap:2px;padding-top:5px!important}
  .tabs button{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:70px;flex:0 0 auto;
    font-family:var(--f-body)!important;font-size:.74rem!important;font-weight:600!important;letter-spacing:0!important;text-transform:none!important;
    color:#a9b7c4!important;padding:6px 6px 7px!important;border:0!important;border-radius:10px;margin-bottom:4px}
  .tabs .ti{display:block;width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
  .tabs button[aria-selected="true"]{color:var(--accent)!important;background:rgba(127,209,255,.14)}
  .tabs button[aria-selected="true"] .ti{stroke-width:2}
  .wrap{padding-bottom:calc(84px + env(safe-area-inset-bottom,0px))!important}
  .gri-float{bottom:calc(78px + env(safe-area-inset-bottom,0px))!important}
}
</style>''',1)
open('app.html','w').write(a)
print('phone nav ok')
