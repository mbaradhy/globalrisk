// In the 14-day reserve script, wrap the text pieces of English strings built with numbers so they translate too.
const fs=require('fs'),acorn=require(process.env.SP+'/node_modules/acorn'),walk=require(process.env.SP+'/node_modules/acorn-walk');
const src=fs.readFileSync(process.argv[2],'utf8');const ast=acorn.parse(src,{ecmaVersion:2020});const ed=[];
walk.full(ast,n=>{if(n.type!=="ObjectExpression")return;const p=n.properties.find(x=>x.key&&(x.key.name||x.key.value)==="en");const f=n.properties.find(x=>x.key&&(x.key.name||x.key.value)==="fr");
  if(!p||!f||p.value.type!=="BinaryExpression")return;
  walk.full(p.value,x=>{if(x.type==="Literal"&&typeof x.value==="string"&&/[A-Za-z]{2}/.test(x.value)){const t=src.slice(x.start,x.end);ed.push([x.start,x.end,"(window.TRk?TRk("+t+"):"+t+")"]);}});});
ed.sort((a,b)=>b[0]-a[0]);let out=src;ed.forEach(e=>{out=out.slice(0,e[0])+e[2]+out.slice(e[1]);});fs.writeFileSync(process.argv[3],out);console.log('kit edits',ed.length);
