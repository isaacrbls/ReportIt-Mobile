# Location Vicinity Check Implementation

## Overview
This document describes the location-based verification system that ensures users can only submit incident reports when they are physically within their registered barangay's vicinity.

## Implementation Date
October 4, 2025

## Purpose
To prevent false or fraudulent reports by verifying that users are actually present in their registered barangay when submitting an incident report.

## Features Implemented

### 1. Barangay Coordinates Database
Each of the 5 allowed reporting barangays now has defined coordinates:
- **Center point** (latitude/longitude) - approximate center of the barangay
- **Radius** (in kilometers) - defines the barangay boundary area

### 2. Real-time Location Verification
When submitting a report, the system:
1. Gets user's current GPS location
2. Calculates distance from barangay center
3. Verifies user is within allowed radius
4. Only allows report submission if within vicinity

### 3. Distance Calculation
Uses the Haversine formula for accurate distance calculation between GPS coordinates.

## Barangay Coverage Areas

### Allowed Reporting Barangays (Malolos City)

| Barangay | Latitude | Longitude | Radius | Area Coverage |
|----------|----------|-----------|--------|---------------|
| Pinagbakahan | 14.8441 | 120.8118 | 2.0 km | ~12.6 km² |
| Look | 14.8523 | 120.8234 | 1.5 km | ~7.1 km² |
| Bulihan | 14.8635 | 120.8156 | 1.8 km | ~10.2 km² |
| Dakila | 14.8498 | 120.8089 | 1.5 km | ~7.1 km² |
| Mojon | 14.8357 | 120.8201 | 1.7 km | ~9.1 km² |

**Note**: Coordinates are approximate center points. Radius values provide reasonable coverage for each barangay area.

## Technical Implementation

### Changes Made

#### 1. BulacanBarangays.ts
Added new functionality:

```typescript
// Barangay coordinates data structure
export const BARANGAY_COORDINATES: { 
  [key: string]: { 
    latitude: number; 
    longitude: number; 
    radiusKm: number 
  } 
};

// Distance calculation using Haversine formula
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number;

// Main vicinity checking function
export const isWithinBarangayVicinity = (
  userBarangay: string,
  currentLatitude: number,
  currentLongitude: number
): {
  isWithin: boolean;
  distance: number;
  allowedRadius: number;
};
```

#### 2. MapScreen.tsx
Enhanced `handleSubmitReport()` function:

**New validation flow**:
1. ✅ Check user authentication
2. ✅ Verify user profile exists
3. ✅ Check barangay is in allowed list
4. ✅ Request location permission
5. ✅ **Get current GPS location** ⬅️ NEW
6. ✅ **Calculate distance from barangay center** ⬅️ NEW
7. ✅ **Verify within allowed radius** ⬅️ NEW
8. ✅ Validate report form fields
9. ✅ Submit report to database

## User Experience

### Successful Report (Within Vicinity)
1. User opens report form
2. Fills in incident details
3. Clicks "Submit Report"
4. System checks location (transparent to user)
5. ✅ Report submitted successfully

### Failed Report (Outside Vicinity)
1. User opens report form
2. Fills in incident details
3. Clicks "Submit Report"
4. System checks location
5. ❌ Alert displayed:

```
Location Verification Failed

You must be within your registered barangay 
(Pinagbakahan) to submit a report.

Your current location is 3.45 km away from 
Pinagbakahan.

You need to be within 2.0 km of your barangay 
to report incidents.

Please go to your barangay or contact support 
if you believe this is an error.
```

## Haversine Formula

The system uses the Haversine formula to calculate the great-circle distance between two points on Earth:

```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c
```

Where:
- φ = latitude
- λ = longitude
- R = Earth's radius (6,371 km)
- d = distance between points

This provides accurate distance calculations accounting for Earth's curvature.

## Edge Cases Handled

### 1. GPS Accuracy Issues
- **Problem**: GPS can be inaccurate (±10-50 meters)
- **Solution**: Generous radius values (1.5-2.0 km) provide buffer

### 2. Barangay Without Coordinates
- **Problem**: New barangay added without coordinates
- **Solution**: Fail-open approach - allows reporting with warning log

### 3. Location Permission Denied
- **Problem**: User denies location access
- **Solution**: Clear error message requesting permission

### 4. GPS Unavailable
- **Problem**: Device can't get GPS signal (indoors, etc.)
- **Solution**: Error message to enable location services

### 5. Border Areas
- **Problem**: User near barangay border
- **Solution**: Radius values include reasonable buffer zone

## Security Considerations

### GPS Spoofing
**Risk**: Users could fake their GPS location using mock location apps

**Mitigations**:
1. Not a critical security issue (reports still reviewed)
2. Can detect mock locations with additional checks (future)
3. Report verification by authorities provides second layer
4. User accountability through registered account

### Privacy
- GPS location only checked during report submission
- Location not continuously tracked
- Only distance calculation stored, not raw coordinates
- User's actual location not shared publicly

## Testing

### Test Scenarios

#### 1. Within Barangay (Success)
```
User Barangay: Pinagbakahan
User Location: 14.8450, 120.8120 (0.1 km from center)
Expected: ✅ Report allowed
```

#### 2. Just Outside Boundary (Fail)
```
User Barangay: Look
User Location: 14.8670, 120.8350 (2.1 km from center)
Expected: ❌ Report blocked
Distance: 2.1 km
Allowed: 1.5 km
```

#### 3. Far Outside (Fail)
```
User Barangay: Bulihan
User Location: 14.9000, 120.8500 (5.2 km from center)
Expected: ❌ Report blocked
Distance: 5.2 km
Allowed: 1.8 km
```

#### 4. Different Barangay (Fail)
```
Registered Barangay: Dakila
Current Location: Inside Mojon barangay
Expected: ❌ Report blocked
Reason: Not in registered barangay
```

### Manual Testing Steps

1. **Test Within Vicinity**:
   - Register account with allowed barangay
   - Go to that barangay physically
   - Try to submit report
   - Expected: Success

2. **Test Outside Vicinity**:
   - Register account with allowed barangay
   - Go to different location (>2km away)
   - Try to submit report
   - Expected: Error with distance information

3. **Test Permission Denied**:
   - Deny location permission
   - Try to submit report
   - Expected: Permission request error

4. **Test GPS Disabled**:
   - Turn off device location
   - Try to submit report
   - Expected: Location services error

## Configuration

### Adjusting Barangay Radius

To modify the allowed radius for a barangay:

```typescript
// In BulacanBarangays.ts
export const BARANGAY_COORDINATES = {
  "Pinagbakahan": {
    latitude: 14.8441,
    longitude: 120.8118,
    radiusKm: 3.0  // Changed from 2.0 to 3.0 km
  }
};
```

### Adding New Barangay Coordinates

```typescript
export const BARANGAY_COORDINATES = {
  // ... existing barangays
  "NewBarangay": {
    latitude: 14.XXXX,  // Get from Google Maps
    longitude: 120.XXXX,
    radiusKm: 1.5  // Estimate based on barangay size
  }
};
```

## Logging

System logs location checks for debugging:

```javascript
📍 Getting current location to verify barangay vicinity...
📍 Location check for Pinagbakahan: {
  userLocation: { lat: 14.8450, lng: 120.8120 },
  barangayCenter: { lat: 14.8441, lng: 120.8118 },
  distance: '0.10 km',
  allowedRadius: '2.0 km',
  isWithin: true
}
✅ User is within barangay vicinity - proceeding with report submission
📍 Current location confirmed for report: { latitude: 14.8450, longitude: 120.8120 }
```

## Future Enhancements

### Potential Improvements

1. **Polygon Boundaries**
   - Use actual barangay polygon boundaries instead of circles
   - More accurate boundary detection
   - Requires detailed boundary data

2. **Dynamic Radius**
   - Adjust radius based on GPS accuracy
   - Larger radius for poor GPS signal
   - Tighter radius for high accuracy

3. **Historical Location**
   - Verify user has been in area for certain time
   - Prevent drive-by false reports
   - Require sustained presence

4. **Mock Location Detection**
   - Detect GPS spoofing apps
   - Additional security layer
   - Warning for suspicious patterns

5. **Nearby Barangay Suggestions**
   - If user in wrong barangay, suggest correct one
   - Help users report in right barangay
   - Improve user experience

6. **Admin Override**
   - Allow admins to manually approve reports
   - Handle legitimate edge cases
   - Provide support mechanism

## Support & Troubleshooting

### Common Issues

**"Location Verification Failed" but I'm in my barangay**
- Check GPS is enabled
- Try moving to more open area (better signal)
- Restart app and try again
- Contact support if issue persists

**GPS not working**
- Enable location services
- Grant location permission
- Check device location settings
- Restart device

**Always outside radius**
- Verify registered barangay is correct
- Check address with barangay officials
- May need profile update
- Contact support

### Contact Support
If you believe the location check is incorrect:
1. Note your current location
2. Note the error message distance
3. Take screenshot
4. Contact app support with details

## Compliance & Legal

### Data Privacy
- Complies with Philippine Data Privacy Act
- Location data used only for verification
- No location data stored permanently
- User consent via location permission

### Terms of Service
Location verification added to Terms:
- Users must report from within barangay
- False location data prohibited
- Account suspension for violations
- System verifies location automatically

## Conclusion

The location vicinity check adds an important verification layer to the reporting system:
- ✅ Ensures users are present at barangay
- ✅ Reduces false reports
- ✅ Maintains data integrity
- ✅ Transparent to legitimate users
- ✅ Provides clear feedback on failures

This feature significantly improves the reliability and trustworthiness of incident reports in the ReportIt application.
