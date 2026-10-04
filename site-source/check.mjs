import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const source=path.dirname(fileURLToPath(import.meta.url));
const root=path.dirname(source);
const posts=JSON.parse(await fs.readFile(path.join(source,'content/posts.json'),'utf8'));
const categories=[...new Set(posts.map(p=>p.category))];
const dates=[...new Set(posts.map(p=>p.date))];
const routes=['/','/about/','/archives/','/categories/',...categories.map(c=>'/categories/'+c+'/'),...posts.map(p=>p.url),...[...new Set(dates.map(d=>d.slice(0,4)))].map(y=>'/archives/'+y+'/'),...[...new Set(dates.map(d=>d.slice(0,7)))].map(m=>'/archives/'+m.replace('-','/')+'/')];
const decodeHTML=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
let links=0;
let images=0;
for(const route of routes){
  const file=path.join(root,route,'index.html');
  const html=await fs.readFile(file,'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,route+' must have one main heading');
  assert.ok(html.includes('name="description"'),route+' needs page metadata');
  assert.ok(!/file:\/\//i.test(html),route+' contains a local file URL');
  assert.ok(html.includes('<html lang="zh-CN">'),route+' needs Simplified Chinese language metadata');
  assert.ok(!/X-Amz-|prod-files-secure/i.test(html),route+' exposes a temporary Notion image URL');
  for(const match of html.matchAll(/(?:href|src)="([^"]*)"/g)){
    const value=decodeHTML(match[1]);
    if(/^(https?:|mailto:|tel:|data:)/i.test(value))continue;
    const url=new URL(value,'https://example.test'+encodeURI(route));
    const local=path.join(root,decodeURIComponent(url.pathname));
    let target;
    try{const stat=await fs.stat(local);target=stat.isDirectory()?path.join(local,'index.html'):local;await fs.access(target);}
    catch{throw new Error(route+' links to missing file '+value);}
    if(url.hash&&target.endsWith('.html')){
      const destination=target===file?html:await fs.readFile(target,'utf8');
      const id=decodeURIComponent(url.hash.slice(1));
      const ids=[...destination.matchAll(/\bid="([^"]*)"/g)].map(m=>decodeHTML(m[1]));
      assert.ok(ids.includes(id),route+' links to missing anchor '+value);
    }
    links++;
    if(match[0].startsWith('src=')&&/\.(png|jpg|jpeg|webp|gif)$/i.test(url.pathname))images++;
  }
}
for(const post of posts){
  const sourceBody=await fs.readFile(path.join(source,'content',post.content),'utf8');
  const page=await fs.readFile(path.join(root,post.url,'index.html'),'utf8');
  assert.ok(page.includes(sourceBody),post.title+' article content was altered during rendering');
  if(post.source?.type==='notion'){
    assert.ok(!/<script\b|\son\w+=/i.test(sourceBody),post.title+' contains unsafe imported HTML');
    for(const image of sourceBody.matchAll(/<img\b[^>]*src="([^"]*)"/g))assert.ok(image[1].startsWith('/assets/notion-'),post.title+' needs a local copy of each Notion image');
  }
}
assert.equal(posts.filter(p=>p.featured).length,1,'Exactly one note must be featured');
for(const month of [...new Set(posts.map(p=>p.date.slice(0,7)))]){
  const html=await fs.readFile(path.join(root,'archives',month.replace('-','/'),'index.html'),'utf8');
  assert.equal((html.match(/class="archive-entry"/g)||[]).length,posts.filter(p=>p.date.startsWith(month)).length,month+' archive includes other months');
}
assert.equal((await fs.readFile(path.join(root,'CNAME'),'utf8')).trim(),'hickercf.fun');
console.log(JSON.stringify({passed:true,pages:routes.length,articles:posts.length,localLinks:links,articleImages:images,domain:'hickercf.fun'}));
