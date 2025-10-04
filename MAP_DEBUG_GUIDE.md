# Map Not Showing - Debug Guide

## Changes Made

I've added comprehensive debugging to help identify why the map isn't showing. Here's what was added:

### 1. **WebView Error Handlers**
Added error handlers to the WebView component:
- `onError` - Catches WebView loading errors
- `onMessage` - Receives debug messages from the map JavaScript
- `onHttpError` - Catches HTTP errors when loading resources
- `originWhitelist={['*']}` - Allows all origins for debugging

### 2. **Debug Logging in Leaflet JavaScript**
Added `debugLog()` function that:
- Logs to browser console
- Posts messages to React Native via `ReactNativeWebView.postMessage()`
- Tracks every step of map initialization

### 3. **Try-Catch Blocks**
Wrapped critical operations in try-catch blocks:
- Map initialization
- Tile layer addition
- User location marker
- Each report marker (individual try-catch)
- Each hotspot circle (individual try-catch)

### 4. **Step-by-Step Logging**
The map now logs:
- ✅ Script started
- ✅ Philippines bounds defined
- ✅ Initializing map...
- ✅ Map initialized successfully
- ✅ Adding tile layer...
- ✅ Tile layer added successfully
- ✅ Adding user location marker
- ✅ Adding N report markers...
- ✅ Adding marker 1/N, 2/N, etc.
- ✅ Finished adding all markers
- ✅ Adding N hotspot circles...
- ✅ Finished adding all hotspots
- ✅ Map setup complete!

## How to Debug

### Step 1: Run the App
```bash
npx expo start --clear
```

### Step 2: Open Metro Bundler Console
Look for log messages in your terminal where you ran `npx expo start`. You should see:

```
[MAP DEBUG] Script started
[MAP DEBUG] Philippines bounds defined
[MAP DEBUG] Initializing map...
[MAP DEBUG] Map initialized successfully
...
```

### Step 3: Check for Errors
Look for any error messages like:
- `WebView error:` - WebView failed to load
- `WebView HTTP error:` - Resource failed to load (tiles, Leaflet.js, etc.)
- `Error initializing map:` - Leaflet map creation failed
- `Error adding tile layer:` - OpenStreetMap tiles failed
- `Error adding marker:` - Marker creation failed

### Step 4: Check React Native Logs
In Expo Go or your device, shake the device and check:
- React Native debugger
- Console logs
- Error messages

## Common Issues & Solutions

### Issue 1: Map Shows Blank Gray Screen
**Cause:** Tile layer not loading (network issue or blocked)

**Solution:**
```javascript
// The tiles should load from OpenStreetMap
https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

Check if:
- Device has internet connection
- OpenStreetMap isn't blocked
- CORS isn't preventing tile loading

### Issue 2: Icons Not Showing
**Cause:** `Image.resolveAssetSource()` returns file:// URIs that don't work in WebView

**Current Status:** Icons use PNG files via `Image.resolveAssetSource()`, but these URIs may not work inside WebView HTML due to security restrictions.

**Potential Solutions:**

**Option A: Use Emoji Fallback**
```javascript
const CATEGORY_EMOJIS = {
  'Theft': '🏚️',
  'Accident': '🚗',
  'Assault/Harassment': '⚠️',
  // ...
};
```

**Option B: Use Data URIs** (requires base64 conversion)
```javascript
// Convert PNG to base64 and embed directly
```

**Option C: Use CDN Icons** (Font Awesome, Material Icons)
```javascript
html: '<i class="fas fa-exclamation-triangle"></i>'
```

### Issue 3: WebView Not Loading
**Cause:** JavaScript or HTML syntax error

**Check:** 
- Look for `WebView error:` in console
- Check if Leaflet.js loaded: `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
- Verify HTML is valid

### Issue 4: Map Loads But No Markers
**Cause:** 
- Empty `reports` array
- Invalid coordinates
- Icon creation failure

**Check:**
- Console should show: `Adding N report markers...`
- Each marker should log: `Adding marker 1/N at [lat, lng]`
- If you see `Adding 0 report markers`, no reports are loaded from Firebase

## Next Steps

1. **Run the app** and check console output
2. **Look for the first error** in the debug log sequence
3. **Take a screenshot** of the console output
4. **Share the logs** so we can identify the exact issue

## Expected Console Output (Success)

```
[MAP DEBUG] Script started
[MAP DEBUG] Philippines bounds defined
[MAP DEBUG] Initializing map...
[MAP DEBUG] Map initialized successfully
[MAP DEBUG] Adding tile layer...
[MAP DEBUG] Tile layer added successfully
[MAP DEBUG] Adding user location marker at [14.7942, 120.8781]
[MAP DEBUG] User location marker added
[MAP DEBUG] Adding 5 report markers...
[MAP DEBUG] Adding marker 1/5 at [14.795, 120.879]
[MAP DEBUG] Adding marker 2/5 at [14.796, 120.880]
[MAP DEBUG] Adding marker 3/5 at [14.797, 120.881]
[MAP DEBUG] Adding marker 4/5 at [14.798, 120.882]
[MAP DEBUG] Adding marker 5/5 at [14.799, 120.883]
[MAP DEBUG] Finished adding all markers
[MAP DEBUG] Adding 2 hotspot circles...
[MAP DEBUG] Adding hotspot 1/2
[MAP DEBUG] Adding hotspot 2/2
[MAP DEBUG] Finished adding all hotspots
[MAP DEBUG] Map setup complete!
Map loaded
```

## File Icons Issue

The PNG icons from `/assets/report icons/` may not work in WebView HTML because:
- `Image.resolveAssetSource()` returns `file://` URIs
- WebView has security restrictions on `file://` access
- CORS and same-origin policies apply

**Quick Fix:** If icons are broken, we can switch back to emoji symbols or use Font Awesome icons which work reliably in WebView.

## Testing Checklist

- [ ] Console shows `[MAP DEBUG] Script started`
- [ ] Console shows `[MAP DEBUG] Map initialized successfully`
- [ ] Console shows `[MAP DEBUG] Tile layer added successfully`
- [ ] Console shows `[MAP DEBUG] Map setup complete!`
- [ ] Map displays on screen (not blank)
- [ ] Can see OpenStreetMap tiles
- [ ] Can see user location marker (red pin)
- [ ] Can see report markers (orange pins)
- [ ] Can see hotspot circles (if any)
- [ ] Can pan and zoom the map
- [ ] Can click markers to see popups

---

**Note:** Run `npx expo start --clear` and check your console immediately!
