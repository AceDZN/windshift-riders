import test from 'node:test';
import assert from 'node:assert/strict';
import {levels} from '../src/levels.ts';
import {createState,step,airAt} from '../src/sim.ts';
import {arcadeInput,beginLanding,updateLandingPhase,landingGuidance} from '../src/controls.ts';
import {runtimePilot,newPilot} from './pilot.ts';
import {turnMetrics} from './flight-metrics.ts';

function stillAir(){return {...structuredClone(levels[0]),hills:[],patches:[],ridge:false,wind:{x:0,z:0},launch:{x:0,y:900,z:0,heading:0}};}
const degrees=(r:number)=>r*180/Math.PI;

test('held Down has a bounded repeatable air-relative glide angle instead of accelerating into a fall',()=>{
 const l=stillAir(),s=createState(l);s.mode='flying';const lateAngles:number[]=[];let maxAcceleration=0;
 for(let i=0;i<60*12;i++){
  const down=i>=120;const before=s.vy;
  step(s,l,arcadeInput(s,{bank:0,pitch:down?-1:0,brake:false}),1/60);
  if(down)maxAcceleration=Math.max(maxAcceleration,Math.abs(s.vy-before)*60);
  if(i>=60*7){const a=airAt(l,s.x,s.y,s.z,s.time);lateAngles.push(degrees(Math.atan2(s.vy-a.lift,s.speed)));}
 }
 assert.ok(Math.min(...lateAngles)>=-14,'continuous Down must not grow into a steep vertical fall');
 assert.ok(Math.max(...lateAngles)<-4,'Down should still produce an obvious dive');
 assert.ok(Math.max(...lateAngles)-Math.min(...lateAngles)<2,'the same held input should settle to one path angle');
 assert.ok(maxAcceleration<=10,`input onset vertical acceleration ${maxAcceleration.toFixed(2)}m/s²`);
});

test('releasing a long dive and toggling the brake do not create abrupt vertical-velocity jumps',()=>{
 const l=stillAir(),s=createState(l);s.mode='flying';let maxReleaseAcceleration=0,maxBrakeAcceleration=0;
 for(let i=0;i<60*18;i++){
  const down=i>=120&&i<60*10,brake=i>=60*13&&i<60*15;const before=s.vy;
  step(s,l,arcadeInput(s,{bank:0,pitch:down?-1:0,brake}),1/60);
  const acceleration=Math.abs(s.vy-before)*60;
  if(i>=60*10&&i<60*13)maxReleaseAcceleration=Math.max(maxReleaseAcceleration,acceleration);
  if(i>=60*13)maxBrakeAcceleration=Math.max(maxBrakeAcceleration,acceleration);
 }
 assert.ok(maxReleaseAcceleration<=10,`release acceleration ${maxReleaseAcceleration.toFixed(2)}m/s²`);
 assert.ok(maxBrakeAcceleration<=10,`brake acceleration ${maxBrakeAcceleration.toFixed(2)}m/s²`);
});

// Approaches are driven from the authored launch. Planning helpers may set approach metadata;
// every physical position, velocity and landing outcome still comes from step().
const wrapped=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
for(const id of [1,3,19])test(`stage${id} default approach settles gently without a braking spiral`,()=>{
 const l=levels[id-1],s=createState(l);s.mode='flying';const memory=newPilot();let guided=false,turn=0,guideStart=0,minSpeed=Infinity;const headings:number[]=[];
 for(let i=0;i<60*240&&s.mode==='flying';i++){
  if(!guided&&s.gate===l.gates.length&&Math.hypot(s.x-l.landing.x,s.z-l.landing.z)<520){guided=true;guideStart=s.time;beginLanding(s,l);}
  if(guided)updateLandingPhase(s,l);
  const heading=s.heading,input=guided?landingGuidance(s,l):arcadeInput(s,id===1?{bank:0,pitch:0,brake:false}:runtimePilot(s,l,memory));
  step(s,l,input,1/60);if(guided){turn+=Math.abs(wrapped(s.heading-heading));minSpeed=Math.min(minSpeed,s.speed);headings.push(s.heading);}
 }
 const metrics=turnMetrics(headings),wind=airAt(l,s.x,s.y,s.z,s.time);
 const groundHeading=Math.atan2(Math.sin(s.heading)*s.speed+wind.windX,Math.cos(s.heading)*s.speed-wind.windZ);
 const alignment=s.landingPlan?degrees(wrapped(groundHeading-s.landingPlan.heading)):Infinity;
 const diagnostic=JSON.stringify({mode:s.mode,time:s.time,guideSeconds:s.time-guideStart,groundHeadingError:alignment,turn:degrees(turn),maxContinuousTurn:degrees(metrics.maxContinuous),minSpeed,x:s.x,y:s.y,z:s.z,vy:s.vy,speed:s.speed,bank:degrees(s.bank),leg:s.landingLeg,plan:s.landingPlan});
 assert.equal(s.mode,'landed',diagnostic);
 assert.ok(s.vy>=-2.5&&s.vy<=1,`touchdown vertical speed: ${diagnostic}`);
 assert.ok(s.speed>=17&&minSpeed>=17,`approach must not be a stall: ${diagnostic}`);
 assert.ok(Math.abs(degrees(s.bank))<=7,`touchdown wings should be nearly level: ${diagnostic}`);
 assert.ok(degrees(metrics.maxContinuous)<220,`a continuous holding spiral is not a final approach: ${diagnostic}`);
 assert.ok(s.landingPlan&&Math.abs(alignment)<=25,`ground track should match the chosen final leg, including crosswind crab: ${diagnostic}`);
});

test('landing setup and phase updates change only planning metadata, never flight transforms',()=>{
 const l=levels[0],s=createState(l);s.mode='flying';s.gate=l.gates.length;
 const physical=()=>[s.x,s.y,s.z,s.heading,s.bank,s.speed,s.vy,s.airVy,s.brake,s.time,s.mode,s.gate,s.score];
 const before=physical();beginLanding(s,l);updateLandingPhase(s,l);
 assert.deepEqual(physical(),before);assert.ok(s.landingPlan);
});
