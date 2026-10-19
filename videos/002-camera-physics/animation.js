/* Camera physics / absolute-time, deterministic Canvas 2D animation.
   All optical diagrams are explanatory models rather than lens prescriptions. */
(() => {
  'use strict';
  const canvas=document.getElementById('film'),g=canvas.getContext('2d',{alpha:false});
  const W=1920,H=1080,T=90;
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
    text(chapters[i].title,110,183,53,C.ink,CN,'500');track(chapters[i].en,114,229,15,3.6,C.gold);text(String(i).padStart(2,'0'),1816,182,58,C.line,SERIF,'400','right');g.restore();
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
    badge('摄影物理 · 90 秒',128,266,C.gold);
    text('光，如何',126,386,100,C.ink,CN,'300');text('成为照片。',126,512,100,C.gold,CN,'500');
    text('A slice of light. A slice of time.',134,577,29,C.muted,SERIF,'400');
    ['小孔成像','镜头与光圈','快门与时间'].forEach((str,i)=>{line(140+i*245,658,180+i*245,658,i===0?C.gold:C.cyan,2);text(str,140+i*245,707,24,C.muted);});g.restore();
    g.save();g.globalAlpha*=s(t,.35,1.6);const zoom=1.02-.02*s(t,0,8);g.translate(1395,545);g.scale(zoom,zoom);glow(0,0,440,C.cyan,.08);glow(-120,130,280,C.gold,.07);camera(0,0,1,t);g.restore();
    const a2=s(t,2,3);g.save();g.globalAlpha*=a2;line(1516,743,1640,828,C.gold+'80',1);line(1640,828,1788,828,C.gold+'80',1);text('从光路，看懂相机。',1788,866,21,C.muted,CN,'400','right');g.restore();
  }

  function projectPinhole(oy,ox=340,hx=850,hy=570,sx=1450){return hy+(hy-oy)*(sx-hx)/(hx-ox);}
  function pinhole(t){
    background();const a=s(t,.2,1.3);g.save();g.globalAlpha*=a;
    rect(835,332,623,475,9,'#050e15','#496270',2);rect(1445,349,10,444,4,'#405e69','#8bb5b8',1);
    line(165,570,1737,570,'#64818d44',1,[7,9]);track('OPTICAL AXIS',178,596,11,2,'#68848d');
    line(850,333,850,560,'#a0b8bc',11);line(850,580,850,806,'#a0b8bc',11);
    circle(850,570,13,null,C.gold,1);glow(850,570,42,C.gold,.14);
    arrow(340,710,430,'#e0eae4',13);dot(340,430,C.gold,7);dot(340,710,C.cyan,7);
    text('物体',340,803,25,C.ink,CN,'400','center');text('遮光暗盒',1168,862,22,C.muted,CN,'400','center');text('小孔',850,306,24,C.gold,CN,'500','center');text('成像面',1450,306,24,C.cyan,CN,'500','center');
    for(const end of [370,450,505,650,760])line(340,430,850,end,C.gold+'1b',1);
    const topY=projectPinhole(430),botY=projectPinhole(710);
    const ra=s(t,1.3,4);ray([[340,430],[850,570],[1450,topY]],C.gold,t,ra,2.6);
    const rb=s(t,5.0,7.5);ray([[340,710],[850,570],[1450,botY]],C.cyan,t+.7,rb,2.6);
    g.save();g.globalAlpha*=s(t,7,9);arrow(1450,botY,topY,'#c6d6d3',11);dot(1450,topY,C.gold,7);dot(1450,botY,C.cyan,7);g.restore();
    g.save();g.globalAlpha*=s(t,8,10);badge('上下倒立',1630,460,C.gold);arrow(1711,554,687,C.ink,9);dot(1711,554,C.cyan,5);dot(1711,687,C.gold,5);text('成像面正视示意',1712,750,18,C.muted,CN,'400','center');g.restore();
    text('光在均匀介质中沿直线传播；光路穿孔后上下交叉。',110,892,21,C.muted);g.restore();
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
  function tradeoff(t){
    background();const cards=[{x:110,head:'孔太大',hole:43,img:'wide',sub:'更亮，但几何模糊更明显',tone:C.gold},{x:695,head:'适当缩小',hole:13,img:'small',sub:'几何模糊减少，进光量降低',tone:C.cyan},{x:1280,head:'过小',hole:4,img:'tiny',sub:'衍射更显著，细节变软',tone:C.red}];
    cards.forEach((d,i)=>{const a=s(t,.3+i*.35,1.5+i*.35);g.save();g.globalAlpha*=a;rect(d.x,298,530,550,20,'#10232b90','#3a515b',1);text(d.head,d.x+265,356,31,d.tone,CN,'500','center');circle(d.x+265,443,61,'#2b414a','#71858b',1.3);circle(d.x+265,443,d.hole,'#050d12',d.tone+'99',1);glow(d.x+265,443,d.hole+12,d.tone,.14);picture(d.img,d.x+32,543,466,238,11);text(d.sub,d.x+265,817,21,C.muted,CN,'400','center');g.restore();});
    const a=s(t,6,7.5);g.save();g.globalAlpha*=a;for(let i=1;i<=3;i++)circle(1545,659,5+i*12,null,C.red+['','40','25','16'][i],1.5);g.restore();
    text('相同曝光时长 · 小孔尺寸与衍射光斑为示意；清晰度由几何模糊与衍射共同决定。',110,891,20,C.muted);
  }
  function thinLens(x,cy,height=210){
    g.save();g.beginPath();g.moveTo(x,cy-height);g.bezierCurveTo(x-70,cy-height*.62,x-70,cy+height*.62,x,cy+height);g.bezierCurveTo(x+70,cy+height*.62,x+70,cy-height*.62,x,cy-height);g.closePath();const glass=g.createLinearGradient(x-50,0,x+50,0);glass.addColorStop(0,'#88d9dc25');glass.addColorStop(.4,'#a7e8df52');glass.addColorStop(.6,'#7ac4d021');glass.addColorStop(1,'#75d5d553');g.fillStyle=glass;g.fill();g.strokeStyle=C.cyan+'bc';g.lineWidth=2;g.stroke();line(x,cy-height-20,x,cy+height+20,'#b8dbd536',1,[5,9]);g.restore();
  }
  function lens(t){
    background();const lx=875,cy=562,ox=320,oy=414,u=lx-ox,f=280,v=f*u/(u-f),ix=lx+v,iy=cy-(oy-cy)*v/u;
    const offset=112*(1-s(t,5.5,10));const sensor=ix+offset;
    line(130,cy,1750,cy,'#708d964b',1,[7,9]);thinLens(lx,cy,205);dot(ox,oy,C.gold,7);text('同一物点',280,373,23,C.gold);text('薄透镜',lx,292,24,C.cyan,CN,'500','center');
    const ys=[389,455,562,660,736];
    ys.forEach((y,j)=>{const ey=iy+(iy-y)*(sensor-ix)/(ix-lx);ray([[ox,oy],[lx,y],[sensor,ey]],C.gold,t+j*.2,s(t,.8,3.5),j===2?2.3:1.65);});
    circle(lx+f,cy,4,C.cyan);text('F',lx+f,cy-22,24,C.cyan,SERIF);dimension(lx,lx+f,812,'焦距 f',C.cyan+'b0');
    rect(sensor-5,336,10,461,4,'#587984','#a3d9da',1.5);text('感光面',sensor,305,23,C.cyan,CN,'400','center');dot(ix,iy,C.gold,5);
    const spot=offset/(ix-lx)*(ys[4]-ys[0])/2;g.save();g.globalAlpha*=.6;g.beginPath();g.ellipse(sensor,iy+offset*(iy-cy)/(ix-lx),Math.max(3,spot*.14),Math.max(4,spot),0,0,tau);g.fillStyle=C.gold;g.fill();g.restore();
    g.save();g.globalAlpha*=s(t,3.8,5);picture('focus'+Math.min(10,Math.round(offset/11.2)),1590,395,250,170,13);text(offset<5?'合焦：光落在同一位置':'离焦：光尚未落在同一位置',1715,608,18,offset<5?C.cyan:C.muted,CN,'400','center');g.restore();
    text('1 / f  =  1 / u  +  1 / v',1600,758,30,C.gold,SERIF,'400','center');
    text('对焦示意：移动感光面观察焦点；实际相机通常移动镜组完成对焦。',110,864,20,C.muted);text('采用近轴薄透镜模型；真实摄影镜头由多片镜组构成。',110,897,18,C.muted);
  }

  // Remaining chapters and the player are defined below.
  window.OPTICS={projectPinhole,thinLensImageDistance:(f,u)=>f*u/(u-f),apertureFluxRatio:(a,b)=>(b/a)**2};
  window.CAMERA_SCENES={intro,pinhole,tradeoff,lens};

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
    background();[[110,96,'f / 2.8','bokeh','背景更虚',C.gold],[1000,33.6,'f / 8','sharp','前后更容易清晰',C.cyan]].forEach(([x,ap,label,img,caption,color],i)=>{
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
    background();const cards=[{x:110,time:1/1000,label:'1 / 1000 s',sub:'冻结瞬间',color:C.gold},{x:1000,time:1/15,label:'1 / 15 s',sub:'留下运动轨迹',color:C.cyan}];
    cards.forEach((d,i)=>{const a=s(t,.3+i*.3,1.4+i*.3);g.save();g.globalAlpha*=a;text(d.label,d.x+405,341,61,d.color,SERIF,'400','center');motionScene(d.x+20,379,770,334,t,d.time);text(d.sub,d.x+405,757,26,C.ink,CN,'400','center');
      const bx=d.x+70;line(bx,801,bx+670,801,C.line,6);line(bx,801,bx+670*(d.time/(1/15)),801,d.color,8);text('曝光时间窗',d.x+405,842,18,C.muted,CN,'400','center');g.restore();});
    const a=s(t,8.8,10.3);g.save();g.globalAlpha*=a;badge('同光圈 · 恒定照明',569,899,C.gold);text('时间 ×2   →   收到的光 ≈ ×2',1160,900,27,C.ink,CN,'400','center');g.restore();
    text('亮度已归一化，仅比较运动模糊；旋转运动放慢展示。快门控制有效曝光时长，可由机械或电子方式实现。',110,940,17,C.muted);
  }
  function recap(t){
    background();const cards=[{x:110,color:C.gold,head:'在哪里会聚',sub:'对焦',en:'FOCUS'},{x:695,color:C.cyan,head:'光束有多宽',sub:'光圈',en:'APERTURE'},{x:1280,color:C.gold,head:'记录了多久',sub:'快门',en:'SHUTTER'}];
    cards.forEach((d,i)=>{const a=s(t,.2+i*.35,1.5+i*.35);g.save();g.globalAlpha*=a;g.translate(0,14*(1-a));rect(d.x,310,530,510,22,'#132630bb','#45616a',1.3);track(d.en,d.x+265,372,17,4,d.color,'center');
      const cx=d.x+265,cy=544;
      if(i===0){thinLens(cx-45,cy,99);for(const sign of [-1,1])ray([[cx-180,cy+sign*70],[cx-45,cy+sign*70],[cx+130,cy]],d.color,t+sign,.85,2);dot(cx+130,cy,d.color,6);}
      if(i===1)iris(cx,cy,116,48+17*Math.sin(t*.7),t);
      if(i===2){circle(cx,cy,113,'#10232d','#829c9f',2);for(let j=0;j<60;j++){const ang=j*tau/60;line(cx+Math.sin(ang)*(j%5?100:92),cy-Math.cos(ang)*(j%5?100:92),cx+Math.sin(ang)*105,cy-Math.cos(ang)*105,j%5?C.line:C.gold,2);}const ang=-.5+t*.35;line(cx,cy,cx+Math.sin(ang)*74,cy-Math.cos(ang)*74,C.gold,3);circle(cx,cy,5,C.gold);}
      text(d.head,cx,720,33,C.ink,CN,'500','center');text(d.sub,cx,773,23,d.color,CN,'400','center');g.restore();});
    g.save();g.globalAlpha*=s(t,3.6,4.5);text('会聚光线。选择光量。截取时间。',960,884,28,C.muted,CN,'400','center');g.restore();
  }
  const scenes=[intro,pinhole,tradeoff,lens,aperture,dof,shutter,recap];
  function currentChapter(t){let i=0;for(let n=0;n<chapters.length;n++)if(t>=chapters[n].start)i=n;return i;}
  function common(t,i,local){
    sectionHeader(i,local);
    const caption=window.NARRATION.captions.find(c=>t>=c.start&&t<c.end);
    if(caption){g.font=`30px ${CN}`;const width=g.measureText(caption.text).width+70;rect((W-width)/2,951,width,57,28,'#071016e6','#526b743b',1);text(caption.text,W/2,989,30,C.ink,CN,'400','center');}
    const xs=chapters.map((c,n)=>100+n*217.5);
    chapters.forEach((c,n)=>{const width=208;line(xs[n],1047,xs[n]+width,1047,'#2a414d',2);const q=clamp((t-c.start)/(c.end-c.start));if(q>0)line(xs[n],1047,xs[n]+width*q,1047,n===i?C.gold:C.cyan,2.5);});
    track(`${String(i+1).padStart(2,'0')} / 08  ·  ${chapters[i].id.toUpperCase()}`,100,1030,12,1.8,C.muted);
    const min=Math.floor(t/60),sec=Math.min(59,Math.floor(t%60));text(`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')} / 01:30`,1820,1030,14,C.muted,SANS,'400','right');
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
  let playing=false,current=0,origin=0;
  function update(t){current=window.renderFrame(t);seek.value=current;clock.textContent=`${String(Math.floor(current/60)).padStart(2,'0')}:${String(Math.floor(current%60)).padStart(2,'0')} / 01:30`;}
  function pause(){playing=false;music.pause();button.textContent='播放 · 开启声音';}
  function play(){if(current>=T)current=0;origin=performance.now()-current*1000;playing=true;music.currentTime=current;music.play().catch(()=>{});button.textContent='暂停';}
  button.onclick=()=>playing?pause():play();document.getElementById('restart').onclick=()=>{pause();update(0);play();};seek.oninput=()=>{update(Number(seek.value));music.currentTime=current;if(playing)origin=performance.now()-current*1000;};
  function tick(now){if(playing){const t=(now-origin)/1000;update(Math.min(T,t));if(t>=T)pause();}requestAnimationFrame(tick);}
  update(0);if(!render)requestAnimationFrame(tick);
})();
