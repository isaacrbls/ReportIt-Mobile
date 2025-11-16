/**
 * Appium Configuration for ReportIt Mobile Testing
 * 
 * This configuration supports both Android and iOS testing.
 * Modify the capabilities based on your test environment.
 */

export const config = {
  // Appium server configuration
  hostname: 'localhost',
  port: 4723,
  path: '/',
  
  // Test framework configuration
  framework: 'mocha',
  mochaOpts: {
    timeout: 60000, // 60 seconds timeout for each test
    retries: 2, // Retry failed tests up to 2 times
  },
  
  // Test specs location
  specs: [
    '../e2e/**/*.spec.ts'
  ],
  
  // Maximum instances to run simultaneously
  maxInstances: 1, // Run tests sequentially on mobile
  
  // Capabilities for Android testing
  androidCapabilities: {
    platformName: 'Android',
    'appium:platformVersion': '11.0', // Adjust to your device/emulator version
    'appium:deviceName': 'Android Emulator', // Or your physical device name
    'appium:app': '', // Path to APK file (e.g., './app-release.apk')
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'host.exp.exponent', // Expo Go package (change for standalone)
    'appium:appActivity': 'host.exp.exponent.experience.HomeActivity',
    'appium:noReset': false, // Reset app state between tests
    'appium:fullReset': false, // Don't reinstall app between tests
    'appium:newCommandTimeout': 300, // 5 minutes
    'appium:autoGrantPermissions': true, // Auto-grant location/camera permissions
    'appium:disableWindowAnimation': true, // Faster test execution
    'appium:skipDeviceInitialization': false,
    'appium:skipServerInstallation': false,
    'appium:gpsEnabled': true, // Enable GPS for location testing
  },
  
  // Capabilities for iOS testing (macOS only)
  iosCapabilities: {
    platformName: 'iOS',
    'appium:platformVersion': '15.0', // Adjust to your iOS version
    'appium:deviceName': 'iPhone 13', // Or your device name
    'appium:app': '', // Path to IPA file
    'appium:automationName': 'XCUITest',
    'appium:bundleId': 'host.exp.Exponent', // Expo Go bundle ID
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:newCommandTimeout': 300,
    'appium:autoAcceptAlerts': false, // Manually handle permission alerts
    'appium:locationServicesEnabled': true,
  },
  
  // Logging configuration
  logLevel: 'info', // Options: trace, debug, info, warn, error, silent
  
  // Test reporters
  reporters: [
    'spec', // Console output
    ['allure', {
      outputDir: './tests/reports/allure-results',
      disableWebdriverStepsReporting: true,
      disableWebdriverScreenshotsReporting: false,
    }]
  ],
  
  // Screenshots on failure
  screenshotPath: './tests/reports/screenshots',
  
  // Hooks
  before: function (capabilities, specs) {
    console.log('🚀 Starting test session...');
  },
  
  after: function (result, capabilities, specs) {
    console.log('✅ Test session completed');
  },
  
  beforeTest: function (test, context) {
    console.log(`\n📝 Running: ${test.title}`);
  },
  
  afterTest: async function (test, context, { error, result, duration, passed, retries }) {
    if (error) {
      console.log(`❌ Test failed: ${test.title}`);
      // Take screenshot on failure
      try {
        const screenshot = await driver.takeScreenshot();
        // Save screenshot logic here
      } catch (e) {
        console.log('Failed to capture screenshot:', e);
      }
    } else {
      console.log(`✅ Test passed: ${test.title}`);
    }
  },
};

// Helper to get capabilities based on platform
export function getCapabilities(platform: 'android' | 'ios') {
  return platform === 'android' 
    ? config.androidCapabilities 
    : config.iosCapabilities;
}

// Export default config for WebDriverIO
export default config;
