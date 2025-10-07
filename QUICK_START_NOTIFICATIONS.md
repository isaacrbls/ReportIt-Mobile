# Quick Start Guide - Push Notifications

## For Users

### Enabling Notifications

1. **Open the app**
2. **Tap the menu icon** (☰) in top-left
3. **Tap "Enable Notifications"**
4. **Read the explanation** and tap "Allow"
5. **Grant permission** in system dialog
6. **Done!** You'll now receive alerts for verified reports

### If You Accidentally Denied Permission

1. App will show an alert with "Open Settings" button
2. Tap "Open Settings"
3. Find "ReportIt" in app list
4. Enable Notifications
5. Return to app

### Notification Behavior

- **App Open:** See banner at top + system notification
- **App Closed:** Receive system notification
- **App Background:** Receive system notification
- **Tap Notification:** Opens app and shows report details

### Turning Off Notifications

**iOS:**
Settings → Notifications → ReportIt → Toggle OFF

**Android:**
Settings → Apps → ReportIt → Notifications → Toggle OFF

## For Developers

### Testing Checklist

- [ ] Install app on **physical device** (emulator won't work)
- [ ] Enable notifications when prompted
- [ ] Verify push token logged in console
- [ ] Close app completely
- [ ] Have admin verify a report
- [ ] Check if notification appears
- [ ] Tap notification
- [ ] Verify app opens with report info

### Quick Code Reference

**Request Notifications:**
```typescript
import { NotificationService } from './services/NotificationService';

const result = await NotificationService.requestPermissions();
if (result.granted) {
  console.log('✅ Notifications enabled');
}
```

**Send Notification:**
```typescript
await NotificationService.scheduleLocalNotification(
  'Title',
  'Body text',
  { customData: 'value' }
);
```

**Check Permission:**
```typescript
const status = await NotificationService.getPermissionStatus();
// 'granted' | 'denied' | 'undetermined'
```

### Console Log Keywords

Monitor these logs to debug:
- `🔔` - Notification-related events
- `📱` - Push token events
- `✅` - Success messages
- `❌` - Errors
- `⚠️` - Warnings

### Common Issues

**Issue:** "Notifications not showing"
**Fix:** Verify testing on physical device, not emulator

**Issue:** "Permission denied"
**Fix:** Uninstall and reinstall app for fresh permission state

**Issue:** "No push token"
**Fix:** Check device is physical, permissions granted, and no console errors

## Location Services

### User Experience

After granting location permission:
1. App checks if location services enabled
2. If disabled → Shows alert
3. User taps "Open Settings"
4. Enable location services in device settings
5. Return to app
6. Location features now work

### For Developers

The check happens automatically in:
```typescript
LocationService.getInstance().requestLocationPermission()
```

No additional code needed!

## Quick Reference

| Feature | Status | Works When App Is... |
|---------|--------|---------------------|
| In-App Banner | ✅ | Open (foreground) |
| Push Notification | ✅ | Open, Background, Closed |
| Location Permission | ✅ | Always |
| Location Services Check | ✅ | After permission grant |
| Settings Redirect | ✅ | iOS & Android |
| Badge Count | ✅ | iOS only |
| Notification Channels | ✅ | Android only |

## Testing on Physical Devices

### Android
```bash
npm run android
# Or
npm start → Scan QR with Expo Go app
```

### iOS
```bash
npm run ios
# Or  
npm start → Scan QR with Expo Go app (TestFlight for production)
```

### Important
- **Emulators/Simulators:** Location works ✅, Push notifications DON'T ❌
- **Physical Devices:** Both work ✅✅

## Support

For issues or questions:
1. Check console logs
2. Review `PUSH_NOTIFICATIONS_IMPLEMENTATION.md`
3. Verify device settings
4. Test on different device if possible
