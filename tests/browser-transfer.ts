import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {levels} from '../src/levels.ts';
import {runtimePilot,newPilot} from './pilot.ts';
import type {FlightState} from '../src/sim.ts';
const out='tests/captures/usability-v2';fs.mkdirSync(out,{recursive:true});
const report:any={method:'Technical final-stage transfer witness through actual pointer controls and default arcadeInput/landing assistance; not a naive-play or fun claim.',errors:[],checks:[]};
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1280,height:720},reducedMotion:'reduce'});const p=await context.newPage();
p.on('pageerror',e=>report.errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
const read=async(page=p)=>JSON.parse(await page.evaluate(()=>(window as any).render_game_to_text()));const advance=async(ms:number,page=p)=>page.evaluate(t=>(window as any).advanceTime(t),ms);
const offset=(n:number)=>n===0?0:140*(n*.91+Math.sign(n)*.09);
try{
 await p.goto('http://localhost:5301/?level=24',{waitUntil:'networkidle'});await advance(0);await p.waitForFunction(()=>JSON.parse((window as any).render_game_to_text()).modelLoaded);await p.locator('#start-btn').click();
 await p.mouse.move(600,320);await p.mouse.down();let pressed=true,braking=false,data=await read();const memory=newPilot();let captured=false;
 for(let i=0;i<2100&&data.mode==='flying';i++){
  if(data.landingMode==='off'){
   const s={...data.player,vy:data.player.verticalSpeed,time:data.time,gate:data.gate,mode:data.mode} as FlightState;
   const input=runtimePilot(s,levels[23],memory);
   if(!pressed){await p.mouse.move(600,320);await p.mouse.down();pressed=true;}
   await p.mouse.move(600+offset(input.bank),320-offset(input.pitch));
   if(input.brake!==braking){await p.keyboard[input.brake?'down':'up']('Space');braking=input.brake;}
  }else if(pressed){await p.mouse.up();pressed=false;if(braking){await p.keyboard.up('Space');braking=false;}}
  await advance(200);data=await read();
  if(!captured&&data.gate===1){await p.screenshot({path:`${out}/level-24-physical-pass.png`});captured=true;}
 }
 if(pressed)await p.mouse.up();if(braking)await p.keyboard.up('Space');
 assert.equal(data.mode,'landed');assert.equal(data.gate,2);assert.equal(data.usedHint,false);assert.equal(data.overlay,false);assert.ok(data.landingHelpUsed);await p.screenshot({path:`${out}/level-24-result.png`});report.finalStage={mode:data.mode,time:data.time,gate:data.gate,medals:data.medals,cleanPasses:data.cleanPasses,landingHelpUsed:data.landingHelpUsed};
 // The joystick uses the same UP convention on a narrow touch screen.
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const t=await mobile.newPage();
 await t.goto('http://localhost:5301/?level=1',{waitUntil:'networkidle'});await advance(0,t);await t.locator('#start-btn').tap();const touchInitial=(await read(t)).player.y;const box=await t.locator('#stick').boundingBox();assert.ok(box);
 const cdp=await mobile.newCDPSession(t),x=box!.x+box!.width/2,y=box!.y+box!.height/2;
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+15,y:y-30}]});await advance(1000,t);const touch=await read(t);assert.ok(touch.input.pitch>0);assert.ok(touch.player.y>touchInitial);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await advance(500,t);assert.ok(Math.abs((await read(t)).player.bank)<.02);
 await t.screenshot({path:`${out}/touch-up-climb.png`});report.checks.push({check:'actual touch UP climbs and release levels bank at390x844',pass:true});await mobile.close();
 assert.equal(report.errors.length,0,report.errors.join('\n'));report.complete=true;
}finally{fs.writeFileSync(`${out}/transfer-report.json`,JSON.stringify(report,null,2));await browser.close();}
