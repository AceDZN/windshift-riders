import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {levels} from '../src/levels.ts';
import {runtimePilot,newPilot} from './pilot.ts';
import {turnMetrics} from './flight-metrics.ts';
import type {FlightState} from '../src/sim.ts';
const out='tests/captures/flight-feel-browser';fs.mkdirSync(out,{recursive:true});
const report:any={method:'Actual keyboard dive/release/brake at native frame cadence, then actual pointer course inputs and normal landing assistance. No flight transforms or outcomes injected.',controlTrace:[],approaches:[],errors:[]};
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});const context=await browser.newContext({viewport:{width:1280,height:720}});const p=await context.newPage();
p.on('pageerror',e=>report.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const degrees=(n:number)=>n*180/Math.PI,angle=(n:number)=>Math.atan2(Math.sin(n),Math.cos(n));
const read=async()=>JSON.parse(await p.evaluate(()=>(window as any).render_game_to_text()));const advance=async(ms:number)=>p.evaluate(t=>(window as any).advanceTime(t),ms);
const offset=(n:number)=>n===0?0:140*(n*.91+Math.sign(n)*.09);
async function nativeSamples(label:string,n:number){for(let i=0;i<n;i++){await p.waitForTimeout(100);const d=await read();report.controlTrace.push({label,time:d.time,vy:d.player.verticalSpeed,speed:d.player.speed,airPathDegrees:degrees(d.airPathAngle),visualDegrees:degrees(d.presentation.pitchRadians),poseErrorDegrees:degrees(d.presentation.pitchRadians-d.airPathAngle)});}}
try{
 // Leave normal RAF timing active for control-feel and presentation checks.
 await p.goto('http://localhost:5301/?level=1',{waitUntil:'networkidle'});await p.locator('.forecast summary').click();await p.locator('#auto-land').uncheck();await p.locator('#start-btn').click();await nativeSamples('neutral',5);
 await p.keyboard.down('ArrowDown');await nativeSamples('heldDown',30);
 await p.screenshot({path:`${out}/held-down.png`});await p.keyboard.up('ArrowDown');await nativeSamples('released',20);await p.screenshot({path:`${out}/released.png`});
 await p.keyboard.down('Space');await nativeSamples('brake',15);await p.keyboard.up('Space');await nativeSamples('brakeReleased',10);
 const held=report.controlTrace.filter((r:any)=>r.label==='heldDown').slice(-10);assert.ok(held.every((r:any)=>r.airPathDegrees>=-14&&r.airPathDegrees<=-4));assert.ok(held.every((r:any)=>Math.abs(r.poseErrorDegrees)<3));
 let peakObservedAcceleration=0;for(let i=1;i<report.controlTrace.length;i++){const a=report.controlTrace[i-1],b=report.controlTrace[i];if(b.time>a.time)peakObservedAcceleration=Math.max(peakObservedAcceleration,Math.abs((b.vy-a.vy)/(b.time-a.time)));}assert.ok(peakObservedAcceleration<=12);report.peakObservedAcceleration=peakObservedAcceleration;
 // Each guided approach begins only after its authored physical passages.
 for(const id of [1,3,19]){
  await p.goto(`http://localhost:5301/?level=${id}`,{waitUntil:'networkidle'});await advance(0);await p.locator('#start-btn').click();
  const memory=newPilot();let d=await read(),pressed=false,braking=false,guided=false,start=0,turn=0,minSpeed=Infinity,peakSink=0;const trace:any[]=[];let priorHeading=d.player.heading;const captured=new Set<string>();let planActivationCallMs=0;const ordinaryCalls:number[]=[];
  for(let i=0;i<2100&&d.mode==='flying';i++){
   if(d.landingMode==='off'&&id!==1){const s={...d.player,vy:d.player.verticalSpeed,time:d.time,gate:d.gate,mode:d.mode} as FlightState;const input=runtimePilot(s,levels[id-1],memory);if(!pressed){await p.mouse.move(600,320);await p.mouse.down();pressed=true;}await p.mouse.move(600+offset(input.bank),320-offset(input.pitch));if(input.brake!==braking){await p.keyboard[input.brake?'down':'up']('Space');braking=input.brake;}}
   else if(pressed){await p.mouse.up();pressed=false;if(braking){await p.keyboard.up('Space');braking=false;}}
   const callStart=Date.now();await advance(200);const callMs=Date.now()-callStart;d=await read();
   if(!guided&&d.landingMode!=='off')planActivationCallMs=callMs;else if(!guided)ordinaryCalls.push(callMs);
   if(d.landingMode!=='off'){if(!guided){guided=true;start=d.time;}turn+=Math.abs(angle(d.player.heading-priorHeading));minSpeed=Math.min(minSpeed,d.player.speed);peakSink=Math.min(peakSink,d.player.verticalSpeed);trace.push({time:d.time,player:d.player,leg:d.landingLeg,plan:d.landingPlan,airPathAngle:d.airPathAngle,presentation:d.presentation});if(!captured.has(d.landingLeg)){await p.screenshot({path:`${out}/level-${id}-${d.landingLeg}.png`});captured.add(d.landingLeg);}}
   priorHeading=d.player.heading;
  }
  if(pressed)await p.mouse.up();if(braking)await p.keyboard.up('Space');
  const metrics=turnMetrics(trace.map(t=>t.player.heading));
  const groundHeading=Math.atan2(Math.sin(d.player.heading)*d.player.speed+d.air.windX,Math.cos(d.player.heading)*d.player.speed-d.air.windZ);
  const ordinaryMedian=ordinaryCalls.length?[...ordinaryCalls].sort((a,b)=>a-b)[Math.floor(ordinaryCalls.length/2)]:0;
  const summary={id,planActivationCallMs,ordinaryAdvanceMedianMs:ordinaryMedian,estimatedPlanningOverheadMs:Math.max(0,planActivationCallMs-ordinaryMedian),mode:d.mode,time:d.time,guideSeconds:d.time-start,totalTurnDegrees:degrees(turn),maxContinuousTurnDegrees:degrees(metrics.maxContinuous),minSpeed,peakSink,touchdown:d.player,plannedHeadingErrorDegrees:d.landingPlan?degrees(angle(d.player.heading-d.landingPlan.heading)):undefined,groundTrackErrorDegrees:d.landingPlan?degrees(angle(groundHeading-d.landingPlan.heading)):undefined,presentation:d.presentation,trace};report.approaches.push(summary);fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await p.screenshot({path:`${out}/level-${id}-result.png`});
  console.log(JSON.stringify({id,mode:d.mode,time:d.time,planActivationCallMs,ordinaryAdvanceMedianMs:ordinaryMedian,minSpeed,touchdownVy:d.player.verticalSpeed,maxContinuousTurnDegrees:degrees(metrics.maxContinuous)}));
  assert.equal(d.mode,'landed',`stage${id}`);assert.ok(d.player.verticalSpeed>=-2.5&&d.player.verticalSpeed<=1);assert.ok(minSpeed>=17);assert.ok(Math.abs(degrees(d.player.bank))<=7);assert.ok(degrees(metrics.maxContinuous)<220);assert.ok(Math.abs(summary.groundTrackErrorDegrees!)<=25);
 }
 assert.equal(report.errors.length,0,report.errors.join('\n'));report.complete=true;
}finally{fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
