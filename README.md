# רוכבי הרוח · Windshift Riders

A Hebrew browser3D arcade sailplane game for grades8–9. Fly through fabric passages, build a clean-pass streak, catch rising air and cross Israel-inspired relief. All24 authored courses are selectable; three separate medals, local records and ghost retries support replay.

## Play

```sh
npm ci
npm run dev
```

Open **http://localhost:5301/?level=1** for the revised introduction. `npm run build` produces a static relative-base `dist/`; `npm run preview` serves4301. No backend, credentials, analytics or runtime external services. Models and Hebrew fonts are bundled locally.

## Controls and flow

- Left/right or A/D: gentle turns; release levels the wings. Up/W: climb using airspeed. Down/S: dive. Space: brake.
- Drag upward to climb or sideways to turn. A visible stick/anchor shows the input; release recentres. Touch steering, brake and retry are provided.
- R: retry immediately with the last trajectory ghost. Escape/P: pause. H: hint. M: mute. F: fullscreen. Enter: launch/continue.
- The first course has three broad passages; simple steering is enough. Success occurs when actually crossing the arch plane, with a visible reward and chime.
- After all passages, **landing assistance is on by default**. It uses ordinary steering/pitch/brake to reach a real meadow landing. It is announced and can be cancelled with “אני אנחת לבד” or disabled in preflight settings.
- Optional slower flight gives80% simulation speed. Hints, retries, slow assist and landing assistance are stored separately. Environment medals reflect useful wind/lift choices before approach; assisted landing does not manufacture that evidence.

The primary HUD shows the current action and passage count. Later flights expose altitude needed for high passages and a variometer for rising air. Wind arrows show where air moves, relative to the flight view. Forecasts and physical surface cues matter; colors alone do not predict lift. Maps and weather are simplified scenarios, not exact GIS or forecasts.

## Player-feedback revision

The first release was technically reachable but the human found it confusing and too difficult. This revision corrects inverted controls, excessive turning after release, a misleading pre-crossing goal trigger and an unexplained landing overflight. It adds a fast, forgiving opening, explicit gate feedback, sensible landing help and progress-based score instead of airborne-time farming. The scene now has a gradient sky, turquoise shallows/foam, clustered vegetation and villages, stronger terrain/field detail, readable fabric gates and a steady chase camera. All24 courses and weather relationships remain.

## Content and provenance

Six acts cover coastal drift, surface heating/moisture, shadows, windward ridges, day/night/valley reversals, Carmel/rain shadow/Negev/elevation, then unfamiliar and changing conditions. [CURRICULUM.md](CURRICULUM.md) maps every course to canonical Workbook sources. The soaring extension was checked against the [FAA weather chapter](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/glider_handbook/gfh_chapter_9.pdf). This is an arcade geography game, not flight training; learning gains have not been evaluated.

The visible original Tripo sailplane is2,316,952bytes with embedded textures. It is a rigid vehicle and needs no character rig. [ASSETS.md](ASSETS.md) records its normal Chrome UI acquisition, paid-output rights basis, exact prompts,30-credit spend/free retry and hash. No new credits were spent on this revision. Assistant Hebrew's OFL is bundled in `public/licenses/`.

## Verification

`npm test` checks physical invariants, field counterfactuals, course reachability and control/goal regressions. `npx tsx tests/usability-revision.ts` exercises simple actual browser inputs for the revised opening, upward keyboard/drag steering, release, landing override and failure/retry. `tests/probe-default-routes.ts` audits valid player intents through the default arcade controller. [PLAYTEST.md](PLAYTEST.md) distinguishes archivedv1 results, revised browser evidence and limits. `docs/captures/revision/` contains actual revised captures, separate from the original [generated design targets](docs/visual-targets/). [VISUAL_REVIEW.md](VISUAL_REVIEW.md) records comparisons and the remaining lower-detail procedural-art scope.

`window.render_game_to_text()` exposes objectives, controls, flight/environment fields, rewards, landing mode, model loading and local records. `window.advanceTime(ms)` steps deterministic time and honors pause without injecting flight outcomes. Calling it puts that page into manual-time mode until reload.

For a built-preview offline/model/transfer check, run `npm run build`, `npm run preview`, then `node scripts/verify-static.mjs`. Browser QA uses Chromium Metal on macOS; software rendering is slower. Native OS focus-loss integration and student enjoyment/learning are not established by automated tests. No production deployment has been performed.

Public repository: [AceDZN/windshift-riders](https://github.com/AceDZN/windshift-riders).

## Focused pitch and landing update

Down now requests a bounded glide angle and release eases back to trim. The visible nose follows the air-relative flight path. Braking deploys progressively and no longer fights a28m/s recovery target while trying to slow the glider. Assisted landing chooses a broad setup, tracks a wind-corrected final line, then flares with wings aligned; the meadow and its approach are actually level in the collision terrain. The stage HUD points at the active setup waypoint and the paint marks follow the chosen final direction. “סיום הנחיתה” can complete a long assisted approach by advancing the same physical flight to touchdown; it does not set a win or move the aircraft directly.
