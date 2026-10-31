# Windshift Riders assets

## Original Tripo sailplane — runtime asset

- Origin: [Tripo task 19af4b07-3f49-41ce-89b2-734012328995](https://studio.tripo3d.ai/workspace/generate/19af4b07-3f49-41ce-89b2-734012328995)
- Acquisition: normal Tripo Studio UI in the user's Chrome, dedicated `🪁 Windshift Riders` tab 512281213; My Assets inspected first. No raw API calls, hidden credentials, or another crew's tab.
- Basis: original text prompt commissioned by the user on their signed-in Tripo account. No gallery asset or third-party character used. The account menu visibly showed Pro, and generation was Private. [Tripo official paid-output rights](https://www.tripo3d.ai/help/privacy-policy/how-to-use-tripo-models-commercially) include use, modification and distribution; the [official pricing documentation](https://www.tripo3d.ai/product-doc/getting-started/pricing-credits) confirms private paid outputs are user-owned. Those visible conditions supply the packaging basis. No new agreement was accepted.
- Generation settings: HD Model, H3.1 Best Quality, Geometry & Texture, Private, no 8K trial, no parts trial.
- Displayed cost: 30 credits before submission. Own crew spend: 30 / 600 credits, 2 / 3 total generation attempts including the free quality retry. Balance shown 3,200 before and 3,140 after submission; the account is shared by simultaneous crews, so the balance delta is not an exclusive crew cost ledger. No purchase or upgrade.
- Rigid vehicle: no skeleton, rig or animation clips required; runtime banking/pitch is a rigid transform. No deforming pilot.
- Runtime path: `public/models/sailplane.glb`.

Exact submitted prompt:

> Original Windshift Riders stylized compact unpowered sailplane for a browser flying game. Single rigid aircraft, no pilot, no propeller, no engine, no landing stand or ground. Long thin straight teal wings with rounded cream tips, cream slender fuselage, dark blue glass canopy, small ochre tail and vertical fin. Clear elegant glider silhouette, clean painted low-poly game asset, consistent simple materials, whole aircraft centered, no text, no logos. Nose points forward, wings level, all parts connected.

Final retry output downloaded successfully via normal GLB Export, 2k textures. Source/runtime size: 2,316,952 bytes (2.21 MiB); no lossy optimization needed to meet the <=3 MB target. SHA-256 `463c162885f675fe06725c81f5901978cfbe8f2ea48edb7eebf90720222f10d2`. One mesh/node, 19,336 faces, 11,848 vertices, 3 embedded images; no external URI, skins, or animation clips. Packaging validation: `python3 scripts/art-inspect-glb.py public/models/sailplane.glb`; machine-readable result in `docs/visual-targets/sailplane-packaging.json`.

Final source coordinates: Y up; wings along Z; nose points toward -X (tail fin high vertices at +X). Bounds X[-0.29727,0.29727], Y[0,0.17140], Z[-0.5,0.5]. Runtime aligns game forward -Z with Y rotation -π/2, then centers using Box3 and normalizes span to 21 game metres. Width after rotation is 1 source unit, length 0.5945. Rigid flight transforms apply to a parent group. The temporary asset viewer uses the opposite +Z orientation simply to inspect the nose. The inspected retry has no propeller; original rejected version remains intermediate only.

## Design targets

`docs/visual-targets/day-target.png` and `night-target.png` were generated with built-in imagegen before implementation. Exact prompts, tool result paths and visual inspection notes are stored alongside them. They are mockups, not runtime screenshots.

## Procedural scene

Terrain, water, clouds, wind cues, routes and exact colliders are authored game geometry. The Tripo glider geometry is visual only and is not a geography/flight physics authority.

## Quality retry

The first output was rejected from runtime packaging because it added two propeller-like nose rods despite the negative prompt. A normal UI `Free Retry (×3)` was submitted (same task URL), displayed additional cost 0; this is generation attempt 2 / 3. Account balance at this action was 3,080, reflecting other crews as well. No unrelated job was cancelled.

Exact retry prompt:

> A pure unpowered sailplane glider, extremely long slender straight wings, wingspan three times fuselage length, NOT an airplane. Smooth rounded cream nose entirely bare, no propeller, no rotor, no engine, no motor, no nose rods, no landing gear. Single cream slender teardrop fuselage with small dark blue bubble canopy, long thin teal wings with cream tips, ochre T tail. Original Windshift Riders stylized painted low-poly game asset, clean rigid connected geometry, whole aircraft only, wings level, no person, no ground, no text, no logo.

Model load/appearance verification: a separate temporary Three.js GLTFLoader viewer loaded the final packaged GLB through the running local Vite server without application errors; top-oblique inspection is `docs/visual-targets/model-inspection.png` (asset inspection, not gameplay). This confirmed attached wings, smooth unpowered nose and final orientation. The source inspection shows a warmer yellow/ochre fuselage than the cream design target, with teal wings and dark canopy. The runtime shader correction described below resolves that source palette mismatch.

Rejected first-version source (intermediate only): 2,643,480 bytes; SHA-256 `20c86bc7df00223b6a9efdbc8decb4f2189f3246ed411584e5f3f1b1d4263a48`. It is not packaged or rendered. Final observed shared account balance was 3,050, without any further crew spending; concurrent jobs make that an account snapshot only.

Runtime palette adjustment: Three.js material shader selectively moves the source yellow fuselage toward warm cream and preserves teal wing texture. The packaged GLB bytes remain unchanged. Actual day/night browser captures confirm the adjustment rendered successfully; this is a visual material treatment, not changed flight geometry or an added rig.

## Bundled Hebrew font

Assistant Hebrew weights400/600/700 from pinned `@fontsource/assistant@5.3.0`, SIL Open Font License1.1. The license is distributed as `public/licenses/Assistant-OFL.txt`. Font files are bundled by Vite; no Google Fonts request is made at runtime.
