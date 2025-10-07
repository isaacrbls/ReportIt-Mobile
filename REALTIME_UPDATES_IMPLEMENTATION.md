# Real-Time Map Updates & Notifications Implementation

## Overview
This document describes the implementation of real-time map updates and push notifications for newly verified reports in the ReportIt Mobile application.

## Features Implemented

### 1. Real-Time Firestore Listener
**File:** `services/ReportsService.ts`

Added a new method `subscribeToReports()` that:
- Uses Firestore's `onSnapshot` to listen for real-time changes to the reports collection
- Automatically updates the map whenever reports are added, modified, or removed
- Returns an unsubscribe function for proper cleanup
- Handles both PascalCase and camelCase field variations for backward compatibility

**Key Benefits:**
- No need for manual refresh - map updates automatically
- Instant updates when admin verifies a report
- Efficient - only transmits changes, not entire dataset

### 2. Notification Banner System
**File:** `screens/MapScreen.tsx`

Implemented a notification queue system with:
- **State Management:**
  - `newVerifiedReports` - Queue of reports to show notifications for
  - `showNotification` - Controls notification visibility
  - `currentNotification` - The report currently being displayed
  - `previousReportIds` - Tracks previously seen reports to detect new ones
  - `notificationAnimation` - Animated value for smooth entrance/exit

- **Smart Detection Logic:**
  - Tracks previously seen report IDs to identify newly verified reports
  - Prevents showing notifications on initial app load
  - Only shows notifications for reports verified AFTER the app is opened

- **UI Components:**
  - Animated banner slides down from top of screen
  - Shows green checkmark icon with verification status
  - Displays incident type and barangay
  - Auto-dismisses after 5 seconds
  - Tap anywhere on banner or X button to dismiss immediately
  - Queue system shows multiple notifications one at a time

### 3. Updated User Interface
- **Notification Banner:** Positioned at top of screen (below header)
  - White background with shadow for visibility
  - Responsive sizing for phones and tablets
  - Z-index 9999 ensures it appears above map content
  - Uses Poppins font family for consistency

- **Refresh Button:** Modified FAB (Floating Action Button)
  - Now only refreshes hotspots manually
  - Reports update automatically via real-time listener
  - Changed tooltip text to reflect new behavior

## Technical Details

### Real-Time Listener Setup
```typescript
// Located in MapScreen useEffect
ReportsService.subscribeToReports(
  (allReports) => {
    // Filter verified reports
    // Detect new reports
    // Trigger notifications
    // Update map state
  },
  (error) => {
    // Handle errors
  }
);
```

### Notification Flow
1. **Initial Load:** All verified reports IDs are stored without showing notifications
2. **Subsequent Updates:** New report detected → Added to notification queue
3. **Display Queue:** Shows one notification at a time with 5-second duration
4. **Animation:** Spring animation for entrance, timing animation for exit
5. **Cleanup:** Removes shown notification from queue after dismissal

### Memory Management
- Real-time listener is unsubscribed when component unmounts
- Notification queue is cleared when banner is dismissed
- Animation timers are properly cleaned up
- Previous report IDs stored in Set for O(1) lookup performance

## User Experience Improvements

### Before Implementation
- Users had to manually tap refresh button to see new reports
- No indication when new reports were verified
- Could miss important nearby incidents

### After Implementation
- Map automatically updates when reports are verified
- Visual notification alerts users to new incidents
- Shows incident type and location at a glance
- Smooth animations provide polished experience
- Non-intrusive auto-dismiss maintains usability

## Configuration

### Notification Timing
Located in `MapScreen.tsx` notification useEffect:
```typescript
const timer = setTimeout(() => {
  hideNotification();
}, 5000); // 5 seconds - adjust as needed
```

### Animation Parameters
Spring animation config (can be tuned):
```typescript
Animated.spring(notificationAnimation, {
  toValue: 0,
  useNativeDriver: true,
  tension: 50,  // Higher = snappier
  friction: 8,  // Higher = less bouncy
})
```

## Testing Recommendations

1. **Real-Time Updates:**
   - Open app on multiple devices
   - Verify a report from admin panel
   - Confirm map updates on all devices simultaneously

2. **Notification Behavior:**
   - Verify no notifications on initial app load
   - Verify new report → notification appears
   - Test tap-to-dismiss and auto-dismiss
   - Test multiple rapid notifications (queue behavior)

3. **Performance:**
   - Monitor memory usage with listener active
   - Test with large number of reports (100+)
   - Verify no memory leaks after navigation away

4. **Edge Cases:**
   - Test with no internet connection
   - Test app backgrounding/foregrounding
   - Test notification while report modal is open

## Future Enhancements

Potential improvements to consider:

1. **Sound Notifications:** Add subtle sound when notification appears
2. **Notification History:** Store dismissed notifications for review
3. **Filtering:** Allow users to filter which types of incidents trigger notifications
4. **Geofencing:** Only notify for incidents within X km of user
5. **Priority Levels:** Visual distinction for high-priority incidents
6. **Rich Notifications:** Show incident thumbnail if media available
7. **Action Buttons:** "View Details" or "Navigate" buttons in banner

## Code Locations

- **Service Layer:** `/services/ReportsService.ts` - Line 452+ (subscribeToReports method)
- **Map Screen:** `/screens/MapScreen.tsx`
  - State: Lines 534-540
  - Listener Setup: Lines 782-830
  - Notification Logic: Lines 621-656
  - UI Component: Lines 1327-1359
  - Styles: Lines 2547-2595

## Dependencies
No new dependencies added - uses existing packages:
- `firebase/firestore` - onSnapshot function
- `react-native` - Animated API
- `@react-native-vector-icons/fontawesome` - Check icon

## Backward Compatibility
- Old `fetchReports()` method still exists for backward compatibility
- Existing refresh button continues to work (now refreshes hotspots only)
- No breaking changes to existing functionality
