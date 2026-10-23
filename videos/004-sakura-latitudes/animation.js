import * as THREE from 'three';
import {SCENES,FILM} from './scenes.js';
const W=1920,H=1080,cv=document.getElementById('film'),g=cv.getContext('2d',{alpha:false});
const serif='"Songti SC","Noto Serif CJK SC",serif',sans='"PingFang SC","Arial",sans-serif';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=(x,a,b)=>{const v=clamp((x-a)/(b-a));return v*v*(3-2*v)},mix=(a,b,t)=>a+(b-a)*t;
let seed=491;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.LinearSRGBColorSpace;
const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
const world=new THREE.Scene();
const uniforms={tex:{value:null},clock:{value:0},progress:{value:0},aspect:{value:16/9},water:{value:0},direction:{value:1}};
const material=new THREE.ShaderMaterial({uniforms,vertexShader:`varying vec2 q;void main(){q=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
 precision highp float;uniform sampler2D tex;uniform float clock,progress,aspect,water,direction;varying vec2 q;
 void main(){
  vec2 uv=q;float zoom=1.055+progress*.037;
  uv=(uv-.5)/zoom+.5;uv.x+=direction*(progress-.5)*.014;
  if(aspect>1.777778)uv.x=(uv.x-.5)*1.777778/aspect+.5;else uv.y=(uv.y-.5)*aspect/1.777778+.5;
  float edge=smoothstep(.68,.96,uv.y)*(1.-smoothstep(.1,.43,min(uv.x,1.-uv.x)));
  uv.x+=edge*sin(clock*.47+uv.y*3.)*.0011;
  float y=1.-q.y;
  if(water>.1 && y>water){float s=smoothstep(water,water+.13,y);uv.x+=sin(y*194.+clock*.85)*.00065*s+sin(y*87.-clock*.47)*.00035*s;uv.y+=sin(y*170.+clock*.6)*.00014*s;}
  vec3 c=texture2D(tex,uv).rgb;
  float v=1.-.09*pow(length((q-.5)*vec2(1.,.8)),1.6);c*=v;
  gl_FragColor=vec4(c,1.);
 }`});
world.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
const textures=await Promise.all(SCENES.map(s=>new Promise((resolve,reject)=>new THREE.TextureLoader().load(`assets/${s.id}.png`,t=>{t.colorSpace=THREE.NoColorSpace;t.minFilter=THREE.LinearFilter;t.magFilter=THREE.LinearFilter;resolve(t)},undefined,reject))));
await document.fonts.ready;
const layers=[document.createElement('canvas'),document.createElement('canvas')];layers.forEach(c=>{c.width=W;c.height=H});
const petals=Array.from({length:190},(_,i)=>({x:random()*2600-300,y:random()*1450-230,z:i<115?.28+random()*.65:i<174?1+random()*.8:2.3+random()*2.2,phase:random()*Math.PI*2,rotate:random()*6.28,pink:random(),sway:12+random()*42}));
function petal(ctx,x,y,r,rotation,squash,color,alpha){
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(r,r*Math.max(.16,Math.abs(squash)));
 const p=ctx.createLinearGradient(-1,-1,1,1);p.addColorStop(0,'#fff7ee');p.addColorStop(.5,color);p.addColorStop(1,'#dba1b8');ctx.fillStyle=p;
 ctx.beginPath();ctx.moveTo(0,.98);ctx.bezierCurveTo(-1,.50,-1.13,-.34,-.54,-.78);ctx.bezierCurveTo(-.21,-1.03,-.05,-.72,0,-.56);ctx.bezierCurveTo(.13,-.88,.38,-.99,.64,-.70);ctx.bezierCurveTo(1.10,-.24,.77,.61,0,.98);ctx.fill();
 if(r>8){ctx.strokeStyle='#b7668c38';ctx.lineWidth=.065;ctx.beginPath();ctx.moveTo(0,.78);ctx.quadraticCurveTo(-.1,.12,0,-.5);ctx.stroke();}
 ctx.restore();
}
function falling(ctx,t,s,near=false){
 for(const [i,p]of petals.entries()){
  if((p.z>2.2)!==near)continue;
  const speed=18*p.z,tt=t+p.phase*6;
  const y=((p.y+tt*speed)%1440+1440)%1440-190;
  const x=((p.x+tt*(10+4*p.z)*s.wind+p.sway*Math.sin(tt*.31+p.phase))%2540+2540)%2540-310;
  const r=(3.1+2.1*p.z)*(1+.15*Math.sin(tt*.4));
  const rot=p.rotate+tt*(.23+.12*p.z)+Math.sin(tt*.7+p.phase)*.5;
  const alpha=near?.38+.10*p.pink:.36+.44*p.pink;
  if(near){ctx.save();ctx.filter='blur(1.6px)';}
  petal(ctx,x,y,r,rot,Math.sin(tt*.9+p.phase),p.pink>.5?'#f9cad7':'#fff1ee',alpha);
  if(near)ctx.restore();
 }
}
function drawScene(index,p,t,target){
 const ctx=target.getContext('2d'),s=SCENES[index];uniforms.tex.value=textures[index];uniforms.clock.value=t;uniforms.progress.value=p;uniforms.aspect.value=textures[index].image.width/textures[index].image.height;uniforms.water.value=s.water;uniforms.direction.value=index%2?-1:1;renderer.render(world,camera);ctx.drawImage(renderer.domElement,0,0);
 falling(ctx,t,s,false);
 // A light veil makes the changing sun almost imperceptible, without hiding the drawing.
 const sun=ctx.createRadialGradient(260+index*110%650,180,20,260+index*110%650,180,800);sun.addColorStop(0,'rgba(255,232,197,.055)');sun.addColorStop(1,'rgba(255,232,197,0)');ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);
 falling(ctx,t,s,true);
 const drift=p*12;
 petal(ctx,250+115*drift+45*Math.sin(drift*.42),155+49*drift+22*Math.sin(drift*.58),12+Math.sin(drift*.63)*2,.4+drift*.27,Math.sin(drift*.84+.8),'#ffe4e8',.79);
}
function text(str,x,y,size,color='#fff8f1',font=serif,align='left',weight='400'){
 g.font=`${weight} ${size}px ${font}`;g.textAlign=align;g.fillStyle=color;g.fillText(str,x,y);
}
function tracked(str,x,y,size,spacing,color='#fff0ea',align='left'){
 g.font=`${size}px Georgia`;const width=[...str].reduce((a,c)=>a+g.measureText(c).width+spacing,0)-spacing;if(align==='right')x-=width;if(align==='center')x-=width/2;g.fillStyle=color;g.textAlign='left';for(const c of str){g.fillText(c,x,y);x+=g.measureText(c).width+spacing;}
}
function label(i,local){
 const s=SCENES[i],alpha=smooth(local,i===0?4.6:.7,i===0?5.6:1.6)*(1-smooth(local,i===7?4.8:10.7,i===7?6:11.8));
 g.save();g.globalAlpha=alpha;
 const grd=g.createLinearGradient(0,690,0,1040);grd.addColorStop(0,'rgba(18,36,43,0)');grd.addColorStop(1,'rgba(18,36,43,.70)');g.fillStyle=grd;g.fillRect(0,650,W,430);
 const shift=12*(1-alpha);g.translate(0,shift);
 tracked(String(i+1).padStart(2,'0')+' / 08',110,812,15,3,'#ffd9dc');
 text(s.city+' · '+s.name,106,875,s.name.length>8?41:47);
 tracked(s.en,110,918,14,1.65,'#f3e7e4');
 text(s.poem,110,967,24,'#f6e8e2',serif);
 text(`约 ${s.lat.toFixed(2)}°N`,1806,876,26,'#fff2eb','Georgia','right');
 text('由南向北 · 樱花之旅',1806,915,17,'#f5dfdc',sans,'right');
 g.restore();
}
function route(i){
 g.save();g.globalAlpha=.68;g.strokeStyle='#fff2eb66';g.lineWidth=1;g.beginPath();g.moveTo(1506,1005);g.lineTo(1806,1005);g.stroke();
 for(let j=0;j<8;j++){g.fillStyle=j<=i?'#fff0e7':'#fff0e750';g.beginPath();g.arc(1506+j*300/7,1005,j===i?4.5:2.4,0,Math.PI*2);g.fill();}
 g.restore();
}
function opening(t){
 const a=smooth(t,.6,1.6)*(1-smooth(t,4.9,6));g.save();g.globalAlpha=a;
 const grad=g.createLinearGradient(0,0,1250,0);grad.addColorStop(0,'rgba(11,32,40,.46)');grad.addColorStop(1,'rgba(11,32,40,0)');g.fillStyle=grad;g.fillRect(0,0,W,H);
 tracked('A SPRING DRIFT',114,313,19,5,'#ffe8e7');
 text('樱落，向北',105,431,84,'#fff5ed',serif,'left','500');
 text('秒速五厘米的春日旅行',114,496,30,'#fff1e9');
 g.fillStyle='#f6d2d4';g.fillRect(114,543,59,2);
 text('从西湖出发，把春天寄往更北的地方。',114,591,23,'#f6e7e0');
 text('八处风景 · 按景点约略纬度串联',114,630,18,'#f0ded9',sans);
 g.restore();
}
function ending(t){
 const a=smooth(t,89,90.3);g.save();g.globalAlpha=a;
 const grad=g.createLinearGradient(0,0,W,0);grad.addColorStop(0,'rgba(18,36,43,.51)');grad.addColorStop(1,'rgba(18,36,43,0)');g.fillStyle=grad;g.fillRect(0,0,W,H);
 text('花会落下。',112,368,63);text('春天，会继续向北。',112,454,63);
 tracked('THE PETALS FALL. SPRING GOES ON.',117,515,15,2.5,'#f3dce1');
 text('30.25°N  —  49.24°N',116,588,22,'#f7e3df','Georgia');
 text('杭州 · 上海 · 南京 · 东京 · 大连 · 华盛顿 · 温哥华',116,633,21,'#f8e7e0');
 text('实景参考 · 日漫绘景 · 原创配乐',116,692,17,'#ecd6d5',sans);
 g.restore();
}
export function renderFrame(time){
 const t=Math.max(0,Math.min(FILM.duration-1/FILM.fps,time)),i=Math.min(7,Math.floor(t/12)),local=t-i*12,p=local/12;
 drawScene(i,p,t,layers[0]);g.drawImage(layers[0],0,0);
 // Soft overlap plus a few foreground petals connects spaces without a hard cut.
 if(local>11&&i<7){const a=smooth(local,11,12);drawScene(i+1,0,t,layers[1]);g.globalAlpha=a;g.drawImage(layers[1],0,0);g.globalAlpha=1;}
 label(i,local);route(i);if(t<6.1)opening(t);if(t>89)ending(t);
 g.fillStyle='#101b22';g.fillRect(0,0,W,48);g.fillRect(0,1032,W,48);
 if(t<1){g.fillStyle=`rgba(16,27,34,${1-smooth(t,0,1)})`;g.fillRect(0,0,W,H);}
 if(t>94.7){g.fillStyle=`rgba(16,27,34,${smooth(t,94.7,96)})`;g.fillRect(0,0,W,H);}
 return {index:i,local,place:SCENES[i].city+' · '+SCENES[i].name};
}
window.renderFrame=renderFrame;window.FILM=FILM;window.SCENES=SCENES;window.ready=true;renderFrame(2.8);
if(!new URLSearchParams(location.search).has('render')){const start=performance.now();function animate(now){renderFrame((now-start)/1000%96);requestAnimationFrame(animate)}requestAnimationFrame(animate)}
