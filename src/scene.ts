import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import type {Level} from './levels';
import {airAt,coastX,terrainHeight,type FlightState} from './sim';
const v=new T.Vector3();
export class FlightScene{
 renderer:T.WebGLRenderer;scene=new T.Scene();camera=new T.PerspectiveCamera(61,1,.5,6500);world=new T.Group();plane=new T.Group();sun=new T.DirectionalLight('#fff3d6',2.5);hemi=new T.HemisphereLight('#c9e6fa','#9a774c',2);clouds:T.Group[]=[];flags:T.Group[]=[];hints=new T.Group();trail:T.Line;ghost:T.Line;modelLoaded=false;modelError='';reduced=false;level!:Level;fps=60;frames=0;sample=performance.now();
 constructor(public canvas:HTMLCanvasElement){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.92;
  this.scene.add(this.world,this.plane,this.hemi,this.sun);this.sun.position.set(-700,1100,600);
  this.trail=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#f7e7c5',transparent:true,opacity:.3}));
  this.ghost=new T.Line(new T.BufferGeometry(),new T.LineDashedMaterial({color:'#d7edf0',transparent:true,opacity:.32,dashSize:10,gapSize:7}));
  this.scene.add(this.trail,this.ghost);this.buildFallback();
  new GLTFLoader().load(import.meta.env.BASE_URL+'models/sailplane.glb',g=>{
   const model=g.scene;
   model.traverse(o=>{if(o instanceof T.Mesh){const materials=Array.isArray(o.material)?o.material:[o.material];for(const material of materials){if(material instanceof T.MeshStandardMaterial){material.roughness=.82;material.metalness=0;material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
     float creamMask = smoothstep(0.28,0.65,diffuseColor.r) * smoothstep(0.24,0.6,diffuseColor.g) * (1.0-smoothstep(0.16,0.44,diffuseColor.b)) * smoothstep(-0.03,0.08,diffuseColor.r-diffuseColor.g);
     diffuseColor.rgb = mix(diffuseColor.rgb,vec3(0.88,0.82,0.65),creamMask*0.86);
   `);};material.customProgramCacheKey=()=>'windshift-cream-v1';}}}});
   const box=new T.Box3().setFromObject(model);const size=box.getSize(new T.Vector3());
   // Tripo exports differ; asset owner confirms local forward axis before delivery.
   const pivot=new T.Group();pivot.add(model);model.position.sub(box.getCenter(new T.Vector3()));
   pivot.scale.setScalar(21/Math.max(size.x,size.y,size.z));
   pivot.rotation.y=-Math.PI/2;
   this.plane.clear();this.plane.add(pivot);this.modelLoaded=true;
  },undefined,()=>{this.modelError='מודל הדאון עדיין נטען';});
  this.resize();
 }
 mat(color:string){return new T.MeshStandardMaterial({color,roughness:.95,metalness:0});}
 mesh(geo:T.BufferGeometry,color:string,x=0,y=0,z=0):T.Mesh<T.BufferGeometry,T.Material>{const m=new T.Mesh(geo,this.mat(color));m.position.set(x,y,z);return m;}
 buildFallback(){const fus=this.mesh(new T.SphereGeometry(1,12,8),'#f3e4be');fus.scale.set(.65,.7,5);this.plane.add(fus);const wing=this.mesh(new T.BoxGeometry(17,.2,1.5),'#6aabb1',0,.15,0);this.plane.add(wing,this.mesh(new T.BoxGeometry(5,.16,1),'#f1e4c3',0,.65,3.8),this.mesh(new T.BoxGeometry(.18,1.6,1.5),'#d19b45',0,1,3.6));}
 setLevel(l:Level){
  this.level=l;this.world.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose();}});this.world.clear();this.flags=[];this.clouds=[];this.hints=new T.Group();
  const night=!!l.night;this.scene.background=new T.Color(night?'#253c59':l.sunset?'#d7af91':'#afd2df');this.scene.fog=new T.Fog(night?'#253c59':l.sunset?'#d7b49b':'#b2cfdb',900,3500);
  this.sun.color.set(night?'#bdcee3':'#fff0d4');this.sun.intensity=night?.8:2.1;this.hemi.intensity=night?1.1:1.5;
  const ground=new T.PlaneGeometry(3400,3900,170,195);ground.rotateX(-Math.PI/2);ground.translate(450,0,-700);
  const pos=ground.attributes.position;const colors=new Float32Array(pos.count*3);const col=new T.Color();
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),z=pos.getZ(i);let y=terrainHeight(l,x,z);pos.setY(i,y);
   const slope=Math.hypot(terrainHeight(l,x+4,z)-terrainHeight(l,x-4,z),terrainHeight(l,x,z+4)-terrainHeight(l,x,z-4))/8;
   col.set(l.desert?'#b78c57':'#b99d6d');
   if(y>55)col.set('#bfa879');if(slope>.43&&y>45)col.set('#e6d8b9');if(slope>.8)col.set('#f1e4cb');if(slope>.43)col.multiplyScalar(.93+.07*Math.sin(y*.3));
   if(x<coastX(z)+32)col.set('#eee0b8');
   for(const p of l.patches){const d=Math.hypot(x-p.x,z-p.z)/p.r;if(d<1.2)col.lerp(new T.Color(p.color),Math.max(0,1-d*.6));}
   if(l.rainShadow&&slope<.43){const east=Math.min(1,Math.max(0,(x-60)/270));col.lerp(new T.Color('#718762'),(1-east)*.55);col.lerp(new T.Color('#c89e6a'),east*.65);}
   const noise=.96+.045*Math.sin(x*.19+z*.06)+.025*Math.cos(z*.21);col.multiplyScalar(noise);colors.set([col.r,col.g,col.b],i*3);
  }
  ground.setAttribute('color',new T.BufferAttribute(colors,3));ground.computeVertexNormals();
  this.world.add(new T.Mesh(ground,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true})));
  const sea=this.mesh(new T.PlaneGeometry(9000,9000,1,1),night?'#133a52':'#227b9c',-1200,.1,-1300);sea.rotation.x=-Math.PI/2;this.world.add(sea);
  // Fine pale sea strokes give motion and scale without a repeated texture download.
  const seaStrokes:number[]=[];for(let i=0;i<260;i++){const x=-400-(i*79%2300),z=600-(i*131%3600),len=8+i%20;if(x<coastX(z)-15)seaStrokes.push(x,.6,z,x+len,.6,z);}
  this.world.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(seaStrokes,3)),new T.LineBasicMaterial({color:night?'#638196':'#b5d4cf',transparent:true,opacity:.26})));
  // Sparse cypress, orchards, and chalk boulders belong to the relief rather than a floating diorama.
  const treeGeo=new T.ConeGeometry(3,13,5),trunkGeo=new T.CylinderGeometry(.6,.9,5,4);const trees=new T.InstancedMesh(treeGeo,this.mat(night?'#243c3d':'#566b44'),220);const trunks=new T.InstancedMesh(trunkGeo,this.mat('#846b48'),220);let count=0;const dummy=new T.Object3D();
  for(let i=0;i<420&&count<220;i++){const x=-280+(i*83%1500),z=420-(i*157%2400);if(x<coastX(z)+40||Math.hypot(x-l.landing.x,z-l.landing.z)<l.landing.r+30||l.desert&&i%4)continue;const y=terrainHeight(l,x,z);if(y>250||l.rainShadow&&x>150&&i%4!==0)continue;dummy.position.set(x,y+7,z);dummy.scale.setScalar(.65+(i%7)*.12);dummy.updateMatrix();trees.setMatrixAt(count,dummy.matrix);dummy.position.y=y+2;dummy.updateMatrix();trunks.setMatrixAt(count,dummy.matrix);count++;}trees.count=count;trunks.count=count;this.world.add(trees,trunks);
  for(let i=0;i<24;i++){
   const x=430+(i*173%1300),z=100-(i*217%2600),y=terrainHeight(l,x,z);const b=this.mesh(new T.BoxGeometry(11,8,13),night?'#b5a27d':'#e2cfa7',x,y+4,z);this.world.add(b);const roof=this.mesh(new T.ConeGeometry(10,4,4),'#a56c4c',x,y+10,z);roof.rotation.y=Math.PI/4;this.world.add(roof);if(night){const glow=new T.Mesh(new T.PlaneGeometry(3,2),new T.MeshBasicMaterial({color:'#ffe2a0',side:T.DoubleSide}));glow.position.set(x,y+5,z+6.6);this.world.add(glow);}
  }
  l.gates.forEach((g,i)=>{const group=new T.Group();for(const dx of [-g.r,g.r]){group.add(this.mesh(new T.CylinderGeometry(.6,.8,24,5),'#f1e6c5',dx,-12,0));const fabric=this.mesh(new T.PlaneGeometry(14,18),i?'#e3b45e':'#ecce88',dx+7,-4,0);(fabric.material as T.MeshStandardMaterial).side=T.DoubleSide;group.add(fabric);}group.position.set(g.x,g.y,g.z);this.flags.push(group);this.world.add(group);});
  const lp=l.landing;const runway=this.mesh(new T.PlaneGeometry(72,lp.r*2.1),'#749174',lp.x,24.5,lp.z);runway.rotation.x=-Math.PI/2;this.world.add(runway);
  const lineMat=new T.LineBasicMaterial({color:night?'#ffe0a1':'#f9eccc'});for(const x of [-36,36]){const pts=[new T.Vector3(lp.x+x,25.2,lp.z-lp.r),new T.Vector3(lp.x+x,25.2,lp.z+lp.r)];this.world.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),lineMat));}
  for(let i=0;i<8;i++){const dash=this.mesh(new T.PlaneGeometry(2.3,9),'#f5e3bd',lp.x,25.3,lp.z-lp.r+i*lp.r/4);dash.rotation.x=-Math.PI/2;this.world.add(dash);}
  for(const dx of [-45,45]){const pole=this.mesh(new T.CylinderGeometry(.7,.7,22,5),'#ede0bb',lp.x+dx,35,lp.z);this.world.add(pole);const sock=this.mesh(new T.ConeGeometry(3.4,14,8),'#df9350',lp.x+dx+6,45,lp.z);sock.name='windsock';sock.userData={originX:lp.x+dx,originZ:lp.z};this.world.add(sock);}
  const random=(n:number)=>{const t=Math.sin(n*127.1+311.7)*43758.5453;return t-Math.floor(t);};
  for(let i=0;i<15;i++){
   const c=new T.Group();for(let j=0;j<5;j++){const cloud=this.mesh(new T.IcosahedronGeometry(1,2),night?'#65788b':'#f1eee0',j*27,Math.sin(j*2)*8,Math.cos(j)*16);cloud.scale.set(39,16+j%2*7,24);c.add(cloud);}c.position.set(-1300+random(i+3)*3300,560+random(i+19)*260,500-random(i+43)*3700);this.clouds.push(c);this.world.add(c);
  }
  // Merge the static cloud lobes: one cloud draw call keeps software/GPU rendering responsive.
  const cloudGeometries:T.BufferGeometry[]=[];
  for(const cloud of this.clouds){cloud.updateMatrixWorld(true);cloud.traverse(o=>{if(o instanceof T.Mesh){cloudGeometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));o.geometry.dispose();(o.material as T.Material).dispose();}});this.world.remove(cloud);}
  const cloudField=new T.Mesh(mergeGeometries(cloudGeometries),new T.MeshStandardMaterial({color:night?'#617b91':'#f7f2e5',emissive:night?'#071322':'#b3bfba',emissiveIntensity:night?.08:.25,roughness:1}));
  cloudField.name='cloud-field';this.world.add(cloudField);this.clouds=[];
  const orb=this.mesh(new T.SphereGeometry(night?48:30,24,16),night?'#fff1cf':'#fff3c9',-1300,780,-2400);orb.material=new T.MeshBasicMaterial({color:night?'#fff1cf':'#fff3c9',fog:false});this.world.add(orb);
  l.patches.forEach(p=>{const leaves=new T.Group();for(let i=0;i<12;i++){const leaf=this.mesh(new T.PlaneGeometry(2,1),'#e9bd69');leaf.userData={angle:i*2.4,base:i*13};leaves.add(leaf);}leaves.position.set(p.x,0,p.z);leaves.userData={patch:p};this.hints.add(leaves);});this.world.add(this.hints);
  if(l.shadow){const sh=this.mesh(new T.CircleGeometry(l.shadow.r,45),'#393e3b',l.shadow.x,0,l.shadow.z);sh.rotation.x=-Math.PI/2;sh.scale.set(1,1,1);sh.material=new T.MeshBasicMaterial({color:'#364441',transparent:true,opacity:.21,depthWrite:false});sh.name='shadow';this.world.add(sh);}
  this.trail.geometry.dispose();this.trail.geometry=new T.BufferGeometry();this.ghost.visible=false;
 }
 setGhost(trace:{x:number;y:number;z:number}[]){this.ghost.geometry.dispose();this.ghost.geometry=new T.BufferGeometry().setFromPoints(trace.map(p=>new T.Vector3(p.x,p.y,p.z)));this.ghost.computeLineDistances();this.ghost.visible=trace.length>2;}
 resize(){const w=this.canvas.clientWidth,h=this.canvas.clientHeight;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
 draw(s:FlightState,dt:number,hint:boolean){
  const l=this.level;this.plane.position.set(s.x,s.y,s.z);this.plane.rotation.set(s.pitch*.16,-s.heading,-s.bank,'YXZ');
  const setback=29*Math.max(1,.85/this.camera.aspect);
  const behind=new T.Vector3(-Math.sin(s.heading)*setback,11*Math.min(1.6,setback/29),Math.cos(s.heading)*setback);const desired=new T.Vector3(s.x,s.y,s.z).add(behind);
  if(s.time<.1||dt===0)this.camera.position.copy(desired);else this.camera.position.lerp(desired,1-Math.exp(-dt*5));
  this.camera.up.set(this.reduced?0:Math.sin(s.bank)*.06,1,0);this.camera.lookAt(s.x+Math.sin(s.heading)*100,s.y-8,-Math.cos(s.heading)*100+s.z);
  this.flags.forEach((g,i)=>{g.visible=i>=s.gate;g.children.forEach(c=>{if(c instanceof T.Mesh&&c.geometry instanceof T.PlaneGeometry)c.rotation.y=Math.sin(s.time*2+i)*.1;});});
  const currentAir=airAt(l,s.x,s.y,s.z,s.time);
  const cloudField=this.world.getObjectByName('cloud-field');if(cloudField){cloudField.position.x+=currentAir.windX*dt*.4;cloudField.position.z+=currentAir.windZ*dt*.4;}
  this.world.children.filter(o=>o.name==='windsock').forEach(sock=>{const d=new T.Vector3(currentAir.windX,0,currentAir.windZ).normalize();if(d.lengthSq()>.1){sock.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d);sock.position.set(sock.userData.originX+d.x*6,45,sock.userData.originZ+d.z*6);}});
  for(const group of this.hints.children){const p=group.userData.patch;const lift=airAt(l,p.x,100,p.z,s.time).thermal;group.visible=lift>1&&(l.overlay||hint);for(const [i,leaf]of group.children.entries()){const a=i*2.4+s.time*.65;const y=((i*13+s.time*8)%250)+terrainHeight(l,p.x,p.z);leaf.position.set(Math.cos(a)* (20+i%6*5),y,Math.sin(a)*(20+i%6*5));leaf.rotation.set(a,0,a*.4);}}
  const shadow=this.world.getObjectByName('shadow');if(shadow&&l.shadow){shadow.position.x=l.shadow.x+l.shadow.speed*s.time;shadow.position.y=terrainHeight(l,shadow.position.x,shadow.position.z)+1;}
  if(s.trace.length>1){this.trail.geometry.dispose();this.trail.geometry=new T.BufferGeometry().setFromPoints(s.trace.slice(-50).map(p=>new T.Vector3(p.x,p.y,p.z)));}
  this.renderer.render(this.scene,this.camera);this.frames++;const now=performance.now();if(now-this.sample>1500){this.fps=Math.round(this.frames*1000/(now-this.sample));this.frames=0;this.sample=now;}
 }
 project(x:number,y:number,z:number){v.set(x,y,z).project(this.camera);return {x:(v.x*.5+.5)*this.canvas.clientWidth,y:(-.5*v.y+.5)*this.canvas.clientHeight,visible:v.z<1&&Math.abs(v.x)<1&&Math.abs(v.y)<1};}
}
