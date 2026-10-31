import { chromium, type Page } from 'playwright';
import fs from 'node:fs';
import { levels } from '../src/levels.ts';
import { pilot,newPilot } from './pilot.ts';
import type { FlightState } from '../src/sim.ts';
import assert from 'node:assert/strict';
const output='tests/captures/browser';fs.mkdirSync(output,{recursive:true});
const report:any={date:'2026-10-31',method:'Actual Playwright pointer/keyboard controls; advanceTime only steps time. No flight-state mutation.',routes:[],checks:[],errors:[]};
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'});
const page=await context.newPage();
page.on('pageerror',e=>report.errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const read=async(p=page)=>JSON.parse(await p.evaluate(()=>((window as any).render_game_to_text)()));
const advance=async(ms:number,p=page)=>p.evaluate(t=>(window as any).advanceTime(t),ms);
async function ready(id:number,p=page){
 await p.goto(`http://localhost:5301/?level=${id}`,{waitUntil:'networkidle'});
 await p.waitForFunction(()=>typeof (window as any).render_game_to_text==='function');
 await advance(0,p);
 await p.waitForFunction(()=>JSON.parse((window as any).render_game_to_text()).modelLoaded,{timeout:30000});
}
async function route(id:number){
 await ready(id);await page.locator('#start-btn').click();
 const memory=newPilot();let brake=false,captured=false;
 await page.mouse.move(600,320);await page.mouse.down();
 let data=await read();
 for(let i=0;i<2400&&data.mode==='flying';i++){
  const s={...data.player,vy:data.player.verticalSpeed,mode:data.mode,time:data.time,gate:data.gate} as FlightState;
  const input=pilot(s,levels[id-1],memory);
  await page.mouse.move(600+input.bank*90,320+input.pitch*100);
  if(input.brake!==brake){await page.keyboard[input.brake?'down':'up']('Space');brake=input.brake;}
  await advance(100);data=await read();
  if(!captured&&data.time>Math.min(20,levels[id-1].par/3)){
   await page.screenshot({path:`${output}/level-${id}-flight.png`});captured=true;
  }
 }
 await page.mouse.up();if(brake)await page.keyboard.up('Space');
 await page.screenshot({path:`${output}/level-${id}-result.png`});
 fs.writeFileSync(`${output}/level-${id}-state.json`,JSON.stringify(data,null,2));
 report.routes.push({id,mode:data.mode,time:data.time,gate:data.gate,medals:data.medals,usedHint:data.usedHint,modelLoaded:data.modelLoaded,wind:data.air,overlay:data.overlay});
 fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2));
 console.log(`browser stage${id}: ${data.mode}, ${data.time}s, gate${data.gate}`);
 assert.equal(data.mode,'landed',`stage${id} actual pointer route`);
}
try{
 for(const id of [1,8,11,12,14,24])await route(id);
 await page.reload({waitUntil:'networkidle'});await advance(0);
 assert.ok((await read()).progress['1'].medals.finish);
 report.checks.push({check:'local progress persisted after reload',pass:true});
 await ready(3);await page.locator('#start-btn').click();
 await page.keyboard.down('ArrowRight');await page.keyboard.down('ArrowUp');await page.keyboard.down('Space');
 for(let i=0;i<400&&(await read()).mode==='flying';i++)await advance(100);
 await page.keyboard.up('ArrowRight');await page.keyboard.up('ArrowUp');await page.keyboard.up('Space');
 assert.equal((await read()).mode,'short');await page.screenshot({path:`${output}/level-3-safe-short.png`});
 const retryStart=Date.now();await page.keyboard.press('r');const retried=await read();assert.equal(retried.mode,'flying');assert.ok(retried.time<.1);
 report.checks.push({check:'stage3 safe failure and R immediate retry',pass:true,retryWallMs:Date.now()-retryStart});
 await advance(1000);await page.screenshot({path:`${output}/level-3-retry-ghost.png`});
 await page.keyboard.press('Escape');const paused=await read();await advance(5000);const afterPause=await read();assert.deepEqual([afterPause.mode,afterPause.player,afterPause.time,afterPause.gate,afterPause.score],[paused.mode,paused.player,paused.time,paused.gate,paused.score]);
 await page.keyboard.press('Escape');assert.equal((await read()).mode,'flying');
 report.checks.push({check:'Escape pause freezes advanceTime; Escape resumes',pass:true});
 await page.keyboard.press('h');assert.equal((await read()).usedHint,true);report.checks.push({check:'H hint records aid',pass:true});
 await page.keyboard.press('r');assert.equal((await read()).usedHint,false);report.checks.push({check:'retry clears current-run hint state',pass:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:`${output}/mobile-resize.png`});
 assert.equal(await page.locator('canvas').count(),1);report.checks.push({check:'live resize preserves single-canvas flight',pass:true});
 // Real browser touch events in a separate mobile context.
 const touchContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const touch=await touchContext.newPage();await ready(1,touch);await touch.locator('#start-btn').tap();
 const stick=await touch.locator('#stick').boundingBox();assert.ok(stick);
 const cdp=await touchContext.newCDPSession(touch);const cx=stick!.x+stick!.width/2,cy=stick!.y+stick!.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx,y:cy}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx+55,y:cy-30}]});await advance(1000,touch);
 assert.ok((await read(touch)).player.bank>.1);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const brakeBox=await touch.locator('#brake').boundingBox();const beforeBrake=(await read(touch)).player.speed;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:brakeBox!.x+20,y:brakeBox!.y+20}]});await advance(1000,touch);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.ok((await read(touch)).player.speed<beforeBrake);
 await touch.locator('#retry-touch').tap();assert.ok((await read(touch)).time<.1);
 await touch.screenshot({path:`${output}/touch-controls.png`});
 report.checks.push({check:'mobile touch stick changes bank, held brake reduces speed, touch retry relaunches',pass:true});
 await touchContext.close();
 assert.equal(report.errors.length,0,report.errors.join('\n'));
 report.complete=true;
}finally{
 fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2));await browser.close();
}
