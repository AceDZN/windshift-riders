# Playtest and independent QA

31 October 2026. Tests and outcomes are recorded here as they run. A planned check is not a passed check. Browser captures must use actual flight controls; no injected finish states count as gameplay evidence. Pure simulation route controllers may set the initial mode to flying and then supply only valid bank/pitch/brake input.

## Current flight-feel revision verification

The human player found nose-down control and landing unnatural after the accessibility revision. The previous 53 checks established reachable outcomes and visible goals, but did not constrain vertical acceleration, agreement between the flight path and rendered nose, or touchdown quality. The focused revision adds six checks and actual browser traces for those failures. It still requires human play to judge enjoyment.

The baseline exposed concrete problems: held Down reached about −19.1° after one second while the model nose showed only −3.44°; release produced about 63 m/s² vertical acceleration. Braking changed sink by 5.5 m/s in one frame, producing about 330–342 m/s². Default approaches for stages 1, 3 and 19 finished at about −12.84 m/s vertical speed and 13 m/s airspeed. Stage 19 included about 340° of continuous same-direction turning. A successful outcome concealed a steep, banked fall. Baseline 10 Hz traces remain in `tests/captures/flight-feel-baseline/`.

The revised controls request a bounded air-relative glide angle, smooth the vertical response and brake, and conserve energy through actual height/speed exchange and drag. The normal landing helper flies a prepared setup, final and flare through bank/pitch/brake inputs. `beginLanding` changes metadata only; no position, altitude or outcome is interpolated. Predictions use local physics clones, then the real aircraft flies every accepted step. Scene pitch follows the air-relative flight path and settles level on the ground.

- **59/59 model checks pass:** 15 rule checks, 26 campaign/counterfactual/alternate-route checks, 12 control/feedback checks and six focused feel checks. All 24 authored courses finish using standard `arcadeInput` controls and the normal landing helper. Every route records its environmental decision before assistance; assistance cannot manufacture that credit. Energy, sun, moisture, shadow, ridge reversal and no-lift counterfactuals still pass.
- **Actual native-frame controls pass:** keyboard Down settles near −12°, with rendered-nose error below 2° during the response. Down, release and brake sampling observed a peak vertical acceleration of 6.36 m/s². The pure tests independently bound the response and check longer held input. The browser begins with real keyboard events and normal animation frames; deterministic advancement is used for the longer routes.
- **Actual course-to-touchdown browser checks pass:** stages 1, 3 and 19 use pointer flight controls, pass every physical opening and then use the visible default landing helper. There are no flight-state or finish injections, console errors or page errors. Setup, final, flare and result screenshots were captured; the held-Down, stage-1 flare and stage-19 result views were independently inspected.

| Stage | Finish game time | Assisted approach | Touchdown vertical speed | Touchdown airspeed | Maximum continuous same-direction turn |
|---|---:|---:|---:|---:|---:|
| 1 | 41.62 s | 22.62 s | −1.84 m/s | 21.67 m/s | 155.0° |
| 3 | 74.20 s | 43.40 s | −1.84 m/s | 21.67 m/s | 149.9° |
| 19 | 160.57 s | 87.77 s | −1.91 m/s | 20.67 m/s | 194.6° |

Minimum airspeed during these approaches stays above 20.1 m/s; touchdown bank is below 0.8°. Ground-track error relative to the planned final is 19.1°, 2.2° and 0.1° respectively, within the 25° acceptance bound. Stage 19 turns 317.6° in total through opposite-direction setup/final turns, which is distinct from one continuous holding spiral. These bounds are game-feel regression limits, not real aviation operating guidance.

The explicit **finish landing** button also passes a separate actual-browser comparison. The watched and accelerated stage-1 approaches reach identical physical position, 41.62 s game time, −1.84 m/s touchdown speed and score 4387. The button advances ordinary fixed steps until contact; it does not inject a win. `landingSkipped` differs and persists in the first-run record. This option avoids requiring the player to watch a long late-stage approach.

Planning latency remains a limit: the all-24 pure probe measured a 365 ms median and 1.716 s maximum on this Mac; stages 3, 18 and 21 exceeded one second. Sampled actual-browser activation calls for stages 1/3/19 took 29/74/68 ms including advancement/render overhead. The route-dependent worst case can still cause a visible pause and should not be described as universally below one frame or one second.

Reproduce with `npm test`, `npx tsx tests/probe-default-routes.ts`, `npx tsx tests/browser-flight-feel.ts` and `npx tsx tests/browser-landing-skip.ts` against the dev server at 5301. Current raw reports are `tests/captures/flight-feel-final/default-routes.jsonl`, `tests/captures/flight-feel-browser/report.json` and `tests/captures/flight-feel-browser/quick-finish-report.json`. The final suite transcript is `tests/captures/flight-feel-revision/final-suite-4.txt`. Selected copies of these current reports, native Down/release views, stage-3 flare/result views and both quick-finish result views are saved in `docs/captures/flight-feel/`. Earlier sections below are historical evidence for their stated revisions, not current timing claims.

## Usability reopened after human playtest

The human player reported that the first build felt confusing, boring and too hard. The prior route-controller tests established mathematical feasibility, not intuitive controls or fun. That distinction was not tested sufficiently in the first acceptance pass. The earlier results below remain historical technical evidence and do not establish usability of the revised game.

An independent naive-input browser pass against the stable first build used no numerical pilot, hints or flight-state injection:

- Neutral flight passes stage1's gate by12s, but the thermal then lifts the glider. At30s the glider is193m high and has passed the meadow; the landing marker is now124m behind. The player has succeeded at the visible passage yet receives no clear transition to a manageable finish.
- Pressing Up for1s, a natural expectation of climbing, instead drops altitude from150m to137m and increases airspeed from28m/s to31.53m/s.
- Holding Right for0.5s rotates heading12.7°. After release the delayed bank adds another8°; a90px right drag held for2s turns84.3°.
- The scene shows a small pair of flags with altitude tolerance, followed by a landing task requiring an unintroduced descent/braking plan. The HUD does not explain the missing height plan. A route controller solved this with a braking spiral, which is not an appropriate first-minute learner requirement.

Baseline script: `tests/usability-baseline.ts`. Raw report and inspected screenshots: `tests/captures/usability-v1/` (local QA artifacts). The revision was checked separately for naive first1/2 controls without optional hints, readable progressive goals, immediate feedback, forgiving failure/retry, meaningful field invariants and a final-stage transfer route; current outcomes follow below. Old autopilot witnesses will not be used as proof that the revision is intuitive or enjoyable. No claim of student usability or learning gains is justified without people testing it.

## Previous accessibility revision verification

The opening and control changes address specific observed failures; they are not a claim that an automated agent can certify fun. The human player still decides whether the revised game feels enjoyable.

- **Actual naive stage1:** launch with no pitch, brake or hint. Three physical passages show immediate feedback; first feedback arrives at5.5s. A visible landing assistant then finishes at28.78s. The control medal is attainable because the route includes a centred pass.
- **Actual naive stage2:** one0.2s Left tap and release, following the wind coach, with no pitch, brake or hint. First physical passage feedback arrives at5.7s; finish at33.63s. All three passes can be graded perfect.
- **Actual controls:** Up now climbs by5.76m over1s instead of dropping13m. Dragging upward and touch Up use the same convention. Releasing a short turn limits delayed yaw toabout2.6°. Visible manual override cancels the default landing help. A deliberate bad turn/dive yields a safe short landing and immediateR retry.
- **Actual final transfer:** stage24 passes both physical openings with no hint or default lift overlay, records two perfect passes and finishes at94.23s through pointer controls plus the normal landing assistant. This is a technical route witness, not a novice-play claim.
- **Touch:** actual touch Up climbs and release levels bank at390×844. The inspected narrow-screen capture keeps the sailplane wings visible and the goal/coach readable.
- **All24 default-control feasibility:** every authored level now passes through the actual `arcadeInput` helper and normal landing-guidance inputs. None writes position, altitude, gate count or outcome. Each route must record its environmental decision before guidance. The earlier raw-simulator witnesses have been replaced for this acceptance check.
- **53 meaningful tests:**15 rule checks,26 campaign/counterfactual/alternate-route checks and12 control/feedback checks. The latter verify prompt tutorial success, low-speed protection, no airtime farming, physical-plane passage detection, attainable perfect-versus-edge grading, reverse-side recovery and no environmental-decision credit from assisted approach.

Passage grading was changed after visual inspection: entering a radius ahead of an arch no longer counts as crossing it. Swept crossings use the passage plane and its real width/height, so both success timing and perfect-pass feedback match the visible opening. A centred pass is required for the control medal, while optional landing help does not invalidate the earlier environmental decision. The runtime logs landing help separately from optional hints and slower-time assist.

Current reproducible browser commands are `npx tsx tests/usability-revision.ts` and `npx tsx tests/browser-transfer.ts`, with the dev server at5301. Current raw reports and inspected screenshots are in `tests/captures/usability-v2/`; the lead copies selected deliverable evidence into `docs/captures/`. `tests/README.md` distinguishes these from the historical first-build harnesses.

## Historical first-build review status

- Curriculum source review: complete; full24 mapping in `CURRICULUM.md`.
- Generated target and Tripo sequence: art helper supplied targets and original runtime GLB; actual browser state confirms `modelLoaded: true`. Provenance and costs are in `ASSETS.md`.
- Pure model/rule tests: passed; `tests/rules.test.ts` covers conservation, fields, brakes, pause and landing/medal constraints.
- All24 independent reachability: passed through `tests/reachability.test.ts`; each starts at its authored launch, supplies only bank/pitch/brake inputs, passes all gates and triggers a genuine terrain landing.
- Actual controls/browser scenarios: all six selected routes and the seven interaction checks passed using Metal Chromium and actual pointer/keyboard/touch controls; no console/page errors. Later aid/retry/assist/focus regressions are recorded separately.

## Required browser scenarios

| Scenario | Input and expected chain | Result / evidence |
|---|---|---|
| Stage1 finish | Launch → bank → maintain height → pass objective → controlled landing → result screen | Passed through actual pointer/Space controls; 36.75s; `docs/captures/qa/level-1-flight.png` and `level-1-result.png` |
| Stage3 failure/retry | Commit low/fast → safe short landing → R → live retry in <2s; previous trace remains as ghost | Passed; actual ArrowRight/ArrowUp/Space causes safe short, R restarts in 273ms wall; failure and retry captures inspected |
| Stage8 surface trap | Inspect same-color patches → choose from moisture/sun data → useful climb; hint recorded if used | Passed through pointer/Space controls; east dry field chosen from physical field, 78.2s, no hints, default overlay false; `docs/captures/qa/level-8-flight.png` |
| Stage11 reversed ridge | Read wind → use newly windward face → climb; old face sinks | Passed; 94.2s, windX −10, useful ridge climb visible; pure counterfactual also reverses usable side |
| Stage12 overlay absent | Ordinary wind cues/instruments remain → route without default lift columns | Passed; 117.93s, both gates, overlay false, no hints; instruments readable in inspected capture |
| Stage14 night breeze | Read offshore wind → compensate → safe shelf landing | Passed; 41.77s, windX −7, solar thermal 0, overlay false; night terrain/landing readable |
| Stage24 transfer | Select final stage independently → read new environment → valid lift/route → real landing and summary | Passed independently via level selector/URL; 110.35s, both gates, no hint, overlay false, real final result inspected |
| Pause/focus loss | Escape/blur pauses → advanceTime does not move physics → resume continues | Escape pause/resume passed, including five seconds of frozen physics; explicit browser blur event pauses correctly. Native OS focus-loss integration was not verified because Playwright tab switches emitted no blur here |
| Retry and replay | Restart resets current run; completed-stage replay keeps records | Passed; restart resets time/hint and completed scores remain after navigation/reload |
| Hints / assist | Show hint or assist → record aid → keep environment evidence distinct | Passed; H records aid, current-run hint resets on R; later regression confirms archived first-run aid, retries, visible toast clearing and separate assist |
| Persistence | Complete → reload → progress/medals/high score restored | Passed in fresh browser context; stage1 finish record survives reload |
| Touch/resize | Touch steering/brake/retry at narrow viewport → usable controls; resize preserves flight | Passed at390×844: actual touch stick changes bank, held brake drops speed, touch retry restarts; portrait wing clipping found and lead adjusted camera; inspected `docs/captures/qa/portrait-final.png` now fits the full wings |
| Model/network | Runtime sailplane GLB loads; no console/page errors; built assets local after first load | All six routes report modelLoaded true and zero console/page errors. Assets are bundled locally; offline network blocking is not part of this batch |

## Rule checks (passed)

1. In still air without thermals or ridge lift, total height-equivalent energy cannot increase under neutral/climb/dive/bank inputs. Climb may trade speed for height, but cannot create net energy.
2. Horizontal wind changes ground track with identical airspeed controls; no instant airspeed bonus.
3. Sun, cloud shadow and moisture alter lift without changing score rules or a hidden answer flag; matching colors do not guarantee matching lift.
4. Reverse only the wind vector at a ridge: useful windward side and lee sink reverse.
5. Flight remains finite and stable at high bank/slow speed; a steep bank increases sink cost.
6. Paused and terminal states do not advance physics; restart returns launch state and allows a new flight.
7. All24 authored levels have independently replayable valid-control route witnesses; high climbs fail when rising-air support is removed. A merely sampled route is not proof of every possible route.
8. Wind-shift warning precedes the shift; a landable alternate is checked.


## Browser results

The reproducible control harness is `tests/browser-play.ts`; machine-readable evidence and inspected captures are in `docs/captures/qa/`. All six finished routes earned finish and unaided-environment medals, while the controller's tight turns and slow landing approach did not earn control medals. This confirms that the three awards are separate. The autonomous controller establishes feasible controls; it is not a student usability study.

The original, unchanged develop-web-game action client passed against static preview4301 with Enter for one frame and Right for two frames: exit0, no errors, modelLoaded true, mode flying, bank0.107 and time0.05. The lead inspected `docs/captures/skill-client-world.png` and the accompanying state JSON. This client captures the canvas and therefore omits the HTML HUD. Its default SwiftShader renderer measured around1FPS here, so full route evidence uses Metal Chromium; the initial longer software-rendered action burst was stopped.

## Pure-simulation results

The independent controller in `tests/pilot.ts` samples the physical lift field, compensates horizontal wind and preserves terrain clearance. It does not write position, altitude, gate count, score or outcome during a route. Stage22 uses a valid alternate around the lower southern end of the ridge after the wind shift, then approaches the newly windward eastern side. A direct crossover loses height in the lee and failed in the initial probe.

| Stages | Witnessed launch-to-landing seconds, in stage order |
|---|---|
| 1–4 | 36.7 · 37.3 · 35.6 · 42.9 |
| 5–8 | 74.4 · 77.4 · 94.7 · 78.2 |
| 9–12 | 111.0 · 73.8 · 94.7 · 116.3 |
| 13–16 | 73.2 · 41.8 · 60.4 · 31.9 |
| 17–20 | 97.8 · 86.4 · 100.4 · 88.5 |
| 21–24 | 69.9 · 133.9 · 72.6 · 107.3 |

These are game-time feasibility witnesses, not speed records. The controller brakes to low airspeed before landing and does not establish that all control medals are easy to earn. The no-lift counterfactual removes rising-air support from stage5 while retaining the same gate and scoring logic; the route cannot cross that high gate and does not finish.

The first rule review caught an airbrake issue: braking initially converted lost kinetic energy into upward motion. The lead fixed it by separating deliberate pitch energy exchange from drag; the brake regression now requires both speed and height to fall in still air.

## Later regression checks

`tests/browser-regressions.ts` passed all five checks with zero console/page errors. Mid-flight retries archive first-run hint/assist state and keep starts/retries separate. H is counted once per run, R clears visible hint text/class, and first-run aid survives reload. Slow assist advances0.65game seconds for a1second time step and does not award an environment medal. M mute and F fullscreen both responded. Headless and headed tab switching did not produce a native blur event in this tool environment; the browser blur handler was tested by dispatching that event explicitly.

## Limits

Automated route controllers test physical reachability, not student comprehension or whether every student finds the controls fun. Screenshot matching establishes visual implementation only. There is no evaluation of learning gains or real-world aviation/weather validity. Native OS focus-loss integration and offline network-blocking after load were not independently verified. No control-medal-optimal route or student usability study is claimed.

The final curriculum scene review's level18 contrast recommendation is resolved: the level now explicitly marks its schematic rain-shadow presentation, with greener western terrain and sparser, drier eastern terrain. This is a long-term landscape cue; windward/lee flight fields remain unchanged. Level15's lesson now describes slope heating without incorrectly implying that the rendered sea is absent.

## Lead static-build verification

After the independent QA batch, the lead tested the built preview on4301 with the network set offline after the model/fonts loaded. Launch and deterministic movement continued, modelLoaded remained true, and no application errors or external HTTP requests occurred. `docs/captures/static-build-check.json` records 2,507,799bytes transferred for initial resources (excluding the small HTML document), with embedded model textures and local Hebrew fonts. The measured ready view was60FPS at1440×900 in Chromium Metal on this Mac; the software SwiftShader client was about1FPS. These are machine-specific observations, not a cross-device performance guarantee. Reproduce with `npm run build`, `npm run preview` and `node scripts/verify-static.mjs`.

## Stage23 alternate-route acceptance

The same authored stage and launch support two distinct control-only witnesses. Neither route changes the level, gates, wind, sun, player position or outcomes. `directPilot` steers toward the course gate at neutral pitch without a climbing orbit, then uses the ordinary landing controller. The supported pilot circles useful rising air before committing to the gate.

| Witness | Finish time | Maximum altitude | Sampled ground path | Lift-decision evidence |
|---|---:|---:|---:|---|
| Fast direct | 47.37s | 175.00m | 1,378m | No |
| Higher supported | 72.53s | 306.70m | 1,971m | Yes |

Both genuinely pass the course gate and land. The direct route is about25seconds faster and preserves less altitude; a fast finish alone does not award the environment decision. The targeted `stage23 has distinct fast-direct and higher-supported routes` test compares landing, time, maximum altitude and trajectory length. Exact probe results are saved in `docs/captures/qa/level-23-alternates.jsonl`; `tests/probe-alternates.ts` reproduces them. This adds one targeted test to the previous40 checks, for41 total.
