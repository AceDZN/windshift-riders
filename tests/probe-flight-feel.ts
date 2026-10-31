import fs from 'node:fs';
import {levels} from '../src/levels.ts';
import {createState,step,airAt,terrainHeight} from '../src/sim.ts';
import {arcadeInput,landingGuidance,beginLanding,updateLandingPhase} from '../src/controls.ts';
import {runtimePilot,newPilot} from './pilot.ts';
import {turnMetrics} from './flight-metrics.ts';
const label=process.argv[2]||'flight-feel-baseline';const out=`tests/captures/${label}`;fs.mkdirSync(out,{recursive:true});
const deg=(n:number)=>n*180/Math.PI;const angle=(n:number)=>Math.atan2(Math.sin(n),Math.cos(n));
const l={...structuredClone(levels[0]),hills:[],patches:[],ridge:false,wind:{x:0,z:0},launch:{x:0,y:900,z:0,heading:0}};
const s=createState(l);s.mode='flying';const dive:any[]=[];let priorVy=0,maxAcceleration=0;
for(let i=0;i<60*18&&s.mode==='flying';i++){
 const intent={bank:0,pitch:s.time<2?0:s.time<14?-1:0,brake:false};const input=arcadeInput(s,intent);const oldVy=s.vy;
 step(s,l,input,1/60);maxAcceleration=Math.max(maxAcceleration,Math.abs(s.vy-oldVy)*60);
 if(i%6===0){const a=airAt(l,s.x,s.y,s.z,s.time);dive.push({time:+s.time.toFixed(3),intent:intent.pitch,input:input.pitch,y:s.y,speed:s.speed,vy:s.vy,pitch:s.pitch,airPathDegrees:deg(Math.atan2(s.vy-a.lift,s.speed)),legacyVisualDegrees:deg(s.pitch*.11),acceleration:(s.vy-oldVy)*60});}
 priorVy=s.vy;
}
const landing:any[]=[];
for(const id of (process.argv[3]||'1,3,19').split(',').map(Number)){
 const l=levels[id-1],s=createState(l);s.mode='flying';const memory=newPilot();let guide=false,start=0,turn=0,peakSink=0,maxBank=0,maxAcceleration=0,minSpeed=Infinity;const trace:any[]=[];
 for(let i=0;i<60*420&&s.mode==='flying';i++){
  if(!guide&&s.gate===l.gates.length&&Math.hypot(s.x-l.landing.x,s.z-l.landing.z)<520){guide=true;start=s.time;beginLanding(s,l);}
  const oldHeading=s.heading,oldVy=s.vy;const agl=s.y-terrainHeight(l,s.x,s.z);
  if(guide)updateLandingPhase(s,l);
  const input=guide?landingGuidance(s,l):arcadeInput(s,id===1?{bank:0,pitch:0,brake:false}:runtimePilot(s,l,memory));
  step(s,l,input,1/60);
  if(guide){turn+=Math.abs(angle(s.heading-oldHeading));peakSink=Math.min(peakSink,s.vy);maxBank=Math.max(maxBank,Math.abs(s.bank));maxAcceleration=Math.max(maxAcceleration,Math.abs(s.vy-oldVy)*60);minSpeed=Math.min(minSpeed,s.speed);
   if(i%6===0||s.mode!=='flying'){const a=airAt(l,s.x,s.y,s.z,s.time);trace.push({time:+s.time.toFixed(3),x:s.x,y:s.y,z:s.z,agl:s.y-terrainHeight(l,s.x,s.z),distance:Math.hypot(s.x-l.landing.x,s.z-l.landing.z),speed:s.speed,vy:s.vy,bank:s.bank,heading:s.heading,pitch:s.pitch,input,phase:s.landingPhase,airPathDegrees:deg(Math.atan2(s.vy-a.lift,s.speed)),legacyVisualDegrees:deg(s.pitch*.11),landingLeg:s.landingLeg,landingPlan:s.landingPlan});}
  }
 }
 const metrics=turnMetrics(trace.map(t=>t.heading));
 const wind=airAt(l,s.x,s.y,s.z,s.time),groundHeading=Math.atan2(Math.sin(s.heading)*s.speed+wind.windX,Math.cos(s.heading)*s.speed-wind.windZ);
 const g=l.gates.at(-1)!;const runway=Math.atan2(l.landing.x-g.x,-(l.landing.z-g.z));const summary={id,mode:s.mode,guideStart:start,guideSeconds:s.time-start,totalTurnDegrees:deg(turn),maxContinuousTurnDegrees:deg(metrics.maxContinuous),peakSink,maxBankDegrees:deg(maxBank),maxAcceleration,minSpeed,touchdown:{vy:s.vy,speed:s.speed,bankDegrees:deg(s.bank),headingErrorDegrees:deg(angle(s.heading-runway)),plannedHeadingErrorDegrees:s.landingPlan?deg(angle(s.heading-s.landingPlan.heading)):undefined,groundTrackErrorDegrees:s.landingPlan?deg(angle(groundHeading-s.landingPlan.heading)):undefined,distance:Math.hypot(s.x-l.landing.x,s.z-l.landing.z)}};
 landing.push({...summary,trace});console.log(JSON.stringify(summary));
}
fs.writeFileSync(`${out}/dive.json`,JSON.stringify({maxAcceleration,trace:dive},null,2));fs.writeFileSync(`${out}/landing.json`,JSON.stringify(landing,null,2));
for(const t of [2.017,2.517,3.017,5.017,10.017,14.017,14.117,14.517,15.017,16.017]){const sample=dive.reduce((a,b)=>Math.abs(b.time-t)<Math.abs(a.time-t)?b:a);console.log(JSON.stringify({diveSample:sample}));}
