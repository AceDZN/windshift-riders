import test from 'node:test';
import assert from 'node:assert/strict';
import { levels } from '../src/levels.ts';
import { createState, step, airAt, terrainHeight, medals } from '../src/sim.ts';

const still = () => ({ ...structuredClone(levels[0]), hills: [], patches: [], wind: { x: 0, z: 0 }, shadow: undefined, sunset: false, windShift: undefined, ridge: false });
const energy = (s: { y: number; speed: number }) => s.y + s.speed * s.speed / (2 * 9.81);

function start(level: (typeof levels)[number], x = 0, y = 350, z = 0) {
  const s = createState(level);
  Object.assign(s, { mode: 'flying', x, y, z });
  return s;
}

test('campaign contains exactly 24 distinct authored decisions and geometry', () => {
  assert.equal(levels.length, 24);
  assert.deepEqual(levels.map(l => l.id), Array.from({length:24}, (_,i) => i + 1));
  assert.equal(new Set(levels.map(l => l.name)).size, 24);
  const geometry = levels.map(l => JSON.stringify([l.launch,l.landing,l.gates,l.hills,l.patches,l.wind]));
  assert.equal(new Set(geometry).size, 24, 'levels may not be one course with a new label');
});

test('still-air flight cannot create height-equivalent energy under any control', () => {
  const l = still();
  for (const pitch of [-1, 0, 1]) for (const bank of [-1, 0, 1]) {
    const s = start(l);
    const initial = energy(s);
    for (let i = 0; i < 180; i++) step(s,l,{bank,pitch,brake:false},1/60);
    assert.ok(energy(s) < initial + 1e-6, `energy grew at bank=${bank}, pitch=${pitch}`);
    assert.ok([s.x,s.y,s.z,s.speed,s.heading,s.bank].every(Number.isFinite));
  }
});

test('horizontal wind changes ground track, not airspeed', () => {
  const calm = still();
  const windy = { ...structuredClone(calm), wind: { x: 8, z: -3 } };
  const a=start(calm), b=start(windy);
  for (let i=0; i<60; i++) {
    step(a,calm,{bank:0,pitch:0,brake:false},1/60);
    step(b,windy,{bank:0,pitch:0,brake:false},1/60);
  }
  assert.ok(Math.abs(a.speed-b.speed)<1e-8);
  assert.ok(Math.abs((b.x-a.x)-8)<0.1);
  assert.ok(Math.abs((b.z-a.z)+3)<0.1);
});

test('banking incurs more height loss than straight glide at the same airspeed input', () => {
  const l=still(); const straight=start(l), turn=start(l);
  for(let i=0;i<120;i++) {
    step(straight,l,{bank:0,pitch:0,brake:false},1/60);
    step(turn,l,{bank:1,pitch:0,brake:false},1/60);
  }
  assert.ok(energy(turn)<energy(straight));
});

test('pause and terminal outcomes do not advance flight time or position', () => {
  const l=still();
  for (const mode of ['ready','paused','landed','short'] as const) {
    const s=start(l); s.mode=mode;
    const before=JSON.stringify(s);
    step(s,l,{bank:1,pitch:1,brake:true},1);
    assert.equal(JSON.stringify(s),before,mode);
  }
});

test('equal-color surfaces have different lift when moisture differs', () => {
  const l=still();
  const dry={x:0,z:0,r:120,sun:1,moisture:0.05,capacity:1,color:'#bd956b',label:'יבש'};
  const wet={...dry,moisture:0.95,label:'רטוב'};
  const a=airAt({...l,patches:[dry]},0,80,0,0);
  const b=airAt({...l,patches:[wet]},0,80,0,0);
  assert.ok(a.lift>b.lift+1,'surface color must not be the thermal answer');
});

test('sun exposure changes a patch lift without changing its color or scoring fields', () => {
  const l=still();
  const p={x:0,z:0,r:120,sun:1,moisture:0.05,capacity:1,color:'#bd956b',label:'משטח'};
  const lit=airAt({...l,patches:[p]},0,80,0,0);
  const shaded=airAt({...l,patches:[{...p,sun:0.1}]},0,80,0,0);
  assert.ok(lit.lift>shaded.lift+1);
});

test('wind reversal swaps the useful side of a ridge through the physical field', () => {
  const l={...still(),hills:[{x:0,z:0,height:140,rx:160,rz:400}],ridge:true,wind:{x:8,z:0}};
  const reverse={...structuredClone(l),wind:{x:-8,z:0}};
  const westY=terrainHeight(l,-100,0)+30, eastY=terrainHeight(l,100,0)+30;
  const west=airAt(l,-100,westY,0,0).lift, east=airAt(l,100,eastY,0,0).lift;
  const reverseWest=airAt(reverse,-100,westY,0,0).lift, reverseEast=airAt(reverse,100,eastY,0,0).lift;
  assert.ok(west>east,'west-origin wind should support west-facing slope');
  assert.ok(reverseEast>reverseWest,'reversed wind should support the other slope');
  assert.ok(west>0 && reverseEast>0);
});

test('night and transfer courses keep instruments while removing default lift overlays', () => {
  for (const id of [12,21,24]) assert.equal(levels[id-1].overlay,false,`stage${id}`);
  assert.ok(levels[13].night,'stage14 must actually represent night');
});

test('airbrake dissipates speed and height instead of creating a balloon climb', () => {
 const l=still();const s=start(l),y=s.y,speed=s.speed;
 for(let i=0;i<60;i++)step(s,l,{bank:0,pitch:0,brake:true},1/60);
 assert.ok(s.y<y,'a neutral airbrake in still air cannot lift the glider');
 assert.ok(s.speed<speed);
});

test('a dive trades height for speed while a pull-up spends speed', () => {
 const l=still();const dive=start(l),pull=start(l);
 for(let i=0;i<120;i++){
  step(dive,l,{bank:0,pitch:-1,brake:false},1/60);
  step(pull,l,{bank:0,pitch:1,brake:false},1/60);
 }
 assert.ok(dive.speed>28&&dive.y<350);
 assert.ok(pull.speed<28&&pull.y>dive.y);
});

test('moving cloud shade weakens the physical thermal at the same ground patch', () => {
 const l=still();const p={x:0,z:0,r:140,sun:1,moisture:.05,capacity:1,color:'#bd956b',label:'משטח'};
 const clear={...l,patches:[p]},cloud={...l,patches:[p],shadow:{x:0,z:0,r:150,speed:1}};
 assert.ok(airAt(cloud,0,80,0,0).lift<airAt(clear,0,80,0,0).lift*.4);
 assert.ok(airAt(cloud,0,80,0,200).lift>airAt(cloud,0,80,0,0).lift);
});

test('sunset removes solar support and night has no solar thermal', () => {
 const p={x:0,z:0,r:140,sun:1,moisture:.05,capacity:1,color:'#bd956b',label:'משטח'};
 const sunset={...still(),patches:[p],sunset:true};
 assert.ok(airAt(sunset,0,80,0,0).lift>airAt(sunset,0,80,0,95).lift+5);
 assert.equal(airAt({...sunset,night:true},0,80,0,0).thermal,0);
});


test('landing requires the meadow, every course gate and a controlled speed', () => {
 const l=still();
 for(const variant of ['valid','missed-gate','outside','too-fast']){
  const x=l.landing.x+(variant==='outside'?l.landing.r+100:0),z=l.landing.z;
  const s=start(l,x,terrainHeight(l,x,z)+4.001,z);
  s.gate=variant==='missed-gate'?0:l.gates.length;
  s.speed=variant==='too-fast'?42:28;
  step(s,l,{bank:0,pitch:0,brake:false},1/60);
  assert.equal(s.mode,variant==='valid'?'landed':'short',variant);
 }
});

test('finish, control and environment medals remain independent of hint and assist', () => {
 const l=still();const s=start(l);s.mode='landed';s.decision=true;
 assert.deepEqual(medals(s),{finish:true,control:true,environment:true});
 s.usedHint=true;assert.deepEqual(medals(s),{finish:true,control:true,environment:false});
 s.usedHint=false;s.assist=true;assert.equal(medals(s).environment,false);
 s.assist=false;s.controlPenalty=20;assert.deepEqual(medals(s),{finish:true,control:false,environment:true});
});
