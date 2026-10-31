import test from 'node:test';
import assert from 'node:assert/strict';
import {levels,type Level} from '../src/levels.ts';
import {createState,step,type FlightState,type Input} from '../src/sim.ts';
import {arcadeInput,landingGuidance} from '../src/controls.ts';
import {runtimePilot,directPilot,newPilot,type PilotMemory} from './pilot.ts';

type Policy=(s:FlightState,l:Level,m:PilotMemory)=>Input;
function runDefault(l:Level,policy:Policy=runtimePilot){
 const s=createState(l);s.mode='flying';const memory=newPilot();let guided=false,decisionBeforeGuidance:boolean|undefined;
 for(let i=0;i<60*240&&s.mode==='flying';i++){
  if(!guided&&s.gate===l.gates.length&&Math.hypot(s.x-l.landing.x,s.z-l.landing.z)<520){guided=true;decisionBeforeGuidance=s.decision;}
  const input=guided?landingGuidance(s,l):arcadeInput(s,policy(s,l,memory));
  assert.ok(input.bank>=-1&&input.bank<=1&&input.pitch>=-1&&input.pitch<=1);
  step(s,l,input,1/60);
 }
 return {s,memory,guided,decisionBeforeGuidance};
}

for(const l of levels)test(`stage${l.id}: standard arcade intent and default landing inputs finish from the authored launch`,()=>{
 const {s,memory,guided,decisionBeforeGuidance}=runDefault(l);
 assert.equal(s.mode,'landed',JSON.stringify({gate:s.gate,time:s.time,position:[s.x,s.y,s.z],memory}));
 assert.equal(s.gate,l.gates.length);assert.ok(s.time<240);assert.ok(guided);
 assert.equal(decisionBeforeGuidance,true,'the environmental decision must precede landing assistance');
});

test('a high thermal gate cannot be brute-forced after rising-air support is removed',()=>{
 const l={...structuredClone(levels[4]),patches:[],wind:{x:0,z:0},ridge:false};
 const {s}=runDefault(l);
 assert.notEqual(s.mode,'landed');assert.equal(s.gate,0);assert.equal(s.decision,false);
});

test('stage23 has distinct fast-direct and higher-supported routes under the same default controls',()=>{
 const l=levels[22];
 const supported=runDefault(l),direct=runDefault(l,directPilot);
 const pathLength=(s:FlightState)=>s.trace.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p.x-s.trace[i].x,p.z-s.trace[i].z),0);
 for(const {s}of[supported,direct]){assert.equal(s.mode,'landed');assert.equal(s.gate,l.gates.length);}
 assert.ok(supported.s.maxY>direct.s.maxY+80,'the supported route must build a larger height reserve');
 assert.ok(direct.s.time<supported.s.time-10,'the direct route must be meaningfully faster');
 assert.ok(pathLength(direct.s)<pathLength(supported.s)-300,'the two routes must have different trajectories');
 assert.equal(direct.decisionBeforeGuidance,false,'a fast finish alone must not claim a lift decision');
 assert.equal(supported.decisionBeforeGuidance,true);
});
