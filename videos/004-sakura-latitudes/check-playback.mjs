import fs from 'node:fs';import {chromium} from 'playwright';import {root} from './tooling.mjs';
process.chdir(root);
const path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await chromium.launch({headless:true,...(fs.existsSync(process.env.CHROME_PATH||path)?{executablePath:process.env.CHROME_PATH||path}:{})});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1120}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:8793/preview.html');await page.waitForFunction(()=>document.querySelector('video').readyState>=1);
 const meta=await page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));
 if(Math.abs(meta.duration-96)>.1||meta.width!==1920||meta.height!==1080)throw Error('Incorrect media metadata: '+JSON.stringify(meta));
 await page.getByRole('button').first().click();await page.waitForFunction(()=>document.querySelector('video').currentTime>1.3);
 const playing=await page.locator('video').evaluate(v=>!v.paused);if(!playing)throw Error('Video did not play');
 const chapters=[];
 for(let i=0;i<8;i++){
  await page.getByRole('button').nth(i).click();
  await page.waitForFunction(i=>{const v=document.querySelector('video');return v.readyState>=2&&!v.seeking&&v.currentTime>=i*12&&v.currentTime<i*12+3},i);
  const sample=await page.locator('video').evaluate(v=>({time:v.currentTime,readyState:v.readyState}));chapters.push({index:i+1,...sample});
 }
 await page.locator('video').evaluate(v=>{v.pause();v.currentTime=7.2});await page.waitForFunction(()=>!document.querySelector('video').seeking);
 await page.screenshot({path:'.runtime/playback-proof.png',fullPage:true});
 const range=await fetch('http://127.0.0.1:8793/output/sakura-latitudes-96s.mp4',{headers:{Range:'bytes=1048576-1048591'}});
 const bytes=(await range.arrayBuffer()).byteLength;if(range.status!==206||bytes!==16)throw Error('Range playback failed');
 await page.goto('http://127.0.0.1:8793/references.html');
 const refs=await page.locator('section').count(),links=await page.locator('a[href^="http"]').count();if(refs<8||links<16)throw Error('Reference catalogue incomplete');
 if(errors.length)throw Error(errors.join('\n'));
 const check={metadata:meta,playback:'passed',chapters,range:{status:range.status,bytes,content_range:range.headers.get('content-range')},references:{sections:refs,links},browser_errors:errors};
 fs.writeFileSync('output/playback-check.json',JSON.stringify(check,null,2)+'\n');
 const report=JSON.parse(fs.readFileSync('output/render-report.json','utf8'));report.checks.browser_playback='passed';report.checks.chapter_seeking='passed';report.checks.range='passed';report.checks.reference_catalogue='passed';fs.writeFileSync('output/render-report.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(check,null,2));
}finally{await browser.close()}
