import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Byte-range responses let the browser seek immediately within the MP4.
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT || 8793);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.mp4':'video/mp4','.m4a':'audio/mp4','.wav':'audio/wav','.srt':'text/plain; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8'};
http.createServer((req,res)=>{
  try {
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const url=new URL(req.url,'http://localhost');
    const name=decodeURIComponent(url.pathname==='/'?'/preview.html':url.pathname);
    const file=path.resolve(root,'.'+name);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const stat=fs.statSync(file);if(!stat.isFile())throw new Error('Not a file');
    let start=0,end=stat.size-1,status=200;
    const headers={'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    if(req.headers.range){
      const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!m)throw new Error('Invalid range');
      if(!m[1])start=Math.max(0,stat.size-Number(m[2]));
      else {start=Number(m[1]);if(m[2])end=Math.min(Number(m[2]),end);}
      if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return;}
      status=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
    }
    headers['Content-Length']=end-start+1;res.writeHead(status,headers);
    if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Preview: http://127.0.0.1:${port}/preview.html`));
