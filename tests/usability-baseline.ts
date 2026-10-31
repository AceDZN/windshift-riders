import {chromium} from 'playwright';
import fs from 'node:fs';
const out='tests/captures/usability-v1';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const context=await browser.newContext({viewport:{width:1280,height:720}});const p=await context.newPage();
const report:any={method:'Naive scripted controls without the old numerical pilot, no hints, no state mutation',observations:[],errors:[]};p.on('pageerror',e=>report.errors.push(String(e)));
const read=async()=>JSON.parse(await p.evaluate(()=>(window as any).render_game_to_text()));const advance=async(ms:number)=>p.evaluate(t=>(window as any).advanceTime(t),ms);
try{
 await p.goto('http://localhost:4301/?level=1',{waitUntil:'networkidle'});await advance(0);await p.locator('#start-btn').click();
 await advance(12000);report.observations.push({action:'Launch, no input for12s',state:await read()});await p.screenshot({path:`${out}/stage1-12s-neutral.png`});
 await advance(18000);report.observations.push({action:'Continue neutral to30s, try following the initial straight view',state:await read(),targetText:await p.locator('#target-label').textContent()});await p.screenshot({path:`${out}/stage1-30s-overflight.png`});
 await p.keyboard.press('r');const beforeUp=await read();await p.keyboard.down('ArrowUp');await advance(1000);await p.keyboard.up('ArrowUp');report.observations.push({action:'Naively pressUp to climb for1s',before:beforeUp,after:await read()});
 await p.keyboard.press('r');await p.keyboard.down('ArrowRight');await advance(500);await p.keyboard.up('ArrowRight');const release=await read();await advance(1000);report.observations.push({action:'Right for.5s thenrelease1s',release,afterRelease:await read()});
 await p.keyboard.press('r');await p.mouse.move(600,350);await p.mouse.down();await p.mouse.move(690,350);await advance(1000);const drag=await read();await advance(1000);report.observations.push({action:'Drag90pxright, holdpointerstillforanother1s',drag,afterHold:await read()});await p.mouse.up();await p.screenshot({path:`${out}/stage1-drag-overturn.png`});
}finally{fs.writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();}
