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
