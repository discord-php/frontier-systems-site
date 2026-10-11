import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {build,root,serializePreview} from './build.mjs';
const config=JSON.parse(fs.readFileSync(path.join(root,'site/content.json'),'utf8'));
function validate(text){
  assert(Buffer.byteLength(text)<=3000); assert(!text.includes('<'));
  const payload=JSON.parse(text); assert.deepEqual(Object.keys(payload),['component']);
  assert.equal(payload.component.type,17);let count=0,galleries=0;
  function walk(c,parent){
    count++;assert([1,2,9,10,11,12,14,17].includes(c.type));
    if(c.type===17)assert(!parent,'nested Container');
    if(c.type===2){assert([1,9].includes(parent));assert.equal(c.style,5);assert(!Object.keys(c).some(k=>!['id','type','url','style','label','emoji','disabled'].includes(k)));assert(c.label||c.emoji);assert.equal(new URL(c.url).protocol,'https:');}
    if(c.type===1){assert(c.components.length<=5&&c.components.length>=1);assert(c.components.every(x=>x.type===2));}
    if(c.type===10)assert.equal(typeof c.content,'string');
    if(c.type===9){assert(c.components.length>=1&&c.components.length<=3);assert(c.components.every(x=>x.type===10));assert([2,11].includes(c.accessory?.type));walk(c.accessory,9);}
    if(c.type===12)galleries+=c.items.length;
    for(const child of c.components||[])walk(child,c.type);
  }
  walk(payload.component,null);assert(count<=40);assert(galleries<=10);return{bytes:Buffer.byteLength(text),components:count,galleryItems:galleries};
}
const pages=['index.html','support.html','buy.html'];
for(const file of pages){
  const html=fs.readFileSync(path.join(root,'dist',file),'utf8');
  const scripts=[...html.matchAll(/<script id="discord:component-embed" type="application\/json">([\s\S]*?)<\/script>/g)];assert.equal(scripts.length,1);
  assert(html.indexOf(scripts[0][0])<html.indexOf('</head>'));
  for(const key of ['og:title','og:description','og:image','og:url','og:type','og:site_name'])assert(html.includes(`property="${key}"`));
  assert(html.includes('name="twitter:card"'));assert(!html.includes('%%'));assert(!html.includes('{{'));
  for(const [,target]of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
    if(/^https:/.test(target))continue;
    assert(!target.startsWith('http:'));assert(fs.existsSync(path.join(root,'dist',target.split('#')[0])),target);
  }
  const fallback=html.replace(scripts[0][0],'');assert(fallback.includes('property="og:title"'));assert(fallback.includes('property="og:description"'));
  console.log(file,validate(scripts[0][1]));
}
const png=fs.readFileSync(path.join(root,'dist/assets/brand.png'));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
const fixture={component:{type:17,components:[{type:10,content:'Unicode Ω — "quotes" </ScRiPt> & <tag>'}]}};
assert.equal(JSON.parse(serializePreview(fixture)).component.components[0].content,fixture.component.components[0].content);validate(serializePreview(fixture));
assert.throws(()=>serializePreview({component:{type:17,components:[{type:10,content:'x'.repeat(3001)}]}}));
assert.throws(()=>validate(JSON.stringify({component:{type:17,components:Array.from({length:40},()=>({type:14}))}})));
assert.throws(()=>validate(JSON.stringify({component:{type:17,components:[{type:17,components:[]}]}})));
assert.throws(()=>validate(JSON.stringify({component:{type:17,components:[{type:12,items:Array.from({length:11},()=>({media:{url:'https://example.com/a.png'}}))}]}})));
assert.throws(()=>validate(JSON.stringify({component:{type:17,components:[{type:1,components:[{type:2,style:5,label:'Bad',url:'https://example.com',custom_id:'no'}]}]}})));
assert.throws(()=>validate(JSON.stringify({component:{type:17,components:[{type:1,components:[{type:2,style:5,label:'Bad',url:'https://example.com',unexpected:true}]}]}})));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'frontier-site-check-'));
try{
  build({...config,origin:'https://example.com/frontier-systems'},temp);
  assert(fs.readFileSync(path.join(temp,'index.html'),'utf8').includes('https://example.com/frontier-systems/assets/brand.png'));
  assert.throws(()=>build({...config,storeUrl:'https://store.example.com/game'},temp));
  build({...config,storeUrl:'https://store.example.com/game',saleLabel:'Owner-approved offer',saleDescription:'Reviewed purchase description'},temp);
  assert(fs.readFileSync(path.join(temp,'buy.html'),'utf8').includes('Visit the official store'));
  assert(!fs.readFileSync(path.join(temp,'buy.html'),'utf8').includes('Not yet for sale'));
}finally{fs.rmSync(temp,{recursive:true,force:true});}
if(!config.storeUrl)assert(fs.readFileSync(path.join(root,'dist/buy.html'),'utf8').includes('Not yet for sale'));
console.log('Output, fallback, serialization limits, alternate base path and sale-state checks passed.');
