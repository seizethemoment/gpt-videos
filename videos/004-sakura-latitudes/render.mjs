import fs from 'node:fs';import {spawn,spawnSync} from 'node:child_process';import {once} from 'node:events';import {chromium} from 'playwright';
import {root,findFFmpeg} from './tooling.mjs';import {FILM,SCENES} from './scenes.js';
process.chdir(root);fs.mkdirSync('output',{recursive:true});fs.mkdirSync('.runtime',{recursive:true});
const preview=process.argv.includes('--preview'),{fps,duration,width,height}=FILM;
let browser;
try{
 try{const r=await fetch('http://127.0.0.1:8793/scenes.js');if(!r.ok)throw Error('server not ready');}catch{
  const log=fs.openSync('.runtime/server.log','a'),server=spawn(process.execPath,['serve.mjs'],{detached:true,stdio:['ignore',log,log]});server.unref();fs.writeFileSync('.runtime/server.pid',String(server.pid));
  await new Promise(r=>setTimeout(r,700));
 }
 const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
 browser=await chromium.launch({headless:true,...(fs.existsSync(process.env.CHROME_PATH||chrome)?{executablePath:process.env.CHROME_PATH||chrome}:{}),args:['--enable-webgl','--ignore-gpu-blocklist',...(process.platform==='darwin'?['--use-angle=metal']:[])]});
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1}),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));await page.goto('http://127.0.0.1:8793/index.html?render=1');await page.waitForFunction(()=>window.ready,null,{timeout:90000});await page.evaluate(()=>document.fonts.ready);
 const report={film:FILM,locations:SCENES.map((s,i)=>({index:i+1,place:s.city+' · '+s.name,latitude:s.lat,longitude:s.lon,start:i*12,end:(i+1)*12})),frames:duration*fps,browser_errors:errors,checks:{}};
 if(!SCENES.every((s,i)=>i===0||s.lat>SCENES[i-1].lat))throw Error('Latitude route is not strictly ascending');
 report.checks.latitude_order='passed';
 const times=[7,18,30,42,54,66,78,86];
 for(const t of [3,...times,91]){const b64=await page.evaluate(t=>{renderFrame(t);return document.getElementById('film').toDataURL('image/png').split(',')[1]},t);fs.writeFileSync(`output/frame-${t}.png`,Buffer.from(b64,'base64'));if(t===3)fs.writeFileSync('output/poster.png',Buffer.from(b64,'base64'));}
 const sheet=await page.evaluate(times=>{const c=document.createElement('canvas');c.width=1920;c.height=2280;const g=c.getContext('2d');g.fillStyle='#101b22';g.fillRect(0,0,c.width,c.height);times.forEach((t,i)=>{renderFrame(t);const x=i%2*960,y=Math.floor(i/2)*570;g.drawImage(document.getElementById('film'),x,y,960,540);g.fillStyle='#eed5d7';g.font='15px Georgia';g.fillText(String(i+1).padStart(2,'0')+' · '+t+'s',x+18,y+562)});return c.toDataURL('image/png').split(',')[1]},times);
 fs.writeFileSync('output/contact-sheet.png',Buffer.from(sheet,'base64'));
 // Verify render determinism at a scene boundary as well as the first location.
 report.checks.deterministic=await page.evaluate(()=>{renderFrame(18);const a=document.getElementById('film').toDataURL();renderFrame(54);renderFrame(18);return a===document.getElementById('film').toDataURL()});
 if(!report.checks.deterministic)throw Error('Animation must be deterministic for frame export');
 console.log('Preview frames complete; geographic order and deterministic rendering passed.');
 fs.writeFileSync('output/chapters.json',JSON.stringify(report.locations,null,2));
 const metadata=';FFMETADATA1\ntitle=樱落，向北 · 秒速五厘米的春日旅行\nartist=GPT Videos\ncomment=Original anime-inspired travel motion film; eight locations ordered by approximate latitude.\n'+SCENES.map((s,i)=>`[CHAPTER]\nTIMEBASE=1/1000\nSTART=${i*12000}\nEND=${(i+1)*12000}\ntitle=${s.city} · ${s.name}\n`).join('');
 fs.writeFileSync('output/chapters.ffmetadata',metadata);
 if(!preview){
  const ffmpeg=findFFmpeg(),file='output/sakura-latitudes-96s.mp4';
  const encoder=spawn(ffmpeg,['-y','-hide_banner','-loglevel','warning','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-i','output/soundtrack.m4a','-i','output/chapters.ffmetadata','-map','0:v','-map','1:a','-map_metadata','2','-map_chapters','2','-vf','scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=full:out_range=limited,format=yuv420p','-c:v','libx264','-preset','slow','-crf','19','-maxrate','7500k','-bufsize','15000k','-r',String(fps),'-c:a','copy','-t',String(duration),'-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-movflags','+faststart',file],{stdio:['pipe','ignore','pipe']});
  let log='',pipeError;encoder.stderr.on('data',d=>log+=d);encoder.stdin.on('error',e=>pipeError=e);
  const done=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('close',code=>code===0?resolve():reject(Error(log)))});done.catch(()=>{});
  const start=Date.now();
  for(let i=0;i<duration*fps;i++){
   const b64=await page.evaluate(t=>{renderFrame(t);return document.getElementById('film').toDataURL('image/jpeg',.97).split(',')[1]},i/fps);
   if(pipeError)throw pipeError;if(!encoder.stdin.write(Buffer.from(b64,'base64')))await once(encoder.stdin,'drain');
   if(i%96===0)console.log(`Rendered ${i}/${duration*fps} frames · ${Math.round((Date.now()-start)/1000)} s`);
  }
  encoder.stdin.end();await done;
  const check=spawnSync(ffmpeg,['-hide_banner','-i',file,'-map','0:v:0','-map','0:a:0','-f','null','-'],{encoding:'utf8'});
  if(check.status!==0)throw Error(check.stderr);report.checks.full_decode='passed';report.checks.streams=check.stderr.split('\n').filter(s=>/Duration|Stream|frame=/.test(s));report.size_bytes=fs.statSync(file).size;console.log('Full video and audio decode passed.',report.size_bytes,'bytes');
 }
 if(errors.length)throw Error(errors.join('\n'));fs.writeFileSync('output/render-report.json',JSON.stringify(report,null,2)+'\n');
}finally{if(browser)await browser.close()}
