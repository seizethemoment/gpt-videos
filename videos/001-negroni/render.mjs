import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {spawn, spawnSync} from 'node:child_process';
import {once} from 'node:events';

const root=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const playwright=require('playwright');
const out=path.join(root,'output');fs.mkdirSync(out,{recursive:true});
const preview=process.argv.includes('--preview');
let browser;
const chrome=process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
try {
  browser=await playwright.chromium.launch({headless:true,...(fs.existsSync(chrome)?{executablePath:chrome}:{}),args:['--allow-file-access-from-files','--hide-scrollbars']});
  const page=await browser.newPage({viewport:{width:1080,height:1080},deviceScaleFactor:1});
  const failures=[];page.on('pageerror',e=>failures.push(String(e)));
  await page.goto(pathToFileURL(path.join(root,'index.html')).href+'?render=1');
  await page.evaluate(()=>document.fonts.ready);
  const shots=[1.6,4.2,7.2,11.3,15.3,20.0,25.8,28.7];
  const contact=await page.evaluate(times=>{
    const c=document.createElement('canvas');c.width=1440;c.height=776;const p=c.getContext('2d');
    p.fillStyle='#e6ddd0';p.fillRect(0,0,c.width,c.height);
    times.forEach((t,i)=>{window.renderFrame(t);const x=i%4*360,y=Math.floor(i/4)*388;p.drawImage(document.getElementById('film'),x,y,360,360);p.fillStyle='#6f5348';p.font='14px Arial';p.fillText(`${t.toFixed(1)}s`,x+12,y+379);});
    return c.toDataURL('image/png').split(',')[1];
  },shots);
  fs.writeFileSync(path.join(out,'contact-sheet.png'),Buffer.from(contact,'base64'));
  for(const t of [7.2,20.0,28.7]){
    const data=await page.evaluate(t=>{window.renderFrame(t);return document.getElementById('film').toDataURL('image/png').split(',')[1];},t);
    fs.writeFileSync(path.join(out,t===28.7?'poster.png':`frame-${t.toFixed(1)}.png`),Buffer.from(data,'base64'));
  }
  if(failures.length)throw new Error(failures.join('\n'));
  console.log('Preview frames saved. Fonts:',await page.evaluate(()=>({chinese:document.fonts.check('24px "PingFang SC"'),serif:document.fonts.check('24px Georgia')})));
  if(!preview){
    const env={...process.env,PYTHONPATH:[path.join(root,'.runtime'),process.env.PYTHONPATH].filter(Boolean).join(path.delimiter)};
    const executable=process.env.FFMPEG_PATH || spawnSync('python3',['-c','import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],{env,encoding:'utf8'}).stdout.trim();
    if(!executable)throw new Error('FFmpeg unavailable. Install imageio-ffmpeg into .runtime, or set FFMPEG_PATH.');
    if(!fs.existsSync(path.join(out,'soundtrack.wav'))){const r=spawnSync('python3',[path.join(root,'soundtrack.py')],{cwd:root,stdio:'inherit'});if(r.status!==0)throw new Error('Soundtrack generation failed');}
    const args=['-y','-hide_banner','-loglevel','warning','-f','image2pipe','-vcodec','mjpeg','-framerate','30','-i','pipe:0','-i',path.join(out,'soundtrack.wav'),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','192k','-t','30','-movflags','+faststart','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-metadata','title=Negroni · 三味等份，一杯经典',path.join(out,'negroni-30s.mp4')];
    const encoder=spawn(executable,args,{stdio:['pipe','ignore','pipe']});let errors='';encoder.stderr.on('data',d=>errors+=d.toString());
    let pipeError;encoder.stdin.on('error',e=>pipeError=e);
    const completion=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('close',code=>code===0?resolve():reject(new Error(`FFmpeg exited ${code}: ${errors}`)));});
    completion.catch(()=>{});
    const began=Date.now();
    for(let i=0;i<900;i++){
      const b64=await page.evaluate(t=>{window.renderFrame(t);return document.getElementById('film').toDataURL('image/jpeg',.97).split(',')[1];},i/30);
      if(pipeError)throw pipeError;
      if(!encoder.stdin.write(Buffer.from(b64,'base64')))await once(encoder.stdin,'drain');
      if(i%150===0)console.log(`Rendered ${i}/900 frames (${Math.round((Date.now()-began)/1000)}s elapsed)`);
    }
    encoder.stdin.end();await completion;
    const result=spawnSync(executable,['-hide_banner','-i',path.join(out,'negroni-30s.mp4'),'-map','0:v:0','-f','null','-'],{encoding:'utf8'});
    if(result.status!==0)throw new Error(result.stderr);
    fs.writeFileSync(path.join(out,'render-report.txt'),`900 deterministic frames\n1080 × 1080 pixels\n30 fps · 30.00 seconds\nH.264 / AAC stereo\nBrowser errors: ${failures.length}\n\n${result.stderr}`);
    console.log('Finished:',path.join(out,'negroni-30s.mp4'));
    console.log(result.stderr.split('\n').filter(l=>/Duration|Stream|frame=/.test(l)).join('\n'));
  }
} finally {if(browser)await browser.close();}
