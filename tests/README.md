# Independent verification

`rules.test.ts` checks physical relationships and invariants rather than renderer details. Counterfactual tests clone a level and change only environmental fields; they do not change its correct-answer or medal state.

`reachability.test.ts` will drive the pure simulator with the same bank/pitch/brake actions available to a player. It must start from the authored launch, pass gates in order and land. Setting an initial mode to flying is allowed; setting position, altitude, gate count, score or a finish during a run is not. Route witnesses establish feasibility, not learner comprehension.

Browser evidence will use a fresh Playwright context, actual keyboard/pointer/touch input and `advanceTime` to progress deterministically. We do not reuse the user's Chrome/Tripo tab. Pure-model witnesses and browser captures are reported separately in `PLAYTEST.md`.
