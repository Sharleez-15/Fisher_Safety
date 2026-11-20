# Fisher Safety — development plan

## Goal
A Bangla-first, visual and voice-assisted safety companion for fishermen in Bangladesh, with clear limitations when connectivity or information is unavailable.

## Verified prototype scope
- Weather display: conditions, visibility, pressure, wind speed, gusts, wind direction and 5-day provider forecast
- GPS/location selection and a **straight-line bearing** to a destination (not a navigable route)
- Visual explanation animations and Bangla/English UI
- Offline generic guidance, **not AI**; simulated SOS, **not dispatch**

## Prioritized delivery
1. **P0 — Data integrity:** key never in browser or git; correct AccuWeather auth; reliable timestamps and stale warnings; fail closed on missing data; tests.
2. **P0 — Device validation:** live provider call with entitled key; Bangladesh coastal location coverage; error/quota responses; Android Chrome, GPS denial, no network, low memory, reduced-motion, Bangla speech.
3. **P1 — Usability:** field study with fishermen; larger unambiguous icons, audio playback with explicit provenance, no green/safe-to-sail interpretation from incomplete data.
4. **P1 — Offline:** stored timestamped data + explicit outdated badge; preloaded non-dynamic checklists; design without assuming live connectivity.
5. **P2 — Real AI:** separately reviewed API and Bangla-language evaluation with citations and no fabricated observations.
6. **P2 — Emergency workflows:** design verified recipients, coverage requirements, confirmation receipts, failure states and privacy controls before enabling real SOS.
7. **P3 — Marine navigation:** only with validated charts, hazard awareness and professional domain review; do not reinterpret bearing as a safe path.

## MVP acceptance
- User can always identify the last observation time, provider availability and stale state.
- Invalid key, rate limit, offline state or missing weather values never look like zero or safe conditions.
- No UI language suggests the prototype sends an SOS or provides a reliable maritime route.
- Unit tests, GitHub checks and physical device test plan pass.
- Field stakeholders review warning language and interaction model.

## Security
Rotate any API key previously pasted into conversation or published. Protect any future location traces and incident logs.
