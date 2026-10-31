import {airAt,clamp,terrainHeight,step,type FlightState,type Input,type LandingPlan} from './sim';
import type {Level} from './levels';
const angle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
/** Solve the existing energy controller for an air-relative vertical path. */
export function pitchForAirVy(s:FlightState,target:number):number{
 const sink=1.2+1.2*s.bank*s.bank+(s.speed<18?(18-s.speed)*.5:0);
 const trim=28-8*s.brake;
 const recovery=Math.max(0,(trim-s.speed)*.18)*s.speed/9.81;
 return clamp((target+sink+s.brake*1.8+recovery)*9.81/(Math.max(13,s.speed)*5.5),-1,1);
}
/** Screen-relative intent controls a bounded glide angle, not an ever-growing dive. */
export function arcadeInput(s:FlightState,intent:Input):Input{
 const reserve=clamp((s.speed-17)/7,0,1),p=clamp(intent.pitch,-1,1);
 const baseSink=1.2+1.2*s.bank*s.bank;
 const extra=p>0?p*Math.tan(9*Math.PI/180)*s.speed*reserve:p*Math.tan(10*Math.PI/180)*s.speed;
 const target=-baseSink-s.brake*1.8+extra;
 return {bank:clamp(intent.bank,-1,1)*.74,pitch:p===0||p>0&&reserve===0?0:pitchForAirVy(s,target),brake:intent.brake};
}
/** An extended approach is chosen once, before descent. No flight position is changed. */
export function planLanding(s:FlightState,l:Level):LandingPlan{
 const ground=terrainHeight(l,l.landing.x,l.landing.z),touch={x:l.landing.x,y:ground+4,z:l.landing.z};
 const dx=touch.x-s.x,dz=touch.z-s.z,d=Math.hypot(dx,dz)||1,nx=dx/d,nz=dz/d;
 const height=Math.max(0,s.y-touch.y),air=airAt(l,s.x,s.y,s.z,s.time),required=height/.17;
 const candidates:{plan:LandingPlan;cost:number}[]=[];
 const groundSpeed=(heading:number,speed:number)=>{const cross=air.windX*Math.cos(heading)+air.windZ*Math.sin(heading),tail=air.windX*Math.sin(heading)-air.windZ*Math.cos(heading);return Math.max(5,Math.sqrt(Math.max(25,speed*speed-cross*cross))+tail);};
 const add=(x:number,z:number,direct=false)=>{
  const firstHeading=Math.atan2(x-s.x,-(z-s.z)),heading=Math.atan2(touch.x-x,-(touch.z-z));
  const firstLength=Math.hypot(x-s.x,z-s.z),lastLength=Math.hypot(touch.x-x,touch.z-z);
  const firstTime=firstLength/groundSpeed(firstHeading,22),lastTime=lastLength/groundSpeed(heading,21);
  const blend=clamp((Math.hypot(air.windX,air.windZ)-4)/6,0,1),share=.62*(1-blend)+clamp(firstTime/(firstTime+lastTime),.15,.85)*blend;
  const entry={x,y:s.y-height*share,z},plan={entry,touch,heading,direct};let cost=0;
  const points=direct?[{x:s.x,y:s.y,z:s.z},touch]:[{x:s.x,y:s.y,z:s.z},entry,touch];
  for(let leg=0;leg<points.length-1;leg++)for(let t=0;t<=1;t+=.05){
   const a=points[leg],b=points[leg+1],px=a.x+(b.x-a.x)*t,pz=a.z+(b.z-a.z)*t,py=a.y+(b.y-a.y)*t;
   const clearance=py-terrainHeight(l,px,pz),nearTouch=Math.hypot(px-touch.x,pz-touch.z)<l.landing.r*.7;
   if(!nearTouch){cost+=Math.max(0,24-clearance)**2;cost+=Math.max(0,-airAt(l,px,py,pz,s.time).lift-1.5)**2*45;}
   cost+=Math.max(0,Math.abs(px)-1450)**2+Math.max(0,-2150-pz)**2+Math.max(0,pz-850)**2;
  }
  cost+=(Math.abs(angle(firstHeading-s.heading))+Math.abs(angle(heading-firstHeading)))*20+(firstLength+lastLength)*.025;
  candidates.push({plan,cost});
 };
 for(const sign of [-1,1]){
  let length=Math.max(d,required),offset=0,x=0,z=0;
  for(let i=0;i<3;i++){offset=Math.sqrt(Math.max(0,length*length-d*d))*.5;x=s.x+dx*.48-nz*offset*sign;z=s.z+dz*.48+nx*offset*sign;const h=Math.atan2(touch.x-x,-(touch.z-z));length=Math.max(d,required*Math.max(1,(21+air.windX*Math.sin(h)-air.windZ*Math.cos(h))/21));}
  add(x,z,offset<65);
 }
 // Alternative broad base legs keep a strong-wind approach on safe terrain.
 for(const scale of [.3,.5,.7])for(let i=0;i<12;i++){const h=i*Math.PI/6,r=Math.max(260,required*scale);add(touch.x+Math.sin(h)*r,touch.z-Math.cos(h)*r);}
 candidates.sort((a,b)=>a.cost-b.cost);
 if(s.gate===l.gates.length){
  // Check a short-list with the same deterministic physics; only local clones move.
  // The real aircraft still flies every step and can be overridden by the player.
  const fliesSafely=(plan:LandingPlan,dt:number)=>{
   const probe:FlightState={...s,mode:'flying',landingPlan:plan,landingLeg:plan.direct?'final':'setup',landingPhase:'approach',landingStartedAt:s.time,trace:[]};
   let minimumSpeed=Math.max(17.5,probe.speed);
   for(let i=0;i<Math.ceil(180/dt)&&probe.mode==='flying';i++){updateLandingPhase(probe,l);step(probe,l,landingGuidance(probe,l),dt);if(probe.time>s.time+3)minimumSpeed=Math.min(minimumSpeed,probe.speed);if(minimumSpeed<17.5)break;}
   return minimumSpeed>=17.5&&probe.mode==='landed'&&probe.vy>-2.5&&probe.speed>17&&Math.abs(probe.bank)<.14&&Math.hypot(probe.x-touch.x,probe.z-touch.z)<l.landing.r*.9;
  };
  for(const {plan}of candidates){if(fliesSafely(plan,.05)&&fliesSafely(plan,1/60))return plan;}
 }
 return candidates[0].plan;
}
export function beginLanding(s:FlightState,l:Level){
 s.landingPlan=planLanding(s,l);s.landingLeg=s.landingPlan.direct?'final':'setup';s.landingPhase='approach';s.landingStartedAt=s.time;
}
export function updateLandingPhase(s:FlightState,l:Level){
 if(!s.landingPlan)beginLanding(s,l);
 const p=s.landingPlan!;
 if(s.landingLeg==='setup'&&Math.hypot(s.x-p.entry.x,s.z-p.entry.z)<105)s.landingLeg='final';
 const agl=s.y-terrainHeight(l,s.x,s.z),d=Math.hypot(s.x-p.touch.x,s.z-p.touch.z);
 if(s.landingLeg!=='setup'&&d<l.landing.r*.9&&agl<8)s.landingLeg='flare';
 s.landingPhase=s.landingLeg==='flare'?'flare':'approach';
}
/** Wide setup, straight final and a real flare. All motion uses ordinary flight controls. */
export function landingGuidance(s:FlightState,l:Level):Input{
 const p=s.landingPlan??planLanding(s,l),leg=s.landingPlan?s.landingLeg:p.direct?'final':'setup';
 const target=leg==='setup'?p.entry:p.touch,dx=target.x-s.x,dz=target.z-s.z,d=Math.hypot(dx,dz)||1;
 const air=airAt(l,s.x,s.y,s.z,s.time),ground=terrainHeight(l,s.x,s.z),agl=s.y-ground;
 const nx=Math.sin(p.heading),nz=-Math.cos(p.heading);
 const along=(p.touch.x-s.x)*nx+(p.touch.z-s.z)*nz;
 const distanceToTouch=Math.hypot(s.x-p.touch.x,s.z-p.touch.z);
 let aimX=target.x,aimZ=target.z;
 if(leg!=='setup'){
  // Follow the runway line through touchdown, rather than turning back at its centre.
  aimX=p.touch.x-nx*Math.max(-120,along-150);
  aimZ=p.touch.z-nz*Math.max(-120,along-150);
 }
 const ax=aimX-s.x,az=aimZ-s.z,ad=Math.hypot(ax,az)||1;
 const desired=Math.atan2(ax/ad*s.speed-air.windX,-(az/ad*s.speed-air.windZ));
 let bank=clamp(angle(desired-s.heading)*1.7-s.bank*.7,-.58,.58);
 let targetVy:number;
 if(leg==='setup')targetVy=clamp((target.y-s.y)/Math.max(3,d/Math.max(5,(Math.sin(s.heading)*s.speed+air.windX)*dx/d+(-Math.cos(s.heading)*s.speed+air.windZ)*dz/d)),-4.4,2.2);
 else{
  const finalLength=Math.hypot(p.entry.x-p.touch.x,p.entry.z-p.touch.z)||1;
  const slope=clamp((p.entry.y-p.touch.y)/finalLength,.075,.18);
  const pathY=p.touch.y-6+Math.max(0,along-l.landing.r*.35)*slope;
  const alongSpeed=Math.max(10,(Math.sin(s.heading)*s.speed+air.windX)*nx+(-Math.cos(s.heading)*s.speed+air.windZ)*nz);
  targetVy=clamp(-alongSpeed*slope+(pathY-s.y)*.65,-4.4,2.2);
 }
 // Look only a short distance ahead. A global clearance floor would hold the
 // glider high above the whole meadow until it was too late to flare.
 let terrainAhead=ground;
 const horizon=Math.min(60,d),ux=ax/ad,uz=az/ad;
 for(let t=.2;t<=1;t+=.2){const x=s.x+ux*horizon*t,z=s.z+uz*horizon*t;terrainAhead=Math.max(terrainAhead,terrainHeight(l,x,z));}
 const margin=clamp((distanceToTouch-l.landing.r)/180,0,1)*14;
 if(distanceToTouch>l.landing.r*.85)targetVy=Math.max(targetVy,(terrainAhead+margin-s.y)/3);
 if(leg!=='flare'&&Math.abs(angle(desired-s.heading))>.65)targetVy=Math.max(targetVy,-1.3);
 let brake=s.speed>(leg==='setup'?22:20.5);
 if(leg!=='setup'&&distanceToTouch<l.landing.r*2&&Math.abs(angle(p.heading-s.heading))<.4)bank=clamp(bank,-.18,.18);
 if(leg==='flare'){
  bank=clamp(angle(desired-s.heading)*1.7-s.bank*.8,-.14,.14);
  targetVy=-clamp((agl-3)*.18,1.85,2.2);
  brake=false;
 }
 if(s.speed<22.5&&air.lift< -1)brake=false;
 const sinkLoss=1.2+1.2*s.bank*s.bank+s.brake*1.8;
 const availableClimb=(s.speed*s.speed-19.5*19.5)/(2*9.81*2)-sinkLoss;
 const airTarget=Math.min(clamp(targetVy-air.lift,-s.speed*.245,s.speed*.18),availableClimb);
 return {bank,pitch:pitchForAirVy(s,airTarget),brake};
}
