import {levels} from '../src/levels.ts';
import {createState,step} from '../src/sim.ts';
import {arcadeInput,landingGuidance} from '../src/controls.ts';
import {runtimePilot,newPilot} from './pilot.ts';
for(const l of levels){
 const s=createState(l);s.mode='flying';const m=newPilot();let guided=false;
 for(let i=0;i<60*240&&s.mode==='flying';i++){
  guided ||= s.gate===l.gates.length&&Math.hypot(s.x-l.landing.x,s.z-l.landing.z)<520;
  step(s,l,guided?landingGuidance(s,l):arcadeInput(s,runtimePilot(s,l,m)),1/60);
 }
 console.log(JSON.stringify({id:l.id,mode:s.mode,time:+s.time.toFixed(2),gate:s.gate,of:l.gates.length,x:Math.round(s.x),y:Math.round(s.y),z:Math.round(s.z),decision:s.decision}));
}
