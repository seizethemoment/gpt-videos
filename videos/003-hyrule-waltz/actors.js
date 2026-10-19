import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/addons/loaders/FBXLoader.js';
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),q=()=>new T.Quaternion();
export async function loadActors(scene){
 const mgr=new T.LoadingManager();mgr.setURLModifier(u=>u.toLowerCase().endsWith('.png')?'.runtime/zelda-project/Textures/'+u.replaceAll('\\','/').split('/').pop():u);
 const [lg,zm]=await Promise.all([new GLTFLoader().loadAsync('.runtime/link.glb'),new FBXLoader(mgr).loadAsync('.runtime/zelda-project/Mesh/zeldaSkelNoProps_V001_008.fbx')]);
 const tx=new T.TextureLoader();const textures={};for(const n of ['zelda','eyes','hairLong','hair']){textures[n]=await tx.loadAsync('.runtime/zelda-project/Textures/'+n+'_diff.png');textures[n].colorSpace=T.SRGBColorSpace;textures[n].anisotropy=8;}
 zm.traverse(o=>{if(!o.isMesh)return;const n=o.name;if(n.includes('Backface')||n.includes('backface')||n==='mesh_zeldaHair'||n==='mesh_zeldaCape'||n==='mesh_zeldaPouch')o.visible=false;let map=n.includes('Eyes')?textures.eyes:n.includes('HairLong')?textures.hairLong:n.includes('Hair')?textures.hair:textures.zelda;
 o.material=new T.MeshToonMaterial({map,color:0xffffff,side:T.DoubleSide,alphaTest:.4});o.castShadow=true;o.receiveShadow=false;});
 lg.scene.traverse(o=>{if(!o.isMesh)return;if(o.name.includes('Hat_005'))o.visible=false;const old=o.material;const m=new T.MeshToonMaterial({map:old.map,color:0xffffff,alphaTest:old.alphaTest||.3,side:T.DoubleSide});
 if(old.map)old.map.anisotropy=8;
 // Recolor the green tunic in shader space, retaining its existing fabric detail.
 if(old.name==='Mt_Upper_005'){m.map=null;m.color.set(0x1687ba);}
 if(old.name==='Mt_Lower_Skin.001'){m.color.set(0x746650);m.map=null;}
 o.material=m;o.castShadow=true;o.receiveShadow=false;});
 function setup(model,name,height){
 const group=new T.Group();group.name=name;scene.add(group);group.add(model);model.updateMatrixWorld(true);
 const box=new T.Box3().setFromObject(model);model.scale.multiplyScalar(height/(box.max.y-box.min.y));model.updateMatrixWorld(true);const b=new T.Box3().setFromObject(model);model.position.add(v(-(b.min.x+b.max.x)/2,-b.min.y,-(b.min.z+b.max.z)/2));group.updateMatrixWorld(true);
 const bones={},rest=[];model.traverse(o=>{if(o.isBone){if(!bones[o.name])bones[o.name]=o;rest.push({b:o,q:o.quaternion.clone(),p:o.position.clone()});}});
 const B=n=>bones[name==='Link'?'mixamorig'+n:'Bip001_'+n];
 const actor={name,group,model,bones,rest,B,height};
 actor.head=B('Head');actor.spine=B(name==='Link'?'Spine2':'Spine3');actor.hips=B(name==='Link'?'Hips':'Pelvis');actor.arms={};actor.legs={};
 for(const side of ['L','R']){
 const sn=side==='L'?'Left':'Right';const a=name==='Link'?[B(sn+'Arm'),B(sn+'ForeArm'),B(sn+'Hand')]:[B('UpperArm_'+side),B('Forearm_'+side),B('Hand_'+side)];
 const l=name==='Link'?[B(sn+'UpLeg'),B(sn+'Leg'),B(sn+'Foot')]:[B('Thigh_'+side),B('Calf_'+side),B('Foot_'+side)];
 actor.arms[side]=makeChain(a);actor.legs[side]=makeChain(l);}
 actor.reset=()=>{for(const r of rest){r.b.quaternion.copy(r.q);r.b.position.copy(r.p);}group.position.set(0,0,0);group.rotation.set(0,0,0);};
 return actor;
 }
 const L=setup(lg.scene,'Link',1.73),Z=setup(zm,'Zelda',1.78);
 // A code-drawn white royal crest sits on the recolored tunic.
 const cv=document.createElement('canvas');cv.width=256;cv.height=320;const c=cv.getContext('2d');c.strokeStyle='#e9eee1';c.fillStyle='#e9eee1';c.lineWidth=8;c.lineCap='round';
 function line(points){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 line([[128,240],[128,108],[116,78],[128,62],[140,78],[128,108]]);
 for(const side of [-1,1]){line([[128,146],[128+side*35,137],[128+side*65,106],[128+side*90,103]]);for(let j=0;j<3;j++)line([[128+side*(31+j*19),145-j*14],[128+side*(56+j*19),156-j*14],[128+side*(69+j*19),147-j*14]]);line([[128,202],[128+side*27,220],[128+side*46,216]]);}
 for(const [x,y]of [[112,45],[144,45],[128,17]]){c.beginPath();c.moveTo(x,y);c.lineTo(x-14,y+25);c.lineTo(x+14,y+25);c.closePath();c.fill();}
 const crest=new T.Mesh(new T.PlaneGeometry(.185,.24),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}));
 crest.position.set(0,1.17,.194);L.group.add(crest);L.group.updateMatrixWorld(true);L.spine.attach(crest);
 return {L,Z};
}
function makeChain(bs){const [a,b,c]=bs,pa=a.getWorldPosition(v()),pb=b.getWorldPosition(v()),pc=c.getWorldPosition(v());return {a,b,c,l1:pa.distanceTo(pb),l2:pb.distanceTo(pc),endQ:c.getWorldQuaternion(q()),restFoot:pc};}
export function world(o){return o.getWorldPosition(v());}
export function rotateWorld(o,delta){const parent=o.parent.getWorldQuaternion(q()).invert(),w=o.getWorldQuaternion(q());o.quaternion.copy(parent.multiply(delta).multiply(w));o.updateWorldMatrix(false,true);}
export function aim(o,endpoint,target){const start=world(o),cur=world(endpoint).sub(start).normalize(),desired=target.clone().sub(start).normalize();rotateWorld(o,q().setFromUnitVectors(cur,desired));}
export function ik(chain,target,pole){
 const {a,b,c,l1,l2}=chain;const p=world(a),d=target.clone().sub(p),len=Math.max(.001,Math.min(d.length(),(l1+l2)*.997));d.normalize();const pv=pole.clone().sub(p);pv.addScaledVector(d,-pv.dot(d)).normalize();const cos=T.MathUtils.clamp((l1*l1+len*len-l2*l2)/(2*l1*len),-1,1);const elbow=p.clone().addScaledVector(d,l1*cos).addScaledVector(pv,l1*Math.sqrt(1-cos*cos));
 aim(a,b,elbow);aim(b,c,target);return world(c).distanceTo(target);
}
export function setWorldQuaternion(o,w){o.quaternion.copy(o.parent.getWorldQuaternion(q()).invert().multiply(w));o.updateWorldMatrix(false,true);}
export function jointDelta(b,x=0,y=0,z=0){b.quaternion.multiply(q().setFromEuler(new T.Euler(x,y,z)));b.updateWorldMatrix(false,true);}
