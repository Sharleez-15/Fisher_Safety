# Development update — 2026-11-20

## GitHub continuation
Reconciled the previous local candidate with the actual `main` branch. GitHub's root `index.html` contains a different latest visual motion patch than the prior local ZIP. Preserved the repository's root frontend and made focused correctness changes instead of overwriting its visual work.

## Changes in this branch
- Correct AccuWeather `apikey` auth on the backend; keep secrets out of the frontend.
- Extract testable weather data mapping and bounded cache.
- Preserve upstream fetch timestamp instead of regenerating it when the browser reads a response.
- Clarify unavailable-live-weather state even if a saved forecast renders.
- Respect reduced-motion settings.
- Explicit health capability flags and 503 for unfinished AI API.
- Add four unit tests and GitHub Actions test workflow.
- Serve root `index.html` on `/` to match the actual repository layout.

## Evidence and gaps
The weather-service unit tests were run locally on the candidate version: 4 passed. This reconciled GitHub variant requires CI verification. No real AccuWeather key call, mobile browser test or SOS-delivery test performed. Do not represent this as seaworthy software.
