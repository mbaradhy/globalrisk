// Rewrites FR/EN ternaries so other languages go through the translation table. Usage: node i18n_ast.js in.js out.js
const fs=require('fs'),acorn=require(process.env.SP+'/node_modules/acorn'),walk=require(process.env.SP+'/node_modules/acorn-walk');
const src=fs.readFileSync(process.argv[2],'utf8');const ast=acorn.parse(src,{ecmaVersion:2020});
const isL=t=>t&&t.type==="BinaryExpression"&&/^===?$/.test(t.operator)&&t.left.type==="Identifier"&&t.left.name==="L"&&t.right.value==="fr";
const ed=[];
walk.full(ast,n=>{if(n.type!=="ConditionalExpression"||!isL(n.test))return;const c=n.consequent,a=n.alternate;
  if(a.type==="Literal"&&a.value==="en-GB"){ed.push([n.start,n.end,"LOC()"]);return;}
  if(a.type==="Literal"&&a.value==="en")return;
  if(a.type==="MemberExpression"&&src.slice(a.start,a.end)==="c[3]")return;
  ed.push([a.start,a.start,"TRx("]);ed.push([a.end,a.end,")"]);});
ed.sort((x,y)=>y[0]-x[0]||y[1]-x[1]);let out=src;ed.forEach(e=>{out=out.slice(0,e[0])+e[2]+out.slice(e[1]);});
fs.writeFileSync(process.argv[3],out);console.log('edits',ed.length);
