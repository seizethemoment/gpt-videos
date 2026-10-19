import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {spawn,spawnSync} from 'node:child_process';
import {once} from 'node:events';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=path.dirname(fileURLToPath(import.meta.url)),out=path.join(root,'output');fs.mkdirSync(out,{recursive:true});
const preview=process.argv.includes('--preview');
const spec=JSON.parse(fs.readFileSync(path.join(root,'narration.json'),'utf8'));
const {width,height,fps,duration}=spec,frames=duration*fps;
const chrome=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let browser;
try{
  browser=await chromium.launch({headless:true,...(fs.existsSync(chrome)?{executablePath:chrome}:{}),args:['--allow-file-access-from-files','--hide-scrollbars']});
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(pathToFileURL(path.join(root,'index.html')).href+'?render=1');await page.evaluate(()=>document.fonts.ready);
  const physics=await page.evaluate(()=>{
    const o=window.OPTICS;
    return {topProjectsBelowAxis:o.projectPinhole(430)>570,bottomProjectsAboveAxis:o.projectPinhole(710)<570,thinLensDistance:o.thinLensImageDistance(280,555),apertureRatio:o.apertureFluxRatio(2.8,8),film:window.FILM,exposure:(()=>{const e=window.EXPOSURE;return [0,4.8,8.4,12.4,18.4].map(t=>{const v=e.balanceState(t);return {time:t,brightness:e.outputBrightness(v,e.base),photons:e.lightCollected(v,e.base)};});})(),cases:Object.keys(window.EXPOSURE.cases).map(kind=>{const e=window.EXPOSURE,c=e.cases[kind];return {kind,brightness:e.outputBrightness(e.caseState(kind,14),c.base)};})};
  });
  if(!physics.topProjectsBelowAxis||!physics.bottomProjectsAboveAxis||Math.abs(physics.apertureRatio-8.163265306)>1e-6)throw new Error('Optics model check failed');
  const expected=[[1,1],[2,2],[1,1],[.25,.25],[1,.25]];
  physics.exposure.forEach((v,i)=>{if(Math.abs(v.brightness-expected[i][0])>1e-8||Math.abs(v.photons-expected[i][1])>1e-8)throw new Error('Exposure compensation is inconsistent: '+JSON.stringify(v));});
  if(physics.cases.some(c=>Math.abs(c.brightness-1)>1e-8))throw new Error('Application settings do not balance');
  const times=spec.keyframes;
  for(const t of times){const b=await page.evaluate(t=>{window.renderFrame(t);return document.getElementById('film').toDataURL('image/png').split(',')[1];},t);fs.writeFileSync(path.join(out,t===spec.poster_time?'poster.png':`frame-${t.toFixed(1)}.png`),Buffer.from(b,'base64'));}
  const contact=await page.evaluate(times=>{const sheet=document.createElement('canvas');sheet.width=1920;sheet.height=Math.ceil(times.length/4)*305;const c=sheet.getContext('2d');c.fillStyle='#111d25';c.fillRect(0,0,sheet.width,sheet.height);times.forEach((t,i)=>{window.renderFrame(t);const x=i%4*480,y=Math.floor(i/4)*305;c.drawImage(document.getElementById('film'),x,y,480,270);c.fillStyle='#edbd82';c.font='16px Arial';c.fillText(t.toFixed(1)+' s',x+14,y+293);});return sheet.toDataURL('image/png').split(',')[1];},times);
  fs.writeFileSync(path.join(out,'contact-sheet.png'),Buffer.from(contact,'base64'));
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('Keyframes and optical model checks passed.',JSON.stringify(physics));
  if(!preview){
    const env={...process.env,PYTHONPATH:[path.join(root,'.runtime'),process.env.PYTHONPATH].filter(Boolean).join(path.delimiter)};
    const ffmpeg=process.env.FFMPEG_PATH||spawnSync('python3',['-c','import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],{env,encoding:'utf8'}).stdout.trim();
    if(!ffmpeg)throw new Error('Set FFMPEG_PATH or install imageio-ffmpeg.');
    const movie=path.join(out,spec.movie);
    const args=['-y','-hide_banner','-loglevel','warning','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps),'-i','pipe:0','-i',path.join(out,'soundtrack.m4a'),'-map','0:v:0','-map','1:a:0','-vf','scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=full:out_range=limited,format=yuv420p','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-r',String(fps),'-c:a','copy','-t',String(duration),'-movflags','+faststart','-metadata','title=光，如何成为照片 · 曝光三角',movie];
    const encoder=spawn(ffmpeg,args,{stdio:['pipe','ignore','pipe']});let log='',pipeError;encoder.stderr.on('data',d=>log+=d.toString());encoder.stdin.on('error',e=>pipeError=e);
    const completion=new Promise((resolve,reject)=>{encoder.on('error',reject);encoder.on('close',code=>code===0?resolve():reject(new Error('FFmpeg: '+log)));});completion.catch(()=>{});
    const start=Date.now();
    for(let i=0;i<frames;i++){
      const b=await page.evaluate(t=>{window.renderFrame(t);return document.getElementById('film').toDataURL('image/jpeg',.975).split(',')[1];},i/fps);
      if(pipeError)throw pipeError;if(!encoder.stdin.write(Buffer.from(b,'base64')))await once(encoder.stdin,'drain');
      if(i%180===0)console.log(`Rendered ${i}/${frames} frames · ${Math.round((Date.now()-start)/1000)} s elapsed`);
    }
    encoder.stdin.end();await completion;if(errors.length)throw new Error(errors.join('\n'));
    const check=spawnSync(ffmpeg,['-hide_banner','-i',movie,'-map','0:v:0','-map','0:a:0','-f','null','-'],{encoding:'utf8'});
    if(check.status!==0)throw new Error(check.stderr);
    fs.writeFileSync(path.join(out,'render-report.txt'),`${frames} deterministic frames\n${width} × ${height} · ${fps} fps · ${duration} seconds\nOptics checks: ${JSON.stringify(physics)}\nBrowser errors: ${errors.length}\n${check.stderr}`);
    console.log('Movie exported and fully decoded:',movie);console.log(check.stderr.split('\n').filter(x=>/Duration|Stream|frame=/.test(x)).join('\n'));
  }
}finally{if(browser)await browser.close();}
