import * as T from 'three';
import {world,rotateWorld,ik,setWorldQuaternion,jointDelta} from './actors.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Q=()=>new T.Quaternion();
const ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);},lerp=T.MathUtils.lerp;
export const DURATION=36,FPS=30,BPM=100,BAR=1.8;
// Closed position travels through a six-step natural-turn phrase.
function path(t){let rot=.4+Math.max(0,t-3.6)*.40;const travel=Math.max(0,t-3.6);return {center:V(.46*Math.sin(travel*.18),0,.34*Math.sin(travel*.25)),rot};}
function placement(t){const p=path(t),join=ease((t-.6)/3);let r=lerp(.92,.28,join),offset=.12;const spin=ease((t-14.4)/1.8)*(1-ease((t-19.8)/1.8));r+=spin*.02;
 const ll=V(-offset,0,-r),zz=V(offset,0,r);const turn=Q().setFromAxisAngle(V(0,1,0),p.rot);ll.applyQuaternion(turn).add(p.center);zz.applyQuaternion(turn).add(p.center);
 const end=ease((t-32.4)/2.4);return {l:ll,z:zz,lr:p.rot,zr:p.rot+Math.PI+spin*(t-14.4)*2*Math.PI/3.6,join,spin,end,rot:p.rot};}
const local=(a,p)=>a.group.localToWorld(p.clone());
function setRoot(a,pos,rot,bounce,t){a.reset();a.group.position.copy(pos);a.group.position.y=bounce;a.group.rotation.y=rot;a.group.updateMatrixWorld(true);}
function legPose(a,t,phase,dance){
 const feet={};for(const [side,sign]of [['L',1],['R',-1]]){
 const chain=a.legs[side],index=side==='L'?0:1;let k=Math.floor(t/.6);if(((k%2)+2)%2!==index)k--;
 const start=k*.6,u=T.MathUtils.clamp((t-start)/.6,0,1),fromTime=Math.max(0,start-.6),toTime=Math.max(0,start+.6);
 function contact(time){const p=placement(time),pos=(a.name==='Link'?p.l:p.z).clone(),rot=a.name==='Link'?p.lr:p.zr;
 return {p:V(sign*.105,chain.restFoot.y,0).applyAxisAngle(V(0,1,0),rot).add(pos),rot};}
 const from=contact(fromTime),to=contact(toTime),s=ease(u);const target=from.p.lerp(to.p,s);target.y=chain.restFoot.y+Math.sin(Math.PI*u)*.055*(.4+.6*dance);
 const pole=local(a,V(sign*.14,.55,.7));ik(chain,target,pole);
 setWorldQuaternion(chain.c,Q().setFromAxisAngle(V(0,1,0),lerp(from.rot,to.rot,s)).multiply(chain.endQ));feet[side]=world(chain.c);
 }return feet;
}
function fingers(a){for(const [name,b]of Object.entries(a.bones)){
 if(a.name==='Link'&&/(Index|Middle|Ring|Pinky)[123]$/.test(name))jointDelta(b,.22,0,0);
 if(a.name==='Zelda'&&/Bip001_(Index|Middle|Ring|Pinky)[12]?_[LR]$/.test(name))jointDelta(b,0,0,.12);
}}
export function animateActors(actors,t){
 const {L,Z}=actors,p=placement(t);const active=ease((t-1.8)/1.8)*(1-.6*p.end),rise=.026*Math.sin((t/.6%3)/3*Math.PI)*active;const sway=.035*Math.sin(t/1.8*Math.PI);
 setRoot(L,p.l,p.lr,rise,t);setRoot(Z,p.z,p.zr,rise,t);
 rotateWorld(L.spine,Q().setFromEuler(new T.Euler(0,0,sway)));rotateWorld(Z.spine,Q().setFromEuler(new T.Euler(0,0,-sway)));
 // A small inward inclination and eye-line suggest conversation, not a fixed stare.
 rotateWorld(L.head,Q().setFromEuler(new T.Euler(.035,.055*Math.sin(t*.8),-.025)));
 rotateWorld(Z.head,Q().setFromEuler(new T.Euler(.05,-.06*Math.sin(t*.8),.025)));
 legPose(L,t,0,active);legPose(Z,t,3,active);
 // A shared hand target is solved by each skeleton, maintaining contact during the turn.
 const center=p.l.clone().add(p.z).multiplyScalar(.5);center.y=1.32+rise;
 const side=V(.36,0,0).applyAxisAngle(V(0,1,0),p.rot);const hand=center.clone().add(side);
 const high=ease((t-14.4)/1.2)*(1-ease((t-20.4)/1.2));hand.y+=high*.31;hand.addScaledVector(side,-high*.80);
 const restLH=local(L,V(.33,.88,.12)),restZR=local(Z,V(-.30,.90,.12));const join=ease((t-.5)/2.5);const leftTarget=restLH.lerp(hand,join),rightTarget=restZR.lerp(hand.clone().add(V(0,.012,0)),join);
 const errors=[];errors.push(ik(L.arms.L,leftTarget,local(L,V(.7,1.02,.22))));errors.push(ik(Z.arms.R,rightTarget,local(Z,V(-.7,1.08,.25))));
 let support=local(Z,V(.15,1.12,-.035)),shoulder=local(L,V(-.18,1.33,.08));
 const open=p.spin;
 support.lerp(local(L,V(-.42,.91,.23)),open);shoulder.lerp(local(Z,V(.46,.96,.23)),open);
 errors.push(ik(L.arms.R,local(L,V(-.30,.88,.1)).lerp(support,join),local(L,V(-.57,1.00,.25))));
 errors.push(ik(Z.arms.L,local(Z,V(.30,.90,.1)).lerp(shoulder,join),local(Z,V(.65,1.14,.2))));
 // Palms oppose across the shared hold. This also rotates the fingers toward one another.
 setWorldQuaternion(L.arms.L.c,Q().setFromEuler(new T.Euler(.5,p.rot-.1,-.8)));
 setWorldQuaternion(Z.arms.R.c,Q().setFromEuler(new T.Euler(.2,p.rot+.7,1.0)));
 fingers(L);fingers(Z);
 for(const [n,b]of Object.entries(Z.bones))if(/HairLong[1-5]?_[CLR]$/.test(n))jointDelta(b,.025*Math.sin(t*2.2),.015*Math.sin(t*1.7),.025*Math.sin(t*1.5));
 // Both performers settle together over the last two bars.
 const bow=.10*p.end;rotateWorld(L.spine,Q().setFromAxisAngle(V(1,0,0),bow));rotateWorld(Z.spine,Q().setFromAxisAngle(V(1,0,0),-bow*.5));
 return {maxHandError:Math.max(...errors),sharedHandError:world(L.arms.L.c).distanceTo(world(Z.arms.R.c)),phase:p.spin>.5?'underarm-turn':p.end>.5?'coda':p.join<.9?'invitation':'natural-turn',center,rot:p.rot};
}
