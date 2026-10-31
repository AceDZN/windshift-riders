# Independent verification

The first builder acceptance established feasible flight paths, but did not establish intuitive controls or fun. Human play exposed that gap. The current revision separates beginner-input accessibility, physics/field correctness and late-course feasibility. None of these substitutes for people playing the game.

Run the meaningful model checks:

```sh
npm test
```

`rules.test.ts` checks energy, wind, heating, moisture, shadow, landing and medal relationships. `controls.test.ts` checks responsive Up/climb controls, release centring, low-speed protection, quick opening goals, physically assisted landing, progress scoring and visible-plane passage grading. Counterfactual tests alter fields without changing scoring answers. Assisted landing cannot create environmental-decision credit.

`reachability.test.ts` starts every authored level at launch and feeds standard player intent through the actual `arcadeInput` helper. Only bank/pitch/brake update flight. The default landing helper takes over after the course and normal approach eligibility. No route writes position, altitude, gate count or outcome. Each route must accumulate its environmental decision before landing help. These witnesses establish physical feasibility, not that a student will discover a route.

With a local dev server at5301, run the current browser checks:

```sh
npx tsx tests/usability-revision.ts
npx tsx tests/browser-transfer.ts
```

The first script uses naive opening actions: stage1 launch without pitch/brake/hints; stage2 one short Left tap and release. It checks actual keyboard and pointer Up/climb, release, visible assisted approach, manual override, clear failure and retry. The second uses an explicit technical controller through actual pointer controls for the final transfer level and checks the touch Up convention at390×844. `advanceTime` only advances elapsed game time; neither browser script injects a finish or flight state. They use a fresh Metal Chromium context and do not touch the user's Chrome/Tripo tab.

Local raw artifacts are saved in ignored `tests/captures/usability-v2/`. Selected deliverable evidence is copied by the lead to `docs/captures/`. `browser-play.ts` and `browser-regressions.ts` are historical first-build harnesses; their older binding/scaling expectations are not current acceptance tests. `usability-baseline.ts` records the naive failures of the first build and must be run against that historical build only.
