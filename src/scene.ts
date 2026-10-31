import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {Level,Patch} from './levels';
import {airAt,coastX,terrainHeight,type FlightState} from './sim';
const v=new T.Vector3();
const rand=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export type SceneFeedback={gateFlash?:number;landingApproach?:boolean};
export class FlightScene{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(58,1,.5,7000);world=new T.Group();plane=new T.Group();sun=new T.DirectionalLight('#fff1cc',2.5);hemi=new T.HemisphereLight('#d7edfa','#9d7950',2);clouds:T.Group[]=[];flags:T.Group[]=[];hints=new T.Group();trail:T.Line;ghost:T.Line;modelLoaded=false;modelError='';reduced=false;level!:Level;fps=60;frames=0;sample=performance.now();
 private sky?:T.Mesh;private sea?:T.Mesh;private lastGate=0;private burst=new T.Group();private burstAt=-10;private landing=new T.Group();private flightClock=0;
 constructor(public canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.04;
  this.scene.add(this.world,this.plane,this.hemi,this.sun,this.burst);this.sun.position.set(-700,1100,600);
  this.trail=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#fff2d2',transparent:true,opacity:.26}));
  this.ghost=new T.Line(new T.BufferGeometry(),new T.LineDashedMaterial({color:'#d9efef',transparent:true,opacity:.27,dashSize:12,gapSize:9}));
  this.scene.add(this.trail,this.ghost);this.buildFallback();
  for(let i=0;i<32;i++){const m=new T.Mesh(new T.PlaneGeometry(2,3),new T.MeshBasicMaterial({color:i%3?'#f8ce76':'#fff4d8',side:T.DoubleSide,transparent:true}));m.visible=false;this.burst.add(m);}
  new GLTFLoader().load(import.meta.env.BASE_URL+'models/sailplane.glb',g=>{
   const model=g.scene;model.traverse(o=>{if(o instanceof T.Mesh){for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof T.MeshStandardMaterial){m.roughness=.76;m.metalness=0;m.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float creamMask = smoothstep(0.28,0.65,diffuseColor.r) * smoothstep(0.24,0.6,diffuseColor.g) * (1.0-smoothstep(0.16,0.44,diffuseColor.b)) * smoothstep(-0.03,0.08,diffuseColor.r-diffuseColor.g);
    diffuseColor.rgb = mix(diffuseColor.rgb,vec3(0.91,0.85,0.68),creamMask*0.88);
   `);};m.customProgramCacheKey=()=>'windshift-cream-v2';}}});
   const box=new T.Box3().setFromObject(model),size=box.getSize(new T.Vector3()),pivot=new T.Group();pivot.add(model);model.position.sub(box.getCenter(new T.Vector3()));pivot.scale.setScalar(21/Math.max(size.x,size.y,size.z));pivot.rotation.y=-Math.PI/2;this.plane.clear();this.plane.add(pivot);this.modelLoaded=true;
  },undefined,()=>{this.modelError='מודל הדאון עדיין נטען';});this.resize();
 }
 mat(color:string){return new T.MeshStandardMaterial({color,roughness:.96,metalness:0});}
 mesh(geo:T.BufferGeometry,color:string,x=0,y=0,z=0):T.Mesh<T.BufferGeometry,T.Material>{const m=new T.Mesh(geo,this.mat(color));m.position.set(x,y,z);return m;}
 buildFallback(){const fus=this.mesh(new T.SphereGeometry(1,12,8),'#f3e4be');fus.scale.set(.65,.7,5);this.plane.add(fus);this.plane.add(this.mesh(new T.BoxGeometry(18,.2,1.5),'#6aabb1',0,.15,0),this.mesh(new T.BoxGeometry(5,.16,1),'#f1e4c3',0,.65,3.8),this.mesh(new T.BoxGeometry(.18,1.6,1.5),'#d19b45',0,1,3.6));}
 private clearWorld(){this.world.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Points){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();}});this.world.clear();this.flags=[];this.clouds=[];this.hints=new T.Group();this.landing=new T.Group();}
 setLevel(l:Level){
  this.level=l;this.clearWorld();this.lastGate=0;this.burstAt=-10;this.flightClock=0;this.burst.children.forEach(c=>c.visible=false);
  const night=!!l.night;this.scene.background=new T.Color(night?'#324e6b':l.sunset?'#eac3a1':'#b9e1e7');this.scene.fog=new T.Fog(night?'#4c6980':l.sunset?'#e6c3a6':'#c5dbd8',1050,4300);
  this.sun.color.set(night?'#c8deec':'#fff0d1');this.sun.intensity=night?1.05:2.5;this.hemi.color.set(night?'#9eb8d0':'#d0ecf5');this.hemi.groundColor.set(night?'#666b60':'#a68a5a');this.hemi.intensity=night?1.45:1.65;
  this.addSky(l);this.addTerrain(l);this.addSea(l);this.addVegetation(l);this.addFields(l);this.addVillage(l);this.addGates(l);this.addLanding(l);this.addClouds(l);this.addLiftCues(l);
  this.trail.geometry.dispose();this.trail.geometry=new T.BufferGeometry();this.ghost.visible=false;
 }
 private addSky(l:Level){
  const night=!!l.night;
  const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:new T.Color(night?'#183c62':l.sunset?'#8aa9c8':'#398dbc')},horizon:{value:new T.Color(night?'#6f8eaa':l.sunset?'#ffd9b4':'#c4e0df')},bottom:{value:new T.Color(night?'#566c79':'#e7d8ad')}},vertexShader:'varying vec3 dir;void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'uniform vec3 top;uniform vec3 horizon;uniform vec3 bottom;varying vec3 dir;void main(){float y=normalize(dir).y;vec3 c=mix(horizon,top,smoothstep(-0.03,0.48,y));c=mix(c,bottom,(1.0-smoothstep(-0.35,0.0,y))*0.55);gl_FragColor=vec4(c,1.0);\n#include <colorspace_fragment>\n}' });
  this.sky=new T.Mesh(new T.SphereGeometry(5500,32,20),skyMat);this.sky.renderOrder=-10;this.world.add(this.sky);
  const orb=new T.Mesh(new T.SphereGeometry(night?55:65,24,16),new T.MeshBasicMaterial({color:night?'#fff3d6':'#fff1c2',fog:false}));orb.position.set(-1350,850,-2800);this.world.add(orb);
  // Atmospheric ridges are distant scenery; collision remains the authored terrain.
  for(let layer=0;layer<3;layer++){const pts:number[]=[];const idx:number[]=[];for(let i=0;i<25;i++){const x=-150+i*165,y=(220+layer*85+Math.sin(i*.32+layer)*85+Math.sin(i*.7)*40+rand(i+layer*31)*30)*Math.sin(Math.PI*i/24);pts.push(x,y,-3100-layer*420,x,-1000,-3100-layer*420);if(i<24){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,new T.MeshBasicMaterial({color:night?'#637c93':layer===0?'#a4bdbe':layer===1?'#b6cccc':'#cbdcda',side:T.DoubleSide,transparent:false}));this.world.add(m);}
 }
 private addTerrain(l:Level){
  const ground=new T.PlaneGeometry(3400,4100,204,246);ground.rotateX(-Math.PI/2);ground.translate(450,0,-750);const pos=ground.attributes.position,colors=new Float32Array(pos.count*3),col=new T.Color(),chalk=new T.Color('#ead6af');
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i),y=terrainHeight(l,x,z);pos.setY(i,y);const slope=Math.hypot(terrainHeight(l,x+4,z)-terrainHeight(l,x-4,z),terrainHeight(l,x,z+4)-terrainHeight(l,x,z-4))/8;
   const basin=Math.sin(x*.007+Math.sin(z*.003)*1.5)*Math.cos(z*.008);col.set(l.desert?'#c29863':basin>.18?'#b4a86c':'#c6ac75');
   const terrace=.5+.5*Math.sin(y*.17+Math.sin(z*.008)*1.2);if(slope>.32&&y>40)col.lerp(chalk,Math.min(.9,(slope-.25)*1.25));if(slope>.48)col.multiplyScalar(.88+terrace*.19);
   if(x<coastX(z)+46)col.set('#eddbac');
   for(const p of l.patches){const d=Math.hypot(x-p.x,z-p.z)/p.r;if(d<1.05)col.lerp(new T.Color(p.color),Math.min(.78,Math.max(0,(1.12-d)*4)));}
   if(l.rainShadow&&slope<.43){const east=T.MathUtils.clamp((x-60)/270,0,1);col.lerp(new T.Color('#7f976c'),(1-east)*.7);col.lerp(new T.Color('#ccaa77'),east*.65);}
   col.multiplyScalar(.97+.035*Math.sin(x*.08+z*.047)+.018*Math.cos(z*.13));colors.set([col.r,col.g,col.b],i*3);
  }
  ground.setAttribute('color',new T.BufferAttribute(colors,3));ground.computeVertexNormals();this.world.add(new T.Mesh(ground,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:false})));
  // Strata follow the sampled surface, giving steep faces scale without fake obstacles.
  const strata:number[]=[];for(let band=0;band<9;band++){for(let i=0;i<145;i++){const z=450-i*21,x=coastX(z)+18+band*8,y=terrainHeight(l,x,z);if(y>4){strata.push(x,y+.18,z,x+1,terrainHeight(l,x+1,z-13)+.18,z-13);}}}this.world.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(strata,3)),new T.LineBasicMaterial({color:'#c4a77e',transparent:true,opacity:.28})));
 }
 private addSea(l:Level){
  const night=!!l.night;
  const mat=new T.ShaderMaterial({uniforms:{time:{value:0},night:{value:night?1:0}},vertexShader:'varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.0)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.0);}',fragmentShader:`varying vec3 wp;uniform float time;uniform float night;void main(){float coast=-365.0+45.0*sin(wp.z*.004)+25.0*sin(wp.z*.009);float depth=clamp((coast-wp.x)/240.0,0.0,1.0);vec3 shallow=mix(vec3(.20,.67,.65),vec3(.13,.35,.47),night);vec3 deep=mix(vec3(.055,.29,.43),vec3(.055,.16,.28),night);vec3 c=mix(shallow,deep,depth);float wave=sin(wp.x*.05+wp.z*.11+time*.5)*sin(wp.z*.17-time*.3);c+=pow(max(0.0,wave),13.0)*.055*(1.0-night*.4);float haze=smoothstep(950.0,4200.0,-wp.z);c=mix(c,mix(vec3(.65,.8,.81),vec3(.33,.46,.59),night),haze*.58);gl_FragColor=vec4(c,1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
  this.sea=new T.Mesh(new T.PlaneGeometry(9500,9500),mat);this.sea.rotation.x=-Math.PI/2;this.sea.position.set(-1700,-.2,-1800);this.world.add(this.sea);
  const foam:number[]=[];for(let i=0;i<420;i++){const z=700-i*9,x=coastX(z)-9;foam.push(x,.35,z,x+Math.sin(z*.018)*3,.35,z-5);}this.world.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(foam,3)),new T.LineBasicMaterial({color:night?'#8ba9b6':'#e8f1da',transparent:true,opacity:.75})));
 }
 private addVegetation(l:Level){
  const cap=1600,leaves=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),this.mat(l.night?'#526c63':'#667b42'),cap),trunks=new T.InstancedMesh(new T.CylinderGeometry(.55,.8,1,5),this.mat('#7f7252'),cap),cypress=new T.InstancedMesh(new T.ConeGeometry(1,1,7),this.mat(l.night?'#435f59':'#49664b'),cap),d=new T.Object3D();let count=0,cc=0;
  for(let cluster=0;cluster<80;cluster++){
   const cx=-240+rand(cluster+21)*1750,cz=370-rand(cluster+91)*2900;const density=l.desert?3:12+Math.floor(rand(cluster+18)*15);if(l.rainShadow&&cx>210&&cluster%4)continue;
   for(let j=0;j<density;j++){const a=rand(cluster*31+j+8)*Math.PI*2,r=Math.sqrt(rand(cluster*17+j+7))* (35+rand(cluster+5)*70),x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,y=terrainHeight(l,x,z),slope=Math.hypot(terrainHeight(l,x+5,z)-terrainHeight(l,x-5,z),terrainHeight(l,x,z+5)-terrainHeight(l,x,z-5))/10;if(x<coastX(z)+45||y>360||slope>.65||Math.hypot(x-l.landing.x,z-l.landing.z)<l.landing.r+30||l.patches.some(p=>Math.hypot(x-p.x,z-p.z)<p.r*.95))continue;
    if(j%7===0){d.position.set(x,y+7,z);d.scale.set(2.5,14,2.5);d.rotation.set(0,a,0);d.updateMatrix();cypress.setMatrixAt(cc++,d.matrix);}else if(count<cap){const size=3+rand(j+cluster*3)*3;d.position.set(x,y+size*.85,z);d.scale.set(size*1.35,size*.83,size);d.rotation.set(0,a,0);d.updateMatrix();leaves.setMatrixAt(count,d.matrix);leaves.setColorAt(count,new T.Color().setHSL(.20+rand(j+cluster)*.025,.2,.23+rand(j*7+cluster)*.09));d.position.y=y+size*.35;d.scale.set(1,size*.8,1);d.updateMatrix();trunks.setMatrixAt(count,d.matrix);count++;}
   }
  }
  leaves.count=count;trunks.count=count;cypress.count=cc;this.world.add(leaves,trunks,cypress);
  const rocks=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),this.mat('#d5c29c'),190);let rc=0;for(let i=0;i<190;i++){const z=400-rand(i+31)*2600,x=coastX(z)+30+rand(i+70)*70,y=terrainHeight(l,x,z);if(y<4||Math.hypot(x-l.landing.x,z-l.landing.z)<l.landing.r+10)continue;d.position.set(x,y+1,z);d.scale.set(3+rand(i+9)*9,2+rand(i+17)*4,3+rand(i)*8);d.rotation.set(rand(i),rand(i+3)*6,rand(i+2));d.updateMatrix();rocks.setMatrixAt(rc++,d.matrix);}rocks.count=rc;this.world.add(rocks);
 }
 private addFields(l:Level){
  // Surface properties have physical cues; identical patch colors stay identical.
  for(const p of l.patches){const lines:number[]=[];for(let n=-5;n<=5;n++){const z=p.z+n*p.r*.145;for(let k=-5;k<5;k++){const x=p.x+k*p.r*.145;if(Math.hypot(x-p.x,z-p.z)>p.r*.9)continue;lines.push(x,terrainHeight(l,x,z)+.5,z,x+p.r*.11,terrainHeight(l,x+p.r*.11,z)+.5,z);}}this.world.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(lines,3)),new T.LineBasicMaterial({color:p.moisture>.5?'#668e91':'#9c8256',transparent:true,opacity:.48})));
   if(p.moisture>.5){for(let n=0;n<3;n++){const x=p.x+(n-1)*p.r*.45,z=p.z;const riser=this.mesh(new T.CylinderGeometry(.45,.45,4,5),'#5c7979',x,terrainHeight(l,x,z)+2,z);this.world.add(riser);}}
  }
  // Quiet agricultural parcels and terrace lines add a legible scale to inland slopes.
  const furrows:number[]=[];for(let f=0;f<25;f++){const cx=250+rand(f+190)*1050,cz=300-rand(f+220)*2400;if(l.patches.some(p=>Math.hypot(cx-p.x,cz-p.z)<p.r+70))continue;for(let row=0;row<5;row++){for(let k=0;k<7;k++){const x=cx+(k-3)*11,z=cz+row*9,y=terrainHeight(l,x,z);if(Math.abs(terrainHeight(l,x+5,z)-y)<3)furrows.push(x,y+.35,z,x+8,terrainHeight(l,x+8,z)+.35,z);}}}this.world.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(furrows,3)),new T.LineBasicMaterial({color:'#8b8d56',transparent:true,opacity:.3})));
 }
 private addVillage(l:Level){
  for(let i=0;i<32;i++){const cluster=Math.floor(i/6),x=400+rand(cluster+810)*900+(i%6-3)*21,z=-50-rand(cluster+900)*2300+Math.sin(i*2)*28,y=terrainHeight(l,x,z);if(y>300)continue;const b=this.mesh(new T.BoxGeometry(12,8,13),l.night?'#aba88d':'#e8d8b7',x,y+4,z),roof=this.mesh(new T.ConeGeometry(10,4,4),'#b67b59',x,y+10,z);roof.rotation.y=Math.PI/4;this.world.add(b,roof);if(l.night){const glow=new T.Mesh(new T.PlaneGeometry(3,2.5),new T.MeshBasicMaterial({color:'#ffe2a0',side:T.DoubleSide,fog:false}));glow.position.set(x,y+5,z+6.6);this.world.add(glow);}}
 }
 private addGates(l:Level){
  l.gates.forEach((g,i)=>{
   const group=new T.Group();group.position.set(g.x,g.y,g.z);const previous=i===0?l.launch:l.gates[i-1];group.rotation.y=Math.atan2(previous.x-g.x,previous.z-g.z);const ribbonGeo=new T.BufferGeometry(),positions:number[]=[],indices:number[]=[];
   for(let k=0;k<=50;k++){const a=Math.PI*k/50,x=Math.cos(a)*g.r,y=Math.sin(a)*g.r*.88;positions.push(x,y-1.5,0,x,y+3.5,0);if(k<50){const n=k*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}
   ribbonGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));ribbonGeo.setIndex(indices);ribbonGeo.computeVertexNormals();const ribbon=new T.Mesh(ribbonGeo,new T.MeshStandardMaterial({transparent:true,color:i?'#e6c691':'#ffd27a',emissive:'#c88e37',emissiveIntensity:.16,roughness:.95,side:T.DoubleSide}));ribbon.name='gate-ribbon';group.add(ribbon);
   for(const dx of [-g.r,g.r]){group.add(this.mesh(new T.CylinderGeometry(.65,.85,g.r+5,6),'#f1e1b9',dx,-g.r*.5,0));const cloth=this.mesh(new T.PlaneGeometry(12,29,3,8),i?'#e6ce9f':'#f7e7bd',dx+Math.sign(dx)*5,-3,0);(cloth.material as T.MeshStandardMaterial).side=T.DoubleSide;cloth.name='gate-cloth';cloth.userData.phase=dx;group.add(cloth);}
   // The lower cloth edge marks the actual −r opening bound; the top remains an open fabric arch.
   const lower=this.mesh(new T.PlaneGeometry(g.r*2,2.8,20,1),'#eee1bc',0,-g.r+1.4,0);(lower.material as T.MeshStandardMaterial).side=T.DoubleSide;lower.name='gate-cloth-base';lower.userData.phase=i+2;group.add(lower);
   for(const dx of [-g.r,g.r]){const tail=this.mesh(new T.PlaneGeometry(9,11,2,4),'#f5e8c8',dx+Math.sign(dx)*4.5,-g.r+5.5,0);(tail.material as T.MeshStandardMaterial).side=T.DoubleSide;tail.name='gate-cloth-tail';tail.userData.phase=dx+i;group.add(tail);}
   const pennant=this.mesh(new T.PlaneGeometry(10,7),'#fff2d4',0,g.r*.88+9,0);(pennant.material as T.MeshStandardMaterial).side=T.DoubleSide;pennant.rotation.z=Math.PI/4;group.add(pennant);this.flags.push(group);this.world.add(group);
  });
 }
 private addLanding(l:Level){
  const p=l.landing,r=p.r;
  const meadow=new T.CircleGeometry(r,64);meadow.rotateX(-Math.PI/2);const a=meadow.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i)+p.x,z=a.getZ(i)+p.z;a.setXYZ(i,x,terrainHeight(l,x,z)+.6,z);}meadow.computeVertexNormals();const meadowMesh=new T.Mesh(meadow,this.mat(l.night?'#7b9d8e':'#91b177'));meadowMesh.name='landing-meadow';this.landing.add(meadowMesh);
  const border:number[]=[];for(let i=0;i<64;i++){const a=i*Math.PI*2/64,b=a+.06;const x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r,x2=p.x+Math.cos(b)*r,z2=p.z+Math.sin(b)*r;border.push(x,terrainHeight(l,x,z)+1,z,x2,terrainHeight(l,x2,z2)+1,z2);}this.landing.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(border,3)),new T.LineBasicMaterial({color:'#f6e9bf',transparent:true,opacity:.45})));
  for(let i=-2;i<=2;i++){const z=p.z+i*r*.25;const chevron=new T.Shape();chevron.moveTo(-15,0);chevron.lineTo(0,8);chevron.lineTo(15,0);chevron.lineTo(15,-4);chevron.lineTo(0,4);chevron.lineTo(-15,-4);chevron.closePath();const geometry=new T.ShapeGeometry(chevron);geometry.rotateX(-Math.PI/2);const c=new T.Mesh(geometry,new T.MeshBasicMaterial({color:'#f5e9c8',side:T.DoubleSide,transparent:true,opacity:.35}));const previous=l.gates.at(-1)||l.launch;c.rotation.y=Math.atan2(previous.x-p.x,previous.z-p.z);c.position.set(p.x,terrainHeight(l,p.x,z)+1.1,z);this.landing.add(c);}
  for(const dx of [-r*.8,r*.8]){const y=terrainHeight(l,p.x+dx,p.z);this.landing.add(this.mesh(new T.CylinderGeometry(.7,.7,22,5),'#eee1bc',p.x+dx,y+11,p.z));const sock=this.mesh(new T.ConeGeometry(3.2,15,8),'#e6a061',p.x+dx+6,y+21,p.z);sock.name='windsock';sock.userData={originX:p.x+dx,originZ:p.z,baseY:y+21};this.landing.add(sock);}
  this.world.add(this.landing);
 }
 private addClouds(l:Level){
  const gs:T.BufferGeometry[]=[];for(let i=0;i<18;i++){const center=new T.Vector3(-1500+rand(i+3)*3400,600+rand(i+19)*260,500-rand(i+43)*3800);for(let j=0;j<5;j++){const g=new T.IcosahedronGeometry(1,2);g.scale(32+rand(i+j)*16,11+rand(i*j+2)*14,20+rand(i+j*8)*13);g.translate(center.x+(j-2)*26,center.y+Math.sin(j*2)*7,center.z+Math.cos(j)*14);gs.push(g);}}const merged=mergeGeometries(gs);gs.forEach(g=>g.dispose());const m=new T.Mesh(merged,new T.MeshStandardMaterial({color:l.night?'#8aa0b3':'#fff6df',emissive:l.night?'#2d465c':'#c4cfc3',emissiveIntensity:l.night?.2:.32,roughness:1}));m.name='cloud-field';this.world.add(m);
 }
 private addLiftCues(l:Level){
  l.patches.forEach(p=>{const group=new T.Group();for(let i=0;i<30;i++){const leaf=new T.Mesh(new T.PlaneGeometry(1.5+(i%3),.8+(i%2)),new T.MeshBasicMaterial({color:i%4?'#eac584':'#f6e7bc',side:T.DoubleSide,transparent:true,opacity:.62}));group.add(leaf);}group.position.set(p.x,0,p.z);group.userData={patch:p};this.hints.add(group);});this.world.add(this.hints);
  if(l.shadow){const sh=this.mesh(new T.CircleGeometry(l.shadow.r,48),'#393e3b',l.shadow.x,0,l.shadow.z);sh.rotation.x=-Math.PI/2;sh.material=new T.MeshBasicMaterial({color:'#53636a',transparent:true,opacity:.2,depthWrite:false});sh.name='shadow';this.world.add(sh);}
 }
 setGhost(trace:{x:number;y:number;z:number}[]){this.ghost.geometry.dispose();this.ghost.geometry=new T.BufferGeometry().setFromPoints(trace.map(p=>new T.Vector3(p.x,p.y,p.z)));this.ghost.computeLineDistances();this.ghost.visible=trace.length>2;}
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 draw(s:FlightState,dt:number,hint:boolean,feedback?:SceneFeedback){
  const l=this.level;this.flightClock=s.time;this.plane.position.set(s.x,s.y,s.z);this.plane.rotation.set(s.pitch*.11,-s.heading,-s.bank*.82,'YXZ');
  // Heading follows the flight model directly. No side-slip camera lag or banking horizon.
  const setback=33*Math.max(1,.9/this.camera.aspect),behind=new T.Vector3(-Math.sin(s.heading)*setback,12*Math.min(1.6,setback/33),Math.cos(s.heading)*setback);this.camera.position.set(s.x,s.y,s.z).add(behind);this.camera.up.set(0,1,0);this.camera.lookAt(s.x+Math.sin(s.heading)*95,s.y-5,s.z-Math.cos(s.heading)*95);
  const desiredFov=this.reduced?58:58+T.MathUtils.clamp((s.speed-28)*.12,-1,3);if(Math.abs(this.camera.fov-desiredFov)>.05){this.camera.fov=desiredFov;this.camera.updateProjectionMatrix();}if(this.sky)this.sky.position.copy(this.camera.position);
  const air=airAt(l,s.x,s.y,s.z,s.time);if(this.sea){const m=this.sea.material as T.ShaderMaterial;m.uniforms.time.value=s.time;}
  this.flags.forEach((g,i)=>{g.visible=i>=s.gate&&i<=s.gate+1;const active=i===s.gate,pulse=active&&!this.reduced?1+Math.sin(s.time*2.6)*.012:1;g.scale.setScalar(pulse);for(const child of g.children){if(child.name==='gate-ribbon'){const m=(child as T.Mesh).material as T.MeshStandardMaterial;m.emissiveIntensity=active?.2+Math.sin(s.time*2)*.06:0;m.color.set(active?'#ffd27a':'#cbbf9d');m.opacity=active?1:.35;}if(child.name.startsWith('gate-cloth')){const m=child as T.Mesh;const pos=m.geometry.attributes.position;for(let k=0;k<pos.count;k++)pos.setZ(k,Math.sin(pos.getY(k)*.21+s.time*2.5+child.userData.phase)*(this.reduced?.2:1.5));pos.needsUpdate=true;}}});
  if(s.gate>this.lastGate&&this.flags[this.lastGate]){this.burst.position.copy(this.flags[this.lastGate].position);this.burstAt=s.time;}this.lastGate=s.gate;const elapsed=s.time-this.burstAt;this.burst.children.forEach((c,i)=>{c.visible=elapsed>=0&&elapsed<1.8&&!this.reduced;if(c.visible){const a=i*2.4;c.position.set(Math.cos(a)*(8+elapsed*22),Math.sin(a)*(8+elapsed*22)-elapsed*5,Math.sin(i*1.7)*elapsed*14);c.rotation.set(elapsed*2+i,elapsed+i,elapsed*3);((c as T.Mesh).material as T.MeshBasicMaterial).opacity=Math.max(0,1-elapsed/1.8);}});
  const cloud=this.world.getObjectByName('cloud-field');if(cloud){cloud.position.x=air.windX*s.time*.26;cloud.position.z=air.windZ*s.time*.26;}
  this.landing.traverse(sock=>{if(sock.name==='windsock'){const direction=new T.Vector3(air.windX,0,air.windZ).normalize();if(direction.lengthSq()>.1){sock.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction);sock.position.set(sock.userData.originX+direction.x*6,sock.userData.baseY,sock.userData.originZ+direction.z*6);}}});
  const presentation=s as FlightState&{landingPhase?:'off'|'approach'|'flare';gateFlash?:number};const landingActive=s.gate>=l.gates.length||feedback?.landingApproach||presentation.landingPhase==='approach'||presentation.landingPhase==='flare';this.landing.scale.setScalar(1);this.landing.children.forEach(c=>{if(c instanceof T.Mesh&&c.material instanceof T.MeshBasicMaterial){c.material.color.set(landingActive?'#fff2c3':'#e6dfbf');c.material.opacity=landingActive?.95:.3;}if(c instanceof T.Mesh&&c.name==='landing-meadow')(c.material as T.MeshStandardMaterial).color.set(landingActive?(l.night?'#8aab99':'#9ab778'):(l.night?'#617d73':'#859764'));if(c instanceof T.LineSegments)(c.material as T.LineBasicMaterial).opacity=landingActive?1:.45;});
  for(const group of this.hints.children){const p=group.userData.patch as Patch,lift=airAt(l,p.x,100,p.z,s.time).thermal;group.visible=lift>1&&(l.overlay||hint);for(const [i,leaf]of group.children.entries()){const a=i*2.4+s.time*.45,y=((i*9+s.time*11)%220)+terrainHeight(l,p.x,p.z);leaf.position.set(Math.cos(a)*(24+i%6*7),y,Math.sin(a)*(24+i%6*7));leaf.rotation.set(a,0,a*.4);}}
  const shadow=this.world.getObjectByName('shadow');if(shadow&&l.shadow){shadow.position.x=l.shadow.x+l.shadow.speed*s.time;shadow.position.y=terrainHeight(l,shadow.position.x,shadow.position.z)+1;}
  if(s.trace.length>1){this.trail.geometry.dispose();this.trail.geometry=new T.BufferGeometry().setFromPoints(s.trace.slice(-50).map(p=>new T.Vector3(p.x,p.y,p.z)));}
  this.renderer.render(this.scene,this.camera);this.frames++;const now=performance.now();if(now-this.sample>1500){this.fps=Math.round(this.frames*1000/(now-this.sample));this.frames=0;this.sample=now;}
 }
 project(x:number,y:number,z:number){v.set(x,y,z).project(this.camera);return{x:(v.x*.5+.5)*this.canvas.clientWidth,y:(-.5*v.y+.5)*this.canvas.clientHeight,visible:v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1};}
}
