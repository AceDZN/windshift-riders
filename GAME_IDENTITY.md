# Windshift Riders — רוכבי הרוח

Original commission: fun-first Hebrew browser 3D geography flight for grades 8–9; 24 authored levels. This is an arcade interpretation of local weather, not flight training or a weather forecast.

## Play
The opening launches directly toward three generous gold-and-cream fabric passages above a headland. Left/right taps are sufficient in the first course; a first visible crossing arrives after about five seconds. Passing the actual arch plane produces a chime, gold flecks and a clear perfect/edge reward. The next objective becomes prominent immediately. After the three passages, visible landing assistance steers and brakes using the same flight controls, reaching a physical meadow landing; a manual override is available. The first two flights take around forty seconds with a gentle assisted approach, and the player can complete that assistance quickly. There is no tight braking spiral or unexplained precision landing requirement.

Later courses require climbing in useful rising air, choosing windward slopes and anticipating changes. The three medals remain completion, course control and a physical environment decision without hints/slow assist. Environmental evidence is collected before automatic approach, never created by it. Replay any course for cleaner passages, proximity bonuses and a faster score. Only new best progress toward the current passage earns distance points; circling does not farm airborne-time score.

Altitude, airspeed, bank, ground track and lift change continuously. Wind moves ground track without changing airspeed. Pitch exchanges height and kinetic energy; bank and brakes incur losses. Sun, moisture, cloud shadow, wind direction and terrain slope determine lift through shared physical fields. No answer variable, delivery object, quiz gate or renewable boost currency.

## Controls
Physical A/D or left/right turn; W/up climbs using airspeed reserve; S/down dives; Space brakes; R retries; Escape/P pauses; H hints; M mutes; F toggles fullscreen. Drag upward climbs, drag sideways turns, and release levels the wings promptly. An explicit visible drag stick and steering reticle avoid surprise hover steering. Holding climb at low airspeed trims the pull-up instead of demanding a stall. Optional slow assist gives more reaction time at80% simulation speed. Automatic landing is on by default, is announced clearly after the physical passages, and can be disabled in settings or during approach. Forecasts are visible before launch in weather-dependent courses; advanced instruments become more prominent after the opening. Late levels retain instruments but remove solution overlays.

## Visual and sound identity
Visual thesis: expansive sun-washed chalk coast and ochre relief, painted surfaces, deep Mediterranean blue and a tiny cream/teal sailplane, viewed close from behind with a legible horizon. The terrain is schematic; when Israel labels appear the sea is west and the highlands are inland/east. World fills at least 85% of the view. Sparse Hebrew HUD places objective at top right, course progress above, altitude/speed/variometer at bottom right, compact compass/map at bottom left. Two tonal families, one ochre action accent, no dashboard grid or neon solution rings.

Content plan: live world as the anchor, brief launch forecast, instrument HUD during play, compact result with one cause/consequence line. Interaction thesis: banked wing plus restrained camera lag; cloud/leaf drift revealing air movement; a ghost trajectory and immediate restart turning failure into replay. Reduced motion removes camera roll/shake and reduces particles. Wind sound follows airspeed; rising variometer notes reflect net vertical motion; landing resolves with a soft chime. Audio starts only after user interaction and can be muted.

## Campaign
Six acts of four: coastal control and drift; surface heating and cloud shadows; windward/lee ridges; sunset/night/valley reversals; Carmel/rain shadow/Negev/elevation; forecast-only and changing-wind transfer. All 24 use authored geometry, conditions and constraints per BUILD_HANDOFF.md. The first four are a milestone, never completion.

## Sequence and evidence
Identity precedes two built-in imagegen design targets, their inspection, then a Tripo UI asset pass in the human's Chrome. Runtime implementation follows. Generated frames are design targets, never represented as captures. Real browser controls, pure rule tests, screenshots and target comparison establish implementation evidence; no student learning gain is claimed.


## Actual player feedback revision
The first release passed technical feasibility checks but the human found it confusing, strange, boring and too hard. That feedback triggered the controller, opening, reward, landing and scene redesign above. Automated route witnesses remain feasibility evidence; no test suite or screenshot establishes human enjoyment. New browser checks use simple opening inputs rather than a numerical pilot to establish basic accessibility.


## Pitch and landing feel correction
A second human playtest still found the nose dive and landing strange. Manual descent now targets a bounded air-relative glide angle; vertical response and airbrake deployment ease progressively. The rendered nose follows that actual air-relative path, while thermal motion remains separate. Landing uses a broad wind-aware setup and final, a genuinely prepared flat meadow and a low-sink flare, with a physical energy reserve. Approach metadata is explicit, persists beyond the initial activation radius, and can be overridden or completed quickly through the same simulation. Technical reachability alone remains insufficient evidence of comfortable human control.
