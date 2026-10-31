# Gameplay design targets

These generated pictures are design targets, not captures of built software. Runtime evidence belongs in the gameplay captures and VISUAL_REVIEW.md.

Mode: built-in `image_gen.imagegen` via the imagegen skill. Each image uses its own tool call. Exact prompts: `day-prompt.txt` and `night-prompt.txt`.

Review checklist:
- Close third-person chase view, sailplane visible in the lower third and playable horizon.
- Broad chalk relief; sea west of land; ochre surfaces and a readable saddle/landing line.
- Cream-and-teal unpowered sailplane with a recognizable wing silhouette.
- Atmospheric warm daylight and a separately readable night palette.
- Natural wind/lift cues, subtle previous-run ghost, no giant answer columns.
- Sparse Hebrew flight HUD, with world occupying about 85% of the frame.
- Achievable Three.js scene rather than promotional key art.

Generation result paths and inspection notes will be recorded below after the calls complete.

## Generated outputs — 31 October 2026

- `day-target.png`: generated at `/Users/acedzn/.codex/generated_images/01a191ec-51c3-7f20-8a60-236d8ff4dd31/exec-771fd703-a38a-4816-ae8c-7831ea49aa6f.png`.
- `night-target.png`: generated at `/Users/acedzn/.codex/generated_images/01a191ec-51c3-7f20-8a60-236d8ff4dd31/exec-ae25c5fb-8295-4167-930e-48d7c66c07bf.png`.
- Both inspected visually in the tool output before implementation. Day has a strong readable chalk coast, close lower-third sailplane, sparse right HUD, clear horizon and warm relief. The sailplane is more cream than teal and the thermal swirl is brighter than desired: implementation should keep subtle dust/leaves. Night has readable coast, landing shelf and ghost, but four gauges occupy more area than desired; implementation should retain the simpler day HUD. Generated Hebrew order/typography is imperfect, so live HTML text must provide correct RTL. Neither target establishes built game evidence or exact GIS.
