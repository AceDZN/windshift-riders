import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../src/levels.ts';
import {createState,step,medals} from '../src/sim.ts';
import {arcadeInput,landingGuidance} from '../src/controls.ts';

// These are accessibility and physical regressions, not evidence that people find the game fun.
for(const id of [1,2])test(`opening stage${id} needs no pitch/brake precision before a valid assisted approach`,()=>{
 const l=levels[id-1],s=createState(l);s.mode='flying';let firstGoalTime=Infinity;
 for(let i=0;i<60*60&&s.mode==='flying';i++){
  const before=s.gate;
  const input=s.gate===l.gates.length?landingGuidance(s,l):arcadeInput(s,{bank:id===2&&s.time<.2?-1:0,pitch:0,brake:false});
  step(s,l,input,1/60);
  if(before===0&&s.gate===1)firstGoalTime=s.time;
 }
 assert.ok(firstGoalTime<6,'the first visible success should arrive promptly');
 assert.equal(s.gate,l.gates.length);
 assert.equal(s.mode,'landed');
 assert.ok(s.time<45,'the opening cannot require an unexplained long landing orbit');
 assert.ok(s.controlPenalty<8,'the default opening should retain an attainable control medal');
 assert.equal(medals(s).control,true,'at least one centred pass makes the opening control medal attainable');
});

test('UP player intent climbs at cruising speed and consumes airspeed',()=>{
 const l={...structuredClone(levels[0]),patches:[],hills:[],wind:{x:0,z:0}};
 const s=createState(l);Object.assign(s,{mode:'flying',x:0,y:350,z:0});
 const initial=s.y;
 for(let i=0;i<60;i++)step(s,l,arcadeInput(s,{bank:0,pitch:1,brake:false}),1/60);
 assert.ok(s.y>initial,'UP must raise the flight path when energy is available');
 assert.ok(s.speed<28);
});

test('climb intent at low airspeed cannot demand a stall-producing pull-up',()=>{
 const s=createState(levels[0]);s.speed=14;
 const input=arcadeInput(s,{bank:0,pitch:1,brake:false});
 assert.equal(input.pitch,0);
 assert.ok(Object.values(input).every(x=>typeof x==='boolean'||Number.isFinite(x)));
});

test('release recentres bank quickly and limits delayed turning',()=>{
 const l={...structuredClone(levels[0]),patches:[],hills:[],wind:{x:0,z:0}};
 const s=createState(l);Object.assign(s,{mode:'flying',y:350});
 for(let i=0;i<30;i++)step(s,l,arcadeInput(s,{bank:1,pitch:0,brake:false}),1/60);
 const heading=s.heading;
 for(let i=0;i<30;i++)step(s,l,arcadeInput(s,{bank:0,pitch:0,brake:false}),1/60);
 assert.ok(Math.abs(s.bank)<.02);
 assert.ok(Math.abs(s.heading-heading)<.08,'released controls should not add another large turn');
});

test('landing guidance returns ordinary finite inputs without teleporting or changing state',()=>{
 const l=levels[0],s=createState(l);Object.assign(s,{gate:l.gates.length,x:80,y:160,z:-420});
 const snapshot=JSON.stringify(s);const input=landingGuidance(s,l);
 assert.equal(JSON.stringify(s),snapshot);
 assert.ok(Number.isFinite(input.bank)&&Number.isFinite(input.pitch));
 assert.ok(Math.abs(input.bank)<=1&&Math.abs(input.pitch)<=1);
});

test('already-visited course progress does not earn points just for airborne time',()=>{
 const l={...structuredClone(levels[0]),patches:[],hills:[],wind:{x:0,z:0},gates:[{x:0,y:100,z:-1000,r:20}]};
 const s=createState(l);Object.assign(s,{mode:'flying',x:0,y:350,z:0,bestDistance:0});
 for(let i=0;i<180;i++)step(s,l,{bank:0,pitch:0,brake:false},1/60);
 assert.equal(s.score,0);
});

test('crossing a course goal creates explicit feedback and combo reward',()=>{
 const l={...structuredClone(levels[0]),patches:[],hills:[],wind:{x:0,z:0},launch:{x:0,y:200,z:.2,heading:0},gates:[{x:0,y:200,z:0,r:60}]};
 const s=createState(l);s.mode='flying';step(s,l,{bank:0,pitch:0,brake:false},1/60);
 assert.equal(s.gate,1);assert.ok(s.gateFlash>0);assert.ok(s.rewardText.length>0);assert.ok(s.combo>1);assert.ok(s.score>=750);
});

test('a nearby goal volume does not award success before crossing the visible plane',()=>{
 const l={...structuredClone(levels[0]),patches:[],hills:[],wind:{x:0,z:0},launch:{x:0,y:200,z:20,heading:0},gates:[{x:0,y:200,z:0,r:60}]};
 const s=createState(l);s.mode='flying';step(s,l,{bank:0,pitch:0,brake:false},1/60);
 assert.equal(s.gate,0,'being inside the former radius volume is not a passage crossing');
 assert.equal(s.cleanPasses,0);assert.equal(s.gateFlash,0);
});

test('visible-plane crossing distinguishes a perfect centre pass, an edge pass and a miss',()=>{
 const l={...structuredClone(levels[0]),patches:[],hills:[],wind:{x:0,z:0},launch:{x:0,y:200,z:20,heading:0},gates:[{x:0,y:200,z:0,r:60}]};
 const results=[0,50,70].map(x=>{
  const s=createState(l);Object.assign(s,{mode:'flying',x});
  for(let i=0;i<60;i++)step(s,l,{bank:0,pitch:0,brake:false},1/60);
  return s;
 });
 assert.equal(results[0].gate,1);assert.equal(results[0].cleanPasses,1);
 assert.equal(results[1].gate,1);assert.equal(results[1].cleanPasses,0);
 assert.equal(results[2].gate,0);assert.equal(results[2].cleanPasses,0);
 assert.ok(results[0].score>results[1].score);
});

test('a missed passage can be crossed from the reverse side for a forgiving retry',()=>{
 const l={...structuredClone(levels[0]),patches:[],hills:[],wind:{x:0,z:0},launch:{x:0,y:200,z:20,heading:0},gates:[{x:0,y:200,z:0,r:60}]};
 const s=createState(l);Object.assign(s,{mode:'flying',z:-10,heading:Math.PI});
 for(let i=0;i<30;i++)step(s,l,{bank:0,pitch:0,brake:false},1/60);
 assert.equal(s.gate,1);
});

test('assisted approach cannot manufacture an environmental decision from its own climb',()=>{
 const l={...structuredClone(levels[4]),hills:[],ridge:false,wind:{x:0,z:0},patches:[{x:0,z:0,r:180,sun:1,moisture:.05,capacity:1,color:'#bd956b',label:'יבש'}]};
 const s=createState(l);Object.assign(s,{mode:'flying',x:0,y:120,z:0,landingPhase:'approach'});
 for(let i=0;i<120;i++)step(s,l,{bank:0,pitch:0,brake:false},1/60);
 assert.ok(s.y>120,'the same physical thermal still affects flight');
 assert.equal(s.liftTime,0);assert.equal(s.liftGain,0);assert.equal(s.decision,false);
});
