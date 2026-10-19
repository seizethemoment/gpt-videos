import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);let seed=9312;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
export function makeStage(scene){
 scene.background=new T.Color(0xb6c3b7);scene.fog=new T.FogExp2(0xb6c3b7,.018);
 const hemi=new T.HemisphereLight(0xd4ebef,0x66735a,1.45);scene.add(hemi);
 const sun=new T.DirectionalLight(0xffcd89,3.6);sun.position.set(-8,12,-7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:45});sun.shadow.bias=-.00035;sun.shadow.normalBias=.018;sun.shadow.radius=4;scene.add(sun);
 const fill=new T.DirectionalLight(0xdcebed,.8);fill.position.set(2,5,7);scene.add(fill);
 const panorama=new T.TextureLoader().load('assets/hyrule-panorama.png');panorama.colorSpace=T.SRGBColorSpace;panorama.wrapS=T.MirroredRepeatWrapping;panorama.repeat.set(.76,.78);scene.background=panorama;
 const skyMat={uniforms:{uTime:{value:0}}};
 const mats={stone:new T.MeshStandardMaterial({color:0x929386,roughness:.99}),light:new T.MeshStandardMaterial({color:0xb9b69a,roughness:.97}),dark:new T.MeshStandardMaterial({color:0x646f68,roughness:.96}),edge:new T.MeshStandardMaterial({color:0xaa9b6d,roughness:.9}),gold:new T.MeshStandardMaterial({color:0xc4ae73,roughness:.7,metalness:.2}),grass:new T.MeshLambertMaterial({color:0x788653}),leaf:new T.MeshLambertMaterial({color:0x71875c,side:T.DoubleSide})};
 const stoneCanvas=document.createElement('canvas');stoneCanvas.width=stoneCanvas.height=256;const st=stoneCanvas.getContext('2d');st.fillStyle='#b5b4a3';st.fillRect(0,0,256,256);for(let i=0;i<18000;i++){const a=rnd(),n=125+Math.floor(rnd()*90);st.fillStyle=`rgba(${n},${n+2},${n-8},${a*.2})`;st.fillRect(rnd()*256,rnd()*256,1+rnd()*3,1+rnd()*3);}const stoneTexture=new T.CanvasTexture(stoneCanvas);stoneTexture.wrapS=stoneTexture.wrapT=T.RepeatWrapping;stoneTexture.repeat.set(2,3);stoneTexture.colorSpace=T.SRGBColorSpace;for(const n of ['stone','light','dark'])mats[n].map=stoneTexture;
 const put=(geo,mat,x,y,z,ry=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;};
 const disk=new T.CylinderGeometry(4.6,4.7,.24,96);put(disk,mats.dark,0,-.16,0);put(new T.CylinderGeometry(4.5,4.6,.1,96),mats.light,0,-.04,0);
 // Fine radial paving with moss-filled joints and a quiet brass inlay.
 for(let ring=0;ring<7;ring++){
 const r0=.12+ring*.61,r1=r0+.59,segments=Math.max(12,ring*12);
 for(let i=0;i<segments;i++){
 const a=(i/segments)*Math.PI*2,b=((i+1)/segments)*Math.PI*2;const shape=new T.Shape();shape.absarc(0,0,r0,a+.006,b-.006,false);shape.absarc(0,0,r1,b-.006,a+.006,true);shape.closePath();const g=new T.ShapeGeometry(shape,3);g.rotateX(-Math.PI/2);const col=new T.Color(0xa0a291).offsetHSL(0,(rnd()-.5)*.04,(rnd()-.5)*.10);put(g,new T.MeshStandardMaterial({color:col,roughness:1}),0,.012+(rnd()-.5)*.006,0);
 }
 }
 for(const r of [1.3,2.55,3.76,4.38]){const m=put(new T.TorusGeometry(r,.012,5,180),mats.gold,0,.025,0);m.rotation.x=Math.PI/2;}
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const shape=new T.Shape();shape.moveTo(-.05,0);shape.lineTo(0,.19);shape.lineTo(.05,0);shape.lineTo(0,-.13);shape.closePath();const g=new T.ShapeGeometry(shape);g.rotateX(-Math.PI/2);put(g,mats.gold,3.82*Math.cos(a),.03,3.82*Math.sin(a),-a);}
 // Grass outside the stone terrace, softly rolling away toward Hyrule.
 const ground=new T.CircleGeometry(8.0,80);ground.rotateX(-Math.PI/2);const gp=ground.attributes.position;for(let i=0;i<gp.count;i++){const x=gp.getX(i),z=gp.getZ(i),r=Math.hypot(x,z);gp.setY(i,-.28+Math.sin(x*.12)*Math.cos(z*.13)*Math.min(1,Math.max(0,(r-6)/10))*1.2);}ground.computeVertexNormals();put(ground,mats.grass,0,0,0);
 // Layered distant silhouettes. All geometry is original and generated here.
 // Broken columns, recessed bands, chipped capitals and flying arch segments.
 const column=(x,z,h,r=.35)=>{
 put(new T.BoxGeometry(r*3.2,.22,r*3.2),mats.dark,x,.10,z);put(new T.BoxGeometry(r*2.8,.15,r*2.8),mats.light,x,.29,z);
 put(new T.CylinderGeometry(r*.92,r,h,10),mats.stone,x,h/2+.37,z);for(const yy of [.42,h+.28,h+.45])put(new T.CylinderGeometry(r*1.2,r*1.2,.12,10),mats.light,x,yy,z);
 if(h>2.8)put(new T.BoxGeometry(r*3.2,.20,r*3.2),mats.light,x,h+.6,z);
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5;const groove=put(new T.BoxGeometry(.026,h*.82,.018),mats.dark,x+Math.cos(a)*r*.97,h/2+.37,z+Math.sin(a)*r*.97);groove.rotation.y=-a;}
 };
 column(-3.4,-3.7,3.4,.32);column(3.4,-3.7,3.4,.32);column(-5.3,-.8,2.0,.38);column(5.2,-1.3,2.6,.34);column(-4.4,3.8,1.05,.31);
 const arch=(cx,z,width,base)=>{const radius=width/2;for(let i=0;i<17;i++){if(i===3||i===4)continue;const a=(i+.5)*Math.PI/17;const sh=new T.Shape(),a0=i*Math.PI/17+.009,a1=(i+1)*Math.PI/17-.009;sh.absarc(0,0,radius,a0,a1,false);sh.absarc(0,0,radius+.34,a1,a0,true);sh.closePath();put(new T.ExtrudeGeometry(sh,{depth:.44,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.018,bevelThickness:.015}),i%3===0?mats.light:mats.stone,cx,base,z);}};
 arch(0,-3.9,6.8,3.95);
 // Two truncated arches imply the remaining hall outside the field of view.
 column(-6.0,-7.0,4.6,.40);column(6.0,-7.0,3.9,.40);
 for(let i=0;i<30;i++){const a=rnd()*Math.PI*2,r=4.8+rnd()*3.2;put(new T.DodecahedronGeometry(.14+rnd()*.26,0),i%2?mats.dark:mats.light,Math.cos(a)*r,.06,Math.sin(a)*r,rnd()*6.3);}
 // Ivy climbs the back columns; leaf cards are instanced to keep export fast.
 const leafShape=new T.Shape();leafShape.moveTo(0,-.1);leafShape.bezierCurveTo(-.12,.0,-.09,.08,0,.1);leafShape.bezierCurveTo(.09,.08,.12,0,0,-.1);const leafGeo=new T.ShapeGeometry(leafShape),ivy=new T.InstancedMesh(leafGeo,mats.leaf,600),obj=new T.Object3D();
 for(let i=0;i<600;i++){const side=i<300?-1:1,t=(i%300)/300,h=t*4.1;obj.position.set(side*3.4+.36*Math.cos(h*4+i),h,-3.65+.37*Math.sin(h*4+i));obj.rotation.set((rnd()-.5)*1.2,rnd()*6.28,rnd()*2);obj.scale.setScalar(.5+rnd());obj.updateMatrix();ivy.setMatrixAt(i,obj.matrix);}ivy.castShadow=true;scene.add(ivy);
 // Thin blades, scattered blue flowers and foreground leaves move in the wind.
 const bladeGeo=new T.BufferGeometry();bladeGeo.setAttribute('position',new T.Float32BufferAttribute([-.014,0,0,.014,0,0,0,.33,.04],3));bladeGeo.computeVertexNormals();
 const grassMat=new T.MeshLambertMaterial({color:0x6c824d,side:T.DoubleSide});grassMat.onBeforeCompile=s=>{s.uniforms.windTime={value:0};grassMat.userData.shader=s;s.vertexShader='uniform float windTime;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x+=sin(windTime*1.6+instanceMatrix[3].x*.6+instanceMatrix[3].z*.8)*pow(position.y,2.)*.50;');};
 const grass=new T.InstancedMesh(bladeGeo,grassMat,16000);
 for(let i=0;i<16000;i++){const a=rnd()*Math.PI*2,r=4.65+rnd()*3.2;obj.position.set(Math.cos(a)*r,-.16,Math.sin(a)*r);obj.rotation.set(0,rnd()*6.28,0);obj.scale.set(.7+rnd(),.4+rnd()*1.2,.7+rnd());obj.updateMatrix();grass.setMatrixAt(i,obj.matrix);grass.setColorAt(i,new T.Color().setHSL(.22+rnd()*.04,.25+rnd()*.16,.27+rnd()*.16));}grass.receiveShadow=true;scene.add(grass);
 const flowers=new T.InstancedMesh(new T.SphereGeometry(.045,5,3),new T.MeshLambertMaterial({color:0x8cc7e0}),170);
 for(let i=0;i<170;i++){const a=rnd()*6.28,r=4.5+rnd()*3.4;obj.position.set(Math.cos(a)*r,.1+rnd()*.15,Math.sin(a)*r);obj.scale.set(1,.5,1);obj.updateMatrix();flowers.setMatrixAt(i,obj.matrix);}scene.add(flowers);
 // Evening motes with restrained additive glow.
 const cc=document.createElement('canvas');cc.width=cc.height=64;const ctx=cc.getContext('2d'),gr=ctx.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,241,182,1)');gr.addColorStop(.15,'rgba(255,222,135,.8)');gr.addColorStop(.5,'rgba(255,207,100,.1)');gr.addColorStop(1,'rgba(255,207,100,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,64,64);
 const positions=new Float32Array(150*3),orig=[];for(let i=0;i<150;i++){orig.push([ (rnd()-.5)*15,.3+rnd()*5,(rnd()-.5)*14,rnd()*6.28]);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const particles=new T.Points(geo,new T.PointsMaterial({map:new T.CanvasTexture(cc),size:.09,color:0xffdf9b,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));scene.add(particles);
 // Contact shadows remain soft on stone even in shaded camera angles.
 const sc=document.createElement('canvas');sc.width=sc.height=128;const sx=sc.getContext('2d'),sg=sx.createRadialGradient(64,64,0,64,64,64);sg.addColorStop(0,'rgba(20,30,24,.40)');sg.addColorStop(1,'rgba(20,30,24,0)');sx.fillStyle=sg;sx.fillRect(0,0,128,128);
 const shadows=[];for(let i=0;i<2;i++){const m=put(new T.PlaneGeometry(.9,.9),new T.MeshBasicMaterial({map:new T.CanvasTexture(sc),transparent:true,depthWrite:false}),0,.034,0);m.rotation.x=-Math.PI/2;m.castShadow=false;m.receiveShadow=false;shadows.push(m);}
 return {update(t,actors){skyMat.uniforms.uTime.value=t;panorama.offset.x=.12+Math.sin(t*.035)*.06;if(grassMat.userData.shader)grassMat.userData.shader.uniforms.windTime.value=t;for(let i=0;i<orig.length;i++){const [x,y,z,a]=orig[i];positions[i*3]=x+Math.sin(t*.18+a)*.45;positions[i*3+1]=y+Math.sin(t*.4+a)*.2;positions[i*3+2]=z+Math.cos(t*.15+a)*.4;}geo.attributes.position.needsUpdate=true;shadows.forEach((s,i)=>{const a=i?actors.Z:actors.L;s.position.x=a.group.position.x;s.position.z=a.group.position.z;});}};
}
