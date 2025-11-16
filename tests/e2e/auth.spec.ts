/**
 * Authentication Test Cases (AUTH Module)
 * 
 * Test Case IDs: AUTH-001 to AUTH-010
 * Covers: Welcome screen, Login, Signup, Terms acceptance
 */

import { describe, it, before, after } from 'mocha';
import { expect } from 'chai';
import BaseTestCase from '../utils/BaseTestCase';
import TestHelpers from '../utils/TestHelpers';
import { TestData } from '../config/test-data';

describe('AUTH Module - Authentication & Onboarding', function() {
  this.timeout(TestData.timeouts.veryLong);
  
  let testCase: BaseTestCase;

  before(async function() {
    console.log(TestHelpers.generateReportHeader('Authentication Tests'));
    testCase = new BaseTestCase('android');
    await testCase.setUp();
  });

  after(async function() {
    await testCase.tearDown();
  });

  /**
   * Test Case: AUTH-001
   * Scenario: Launch app for first time
   * Expected: Display Welcome screen with "Get Started" button
   */
  it('AUTH-001: First time launch shows Welcome screen', async function() {
    testCase.logStep('Clear app data to simulate first launch');
    await testCase.clearAppDataAndRestart();
    
    testCase.logStep('Wait for Welcome screen to load');
    await testCase.wait(3000);
    
    testCase.logStep('Verify Welcome screen elements');
    const welcomeText = await testCase.elementExists('**/android.widget.TextView[contains(@text, "ReportIt")]');
    expect(welcomeText).to.be.true;
    
    await testCase.takeScreenshot('AUTH_001_welcome_screen');
    testCase.logResult('Welcome screen displayed successfully');
  });

  /**
   * Test Case: AUTH-002
   * Scenario: Launch app after first use
   * Expected: Display Login screen directly
   */
  it('AUTH-002: Subsequent launch shows Login screen', async function() {
    testCase.logStep('Ensure hasLaunchedBefore flag is set');
    // This test assumes AUTH-001 has run or app has been launched once
    
    testCase.logStep('Restart app');
    await testCase.restartApp();
    await testCase.wait(3000);
    
    testCase.logStep('Verify Login screen is displayed');
    const loginButton = await testCase.elementExists('**/android.widget.Button[@text="Login"]');
    expect(loginButton).to.be.true;
    
    await testCase.takeScreenshot('AUTH_002_login_screen');
    testCase.logResult('Login screen displayed on subsequent launch');
  });

  /**
   * Test Case: AUTH-003
   * Scenario: Valid user login
   * Expected: Redirect to Map screen, user authenticated
   */
  it('AUTH-003: Valid login credentials authenticate successfully', async function() {
    const user = TestHelpers.getTestUser();
    
    testCase.logStep('Enter valid email');
    const emailField = await testCase.waitForClickable('~email-input');
    await emailField.setValue(user.email);
    
    testCase.logStep('Enter valid password');
    const passwordField = await testCase.waitForClickable('~password-input');
    await passwordField.setValue(user.password);
    
    await testCase.hideKeyboard();
    await testCase.takeScreenshot('AUTH_003_credentials_entered');
    
    testCase.logStep('Tap Login button');
    const loginButton = await testCase.waitForClickable('~login-button');
    await loginButton.click();
    
    testCase.logStep('Wait for Map screen');
    await testCase.wait(5000);
    
    testCase.logStep('Verify Map screen loaded');
    const mapView = await testCase.elementExists('**/android.webkit.WebView');
    expect(mapView).to.be.true;
    
    await testCase.takeScreenshot('AUTH_003_login_success');
    testCase.logResult('Login successful, redirected to Map screen', true);
  });

  /**
   * Test Case: AUTH-004
   * Scenario: Invalid email/password login
   * Expected: Display error message "Invalid email or password"
   */
  it('AUTH-004: Invalid credentials show error message', async function() {
    testCase.logStep('Navigate to Login screen');
    await testCase.restartApp();
    await testCase.wait(3000);
    
    const invalidUser = TestData.users.invalidUser;
    
    testCase.logStep('Enter invalid credentials');
    await (await testCase.waitForClickable('~email-input')).setValue(invalidUser.email);
    await (await testCase.waitForClickable('~password-input')).setValue(invalidUser.password);
    await testCase.hideKeyboard();
    
    await testCase.takeScreenshot('AUTH_004_invalid_credentials');
    
    testCase.logStep('Attempt login');
    await (await testCase.waitForClickable('~login-button')).click();
    await testCase.wait(3000);
    
    testCase.logStep('Verify error message displayed');
    const errorExists = await testCase.elementExists('**/android.widget.TextView[contains(@text, "Invalid")]');
    expect(errorExists).to.be.true;
    
    await testCase.takeScreenshot('AUTH_004_error_displayed');
    testCase.logResult('Error message displayed for invalid credentials', true);
  });

  /**
   * Test Case: AUTH-005
   * Scenario: Login with non-user role (admin/staff)
   * Expected: Display error "Only users can access this app"
   */
  it('AUTH-005: Non-user role login is rejected', async function() {
    testCase.logStep('Navigate to Login screen');
    await testCase.restartApp();
    await testCase.wait(3000);
    
    const adminUser = TestData.users.adminUser;
    
    testCase.logStep('Enter admin credentials');
    await (await testCase.waitForClickable('~email-input')).setValue(adminUser.email);
    await (await testCase.waitForClickable('~password-input')).setValue(adminUser.password);
    await testCase.hideKeyboard();
    
    testCase.logStep('Attempt login');
    await (await testCase.waitForClickable('~login-button')).click();
    await testCase.wait(3000);
    
    testCase.logStep('Verify role restriction error');
    const errorText = await testCase.getElementText('~error-message');
    expect(errorText).to.include('Only users can access');
    
    await testCase.takeScreenshot('AUTH_005_role_restriction');
    testCase.logResult('Admin role login rejected successfully', true);
  });

  /**
   * Test Case: AUTH-007
   * Scenario: Navigate to Signup from Login
   * Expected: Display Signup screen with form fields
   */
  it('AUTH-007: Navigate to Signup screen from Login', async function() {
    testCase.logStep('Navigate to Login screen');
    await testCase.restartApp();
    await testCase.wait(3000);
    
    testCase.logStep('Tap "Sign Up" link');
    const signupLink = await testCase.waitForClickable('~signup-link');
    await signupLink.click();
    await testCase.wait(2000);
    
    testCase.logStep('Verify Signup form is displayed');
    const emailField = await testCase.elementExists('~signup-email-input');
    const passwordField = await testCase.elementExists('~signup-password-input');
    const firstNameField = await testCase.elementExists('~signup-firstname-input');
    
    expect(emailField && passwordField && firstNameField).to.be.true;
    
    await testCase.takeScreenshot('AUTH_007_signup_screen');
    testCase.logResult('Signup screen displayed with all form fields', true);
  });

  /**
   * Test Case: AUTH-008
   * Scenario: Complete signup with valid data
   * Expected: Create user account, redirect to Terms screen
   */
  it('AUTH-008: Valid signup creates account successfully', async function() {
    const newUser = TestHelpers.getNewUserData();
    
    testCase.logStep('Navigate to Signup screen');
    await testCase.restartApp();
    await testCase.wait(3000);
    await (await testCase.waitForClickable('~signup-link')).click();
    await testCase.wait(2000);
    
    testCase.logStep('Fill signup form with valid data');
    await (await testCase.waitForClickable('~signup-email-input')).setValue(newUser.email);
    await (await testCase.waitForClickable('~signup-password-input')).setValue(newUser.password);
    await (await testCase.waitForClickable('~signup-confirm-password-input')).setValue(newUser.password);
    await testCase.scrollDown();
    await (await testCase.waitForClickable('~signup-firstname-input')).setValue(newUser.firstName);
    await (await testCase.waitForClickable('~signup-lastname-input')).setValue(newUser.lastName);
    await (await testCase.waitForClickable('~signup-phone-input')).setValue(newUser.phoneNumber);
    
    await testCase.hideKeyboard();
    await testCase.takeScreenshot('AUTH_008_signup_form_filled');
    
    testCase.logStep('Submit signup form');
    await (await testCase.waitForClickable('~signup-submit-button')).click();
    await testCase.wait(5000);
    
    testCase.logStep('Verify redirect to Terms screen');
    const termsText = await testCase.elementExists('**/android.widget.TextView[contains(@text, "Terms")]');
    expect(termsText).to.be.true;
    
    await testCase.takeScreenshot('AUTH_008_terms_screen');
    testCase.logResult(`User account created: ${newUser.email}`, true);
  });

  /**
   * Test Case: AUTH-009
   * Scenario: Signup with existing email
   * Expected: Display error "Email already in use"
   */
  it('AUTH-009: Duplicate email shows error during signup', async function() {
    const existingUser = TestHelpers.getTestUser();
    
    testCase.logStep('Navigate to Signup screen');
    await testCase.restartApp();
    await testCase.wait(3000);
    await (await testCase.waitForClickable('~signup-link')).click();
    await testCase.wait(2000);
    
    testCase.logStep('Enter existing email');
    await (await testCase.waitForClickable('~signup-email-input')).setValue(existingUser.email);
    await (await testCase.waitForClickable('~signup-password-input')).setValue('NewPassword@123');
    await (await testCase.waitForClickable('~signup-confirm-password-input')).setValue('NewPassword@123');
    await testCase.scrollDown();
    await (await testCase.waitForClickable('~signup-firstname-input')).setValue('Test');
    await (await testCase.waitForClickable('~signup-lastname-input')).setValue('User');
    
    await testCase.hideKeyboard();
    
    testCase.logStep('Attempt signup');
    await (await testCase.waitForClickable('~signup-submit-button')).click();
    await testCase.wait(3000);
    
    testCase.logStep('Verify duplicate email error');
    const errorExists = await testCase.elementExists('**/android.widget.TextView[contains(@text, "already in use")]');
    expect(errorExists).to.be.true;
    
    await testCase.takeScreenshot('AUTH_009_duplicate_email_error');
    testCase.logResult('Duplicate email error displayed correctly', true);
  });

  /**
   * Test Case: AUTH-010
   * Scenario: Accept Terms and Conditions
   * Expected: Create user profile, redirect to Map screen
   */
  it('AUTH-010: Accepting terms completes registration', async function() {
    // This test assumes user is at Terms screen from AUTH-008 or similar
    testCase.logStep('Verify on Terms and Conditions screen');
    const termsTitle = await testCase.elementExists('**/android.widget.TextView[contains(@text, "Terms")]');
    
    if (!termsTitle) {
      console.log('⚠️ Not on Terms screen, skipping test');
      this.skip();
    }
    
    testCase.logStep('Scroll through terms content');
    await testCase.scrollDown();
    await testCase.wait(1000);
    await testCase.scrollDown();
    await testCase.wait(1000);
    
    testCase.logStep('Tap Accept button');
    const acceptButton = await testCase.waitForClickable('~accept-terms-button');
    await acceptButton.click();
    await testCase.wait(5000);
    
    testCase.logStep('Verify redirect to Map screen');
    const mapView = await testCase.elementExists('**/android.webkit.WebView');
    expect(mapView).to.be.true;
    
    await testCase.takeScreenshot('AUTH_010_registration_complete');
    testCase.logResult('Terms accepted, user registered and logged in', true);
  });
});
