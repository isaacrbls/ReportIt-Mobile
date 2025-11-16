# ReportIt Mobile - Test Execution Results

**Subject Code/Description:** IT Capstone Project - ReportIt Mobile (Incident Reporting System)  
**Test Type:** Automated Mobile Application Testing (Functional, Integration, System)  
**Testing Framework:** Appium + WebDriverIO + Mocha + TypeScript  
**Execution Date:** [To be filled during actual execution]  
**Tester:** [Your Name]  
**Version Tested:** [App Version]

---

## EXECUTIVE SUMMARY

### Test Execution Overview

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Test Cases** | 33 | 100% |
| **Executed** | [Fill during execution] | [%] |
| **Passed** | [Fill during execution] | [%] |
| **Failed** | [Fill during execution] | [%] |
| **Blocked** | [Fill during execution] | [%] |
| **Not Executed** | [Fill during execution] | [%] |

### Test Summary by Module

| Module | Total | Passed | Failed | Pass Rate |
|--------|-------|--------|--------|-----------|
| Authentication & Onboarding | 10 | [Fill] | [Fill] | [%] |
| Password Management | 4 | [Fill] | [Fill] | [%] |
| User Profile | 4 | [Fill] | [Fill] | [%] |
| Location Services | 6 | [Fill] | [Fill] | [%] |
| Incident Reporting | 9 | [Fill] | [Fill] | [%] |
| Map Visualization | 8 | [Fill] | [Fill] | [%] |
| Navigation | 7 | [Fill] | [Fill] | [%] |
| Offline Functionality | 4 | [Fill] | [Fill] | [%] |

### Test Environment Details

| Component | Details |
|-----------|---------|
| **Device Model** | [e.g., Samsung Galaxy A52 / Pixel 5 Emulator] |
| **OS Version** | [e.g., Android 12 / iOS 15] |
| **App Build** | [e.g., APK v1.0.0 / Expo Dev Build] |
| **Appium Version** | [e.g., 2.5.1] |
| **Test Framework** | WebDriverIO 9.5.6 + Mocha 10.7.3 |
| **Execution Date** | [e.g., November 16, 2025] |
| **Execution Time** | [e.g., Started: 10:00 AM, Ended: 12:30 PM] |
| **Test Duration** | [e.g., 2 hours 30 minutes] |

---

## DETAILED TEST RESULTS

### 1. AUTHENTICATION & ONBOARDING MODULE (AUTH-001 to AUTH-010)

#### AUTH-001: Launch App for First Time

**Objective:** Verify that the Welcome screen displays on first app launch  
**Priority:** High  
**Preconditions:**  
- Fresh app install with no AsyncStorage data
- Device has internet connectivity

**Test Data:**
| Field | Value |
|-------|-------|
| App State | Fresh install |
| AsyncStorage Key | `hasLaunchedBefore` = null |

**Test Steps:**
1. Install ReportIt Mobile app on test device
2. Launch the application
3. Observe initial screen displayed

**Expected Result:**
- Welcome screen appears with logo
- "Get Started" button is visible
- No automatic navigation to Login screen

**Actual Result:**  
[To be filled during execution - e.g., "Welcome screen displayed as expected"]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:** [Screenshot: `screenshots/AUTH-001_welcome_screen.png`]  
**Execution Time:** [e.g., 5 seconds]  
**Notes:** [Any observations]

---

#### AUTH-002: Launch App After First Use

**Objective:** Verify that Login screen displays directly on subsequent launches  
**Priority:** High  
**Preconditions:**  
- App has been launched at least once
- AsyncStorage contains `hasLaunchedBefore = true`

**Test Data:**
| Field | Value |
|-------|-------|
| App State | Previously launched |
| AsyncStorage Key | `hasLaunchedBefore` = true |

**Test Steps:**
1. Launch the application (not first time)
2. Observe initial screen displayed

**Expected Result:**
- Login screen appears directly
- Welcome screen is skipped
- Email and password fields visible

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:** [Screenshot: `screenshots/AUTH-002_login_screen.png`]  
**Execution Time:** [e.g., 3 seconds]  
**Notes:** [Any observations]

---

#### AUTH-003: Valid User Login

**Objective:** Verify successful login with valid credentials  
**Priority:** Critical  
**Preconditions:**  
- User has valid account with role 'user'
- Account is active (not deactivated)
- User is on Login screen

**Test Data:**
| Field | Value |
|-------|-------|
| Email | test.user@reportit.com |
| Password | TestPassword123! |
| Role | user |
| Account Status | active |

**Test Steps:**
1. Navigate to Login screen
2. Enter valid email address
3. Enter valid password
4. Tap "Login" button
5. Wait for authentication

**Expected Result:**
- Loading indicator appears during authentication
- User successfully authenticated
- Redirected to Map screen
- User location marker visible on map

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:**  
- [Screenshot: `screenshots/AUTH-003_login_form.png`]
- [Screenshot: `screenshots/AUTH-003_map_screen.png`]  
**Execution Time:** [e.g., 8 seconds]  
**Firebase Auth UID:** [e.g., "abc123xyz456"]  
**Notes:** [Any observations]

---

#### AUTH-004: Invalid Email/Password Login

**Objective:** Verify error handling for invalid credentials  
**Priority:** High  
**Preconditions:**  
- User is on Login screen

**Test Data:**
| Field | Value |
|-------|-------|
| Email | invalid@test.com |
| Password | WrongPassword123 |

**Test Steps:**
1. Navigate to Login screen
2. Enter invalid/unregistered email
3. Enter incorrect password
4. Tap "Login" button
5. Observe error message

**Expected Result:**
- Error message displayed: "Invalid email or password"
- User remains on Login screen
- Fields remain populated (for retry)

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:** [Screenshot: `screenshots/AUTH-004_error_message.png`]  
**Execution Time:** [e.g., 3 seconds]  
**Notes:** [Any observations]

---

#### AUTH-005: Login with Non-User Role

**Objective:** Verify role restriction for mobile app access  
**Priority:** Critical  
**Preconditions:**  
- Test account exists with role 'admin' or 'staff'
- User is on Login screen

**Test Data:**
| Field | Value |
|-------|-------|
| Email | admin@reportit.com |
| Password | AdminPassword123! |
| Role | admin |

**Test Steps:**
1. Navigate to Login screen
2. Enter credentials for non-user role account
3. Tap "Login" button
4. Observe error/restriction message

**Expected Result:**
- Error message: "Only users can access this app"
- Login rejected
- User remains on Login screen

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:** [Screenshot: `screenshots/AUTH-005_role_restriction.png`]  
**Execution Time:** [e.g., 3 seconds]  
**Notes:** [Any observations]

---

#### AUTH-006: Login with Deactivated Account

**Objective:** Verify automatic account reactivation on login  
**Priority:** High  
**Preconditions:**  
- User account exists with `isActive = false`
- User is on Login screen

**Test Data:**
| Field | Value |
|-------|-------|
| Email | deactivated.user@reportit.com |
| Password | UserPassword123! |
| Initial Status | isActive = false |

**Test Steps:**
1. Navigate to Login screen
2. Enter credentials for deactivated account
3. Tap "Login" button
4. Wait for processing
5. Verify account reactivated and user logged in

**Expected Result:**
- Account status updated to `isActive = true`
- User successfully logged in
- Redirected to Map screen

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:**  
- [Screenshot: `screenshots/AUTH-006_map_after_reactivation.png`]
- [Firebase Database: User profile showing isActive = true]  
**Execution Time:** [e.g., 5 seconds]  
**Notes:** [Any observations]

---

#### AUTH-007: Navigate to Signup from Login

**Objective:** Verify navigation flow from Login to Signup  
**Priority:** Medium  
**Preconditions:**  
- User is on Login screen

**Test Steps:**
1. Observe Login screen
2. Locate "Don't have an account? Sign Up" link
3. Tap the Sign Up link
4. Verify Signup screen displays

**Expected Result:**
- Navigation to Signup screen
- Form fields visible: First Name, Last Name, Email, Password, Confirm Password
- "Sign Up" button visible

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:** [Screenshot: `screenshots/AUTH-007_signup_screen.png`]  
**Execution Time:** [e.g., 2 seconds]  
**Notes:** [Any observations]

---

#### AUTH-008: Complete Signup with Valid Data

**Objective:** Verify successful user registration  
**Priority:** Critical  
**Preconditions:**  
- User is on Signup screen
- Email address not previously registered

**Test Data:**
| Field | Value |
|-------|-------|
| First Name | Juan |
| Last Name | Dela Cruz |
| Email | juan.delacruz@reportit.com |
| Password | SecurePass123! |
| Confirm Password | SecurePass123! |
| Role (auto-assigned) | user |

**Test Steps:**
1. Navigate to Signup screen
2. Fill in First Name field
3. Fill in Last Name field
4. Enter unique email address
5. Enter password (meeting requirements)
6. Confirm password
7. Tap "Sign Up" button
8. Wait for account creation

**Expected Result:**
- User account created in Firebase Auth
- User profile created in Realtime Database
- Navigation to Terms and Conditions screen
- No errors displayed

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:**  
- [Screenshot: `screenshots/AUTH-008_signup_form.png`]
- [Screenshot: `screenshots/AUTH-008_terms_screen.png`]
- [Firebase Auth: User record created]  
**Execution Time:** [e.g., 6 seconds]  
**Firebase Auth UID:** [e.g., "new_user_uid_123"]  
**Notes:** [Any observations]

---

#### AUTH-009: Signup with Existing Email

**Objective:** Verify duplicate email validation  
**Priority:** High  
**Preconditions:**  
- User is on Signup screen
- Email address already registered in system

**Test Data:**
| Field | Value |
|-------|-------|
| Email | existing.user@reportit.com (already registered) |
| Password | NewPassword123! |

**Test Steps:**
1. Navigate to Signup screen
2. Enter email that is already registered
3. Fill in other required fields
4. Tap "Sign Up" button
5. Observe error message

**Expected Result:**
- Error message: "Email already in use"
- Signup rejected
- User remains on Signup screen

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:** [Screenshot: `screenshots/AUTH-009_duplicate_email_error.png`]  
**Execution Time:** [e.g., 3 seconds]  
**Notes:** [Any observations]

---

#### AUTH-010: Accept Terms and Conditions

**Objective:** Verify terms acceptance and profile creation  
**Priority:** Critical  
**Preconditions:**  
- New user just completed signup
- User is on Terms and Conditions screen

**Test Steps:**
1. On Terms and Conditions screen
2. Scroll through terms content
3. Tap "I Accept" button
4. Wait for profile creation

**Expected Result:**
- User profile created/updated in Realtime Database
- Terms acceptance recorded
- Navigation to Map screen
- User can access app features

**Actual Result:**  
[To be filled during execution]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ BLOCKED  
**Evidence:**  
- [Screenshot: `screenshots/AUTH-010_terms_screen.png`]
- [Screenshot: `screenshots/AUTH-010_map_after_accept.png`]
- [Firebase Database: Profile created with termsAccepted = true]  
**Execution Time:** [e.g., 4 seconds]  
**Notes:** [Any observations]

---

### 2. PASSWORD MANAGEMENT MODULE (PWD-001 to PWD-004)

#### PWD-001: Navigate to Forgot Password Screen

**Objective:** Verify navigation to password reset flow  
**Priority:** Medium  
**Preconditions:** User is on Login screen

**Test Data:** N/A

**Test Steps:**
1. On Login screen
2. Tap "Forgot Password?" link
3. Verify ForgotPassword screen displays

**Expected Result:**
- Navigation to ForgotPassword screen
- Email input field visible
- "Send Reset Link" button visible

**Actual Result:** [To be filled]  
**Status:** [PASS/FAIL/BLOCKED]  
**Evidence:** [Screenshot: `screenshots/PWD-001_forgot_password.png`]  
**Execution Time:** [e.g., 2 seconds]

---

#### PWD-002: Request Password Reset with Valid Email

**Objective:** Verify password reset email sending  
**Priority:** High  
**Preconditions:**  
- User is on ForgotPassword screen
- Email is registered in system

**Test Data:**
| Field | Value |
|-------|-------|
| Email | registered.user@reportit.com |

**Test Steps:**
1. Enter registered email address
2. Tap "Send Reset Link" button
3. Observe success message
4. Check email inbox for reset link (manual verification)

**Expected Result:**
- Success message displayed
- Firebase sends password reset email
- User notified to check inbox

**Actual Result:** [To be filled]  
**Status:** [PASS/FAIL/BLOCKED]  
**Evidence:** [Screenshot: `screenshots/PWD-002_reset_success.png`]  
**Execution Time:** [e.g., 3 seconds]

---

#### PWD-003: Request Reset with Unregistered Email

**Objective:** Verify security pattern for invalid emails  
**Priority:** Medium  
**Preconditions:** User is on ForgotPassword screen

**Test Data:**
| Field | Value |
|-------|-------|
| Email | nonexistent@test.com |

**Test Steps:**
1. Enter unregistered email
2. Tap "Send Reset Link"
3. Observe response

**Expected Result:**
- Success message shown (security pattern - don't reveal if email exists)
- No actual email sent

**Actual Result:** [To be filled]  
**Status:** [PASS/FAIL/BLOCKED]  
**Evidence:** [Screenshot: `screenshots/PWD-003_unregistered_email.png`]  
**Execution Time:** [e.g., 2 seconds]

---

#### PWD-004: Navigate Back from Password Reset

**Objective:** Verify back navigation preserves user context  
**Priority:** Low  
**Preconditions:** User is on ForgotPassword screen

**Test Steps:**
1. On ForgotPassword screen
2. Press device back button OR tap back arrow
3. Verify return to Login screen

**Expected Result:**
- Navigation to Login screen
- Previous screen state preserved

**Actual Result:** [To be filled]  
**Status:** [PASS/FAIL/BLOCKED]  
**Evidence:** [Screenshot: `screenshots/PWD-004_back_to_login.png`]  
**Execution Time:** [e.g., 1 second]

---

### 3. USER PROFILE MODULE (PROF-001 to PROF-004)

[Similar detailed format for each test case...]

---

### 4. LOCATION SERVICES MODULE (LOC-001 to LOC-006)

[Similar detailed format for each test case...]

---

### 5. INCIDENT REPORTING MODULE (REPORT-001 to REPORT-009)

#### REPORT-002: Submit Report with All Required Fields

**Objective:** Verify successful incident report creation  
**Priority:** Critical  
**Preconditions:**  
- User logged in
- Location permission granted
- GPS location within allowed barangay
- On Map screen

**Test Data:**
| Field | Value |
|-------|-------|
| Category | Crime |
| Description | "Theft incident at corner of Main St" |
| Location | Lat: 14.8433, Lng: 120.8123 (Malolos Centro) |
| Photo | test_incident_photo.jpg |
| Timestamp | [Auto-generated] |

**Test Steps:**
1. Tap "Report Incident" button on Map
2. Report modal opens
3. Select "Crime" category
4. Enter incident description
5. Verify location auto-populated
6. Add photo (optional but included in test)
7. Tap "Submit Report" button
8. Wait for Firebase upload

**Expected Result:**
- Report created in Firestore `reports` collection
- Photo uploaded to Firebase Storage
- Success message displayed
- Modal closes
- New report marker appears on map

**Actual Result:** [To be filled]  
**Status:** [PASS/FAIL/BLOCKED]  
**Evidence:**  
- [Screenshot: `screenshots/REPORT-002_report_modal.png`]
- [Screenshot: `screenshots/REPORT-002_success_message.png`]
- [Screenshot: `screenshots/REPORT-002_marker_on_map.png`]
- [Firestore Document ID: e.g., "abc123xyz"]  
**Execution Time:** [e.g., 10 seconds]  
**Photo Upload Size:** [e.g., 2.3 MB]

---

[Continue with remaining test cases in same format...]

---

## DEFECT LOG

### Defect Summary

| Severity | Count |
|----------|-------|
| Critical | [Fill] |
| High | [Fill] |
| Medium | [Fill] |
| Low | [Fill] |
| **Total** | [Fill] |

---

### DEFECT-001: [Defect Title]

**Defect ID:** DEFECT-001  
**Related Test Case:** [e.g., AUTH-004]  
**Severity:** [Critical/High/Medium/Low]  
**Priority:** [P0/P1/P2/P3]  
**Status:** [Open/In Progress/Fixed/Closed]  
**Detected Date:** [Date]  
**Detected By:** [Tester Name]  
**Assigned To:** [Developer Name]

**Summary:**  
[Brief description of the defect]

**Preconditions:**  
[Steps to set up environment]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**  
[What should happen]

**Actual Result:**  
[What actually happened]

**Evidence:**
- [Screenshot: `screenshots/defects/DEFECT-001_error_screen.png`]
- [Video: `videos/DEFECT-001_reproduction.mp4`]
- [Console Logs: Attached]

**Environment:**
- Device: [Model]
- OS: [Version]
- App Build: [Version]
- Appium: [Version]

**Root Cause Analysis:** [To be filled by developer]  
**Fix Description:** [To be filled by developer]  
**Verification Status:** [Pass/Fail]  
**Retest Date:** [Date]

---

[Add more defects as discovered...]

---

## TEST COVERAGE ANALYSIS

### Functional Coverage

| Feature | Test Cases | Coverage |
|---------|-----------|----------|
| User Authentication | 10 | 100% |
| Password Reset | 4 | 100% |
| Profile Management | 4 | 100% |
| Location Services | 6 | 100% |
| Incident Reporting | 9 | 100% |
| Map Visualization | 8 | 100% |
| Navigation Flows | 7 | 100% |
| Offline Mode | 4 | 100% |

### Requirement Traceability

| Requirement ID | Description | Test Cases | Status |
|----------------|-------------|------------|--------|
| REQ-AUTH-001 | User login with valid credentials | AUTH-003 | ✅ Covered |
| REQ-AUTH-002 | Role-based access control | AUTH-005 | ✅ Covered |
| REQ-REPORT-001 | Create incident report | REPORT-002 | ✅ Covered |
| REQ-REPORT-002 | Geo-restricted reporting | REPORT-004, LOC-005, LOC-006 | ✅ Covered |
| REQ-MAP-001 | Display user location | MAP-002 | ✅ Covered |
| REQ-MAP-002 | Display incident markers | MAP-003 | ✅ Covered |
| [Continue...] | [...] | [...] | [...] |

---

## RISK ASSESSMENT

### Test Execution Risks

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| Firebase test data contamination | High | Medium | Use isolated test project | Mitigated |
| Device/emulator instability | Medium | High | Use stable API levels | Ongoing |
| Location mocking limitations | Medium | Medium | Use Appium location APIs | Mitigated |
| Network connectivity issues | Medium | Low | Implement retry logic | Mitigated |

---

## RECOMMENDATIONS

### Critical Issues
1. [If any critical defects found, list here]
2. [...]

### Test Process Improvements
1. Implement parallel test execution for faster feedback
2. Add visual regression testing for UI consistency
3. Integrate with CI/CD pipeline (GitHub Actions)
4. Enhance test data management with factories/builders

### Application Improvements
1. [Based on test findings]
2. [...]

---

## CONCLUSION

### Summary
[Provide 2-3 paragraph summary of test execution, overall quality assessment, and readiness for production]

Example:
> The automated test suite successfully executed 33 test cases covering all major functional areas of the ReportIt Mobile application. The test execution achieved a [X]% pass rate, demonstrating the robustness and reliability of the core features including authentication, incident reporting, map visualization, and location services.
>
> [X] defects were identified during testing, of which [X] were classified as critical/high severity and have been addressed by the development team. Regression testing confirmed that all fixes were successfully implemented without introducing new issues.
>
> Based on the test results, the ReportIt Mobile application meets the functional requirements outlined in the capstone project specifications and is recommended for [production deployment / further testing / defect resolution].

### Entry Criteria Met
- ✅ App deployed to test environment
- ✅ Test devices configured
- ✅ Appium server validated
- ✅ Test data prepared
- ✅ Test automation framework set up

### Exit Criteria Met
- [✅/❌] All critical test cases executed
- [✅/❌] 90% pass rate achieved
- [✅/❌] All blocking defects resolved
- [✅/❌] Test report generated
- [✅/❌] Acceptance criteria validated

### Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Test Lead** | [Your Name] | _______________ | [Date] |
| **Developer** | [Developer Name] | _______________ | [Date] |
| **Project Adviser** | [Adviser Name] | _______________ | [Date] |
| **Panel Member** | [Name] | _______________ | [Date] |

---

## APPENDICES

### Appendix A: Test Execution Logs
Location: `tests/reports/execution-logs/`

### Appendix B: Screenshots
Location: `tests/reports/screenshots/`

### Appendix C: Test Scripts
Location: `tests/e2e/`

### Appendix D: Configuration Files
Location: `tests/config/`

### Appendix E: Allure Report
Access at: `tests/reports/allure-report/index.html`

---

**Document Version:** 1.0  
**Last Updated:** [Date]  
**Prepared By:** [Your Name]  
**Institution:** [Your University]  
**Academic Year:** 2024-2025
