import {levels} from '../src/levels.ts';
import {createState,step} from '../src/sim.ts';
import {arcadeInput,landingGuidance,beginLanding,updateLandingPhase} from '../src/controls.ts';
import {runtimePilot,newPilot} from './pilot.ts';
for(const l of levels){
 const s=createState(l);s.mode='flying';const m=newPilot();let guided=false,planningMs=0;
 for(let i=0;i<60*420&&s.mode==='flying';i++){
  if(!guided&&s.gate===l.gates.length&&Math.hypot(s.x-l.landing.x,s.z-l.landing.z)<520){guided=true;const planningStart=performance.now();beginLanding(s,l);planningMs=performance.now()-planningStart;}
  if(guided)updateLandingPhase(s,l);
  step(s,l,guided?landingGuidance(s,l):arcadeInput(s,runtimePilot(s,l,m)),1/60);
 }
 console.log(JSON.stringify({id:l.id,planningMs:+planningMs.toFixed(2),mode:s.mode,time:+s.time.toFixed(2),gate:s.gate,of:l.gates.length,x:Math.round(s.x),y:Math.round(s.y),z:Math.round(s.z),decision:s.decision}));
}
