# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## 1. EAS & GitHub Automated Build Requirements
*   **Always** define `android.package` and `ios.bundleIdentifier` in `app.json` (e.g., `com.shaharsudai.r6companion`).
*   **Always** define `"ITSAppUsesNonExemptEncryption": false` under `ios.infoPlist` in `app.json`.

## 2. Image Asset Size Restrictions (60 FPS Performance)
*   Never commit raw, uncompressed images (especially map or operator images) that are larger than **200 KB**.
*   If you add new images, **always** run the optimization utility to resize and compress them:
    ```bash
    npm run optimize-images
    ```

## 3. FlatList Rendering Rules
*   Do **not** use inline render functions or inline event handlers inside FlatList (e.g., `renderItem={({ item }) => renderMapItem(item)}`).
*   Define stable callback renderers (`renderMapItem`, `renderOperatorItem`) using `useCallback`.
*   Include all state setters in the dependency arrays (e.g., `setSelectedMapId`, `setMobileStep`) to satisfy the React Compiler manual memoization check (`react-hooks/preserve-manual-memoization`).

## 4. Overlay Unmounting
*   Never let absolute overlays (like splash screens or banners) remain mounted with `opacity: 0`. Always fully unmount them from the React tree (`visible === false`) using a JS-level fallback timer (`setTimeout` inside `useEffect`).
*   Use standard Reanimated `runOnJS` to update React state from worklet callbacks instead of third-party schedulers.
