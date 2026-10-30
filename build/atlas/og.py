# Preview card for WhatsApp / social links (og.png, 1200x630), drawn from the current questions at build time.
import json, subprocess, os, datetime
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("ATLAS_OG_OUT", "/home/claude/globalrisk/og.png")
st = json.loads(subprocess.check_output(["node", "-e", """
const fs=require('fs');eval(fs.readFileSync('%s/questions.js','utf8').replace(/^const /gm,'var '));
const k=Object.keys(QUESTIONS),S=k.filter(x=>QUESTIONS[x].sys&&QUESTIONS[x].kind==='persist'),N=k.filter(x=>QUESTIONS[x].sys&&QUESTIONS[x].kind==='occur');
let p=1;N.forEach(x=>{const q=QUESTIONS[x];p*=1-(q.lo+q.hi)/200;});console.log(JSON.stringify({S:S.length,P:100*(1-p),levels:LEVELS.map(l=>({k:l.k,c:l.c}))}));""" % HERE]))
S, P = st["S"], st["P"]
lv = 4 if (S >= 2 or (S >= 1 and P >= 50)) else 3 if (S >= 1 or P >= 33) else 2 if P >= 10 else 1
L = st["levels"][lv - 1]; col = L["c"]
F = "/usr/share/fonts/opentype/inter/"
f = lambda n, s: ImageFont.truetype(F + n, s)
W, H = 1200, 630
im = Image.new("RGB", (W * 2, H * 2), "#0a1018"); d = ImageDraw.Draw(im); s = 2
d.text((80 * s, 70 * s), "GLOBAL ", font=f("InterDisplay-Bold.otf", 64 * s), fill="#e3e9ee")
x = 80 * s + d.textlength("GLOBAL ", font=f("InterDisplay-Bold.otf", 64 * s))
d.text((x, 70 * s), "RISK ", font=f("InterDisplay-Bold.otf", 64 * s), fill="#7fd1ff")
x += d.textlength("RISK ", font=f("InterDisplay-Bold.otf", 64 * s))
d.text((x, 70 * s), "ATLAS", font=f("InterDisplay-Bold.otf", 64 * s), fill="#e3e9ee")
cx, cy, r, w = 230 * s, 360 * s, 120 * s, 22 * s
for i in range(5):
    d.arc([cx - r, cy - r, cx + r, cy + r], -90 + i * 72 + 8, -90 + (i + 1) * 72 - 8, fill=col if i < lv else "#1d2a37", width=w)
fn = f("InterDisplay-Bold.otf", 130 * s); tw = d.textlength(str(lv), font=fn)
d.text((cx - tw / 2, cy - 82 * s), str(lv), font=fn, fill=col)
en = {"en": L["k"].get("en", ""), "fr": L["k"].get("fr", "")}
d.text((420 * s, 255 * s), ("LEVEL %d · %s" % (lv, en["en"])).upper(), font=f("InterDisplay-Bold.otf", 58 * s), fill=col)
d.text((420 * s, 330 * s), ("NIVEAU %d · %s" % (lv, en["fr"])).upper(), font=f("InterDisplay-SemiBold.otf", 36 * s), fill="#c8a06a")
d.text((420 * s, 400 * s), "%d global disruptions under way" % S, font=f("Inter-Medium.otf", 25 * s), fill="#c9d3dc")
d.text((420 * s, 440 * s), "%d perturbations mondiales en cours" % S, font=f("Inter-Medium.otf", 25 * s), fill="#c9d3dc")
d.text((420 * s, 490 * s), "56 checkable questions · live map · 14-day reserve", font=f("Inter-Regular.otf", 25 * s), fill="#8c9aa8")
d.text((80 * s, 560 * s), "mbaradhy.github.io/globalrisk · " + datetime.date.today().strftime("%d %b %Y"), font=f("Inter-Medium.otf", 24 * s), fill="#5d6b78")
im.resize((W, H), Image.LANCZOS).save(OUT, optimize=True)
print("og.png level", lv, "S", S, "P %.0f" % P)

# ---- embeddable badge (widget.html): level from S (build time) and the latest P from the relay
WOUT = os.environ.get("ATLAS_WIDGET_OUT", os.path.join(os.path.dirname(OUT), "widget.html"))
lv_json = json.dumps([{"k": l["k"], "c": l["c"]} for l in st["levels"]], ensure_ascii=False)
w = """<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Global Risk Atlas · level</title>
<style>html,body{margin:0;background:#0a1018;color:#e3e9ee;font:14px/1.3 Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif}a{color:inherit;text-decoration:none;display:flex;align-items:center;gap:12px;padding:10px 14px;border:1px solid #24323f;border-radius:12px;height:70px;box-sizing:border-box}
b{display:block;font-size:17px;letter-spacing:.02em}small{color:#8c9aa8;font-size:12px}em{font-style:normal;color:#7fd1ff}</style></head><body>
<a id="w" href="https://mbaradhy.github.io/globalrisk/" target="_blank" rel="noopener"></a>
<script>
var S=%d,P0=%.1f,LV=%s,lang=(new URLSearchParams(location.search).get("lang")||navigator.language||"en").slice(0,2)=="fr"?"fr":"en";
function lvOf(p){return S>=2||(S>=1&&p>=50)?4:(S>=1||p>=33)?3:p>=10?2:1;}
function ring(l,c){var s=50,r=20,o='<svg width="50" height="50" viewBox="0 0 50 50">';for(var i=0;i<5;i++){var a0=(-90+i*72+8)*Math.PI/180,a1=(-90+(i+1)*72-8)*Math.PI/180;o+='<path d="M'+(25+r*Math.cos(a0))+' '+(25+r*Math.sin(a0))+' A20 20 0 0 1 '+(25+r*Math.cos(a1))+' '+(25+r*Math.sin(a1))+'" fill="none" stroke="'+(i<l?c:'#1d2a37')+'" stroke-width="5" stroke-linecap="round"/>';}
 return o+'<text x="25" y="26" text-anchor="middle" dominant-baseline="middle" fill="'+c+'" font-size="20" font-weight="700">'+l+'</text></svg>';}
function draw(p,live){var l=lvOf(p),L=LV[l-1],t=lang=="fr";document.getElementById("w").innerHTML=ring(l,L.c)+'<span><b style="color:'+L.c+'">'+(t?"NIVEAU ":"LEVEL ")+l+' · '+(L.k[lang]||L.k.en).toUpperCase()+'</b><small>'+S+(t?" perturbations mondiales en cours · P ":" global disruptions under way · P ")+Math.round(p)+' %%'+(live?"":" ≈")+'</small><br><small><em>Global Risk Atlas</em> ↗</small></span>';}
draw(P0,false);
fetch("https://atlas-api.mbaradhy.workers.dev/gri?s=3&days=2").then(function(r){return r.json();}).then(function(j){var p=j.points||[];if(p.length)draw(p[p.length-1][1],true);}).catch(function(){});
</script></body></html>""" % (S, P, lv_json)
open(WOUT, "w").write(w)
print("widget.html written")
