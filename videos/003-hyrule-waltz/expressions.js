import * as T from 'three';
import {world,rotateWorld} from './actors.js';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),Q=()=>new T.Quaternion();
const ease=x=>{x=T.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};
export const BLINK_TIMES=[129,264,378,460,517,580,714,840,981].map(frame=>frame/30);
function blinkAt(t){let b=0;for(const center of BLINK_TIMES){const dt=t-center;if(dt<-.075||dt>.145)continue;const amount=dt<=0?ease((dt+.075)/.075):1-ease(dt/.145);b=Math.max(b,amount);}return b;}
// Rest transforms are restored by animateActors before these offsets are applied.
export function applyZeldaExpression(a,t,override={}){
 const duringTurn=ease((t-13.8)/1.25)*(1-ease((t-21.5)/1.7));
 const smile=override.smile??(.12+.88*duringTurn),blink=override.blink??blinkAt(t);
 const b=a.bones,head=a.head;
 const right=V(1,0,0).applyQuaternion(a.group.quaternion),up=V(0,1,0),forward=V(0,0,1).applyQuaternion(a.group.quaternion);
 function move(name,x,y,z=0){const bone=b['Bip001_'+name];if(!bone)return;const target=world(bone).addScaledVector(right,x).addScaledVector(up,y).addScaledVector(forward,z);bone.position.copy(bone.parent.worldToLocal(target));bone.updateWorldMatrix(false,true);}
 for(const [side,sign]of [['L',1],['R',-1]]){
  move('LipCorner_'+side,sign*.0020*smile,.0060*smile,.0004*smile);
  move('Smile_'+side,sign*.0012*smile,.0030*smile);
  move('LipUpper1_'+side,sign*.0003*smile,.0011*smile);
  move('LipUpper2_'+side,sign*.0008*smile,.0028*smile);
  move('LipLower1_'+side,sign*.0003*smile,.0008*smile);
  move('LipLower2_'+side,sign*.0007*smile,.0025*smile);
  move('Cheek1_'+side,sign*.0008*smile,.0023*smile);
  move('Cheek2_'+side,sign*.0004*smile,.0017*smile);
  move('BrowInner_'+side,0,.0008*smile);move('BrowMid_'+side,0,.0005*smile);
  const upper=b['Bip001_EyelidUp_'+side],lower=b['Bip001_EyelidDown_'+side],upperTip=b['Bip001_EyelidUp1_'+side],lowerTip=b['Bip001_EyelidDown1_'+side];
  const u=world(upperTip).sub(world(upper)).normalize(),l=world(lowerTip).sub(world(lower)).normalize();
  const seam=u.clone().multiplyScalar(.36).addScaledVector(l,.64).normalize();
  const upperAmount=Math.max(blink,.045*smile),lowerAmount=Math.max(blink,.09*smile);
  rotateWorld(upper,Q().identity().slerp(Q().setFromUnitVectors(u,seam),upperAmount));
  rotateWorld(lower,Q().identity().slerp(Q().setFromUnitVectors(l,seam),lowerAmount));
 }
 move('LipLower_C',0,-.0005*smile);return{smile,blink,duringTurn};
}
