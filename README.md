# 🎮 R6 Companion

R6 Companion is a premium, high-performance tactical helper and strategic database application designed for **Tom Clancy's Rainbow Six Siege** players. It acts as an interactive strategic dossier, allowing players to catalog and reference setup guides, camera placements, defensive structures, and gadget line-ups for specific operators and maps.

---

## 🚀 Key Features

*   **Operator & Map dossiers**: Browse operators by role (Attacker/Defender) and map details in a highly responsive layout.
*   **Tactical Clip Database**: Add, view, and manage tactical clips, walkthroughs, or YouTube guides directly linked to any operator on any map.
*   **System Share Intent Target**: Direct integration with the native share sheet. While scrolling YouTube, TikTok, or Instagram Reels, tap **Share**, choose **R6 Companion**, and register the clip immediately without leaving the source app!
*   **Offline Storage**: Powered by AsyncStorage, keeping your entire personal setup catalog persistent and stored locally on your device.
*   **Platform Responsive**: Optimized user experience for both Mobile devices (touch-centric sliders) and Desktop viewports.

---

## 📲 Downloads

<!-- PLACEHOLDERS FOR APP STORE & GOOGLE PLAY DOWNLOAD LINKS -->
<table>
  <tr>
    <td>
      <a href="YOUR_APP_STORE_LINK_HERE">
        <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" height="40" />
      </a>
    </td>
    <td>
      <a href="YOUR_PLAY_STORE_LINK_HERE">
        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" height="60" />
      </a>
    </td>
  </tr>
</table>

*(Please replace `YOUR_APP_STORE_LINK_HERE` and `YOUR_PLAY_STORE_LINK_HERE` with your active store links).*

---

## 🛠️ Development & Local Setup

### Prerequisites

*   Node.js (LTS version recommended)
*   Expo CLI (`npm install -g expo-cli`)
*   Android Studio / Xcode (for local emulators)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/r6-companion.git
    cd r6-companion
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

---

## 💻 Running the App

### 1. Running in Expo Go (For UI & Basic Database Logic)
Start the bundler and load the app inside Expo Go on your physical device or emulator:
```bash
npm run start
```
*Note: Native share intents cannot be tested directly in Expo Go. Use the built-in **"TEST SHARE"** debug header button to simulate incoming share sheets during development.*

### 2. Running in Development Build (For Native Share Intent)
To compile native configurations (AndroidManifest, Intent Filters, and iOS Share Extensions) and run the full native application:

*   **Generate native code structure**:
    ```bash
    npx expo prebuild --clean
    ```
*   **Run on Android Emulator / Connected Device**:
    ```bash
    npx expo run:android
    ```
*   **Run on iOS Simulator / Connected Device**:
    ```bash
    npx expo run:ios
    ```

---

## ⚡ Production Builds (EAS)

This project is configured for Expo Application Services (EAS). To submit updates to the app stores, use the following profiles:

*   **Build Android Production APK / AAB**:
    ```bash
    eas build -p android --profile production
    ```
*   **Build iOS Production Bundle**:
    ```bash
    eas build -p ios --profile production
    ```
*   **Build iOS Simulator client (Credential-free)**:
    ```bash
    eas build -p ios --profile simulator
    ```

---

## 🧹 Code Quality Utilities

*   **Optimize and Compress Maps/Operators Images**:
    ```bash
    npm run optimize-images
    ```
*   **Run ESLint Checks**:
    ```bash
    npm run lint
    ```
