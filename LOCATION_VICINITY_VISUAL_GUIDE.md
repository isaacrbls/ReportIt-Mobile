# Location Vicinity Check - Visual Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REPORT SUBMISSION FLOW                    │
└─────────────────────────────────────────────────────────────┘

    USER                    SYSTEM                   DATABASE
     │                        │                          │
     │  1. Open Report Form   │                          │
     ├───────────────────────>│                          │
     │                        │                          │
     │  2. Fill Details       │                          │
     ├───────────────────────>│                          │
     │                        │                          │
     │  3. Click Submit       │                          │
     ├───────────────────────>│                          │
     │                        │                          │
     │                    ┌───┴───┐                      │
     │                    │ AUTH  │                      │
     │                    │ CHECK │                      │
     │                    └───┬───┘                      │
     │                        │                          │
     │                    ┌───┴───┐                      │
     │                    │ LOAD  │───────────────────> │
     │                    │PROFILE│ <─────────────────── │
     │                    └───┬───┘                      │
     │                        │                          │
     │                    ┌───┴────────┐                 │
     │                    │ BARANGAY   │                 │
     │                    │  ALLOWED?  │                 │
     │                    └───┬────┬───┘                 │
     │                        │    │                     │
     │                       YES  NO                     │
     │                        │    │                     │
     │                        │    └──> ❌ ERROR         │
     │                        │         "Not allowed"    │
     │  <─────────────────────┘                         │
     │                        │                          │
     │                    ┌───┴─────┐                    │
     │                    │   GET   │                    │
     │                    │   GPS   │                    │
     │                    │LOCATION │                    │
     │                    └───┬─────┘                    │
     │                        │                          │
     │                    ┌───┴──────────┐               │
     │                    │  CALCULATE   │               │
     │                    │  DISTANCE    │               │
     │                    │ (Haversine)  │               │
     │                    └───┬──────────┘               │
     │                        │                          │
     │                    ┌───┴──────┐                   │
     │                    │ WITHIN   │                   │
     │                    │ RADIUS?  │                   │
     │                    └───┬──┬───┘                   │
     │                        │  │                       │
     │                       YES NO                      │
     │                        │  │                       │
     │                        │  └──> ❌ ERROR           │
     │                        │      "Outside vicinity"  │
     │  <─────────────────────┘      (with distance)    │
     │                        │                          │
     │                    ┌───┴────┐                     │
     │                    │VALIDATE│                     │
     │                    │ FORM   │                     │
     │                    └───┬────┘                     │
     │                        │                          │
     │                    ┌───┴────┐                     │
     │                    │ SUBMIT │──────────────────> │
     │                    │ REPORT │ <────────────────── │
     │                    └───┬────┘                     │
     │                        │                          │
     │  4. ✅ Success!       │                          │
     │  <─────────────────────┘                         │
     │                                                   │
```

## Geographic Coverage Map

```
        ┌──────────────────────────────────────────┐
        │      MALOLOS CITY BARANGAYS              │
        │      (Allowed Reporting Areas)           │
        └──────────────────────────────────────────┘

                    N (14.86°)
                        ↑
                        │
                    ┌───┴────┐
                    │BULIHAN │
                    │ r=1.8km│
                    └────────┘
                        │
            ┌───────────┼───────────┐
            │           │           │
        ┌───┴───┐   ┌───┴───┐  ┌───┴───┐
        │ LOOK  │   │DAKILA │  │ MOJON │
        │r=1.5km│   │r=1.5km│  │r=1.7km│
        └───────┘   └───────┘  └───────┘
                        │
                    ┌───┴──────────┐
                    │ PINAGBAKAHAN │
                    │   r=2.0km    │
                    └──────────────┘
                        │
        W (120.80°) ←───┴───→ E (120.83°)
                        │
                        ↓
                    S (14.83°)

Legend:
  ├─────┤  Coverage area (radius from center)
  • Center point (latitude, longitude)
  r Radius in kilometers
```

## Distance Calculation

```
┌─────────────────────────────────────────────────────────┐
│            HAVERSINE FORMULA VISUALIZATION               │
└─────────────────────────────────────────────────────────┘

        User Location              Barangay Center
             📍                          ⭐
         (lat1, lon1)              (lat2, lon2)
              │                          │
              │    Calculate Distance    │
              │◄────────────────────────►│
              │                          │
              │      Using Formula:      │
              │                          │
              │   d = R × c              │
              │                          │
              │   where:                 │
              │   - R = 6,371 km         │
              │   - c = 2×atan2(√a,√1-a) │
              │   - a = sin²(Δφ/2) +     │
              │       cos(φ1)×cos(φ2)×   │
              │       sin²(Δλ/2)         │
              │                          │
              └──────────────────────────┘

Example Calculation:
═══════════════════

User at:     14.8450°N, 120.8120°E
Barangay:    14.8441°N, 120.8118°E
────────────────────────────────────
Distance:    ~0.10 km
Radius:      2.0 km
Result:      ✅ WITHIN VICINITY
```

## Decision Matrix

```
┌────────────────────────────────────────────────────────┐
│        REPORT SUBMISSION DECISION TREE                  │
└────────────────────────────────────────────────────────┘

                   START
                     │
              ┌──────┴──────┐
              │ Authenticated?│
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │     YES     │
              └──────┬──────┘
                     │
              ┌──────┴──────────────┐
              │ Registered Barangay │
              │   in allowed list?  │
              └──────┬──────┬───────┘
                     │      │
                   YES     NO ──────> ❌ REJECT
                     │               "Barangay not allowed"
                     │
              ┌──────┴──────────────┐
              │  GPS Location OK?   │
              └──────┬──────┬───────┘
                     │      │
                   YES     NO ──────> ❌ REJECT
                     │               "Enable GPS"
                     │
              ┌──────┴──────────────┐
              │ Distance Calculation│
              └──────┬──────────────┘
                     │
              ┌──────┴──────────────┐
              │  d ≤ radius?        │
              └──────┬──────┬───────┘
                     │      │
                   YES     NO ──────> ❌ REJECT
                     │               "Outside vicinity"
                     │               "Distance: X.XX km"
                     │               "Allowed: Y.Y km"
                     │
              ┌──────┴──────────────┐
              │   Form Valid?       │
              └──────┬──────┬───────┘
                     │      │
                   YES     NO ──────> ❌ REJECT
                     │               "Fill all fields"
                     │
              ┌──────┴──────────────┐
              │   ✅ ACCEPT         │
              │   Submit Report     │
              └─────────────────────┘
```

## Coverage Zones

```
┌────────────────────────────────────────────────────────┐
│         BARANGAY COVERAGE VISUALIZATION                 │
└────────────────────────────────────────────────────────┘

    Example: Pinagbakahan (2.0 km radius)

                  ┌─────────────────┐
                  │                 │
              ┌───┤   OUTSIDE       │
              │   │   ❌ Reject     │
              │   │   (>2.0 km)     │
              │   └─────────────────┘
              │
          ┌───┴────────────────────────┐
          │                            │
          │    VICINITY ZONE           │
          │    ✅ Accept               │
          │    (0 - 2.0 km)            │
          │                            │
          │       ┌─────┐              │
          │       │  ⭐  │◄──── Barangay Center
          │       └─────┘              │
          │                            │
          │                            │
          └────────────────────────────┘
              │
              │   ┌─────────────────┐
              └───┤   OUTSIDE       │
                  │   ❌ Reject     │
                  │   (>2.0 km)     │
                  └─────────────────┘

  ⭐ = Barangay center (14.8441, 120.8118)
  ├─────┤ = 2.0 km radius
  ✅ = Report allowed
  ❌ = Report rejected
```

## User Journey Map

```
┌────────────────────────────────────────────────────────┐
│            USER EXPERIENCE FLOW                         │
└────────────────────────────────────────────────────────┘

SCENARIO 1: Successful Report (Happy Path)
═══════════════════════════════════════════

👤 User opens app
    │
    ├─> 📱 Navigates to Map Screen
    │
    ├─> 🗺️ Sees reports and map
    │
    ├─> ⚠️ Clicks "Report" button
    │
    ├─> 📝 Fills incident form
    │       - Type: "Accident"
    │       - Description: "Car collision"
    │       - Photos: 2 images
    │
    ├─> 📤 Clicks "Submit"
    │
    ├─> ⏳ System checks location...
    │
    └─> ✅ SUCCESS!
        "Report submitted successfully"
        (System detected user in barangay)


SCENARIO 2: Failed Report (Outside Vicinity)
════════════════════════════════════════════

👤 User opens app
    │
    ├─> 📱 Navigates to Map Screen
    │
    ├─> ⚠️ Clicks "Report" button
    │
    ├─> 📝 Fills incident form
    │
    ├─> 📤 Clicks "Submit"
    │
    ├─> ⏳ System checks location...
    │
    └─> ❌ FAILED!
        ┌──────────────────────────────┐
        │ Location Verification Failed │
        │                              │
        │ You are 3.5 km away from     │
        │ your barangay (Pinagbakahan) │
        │                              │
        │ Allowed distance: 2.0 km     │
        │                              │
        │ Please go to your barangay   │
        └──────────────────────────────┘
```

## Technical Flow

```
┌────────────────────────────────────────────────────────┐
│         CODE EXECUTION FLOW                             │
└────────────────────────────────────────────────────────┘

handleSubmitReport()
    │
    ├─> AuthService.getCurrentUser()
    │   │
    │   └─> ✓ User authenticated
    │
    ├─> UserService.getCurrentUserProfile()
    │   │
    │   └─> ✓ Profile loaded
    │
    ├─> isReportingAllowed(barangay)
    │   │
    │   └─> ✓ Barangay allowed
    │
    ├─> LocationService.getCurrentLocation()
    │   │
    │   └─> ✓ GPS coordinates obtained
    │
    ├─> isWithinBarangayVicinity()
    │   │
    │   ├─> calculateDistance()
    │   │   │
    │   │   └─> Haversine formula
    │   │       distance = 1.2 km
    │   │
    │   └─> Compare: 1.2 km ≤ 2.0 km?
    │       │
    │       └─> ✓ Within vicinity
    │
    ├─> validateFormFields()
    │   │
    │   └─> ✓ Form valid
    │
    └─> ReportsService.createReport()
        │
        └─> ✅ Report saved to Firestore
```

## Data Flow

```
┌────────────────────────────────────────────────────────┐
│            DATA & STATE MANAGEMENT                      │
└────────────────────────────────────────────────────────┘

INPUT DATA                  PROCESSING              OUTPUT
══════════                  ══════════              ══════

User Profile                                        Decision
├─ Barangay: "Pinagbakahan" ──┐                    ┌─> ✅ Allow
├─ Email: "user@email.com"    │                    │   OR
└─ Role: "user"               │                    └─> ❌ Deny
                              │
GPS Location                  │
├─ Latitude: 14.8450         ├──> VALIDATION
├─ Longitude: 120.8120       │    LOGIC
└─ Accuracy: ±20m            │    ┌─────────┐
                             ├───>│ Barangay│
Barangay Data                │    │ Allowed?│
├─ Center: 14.8441,120.8118  │    └────┬────┘
├─ Radius: 2.0 km            │         │
└─ Name: "Pinagbakahan"      │    ┌────┴────┐
                             ├───>│Distance │
Report Data                  │    │  Check  │
├─ Type: "Accident"          │    └────┬────┘
├─ Description: "..."        │         │
├─ Media: [photo1, photo2]   │    ┌────┴────┐
└─ Location: GPS coords      ├───>│ Within  │
                             │    │ Radius? │
                             │    └────┬────┘
                             │         │
                             └─────────┴──> RESULT
                                              ├─> isWithin: true
                                              ├─> distance: 1.2km
                                              └─> allowed: 2.0km
```

---

**Visual Guide Version**: 1.0  
**Created**: October 4, 2025  
**Purpose**: Developer & stakeholder reference
