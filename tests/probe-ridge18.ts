import {levels} from '../src/levels.ts';
import {createState,step} from '../src/sim.ts';
import {arcadeInput,landingGuidance} from '../src/controls.ts';
import {directPilot,runtimePilot,newPilot} from './pilot.ts';
const l=levels[17];
for(const pitch of [0,.05,.1,.15,.2,.3,.4]){
 const s=createState(l);s.mode='flying';const m=newPilot();let first:any;
 for(let i=0;i<60*240&&s.mode==='flying';i++){
  const guided=s.gate===l.gates.length&&Math.hypot(s.x-l.landing.x,s.z-l.landing.z)<350;
  const intent=s.gate===0?{...directPilot(s,l,m),pitch}:runtimePilot(s,l,m);
  const prev=s.gate;step(s,l,guided?landingGuidance(s,l):arcadeInput(s,intent),1/60);
  if(prev===0&&s.gate===1)first={time:s.time,x:s.x,y:s.y,z:s.z,speed:s.speed};
 }
 console.log(JSON.stringify({pitch,mode:s.mode,time:s.time,gate:s.gate,first,pos:[s.x,s.y,s.z]}));
}
