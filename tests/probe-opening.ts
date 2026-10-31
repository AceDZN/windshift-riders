import {levels} from '../src/levels.ts';
import {createState,step} from '../src/sim.ts';
import {arcadeInput,landingGuidance,beginLanding,updateLandingPhase} from '../src/controls.ts';
for(const id of [1,2]){
 const l=levels[id-1],s=createState(l);s.mode='flying';const gates:number[]=[];let guided=false;
 for(let i=0;i<60*120&&s.mode==='flying';i++){
  const before=s.gate;
  if(!guided&&s.gate===l.gates.length&&Math.hypot(s.x-l.landing.x,s.z-l.landing.z)<520){guided=true;beginLanding(s,l);}
  if(guided)updateLandingPhase(s,l);
  const input=guided?landingGuidance(s,l):arcadeInput(s,{bank:id===2&&s.time<.2?-1:0,pitch:0,brake:false});
  step(s,l,input,1/60);if(s.gate!==before)gates.push(s.time);
 }
 console.log(JSON.stringify({id,mode:s.mode,time:s.time,gates,gate:s.gate,y:s.y,x:s.x,z:s.z,speed:s.speed,score:s.score,controlPenalty:s.controlPenalty}));
}
