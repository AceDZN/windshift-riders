# Windshift Riders — רוכבי הרוח

Commissioned 31 October 2026. Own this repository and this game's builder chat. Read docs/COMMON.md first. Public repo: https://github.com/AceDZN/windshift-riders . Dev 5301, preview 4301. Browser 3D, Hebrew grades 8–9, **24 authored levels**. Start now with imagegen → Chrome Tripo → implementation → target-versus-real review.

## The game

A joyful third-person glider score-attack, borrowing Superflight's readable banking and risk/reward proximity, Fugl's natural exploration, and A Short Hike's forgiving discovery. Fly a compact sailplane over the coast, ridges and desert. Trade height for speed, bank into rising air, cross a pass and land. Smooth control, wind sound, speed sensation, close passes and an immediate retry are the attraction. Geography changes which path is possible, not an answer entered between flights.

First minute: launch above a coastal headland; a direct approach loses altitude before a high saddle. Observe warm bare ground, sun/shade and sea-breeze direction. Bank into a thermal, circle until above the saddle, dive through the gap, then flare into the finish. A shallow approach lands short safely; retry in under two seconds with a ghost of the last trajectory. First course teaches one physical observation by doing, with a short Hebrew consequence caption after landing. Don't add a package, delivery job, quiz or generic stamina currency.

Controls: A/D or pointer bank, W/S pitch, Space modest airbrake, R retry, Escape pause; touch two-axis steering plus brake/retry. Instrument HUD: altitude, airspeed/vertical speed, wind direction, compact map, level objective and combo. Ordinary sensory cues are leaves/windsock/cloud motion and a variometer; optional help visualizes lift. Late levels remove solution columns, not the instruments required to reason. No required aviation precision, real training claim or frightening crash/death.

Simple arcade flight: explicit airspeed, sink and bank response; altitude is a resource. Wind is a vector added to ground motion, not extra airspeed. Too steep a bank costs height; dive trades height for speed; wings do not create free energy. Lift fields are authored and linked to sun, ground thermal properties and slope/wind orientation. Check the FAA weather chapter linked in docs/research/IDEAS.md for the soaring extension. Thermal strength is not inferred from color alone. Tuning constants are game values, not real flight/weather predictions.

Camera/art: close chase camera with horizon visibility and restrained bank lag; broad atmospheric vistas, rounded chalk cliffs, deep blue sea, warm ochre ground, teal/cream sailplane, painted materials and deliberate cloud shadows. No floating industrial diorama, city dashboard or neon sci-fi rings. Target should make the steep terrain and flying line legible. World occupies most of the screen; HUD never covers the next turn.

## Learning contract

Primary sources: docs/curriculum/g8-weather.md and g8-sun.md; transfer context: g9-climate.md and g9-belts.md. Map canonical module URLs to all levels. Differential heating causes rising air and local circulations; daytime sea breeze and night land breeze reverse under the authored calm local conditions; windward slope can produce lift, lee can produce sink; relief and sea proximity affect weather patterns. Daily weather is not climate. Ridge/thermal soaring is an applied extension, not a named Workbook module. Rain-shadow content needs the actual Israel climate source. Avoid overgeneralizing a single wind example to the whole atmosphere.

## 24 levels — each must be playable

| # | Hebrew mission / new decision | Constraint or misconception / learning evidence |
|---|---|---|
| 1 | כנפיים ראשונות — coast launch, bank and land | Safe low ridge establishes sink and a real finish/retry; controls taught in-world. |
| 2 | הרוח מהים — daytime crosswind changes ground track | Choose a heading accounting for local sea-to-land breeze; direct pointing drifts short. |
| 3 | קיצור מסוכן — low fast gap versus longer supported line | Speed score competes with altitude reserve; no invisible auto-correction. |
| 4 | חוף חדש — transfer of the first wind rule | Mirror shoreline and change launch; wind cue, not memorized left/right, selects route. |
| 5 | אדמה מתחממת — dry sunlit patch versus cool wet patch | Differential heating and moisture explain lift; same patch colors can vary by moisture. |
| 6 | צל ענן — cloud shadow weakens the usual climb | Wait/route around shadow instead of assuming fixed glowing rings. |
| 7 | סיבוב רחב — stay in a thermal without excessive bank | Flight skill and identifying lift combine; variometer gives feedback. |
| 8 | אותו צבע, חום אחר — novel surfaces with explicit properties | Reject color-only heuristic; surface/time evidence drives first unaided choice. |
| 9 | צד הרוח — ridge lift on the windward face | Wind arrow + real slope direction; crossing to lee loses height. |
| 10 | מעבר ההרים — conserve height before a saddle | Terrain elevation changes a feasible crossing; scan map/altitude. |
| 11 | הרוח הסתובבה — a familiar ridge with reversed wind | Swap viable side; layout memorization fails fairly. |
| 12 | רכס לא מוכר — no lift overlay | Transfer windward reasoning using cloud/windsock + instruments. |
| 13 | שקיעה בחוף — thermal weakens as sunlight fades | Timing matters; weather changes within a run, not a claim of climate change. |
| 14 | בריזת לילה — local land-to-sea breeze | Reverse local high/low heating setup under calm scripted conditions. |
| 15 | מהעמק להר — daytime valley upslope route | Different terrain/time determines local flow, not sea-breeze copy. |
| 16 | לילה בעמק — downslope flow changes landing approach | Changed local wind requires a different line; safe recovery. |
| 17 | הכרמל והים — coast-to-ridge chain | Sea proximity + orientation combine; schematic Carmel, not exact GIS. |
| 18 | צל הגשם — contrasting sides of an eastern slope | Air rises/cools upwind and dries downstream; climate context is long-term. |
| 19 | מרחבי הנגב — sparse lifts over desert course | Dry ground and sun timing; finite glide reserve, not endless boost. |
| 20 | יום קריר בהר — elevation and sun differ together | Choose evidence over 'south=always hotter'; source-backed general relationship. |
| 21 | רק התחזית — plan before launch from unfamiliar conditions | New landscape/time/wind; no solution overlay, optional hint recorded. |
| 22 | הרוח משתנה — short cue before direction shift | React with landable alternate line; no untelegraphed random failure. |
| 23 | המסלול שלכם — two viable routes, different risks | Optimize score with geography; fast risky route versus higher supported route. |
| 24 | אלופי הרוח — final novel coast/ridge/dry-ground expedition | Unaided transfer of heating + local wind + relief; genuine finish, replay and learning summary. |

Levels 1–4 are the first development milestone; completion requires all 24, not a generator relabeling one course. Use authored maps/conditions with escalating geometry, routes and constraints. Three medals: finish, control skill, unaided environment decision; report them separately. A fast pilot cannot brute-force a no-lift climb, but a learner can use an accessible slow-assist mode. Progress saved locally; replay any completed level.

## Tripo brief

First useful asset: original stylized **Windshift Riders compact unpowered sailplane**, cream fuselage, teal wings, small ochre tail, no logo/text, clear wing silhouette, one rigid object. Second optional: weather station/windsock assembly for landmarks. Procedural exact terrain/cloud cues/colliders. A sailplane doesn't need a character rig. If adding a visible pilot with deforming body motion, Tripo rig/animation is required; don't create this dependency for the first slice. Use docs/COMMON.md credit/ownership limits.

## Acceptance and review

Playtest real inputs: finish 1, fail and instantly retry 3, reversed wind 11/14, surface-color trap 8, no-overlay 12 and final 24. QA must show that changing the wind/sun fields changes the correct route without changing a hidden answer variable. Rule tests: no positive altitude gain outside lift without energy trade; bank/stall stability; landable alternate; pause/advanceTime; sampled level reachability with valid lift. Test late levels independently, not only from designer playthrough. No guaranteed learning claim.

Compare real captures to generated targets for chase camera, horizon, terrain proportions, sailplane visibility, light, restrained Hebrew HUD and motion cues. Deliver all common docs, tests, 24 levels, runtime Tripo model and a running local URL. Commit/push main throughout.
