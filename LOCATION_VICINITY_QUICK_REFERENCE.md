# Location Vicinity Check - Quick Reference

## Summary
Users can now only submit incident reports when they are physically within their registered barangay's vicinity. The system automatically checks the user's GPS location and compares it to their registered barangay boundaries.

## How It Works

### For Users
1. **Open report form** → System requests location permission
2. **Fill report details** → Add incident type, description, media
3. **Submit report** → System automatically checks:
   - ✅ Are you in an allowed barangay? (Pinagbakahan, Look, Bulihan, Dakila, Mojon)
   - ✅ Is your current GPS location within your barangay's vicinity?
4. **Success or Error** → Report submitted OR error message with distance info

### Validation Flow
```
User Clicks "Submit Report"
    ↓
Check Authentication
    ↓
Load User Profile
    ↓
Check Barangay Allowed? → NO → Error: "Reporting not available"
    ↓ YES
Get GPS Location
    ↓
Calculate Distance from Barangay Center
    ↓
Within Radius? → NO → Error: "Outside barangay vicinity"
    ↓ YES
Validate Form Fields
    ↓
Submit to Database
    ↓
Success!
```

## Barangay Coverage

| Barangay | Coverage Radius | Total Area |
|----------|----------------|------------|
| Pinagbakahan | 2.0 km | ~12.6 km² |
| Look | 1.5 km | ~7.1 km² |
| Bulihan | 1.8 km | ~10.2 km² |
| Dakila | 1.5 km | ~7.1 km² |
| Mojon | 1.7 km | ~9.1 km² |

## Error Messages

### Outside Vicinity
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

### No GPS Signal
```
Error

Unable to get your current location. 
Please ensure location services are enabled 
and try again.
```

### Permission Denied
```
Location Required

Location access is required to submit reports. 
Please enable location permissions and try again.
```

## Technical Details

### Files Modified
1. **`utils/BulacanBarangays.ts`**
   - Added `BARANGAY_COORDINATES` with center points and radius
   - Added `isWithinBarangayVicinity()` function
   - Added Haversine distance calculation

2. **`screens/MapScreen.tsx`**
   - Enhanced `handleSubmitReport()` function
   - Added vicinity check before submission
   - Added informative error messages

### Key Functions

```typescript
// Check if user is within barangay vicinity
isWithinBarangayVicinity(
  userBarangay: string,
  currentLatitude: number,
  currentLongitude: number
): {
  isWithin: boolean;      // true if within radius
  distance: number;        // km from barangay center
  allowedRadius: number;   // max allowed distance
}
```

## Testing Checklist

- [ ] User in correct barangay → Report succeeds
- [ ] User outside barangay → Report fails with distance
- [ ] User in different barangay → Report fails
- [ ] GPS disabled → Clear error message
- [ ] Permission denied → Permission request
- [ ] Border area → Works if within radius

## Configuration

### Adjust Radius
Edit `utils/BulacanBarangays.ts`:
```typescript
"Pinagbakahan": {
  radiusKm: 2.5  // Increase from 2.0 to 2.5 km
}
```

### Add New Barangay
```typescript
"NewBarangay": {
  latitude: 14.XXXX,   // From Google Maps
  longitude: 120.XXXX,
  radiusKm: 1.5
}
```

## Support

### User Can't Report
1. Check GPS is enabled
2. Check location permission granted
3. Verify user is in their barangay
4. Try restarting app
5. Contact support with screenshot

### Admin Tasks
- Update coordinates if inaccurate
- Adjust radius if too restrictive
- Add new barangays as needed
- Monitor false positive reports

## Benefits

✅ **Authenticity** - Users must be present at location
✅ **Data Quality** - Reduces false/spam reports  
✅ **Trust** - Increases report credibility
✅ **Accountability** - Users report from actual location
✅ **User-Friendly** - Transparent to legitimate users

## Limitations

⚠️ **GPS Accuracy** - ±10-50m typical accuracy
⚠️ **Spoofing Possible** - Mock location apps exist
⚠️ **Border Issues** - Near boundaries may fail
⚠️ **Indoor GPS** - May be weak/unavailable
⚠️ **Battery Drain** - GPS usage increases battery use

## Next Steps

Consider implementing:
- Polygon boundaries (more accurate)
- Mock location detection
- Historical presence verification
- Admin override capability
- Appeal/support mechanism

---

**Implementation Date**: October 4, 2025  
**Status**: ✅ Active  
**Version**: 1.0
