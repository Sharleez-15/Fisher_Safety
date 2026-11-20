# Fisher Safety — developer handover
Updated 2026-11-20

## Source and repository
GitHub: https://github.com/Sharleez-15/Fisher_Safety. The previous plan and handover were derived from the original project archive and six development-chat exports. Current GitHub default branch was inspected before this change.

## Architecture
- `index.html`: existing self-contained Bangla/English frontend at repository root (kept in place, not replaced by a different ZIP version).
- `server.js`: Express local server and API routes; explicitly serves root `index.html`.
- `weather-service.js`: AccuWeather location, current conditions and forecast mapping, in-memory five-minute cache; dependency-injectable `fetch`.
- `weather-service.test.js`: mocked unit tests, no real key required.
- `.github/workflows/tests.yml`: runs tests on pushes and PRs.

## Current functionality and limitations
- AccuWeather key read only from backend environment; authentication via `apikey` query parameter. A valid provider key and API entitlement have **not** been tested.
- Frontend uses upstream `fetched` timestamp and shows explicit warning on failed live weather refresh. Cached values are not live conditions.
- Reduced-motion user preference overrides visual animations.
- Assistant API returns 503 and UI uses labeled generic offline guidance; no live AI.
- SOS is simulated, not delivered to any responder.
- Bearing points at destination; no ocean routing or hazard screening.

## Run / verify
`npm ci && npm test && npm start`, then http://localhost:3000. Add a fresh server-side `ACCUWEATHER_API_KEY` in `.env` to test live weather. The health endpoint confirms only that a key is present, not that the provider accepts it.

## Unverified
Actual provider calls, responsive browser rendering on device, production security, Bangla speech quality, real SOS and navigation safety. Do not promote this prototype for actual decisions at sea.

## Next developer
Verify live weather and provider plan; test stale/offline UI; avoid editing root HTML and alternative frontend variant without a reviewed merge; add browser smoke tests and user-tested audio-first flows before introducing real AI.
