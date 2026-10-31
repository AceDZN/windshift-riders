import { levels } from '../src/levels.ts';
import {createState,step,terrainHeight} from '../src/sim.ts';
import {pilot,newPilot} from './pilot.ts';
for(const l of levels){
 const s=createState(l);s.mode='flying';const m=newPilot();
 for(let i=0;i<60*240&&s.mode==='flying';i++)step(s,l,pilot(s,l,m),1/60);
 console.log(JSON.stringify({id:l.id,mode:s.mode,time:+s.time.toFixed(1),gate:s.gate,of:l.gates.length,x:Math.round(s.x),z:Math.round(s.z),y:Math.round(s.y),agl:Math.round(s.y-terrainHeight(l,s.x,s.z)),speed:Math.round(s.speed),phase:m.phase,anchor:m.anchor,decision:s.decision}));
}
