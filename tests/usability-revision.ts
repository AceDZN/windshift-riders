import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out='tests/captures/usability-v2';fs.mkdirSync(out,{recursive:true});
const report:any={method:'Naive opening controls, no numerical route pilot, no hints or flight-state injection. This tests accessibility and clarity, not human enjoyment.',opening:[],controls:[],errors:[]};
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'});const p=await context.newPage();
p.on('pageerror',e=>report.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const read=async()=>JSON.parse(await p.evaluate(()=>(window as any).render_game_to_text()));const advance=async(ms:number)=>p.evaluate(t=>(window as any).advanceTime(t),ms);
async function ready(id:number){await p.goto(`http://localhost:5301/?level=${id}`,{waitUntil:'networkidle'});await advance(0);await p.waitForFunction(()=>JSON.parse((window as any).render_game_to_text()).modelLoaded);await p.locator('#start-btn').click();}
try{
 for(const id of [1,2]){
  await ready(id);if(id===2){await p.keyboard.down('ArrowLeft');await advance(200);await p.keyboard.up('ArrowLeft');}
  const goals:any[]=[];let prior=0,approach=false,data=await read();
  for(let i=0;i<120&&data.mode==='flying';i++){
   await advance(500);data=await read();
   if(data.gate>prior){goals.push({time:data.time,count:data.gate,feedback:await p.locator('#feedback').textContent(),objective:data.objective});prior=data.gate;await p.screenshot({path:`${out}/level-${id}-goal-${data.gate}.png`});}
   if(!approach&&data.landingMode!=='off'){approach=true;assert.equal(data.gate,data.gates.length);assert.equal(await p.locator('#manual-landing').isVisible(),true);await p.screenshot({path:`${out}/level-${id}-approach.png`});}
  }
  assert.equal(data.mode,'landed',`opening${id} should finish with no pitch/brake precision`);assert.equal(data.usedHint,false);assert.ok(approach);assert.ok(goals[0].time<6);assert.ok(goals.every(g=>g.feedback.length>0));
  await p.screenshot({path:`${out}/level-${id}-result.png`});
  report.opening.push({id,controls:id===1?'Launch, no input':'One .2s Left tap, then release',goals,approachVisible:approach,mode:data.mode,time:data.time,medals:data.medals,firstRun:data.progress[id]?.firstRun});
  fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));console.log(`naive stage${id}: ${data.mode} ${data.time}s`);
 }
 await ready(1);const initial=await read();await p.keyboard.down('ArrowUp');await advance(1000);await p.keyboard.up('ArrowUp');let data=await read();assert.ok(data.player.y>initial.player.y);report.controls.push({check:'actual Up key climbs',pass:true,deltaY:data.player.y-initial.player.y});
 await p.keyboard.press('r');await p.mouse.move(600,350);await p.mouse.down();await p.mouse.move(600,250);await advance(1000);data=await read();assert.ok(data.input.pitch>0);assert.ok(data.player.y>150);await p.mouse.up();await advance(500);assert.ok(Math.abs((await read()).player.bank)<.02);report.controls.push({check:'drag upward climbs and release recentres',pass:true});
 await p.keyboard.press('r');await p.keyboard.down('ArrowRight');await advance(500);await p.keyboard.up('ArrowRight');const released=await read();await advance(1000);const settled=await read();assert.ok(Math.abs(settled.player.bank)<.02);assert.ok(Math.abs(settled.player.heading-released.player.heading)<.08);report.controls.push({check:'half-second turn releases without large continued yaw',pass:true,releaseHeading:released.player.heading,settledHeading:settled.player.heading});
 await p.keyboard.press('r');for(let i=0;i<45&&(await read()).landingMode==='off';i++)await advance(500);assert.notEqual((await read()).landingMode,'off');await p.locator('#manual-landing').click();assert.equal((await read()).landingMode,'off');assert.equal((await read()).autoLandingEnabled,false);report.controls.push({check:'visible manual-landing override cancels assistance',pass:true});
 await p.keyboard.press('r');await p.keyboard.down('ArrowRight');await p.keyboard.down('ArrowDown');await p.keyboard.down('Space');for(let i=0;i<120&&(await read()).mode==='flying';i++)await advance(500);await p.keyboard.up('ArrowRight');await p.keyboard.up('ArrowDown');await p.keyboard.up('Space');assert.equal((await read()).mode,'short');await p.screenshot({path:`${out}/safe-failure.png`});await p.keyboard.press('r');assert.equal((await read()).mode,'flying');assert.ok((await read()).time<.1);report.controls.push({check:'obvious mistake produces safe failure and R immediate retry',pass:true});
 assert.equal(report.errors.length,0,report.errors.join('\n'));report.complete=true;
}finally{fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
