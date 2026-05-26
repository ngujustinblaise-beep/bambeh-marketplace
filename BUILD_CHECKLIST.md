# Bambé Android Build Checklist ✅

## Phase 1: Environment Setup

- [ ] Install Node.js (v18+)
- [ ] Install Android Studio (latest)
- [ ] Install JDK 17
- [ ] Set JAVA_HOME environment variable
- [ ] Set ANDROID_HOME environment variable
- [ ] Verify installations:
  ```bash
  node --version
  java -version
  ```

## Phase 2: Project Initialization

- [ ] Navigate to project folder
- [ ] Run `npm install`
- [ ] Run `npm run build` to verify React build works
- [ ] Check that `dist/` folder was created

## Phase 3: Capacitor Setup

- [ ] Run `npx cap add android`
- [ ] Verify `android/` folder was created
- [ ] Run `npx cap sync android`
- [ ] Check for any errors in terminal

## Phase 4: Android Studio Configuration

- [ ] Run `npx cap open android`
- [ ] Wait for Android Studio to open
- [ ] Click "Trust Project" if prompted
- [ ] Wait for Gradle sync (5-10 minutes first time)
- [ ] Install any missing SDK components

## Phase 5: Device Setup

### Option A: Emulator
- [ ] Tools → Device Manager
- [ ] Create Virtual Device
- [ ] Choose: Pixel 6, API 33+
- [ ] Start emulator

### Option B: Physical Device
- [ ] Enable Developer Options on phone
- [ ] Enable USB Debugging
- [ ] Connect phone via USB
- [ ] Allow USB debugging on phone
- [ ] Verify device shows in Android Studio

## Phase 6: First Build

- [ ] Click green "Run" button in Android Studio
- [ ] Select device/emulator
- [ ] Wait for build (may take 5-10 minutes)
- [ ] App should launch on device
- [ ] Verify app works correctly

## Phase 7: App Customization

- [ ] Update `android/app/build.gradle`:
  - [ ] Check `applicationId`
  - [ ] Set `versionCode` to 1
  - [ ] Set `versionName` to "1.0"

- [ ] Update `android/app/src/main/res/values/strings.xml`:
  - [ ] Set app name to "Bambé"

- [ ] Add app icons (see SETUP_ANDROID.md)

- [ ] Add splash screen image

## Phase 8: Testing

- [ ] Test on emulator
- [ ] Test on at least 2 physical devices
- [ ] Test different screen sizes
- [ ] Test all main features:
  - [ ] Browse jobs
  - [ ] Browse products
  - [ ] Browse services
  - [ ] Authentication
  - [ ] Subscription flow
  - [ ] Payment integration

## Phase 9: Release Build

- [ ] Generate signing keystore:
  ```bash
  keytool -genkey -v -keystore bambe-release.keystore -alias bambe -keyalg RSA -keysize 2048 -validity 10000
  ```

- [ ] Update `build.gradle` with signing config

- [ ] Build release APK:
  ```bash
  cd android
  ./gradlew assembleRelease
  ```

- [ ] Test release APK on device

- [ ] Build App Bundle for Play Store:
  ```bash
  ./gradlew bundleRelease
  ```

## Phase 10: Deployment

- [ ] Create Google Play Console account ($25)
- [ ] Create app listing
- [ ] Upload screenshots (at least 2)
- [ ] Write app description
- [ ] Upload app bundle (.aab file)
- [ ] Fill in all required metadata
- [ ] Submit for review

## Common Commands Reference

```bash
# Build React app
npm run build

# Sync to Android
npm run android:sync

# Open in Android Studio
npm run android

# Run on device
npm run android:run

# Full rebuild
npm run build && npm run android:sync
```

## Troubleshooting Quick Fixes

**White screen:**
```bash
npm run build
npx cap sync android
```

**Changes not showing:**
```bash
cd android
./gradlew clean
cd ..
npm run build
npm run android:sync
```

**Gradle sync failed:**
```bash
cd android
./gradlew clean
./gradlew build
```

## Success Criteria

✅ App launches without crashes
✅ All tabs (Jobs, Store, Services) work
✅ Terms & Conditions screen appears on first launch
✅ Authentication flow works
✅ Subscription banner appears
✅ App is responsive on different screen sizes
✅ No console errors in Logcat
✅ App performance is smooth (60 FPS)

---

**Need Help?** Check SETUP_ANDROID.md for detailed instructions
