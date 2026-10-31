import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const out='tests/captures/flight-feel-browser';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const report:any={method:'Compare actual quick-finish button with the same watched fixed-step approach from the same launch. No flight-state injection.',errors:[]};
async function trial(skip:boolean){
 const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'});const p=await context.newPage();p.on('pageerror',e=>report.errors.push(String(e)));
 const read=async()=>JSON.parse(await p.evaluate(()=>(window as any).render_game_to_text()));const advance=async(ms:number)=>p.evaluate(t=>(window as any).advanceTime(t),ms);
 await p.goto('http://localhost:5301/?level=1',{waitUntil:'networkidle'});await advance(0);await p.locator('#start-btn').click();await advance(20000);const before=await read();assert.notEqual(before.landingMode,'off');assert.equal(before.gate,before.gates.length);
 if(skip){assert.ok(await p.locator('#finish-landing').isVisible());await p.locator('#finish-landing').click();await p.waitForFunction(()=>JSON.parse((window as any).render_game_to_text()).mode!=='flying',{timeout:10000});}
 else for(let i=0;i<240&&(await read()).mode==='flying';i++)await advance(1000);
 const result=await read();await p.screenshot({path:`${out}/quick-finish-${skip?'used':'watched'}.png`});await context.close();return result;
}
try{
 const skipped=await trial(true),watched=await trial(false);assert.equal(skipped.mode,'landed');assert.equal(watched.mode,'landed');assert.equal(skipped.landingSkipped,true);assert.equal(watched.landingSkipped,false);
 assert.ok(Math.abs(skipped.time-watched.time)<.01);assert.ok(Math.hypot(skipped.player.x-watched.player.x,skipped.player.y-watched.player.y,skipped.player.z-watched.player.z)<.05);assert.ok(Math.abs(skipped.player.verticalSpeed-watched.player.verticalSpeed)<.01);assert.equal(skipped.score,watched.score);assert.ok(skipped.player.verticalSpeed>=-2.5);
 assert.equal(skipped.progress['1'].firstRun.landingSkipped,true);report.skipped=skipped;report.watched=watched;report.complete=true;
}finally{fs.writeFileSync(`${out}/quick-finish-report.json`,JSON.stringify(report,null,2));await browser.close();}
