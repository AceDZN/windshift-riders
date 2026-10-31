import {levels} from '../src/levels.ts';
import {createState,step} from '../src/sim.ts';
import {pilot,directPilot,newPilot} from './pilot.ts';
const l=levels[22];
for(const [name,controller] of [['supported',pilot],['direct',directPilot]] as const){
 const s=createState(l);s.mode='flying';const memory=newPilot();
 for(let i=0;i<60*240&&s.mode==='flying';i++)step(s,l,controller(s,l,memory),1/60);
 const distance=s.trace.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-s.trace[i].x,p.z-s.trace[i].z),0);
 console.log(JSON.stringify({name,mode:s.mode,time:s.time,gate:s.gate,maxY:s.maxY,score:s.score,pathLength:distance,decision:s.decision,position:[s.x,s.y,s.z],speed:s.speed,traceSamples:s.trace.length}));
}
