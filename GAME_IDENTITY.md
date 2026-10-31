# Windshift Riders — רוכבי הרוח

Original commission: fun-first Hebrew browser 3D geography flight for grades 8–9; 24 authored levels. This is an arcade interpretation of local weather, not flight training or a weather forecast.

## Play
The first minute launches a compact rigid cream-and-teal sailplane above a chalk headland. Bank toward a pair of fabric course flags, hear the variometer respond over warm dry land, cross the saddle, and brake into a marked landing meadow. Later a direct glide cannot clear the high saddle: circle rising air, then spend the gained height on a fast dive. A low approach settles safely short; R immediately returns to launch and the last trajectory becomes a faint ghost. A finish opens the next course and records three separate medals: completion, flight control and an unaided environmental decision. Replay any level for time/proximity score, a cleaner landing or a different route.

Altitude, airspeed, bank, ground track and lift change continuously. Wind moves ground track without changing airspeed. Pitch exchanges height and kinetic energy; bank and brakes incur losses. Sun, moisture, cloud shadow, wind direction and terrain slope determine lift through shared physical fields. No answer variable, delivery object, quiz gate or renewable boost currency.

## Controls
Physical A/D or arrows bank; W/S or up/down pitch; Space airbrake; R retry; Escape/P pause; H hint; M mute; F fullscreen. Pointer drag and an on-screen touch stick steer, with large brake and retry controls. Optional slower assist lowers time pressure while retaining the same fields. Reading the forecast occurs while paused before launch. Late levels hide lift hints; the wind instrument and world cues remain.

## Visual and sound identity
Visual thesis: expansive sun-washed chalk coast and ochre relief, painted surfaces, deep Mediterranean blue and a tiny cream/teal sailplane, viewed close from behind with a legible horizon. The terrain is schematic; when Israel labels appear the sea is west and the highlands are inland/east. World fills at least 85% of the view. Sparse Hebrew HUD places objective at top right, course progress above, altitude/speed/variometer at bottom right, compact compass/map at bottom left. Two tonal families, one ochre action accent, no dashboard grid or neon solution rings.

Content plan: live world as the anchor, brief launch forecast, instrument HUD during play, compact result with one cause/consequence line. Interaction thesis: banked wing plus restrained camera lag; cloud/leaf drift revealing air movement; a ghost trajectory and immediate restart turning failure into replay. Reduced motion removes camera roll/shake and reduces particles. Wind sound follows airspeed; rising variometer notes reflect net vertical motion; landing resolves with a soft chime. Audio starts only after user interaction and can be muted.

## Campaign
Six acts of four: coastal control and drift; surface heating and cloud shadows; windward/lee ridges; sunset/night/valley reversals; Carmel/rain shadow/Negev/elevation; forecast-only and changing-wind transfer. All 24 use authored geometry, conditions and constraints per BUILD_HANDOFF.md. The first four are a milestone, never completion.

## Sequence and evidence
Identity precedes two built-in imagegen design targets, their inspection, then a Tripo UI asset pass in the human's Chrome. Runtime implementation follows. Generated frames are design targets, never represented as captures. Real browser controls, pure rule tests, screenshots and target comparison establish implementation evidence; no student learning gain is claimed.
