const fs=require('fs'),acorn=require('acorn'),walk=require('acorn-walk');
const html=fs.readFileSync('/home/claude/global-risk-atlas.html','utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const S=new Map();
const ok=s=>typeof s==="string"&&s.trim()&&/[A-Za-z]{2}/.test(s)&&!/^(en|en-GB|fr|fr-FR)$/.test(s.trim())&&!/^https?:\/\//.test(s.trim());
const add=(en,fr,src)=>{if(!ok(en))return;const e=S.get(en);if(!e)S.set(en,{fr:(typeof fr==="string"&&fr!==en)?fr:undefined,src});else if(!e.fr&&typeof fr==="string"&&fr!==en)e.fr=fr;};
const val=n=>n&&n.type==="Literal"&&typeof n.value==="string"?n.value:null;
function pair(enN,frN,src){ // walk en node, pair with fr node when same shape
  if(!enN)return;
  if(enN.type==="Literal"){add(enN.value,val(frN),src);return;}
  if(enN.type==="ArrayExpression"){enN.elements.forEach((e,i)=>pair(e,frN&&frN.type==="ArrayExpression"?frN.elements[i]:null,src));return;}
  if(enN.type==="ObjectExpression"){const fm={};if(frN&&frN.type==="ObjectExpression")frN.properties.forEach(p=>{if(p.key)fm[p.key.name||p.key.value]=p.value;});enN.properties.forEach(p=>{if(p.key)pair(p.value,fm[p.key.name||p.key.value],src);});return;}
  if(enN.type==="BinaryExpression"&&enN.operator==="+"){walk.full(enN,x=>{if(x.type==="Literal"&&typeof x.value==="string")add(x.value,null,src+"-part");});return;}
  walk.full(enN,x=>{if(x.type==="Literal"&&typeof x.value==="string")add(x.value,null,src+"-other");});
}
const isL=t=>t&&t.type==="BinaryExpression"&&/^===?$/.test(t.operator)&&t.left.type==="Identifier"&&t.left.name==="L"&&t.right.value==="fr";
for(const sc of scripts){const main=sc;const ast=acorn.parse(sc,{ecmaVersion:2020});walk.full(ast,n=>{
  if(n.type==="ObjectExpression"){const m={};n.properties.forEach(p=>{if(p.key)m[p.key.name||p.key.value]=p.value;});if(m.fr&&m.en)pair(m.en,m.fr,"obj");}
  if(n.type==="ConditionalExpression"&&isL(n.test))pair(n.alternate,n.consequent,"tern");
  if(n.type==="CallExpression"&&n.callee.name==="T2"&&n.arguments[1])pair(n.arguments[1],n.arguments[0],"T2");
  if(n.type==="CallExpression"&&n.callee.type==="MemberExpression"&&n.callee.object.name==="Object"&&n.callee.property.name==="assign"&&n.arguments[0]&&main.slice(n.arguments[0].start,n.arguments[0].end)==="UI.en")pair(n.arguments[1],null,"UI");
});}
// static kit spans: fr span followed by en span
const re=/<(\w+)\b[^>]*\blang="fr"[^>]*>([\s\S]*?)<\/\1>\s*<(\w+)\b[^>]*\blang="en"[^>]*>([\s\S]*?)<\/\3>/g;let m,kc=0;
while((m=re.exec(html))){add(m[4],m[2],"kit");kc++;}
const rest=[...html.matchAll(/<(\w+)\b[^>]*\blang="en"[^>]*>([\s\S]*?)<\/\1>/g)];rest.forEach(x=>add(x[2],null,"kit"));
const out=[];let chars=0;for(const [en,v] of S){out.push(v.fr?{en,fr:v.fr}:{en});chars+=en.length;}
fs.writeFileSync('i18n/strings.json',JSON.stringify(out,null,1));
console.log('strings',out.length,'chars',chars,'with fr',out.filter(x=>x.fr).length,'kit pairs',kc);
console.log([...S.values()].reduce((a,v)=>(a[v.src]=(a[v.src]||0)+1,a),{}));
