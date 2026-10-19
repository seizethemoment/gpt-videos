/* Camera physics / absolute-time, deterministic Canvas 2D animation.
   All optical diagrams are explanatory models rather than lens prescriptions. */
(() => {
  'use strict';
  const canvas=document.getElementById('film'),g=canvas.getContext('2d',{alpha:false});
  const W=1920,H=1080,T=window.NARRATION.spec.duration;
  const C={bg:'#09141c',panel:'#10212b',ink:'#edf3ef',muted:'#8da5af',line:'#334853',gold:'#efbe83',cyan:'#79d1d3',red:'#e79485'};
  const CN='"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif',SANS='Arial,sans-serif',SERIF='Georgia,serif';
  const spec=window.NARRATION.spec,chapters=spec.chapters;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,p)=>a+(b-a)*p;
  const ease=p=>{p=clamp(p);return p*p*(3-2*p);},p=(t,a,b)=>clamp((t-a)/(b-a)),s=(t,a,b)=>ease(p(t,a,b));
  const tau=Math.PI*2;
  let state=20261019;
  const random=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
  function text(str,x,y,size=28,color=C.ink,font=CN,weight='400',align='left'){
    g.font=`${weight} ${size}px ${font}`;g.fillStyle=color;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(str,x,y);
  }
  function track(str,x,y,size=16,space=3,color=C.muted,align='left'){
    g.font=`500 ${size}px ${SANS}`;let width=-space;for(const ch of str)width+=g.measureText(ch).width+space;
    let at=align==='center'?x-width/2:align==='right'?x-width:x;
    g.textAlign='left';g.fillStyle=color;for(const ch of str){g.fillText(ch,at,y);at+=g.measureText(ch).width+space;}
  }
  function line(x1,y1,x2,y2,color=C.line,width=2,dash=[]){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=width;g.setLineDash(dash);g.stroke();g.setLineDash([]);}
  function circle(x,y,r,fill,stroke=null,width=1){if(r<=0)return;g.beginPath();g.arc(x,y,r,0,tau);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
  function rect(x,y,w,h,r=16,fill=C.panel,stroke=C.line,width=1){g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
  function glow(x,y,r,color=C.gold,alpha=.35){g.save();g.globalAlpha*=alpha;const d=g.createRadialGradient(x,y,0,x,y,r);d.addColorStop(0,color);d.addColorStop(1,color+'00');circle(x,y,r,d);g.restore();}
  function dot(x,y,color=C.gold,r=5){glow(x,y,r*5,color,.24);circle(x,y,r,color);circle(x-1,y-1,r*.33,'#fff9eb');}
  function poly(points,fill,stroke=null,width=1){g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
  function badge(str,x,y,color=C.gold){g.font=`500 19px ${CN}`;const width=g.measureText(str).width+36;rect(x,y-26,width,40,20,color+'12',color+'65');text(str,x+18,y+1,19,color);return width;}
  function arrow(x,y1,y2,color=C.gold,width=13){const dir=Math.sign(y2-y1);line(x,y1,x,y2-dir*17,color,width);poly([[x,y2],[x-20,y2-dir*30],[x+20,y2-dir*30]],color);}
  function ray(points,color,t,alpha=1,width=2.2){
    g.save();g.globalAlpha*=alpha;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.strokeStyle=color+'20';g.lineWidth=width*6;g.stroke();g.strokeStyle=color+'bc';g.lineWidth=width;g.stroke();
    const lengths=[];let total=0;for(let i=1;i<points.length;i++){const len=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);lengths.push(len);total+=len;}
    for(let n=0;n<3;n++){let d=((t*.31+n/3)%1)*total;for(let i=0;i<lengths.length;i++){if(d<=lengths[i]){const u=d/lengths[i];dot(mix(points[i][0],points[i+1][0],u),mix(points[i][1],points[i+1][1],u),color,3);break;}d-=lengths[i];}}
    g.restore();
  }
  function dimension(x1,x2,y,label,color=C.muted){line(x1,y,x2,y,color,1.2);line(x1,y-7,x1,y+7,color,1.2);line(x2,y-7,x2,y+7,color,1.2);g.save();g.font=`20px ${CN}`;const width=g.measureText(label).width+26;rect((x1+x2-width)/2,y-16,width,31,10,C.bg,null);text(label,(x1+x2)/2,y+7,20,color,CN,'400','center');g.restore();}

  const base=document.createElement('canvas');base.width=W;base.height=H;
  {const b=base.getContext('2d');b.fillStyle=C.bg;b.fillRect(0,0,W,H);const grad=b.createRadialGradient(1300,450,60,1100,500,1100);grad.addColorStop(0,'#1735448c');grad.addColorStop(1,'#09141c00');b.fillStyle=grad;b.fillRect(0,0,W,H);b.strokeStyle='#a9cfdd08';b.lineWidth=1;for(let x=80;x<W;x+=80){b.beginPath();b.moveTo(x,120);b.lineTo(x,H-100);b.stroke();}for(let y=160;y<H-100;y+=80){b.beginPath();b.moveTo(80,y);b.lineTo(W-80,y);b.stroke();}for(let i=0;i<140;i++){b.fillStyle='#c9e1df'+Math.round(8+random()*20).toString(16).padStart(2,'0');b.fillRect(90+random()*1740,130+random()*780,1,1);}}
  function background(){g.drawImage(base,0,0);}
  function sectionHeader(i,t){
    track('THE OPTICS SERIES',100,65,15,3.2,C.muted);track('GPT VIDEOS / 002',1820,65,15,2.7,C.muted,'right');line(100,95,1820,95,C.line,1);
    if(i===0)return;
    const a=s(t,.10,.8);g.save();g.globalAlpha*=a;g.translate(0,14*(1-a));
    text(chapters[i].title,110,183,53,C.ink,CN,'500');track(i===1?(t<6?'01 · PINHOLE IMAGING / INVERTED IMAGE':'02 · LENS IMAGING / FOCUS'):chapters[i].en,114,229,15,3.6,C.gold);text(String(i).padStart(2,'0'),1816,182,58,C.line,SERIF,'400','right');g.restore();
  }
  function iris(x,y,R,hole,t=0){
    g.save();g.translate(x,y);circle(0,0,R,'#14232c','#5b727a',2);
    const shade=g.createRadialGradient(-R*.4,-R*.5,0,0,0,R);shade.addColorStop(0,'#61727a');shade.addColorStop(.46,'#2c424b');shade.addColorStop(1,'#0a171e');circle(0,0,R-5,shade);
    for(let i=0;i<9;i++){const a=i*tau/9+t*.05;g.beginPath();g.moveTo(Math.cos(a)*hole,Math.sin(a)*hole);g.quadraticCurveTo(Math.cos(a+.45)*R*.64,Math.sin(a+.45)*R*.64,Math.cos(a+.7)*R,Math.sin(a+.7)*R);g.strokeStyle=i%2?'#78909668':'#0b151b';g.lineWidth=2;g.stroke();}
    const points=Array.from({length:9},(_,i)=>[Math.cos(i*tau/9-.15)*hole,Math.sin(i*tau/9-.15)*hole]);
    const well=g.createRadialGradient(-hole*.2,-hole*.2,2,0,0,Math.max(3,hole));well.addColorStop(0,'#ddb579');well.addColorStop(.16,'#326269');well.addColorStop(.57,'#0a2b32');well.addColorStop(1,'#030a10');poly(points,well,'#9cc9cb70',1.5);
    g.beginPath();g.arc(0,0,R-1,.9,3.8);g.strokeStyle='#a1c5c278';g.lineWidth=1;g.stroke();g.restore();
  }
  function lensFront(x,y,R,t=0){
    g.save();g.translate(x,y);
    const body=g.createLinearGradient(-R,-R,R,R);body.addColorStop(0,'#61747e');body.addColorStop(.18,'#18232d');body.addColorStop(.47,'#596b70');body.addColorStop(.65,'#0b1218');body.addColorStop(1,'#364b54');circle(0,0,R,body,'#79909880',1.5);
    [0.96,.92,.88,.84,.78].forEach((r,i)=>{circle(0,0,R*r,i%2?'#101920':'#243741',i%2?'#53616b':'#73848b50',i===2?4:2);});
    for(let i=0;i<84;i++){const a=i*tau/84;line(Math.cos(a)*R*.925,Math.sin(a)*R*.925,Math.cos(a)*R*.958,Math.sin(a)*R*.958,'#94aaa438',1);}
    iris(0,0,R*.725,R*(.26+.04*Math.sin(t*.65)),t);
    g.save();g.beginPath();g.arc(0,0,R*.72,0,tau);g.clip();const reflection=g.createLinearGradient(-R,-R,R,R);reflection.addColorStop(0,'#82cbd844');reflection.addColorStop(.44,'#ffffff00');reflection.addColorStop(.55,'#f1bb682b');reflection.addColorStop(1,'#d3e6da03');g.fillStyle=reflection;g.fillRect(-R,-R,R*2,R*2);g.translate(-R*.3,-R*.28);g.rotate(-.65);rect(-R*.12,-R*.4,R*.17,R*.58,20,'#d9efdf12',null);g.restore();
    g.beginPath();g.arc(0,0,R*.79,3.5,5.5);g.strokeStyle='#92d7d764';g.lineWidth=2;g.stroke();g.beginPath();g.arc(0,0,R*.71,.15,1.4);g.strokeStyle='#efbe8370';g.stroke();
    const name='50 mm   /   OPTICAL STUDIES   /   1:1.8';g.font=`12px ${SANS}`;g.fillStyle='#b6c5bf';g.textAlign='center';
    Array.from(name).forEach((ch,i)=>{const a=-2.6+i*.057;g.save();g.translate(Math.cos(a)*R*.815,Math.sin(a)*R*.815);g.rotate(a+Math.PI/2);g.fillText(ch,0,0);g.restore();});g.restore();
  }
  function camera(x,y,scale,t){
    g.save();g.translate(x,y);g.scale(scale,scale);
    const metal=g.createLinearGradient(0,-205,0,195);metal.addColorStop(0,'#3c505a');metal.addColorStop(.15,'#1e2c34');metal.addColorStop(.2,'#121e26');metal.addColorStop(.85,'#0b141c');metal.addColorStop(1,'#263942');
    rect(-350,-181,700,385,36,metal,'#60727b',2);rect(-332,-92,664,252,24,'#111e26','#2c3d44',1);
    for(let i=0;i<50;i++){line(228+i*1.5,-70,228+i*1.5,143,'#71838412',1);}
    poly([[-157,-182],[-116,-238],[35,-238],[85,-182]],'#344853','#697b82',1.5);rect(-91,-226,105,34,8,'#10232e','#52707b',1);rect(159,-214,103,34,9,'#2f424b','#7e9298',1.5);
    for(let i=0;i<14;i++)line(165+i*6,-210,165+i*6,-191,'#b0c1b54d',1);
    circle(-243,-192,37,'#2c4049','#87989c',1.5);circle(-243,-192,25,'#15242d','#536e76',1);circle(297,-118,9,'#75918c');
    text('OPTICS',-310,-136,19,'#a7babd',SANS,'500');circle(-304,169,5,'#7a8b86');circle(304,169,5,'#7a8b86');
    lensFront(-28,5,234,t);g.restore();
  }
  function intro(t){
    background();const a=s(t,.2,1.5);g.save();g.globalAlpha*=a;g.translate(-28*(1-a),0);
    badge('成像 · 曝光 · 应用',128,266,C.gold);
    text('光，如何',126,386,100,C.ink,CN,'300');text('成为照片。',126,512,100,C.gold,CN,'500');
    text('A slice of light. A slice of time.',134,577,29,C.muted,SERIF,'400');
    [['成像原理','Imaging'],['曝光三角','Exposure'],['场景应用','Applications']].forEach(([str,en],i)=>{line(140+i*245,658,180+i*245,658,i===0?C.gold:C.cyan,2);text(str,140+i*245,707,24,C.muted);text(en,140+i*245,742,18,C.muted,SERIF);});g.restore();
    g.save();g.globalAlpha*=s(t,.35,1.6);const zoom=1.02-.02*s(t,0,8);g.translate(1395,545);g.scale(zoom,zoom);glow(0,0,440,C.cyan,.08);glow(-120,130,280,C.gold,.07);camera(0,0,1,t);g.restore();
    const a2=s(t,2,3);g.save();g.globalAlpha*=a2;line(1516,743,1640,828,C.gold+'80',1);line(1640,828,1788,828,C.gold+'80',1);text('从光路，看懂相机。',1788,866,21,C.muted,CN,'400','right');g.restore();
  }

  function stickPerson(x,top,height=280,color=C.ink){
    g.save();g.translate(x,top);g.scale(height/280,height/280);
    circle(0,32,32,null,color,8);
    line(0,64,0,171,color,9);
    line(0,95,-61,151,color,9);line(0,95,61,151,color,9);
    line(0,171,-50,280,color,9);line(0,171,50,280,color,9);
    g.restore();
  }
  function focusThumbnail(offset,x,y,w,h){
    rect(x,y,w,h,13,'#112a34','#668f9570');
    g.save();g.beginPath();g.roundRect(x,y,w,h,13);g.clip();
    g.translate(x+w/2,y+h/2);g.scale(-.43,-.43);g.filter=`blur(${offset/18}px)`;
    stickPerson(0,-140,280,C.gold);g.filter='none';g.restore();
    line(x+w/2-13,y+h/2,x+w/2+13,y+h/2,C.cyan+'55',1);
  }
  function projectPinhole(oy,ox=340,hx=850,hy=570,sx=1450){return hy+(hy-oy)*(sx-hx)/(hx-ox);}
  function pinhole(t){
    background();const a=s(t,.2,1.3);g.save();g.globalAlpha*=a;
    rect(835,332,623,475,9,'#050e15','#496270',2);rect(1445,349,10,444,4,'#405e69','#8bb5b8',1);
    line(165,570,1737,570,'#64818d44',1,[7,9]);track('OPTICAL AXIS',178,596,11,2,'#68848d');
    line(850,333,850,560,'#a0b8bc',11);line(850,580,850,806,'#a0b8bc',11);
    circle(850,570,13,null,C.gold,1);glow(850,570,42,C.gold,.14);
    stickPerson(340,430,280);dot(340,430,C.gold,7);dot(390,710,C.cyan,7);
    text('火柴人 Subject',340,803,25,C.ink,CN,'400','center');text('遮光暗盒 / Camera Obscura',1168,862,22,C.muted,CN,'400','center');text('小孔 Pinhole',850,306,24,C.gold,CN,'500','center');text('成像面 Image Plane',1450,306,24,C.cyan,CN,'500','center');
    for(const end of [370,450,505,650,760])line(340,430,850,end,C.gold+'1b',1);
    const topY=projectPinhole(430),botY=projectPinhole(710,390);
    const ra=s(t,1.3,4);ray([[340,430],[850,570],[1450,topY]],C.gold,t,ra,2.6);
    const rb=s(t,5.0,7.5);ray([[390,710],[850,570],[1450,botY]],C.cyan,t+.7,rb,2.6);
    g.save();g.globalAlpha*=s(t,7,9);line(1450,botY,1450,topY,'#c6d6d370',7);dot(1450,topY,C.gold,7);dot(1450,botY,C.cyan,7);g.restore();
    g.save();g.globalAlpha*=s(t,7,9);
    rect(1595,392,230,405,18,'#10232ce6','#42616a');
    text('上下倒立',1710,433,24,C.gold,CN,'500','center');text('Inverted Image',1710,464,18,C.muted,SERIF,'400','center');
    g.save();g.translate(1710,601);g.scale(-.66,-.66);stickPerson(0,-140,280);dot(0,-140,C.gold,7);dot(50,140,C.cyan,7);g.restore();
    text('成像面正视示意',1710,758,18,C.muted,CN,'400','center');g.restore();
    text('① 小孔成像 / Pinhole Imaging：光路穿孔后上下交叉，形成倒立像。',110,892,21,C.muted);g.restore();
  }

  // Original still-life illustration, rendered into reusable comparison layers.
  function stillBackground(b){
    const grad=b.createLinearGradient(0,0,600,340);grad.addColorStop(0,'#143b47');grad.addColorStop(1,'#768578');b.fillStyle=grad;b.fillRect(0,0,600,340);
    b.fillStyle='#9fb8a0';b.fillRect(37,0,22,214);b.fillRect(176,0,12,214);b.fillStyle='#d4ceae66';b.fillRect(55,0,121,198);
    b.strokeStyle='#153d4166';b.lineWidth=7;b.beginPath();b.moveTo(480,250);b.bezierCurveTo(460,177,452,150,430,90);b.stroke();
    for(let i=0;i<8;i++){b.save();b.translate(470-i*5,205-i*15);b.rotate((i%2?-.8:.8));b.fillStyle=i%2?'#507569':'#adc19b';b.beginPath();b.ellipse(0,-12,13,37,0,0,tau);b.fill();b.restore();}
    const table=b.createLinearGradient(0,233,0,340);table.addColorStop(0,'#6c6b56');table.addColorStop(1,'#3b4b45');b.fillStyle=table;b.fillRect(0,233,600,107);
    for(let i=0;i<18;i++){b.strokeStyle='#f4d4aa0b';b.lineWidth=1;b.beginPath();b.moveTo(0,240+i*6);b.lineTo(600,237+i*6);b.stroke();}
    for(const [x,y,r] of [[525,50,24],[383,80,12],[335,135,9]]){const q=b.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'#f7dda699');q.addColorStop(1,'#f7dda600');b.fillStyle=q;b.beginPath();b.arc(x,y,r,0,tau);b.fill();}
  }
  function stillForeground(b){
    b.strokeStyle='#a0af75';b.lineWidth=4;for(const [x,y] of [[255,85],[306,63],[344,105]]){b.beginPath();b.moveTo(296,253);b.quadraticCurveTo(300,160,x,y);b.stroke();}
    for(const [x,y,color] of [[255,85,'#f2c68c'],[306,63,'#e1a16f'],[344,105,'#efcd9f']]){
      for(let i=0;i<9;i++){b.save();b.translate(x,y);b.rotate(i*tau/9);b.fillStyle=color;b.beginPath();b.ellipse(0,-17,9,19,0,0,tau);b.fill();b.restore();}b.fillStyle='#715437';b.beginPath();b.arc(x,y,10,0,tau);b.fill();
    }
    const glass=b.createLinearGradient(245,0,344,0);glass.addColorStop(0,'#a77043dd');glass.addColorStop(.27,'#ddba7a99');glass.addColorStop(.5,'#b18d5c99');glass.addColorStop(1,'#6b5d3ee6');b.fillStyle=glass;b.beginPath();b.moveTo(267,176);b.lineTo(256,295);b.quadraticCurveTo(296,313,336,295);b.lineTo(325,176);b.closePath();b.fill();b.strokeStyle='#efd3a199';b.lineWidth=2;b.stroke();b.beginPath();b.ellipse(296,177,29,7,0,0,tau);b.stroke();b.strokeStyle='#fff0c36b';b.lineWidth=3;b.beginPath();b.moveTo(272,191);b.lineTo(265,284);b.stroke();
  }
  const stills={};
  function makeStill(name,blur=0,dark=0,backgroundBlur=0){
    const c=document.createElement('canvas');c.width=600;c.height=340;const b=c.getContext('2d');
    if(backgroundBlur){const bg=document.createElement('canvas');bg.width=600;bg.height=340;stillBackground(bg.getContext('2d'));b.filter=`blur(${backgroundBlur}px)`;b.drawImage(bg,-8,-8,616,356);b.filter='none';stillForeground(b);}
    else {stillBackground(b);stillForeground(b);}
    if(blur){const copy=document.createElement('canvas');copy.width=600;copy.height=340;copy.getContext('2d').drawImage(c,0,0);b.filter=`blur(${blur}px)`;b.drawImage(copy,-10,-10,620,360);b.filter='none';}
    if(dark){b.fillStyle=`rgba(2,9,14,${dark})`;b.fillRect(0,0,600,340);}stills[name]=c;
  }
  makeStill('wide',12,.04);makeStill('small',1,.43);makeStill('tiny',5.5,.69);makeStill('sharp');makeStill('bokeh',0,0,15);
  for(let i=0;i<=10;i++)makeStill('focus'+i,i*.8,.05);
  function picture(name,x,y,w,h,r=16){g.save();g.beginPath();g.roundRect(x,y,w,h,r);g.clip();const img=stills[name],scale=Math.max(w/img.width,h/img.height);g.drawImage(img,x+(w-img.width*scale)/2,y+(h-img.height*scale)/2,img.width*scale,img.height*scale);g.restore();rect(x,y,w,h,r,null,'#8eaaa539',1);}
  function thinLens(x,cy,height=210){
    g.save();g.beginPath();g.moveTo(x,cy-height);g.bezierCurveTo(x-70,cy-height*.62,x-70,cy+height*.62,x,cy+height);g.bezierCurveTo(x+70,cy+height*.62,x+70,cy-height*.62,x,cy-height);g.closePath();const glass=g.createLinearGradient(x-50,0,x+50,0);glass.addColorStop(0,'#88d9dc25');glass.addColorStop(.4,'#a7e8df52');glass.addColorStop(.6,'#7ac4d021');glass.addColorStop(1,'#75d5d553');g.fillStyle=glass;g.fill();g.strokeStyle=C.cyan+'bc';g.lineWidth=2;g.stroke();line(x,cy-height-20,x,cy+height+20,'#b8dbd536',1,[5,9]);g.restore();
  }
  function lens(t){
    background();const lx=875,cy=562,ox=320,oy=414,u=lx-ox,f=280,v=f*u/(u-f),ix=lx+v,iy=cy-(oy-cy)*v/u;
    const offset=112*(1-s(t,5.5,10));const sensor=ix+offset;
    line(130,cy,1750,cy,'#708d964b',1,[7,9]);thinLens(lx,cy,205);stickPerson(ox,oy,280);dot(ox,oy,C.gold,7);text('头顶的同一物点 / One Point',205,370,21,C.gold);text('火柴人 Subject',ox,800,23,C.ink,CN,'400','center');text('镜头 / Lens',lx,292,24,C.cyan,CN,'500','center');
    const ys=[389,455,562,660,736];
    ys.forEach((y,j)=>{const ey=iy+(iy-y)*(sensor-ix)/(ix-lx);ray([[ox,oy],[lx,y],[sensor,ey]],C.gold,t+j*.2,s(t,.8,3.5),j===2?2.3:1.65);});
    circle(lx+f,cy,4,C.cyan);text('F',lx+f,cy-22,24,C.cyan,SERIF);dimension(lx,lx+f,812,'焦距 Focal Length · f',C.cyan+'b0');
    rect(sensor-5,336,10,461,4,'#587984','#a3d9da',1.5);text('感光面 / Sensor',sensor,305,23,C.cyan,CN,'400','center');dot(ix,iy,C.gold,5);
    const spot=offset/(ix-lx)*(ys[4]-ys[0])/2;g.save();g.globalAlpha*=.6;g.beginPath();g.ellipse(sensor,iy+offset*(iy-cy)/(ix-lx),Math.max(3,spot*.14),Math.max(4,spot),0,0,tau);g.fillStyle=C.gold;g.fill();g.restore();
    g.save();g.globalAlpha*=s(t,3.8,5);focusThumbnail(offset,1590,395,250,170);text(offset<5?'合焦 / In Focus':'离焦 / Out of Focus',1715,608,20,offset<5?C.cyan:C.muted,CN,'400','center');g.restore();
    text('1 / f  =  1 / u  +  1 / v',1600,758,30,C.gold,SERIF,'400','center');
    text('② 镜头对焦 / Focus：让同一物点的光，会聚在感光面上。',110,864,20,C.muted);text('图中移动感光面观察焦点；实际相机通常移动镜组。采用近轴薄透镜模型。',110,897,18,C.muted);
  }

  // Remaining chapters and the player are defined below.
  window.OPTICS={projectPinhole,thinLensImageDistance:(f,u)=>f*u/(u-f),apertureFluxRatio:(a,b)=>(b/a)**2};
  window.CAMERA_SCENES={intro,pinhole,lens};

  function aperture(t){
    background();const a=s(t,.7,3.8),left=mix(61,107,a),right=mix(91,37.45,a);
    text('同一焦距 50 mm',960,302,23,C.muted,CN,'400','center');
    [[530,left,'f / 2.8',C.gold],[1390,right,'f / 8',C.cyan]].forEach(([x,h,label,color])=>{
      text('f / '+(2.8*107/h).toFixed(1),x,387,69,color,SERIF,'400','center');circle(x,604,195,'#10212b','#627a83',2);iris(x,604,183,h,t);circle(x,604,199,null,'#142a35',5);
      text('入瞳直径 ≈ '+(50*h/(2.8*107)).toFixed(1)+' mm',x,856,23,C.muted,CN,'400','center');
      rect(x-190,883,380,6,3,'#263e47',null);rect(x-190,883,380*(h/107)**2,6,3,color,null);
    });
    g.save();g.globalAlpha*=s(t,3.5,5);rect(821,478,278,239,19,'#132630d9','#52636b',1);text('N = f / D',960,535,34,C.ink,SERIF,'400','center');text('≈ 8×',960,609,61,C.gold,SERIF,'400','center');text('两者的光量之比',960,658,20,C.muted,CN,'400','center');g.restore();
    text('其他条件相同，像面照度约 ∝ 1 / N²。忽略镜头透光率差异；D 为从入口观察到的有效口径。',110,925,18,C.muted);
  }
  function depthDiagram(x,y,apertureRadius,t,color){
    const lx=x+160,focus=x+430,sensor=x+565,cy=y;
    line(x+18,cy,x+704,cy,'#7290973d',1,[5,7]);thinLens(lx,cy,100);
    const endRadius=apertureRadius*(sensor-focus)/(focus-lx);
    for(const sign of [-1,1])ray([[x+25,cy+sign*apertureRadius],[lx,cy+sign*apertureRadius],[focus,cy],[sensor,cy-sign*endRadius]],color,t+sign*.4,.75,1.7);
    dot(focus,cy,color,4);line(sensor,cy-108,sensor,cy+108,C.cyan+'a0',3);
    g.beginPath();g.ellipse(sensor,cy,5,Math.max(3,endRadius),0,0,tau);g.fillStyle=color+'99';g.fill();
    circle(x+685,cy,Math.max(3,endRadius),color+'66',color,1.2);text('离焦光斑',x+685,cy+104,18,C.muted,CN,'400','center');
    text('会聚位置',focus,cy-30,17,C.muted,CN,'400','center');text('感光面',sensor,cy-124,17,C.cyan,CN,'400','center');
  }
  function dof(t){
    background();[[110,96,'f / 2.8','bokeh','背景更虚 / Shallow Depth of Field',C.gold],[1000,33.6,'f / 8','sharp','前后更清晰 / Greater Depth of Field',C.cyan]].forEach(([x,ap,label,img,caption,color],i)=>{
      const a=s(t,.25+i*.25,1.2+i*.25);g.save();g.globalAlpha*=a;rect(x,285,810,591,20,'#11232c90','#354d59',1);
      text(label,x+38,340,41,color,SERIF);depthDiagram(x+40,485,ap,t+i*.4,color);picture(img,x+34,631,742,191,11);text(caption,x+405,857,22,C.ink,CN,'400','center');g.restore();
    });
    text('焦距、对焦距离与观察条件相同。下方亮度已归一化，仅比较景深效果；上方为同一离焦物点的光路。',110,916,19,C.muted);
  }
  function motionScene(x,y,w,h,t,exposure){
    g.save();g.beginPath();g.roundRect(x,y,w,h,15);g.clip();
    const sky=g.createLinearGradient(0,y,0,y+h);sky.addColorStop(0,'#173747');sky.addColorStop(1,'#587b7b');g.fillStyle=sky;g.fillRect(x,y,w,h);
    for(let i=0;i<13;i++){const bh=50+(Math.sin(i*13.4)*.5+.5)*95;g.fillStyle=i%2?'#294e5b':'#234552';g.fillRect(x+i*w/12,y+h-bh,w/12-5,bh);for(let j=0;j<4;j++)if((i+j)%3!==0)g.fillStyle='#d6b37855',g.fillRect(x+i*w/12+12,y+h-bh+18+j*21,8,8);}
    g.fillStyle='#152e3a';g.fillRect(x,y+h-24,w,24);
    // A fast rotating subject is sampled across its exposure interval.
    // Playback rotation is slowed; the exposure integration uses ω = 38 rad/s.
    const mx=x+w*.52,my=y+h*.48,r=h*.32;
    line(mx,my,mx,y+h-16,'#bec6b3',7);
    const omega=38,center=t*.018,steps=exposure<.005?3:65;
    g.save();g.globalCompositeOperation='lighter';
    for(let j=0;j<steps;j++){
      const sample=center-exposure*(j/(steps-1));g.save();g.globalAlpha*=.8/steps;g.translate(mx,my);g.rotate(omega*sample);
      for(let blade=0;blade<3;blade++){g.rotate(tau/3);poly([[0,-5],[r*.24,-r*.23],[r*.94,-r*.04],[r*.97,r*.13],[r*.2,r*.24]],blade===0?'#f7c085':blade===1?'#9ee2da':'#e6d3a4');}
      g.restore();
    }
    g.restore();circle(mx,my,12,'#e8d2ab','#698d91',2);
    g.restore();rect(x,y,w,h,15,null,'#6e97995c',1);
  }
  function shutter(t){
    background();const cards=[{x:110,time:1/1000,label:'1 / 1000 s',sub:'冻结瞬间 / Freeze Motion',color:C.gold},{x:1000,time:1/15,label:'1 / 15 s',sub:'运动模糊 / Motion Blur',color:C.cyan}];
    cards.forEach((d,i)=>{const a=s(t,.3+i*.3,1.4+i*.3);g.save();g.globalAlpha*=a;text(d.label,d.x+405,341,61,d.color,SERIF,'400','center');motionScene(d.x+20,379,770,334,t,d.time);text(d.sub,d.x+405,757,26,C.ink,CN,'400','center');
      const bx=d.x+70;line(bx,801,bx+670,801,C.line,6);line(bx,801,bx+670*(d.time/(1/15)),801,d.color,8);text('曝光时间 / Exposure Time',d.x+405,842,18,C.muted,CN,'400','center');g.restore();});
    const a=s(t,8.8,10.3);g.save();g.globalAlpha*=a;badge('同光圈 · 恒定照明',569,899,C.gold);text('时间 ×2   →   收到的光 ≈ ×2',1160,900,27,C.ink,CN,'400','center');g.restore();
    text('亮度已归一化，仅比较运动模糊；旋转运动放慢展示。快门控制有效曝光时长，可由机械或电子方式实现。',110,940,17,C.muted);
  }
  // Exposure model: real collected light and displayed brightness are distinct.
  // Assumes fixed scene luminance, transmission and a linear rendering response.
  const logMix=(a,b,q)=>2**mix(Math.log2(a),Math.log2(b),q);
  const lightCollected=(v,ref)=>(ref.N/v.N)**2*(v.t/ref.t);
  const outputBrightness=(v,ref)=>lightCollected(v,ref)*v.iso/ref.iso;
  const BASE={N:4,t:1/125,iso:100};
  function balanceState(t){
    return {N:logMix(4,Math.sqrt(8),s(t,1.4,4.75)),t:logMix(1/125,1/250,s(t,5.4,8.3))*logMix(1,1/4,s(t,8.8,12.3)),iso:logMix(100,400,s(t,13,18.3))};
  }
  const CASES={
    portrait:{base:{N:4,t:1/125,iso:800},target:{N:2,t:1/250,iso:400},order:['N','t','iso'],title:'人像',en:'PORTRAIT',steps:['先选背景虚化','再给快门防抖余量','最后配合现场亮度'],ens:['Choose depth of field','Keep shutter speed safe','Match the available light'],notes:['眼部对焦 / Eye Focus','浅景深 / Shallow Depth of Field'],color:C.gold},
    sports:{base:{N:4,t:1/125,iso:400},target:{N:Math.sqrt(8),t:1/1000,iso:1600},order:['t','N','iso'],title:'运动摄影',en:'SPORTS',steps:['先冻结动作','开大光圈，补充进光','再提高 ISO，配合亮度'],ens:['Freeze the action','Open the aperture','Raise ISO if needed'],notes:['冻结运动 / Freeze Motion','留意噪点 / Check Noise'],color:C.cyan},
    night:{base:{N:4,t:.25,iso:400},target:{N:8,t:4,iso:100},order:['N','iso','t'],title:'夜景',en:'NIGHTSCAPE',steps:['选择较小光圈','固定相机，使用低 ISO','延长快门，积累光轨'],ens:['Choose depth of field','Tripod and low ISO','Extend the exposure'],notes:['三脚架 / Tripod','长曝光 / Long Exposure'],color:C.red}
  };
  function caseState(kind,t){const c=CASES[kind],v={...c.base};c.order.forEach((key,i)=>v[key]=logMix(c.base[key],c.target[key],s(t,[.8,4.3,8][i],[3.5,7,10.7][i])));return v;}
  window.EXPOSURE={lightCollected,outputBrightness,balanceState,caseState,base:BASE,cases:CASES};
  const fNumber=N=>Math.abs(N-Math.round(N))<.08?String(Math.round(N)):N.toFixed(1);
  const shutterNumber=t=>t<.8?'1/'+Math.round(1/t)+' s':(t<1?t.toFixed(1):t.toFixed(t%1<.08?0:1))+' s';
  const names={N:['光圈','APERTURE',C.gold],t:['快门速度','SHUTTER SPEED',C.cyan],iso:['ISO 感光度','ISO SENSITIVITY',C.red]};
  const valueLabel=(key,v)=>key==='N'?'f / '+fNumber(v.N):key==='t'?shutterNumber(v.t):'ISO '+Math.round(v.iso);
  function parameterCard(key,v,x,y,w=280,h=146,active=1){
    const [cn,en,color]=names[key];rect(x,y,w,h,19,'#10232cef',active?color+'95':C.line,active?1.8:1);
    text(cn,x+24,y+34,23,color,CN,'500');track(en,x+24,y+60,11,1.8,C.muted);
    text(valueLabel(key,v),x+24,y+h-24,w<250?34:43,C.ink,SERIF,'400');
    if(active)circle(x+w-24,y+28,4,color);
  }
  function miniParamRow(v,x,y,w=760){['N','t','iso'].forEach((key,i)=>{text(names[key][0]+' / '+(key==='N'?'Aperture':key==='t'?'Shutter':'ISO'),x+i*w/3,y,17,names[key][2]);text(valueLabel(key,v),x+i*w/3,y+44,34,C.ink,SERIF);});}
  function imaging(t){
    if(t<6){pinhole(t*1.9);return;}
    if(t<6.6){pinhole(11.4);g.save();g.globalAlpha=s(t,6,6.6);lens((t-6)*1.9);g.restore();}
    else lens((t-6)*1.9);
  }
  function exposureTriangle(t){
    background();const a=s(t,.3,1.7);g.save();g.globalAlpha*=a;
    const points=[[960,360],[442,745],[1478,745]];
    poly(points,'#91adb006',C.line,2);
    ray([points[0],points[1]],C.gold,t,.7,2);ray([points[1],points[2]],C.cyan,t+.4,.7,2);ray([points[2],points[0]],C.red,t+.8,.7,2);
    const v={N:4,t:1/250,iso:400};parameterCard('N',v,790,290,340,153);parameterCard('t',v,250,679,380,156);parameterCard('iso',v,1290,679,380,156);
    text('景深 / Depth of Field',960,490,25,C.gold,CN,'400','center');
    picture('bokeh',744,530,432,244,16);rect(744,530,432,244,16,null,'#d8b47d66',1);
    text('光束 · 时间 · 增益',960,823,31,C.ink,CN,'400','center');track('LIGHT · TIME · GAIN',960,858,12,3,C.muted,'center');
    text('运动模糊',325,607,29,C.cyan);text('Motion Blur',325,640,19,C.muted,SERIF);
    text('噪点 · 高光余量',1365,568,27,C.red);text('Noise · Highlight Headroom',1365,601,18,C.muted,SERIF);
    g.restore();text('先由光圈与快门决定采光，再用 ISO 配合输出亮度。',960,913,22,C.muted,CN,'400','center');
  }
  function apertureChapter(t){
    if(t<7){aperture(t);text('光圈 Aperture',960,365,23,C.muted,CN,'400','center');return;}
    if(t<7.65){aperture(7);g.save();g.globalAlpha=s(t,7,7.65);dof((t-7)*1.4);g.restore();}else dof((t-7)*1.4);
    text('景深 / Depth of Field',960,275,20,C.gold,CN,'400','center');
  }

  // Original photographic studies: layered vector scenes, not imported photos.
  const PW=800,PH=460,photo=document.createElement('canvas');photo.width=PW;photo.height=PH;const b=photo.getContext('2d');
  function bline(x1,y1,x2,y2,color,width=1){b.beginPath();b.moveTo(x1,y1);b.lineTo(x2,y2);b.strokeStyle=color;b.lineWidth=width;b.lineCap='round';b.stroke();}
  function bellipse(x,y,rx,ry,fill,rotation=0){b.beginPath();b.ellipse(x,y,rx,ry,rotation,0,tau);b.fillStyle=fill;b.fill();}
  const portraitBack=document.createElement('canvas');portraitBack.width=PW;portraitBack.height=PH;
  {const c=portraitBack.getContext('2d'),q=c.createLinearGradient(0,0,PW,PH);q.addColorStop(0,'#0d2632');q.addColorStop(1,'#2a544e');c.fillStyle=q;c.fillRect(0,0,PW,PH);
    for(let i=0;i<8;i++){c.fillStyle=i%2?'#142e35':'#385049';c.fillRect(i*110,0,22,PH);}
    c.strokeStyle='#c6a37852';c.lineWidth=2;c.beginPath();c.moveTo(0,68);c.quadraticCurveTo(400,160,800,80);c.stroke();
    for(let i=0;i<12;i++){const x=25+i*69,y=68+42*Math.sin(i/11*Math.PI);const q=c.createRadialGradient(x,y,0,x,y,33);q.addColorStop(0,'#ffe2accc');q.addColorStop(.22,'#e6bf7c88');q.addColorStop(1,'#d8b27200');c.fillStyle=q;c.fillRect(x-34,y-34,68,68);c.fillStyle='#ffe4b7';c.beginPath();c.arc(x,y,5,0,tau);c.fill();}
    c.fillStyle='#b9916130';for(let j=0;j<5;j++)c.fillRect(575,180+j*43,150,2);
  }
  const portraitWoman=new Image();portraitWoman.src='assets/portrait-woman.png';window.ASSETS_READY=portraitWoman.decode();
  const portraitDepth=[];
  for(let i=0;i<=12;i++){const c=document.createElement('canvas');c.width=PW;c.height=PH;const q=c.getContext('2d');q.filter=`blur(${i*1.2}px)`;q.drawImage(portraitBack,-15,-15,830,490);portraitDepth.push(c);}
  const grain=document.createElement('canvas');grain.width=400;grain.height=230;
  {const c=grain.getContext('2d'),im=c.createImageData(400,230);for(let i=0;i<im.data.length;i+=4){const q=Math.round(random()*255);im.data[i]=q;im.data[i+1]=q;im.data[i+2]=q;im.data[i+3]=255;}c.putImageData(im,0,0);}
  for(let i=0;i<=12;i++)makeStill('depth'+i,0,0,i*1.2);
  function drawPortrait(v,t){
    b.drawImage(portraitDepth[Math.round(clamp((8-v.N)/6)*12)],0,0);
    b.drawImage(portraitWoman,190,10,420,630);
    // Eye focus remains fixed while the background blur responds to aperture.
    const x=416,y=184;b.strokeStyle='#b7e8d9bc';b.lineWidth=1;
    for(const [dx,dy]of[[-1,-1],[1,-1],[-1,1],[1,1]]){b.beginPath();b.moveTo(x+dx*18,y+dy*9);b.lineTo(x+dx*18,y+dy*18);b.lineTo(x+dx*9,y+dy*18);b.stroke();}
  }
  function cyclist(x,y,scale=1,alpha=1){
    b.save();b.translate(x,y);b.scale(scale,scale);b.globalAlpha*=alpha;
    for(const cx of [-89,90]){b.strokeStyle='#0c1e28';b.lineWidth=9;b.beginPath();b.arc(cx,44,57,0,tau);b.stroke();b.strokeStyle='#a9bdb199';b.lineWidth=2;b.beginPath();b.arc(cx,44,51,0,tau);b.stroke();for(let j=0;j<12;j++){const a=j*tau/12;bline(cx,44,cx+Math.cos(a)*50,44+Math.sin(a)*50,'#769a9466',1);}}
    for(const [x1,y1,x2,y2]of[[-89,44,-39,-25],[-39,-25,7,44],[7,44,-89,44],[-39,-25,56,-23],[56,-23,7,44],[56,-23,90,44]])bline(x1,y1,x2,y2,'#d8ad79',6);
    bline(-45,-33,-24,-33,'#e5d3ad',7);bline(54,-24,47,-51,'#c5d0bb',5);bline(47,-51,69,-51,'#d9d5be',5);
    bline(-28,-89,11,-70,'#d0a27d',26);bline(11,-70,38,-104,'#d0a27d',22);
    bline(-30,-79,-41,-26,'#417b80',25);bline(-41,-26,4,11,'#c1a17d',17);bline(4,11,-13,45,'#c1a17d',15);
    bline(-28,-76,-67,-20,'#365e68',21);bline(-67,-20,-43,24,'#967e68',15);bline(-43,24,-63,54,'#967e68',13);
    bline(15,-79,38,-42,'#d6af86',12);bline(38,-42,66,-48,'#d6af86',10);bellipse(48,-127,22,28,'#cfa47d',.5);
    bellipse(45,-143,27,16,'#e5c186',.15);bline(60,-125,69,-119,'#13323c',3);bline(-18,47,4,49,'#d8cfb1',8);bline(-68,57,-45,57,'#b4bba5',7);b.restore();
  }
  function drawSports(v,t){
    const sky=b.createLinearGradient(0,0,0,460);sky.addColorStop(0,'#8aa49a');sky.addColorStop(.55,'#466e68');sky.addColorStop(1,'#1b353f');b.fillStyle=sky;b.fillRect(0,0,PW,PH);
    for(let i=0;i<15;i++){const x=i*62-40,y=100+Math.sin(i*3)*32;bellipse(x,y,57,97,i%2?'#254a47':'#365d50');bline(x,95,x,318,'#1d3938',5);}
    b.fillStyle='#8b8870';b.fillRect(0,330,800,130);b.fillStyle='#c2b08b66';b.fillRect(0,335,800,4);bline(0,422,800,411,'#d9c49b77',3);
    const trail=clamp(v.t/(1/125),0,2)*64,steps=Math.max(1,Math.round(trail/4));
    for(let i=0;i<steps;i++)cyclist(437-trail*i/Math.max(1,steps-1),271,1.05,1/steps);
    // Keep the exposure integration legible; the fast end is crisp.
    if(trail<14)cyclist(437,271,1.05,.7);
    b.strokeStyle='#d3e5c244';b.lineWidth=1;for(let i=0;i<5;i++){b.beginPath();b.moveTo(40+i*11,225+i*17);b.lineTo(205+i*13,225+i*17);b.stroke();}
  }
  function drawNight(v,t){
    const sky=b.createLinearGradient(0,0,0,460);sky.addColorStop(0,'#091626');sky.addColorStop(.65,'#23404b');sky.addColorStop(1,'#546467');b.fillStyle=sky;b.fillRect(0,0,800,460);
    for(let i=0;i<30;i++){b.fillStyle='#d5e6d355';b.fillRect((i*173)%797,(i*61)%153,1,1);}bellipse(661,63,22,22,'#dfd9b3');bellipse(669,57,22,22,'#101f2f');
    for(let i=0;i<13;i++){const x=i*68-12,y=110+(Math.sin(i*7.9)*.5+.5)*127;b.fillStyle=i%2?'#112b37':'#193440';b.fillRect(x,y,61,PH-y);for(let j=0;j<7;j++)for(let k=0;k<3;k++)if((i*7+j*3+k)%4!==0){b.fillStyle=(i+j)%3?'#edbd795d':'#d3e6ce55';b.fillRect(x+9+k*17,y+12+j*21,6,9);}}
    b.fillStyle='#142834';b.beginPath();b.moveTo(325,258);b.lineTo(490,258);b.lineTo(700,460);b.lineTo(5,460);b.fill();
    bline(399,263,374,460,'#d7d6aa6e',2);bline(315,270,32,460,'#74888a88',3);bline(499,270,720,460,'#74888a88',3);
    const q=clamp(v.t/4),len=mix(.06,1,q);
    for(let i=0;i<5;i++){const side=i<3?-1:1,x=401+side*(24+i%3*18),c=side<0?'#f4dba8':'#e18d77';b.save();b.shadowColor=c;b.shadowBlur=5+q*3;b.strokeStyle=c;b.lineWidth=2+q*2;b.beginPath();b.moveTo(x,282+i*3);b.bezierCurveTo(x+side*25*len,300+35*len,x+side*85*len,330+60*len,x+side*220*len,300+160*len);b.stroke();b.restore();}
    for(const x of[157,586]){bline(x,287,x,366,'#667b77',3);bellipse(x,282,5,5,'#f5d6a2');const q=b.createRadialGradient(x,282,0,x,282,38);q.addColorStop(0,'#efb97555');q.addColorStop(1,'#efb97500');b.fillStyle=q;b.fillRect(x-38,244,76,76);}
  }
  function drawStill(v,t){
    b.drawImage(stills['depth'+Math.round(clamp((8-v.N)/6)*12)],0,0,PW,PH);
    // A small moving subject makes shutter and aperture tradeoffs visible together.
    const x=663,y=242,r=66,omega=58,steps=v.t<.003?3:32;
    bline(x,y,x,390,'#ced4ad',5);b.save();b.globalCompositeOperation='lighter';
    for(let j=0;j<steps;j++){b.save();b.globalAlpha=.75/steps;b.translate(x,y);b.rotate(t*.6-omega*v.t*j/(steps-1));for(let k=0;k<3;k++){b.rotate(tau/3);b.fillStyle=k===0?'#f4c38d':k===1?'#b2d9c8':'#d7c8a7';b.beginPath();b.moveTo(0,0);b.lineTo(r*.15,-r*.18);b.lineTo(r,-r*.1);b.lineTo(r,r*.18);b.lineTo(r*.16,r*.24);b.fill();}b.restore();}b.restore();bellipse(x,y,7,7,'#e9d1a2');
  }
  function studyPicture(kind,v,t,x,y,w,h,brightness=1,photonRatio=1){
    b.clearRect(0,0,PW,PH);if(kind==='portrait')drawPortrait(v,t);else if(kind==='sports')drawSports(v,t);else if(kind==='night')drawNight(v,t);else drawStill(v,t);
    // Grain tracks collected light, never ISO alone. This is a qualitative model.
    b.save();b.globalCompositeOperation='soft-light';b.globalAlpha=clamp(.055/Math.sqrt(photonRatio),.015,.2);b.drawImage(grain,0,0,PW,PH);b.restore();
    const vignette=b.createRadialGradient(400,215,100,400,230,490);vignette.addColorStop(0,'#00101800');vignette.addColorStop(1,'#00101875');b.fillStyle=vignette;b.fillRect(0,0,PW,PH);
    g.save();g.beginPath();g.roundRect(x,y,w,h,17);g.clip();g.filter=`brightness(${clamp(brightness,.04,4)})`;g.drawImage(photo,x,y,w,h);g.filter='none';g.restore();rect(x,y,w,h,17,null,'#8eaaa55c',1);
  }
  function isoChapter(t){
    background();const gain=logMix(1,8,s(t,4,11)),v={N:4,t:1/250,iso:Math.round(100*gain)};
    rect(110,299,758,560,22,'#10222bd9',C.line);track('SAME LIGHT · DIFFERENT OUTPUT',149,341,13,2.5,C.muted);
    for(let i=0;i<5;i++){const yy=423+i*62;ray([[155,yy],[435,yy]],C.gold,t+i*.14,.65,2);circle(449,yy,7,C.gold);}
    rect(473,386,26,310,6,'#577f80','#a9d4c5',1);text('光子 / Photons',207,771,24,C.gold,CN,'400','center');text('感光面 / Sensor',493,739,21,C.cyan,CN,'400','center');
    ray([[501,541],[572,541],[604,500],[687,500]],C.cyan,t,.9,3);rect(587,423,235,180,19,'#152b36','#7da7ab66');text('增益 / Gain',704,466,22,C.cyan,CN,'400','center');text(gain.toFixed(1)+'×',704,544,56,C.ink,SERIF,'400','center');
    badge('光子数不变 / Same photons',150,822,C.gold);
    studyPicture('still',v,t,965,304,840,480,.13*gain,1);miniParamRow(v,987,824,800);
    text('输出亮度 / Output Brightness',1385,746,22,'#f7ecd0',CN,'400','center');
    text('光圈和快门保持不变 · 提高 ISO 不会增加收到的光',110,900,23,C.muted);
    text('关注噪点 Noise 与高光余量 Highlights；增益和色调映射的具体实现因机型而异。',110,931,18,C.muted);
  }
  function balanceChapter(t){
    background();const v=balanceState(t),bright=outputBrightness(v,BASE),photons=lightCollected(v,BASE),ev=Math.abs(Math.log2(bright))<1e-8?0:Math.log2(bright);
    const nodes=[[550,359],[275,725],[825,725]];poly(nodes,'#84c3c407',C.line,2);ray([nodes[0],nodes[1],nodes[2],nodes[0]],C.gold,t,.6,1.5);
    const active=t<5.1?'N':t<12.7?'t':'iso';parameterCard('N',v,410,286,280,140,active==='N');parameterCard('t',v,137,682,280,140,active==='t');parameterCard('iso',v,690,682,280,140,active==='iso');
    text('输出亮度',550,498,24,C.ink,CN,'400','center');track('OUTPUT BRIGHTNESS',550,528,11,2,C.muted,'center');text((ev>0?'+':'')+ev.toFixed(1)+' Stop',550,591,48,Math.abs(ev)<.04?C.cyan:C.gold,SERIF,'400','center');
    const mx=377,my=624,mw=346;line(mx,my,mx+mw,my,C.line,5);for(let n=-2;n<=2;n++){const xx=mx+(n+2)/4*mw;line(xx,my-7,xx,my+7,C.muted,1);if(n===0)text('0',xx,my+27,15,C.muted,SANS,'400','center');}circle(mx+(clamp(ev,-2,2)+2)/4*mw,my,6,C.gold);
    studyPicture('still',v,t,1050,301,755,434,bright,photons);text('同一场景 / Same scene',1072,346,20,'#e9e7d4');
    const barx=1080,bary=790,bw=685;rect(barx,bary,bw,8,4,'#213b45',null);rect(barx,bary,bw*clamp(photons/2),8,4,C.gold,null);
    text('采集的光 / Light Collected',1080,777,19,C.gold);text(photons.toFixed(2)+'×',1765,777,26,C.ink,SERIF,'400','right');
    text('相对基准 1×；此条不随 ISO 提高而增长',1080,830,19,C.muted);
    let label,en;if(t<1.4){label='基准：先观察光量与亮度';en='BASELINE';}else if(t<5.1){label='光圈开大一档：采光 ×2，输出亮度 ×2';en='APERTURE +1 STOP';}else if(t<8.6){label='快门加快一档：亮度回到基准';en='SHUTTER −1 STOP';}else if(t<12.7){label='快门再加快两档：冻结更快的运动';en='SHUTTER −2 STOPS';}else{label='ISO 提高两档：恢复输出亮度，采光仍为 ¼';en='ISO +2 STOPS · SAME PHOTONS';}
    text(label,960,893,29,C.ink,CN,'400','center');track(en,960,926,12,2.5,C.gold,'center');
  }
  function application(kind,t){
    background();const c=CASES[kind],v=caseState(kind,t),phase=t<4.1?0:t<7.8?1:2;
    c.order.forEach((key,i)=>{const yy=298+i*175,color=names[key][2],active=phase===i,a=s(t,.25+i*.18,.9+i*.18);g.save();g.globalAlpha*=a;
      rect(110,yy,805,153,18,'#10232bc9',active?color+'b0':C.line,active?1.8:1);circle(155,yy+46,20,active?color+'2b':'#17303b',color+'75',1);
      text(String(i+1),155,yy+54,21,color,SANS,'400','center');text(c.steps[i],195,yy+49,28,C.ink,CN,'500');text(c.ens[i],195,yy+81,18,C.muted,SERIF);
      text(names[key][0]+' / '+(key==='N'?'Aperture':key==='t'?'Shutter Speed':'ISO'),195,yy+120,20,color);text(valueLabel(key,v),878,yy+117,39,color,SERIF,'400','right');g.restore();
    });
    const ph=lightCollected(v,c.base);studyPicture(kind,v,t,991,298,814,468,1,ph);
    c.notes.forEach((note,i)=>badge(note,1008,815+i*57,i===0?c.color:C.muted));
    text('参数为示例起点 / Example starting points',110,877,21,C.muted);
    text('场景插画已归一化亮度，仅展示景深、运动或光轨的变化。',110,910,19,C.muted);
    text('效果示意 / ILLUSTRATION',1782,744,13,'#e3dfc9',SANS,'400','right');
  }
  function exposureRecap(t){
    background();const data=[['N','选择景深','Depth of Field'],['t','选择运动表现','Motion Blur'],['iso','配合输出亮度','Gain & Brightness']];
    data.forEach(([key,cn,en],i)=>{const x=110+i*585,cx=x+265,color=names[key][2],a=s(t,.2+i*.2,1.2+i*.2);g.save();g.globalAlpha*=a;rect(x,310,530,510,22,'#112630bb',color+'55',1.3);text(names[key][0],cx,375,32,color,CN,'500','center');track(names[key][1],cx,410,13,2.5,C.muted,'center');
      if(i===0)iris(cx,554,108,48+12*Math.sin(t*.6),t);
      if(i===1){circle(cx,554,104,'#11222c',C.cyan+'80',2);for(let j=0;j<12;j++){const a=j*tau/12;line(cx+Math.sin(a)*89,554-Math.cos(a)*89,cx+Math.sin(a)*97,554-Math.cos(a)*97,C.cyan,2);}const a=-.5+t*.3;line(cx,554,cx+Math.sin(a)*72,554-Math.cos(a)*72,C.cyan,3);circle(cx,554,5,C.cyan);}
      if(i===2){for(let j=0;j<5;j++){const xx=cx-100+j*50,h=50+j*25;rect(xx,640-h,20,h,5,color+'88',null);}text('×',cx,518,35,color,SERIF,'400','center');}
      text(cn,cx,735,31,C.ink,CN,'400','center');text(en,cx,778,21,C.muted,SERIF,'400','center');g.restore();});
    g.save();g.globalAlpha*=s(t,2.3,3.4);text('先选择画面，再让三个参数一起工作。',960,887,29,C.ink,CN,'400','center');g.restore();
  }

  const scenes=[intro,imaging,exposureTriangle,apertureChapter,shutter,isoChapter,balanceChapter,t=>application('portrait',t),t=>application('sports',t),t=>application('night',t),exposureRecap];
  function currentChapter(t){let i=0;for(let n=0;n<chapters.length;n++)if(t>=chapters[n].start)i=n;return i;}
  function common(t,i,local){
    sectionHeader(i,local);
    const caption=window.NARRATION.captions.find(c=>t>=c.start&&t<c.end);
    if(caption){g.font=`30px ${CN}`;const width=g.measureText(caption.text).width+70;rect((W-width)/2,951,width,57,28,'#071016e6','#526b743b',1);text(caption.text,W/2,989,30,C.ink,CN,'400','center');}
    const xs=chapters.map((c,n)=>100+n*(1720/chapters.length));
    chapters.forEach((c,n)=>{const width=1720/chapters.length-9;line(xs[n],1047,xs[n]+width,1047,'#2a414d',2);const q=clamp((t-c.start)/(c.end-c.start));if(q>0)line(xs[n],1047,xs[n]+width*q,1047,n===i?C.gold:C.cyan,2.5);});
    track(`${String(i+1).padStart(2,'0')} / ${String(chapters.length).padStart(2,'0')}  ·  ${chapters[i].id.toUpperCase()}`,100,1030,12,1.8,C.muted);
    const min=Math.floor(t/60),sec=Math.min(59,Math.floor(t%60));text(`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')} / 02:30`,1820,1030,14,C.muted,SANS,'400','right');
  }
  window.renderFrame=function(time){
    const t=clamp(Number(time)||0,0,T),i=currentChapter(t),local=t-chapters[i].start;
    g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.lineJoin='round';g.lineCap='round';g.shadowColor='transparent';g.setLineDash([]);
    if(i>0&&local<.65){scenes[i-1](chapters[i-1].end-chapters[i-1].start-.001);g.save();g.globalAlpha=s(local,0,.65);scenes[i](local);g.restore();}
    else scenes[i](local);
    common(t,i,local);return t;
  };
  window.FILM={width:W,height:H,duration:T,fps:30,chapters:chapters.map(c=>c.start)};
  const render=new URLSearchParams(location.search).has('render');if(render)document.body.classList.add('render');
  const seek=document.getElementById('seek'),button=document.getElementById('play'),music=document.getElementById('music'),clock=document.getElementById('time');
  seek.max=T;let playing=false,current=0,origin=0;
  function update(t){current=window.renderFrame(t);seek.value=current;clock.textContent=`${String(Math.floor(current/60)).padStart(2,'0')}:${String(Math.floor(current%60)).padStart(2,'0')} / 02:30`;}
  function pause(){playing=false;music.pause();button.textContent='播放 · 开启声音';}
  function play(){if(current>=T)current=0;origin=performance.now()-current*1000;playing=true;music.currentTime=current;music.play().catch(()=>{});button.textContent='暂停';}
  button.onclick=()=>playing?pause():play();document.getElementById('restart').onclick=()=>{pause();update(0);play();};seek.oninput=()=>{update(Number(seek.value));music.currentTime=current;if(playing)origin=performance.now()-current*1000;};
  function tick(now){if(playing){const t=(now-origin)/1000;update(Math.min(T,t));if(t>=T)pause();}requestAnimationFrame(tick);}
  button.disabled=true;window.ASSETS_READY.then(()=>{button.disabled=false;update(0);if(!render)requestAnimationFrame(tick);});
})();
