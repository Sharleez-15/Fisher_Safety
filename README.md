# Fisher Safety — prototype

Bangla-first visual weather and safety companion for Bangladeshi fishermen.

**NOT FOR MARITIME SAFETY DECISIONS.** This is a prototype, not a certified weather-warning, navigation or emergency-dispatch service. A direction arrow shows bearing, not a safe marine route. The SOS button is a simulation. Live AI is not configured.

## Local run

1. Install Node.js 20+ and run `npm ci` (or `npm install`).
2. Copy `.env.example` to `.env`, set a **new** AccuWeather API key. Never commit secrets.
3. Run `npm start` and open http://localhost:3000 (do not open index.html as a file).
4. Run `npm test` to execute mocked API tests.

`GET /api/health` reports configured features, not provider connectivity. `GET /api/weather?lat=22.2&lon=90.6` requires an entitled AccuWeather account and valid key. `POST /api/assistant` explicitly returns 503 until live AI exists.

Read [PLAN.md](PLAN.md), [HANDOVER.md](HANDOVER.md) and [DEVELOPMENT_UPDATE.md](DEVELOPMENT_UPDATE.md) before building.
