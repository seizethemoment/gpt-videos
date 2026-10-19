/* Every visible frame is a pure function of time. No state or random values
   carry over between frames, so previews and exports are identical. */
(() => {
  'use strict';
  const canvas = document.getElementById('film');
  const ctx = canvas.getContext('2d', {alpha: false});
  const W = 1080, H = 1080, DURATION = 30;
  const C = {paper:'#f6f1e7', ink:'#343331', muted:'#93847a', red:'#c24d54', darkRed:'#823d44', pale:'#e8d7cc', glass:'#cee2df', orange:'#e98b39'};
  const CN = '"PingFang SC","Noto Sans CJK SC","Microsoft YaHei",sans-serif';
  const SANS = 'Arial, sans-serif';
  const SERIF = 'Georgia, "Times New Roman", serif';
  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const mix = (a,b,p) => a+(b-a)*p;
  const ease = p => {p=clamp(p);return p*p*(3-2*p);};
  const progress = (t,a,b) => clamp((t-a)/(b-a));
  const smooth = (t,a,b) => ease(progress(t,a,b));
  const out = p => 1-Math.pow(1-clamp(p),3);
  const pop = p => {p=clamp(p);return 1+2.70158*Math.pow(p-1,3)+1.70158*Math.pow(p-1,2);};
  const starts = [2,5,9,13,17,24];
  const ends = [5,9,13,17,24,27];
  const stages = [
    {name:'加满冰块', en:'ICE FIRST', value:'4–5', unit:'块', note:'大块冰，融化更慢', subtitle:'先把大块冰放进古典杯。'},
    {name:'倒入金酒', en:'LONDON DRY GIN', value:'30', unit:'mL', note:'清爽草本，打好基底', subtitle:'加入 30 mL 金酒。'},
    {name:'加入金巴利', en:'CAMPARI', value:'30', unit:'mL', note:'标志性的微苦与红色', subtitle:'再加入 30 mL 金巴利。'},
    {name:'加入甜味美思', en:'SWEET RED VERMOUTH', value:'30', unit:'mL', note:'甜红味美思，柔和收尾', subtitle:'加入 30 mL 甜红味美思，三味等份。'},
    {name:'轻柔搅拌', en:'STIR, DON’T SHAKE', value:'20', unit:'秒', note:'充分冷却，让风味融合', subtitle:'轻轻搅拌约 20 秒，让酒液充分冷却。'},
    {name:'橙片装饰', en:'THE FINISHING TOUCH', value:'1', unit:'片', note:'新鲜橙片，添一抹柑橘香', subtitle:'放上一片新鲜橙片。完成。'}
  ];
  const cx=379, top=424, bottom=752;
  let seed = 1946;
  const rand = () => {seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const paper = document.createElement('canvas');paper.width=240;paper.height=240;
  const pc=paper.getContext('2d'), pixels=pc.createImageData(240,240);
  for(let i=0;i<pixels.data.length;i+=4){const n=Math.round(80+rand()*130);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=n;pixels.data[i+3]=13;}
  pc.putImageData(pixels,0,0);
  const texture=ctx.createPattern(paper,'repeat');
  const ice=[{x:-57,y:681,r:-.22,s:81,at:2.28},{x:43,y:691,r:.18,s:84,at:2.67},{x:-33,y:604,r:.16,s:87,at:3.04},{x:58,y:604,r:-.24,s:78,at:3.43}];

  function rr(x,y,w,h,r=12){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  function line(x1,y1,x2,y2,color=C.ink,width=2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function txt(s,x,y,size=24,color=C.ink,font=CN,weight='400',align='left'){
    ctx.font=`${weight} ${size}px ${font}`;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y);
  }
  function tracked(s,x,y,size=16,space=3,color=C.muted,align='left'){
    ctx.font=`500 ${size}px ${SANS}`;let width=0;
    for(const ch of s)width+=ctx.measureText(ch).width+space;
    width-=space;let at=align==='center'?x-width/2:align==='right'?x-width:x;
    ctx.fillStyle=color;ctx.textAlign='left';
    for(const ch of s){ctx.fillText(ch,at,y);at+=ctx.measureText(ch).width+space;}
  }
  function glassPath(){
    ctx.beginPath();ctx.moveTo(cx-148,top);ctx.bezierCurveTo(cx-143,top+89,cx-130,bottom-44,cx-123,bottom-12);
    ctx.quadraticCurveTo(cx-119,bottom+5,cx,bottom+7);ctx.quadraticCurveTo(cx+119,bottom+5,cx+123,bottom-12);
    ctx.bezierCurveTo(cx+130,bottom-44,cx+143,top+89,cx+148,top);ctx.closePath();
  }
  function vol(t){return 30*smooth(t,5.55,8.48)+30*smooth(t,9.55,12.48)+30*smooth(t,13.55,16.48);}
  function level(t){return 736-vol(t)/90*212;}
  function stageAt(t){let s=-1;for(let i=0;i<starts.length;i++)if(t>=starts[i])s=i;return s;}
  function stirring(t){return smooth(t,17.35,18.05)*(1-smooth(t,23.25,23.95));}

  function background(){
    ctx.fillStyle=C.paper;ctx.fillRect(0,0,W,H);
    const glow=ctx.createRadialGradient(490,400,120,500,500,800);glow.addColorStop(0,'#fffaf160');glow.addColorStop(1,'#dbcfbc32');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=texture;ctx.fillRect(0,0,W,H);
  }
  function header(t){
    const a=smooth(t,0,.75);ctx.save();ctx.globalAlpha=a;ctx.translate(0,12*(1-a));
    tracked('THE APERITIVO CLUB',72,65,14,2.6,C.muted);
    tracked('RECIPE 001 / 30 SEC',1008,65,14,2,C.muted,'right');
    const title=smooth(t,.1,1.2);ctx.save();ctx.globalAlpha=title;ctx.translate(540,178+22*(1-title));
    ctx.font=`bold 100px ${SERIF}`;ctx.textAlign='center';ctx.lineJoin='round';ctx.lineWidth=1.9;
    ctx.strokeStyle=C.darkRed;ctx.fillStyle='#dfbab1';ctx.fillText('NEGRONI',2,4);ctx.fillStyle=C.red;ctx.fillText('NEGRONI',0,0);ctx.strokeText('NEGRONI',0,0);ctx.restore();
    txt('尼格罗尼  ·  三味等份，一杯经典',540,234,24,C.ink,CN,'400','center');
    line(72,274,1008,274,'#d8c9bb',1);
    tracked('BUILD IN A ROCKS GLASS',213,312,12,2.3,C.muted);
    txt('1 : 1 : 1',996,313,21,C.darkRed,SERIF,'400','right');
    ctx.restore();
  }
  function shadow(t){
    const a=smooth(t,.6,1.8);ctx.save();ctx.globalAlpha=a;
    const g=ctx.createRadialGradient(cx,772,15,cx,772,184);g.addColorStop(0,'#85725c23');g.addColorStop(.65,'#85725c12');g.addColorStop(1,'#85725c00');
    ctx.fillStyle=g;ctx.save();ctx.translate(0,772);ctx.scale(1,.19);ctx.beginPath();ctx.arc(cx,0,184,0,Math.PI*2);ctx.fill();ctx.restore();ctx.restore();
  }
  function backGlass(){
    ctx.save();glassPath();const g=ctx.createLinearGradient(cx-148,0,cx+148,0);g.addColorStop(0,'#bbd5d52a');g.addColorStop(.33,'#f9ffff1a');g.addColorStop(.72,'#ffffff20');g.addColorStop(1,'#a8ced32c');ctx.fillStyle=g;ctx.fill();
    ctx.beginPath();ctx.ellipse(cx,top,148,22,0,0,Math.PI*2);ctx.fillStyle='#e7efeb44';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#64777790';ctx.stroke();
    ctx.restore();
  }
  function iceCube(cube,t,outline=false){
    const p=progress(t,cube.at,cube.at+.65);if(p<=0)return;
    const settle=out(p), wobble=p<1?Math.sin(p*Math.PI*3)*(1-p)*12:0;
    const st=stirring(t), theta=(t-17.3)*4.3;
    const float=vol(t)/90*35;
    const x=cx+cube.x+st*Math.sin(theta+cube.at)*14;
    const y=cube.y-float-440*(1-settle)+wobble+st*Math.cos(theta+cube.at)*5;
    ctx.save();ctx.translate(x,y);ctx.rotate(cube.r+(1-settle)*.7+st*Math.sin(theta+cube.at)*.12);
    const s=cube.s;rr(-s/2,-s/2,s,s,12);
    if(outline){ctx.strokeStyle='#e6ffffad';ctx.lineWidth=1.8;ctx.stroke();line(-s*.31,-s*.29,s*.22,-s*.32,'#ffffffb8',2);line(-s*.32,-s*.26,-s*.32,s*.1,'#ffffff80',2);}
    else {
      const g=ctx.createLinearGradient(-s/2,-s/2,s/2,s/2);g.addColorStop(0,'#faffffa6');g.addColorStop(.5,'#c9e6e2a8');g.addColorStop(1,'#e2f1eca0');ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#59797a8a';ctx.lineWidth=1.8;ctx.stroke();
      ctx.beginPath();ctx.moveTo(-s*.26,s*.36);ctx.lineTo(-s*.33,-s*.24);ctx.lineTo(s*.28,-s*.31);ctx.lineTo(s*.36,s*.23);ctx.strokeStyle='#ffffff99';ctx.lineWidth=1.4;ctx.stroke();
      line(-s*.05,-s*.23,s*.14,s*.17,'#9fbfbd70',1.2);
    }
    ctx.restore();
  }
  function liquid(t){
    const v=vol(t);if(v<.01)return;
    const y=level(t), st=stirring(t), red=smooth(t,9.65,12.4), amber=smooth(t,13.65,16.4);
    ctx.save();glassPath();ctx.clip();
    const light=`rgba(${Math.round(mix(197,197,red))},${Math.round(mix(220,77-amber*8,red))},${Math.round(mix(210,80-amber*18,red))},${mix(.48,.86,red)})`;
    const dark=`rgba(${Math.round(mix(170,148,red))},${Math.round(mix(200,45,red))},${Math.round(mix(192,49,red))},${mix(.42,.87,red)})`;
    const g=ctx.createLinearGradient(0,y,0,bottom);g.addColorStop(0,light);g.addColorStop(1,dark);ctx.fillStyle=g;
    ctx.beginPath();ctx.moveTo(cx-160,bottom+20);ctx.lineTo(cx-160,y);
    for(let x=cx-160;x<=cx+160;x+=6){const wave=Math.sin((x-cx)/26+t*5)*(1.1+st*2);ctx.lineTo(x,y+wave);}
    ctx.lineTo(cx+160,bottom+20);ctx.closePath();ctx.fill();
    ctx.beginPath();ctx.ellipse(cx,y,139-(y-top)/17,13,0,0,Math.PI*2);ctx.fillStyle=red?'#e0757055':'#eef8ed55';ctx.fill();ctx.strokeStyle=red?'#a7474e80':'#7f9c9b60';ctx.lineWidth=1.5;ctx.stroke();
    if(st>.01){
      for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(cx+Math.sin(t*3+i)*5,y+5+i*8,92-i*18,10-i*2,0,t*4+i,t*4+i+2.7);ctx.strokeStyle=`rgba(255,211,175,${.32*st})`;ctx.lineWidth=1.5;ctx.stroke();}
    }
    // Small bubbles at the base of each pour settle rather than accumulating.
    const active=starts.slice(1,4).some(a=>t>a+.55&&t<a+3.48);
    if(active)for(let i=0;i<11;i++){
      const k=(t*1.4+i*.618)%1;ctx.beginPath();ctx.arc(cx+32+Math.sin(i*7.3)*20,y+12+k*60,1.2+(i%3)*.5,0,Math.PI*2);ctx.strokeStyle='#fff6dc66';ctx.lineWidth=1;ctx.stroke();
    }
    ctx.restore();
  }
  function bottle(t){
    let index=-1;for(let i=1;i<=3;i++)if(t>=starts[i]&&t<ends[i])index=i;if(index<0)return;
    const a=starts[index],b=ends[index],enter=smooth(t,a,a+.5),leave=smooth(t,b-.5,b);
    const visibility=enter*(1-leave);if(visibility<.001)return;
    const pour=smooth(t,a+.42,a+.72)*(1-smooth(t,b-.64,b-.4));
    const colors=['','#b9d1c8','#c3414b','#a27143'];
    const names=['','GIN','CAMPARI','VERMOUTH'];
    const px=422-100*(1-enter)-130*leave,py=345-40*(1-enter)-40*leave;
    ctx.save();ctx.globalAlpha=visibility;ctx.translate(px,py);ctx.rotate(-.32-.76*pour);
    ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-10,-40);ctx.quadraticCurveTo(-10,-53,-28,-63);ctx.lineTo(-30,-157);ctx.quadraticCurveTo(-30,-169,-18,-171);ctx.lineTo(18,-171);ctx.quadraticCurveTo(30,-169,30,-157);ctx.lineTo(28,-63);ctx.quadraticCurveTo(10,-53,10,-40);ctx.lineTo(10,0);ctx.closePath();ctx.fillStyle=colors[index];ctx.fill();ctx.strokeStyle='#485954';ctx.lineWidth=2;ctx.stroke();
    rr(-27,-137,54,66,3);ctx.fillStyle=index===2?'#f6ead7':'#f7f1e2';ctx.fill();
    txt(names[index],0,-108,index===3?8:10,index===2?C.red:C.ink,SANS,'700','center');
    txt('30 mL',0,-92,9,C.muted,SANS,'400','center');
    line(-17,-159,-17,-145,'#ffffff90',3);line(-19,-67,-19,-47,'#ffffff80',2);line(-11,-5,11,-5,'#778a7c',3);
    ctx.restore();
    if(pour>.01&&t>=a+.55&&t<=b-.5){
      const endY=level(t)+3;
      ctx.save();ctx.globalAlpha=visibility*pour;
      ctx.beginPath();ctx.moveTo(px+2,py+1);ctx.bezierCurveTo(px+5,py+40,px-5,endY-55,px+4,endY);
      ctx.strokeStyle=index===1?'#c3dcd5d9':index===2?'#c14c51':'#ad744be6';ctx.lineWidth=9;ctx.lineCap='round';ctx.stroke();ctx.lineWidth=2.4;ctx.strokeStyle='#fff9e891';ctx.stroke();
      for(let i=0;i<3;i++){const u=(t*2.1+i*.33)%1;ctx.beginPath();ctx.ellipse(px+6+Math.sin(i*4)*6,py+30+u*(endY-py-30),2.5,4.5,0,0,Math.PI*2);ctx.fillStyle=index===1?'#c8ded4':colors[index];ctx.fill();}
      ctx.beginPath();ctx.ellipse(px+3,endY,22+Math.sin(t*14)*3,5,0,0,Math.PI*2);ctx.strokeStyle='#ffe7c5a0';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();
    }
  }
  function spoon(t){
    const visibility=smooth(t,17.05,17.6)*(1-smooth(t,23.45,24));if(visibility<.001)return;
    const st=stirring(t),p=(t-17.3)*4.3;
    const dx=Math.sin(p)*34*st,dy=Math.cos(p)*7*st,slide=(1-visibility)*290;
    ctx.save();ctx.globalAlpha=visibility;ctx.translate(0,-slide);
    ctx.beginPath();ctx.moveTo(cx+dx*.65,349+dy);ctx.lineTo(cx+dx,655+dy);ctx.strokeStyle='#535e5c';ctx.lineWidth=5;ctx.lineCap='round';ctx.stroke();ctx.lineWidth=1.3;ctx.strokeStyle='#f7fdf7';ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx+dx,662+dy,9,16,-.12,0,Math.PI*2);ctx.fillStyle='#b6c8bc';ctx.fill();ctx.strokeStyle='#5b6d65';ctx.lineWidth=1.6;ctx.stroke();
    ctx.beginPath();ctx.arc(cx+dx*.65,344+dy,5,0,Math.PI*2);ctx.fillStyle='#d2ddd0';ctx.fill();ctx.stroke();ctx.restore();
  }
  function frontGlass(t){
    glassPath();ctx.strokeStyle='#405c5bd0';ctx.lineWidth=2.5;ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx,top,148,22,0,0,Math.PI);ctx.strokeStyle='#3f5b59d0';ctx.lineWidth=2.2;ctx.stroke();
    ctx.beginPath();ctx.ellipse(cx,bottom-8,119,13,0,0,Math.PI);ctx.strokeStyle='#fcfffca0';ctx.lineWidth=2;ctx.stroke();
    ctx.save();glassPath();ctx.clip();
    ctx.beginPath();ctx.moveTo(cx-126,top+39);ctx.lineTo(cx-109,bottom-37);ctx.strokeStyle='#ffffffa8';ctx.lineWidth=6;ctx.lineCap='round';ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx+125,top+47);ctx.lineTo(cx+107,bottom-49);ctx.strokeStyle='#ffffff5c';ctx.lineWidth=3;ctx.stroke();
    ctx.restore();
    // A minimal volume ruler sits beside the glass, never over the drink.
    const a=smooth(t,4.7,5.4);ctx.save();ctx.globalAlpha=a;
    for(let i=1;i<=3;i++){const y=736-i/3*212,hit=vol(t)>=i*30-.5;line(552,y,566,y,hit?C.red:'#b9a79a',1.5);txt(`${i*30}`,576,y+5,16,hit?C.red:C.muted,SANS);}
    tracked('mL',576,493,10,1,C.muted);ctx.restore();
  }
  function orange(t){
    const p=progress(t,24.25,25.35);if(p<=0)return;
    const q=pop(p),x=320,y=mix(246,430,q);
    ctx.save();ctx.translate(x,y);ctx.rotate(mix(-.7,-.12,q));ctx.globalAlpha=clamp(p*3);
    ctx.beginPath();ctx.arc(0,0,67,Math.PI,Math.PI*2);ctx.lineTo(67,0);ctx.closePath();ctx.fillStyle='#e48737';ctx.fill();ctx.strokeStyle='#aa642f';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,58,Math.PI,Math.PI*2);ctx.lineTo(58,0);ctx.closePath();ctx.fillStyle='#f9d991';ctx.fill();
    ctx.beginPath();ctx.arc(0,-1,51,Math.PI+.02,Math.PI*2-.02);ctx.lineTo(51,-1);ctx.closePath();ctx.fillStyle='#f2ac51';ctx.fill();
    for(let i=1;i<7;i++){const ang=Math.PI+i/7*Math.PI;line(0,-2,Math.cos(ang)*50,Math.sin(ang)*50-1,'#fce7b3',2.6);}
    for(let i=0;i<16;i++){const ang=Math.PI+(i+.5)/16*Math.PI;ctx.beginPath();ctx.ellipse(Math.cos(ang)*40,Math.sin(ang)*40-2,1,4,ang,0,Math.PI*2);ctx.fillStyle='#fbd18b';ctx.fill();}
    line(-64,1,64,1,'#a45b31',1.3);ctx.restore();
  }
  function sparkles(t){
    const a=smooth(t,25.7,26.3);if(!a)return;
    const pts=[[210,397,8],[558,385,10],[581,698,6],[211,737,5]];
    ctx.save();ctx.globalAlpha=a;
    pts.forEach(([x,y,r],i)=>{const pulse=.65+.35*Math.sin(t*2+i*2);ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);ctx.beginPath();ctx.moveTo(-r,0);ctx.quadraticCurveTo(0,-1,0,-r);ctx.quadraticCurveTo(1,0,r,0);ctx.quadraticCurveTo(0,1,0,r);ctx.quadraticCurveTo(-1,0,-r,0);ctx.fillStyle=C.orange;ctx.fill();ctx.restore();});ctx.restore();
  }
  function cardBase(){
    ctx.shadowColor='#5a3c2810';ctx.shadowBlur=14;ctx.shadowOffsetY=6;
    rr(648,426,350,290,11);ctx.fillStyle='#fffcf4';ctx.fill();ctx.shadowColor='transparent';ctx.strokeStyle='#9a716a';ctx.lineWidth=1.25;ctx.stroke();
    line(666,706,978,706,'#e4c5b8',3);
  }
  function card(t,s,alpha=1,dy=0){
    if(alpha<.001)return;ctx.save();ctx.globalAlpha=alpha;ctx.translate(0,dy);ctx.translate(823,571);ctx.rotate(-.009);ctx.translate(-823,-571);cardBase();
    if(s===-1){
      tracked('THE PERFECT BALANCE',674,461,11,1.8,C.red);txt('三味等份',674,508,32,C.ink,CN,'500');
      txt('1 : 1 : 1',674,579,58,C.red,SERIF,'700');txt('金酒 · 金巴利 · 甜红味美思',674,623,20,C.muted);txt('在杯中调和，简单成就经典。',674,667,18,C.ink);
    }else if(s===6){
      tracked('YOUR NEGRONI, READY.',674,461,11,1.8,C.red);txt('等份调和，经典刚好。',674,503,26,C.ink,CN,'500');
      ['金酒','金巴利','甜红味美思'].forEach((name,i)=>{const y=551+i*45;txt(name,674,y,23,C.ink);txt('30 mL',969,y,24,C.red,SERIF,'400','right');if(i<2)line(674,y+14,969,y+14,'#eadbd0',1);});
      tracked('SALUTE!',823,687,15,3,C.darkRed,'center');
    }else{
      const d=stages[s];tracked(`STEP 0${s+1} / ${d.en}`,674,461,10.5,1.45,C.red);
      txt(d.name,674,511,31,C.ink,CN,'500');
      let value=d.value;if(s===4)value=String(Math.max(0,20-Math.floor(progress(t,17.8,23.3)*20))).padStart(2,'0');
      const sz=s===0?68:78;txt(value,674,597,sz,C.red,SERIF,'700');ctx.font=`700 ${sz}px ${SERIF}`;const measured=ctx.measureText(value).width;
      txt(d.unit,674+measured+13,591,24,C.darkRed,d.unit==='mL'?SERIF:CN);
      txt(d.note,674,640,19,C.muted);
      const p=progress(t,starts[s],ends[s]);line(674,676,969,676,'#ecddd4',4);line(674,676,674+295*p,676,C.red,4);
      if(s===4)txt('加速示意',969,659,12,C.muted,CN,'400','right');
    }
    ctx.restore();
  }
  function cards(t){
    const stage=t>=27?6:stageAt(t),start=stage===6?27:stage<0?.7:starts[stage];const p=smooth(t,start,start+.4);
    if(stage>=0&&p<1){const previous=stage===0?-1:stage-1;card(t,previous,1-p,-15*p);}
    card(t,stage,p,15*(1-p));
  }
  function caption(t){
    const s=stageAt(t),finish=t>=27;
    let text=finish?'三味等份，一杯经典。':s<0?'金酒、金巴利、甜红味美思，各 30 mL。':stages[s].subtitle;
    const start=finish?27:s<0?.9:starts[s];const a=smooth(t,start,start+.35);
    ctx.save();ctx.globalAlpha=a;txt(text,540,831+6*(1-a),25,C.ink,CN,'400','center');ctx.restore();
  }
  function footer(t){
    const alpha=smooth(t,.9,1.8);ctx.save();ctx.globalAlpha=alpha;
    const labels=['加冰','金酒','金巴利','甜味美思','搅拌','橙片'];const s=stageAt(t),finish=t>=27;
    const xs=labels.map((_,i)=>130+i*164);
    line(xs[0],908,xs[5],908,'#d8c7bb',1.5);
    if(s>=0){const x=finish?xs[5]:xs[Math.min(s,5)];line(xs[0],908,x,908,C.red,1.8);}
    for(let i=0;i<6;i++){
      const active=s===i&&!finish,done=finish||s>i,p=active?smooth(t,starts[i],starts[i]+.3):1;
      ctx.save();ctx.translate(xs[i],908);if(active)ctx.scale(mix(.9,1,p),mix(.9,1,p));
      ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fillStyle=done?C.red:C.paper;ctx.fill();ctx.lineWidth=active?2.5:1.5;ctx.strokeStyle=done||active?C.red:'#b7a294';ctx.stroke();
      if(done){ctx.beginPath();ctx.moveTo(-7,0);ctx.lineTo(-2,5);ctx.lineTo(8,-6);ctx.strokeStyle='#fff8ea';ctx.lineWidth=2;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
      else txt(String(i+1),0,5,14,active?C.red:C.muted,SANS,'600','center');
      ctx.restore();txt(labels[i],xs[i],952,18,active||done?C.darkRed:C.muted,CN,active?'600':'400','center');
    }
    line(72,1001,1008,1001,'#d8c9bb',2);line(72,1001,72+936*clamp(t/30),1001,C.red,2.5);
    tracked('GIN / CAMPARI / SWEET VERMOUTH',72,1036,10,1.75,C.muted);
    const sec=Math.min(30,Math.floor(t));txt(`00:${String(sec).padStart(2,'0')}  /  00:30`,1008,1037,14,C.muted,SANS,'400','right');ctx.restore();
  }

  window.renderFrame = function(time){
    const t=clamp(Number(time)||0,0,DURATION);ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.lineCap='round';ctx.lineJoin='round';background();header(t);
    const appear=smooth(t,.5,1.65);ctx.save();ctx.globalAlpha=appear;ctx.translate(0,20*(1-appear));shadow(t);backGlass();
    ctx.save();glassPath();ctx.clip();ice.forEach(c=>iceCube(c,t));ctx.restore();liquid(t);
    ctx.save();glassPath();ctx.clip();ice.forEach(c=>iceCube(c,t,true));ctx.restore();
    bottle(t);spoon(t);frontGlass(t);orange(t);sparkles(t);ctx.restore();cards(t);caption(t);footer(t);return t;
  };
  window.FILM = {width:W,height:H,duration:DURATION,fps:30,chapters:[0,...starts,27]};
  const isRender=new URLSearchParams(location.search).has('render');
  if(isRender)document.body.classList.add('render');
  const seek=document.getElementById('seek'),button=document.getElementById('play'),music=document.getElementById('music'),time=document.getElementById('time');
  let playing=false,current=0,origin=0;
  function update(t){current=window.renderFrame(t);seek.value=current;time.textContent=`00:${String(Math.floor(current)).padStart(2,'0')} / 00:30`;}
  function pause(){playing=false;music.pause();button.textContent='播放 · 开启声音';}
  function play(){if(current>=30)current=0;playing=true;origin=performance.now()-current*1000;music.currentTime=current;music.play().catch(()=>{});button.textContent='暂停';}
  button.onclick=()=>playing?pause():play();
  document.getElementById('restart').onclick=()=>{pause();update(0);play();};
  seek.oninput=()=>{update(Number(seek.value));music.currentTime=current;if(playing)origin=performance.now()-current*1000;};
  function tick(now){if(playing){const t=(now-origin)/1000;update(Math.min(t,30));if(t>=30)pause();}requestAnimationFrame(tick);}
  update(0);if(!isRender)requestAnimationFrame(tick);
})();
