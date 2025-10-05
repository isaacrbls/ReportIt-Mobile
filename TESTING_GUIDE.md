# Quick Testing Guide

## How to Test All Three Features

### 1. Test SVG Icons (2 minutes)

**Steps:**
1. Run the app
2. Navigate to the Map screen
3. Tap on any incident marker on the map
4. A popup should appear

**What to Check:**
- ✅ Icon next to "Incident Type:" should be an SVG (not Font Awesome)
- ✅ Icon should be red (#960C12 color)
- ✅ Icon should match the incident type
- ✅ Size should be 16x20px (small but clear)

**Test Different Types:**
- Theft → Should show lock/security icon
- Accident → Should show collision icon
- Assault → Should show person icon
- Property Damage → Should show building/house icon
- Animal Incident → Should show paw/animal icon

---

### 2. Test App Lifecycle (1 minute)

**Steps:**
1. Run the app with console open
2. Look for initial log: `🔄 Setting up app lifecycle listener`
3. Press device Home button (app goes to background)
4. Return to app (swipe up or tap icon)

**What to Check:**
- ✅ Console should show: `⏸️ App has gone to background (onPause)`
- ✅ Console should show: `✅ App has come to foreground (onResume)`
- ✅ Logs appear immediately when state changes

**Console Output Example:**
```
🔄 Setting up app lifecycle listener
🔄 Initial app state: active
🔄 App state changed to: background
⏸️ App has gone to background (onPause)
🔄 App state changed to: active
✅ App has come to foreground (onResume)
```

---

### 3. Test Persistent Authentication (5 minutes)

#### Test A: Stay Logged In
1. **Login to the app** (if not already logged in)
2. Navigate to Map screen
3. **Close the app completely** (swipe away, not just home button)
4. **Reopen the app**

**Expected Result:**
- ✅ App goes directly to Map screen
- ✅ User does NOT see Login screen
- ✅ Console shows: `isAuthenticated: true, initialRoute: Map`

---

#### Test B: Logout Works
1. **Login to the app**
2. Navigate to Map screen
3. **Logout** (use logout button in app)
4. **Close the app completely**
5. **Reopen the app**

**Expected Result:**
- ✅ App shows Login screen
- ✅ User does NOT go to Map automatically
- ✅ Console shows: `isAuthenticated: false, initialRoute: Login`

---

#### Test C: First Launch
1. **Uninstall the app completely**
2. **Reinstall the app**
3. **Open the app**

**Expected Result:**
- ✅ App shows Welcome screen (not Login)
- ✅ After signup/login, goes to Map
- ✅ Next time app opens, goes directly to Map

---

## Quick Verification Commands

### Check Console for Auth State:
Look for this log when app starts:
```
🔐 Auth state: {
  isAuthenticated: true,
  userEmail: 'user@example.com',
  initialRoute: 'Map'
}
```

### Check Console for Lifecycle:
Look for these logs:
```
🔄 Setting up app lifecycle listener
🔄 Initial app state: active
```

---

## Common Issues and Solutions

### Issue: SVG icons not showing
**Solution:** 
- Check console for JavaScript errors
- Verify SVG markup is valid HTML
- Clear app cache and restart

### Issue: App lifecycle not logging
**Solution:**
- Check if AppState listener is set up
- Verify console is showing logs
- Try physical device instead of simulator

### Issue: User not staying logged in
**Solution:**
- Check Firebase Auth is configured
- Verify AuthProvider is wrapping App
- Check console for auth errors
- Clear AsyncStorage and try again

### Issue: App always shows Welcome screen
**Solution:**
- Check AsyncStorage for 'hasLaunchedBefore'
- Clear app data and reinstall
- Verify first launch logic

---

## Expected Console Output (Full App Startup)

```
🔄 Setting up app lifecycle listener
🔄 Initial app state: active
Auth state changed: user@example.com
🔐 Auth state: {
  isAuthenticated: true,
  userEmail: 'user@example.com',
  initialRoute: 'Map'
}
Navigation container is ready
Navigation: {
  current: 'Map',
  previous: undefined,
  stackLength: 1
}
🗺️ MapView rendering with: {
  userLocation: '14.7942, 120.8781',
  reportsCount: 5,
  hotspotsCount: 2
}
```

---

## One-Minute Smoke Test

1. ✅ Open app → Should show Map if logged in
2. ✅ Tap incident marker → Should show SVG icon
3. ✅ Press Home → Console logs "onPause"
4. ✅ Return to app → Console logs "onResume"
5. ✅ Close and reopen → Should stay on Map

If all 5 checks pass: **All features working! ✅**

---

## Performance Notes

### Expected Behavior:
- App should load within 2-3 seconds
- Auth check should complete within 500ms
- SVG icons should render immediately
- No visible lag when switching app states

### Red Flags:
- ❌ App takes more than 5 seconds to load
- ❌ SVG icons don't appear in popup
- ❌ User sees Login screen when they should be logged in
- ❌ Console shows Firebase errors

---

## Device Testing Matrix

| Feature | iOS Simulator | iOS Device | Android Simulator | Android Device |
|---------|--------------|------------|-------------------|----------------|
| SVG Icons | ✅ Test | ✅ Test | ✅ Test | ✅ Test |
| App Lifecycle | ⚠️ Limited | ✅ Full | ⚠️ Limited | ✅ Full |
| Persistent Auth | ✅ Test | ✅ Test | ✅ Test | ✅ Test |

**Note:** App lifecycle works best on physical devices. Simulators may not trigger all states correctly.

---

## Quick Commands

### Clear App Data (iOS Simulator):
```bash
xcrun simctl uninstall booted com.yourapp.bundle
```

### Clear App Data (Android):
```bash
adb shell pm clear com.yourapp.package
```

### View Logs (iOS):
```bash
npx react-native log-ios
```

### View Logs (Android):
```bash
npx react-native log-android
```

---

## Success Criteria

✅ All features must pass these checks:

1. **SVG Icons**: 
   - Visible in popups
   - Red color (#960C12)
   - Match incident type

2. **App Lifecycle**:
   - Console logs onResume
   - Console logs onPause
   - No crashes on state change

3. **Persistent Auth**:
   - User stays logged in after closing app
   - User sees Login after logout
   - First launch shows Welcome

---

## Report Issues

If any test fails, provide:
1. Device type (iOS/Android, physical/simulator)
2. Console error messages
3. Steps to reproduce
4. Expected vs actual behavior

---

**Testing Time Estimate:** 10-15 minutes for complete test suite
**Last Updated:** After implementing all three features
**Status:** Ready for QA testing ✅
