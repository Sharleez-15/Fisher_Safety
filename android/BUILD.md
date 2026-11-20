# Build system note

This source project targets Android Gradle Plugin 8.7.3 (Gradle 8.9, JDK 17) and Android SDK 35. The Gradle wrapper JAR and scripts are **not bundled**, because this environment cannot retrieve or validate the binary wrapper.

Install a trusted Gradle 8.9 distribution locally, or have Android Studio generate wrapper files. From a terminal with Gradle 8.9 available, inside `android/` run:

```bash
gradle wrapper --gradle-version 8.9
./gradlew assembleDebug
```

On Windows, use `gradlew.bat assembleDebug`. Review the generated wrapper and commit it from a trusted development machine. Never accept untrusted wrapper binaries. See [README.md](README.md) for configuring the HTTPS server URL.

No APK has been compiled or tested as part of this commit.
