# Independent QA browser evidence

These are real browser captures, not imagegen targets. The first batch used a fresh Metal Chromium context, actual pointer drags for bank/pitch and the Space key for brakes. `advanceTime` controlled elapsed simulation time; the test never wrote flight position, altitude, gates or outcome. Six selected routes genuinely landed; all24 have separate pure-simulation witnesses.

`report.json` records the six route outcomes and interaction checks. The corresponding `tests/browser-play.ts` is reproducible. `regressions.json` records the later aid/retry/assist/focus checks from `tests/browser-regressions.ts`.

The six route captures precede the final cosmetic pass that changed yellow fuselage accents to cream, scattered clouds and added night landmarks. They remain functional evidence because physics and authored courses were unchanged. Art's final comparison captures elsewhere in `docs/captures/` show the later appearance. `portrait-final.png` is from the later camera/regression pass.
