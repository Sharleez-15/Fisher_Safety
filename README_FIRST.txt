FISHER SAFETY — DOUBLE-CLICK STARTER

1. Extract this ZIP first (right-click the ZIP > Extract All).
2. Open the extracted FisherSafety_DoubleClick folder.
3. Double-click START_FISHER_SAFETY.bat.
4. The first time, a small box asks for your NEW AccuWeather API key. Paste it there and choose Save and continue. The key is saved locally on this computer; it is not included in this ZIP.
5. If Windows says Node.js is missing, install the LTS version from the official page that opens. Then double-click START_FISHER_SAFETY.bat again.
6. The app opens in your browser at http://localhost:3000. Keep the black server window open while using it.

IMPORTANT
- Do not open public/index.html directly. Always use START_FISHER_SAFETY.bat so the weather server runs.
- Use a newly generated AccuWeather key. The key previously pasted into chat should be regenerated and not reused.
- If AccuWeather shows 401 or 403, the key or your AccuWeather subscription may not permit the requested endpoint.
- Location works best after choosing Allow in Chrome. If GPS is unavailable, choose your area in the app.
- Forecasts are not official marine warnings. Confirm conditions with official marine bulletins before sailing.
- SOS remains a demonstration and does not contact rescue services.

DESTINATION DIRECTION UPDATE
- The compass bearing is calculated from your current GPS coordinates to the selected destination coordinates. It is a true-north bearing, not wind direction.
- When GPS is allowed, the app keeps updating your position and recalculates the bearing as you move. The GPS accuracy is shown beside the location icon.
- If you select your current area manually, the direction is approximate because the app uses the area's selected point/centre.
- The bearing and straight-line distance are not a navigable or safe route.
