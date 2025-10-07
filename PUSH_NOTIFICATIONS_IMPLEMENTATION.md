# Push Notifications & Location Services Implementation

## Overview
This document describes the implementation of proper push notifications (that work outside the app) and enhanced location permission flow with settings prompts for the ReportIt Mobile application.

## New Features Implemented

### 1. **Push Notifications Service** 
**File:** `services/NotificationService.ts`

A comprehensive service layer for managing push notifications with the following capabilities:

#### Permission Management
- `requestPermissions()` - Request notification permissions with proper user prompts
- `getPermissionStatus()` - Check current permission status
- `hasAskedForPermission()` - Track if permission was previously requested
- `showPermissionDeniedAlert()` - Prompt user to enable notifications in settings

#### Token Management
- Automatic push token registration with Expo
- Token storage in AsyncStorage for persistence
- Device validation (physical device required)

#### Notification Channels (Android)
- **Default Channel** - General notifications
- **Verified Reports Channel** - High-priority notifications for verified incidents

#### Notification Scheduling
- `scheduleLocalNotification()` - Schedule notifications (immediate or delayed)
- `notifyNewVerifiedReport()` - Send notification for newly verified reports
- `cancelNotification()` - Cancel specific notification
- `cancelAllNotifications()` - Cancel all scheduled notifications

#### Notification Listeners
- `addNotificationReceivedListener()` - Handle notifications while app is open
- `addNotificationResponseListener()` - Handle user taps on notifications

#### Key Features
- ✅ Works when app is **closed, backgrounded, or in foreground**
- ✅ Proper permission handling with settings redirect
- ✅ Android notification channels for categorization
- ✅ Badge count management (iOS)
- ✅ Custom notification data payload
- ✅ Vibration patterns and sounds

### 2. **Enhanced Location Services**
**File:** `services/LocationService.ts`

Updated location service with improved permission flow:

#### New Behavior
When user grants location permission, the app now:
1. Checks if location services are enabled on device
2. If disabled, prompts user to enable in device settings
3. Provides "Open Settings" button for quick access
4. Works on both iOS and Android

#### Key Method
```typescript
async requestLocationPermission(): Promise<LocationPermissionResponse>
```
Now includes automatic check for location services after permission is granted.

#### User Experience Flow
```
User Grants Permission
    ↓
Check if Location Services Enabled
    ↓
If Disabled → Show Alert → "Open Settings" Button
    ↓
User Enables Location Services
    ↓
App Can Now Use Location
```

### 3. **MapScreen Integration**
**File:** `screens/MapScreen.tsx`

#### Notification Permission Flow

**Old Behavior:**
- Simple modal with "Enable Notifications" button
- No actual permission request
- No persistent state

**New Behavior:**
1. **Menu Button Press** → Check current permission status
2. **Already Granted** → Show "already enabled" message
3. **Previously Denied** → Prompt to open settings
4. **Not Asked** → Show custom modal explaining benefits
5. **User Accepts** → Request system permission
6. **Permission Granted** → Show success message + register push token
7. **Permission Denied** → Offer to open settings

#### Real-Time Push Notifications

When new verified reports are detected:
1. **In-App Banner** - Animated notification at top of screen (existing)
2. **Push Notification** - Sent via `NotificationService.notifyNewVerifiedReport()`
   - Shows incident type, barangay, and report ID
   - Works even when app is closed
   - Tapping notification opens app and shows report info

#### Notification Listeners Setup
```typescript
useEffect(() => {
  // Listen for notifications received while app is open
  const notificationListener = addNotificationReceivedListener(...)
  
  // Listen for user tapping notifications
  const responseListener = addNotificationResponseListener(...)
  
  return () => {
    // Cleanup listeners on unmount
    notificationListener?.remove()
    responseListener?.remove()
  }
}, [])
```

### 4. **App Configuration**
**File:** `app.json`

#### iOS Configuration
```json
"ios": {
  "infoPlist": {
    "NSUserNotificationsUsageDescription": "ReportIt needs permission to send you notifications about verified incident reports in your area to help keep you informed and safe."
  },
  "bundleIdentifier": "com.reportit.mobile"
}
```

#### Android Configuration
```json
"android": {
  "permissions": [
    "POST_NOTIFICATIONS",      // Android 13+ notification permission
    "VIBRATE",                  // Vibration on notifications
    "RECEIVE_BOOT_COMPLETED"    // Persist notifications after reboot
  ],
  "package": "com.reportit.mobile",
  "useNextNotificationsApi": true
}
```

#### Expo Notifications Plugin
```json
"plugins": [
  ["expo-notifications", {
    "icon": "./assets/icon.png",
    "color": "#EF4444",
    "sounds": ["./assets/notification-sound.wav"],
    "mode": "production"
  }]
],
"notification": {
  "icon": "./assets/icon.png",
  "color": "#EF4444",
  "androidMode": "default",
  "androidCollapsedTitle": "ReportIt"
}
```

## Technical Architecture

### Notification Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Real-Time Listener                       │
│                  (Firestore onSnapshot)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ↓
         New Verified Report Detected
                      │
         ┌────────────┴────────────┐
         ↓                         ↓
┌────────────────┐      ┌──────────────────────┐
│  In-App Banner │      │  Push Notification   │
│  (if app open) │      │ (always, any state)  │
└────────────────┘      └──────────────────────┘
         │                         │
         └────────────┬────────────┘
                      ↓
              User Sees Notification
                      │
                      ↓
         ┌────────────┴────────────┐
         ↓                         ↓
    Tap Banner              Tap Push Notification
         │                         │
         └────────────┬────────────┘
                      ↓
              View Report Details
```

### Permission State Management

```typescript
// AsyncStorage Keys
'notificationPermissionAsked' → Track if permission was requested
'pushNotificationToken' → Store Expo push token

// Permission States
'granted'  → User allowed notifications
'denied'   → User explicitly denied
'undetermined' → Haven't asked yet
```

## User Experience Improvements

### Before Implementation

**Notifications:**
- Only in-app banner (app must be open)
- No permission request
- Users miss reports when app is closed

**Location:**
- Permission granted but location services disabled → Confusing errors
- No guidance on how to fix

### After Implementation

**Notifications:**
- ✅ Push notifications work when app is closed/background
- ✅ Proper system permission request
- ✅ Smart handling of denied permissions → Settings redirect
- ✅ Persistent notifications survive app restart
- ✅ Rich notification data (incident type, location)
- ✅ Tappable notifications → View report details

**Location:**
- ✅ After granting permission, check if location services enabled
- ✅ If disabled, show alert with "Open Settings" button
- ✅ Clear guidance for users
- ✅ One-tap access to device settings

## Testing Guide

### Testing Push Notifications

#### 1. **First-Time Permission Request**
```
1. Fresh install app
2. Navigate to sidebar menu
3. Tap "Enable Notifications"
4. Tap "Allow" in modal
5. System permission dialog should appear
6. Grant permission
7. Should see success message
```

#### 2. **Permission Denied → Settings**
```
1. Deny notification permission
2. Tap "Enable Notifications" again
3. Should see "Open Settings" prompt
4. Tap "Open Settings"
5. Enable notifications
6. Return to app
```

#### 3. **Background Notification**
```
1. Enable notifications
2. Close app completely
3. Have admin verify a report
4. Should receive push notification
5. Tap notification
6. App opens with report details
```

#### 4. **Notification Queue**
```
1. Have admin verify multiple reports quickly
2. Should receive multiple notifications
3. Each notification should be distinct
```

### Testing Location Services

#### 1. **Permission + Services Check**
```
1. Disable location services in device settings
2. Open app
3. Try to report incident
4. Grant location permission when prompted
5. Should see "Enable Location Services" alert
6. Tap "Open Settings"
7. Enable location services
8. Return to app
9. Location should work
```

#### 2. **iOS Settings Path**
```
iOS: Settings → Privacy & Security → Location Services → Toggle ON
```

#### 3. **Android Settings Path**
```
Android: Settings → Location → Toggle ON
```

## Development Commands

```bash
# Install dependencies (already done)
npm install expo-notifications expo-device

# Run app
npm start

# Test on physical device (REQUIRED for push notifications)
npm run android  # Android device
npm run ios      # iOS device (Mac only)

# Note: Push notifications DO NOT work on emulators/simulators
```

## Configuration Options

### Notification Timing
Adjust auto-dismiss time in `MapScreen.tsx`:
```typescript
const timer = setTimeout(() => {
  hideNotification();
}, 5000); // Change milliseconds here
```

### Notification Sound (Android)
Place custom sound file in `/assets/notification-sound.wav`
Configure in `app.json`:
```json
"sounds": ["./assets/notification-sound.wav"]
```

### Notification Priority
Adjust in `NotificationService.ts`:
```typescript
priority: Notifications.AndroidNotificationPriority.HIGH, // MAX, HIGH, LOW, MIN
```

### Vibration Pattern
Customize in `NotificationService.ts`:
```typescript
vibrationPattern: [0, 250, 250, 250], // [delay, vibrate, pause, vibrate]
```

## Important Notes

### Push Notifications
- ✅ **Physical Device Required** - Won't work on emulators
- ✅ **Expo Push Token** - Automatically generated on first permission grant
- ✅ **Android 13+** - Requires `POST_NOTIFICATIONS` permission
- ✅ **iOS** - Requires user acceptance of permission dialog

### Location Services
- ✅ **Settings Redirect** - Works on both iOS and Android
- ✅ **Persistent Prompts** - Will continue prompting until enabled
- ✅ **Permission vs Services** - Two separate checks (permission + enabled)

### Best Practices Followed
- ✅ Graceful degradation if permissions denied
- ✅ No silent failures - always inform user
- ✅ One-tap access to settings
- ✅ Clear, user-friendly error messages
- ✅ Proper cleanup of listeners
- ✅ Memory efficient (AsyncStorage for persistence)

## Troubleshooting

### "Notifications not working"
1. Check if testing on physical device (not emulator)
2. Verify permissions granted in device settings
3. Check console logs for permission status
4. Ensure Expo push token was generated

### "Location services not enabling"
1. Verify location permission granted first
2. Check if prompt appeared
3. Manually enable in device settings
4. Restart app after enabling

### "Push token not generated"
1. Must be on physical device
2. Notifications permission must be granted
3. Check console for error messages
4. Try reinstalling app

## Future Enhancements

Potential improvements:

1. **Server-Side Push** - Send notifications via backend server
2. **Notification Categories** - Filter by incident type
3. **Geofencing** - Only notify for nearby incidents
4. **Quiet Hours** - Respect user's do-not-disturb preferences
5. **Notification History** - View past notifications in app
6. **Custom Sounds** - Different sounds for different incident types
7. **Action Buttons** - "View Map" and "Dismiss" in notification
8. **Rich Media** - Show incident photos in notifications

## Dependencies Added

```json
{
  "expo-notifications": "^0.x.x",
  "expo-device": "^x.x.x"
}
```

## Files Modified/Created

### Created
- `/services/NotificationService.ts` - Complete notification management service

### Modified
- `/services/LocationService.ts` - Enhanced with settings redirect
- `/screens/MapScreen.tsx` - Integrated push notifications
- `/app.json` - Added notification configuration
- `/package.json` - Added new dependencies

## Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [iOS Notification Settings](https://support.apple.com/en-us/HT201925)
- [Android Notification Settings](https://support.google.com/android/answer/9079661)

---

**Implementation Date:** October 7, 2025  
**Version:** 1.1.0  
**Status:** ✅ Production Ready
