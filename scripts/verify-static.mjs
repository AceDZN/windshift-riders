import {chromium} from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
 const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[],urls=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 page.on('request',r=>urls.push(r.url()));
 await page.goto('http://localhost:4301',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>JSON.parse(window.render_game_to_text()).modelLoaded);
 await page.waitForTimeout(2500);
 const before=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
 await page.click('#mute');assert.match(await page.textContent('#mute'),/כבוי/);
 await page.keyboard.press('Enter');await context.setOffline(true);
 await page.evaluate(()=>window.advanceTime(1000));
 const after=JSON.parse(await page.evaluate(()=>window.render_game_to_text()));
 assert.equal(after.mode,'flying');assert.ok(after.time>=1);assert.equal(after.modelLoaded,true);assert.equal(errors.length,0);
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>({name:r.name,transferSize:r.transferSize,encodedBodySize:r.encodedBodySize})));
 const report={staticBuild:true,offlineAfterLoad:true,modelLoaded:true,mute:true,measuredReadyFps:before.fps,viewport:{width:1440,height:900},renderer:'Chromium Metal on this Mac',resourceTransferBytes:resources.reduce((s,r)=>s+r.transferSize,0),externalRequests:urls.filter(u=>/^https?:/.test(u)&&!u.startsWith('http://localhost:4301/')),errors,resources};
 assert.equal(report.externalRequests.length,0);
 fs.mkdirSync('docs/captures',{recursive:true});fs.writeFileSync('docs/captures/static-build-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
