# ReportIt Mobile - Master Test Plan

## Subject Code/Description
**IT Capstone Project - ReportIt Mobile (Incident Reporting System for Malolos, Bulacan)**

Enable automated functional testing of the ReportIt mobile application post-final defense, ensuring the developed system meets functional requirements efficiently and accurately using Appium mobile automation framework.

## Pre-requisites
- **Deployed or stable test environment** mirroring production for the mobile-based ReportIt-Mobile system
- **Access to test data and accounts** for User roles (test.user@reportit.com, deactivated.user@reportit.com)
- **Installed automation tools and dependencies:** Node.js 14+, Appium 2.0+, TypeScript 5.9+, WebDriverIO 9.5+, Mocha 10.7+, and Chai
- **Mobile app builds:** Android APK and/or iOS IPA (Expo development builds or production builds)
- **Backend Firebase services** running with test project populated for testing (Auth, Realtime Database, Firestore, Storage)

## Lab Setup
- **Environment:** Dedicated test workspace with stable Appium server, physical Android device or emulator (API 29+), sample Firebase database, and role-based credentials (User role)
- **Tooling:** Configure Appium Server with uiautomator2/xcuitest drivers, WebDriverIO test runner with Mocha framework, TypeScript compilation, enable screenshot capture on failures, and Allure reporting
- **Data & Constraints:** Use anonymized sample data for incident reports, test barangay coordinates within Malolos City (ALLOWED_REPORTING_BARANGAYS), exclude web-native testing, third-party CDN uptime (Leaflet), and performance benchmarking per out-of-scope limitations

## Step 1: Define Functional Test Scenarios
The following representative test scenarios are drawn from the consolidated Test Cases document and focus on high-value user flows across Authentication, Location Services, Incident Reporting, Map Visualization, Navigation, and Offline Functionality.

These scenarios represent core operations of the ReportIt-Mobile system, ensuring complete coverage of both end-user mobile workflows and Firebase backend integration.

Each test case defines the expected outcome, preconditions, and criteria for success aligned with the testing quadrants (Q1 – Q4).

Refer to the attached test execution results document for the full catalog of defined cases across all quadrants.

### Q1 – Authentication & Onboarding

| Test Case ID | Scenario | Expected Outcome | Preconditions |
|--------------|----------|------------------|---------------|
| AUTH-001 | Launch app for first time | Display Welcome screen with "Get Started" button | Fresh app install, no AsyncStorage data |
| AUTH-002 | Launch app after first use | Display Login screen directly | hasLaunchedBefore = true in AsyncStorage |
| AUTH-003 | Valid user login | Redirect to Map screen, user authenticated | Valid user credentials, active account |
| AUTH-004 | Invalid email/password login | Display error message "Invalid email or password" | Invalid credentials |
| AUTH-005 | Login with non-user role | Display error "Only users can access this app" | Account with 'admin' or 'staff' role |
| AUTH-006 | Login with deactivated account | Reactivate account, redirect to Map screen | Deactivated user account |
| AUTH-007 | Navigate to Signup from Login | Display Signup screen with form fields | On Login screen |
| AUTH-008 | Complete signup with valid data | Create user account, redirect to Terms screen | Valid signup data, unique email |
| AUTH-009 | Signup with existing email | Display error "Email already in use" | Email already registered |
| AUTH-010 | Accept Terms and Conditions | Create user profile, redirect to Map screen | New user at Terms screen |

### Q2 – Location Services & Geo-Restrictions

| Test Case ID | Scenario | Expected Outcome | Preconditions |
|--------------|----------|------------------|---------------|
| LOC-001 | Request location permission (first time) | Show system permission dialog | Location permission not granted |
| LOC-002 | Grant location permission | Return permission status 'granted' | Permission dialog displayed |
| LOC-003 | Deny location permission | Show alert to open device settings | Permission dialog displayed |
| LOC-004 | Get current location (allowed barangay) | Return latitude, longitude within bounds | Permission granted, GPS enabled |
| LOC-005 | Validate location within reporting area | isReportingAllowed returns true | Location in ALLOWED_REPORTING_BARANGAYS |
| LOC-006 | Validate location outside reporting area | isReportingAllowed returns false | Location outside allowed barangays |

### Q3 – Incident Reporting CRUD Operations

| Test Case ID | Scenario | Expected Outcome | Preconditions |
|--------------|----------|------------------|---------------|
| REPORT-001 | Tap "Report Incident" button | Display report modal with form fields | On Map screen, location permission granted |
| REPORT-002 | Submit report with all required fields | Create report in Firestore, show success | Valid data, location in allowed area |
| REPORT-003 | Submit report without location | Display error "Location required" | No GPS fix |
| REPORT-004 | Submit report outside allowed area | Display error about reporting restrictions | Location outside ALLOWED_REPORTING_BARANGAYS |
| REPORT-005 | Add photo to report | Display selected photo in form | On report modal, camera permission granted |
| REPORT-006 | Submit report with photo | Upload to Firebase Storage, save URL in report | Photo selected |
| REPORT-007 | Cancel report creation | Close modal, discard form data | On report modal |
| REPORT-008 | Create report offline | Save to OfflineReportsService queue | No internet connection |
| REPORT-009 | Sync offline reports on reconnect | Upload queued reports to Firestore | Offline reports exist, internet restored |

### Q4 – Map Visualization & Navigation

| Test Case ID | Scenario | Expected Outcome | Preconditions |
|--------------|----------|------------------|---------------|
| MAP-001 | Load Map screen | Display Leaflet map with user location marker | Logged in, location permission granted |
| MAP-002 | Display user location on map | Blue pulse marker at current GPS coordinates | Location services enabled |
| MAP-003 | Display report markers | Render markers with category-specific icons | Reports exist in Firestore |
| MAP-004 | Tap report marker | Display popup with incident details | Report markers visible |
| MAP-005 | Display hotspot circles | Render red circles at high-density incident areas | Multiple reports in same barangay |
| MAP-006 | Pan and zoom map | Map responds to touch gestures | Map loaded |
| MAP-007 | Map bounds restriction | Prevent scrolling outside Philippines bounds | Map loaded |
| MAP-008 | WebView communication | Receive messages from Leaflet via postMessage | Map interaction occurs |

### Scope Alignment: Testing Cycle
- **Features to be tested include:** User authentication & signup, location services & GPS, incident report creation with photo upload, map visualization with WebView, offline report queueing & sync, role-based access control, navigation flows & back button handling, profile management, Terms & Conditions flow
- **Items excluded this cycle:** Third-party CDN uptime (Leaflet maps), Firebase service performance, iOS-specific testing (if no macOS available), ML-based report categorization, advanced analytics dashboard, real-time collaboration, native mobile app store deployment testing

## Test Strategy

### Test Levels
1. **Functional Testing:** Verify each feature works as specified
2. **Integration Testing:** Verify Firebase services integrate correctly
3. **System Testing:** End-to-end user workflows
4. **Acceptance Testing:** Validate against capstone requirements

### Automation Approach
- **Framework:** Appium with WebDriverIO/Mocha
- **Language:** TypeScript
- **Pattern:** Page Object Model (POM) for maintainability
- **Reporting:** Allure or Mochawesome for test reports
- **CI/CD:** GitHub Actions (optional for continuous testing)

## Test Environment
- **Devices:**
  - Android: Physical device or emulator (API 29+)
  - iOS: Physical device or simulator (iOS 13+)
- **App Build:** Expo development build or standalone APK/IPA
- **Network:** WiFi with internet for Firebase connectivity
- **Location:** Mock GPS coordinates for Malolos City barangays

## Test Data Requirements
- **Test Users:**
  - Valid user account (role: 'user')
  - Deactivated account (for reactivation testing)
  - Invalid credentials (for negative testing)
- **Test Reports:**
  - Sample incidents with photos
  - Reports in different categories (Crime, Traffic, Health, etc.)
  - Reports in allowed vs. restricted barangays
- **Test Locations:**
  - Coordinates within ALLOWED_REPORTING_BARANGAYS
  - Coordinates outside reporting vicinity
  - Coordinates outside Malolos City

## Functional Test Scenarios

### 1. Authentication & Onboarding (AUTH Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| AUTH-001 | Launch app for first time | Display Welcome screen with "Get Started" button | Fresh app install, no AsyncStorage data |
| AUTH-002 | Launch app after first use | Display Login screen directly | hasLaunchedBefore = true in AsyncStorage |
| AUTH-003 | Valid user login | Redirect to Map screen, user authenticated | Valid user credentials, active account |
| AUTH-004 | Invalid email/password login | Display error message "Invalid email or password" | Invalid credentials |
| AUTH-005 | Login with non-user role | Display error "Only users can access this app" | Account with 'admin' or 'staff' role |
| AUTH-006 | Login with deactivated account | Reactivate account, redirect to Map screen | Deactivated user account |
| AUTH-007 | Navigate to Signup from Login | Display Signup screen with form fields | On Login screen |
| AUTH-008 | Complete signup with valid data | Create user account, redirect to Terms screen | Valid signup data, unique email |
| AUTH-009 | Signup with existing email | Display error "Email already in use" | Email already registered |
| AUTH-010 | Accept Terms and Conditions | Create user profile, redirect to Map screen | New user at Terms screen |

### 2. Password Management (PWD Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| PWD-001 | Tap "Forgot Password?" link | Navigate to ForgotPassword screen | On Login screen |
| PWD-002 | Request password reset with valid email | Send reset email, show success message | Valid registered email |
| PWD-003 | Request reset with unregistered email | Display error or success (security pattern) | Invalid email |
| PWD-004 | Navigate back from password reset | Return to Login screen | On ForgotPassword screen |

### 3. User Profile Management (PROF Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| PROF-001 | Access profile from Map menu | Display EditProfile screen with current data | Logged in user |
| PROF-002 | Update profile with valid data | Save changes, display success message | On EditProfile screen |
| PROF-003 | Update profile with empty required fields | Display validation errors | On EditProfile screen |
| PROF-004 | Logout from profile screen | Clear auth state, return to Login screen | Logged in user |

### 4. Location Services (LOC Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| LOC-001 | Request location permission (first time) | Show system permission dialog | Location permission not granted |
| LOC-002 | Grant location permission | Return permission status 'granted' | Permission dialog displayed |
| LOC-003 | Deny location permission | Show alert to open settings | Permission dialog displayed |
| LOC-004 | Get current location (allowed barangay) | Return latitude, longitude within bounds | Permission granted, GPS enabled |
| LOC-005 | Validate location within reporting area | isReportingAllowed returns true | Location in ALLOWED_REPORTING_BARANGAYS |
| LOC-006 | Validate location outside reporting area | isReportingAllowed returns false | Location outside allowed barangays |

### 5. Incident Reporting (REPORT Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| REPORT-001 | Tap "Report Incident" button | Display report modal with form fields | On Map screen, location permission granted |
| REPORT-002 | Submit report with all required fields | Create report in Firestore, show success | Valid data, location in allowed area |
| REPORT-003 | Submit report without location | Display error "Location required" | No GPS fix |
| REPORT-004 | Submit report outside allowed area | Display error about reporting restrictions | Location outside ALLOWED_REPORTING_BARANGAYS |
| REPORT-005 | Add photo to report | Display selected photo in form | On report modal, camera permission granted |
| REPORT-006 | Submit report with photo | Upload to Firebase Storage, save URL in report | Photo selected |
| REPORT-007 | Cancel report creation | Close modal, discard form data | On report modal |
| REPORT-008 | Create report offline | Save to OfflineReportsService queue | No internet connection |
| REPORT-009 | Sync offline reports on reconnect | Upload queued reports to Firestore | Offline reports exist, internet restored |

### 6. Map Visualization (MAP Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| MAP-001 | Load Map screen | Display Leaflet map with user location marker | Logged in, location permission granted |
| MAP-002 | Display user location on map | Blue pulse marker at current GPS coordinates | Location services enabled |
| MAP-003 | Display report markers | Render markers with category-specific icons | Reports exist in Firestore |
| MAP-004 | Tap report marker | Display popup with incident details | Report markers visible |
| MAP-005 | Display hotspot circles | Render red circles at high-density incident areas | Multiple reports in same barangay |
| MAP-006 | Pan and zoom map | Map responds to touch gestures | Map loaded |
| MAP-007 | Map bounds restriction | Prevent scrolling outside Philippines bounds | Map loaded |
| MAP-008 | WebView communication | Receive messages from Leaflet via postMessage | Map interaction occurs |

### 7. Navigation & Back Button (NAV Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| NAV-001 | Press back on Welcome screen | No action (cannot go back) | On Welcome screen |
| NAV-002 | Press back on Login screen | Exit app confirmation | On Login screen |
| NAV-003 | Press back on Signup screen | Return to Login screen | On Signup screen |
| NAV-004 | Press back on Terms screen | Return to Signup screen | On Terms screen |
| NAV-005 | Press back on Map screen | Exit app confirmation | On Map screen (main screen) |
| NAV-006 | Press back on EditProfile | Return to Map screen | On EditProfile screen |
| NAV-007 | Navigate through full signup flow | Welcome → Login → Signup → Terms → Map | First-time user |

### 8. Offline Functionality (OFFLINE Module)

| Test Case ID | Test Scenario | Expected Outcome | Preconditions |
|--------------|---------------|------------------|---------------|
| OFFLINE-001 | Create report with no internet | Store report locally, show queued status | Offline mode, valid report data |
| OFFLINE-002 | View offline queue | Display list of pending reports | Offline reports exist |
| OFFLINE-003 | Reconnect with queued reports | Auto-sync reports, clear queue on success | Internet restored |
| OFFLINE-004 | Sync failure handling | Retry or show error, keep in queue | Sync fails (e.g., auth expired) |

## Test Execution Schedule
1. **Phase 1 (Week 1):** Authentication & Onboarding (AUTH-001 to AUTH-010)
2. **Phase 2 (Week 2):** Profile & Password Management (PWD-001 to PROF-004)
3. **Phase 3 (Week 3):** Location Services & Reporting (LOC-001 to REPORT-009)
4. **Phase 4 (Week 4):** Map Visualization & Navigation (MAP-001 to NAV-007)
5. **Phase 5 (Week 5):** Offline & Regression Testing (OFFLINE-001 to OFFLINE-004)

## Entry Criteria
- App deployed to test environment (APK/IPA available)
- Test devices/emulators configured and accessible
- Appium server running and validated
- Test data prepared in Firebase test project
- Test automation framework set up

## Exit Criteria
- All critical and high-priority test cases executed
- 90% pass rate for automated tests
- All blocking defects resolved
- Test report generated and reviewed
- Acceptance criteria validated

## Deliverables
1. Automated test scripts (TypeScript/JavaScript)
2. Test execution report (Allure/Mochawesome)
3. Defect log with screenshots/videos
4. Test coverage matrix
5. Capstone documentation appendix

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Device/emulator instability | Test flakiness | Use stable API levels, retry logic |
| Firebase test data contamination | Incorrect results | Isolate test project, teardown scripts |
| Location mocking limitations | Cannot test geo-restrictions | Use Appium location simulation |
| Appium version compatibility | Setup issues | Pin Appium version, validate with Appium Doctor |
| Test execution time | Slow feedback | Parallelize tests, focus on critical paths |

## Approval
- **Prepared by:** [Student Name]
- **Reviewed by:** [Adviser/Panel]
- **Date:** November 13, 2025
- **Version:** 1.0
