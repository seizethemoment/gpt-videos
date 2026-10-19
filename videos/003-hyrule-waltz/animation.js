import * as T from 'three';
import {loadActors} from './actors.js';
import {animateActors,DURATION,FPS} from './choreography.js';
import {applyZeldaExpression} from './expressions.js';
import {makeStage} from './stage.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
const W=1920,H=1080;
const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(W,H);renderer.setPixelRatio(1);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
const film=document.createElement('canvas');film.width=W;film.height=H;film.id='film';document.body.appendChild(film);const ctx=film.getContext('2d',{alpha:false});
const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,W/H,.1,300);const stage=makeStage(scene),actors=await loadActors(scene);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new T.Vector2(W,H),.17,.8,.94));composer.addPass(new OutputPass());
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
window.FILM={title:'旷野之舞 · Hyrule Waltz',width:W,height:H,duration:DURATION,fps:FPS};window.actors=actors;window.scene=scene;window.camera=camera;window.THREE=T;
function camerawork(t,state){
 const angle=state.rot+1.57+.27*Math.sin(t*.25);let radius=5.5-.9*Math.sin(Math.PI*t/36),height=1.60+.13*Math.sin(t*.24);
 const turn=ease((t-13.5)/1.5)*(1-ease((t-21.6)/1.8));radius-=turn*.6;height-=turn*.25;
 const end=ease((t-30.6)/5.4);radius+=end*1.2;height+=end*.45;
 camera.position.set(Math.sin(angle)*radius,height,Math.cos(angle)*radius);const p=actors.L.group.position.clone().add(actors.Z.group.position).multiplyScalar(.5);p.y=.95;camera.lookAt(p);camera.updateMatrixWorld();
}
function title(t){const intro=ease(t/.8)*(1-ease((t-3)/1.2));const outro=ease((t-32.8)/1.5);const alpha=Math.max(intro,outro);if(alpha<.005)return;ctx.save();ctx.globalAlpha=alpha;
 const x=132,y=H-182;ctx.fillStyle='#eaddb9';ctx.font='19px Georgia';ctx.fillText('L I N K   &   Z E L D A',x,y-57);ctx.font='42px "Songti SC", "Noto Serif CJK SC", Georgia';ctx.fillText('旷野之舞',x,y);ctx.font='17px Georgia';ctx.fillText('H Y R U L E   W A L T Z',x,y+35);ctx.strokeStyle='#eaddb9';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-82);ctx.lineTo(x+80,y-82);ctx.stroke();ctx.restore();}
function pose(t){const state=animateActors(actors,t);state.expression=applyZeldaExpression(actors.Z,t,window.expressionOverride||{});return state;}
window.samplePose=pose;
window.renderFrame=t=>{t=T.MathUtils.clamp(t,0,36);const state=pose(t);stage.update(t,actors);camerawork(t,state);if(window.portraitMode){const a=actors.Z,center=a.head.getWorldPosition(V()).add(V(0,.065,0)),f=V(0,0,1).applyQuaternion(a.group.quaternion),r=V(1,0,0).applyQuaternion(a.group.quaternion);camera.position.copy(center).addScaledVector(f,.76).addScaledVector(r,.12);camera.lookAt(center);camera.updateMatrixWorld();}composer.render();ctx.drawImage(renderer.domElement,0,0);
 const vignette=ctx.createRadialGradient(W/2,H*.45,H*.25,W/2,H/2,W*.68);vignette.addColorStop(0,'rgba(17,31,28,0)');vignette.addColorStop(1,'rgba(12,26,24,.35)');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#101b1d';ctx.fillRect(0,0,W,70);ctx.fillRect(0,H-70,W,70);title(t);
 const fade=1-ease(t/.8)+ease((t-35.3)/.7);if(fade>.001){ctx.fillStyle=`rgba(16,27,29,${Math.min(1,fade)})`;ctx.fillRect(0,0,W,H);}return state;
};
window.inspect=()=>Object.fromEntries(Object.entries(actors).map(([n,a])=>[n,{bones:Object.keys(a.bones).length,meshes:(()=>{let n=0;a.model.traverse(o=>{if(o.isMesh&&o.visible)n++;});return n;})()}]));
window.renderFrame(6);window.ready=true;document.getElementById('status').remove();
if(!new URLSearchParams(location.search).has('render')){const start=performance.now();function loop(now){window.renderFrame(((now-start)/1000)%36);requestAnimationFrame(loop);}requestAnimationFrame(loop);}
