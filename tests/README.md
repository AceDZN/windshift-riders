# Independent verification

The first builder acceptance established feasible flight paths, but did not establish intuitive controls or fun. Human play exposed that gap. The current revision separates beginner-input accessibility, physics/field correctness and late-course feasibility. None of these substitutes for people playing the game.

Run the meaningful model checks:

```sh
npm test
```

`rules.test.ts` checks energy, wind, heating, moisture, shadow, landing and medal relationships. `controls.test.ts` checks responsive Up/climb controls, release centring, low-speed protection, quick opening goals, physically assisted landing, progress scoring and visible-plane passage grading. `flight-feel.test.ts` separately constrains held-dive angle, release/brake acceleration and actual low-bank, gentle-sink approaches for stages1/3/19; a landed outcome alone does not pass those checks. Counterfactual tests alter fields without changing scoring answers. Assisted landing cannot create environmental-decision credit.

`reachability.test.ts` starts every authored level at launch and feeds standard player intent through the actual `arcadeInput` helper. Only bank/pitch/brake update flight. The default landing helper takes over after the course and normal approach eligibility. No route writes position, altitude, gate count or outcome. Each route must accumulate its environmental decision before landing help. These witnesses establish physical feasibility, not that a student will discover a route.

With a local dev server at5301, run the current browser checks:

```sh
npx tsx tests/usability-revision.ts
npx tsx tests/browser-transfer.ts
npx tsx tests/browser-flight-feel.ts
npx tsx tests/browser-landing-skip.ts
```

The first script uses naive opening actions: stage1 launch without pitch/brake/hints; stage2 one short Left tap and release. It checks actual keyboard and pointer Up/climb, release, visible assisted approach, manual override, clear failure and retry. The second uses an explicit technical controller through actual pointer controls for the final transfer level and checks the touch Up convention at390×844. `advanceTime` only advances elapsed game time; neither browser script injects a finish or flight state. They use a fresh Metal Chromium context and do not touch the user's Chrome/Tripo tab.

The focused feel script samples real keyboard Down/release/brake at native frame timing, compares the rendered nose with the air-relative path, and captures setup/final/flare through actual browser controls. The optional quick-finish test compares the button with the same watched fixed-step approach: both must produce the same physical touchdown, game time and score. Planning helpers set metadata only; they may not move the aircraft. Pure drivers call `beginLanding` once eligible and `updateLandingPhase` on every active guided step, including outside the initial eligibility radius. Total turn is reported separately from the largest same-direction turn, so a broad approach with opposite turns is not mislabeled as a holding spiral.

The current suite has 59 checks. Current focused browser artifacts are saved in ignored `tests/captures/flight-feel-browser/`; the all-24 route report is `tests/captures/flight-feel-final/default-routes.jsonl`. `npx tsx tests/probe-default-routes.ts` reproduces the default-control routes and records planning latency. The isolated run measured a 365 ms median and 1.716 s maximum on this Mac, so completion does not establish that planning is always imperceptible. Previous accessibility artifacts remain in `tests/captures/usability-v2/`. Selected deliverable evidence is copied by the lead to `docs/captures/`. `browser-play.ts` and `browser-regressions.ts` are historical first-build harnesses; their older binding/scaling expectations are not current acceptance tests. `usability-baseline.ts` records the naive failures of the first build and must be run against that historical build only.
