# Visual review

## Reference stage

Built-in imagegen created `docs/visual-targets/day-target.png` and `night-target.png` before implementation, after GAME_IDENTITY.md. Both outputs were visually inspected. Exact prompts, mode, source output paths and first inspection are preserved in `docs/visual-targets/README.md`.

The day target establishes a close chase view, lower-third cream/teal sailplane, readable chalk ridge and saddle, Mediterranean water to the west, warm ochre relief, atmospheric horizon, a previous-attempt ghost and sparse Hebrew instruments. The night target establishes a distinct blue/ochre coast and a safe moonlit landing shelf. These are design targets, not runtime evidence.

Deliberate interpretation: use simpler painted browser geometry than the photoreal target's high-frequency landscape detail. Keep instrument footprint closer to the day target; the generated night target has too many large gauges. Keep dust/leaves subtle rather than copying the image's bright thermal spiral. HTML Hebrew will use correct RTL even though generated type is imperfect.

## Runtime comparison

Actual browser play was inspected at 1440×900 after runtime Tripo integration. Evidence: `docs/captures/day-first-pass.png` (level 1) and `night-first-pass.png` (level 14), with target/actual sheets `day-comparison-first-pass.jpg` and `night-comparison-first-pass.jpg`. The daytime capture came from the lead’s real Enter launch; the independent night capture used Enter plus ArrowLeft and deterministic `advanceTime` stepping. No player/win state was injected. Level 14 state reported flying, modelLoaded true, windX -7, sun 0, no solution overlay, 1.12 simulated seconds.

| Target property | Actual first pass | Review |
|---|---|---|
| Close chase camera and horizon | Glider in lower third, broad open horizon, coast and next flags visible | Matches the composition; no camera/UI obstruction of next turn |
| Identity-defining Tripo glider | Real GLB, teal wings, dark canopy, unpowered nose | Silhouette works; fuselage is too saturated yellow versus cream target |
| Chalk coast and ochre relief | 3D hills, sea to west, pale steep surfaces, trees and houses | Deliberate lower-detail painted geometry; increase pale face contrast for ridge readability |
| Sparse Hebrew instruments | Small header, mission, score, wind, altitude, two gauges and compact map | Matches day target footprint; correct HTML Hebrew replaces imperfect generated text |
| Cloud shape and motion | Sculpted cloud groups and sea strokes | First pass creates an obvious diagonal bead string that overlaps brand; scatter and soften undersides |
| Night coast and horizon | Distinct blue palette, readable bank, safe shelf and reversed wind | Readable; moon is too small/dim and settlements lack the target’s warm lights |
| Natural cues/optional help | Cloth gates, wind arrow, small particles, optional help separate | No giant universal glowing answer column in inspected night state |
| Verbs and feedback | Banking shown by real control input; objective changes are in world | Failure/retry/finish evidence is maintained in PLAYTEST.md; these frames alone do not establish fun or learning |

Required first-pass fixes sent to lead: irregularly space clouds and avoid brand area; lighten yellow fuselage while retaining teal wings; strengthen chalk slope contrast; add a modest readable moon and a few warm settlement lights at night. The renderer changes were rechecked in the next section. FPS from a short capture is not used as a performance claim.

## Refined browser recheck

A second independent capture pass used real Enter launch and held bank controls in levels 7, 14 and 24. The renderer update was inspected visually in `docs/captures/day-final.png`, `night-final.png` and `final-expedition.png`. `art-capture-evidence.json` records the corresponding levels, bank state, sampled wind/sun, solution-overlay state, successful runtime model loading and empty application error lists. The side-by-side final sheets are `day-comparison-final.jpg` and `night-comparison-final.jpg`.

- The selective material adjustment now renders a warm cream fuselage with teal wings, resolving the source model’s lemon-yellow mismatch.
- Clouds are irregularly spaced, smaller in visual footprint and softer underneath; the former diagonal bead string is gone. HUD and next turn remain readable.
- Pale faceted relief now separates steeper chalk faces from ochre ground. Coast, saddle and height decisions are readable at chase distance.
- Day and night retain distinct lighting, usable horizon and the same restrained Hebrew instruments. The enlarged moon is visible; localized warm window geometry is implemented, though the initial coast capture does not show the dense luminous settlement of the target.
- The final level preserves the camera/glider/HUD language while showing a higher ridge and multiple route markers, with the solution overlay absent.

The planned camera, glider identity, HUD footprint, readable bank verb and broad coast/ridge art direction are met. The remaining deliberate detail gap is lower-frequency procedural terrain/trees/houses, a flatter sea and less atmospheric scattering than the generated target. This build does not reproduce the target’s photoreal micro-detail, distant settlement density or bright moon reflection. The final moon-fog refinement was applied and independently recaptured: the moon now renders bright cream, resolving the earlier dim disc. The actual frames are genuine browser renderings and are labeled separately from design mockups. Browser playtesting and curriculum/rule evidence remain in PLAYTEST.md and CURRICULUM.md; no learning-gain claim follows from these pictures.

Final bounded refresh: `night-final.png` and `night-comparison-final.jpg` were regenerated after the moon material disabled fog. `rain-shadow-final.png` captures actual level 18 launch/bank with a greener, denser western slope and a drier, sparser eastern side; this is an illustrative long-term landscape presentation, not precipitation changing instantly in flight. Both refreshed captures reported modelLoaded true and no application errors. Physics was unchanged.

## Readability revision after actual player feedback

The human playtest described the first build as confusing, strange, boring and too difficult. The scene was reopened alongside the lead's controller/tutorial changes. The revision is a substantial scene/readability pass; it does not claim that a screenshot proves enjoyment.

`src/scene.ts` now provides an airy blue gradient, atmospheric distant ridges, turquoise shallows and shoreline foam, warm terrain bands, visible physical field/irrigation marks, clustered olive scrub/cypresses and villages, and a broad landing meadow. Those replace the flat sky/sea and evenly scattered cones. Identical-color teaching patches retain the same authored fill color; moisture and surface properties have physical cues rather than a universal answer color.

Current passages are large cream/gold fabric arches facing their authored approach. Only the current and subdued next arch are shown, reducing overlapping objectives. Passed gates produce a brief gold-fleck celebration. Landing markings brighten when approach begins. The chase camera follows flight heading directly with a level horizon, so the camera no longer slides sideways behind a turn; the Tripo glider remains visible in desktop and portrait layouts. Nights use readable blue-hour illumination rather than a near-black foreground. Existing ghost/retry paths and optional lift leaves remain.

Actual revised browser captures are `docs/captures/revision/coast-day-final.png`, `coast-night-final.png` and `mobile-coast-final.png` (390×844). They were independently opened and inspected after real launch and bank input; `scene-final-evidence.json` records modelLoaded true and no application errors. They also capture the lead's updated concise objective/tutorial HUD after it landed. These frames confirm composition/readability and model/shader rendering, not a completed flight.

The develop-web-game action client was run through three short input/capture loops. Its bundled SwiftShader launch flags were changed only in an intermediate copy to Metal because the installed software renderer had previously stalled; the skill client/action/state workflow was preserved. The final client artifacts are under `docs/captures/revision/client-final/`. TypeScript passed after the scene changes. Full controller, level-success and failure-recovery checks belong to the lead/independent QA integration pass.

The procedural scene remains deliberately simpler than the generated design targets in terrain micro-detail, water reflection and settlement density. The revision prioritizes an immediately readable next action and a stable flying view while retaining the original coast/ridge/glider identity. No new model, credits or image generation were used.

Gate-bound alignment recheck: cream masts now extend down to the authored lower opening bound (−r), with a thin cloth lower edge and lower pennants. The upper gold arch remains open. Actual launch plus a 150 ms left input and neutral flight crossed the first swept gate plane at 5.33 simulated seconds; state reported gate 1, cleanPasses 1 and the “מעבר מושלם! +1,000” reward, modelLoaded true and no application errors. `docs/captures/revision/gate-bound-approach.png` shows the lower visual boundary before crossing; `perfect-gate-pass.png` shows the real reward immediately after crossing. The skill client was also rerun with the revised geometry in `client-gate-bounds/`. TypeScript passed. No player/gate/win state was injected.

## Focused nose/landing pose correction

A further human playtest isolated nose-down control and landing feel. The old mesh pose used stick intent (`pitch × 0.11`) rather than the actual air-relative trajectory. In a real neutral level-1 baseline, touchdown still carried −12.84 m/s vertical speed at 13 m/s horizontal speed while the model rendered a small nose-up angle and a banked frozen pose. Physics/landing guidance is owned and revised by the lead; this scene patch only corrects presentation.

The glider now derives pitch from `atan2(airVy, speed)` (fallback `vy − lift`), clamps it to −14°/+12°, and smooths it over about 0.18 s. This excludes thermal vertical air motion from nose attitude. Rendered bank settles over about 0.12 s; ready, landed and safely stopped states target level pitch/bank. The camera stays upright and follows heading directly; only its look-ahead height receives a smoothed lead limited to −4/+3 metres. Pause preserves the current pose. `draw(..., dt=0)` snaps the pose to the current trajectory for deterministic stepping, avoiding stale attitude in accelerated playtests. `scene.presentation` exposes actual rendered pitch/roll and camera lead for independent QA.

The bounded Metal browser check held Down for one second and released it. At the deterministic sample, the actual air-path angle and rendered pitch both read −12.21°; after release they both returned to about −2.35°. A separate normal-animation-frame check sampled 24 times: the largest observed pitch change between approximately 100 ms samples was 1.37°, camera lead stayed within 2.08 m, and there was no horizon flip or pose discontinuity. Frames in `work/art/pose-realtime-{down,release}.png` were opened and inspected. The skill action client was rerun in `work/art/pose-client/`; TypeScript passed and the browser reported no application errors. A stopped landing-guidance probe also rendered pitch/roll/lead at zero; that probe ended outside the meadow and was reported to independent QA for guidance tuning, not described as a successful landing. No other graphics or control behavior was changed in this pass.

Landing-mark alignment: the existing meadow chevrons now follow the active landing plan’s heading, so a wide setup/final approach cannot contradict paint marks fixed to the original route axis. Only the named paint meshes rotate; terrain, glider pose and camera are unchanged. TypeScript passed; integrated landing-path QA is owned by the lead/independent reviewer.
