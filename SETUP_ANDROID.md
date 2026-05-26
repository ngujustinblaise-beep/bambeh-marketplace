# Bambé Android App - Complete Setup Guide

## Prerequisites

### Required Software
1. **Node.js** (v18 or higher)
   ```bash
   node --version  # Should show v18.x or higher
   npm --version   # Should show v9.x or higher
   ```

2. **Android Studio** (Latest version)
   - Download from: https://developer.android.com/studio
   - Install with Android SDK, Android SDK Platform, and Android Virtual Device

3. **JDK** (Java Development Kit 17)
   ```bash
   java -version  # Should show version 17.x
   ```

4. **Git** (for version control)

### Environment Setup

1. **Set JAVA_HOME** (Windows PowerShell)
   ```powershell
   # Add to system environment variables
   $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
   $env:PATH += ";$env:JAVA_HOME\bin"
   ```

2. **Set ANDROID_HOME** (Windows PowerShell)
   ```powershell
   $env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
   $env:PATH += ";$env:ANDROID_HOME\platform-tools"
   $env:PATH += ";$env:ANDROID_HOME\tools"
   $env:PATH += ";$env:ANDROID_HOME\tools\bin"
   ```

## Project Setup

### Step 1: Install Dependencies

```bash
# Navigate to project directory
cd bambe-android

# Install npm packages
npm install

# Verify Capacitor CLI is installed
npx cap --version
```

### Step 2: Build Web Assets

```bash
# Build the React app
npm run build

# Verify dist folder was created
dir dist  # Windows
ls dist   # Mac/Linux
```

### Step 3: Initialize Capacitor Android

```bash
# Add Android platform
npm run cap:add

# Or manually:
npx cap add android
```

This creates the `android/` directory with a complete Android Studio project.

### Step 4: Sync Assets to Android

```bash
# Copy web assets and Capacitor config to Android project
npm run android:sync

# Or manually:
npx cap sync android
```

### Step 5: Open in Android Studio

```bash
# Open Android project in Android Studio
npm run android

# Or manually:
npx cap open android
```

## Android Studio Configuration

### First-Time Setup

1. **When Android Studio Opens:**
   - Click "Trust Project"
   - Wait for Gradle sync to complete (may take 5-10 minutes first time)
   - Install any missing SDK components if prompted

2. **Configure Emulator (if testing on emulator):**
   - Tools → Device Manager
   - Create Virtual Device
   - Choose: Pixel 6 or similar
   - System Image: API 33 (Android 13) or higher
   - Finish setup

3. **Configure Physical Device (if testing on real phone):**
   - Enable Developer Options on your phone:
     - Settings → About Phone
     - Tap "Build Number" 7 times
   - Enable USB Debugging:
     - Settings → Developer Options → USB Debugging
   - Connect phone via USB
   - Allow USB debugging when prompted on phone

### Build Configuration

1. **Open `android/app/build.gradle`**

2. **Update package name if needed:**
   ```gradle
   android {
       namespace "cm.bambe.marketplace"
       compileSdk 34
       
       defaultConfig {
           applicationId "cm.bambe.marketplace"
           minSdk 24
           targetSdk 34
           versionCode 1
           versionName "1.0"
       }
   }
   ```

3. **Update app name in `android/app/src/main/res/values/strings.xml`:**
   ```xml
   <resources>
       <string name="app_name">Bambé</string>
       <string name="title_activity_main">Bambé</string>
       <string name="package_name">cm.bambe.marketplace</string>
       <string name="custom_url_scheme">bambe</string>
   </resources>
   ```

## Adding App Icons

1. **Prepare Icons:**
   - Create app icon (1024x1024 PNG)
   - Create splash screen image (2732x2732 PNG recommended)

2. **Generate Android Icons:**
   - Use Android Asset Studio: https://romannurik.github.io/AndroidAssetStudio/
   - Or use Image Asset tool in Android Studio:
     - Right-click `app/src/main/res`
     - New → Image Asset
     - Follow wizard

3. **Add Splash Screen:**
   - Place image in `android/app/src/main/res/drawable/splash.png`
   - Capacitor will auto-configure splash screen

## Building the App

### Debug Build (for testing)

**Option 1: Using Android Studio**
1. Click "Run" button (green play icon)
2. Select device/emulator
3. Wait for build and installation

**Option 2: Using Command Line**
```bash
# From project root
cd android
./gradlew assembleDebug

# APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Release Build (for distribution)

1. **Generate Signing Key:**
   ```bash
   # Create keystore
   keytool -genkey -v -keystore bambe-release.keystore -alias bambe -keyalg RSA -keysize 2048 -validity 10000
   
   # Enter details when prompted:
   # Password: [Choose strong password]
   # Name: Bambé
   # Organization: Your Company
   # etc.
   ```

2. **Configure Signing in `android/app/build.gradle`:**
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               storeFile file('../../bambe-release.keystore')
               storePassword 'your-password'
               keyAlias 'bambe'
               keyPassword 'your-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   
   # APK will be at:
   # android/app/build/outputs/apk/release/app-release.apk
   ```

4. **Build App Bundle (for Play Store):**
   ```bash
   cd android
   ./gradlew bundleRelease
   
   # Bundle will be at:
   # android/app/build/outputs/bundle/release/app-release.aab
   ```

## Development Workflow

### Making Changes to Web Code

```bash
# 1. Make changes to src/ files
# 2. Rebuild
npm run build

# 3. Sync to Android
npm run android:sync

# 4. Run app
npm run android:run
```

### Live Reload (Development Mode)

```bash
# 1. Start dev server
npm run dev

# 2. Update capacitor.config.ts:
server: {
  url: 'http://192.168.1.100:8080',  # Your computer's IP
  cleartext: true
}

# 3. Sync and run
npm run android:sync
npm run android:run

# Now changes in src/ will hot-reload in the app!
```

## Testing

### On Emulator
```bash
# Start emulator from Android Studio or:
emulator -avd Pixel_6_API_33

# Run app
npm run android:run
```

### On Physical Device
```bash
# Connect phone via USB
# Enable USB debugging
# Run app
npm run android:run
```

## Troubleshooting

### Common Issues

**1. Gradle Sync Failed**
```bash
cd android
./gradlew clean
./gradlew build
```

**2. "Android SDK not found"**
- Set ANDROID_HOME environment variable
- Restart terminal/Android Studio

**3. "Command not found: capacitor"**
```bash
npm install -g @capacitor/cli
```

**4. White screen on app launch**
```bash
# Check browser console in Android Studio:
# View → Tool Windows → Logcat
# Filter: "Chromium"
```

**5. Changes not reflecting**
```bash
# Full rebuild
npm run build
npx cap sync android
cd android
./gradlew clean
./gradlew assembleDebug
```

**6. "Cleartext HTTP traffic not permitted"**
- Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

## App Permissions

Configure in `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest>
    <!-- Internet access -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Network state -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Camera (if using) -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- Location (if using) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- Storage (if using) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <!-- Vibration -->
    <uses-permission android:name="android.permission.VIBRATE" />
</manifest>
```

## Performance Optimization

### 1. Enable ProGuard (for release builds)
Already configured in `build.gradle`

### 2. Optimize Images
```bash
# Before building, optimize assets:
npm install -g imagemin-cli
imagemin public/*.png --out-dir=public/optimized
```

### 3. Enable Code Splitting
Already configured in `vite.config.ts`

### 4. Reduce Bundle Size
```bash
# Analyze bundle
npm run build -- --mode=analyze
```

## Deployment to Google Play Store

1. **Create Google Play Console Account**
   - https://play.google.com/console
   - Pay one-time $25 registration fee

2. **Create App Listing**
   - App name: Bambé
   - Package: cm.bambe.marketplace
   - Add screenshots, descriptions, etc.

3. **Upload App Bundle**
   - Build release bundle (see above)
   - Upload .aab file
   - Fill in release notes

4. **Set Up Payment Integration**
   - Configure MTN Mobile Money
   - Configure Orange Money
   - Set up merchant accounts

5. **Submit for Review**
   - Complete all required fields
   - Submit app
   - Wait for review (usually 1-3 days)

## Additional Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Android Developer Docs: https://developer.android.com
- React Router: https://reactrouter.com
- Tailwind CSS: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com

## Support

For issues specific to Bambé app:
- Check Android Studio Logcat for errors
- Review Capacitor documentation
- Test on multiple devices/API levels

---

**Happy Building! 🚀**
