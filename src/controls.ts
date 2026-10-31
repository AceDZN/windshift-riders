import {airAt,clamp,terrainHeight,type FlightState,type Input} from './sim';
import type {Level} from './levels';
const angle=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
/** Player intent is screen-relative: positive pitch means UP on every device. */
export function arcadeInput(s:FlightState,intent:Input):Input{
 const reserve=clamp((s.speed-17)/7,0,1);
 return {bank:clamp(intent.bank,-1,1)*.74,pitch:clamp(intent.pitch,-1,1)*(intent.pitch>0?.62*reserve:.55),brake:intent.brake};
}
/** A visible landing assistant uses ordinary bank/pitch/brake, never moves the plane directly. */
export function landingGuidance(s:FlightState,l:Level):Input{
 const dx=l.landing.x-s.x,dz=l.landing.z-s.z,d=Math.hypot(dx,dz)||1;
 const air=airAt(l,s.x,s.y,s.z,s.time);
 const desired=Math.atan2(dx/d*s.speed-air.windX,-(dz/d*s.speed-air.windZ));
 let bank=clamp(angle(desired-s.heading)*2.8-s.bank*.5,-1,1);
 const ground=terrainHeight(l,l.landing.x,l.landing.z),height=s.y-ground-4;
 const agl=s.y-terrainHeight(l,s.x,s.z);
 let terrainAhead=terrainHeight(l,s.x,s.z);
 for(let t=.05;t<=1;t+=.05)terrainAhead=Math.max(terrainAhead,terrainHeight(l,s.x+dx*t,s.z+dz*t));
 let targetVy=-clamp(height/Math.max(2,d/Math.max(18,s.speed)),.8,10);
 if(d>l.landing.r*.64)targetVy=Math.max(targetVy,(terrainAhead+32-s.y)/3);
 // If arriving high, use a small holding turn inside the broad safe meadow.
 if(d<l.landing.r*.6&&height>16){const theta=Math.atan2(s.z-l.landing.z,s.x-l.landing.x),tx=l.landing.x+22*Math.cos(theta+1.1),tz=l.landing.z+22*Math.sin(theta+1.1);const orbitHeading=Math.atan2(tx-s.x,-(tz-s.z));bank=clamp(angle(orbitHeading-s.heading)*3-s.bank*.5,-1,1);targetVy=-9;}
 const brake=d<l.landing.r*.85||s.speed>30;
 const bankLoss=1.2*Math.abs(s.bank)**2;
 const sink=1.2+bankLoss+(s.speed<18?(18-s.speed)*.5:0)+(brake?5.5:0);
 const regulationCost=Math.max(0,(28-s.speed)*.18)*s.speed/9.81;
 let pitch=clamp((targetVy-air.lift+sink+regulationCost)/(Math.max(16,s.speed)*5.5/9.81),-.7,.6);
 if(agl<9&&d<l.landing.r){pitch=0;bank*=.3;}
 return {bank,pitch,brake};
}
