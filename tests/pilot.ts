import type { Level } from '../src/levels.ts';
import type { FlightState, Input } from '../src/sim.ts';
import { airAt, terrainHeight, clamp } from '../src/sim.ts';

const angle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
export type PilotMemory={anchor?:{x:number;z:number}; stage:number; phase:string; detour?:number};
export function newPilot():PilotMemory{return {stage:-1,phase:'route'};}
function steer(s:FlightState,l:Level,x:number,z:number):number {
  const dx=x-s.x,dz=z-s.z,d=Math.hypot(dx,dz)||1;
  const air=airAt(l,s.x,s.y,s.z,s.time);
  const desired=Math.atan2(dx/d*s.speed-air.windX,-(dz/d*s.speed-air.windZ));
  return clamp(angle(desired-s.heading)*2.6-s.bank*.45,-1,1);
}
function findLift(s:FlightState,l:Level,g:{x:number;y:number;z:number}) {
  let best={x:s.x,z:s.z},value=-Infinity;
  // Sample the physical environment. No level-id answer table or position writes.
  for(let x=-300;x<=650;x+=35)for(let z=Math.min(80,s.z+100);z>=g.z+70;z-=35){
    const dist=Math.hypot(x-s.x,z-s.z);
    const terrain=terrainHeight(l,x,z);
    if(dist>600||terrain>s.y-25)continue;
    const lift=airAt(l,x,Math.max(s.y,terrain+50),z,s.time).lift;
    const v=lift-dist*.007-Math.max(0,terrain+45-s.y)*.04;
    if(v>value){value=v;best={x,z};}
  }
  return best;
}
export function pilot(s:FlightState,l:Level,m:PilotMemory):Input {
  const g=l.gates[s.gate];
  let target={x:g?.x??l.landing.x,z:g?.z??l.landing.z};
  let pitch=0,brake=false;
  if(g){
    const remaining=Math.hypot(g.x-s.x,g.z-s.z);
    let pathGround=0;
    for(let t=.1;t<=1;t+=.1)pathGround=Math.max(pathGround,terrainHeight(l,s.x+(g.x-s.x)*t,s.z+(g.z-s.z)*t));
    const safeY=Math.max(g.y+g.r*.55,pathGround+35);
    const required=safeY+remaining*.04;
    if(m.stage!==s.gate){m.stage=s.gate;m.anchor=undefined;m.phase='route';}
    if(l.decision==='track'||s.y>=required)m.phase='depart';
    if(s.y<required&&m.phase!=='depart'){
      if(!m.anchor)m.anchor=findLift(s,l,g);
      const a=m.anchor; const d=Math.hypot(a.x-s.x,a.z-s.z);
      m.phase='climb';
      if(d>110)target=a;
      else{
        const theta=Math.atan2(s.z-a.z,s.x-a.x);
        target={x:a.x+65*Math.cos(theta+.85),z:a.z+65*Math.sin(theta+.85)};
      }
      
    }
    if(m.phase==='depart'||s.y>=required){
      const slope=(safeY-s.y)/Math.max(1,remaining);
      pitch=clamp(slope*5,-.7,.5);
    }
  }else{
    const d=Math.hypot(s.x-target.x,s.z-target.z);
    const ground=terrainHeight(l,target.x,target.z);
    const dy=s.y-(ground+7);
    let pathGround=ground;
    for(let t=.1;t<=1;t+=.1)pathGround=Math.max(pathGround,terrainHeight(l,s.x+(target.x-s.x)*t,s.z+(target.z-s.z)*t));
    if(d<l.landing.r*.65&&dy>7){
      const theta=Math.atan2(s.z-target.z,s.x-target.x);
      target={x:target.x+28*Math.cos(theta+1.05),z:target.z+28*Math.sin(theta+1.05)};
      m.phase='descend';pitch=0;brake=true;
    }else{
      m.phase='land';
      const reserve=s.y-pathGround;
      pitch=reserve<28?.55:dy>30?-.1:0;
      brake=d<l.landing.r*.85;
    }

  }
  if(l.windShift&&s.gate===1&&s.time>l.windShift.at-5){
    const h=l.hills[0];
    const points=[{x:h.x-h.rx*2,z:h.z+h.rz*1.65},{x:h.x+h.rx*1.65,z:h.z+h.rz*1.65},{x:h.x+h.rx,z:h.z-40}];
    m.detour??=0;
    const p=points[m.detour];
    if(p){
      target=p;pitch=0;brake=false;m.phase='wind-shift alternate';
      if(Math.hypot(s.x-p.x,s.z-p.z)<70)m.detour++;
    }
  }
  return {bank:steer(s,l,target.x,target.z),pitch,brake};
}
