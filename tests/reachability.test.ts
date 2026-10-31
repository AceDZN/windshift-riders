import test from 'node:test';
import assert from 'node:assert/strict';
import { levels } from '../src/levels.ts';
import {createState,step} from '../src/sim.ts';
import {pilot,directPilot,newPilot} from './pilot.ts';

for(const l of levels)test(`stage ${l.id}: valid bank/pitch/brake route from authored launch reaches a real landing`,()=>{
 const s=createState(l);s.mode='flying';const memory=newPilot();
 for(let i=0;i<60*240&&s.mode==='flying';i++){
  const input=pilot(s,l,memory);
  assert.ok(input.bank>=-1&&input.bank<=1&&input.pitch>=-1&&input.pitch<=1);
  step(s,l,input,1/60);
 }
 assert.equal(s.mode,'landed',JSON.stringify({gate:s.gate,time:s.time,position:[s.x,s.y,s.z],memory}));
 assert.equal(s.gate,l.gates.length);
 assert.ok(s.time<240);
 assert.ok(s.decision,'environmental route evidence should be physically accumulated');
});

test('a high thermal gate cannot be brute-forced after rising-air support is removed',()=>{
 const l={...structuredClone(levels[4]),patches:[],wind:{x:0,z:0},ridge:false};
 const s=createState(l);s.mode='flying';const memory=newPilot();
 for(let i=0;i<60*240&&s.mode==='flying';i++)step(s,l,pilot(s,l,memory),1/60);
 assert.notEqual(s.mode,'landed');
 assert.equal(s.gate,0);
 assert.equal(s.decision,false);
});


test('stage 23 has distinct fast-direct and higher-supported routes under the same fields',()=>{
 const l=levels[22];
 const results=[pilot,directPilot].map(controller=>{
  const s=createState(l);s.mode='flying';const memory=newPilot();
  for(let i=0;i<60*240&&s.mode==='flying';i++)step(s,l,controller(s,l,memory),1/60);
  const pathLength=s.trace.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-s.trace[i].x,p.z-s.trace[i].z),0);
  return {state:s,pathLength};
 });
 const [supported,direct]=results;
 for(const r of results){assert.equal(r.state.mode,'landed');assert.equal(r.state.gate,l.gates.length);}
 assert.ok(supported.state.maxY>direct.state.maxY+80,'supported route must actually build a larger height reserve');
 assert.ok(direct.state.time<supported.state.time-10,'direct route must be meaningfully faster');
 assert.ok(direct.pathLength<supported.pathLength-300,'the witnesses must have different trajectories');
 assert.equal(direct.state.decision,false,'a fast finish alone must not claim a lift decision');
 assert.equal(supported.state.decision,true);
});
