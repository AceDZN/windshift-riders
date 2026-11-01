// The workbook bridge in a real embed: a localhost parent page with the game in an iframe at ?level=2.
// Flies course 2 to a landing with real keyboard input (one short Left tap, then the default landing help),
// and checks `ready` → `level-start` → `level-complete`, then that a standalone win posts nothing.
// advanceTime only steps game time; no flight state is written. Needs the dev server on :5301.
// Usage: node tests/host-embed.mjs   (BASE=http://host:port/path/ to test another build)
import { chromium } from 'playwright';
import { createServer } from 'node:http';

const GAME = process.env.BASE ?? 'http://localhost:5301/';
const LEVEL = 2;
const browser = await chromium.launch({ headless: true, args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
const errs = [];

async function flyCourse(page, frame) {
  await frame.waitForFunction(() => typeof window.render_game_to_text === 'function');
  await frame.evaluate(() => window.advanceTime(0));
  await frame.waitForFunction(() => JSON.parse(window.render_game_to_text()).modelLoaded, null, { timeout: 30000 });
  const opened = JSON.parse(await frame.evaluate(() => window.render_game_to_text()));
  await frame.locator('#start-btn').click();
  await page.keyboard.down('ArrowLeft');
  await frame.evaluate(() => window.advanceTime(200));
  await page.keyboard.up('ArrowLeft');
  let data = JSON.parse(await frame.evaluate(() => window.render_game_to_text()));
  for (let i = 0; i < 120 && data.mode === 'flying'; i++) {
    await frame.evaluate(() => window.advanceTime(500));
    data = JSON.parse(await frame.evaluate(() => window.render_game_to_text()));
  }
  return { opened, data };
}

// embedded
const parent = createServer((_, res) => {
  res.setHeader('content-type', 'text/html');
  res.end(`<body style="margin:0"><script>window.msgs=[];addEventListener('message',e=>msgs.push({origin:e.origin,...e.data}))</script><iframe id="g" src="${GAME}?level=${LEVEL}" style="width:100vw;height:100vh;border:0"></iframe></body>`);
}).listen(0);
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(`http://localhost:${parent.address().port}/`);
const frame = await (await page.waitForSelector('#g')).contentFrame();
const { opened, data } = await flyCourse(page, frame);
await page.waitForFunction(() => window.msgs.some((m) => m.type === 'level-complete'), null, { timeout: 5000 }).catch(() => {});
const msgs = await page.evaluate(() => window.msgs);
console.log('opened on level', opened.level, opened.mode, '| finished', data.mode, data.time + 's', 'medals', JSON.stringify(data.medals));
console.log(msgs.map((m) => `${m.type}${m.level ? ' L' + m.level : ''}${m.stars ? ' ★' + m.stars : ''}${m.durationMs ? ' ' + m.durationMs + 'ms' : ''}`).join(', '));
const types = msgs.map((m) => m.type);
const ok =
  opened.level === LEVEL && opened.mode === 'ready' && data.mode === 'landed' &&
  msgs.every((m) => m.source === 'workbook-game' && m.slug === 'windshift-riders' && m.version === 1) &&
  types[0] === 'ready' && types.filter((t) => t === 'ready').length === 1 &&
  msgs[1]?.type === 'level-start' && msgs[1].level === LEVEL &&
  msgs.filter((m) => m.type === 'level-complete').length === 1 &&
  msgs.at(-1).type === 'level-complete' && msgs.at(-1).level === LEVEL && msgs.at(-1).stars >= 1 && msgs.at(-1).durationMs > 0;

// standalone: the same win with no parent posts nothing
const solo = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
solo.on('pageerror', (e) => errs.push(String(e)));
await solo.addInitScript(() => { window.__posted = []; addEventListener('message', (e) => window.__posted.push(e.data)); });
await solo.goto(`${GAME}?level=${LEVEL}`);
const soloRun = await flyCourse(solo, solo.mainFrame());
const posted = await solo.evaluate(() => window.__posted);
console.log('standalone', soloRun.data.mode, '| posted', posted.length);
const soloOk = soloRun.data.mode === 'landed' && posted.length === 0;

console.log(ok && soloOk && !errs.length ? 'bridge OK' : 'bridge FAILED', errs);
await browser.close();
parent.close();
process.exit(ok && soloOk && !errs.length ? 0 : 1);
