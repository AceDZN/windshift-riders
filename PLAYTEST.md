# Playtest and independent QA

31 October 2026. Tests and outcomes are recorded here as they run. A planned check is not a passed check. Browser captures must use actual flight controls; no injected finish states count as gameplay evidence. Pure simulation route controllers may set the initial mode to flying and then supply only valid bank/pitch/brake input.

## Review status

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
