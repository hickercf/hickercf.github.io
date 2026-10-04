import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://localhost');
    const candidate=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(candidate!==root&&!candidate.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    let file=candidate;
    const stat=await fs.stat(file);
    if(stat.isDirectory()){if(!url.pathname.endsWith('/')){res.writeHead(302,{Location:url.pathname+'/'+url.search});res.end();return;}file=path.join(file,'index.html');}
    const body=await fs.readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(body);
  }catch(error){res.writeHead(error.code==='ENOENT'?404:400,{'Content-Type':'text/html; charset=utf-8'});res.end(await fs.readFile(path.join(root,'404.html'),'utf8'));}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173/'));
