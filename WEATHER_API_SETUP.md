# How to connect AccuWeather to Fisher Safety

The current project uses **AccuWeather on the Node.js backend**. Never place the API key in `index.html`, Android code, Gradle files or any client-side configuration. No API key is required to compile the Android app.

## 1. Obtain a provider key
1. Create or sign into an AccuWeather developer account and register an application in the provider's developer portal.
2. Obtain an API key authorized for the endpoints the code uses. Confirm current plan limits, geographic coverage and allowed use with AccuWeather.
3. If an old key has appeared in a chat, screenshot, ZIP, or public commit, **revoke/rotate it** first.

## 2. Configure the Node server
From the repository root (where `server.js` lives):

```bash
npm ci
cp .env.example .env
```

Edit `.env` (do not commit it):
```dotenv
ACCUWEATHER_API_KEY=YOUR_PRIVATE_ACCUWEATHER_KEY
PORT=3000
```
Replace the placeholder with your real key. Keep the entire .env file private.

For Windows PowerShell:
```powershell
Copy-Item .env.example .env
npm ci
npm start
```
For macOS/Linux: `npm start`.

## 3. Check configuration
Open `http://localhost:3000/api/health`; it should show `accuWeatherConfigured: true` when a non-placeholder key is present. **This does not mean the provider call succeeded.**

Make a real provider request from your computer:
```bash
curl "http://localhost:3000/api/weather?lat=22.2&lon=90.6"
```
A successful response includes `source: "AccuWeather"`, `weather.observation_time`, `fetched`, and forecast fields. Inspect the units and timestamp. Test a valid fishing area rather than assuming coverage.

Common failure responses:
- **401**: rejected/revoked API key
- **403**: key does not have permission for an endpoint
- **429**: quota or rate limit exceeded
- **502**: unexpected provider response, outage, or network issue
- **503**: no usable key configured

The server currently requests a location lookup, current conditions, and a five-day forecast (three upstream requests per uncached location). It caches results in memory for five minutes per rounded coordinate. Ensure the provider plan supports this request volume.

## 4. Host securely for Android
Your Android phone cannot use your computer's `localhost`. Deploy the existing Node server to a hosting platform supporting Node.js, set `ACCUWEATHER_API_KEY` as a **server-side environment secret**, configure TLS/HTTPS, and test:
- `https://YOUR-HOST/api/health`
- `https://YOUR-HOST/api/weather?lat=22.2&lon=90.6`

The Android WebView requires a valid HTTPS origin. Configure `fisherBaseUrl` with your HTTPS host as described in [android/README.md](android/README.md).

## 5. Important limitations
AccuWeather current conditions and daily forecasts **are not verified marine safety warnings** or maritime navigation data. The UI cannot determine whether it is safe to go to sea. If provider access fails, the app must display clear stale/offline warnings. The app's SOS button remains a demo and does not dispatch a rescue request.

Keep the API key secret, monitor provider quota, and do an actual device test before demonstrating the project.
