# Fisher Safety Android — Android Studio project

This is an Android WebView **client for a separately hosted HTTPS Fisher Safety server**, not an offline native weather engine or a finished APK. It requires an internet connection for live AccuWeather. Weather credentials belong in the Node backend only.

## Prerequisites
- Android Studio with Android SDK 35 and JDK 17.
- A publicly reachable, trusted **HTTPS** URL hosting the project's `server.js` and `index.html` (for example `https://fisher.example.org/`). `http://localhost:3000` on your computer is **not** reachable as localhost on an Android phone and cleartext HTTP is intentionally disabled.
- A valid AccuWeather key and applicable API entitlement on the backend, configured as described in [WEATHER_API_SETUP.md](../WEATHER_API_SETUP.md).

## Open and build
1. Open the **`android/`** directory as a project in Android Studio.
2. Install the required Android SDK platform and allow Gradle sync. The project uses Android Gradle Plugin 8.7.3 and Java 17.
3. In the project's `gradle.properties` or (preferably) your local `~/.gradle/gradle.properties`, set:
   `fisherBaseUrl=https://YOUR-REAL-HTTPS-SERVER.example/`
   This URL is public app configuration, **not** a secret. Do not add an API key here.
4. Select an emulator or connected Android phone, then click **Run**.
5. For an APK, use **Build > Build Bundle(s) / APK(s) > Build APK(s)** in Android Studio. A debug APK is expected under `android/app/build/outputs/apk/debug/` once built.

No compiled APK or Gradle wrapper JAR is committed. Android Studio/Gradle is required to build this source project; a build was not run in this environment.

## Permissions and security
- Internet access is required to load the hosted application.
- GPS is requested only after the website asks for location; the user can decline.
- Only the configured HTTPS origin stays inside the app; other HTTPS links open outside.
- File/content access and mixed HTTP content are disabled.
- Microphone/camera permission requests are deliberately denied. **Browser speech recognition may therefore be unavailable in this Android build**, even if web features are present.
- Remote code and content are provided by your server. Deploy via HTTPS and protect it.
- SOS is simulated, not a real emergency dispatch system; the compass bearing is not safe routing.

## Quick test checklist
- Test the URL in a phone browser first, including `/api/health`.
- Install and open the Android app on an actual phone.
- Grant and deny location in separate runs; test GPS on and off.
- Check valid, invalid and missing provider keys, rate-limit and airplane mode.
- Verify that no stale observation appears as live weather.
- Test large touch targets, Bengali text and screen orientation.
- Do not publish to Play Store as an emergency or navigation system.
