# רוכבי הרוח · Windshift Riders

A Hebrew browser 3D arcade sailplane game for grades8–9. Bank, trade height for speed, circle rising air, cross ridges and land. Differential heating, local breezes and windward/lee lift change which routes work. All24 authored courses are available from the course selector, with separate finish, control and unaided-environment medals, local high scores and immediate ghost retries.

## Play locally

```sh
npm ci
npm run dev
```

Open **http://localhost:5301/**. `npm run build` creates a static relative-base `dist/`; `npm run preview` serves it on4301. No backend, credentials, remote analytics or runtime services. Assets and Hebrew font are bundled locally. After the page and assets load, flight itself needs no internet. A WebGL-capable browser with hardware acceleration is recommended.

## Controls

- Physical A/D or left/right: bank. W/S or up/down: lower/raise the nose. Space: airbrake.
- Drag the world or the touch stick: analog bank/pitch. Touch brake and retry buttons are provided.
- R: instant retry with last trajectory ghost. Escape/P: pause/resume. H: hint. M: mute. F: fullscreen.
- Enter: launch or continue. Select any course to practice. The forecast is read while time is stopped.
- Calm-flight option slows simulation to65% speed; reduced motion removes camera roll. Hints/assist are recorded separately from an unaided medal.

The next fabric flags mark a3D course passage; their on-screen marker points to the current objective. After all passages, descend toward the green landing meadow, use the airbrake, and touch down below31m/s. A short or fast approach ends safely and can be retried instantly. The compass map is schematic with north up. The HUD arrow shows **where the wind moves**, not its source direction.

## Content and model

Six acts of four cover coast drift, surface heating/moisture, shadows, windward ridges, day/night and valley reversals, Carmel/rain shadow/Negev/elevation, then unfamiliar conditions and changing wind. Maps and weather are simplified authored scenarios, not exact GIS, forecasts or flight training. Learning outcomes have not been evaluated with students.

The visible sailplane is an original Tripo GLB acquired through the human's Chrome, with embedded textures (2,316,952bytes). It is a rigid vehicle; no deforming character or rig is used. [Asset provenance](ASSETS.md) records the original job, paid-plan rights basis, prompt, displayed30-credit spend, free retry and hashes. Terrain, collision fields, clouds, flags and routes are procedural.

## Verification and evidence

`npm test` runs41 pure flight rules and independent control-only route witnesses for every course. `npx tsx tests/probe-routes.ts` prints the24 route outcomes. `npx tsx tests/browser-play.ts` runs the actual-pointer/keyboard browser checks on the running server; it writes intermediate captures under ignored `tests/captures/`. The browser QA uses Metal on macOS; software SwiftShader performance is substantially slower.

`window.render_game_to_text()` reports mode, coordinates, course targets, environmental fields, model loading, medals and measured frame rate. `window.advanceTime(ms)` advances deterministic fixed steps while honoring pause; it does not change controls or inject outcomes. Calling it switches to manual time for that page until reload.

See [game identity](GAME_IDENTITY.md), [all24 curriculum mappings](CURRICULUM.md), [playtest evidence](PLAYTEST.md), and [target comparison](VISUAL_REVIEW.md). Generated [day/night design targets](docs/visual-targets/) were created and inspected before implementation, followed by the Tripo pass. They are mockups, not built-game evidence. Actual browser captures are stored under `docs/captures/` as verification completes.

Public repository: [AceDZN/windshift-riders](https://github.com/AceDZN/windshift-riders). Production deployment is future work.

The original soaring extension was checked against the [FAA Glider Flying Handbook weather chapter](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/glider_handbook/gfh_chapter_9.pdf). Workbook source snapshots and canonical module URLs are preserved in `docs/curriculum/`. Neither those sources nor this game imply Ministry approval.

Current evidence: all24 courses have control-only finish witnesses; browser routes1/8/11/12/14/24 finish with actual pointer/keyboard controls. Failure/retry, touch, hints, assist, saved first-run evidence, mute and fullscreen checks pass. The static resource transfer measured about2.51MB on this Mac, with60FPS in a1440×900 Chromium Metal ready view. Software rendering is much slower. Native OS focus-loss integration and student usability/learning are not established by these tests; the pause/blur handler and deterministic pause are checked. `node scripts/verify-static.mjs` reproduces the built-preview offline check.
