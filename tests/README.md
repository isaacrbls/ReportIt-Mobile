# ReportIt Mobile - Test Execution Guide

## Prerequisites

### Required Software
- **Node.js**: v14 or higher
- **Appium**: v2.0 or higher
- **Android Studio**: For Android SDK and emulators
- **Xcode**: For iOS testing (macOS only)
- **Appium Inspector**: For element inspection

### Installation Steps

#### 1. Install Appium Dependencies
```bash
npm install --save-dev appium
npm install --save-dev @wdio/cli @wdio/local-runner
npm install --save-dev @wdio/mocha-framework @wdio/spec-reporter
npm install --save-dev @wdio/appium-service
npm install --save-dev mocha chai @types/mocha @types/chai
npm install --save-dev ts-node typescript
npm install --save-dev allure-commandline @wdio/allure-reporter
```

#### 2. Install Appium Globally (Optional but Recommended)
```bash
npm install -g appium
npm install -g appium-doctor
```

#### 3. Install Appium Drivers
```bash
# For Android
appium driver install uiautomator2

# For iOS (macOS only)
appium driver install xcuitest
```

#### 4. Verify Appium Setup
```bash
appium-doctor --android
# For iOS: appium-doctor --ios
```

### Environment Setup

#### Android Setup
1. Install Android Studio
2. Install Android SDK (API 29 or higher)
3. Set environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```
4. Create/start Android emulator or connect physical device

#### iOS Setup (macOS only)
1. Install Xcode from App Store
2. Install Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. Install Carthage: `brew install carthage`
4. Configure iOS simulator or connect physical device

### Test App Preparation

#### Build Android APK
```bash
# For Expo development build
eas build --platform android --profile development

# Or create local build
npm run android
```

#### Build iOS IPA
```bash
# For Expo development build
eas build --platform ios --profile development

# Or create local build
npm run ios
```

## Running Tests

### Start Appium Server
```bash
# Terminal 1: Start Appium server
appium

# Or with custom port
appium --port 4723
```

### Execute Tests

#### Run All Tests
```bash
npm run test:e2e
```

#### Run Specific Test Suite
```bash
# Authentication tests only
npm run test:e2e:auth

# Reporting tests only
npm run test:e2e:report

# Location & Map tests only
npm run test:e2e:location
```

#### Run Tests for Specific Platform
```bash
# Android
npm run test:android

# iOS
npm run test:ios
```

#### Run Tests with Allure Reporting
```bash
npm run test:e2e:allure
npm run test:report
```

### WebDriverIO Test Runner
```bash
# Run with wdio configuration
npx wdio run tests/config/wdio.conf.ts
```

## Test Configuration

### Update Test Data
Edit `tests/config/test-data.ts` with your test credentials:

```typescript
users: {
  validUser: {
    email: 'your-test-user@reportit.com',
    password: 'YourTestPassword123',
  }
}
```

### Update Appium Capabilities
Edit `tests/config/appium.config.ts`:

```typescript
androidCapabilities: {
  'appium:deviceName': 'Your_Device_Name',
  'appium:platformVersion': 'Your_Android_Version',
  'appium:app': '/path/to/your/app.apk',
}
```

## Test Structure

```
tests/
├── config/
│   ├── appium.config.ts      # Appium configuration
│   ├── wdio.conf.ts          # WebDriverIO configuration
│   └── test-data.ts          # Test data and credentials
├── e2e/
│   ├── auth.spec.ts          # Authentication tests (AUTH-001 to AUTH-010)
│   ├── reporting.spec.ts     # Reporting tests (REPORT-001 to REPORT-009)
│   └── location-map.spec.ts  # Location & Map tests (LOC/MAP-001+)
├── utils/
│   ├── BaseTestCase.ts       # Base test class with common methods
│   └── TestHelpers.ts        # Helper functions and utilities
└── reports/
    ├── screenshots/          # Test screenshots
    └── allure-results/       # Allure report data
```

## Debugging Tests

### Enable Verbose Logging
Edit `tests/config/appium.config.ts`:
```typescript
logLevel: 'debug', // Options: trace, debug, info, warn, error
```

### Take Screenshots
Screenshots are automatically captured:
- On test failure (automatic)
- Manually in test: `await testCase.takeScreenshot('test_step_name')`

### Appium Inspector
1. Start Appium server
2. Open Appium Inspector
3. Configure desired capabilities
4. Start session to inspect elements

## Troubleshooting

### Common Issues

#### Appium Server Not Starting
```bash
# Check if port 4723 is in use
lsof -i :4723

# Kill process using port
kill -9 <PID>
```

#### Element Not Found
- Use Appium Inspector to find correct locators
- Increase wait timeout in test
- Check if element is inside WebView (requires context switching)

#### App Not Installing
- Check APK/IPA path in config
- Verify app signature and certificates
- Check device/emulator compatibility

#### Permission Denied Errors
- Grant permissions manually on device
- Use `autoGrantPermissions: true` in capabilities (Android)
- Check app permissions in AndroidManifest.xml

#### WebView Content Not Accessible
```typescript
// Switch to WebView context
const contexts = await driver.getContexts();
await driver.switchContext(contexts[1]); // WebView

// Switch back to native
await driver.switchContext('NATIVE_APP');
```

### Test Execution Tips

1. **Start with Smoke Tests**: Run critical path tests first
2. **Use Retries**: Configure retry logic for flaky tests
3. **Parallel Execution**: Avoid on mobile (resource intensive)
4. **Clear App Data**: Reset app state between test suites
5. **Mock Network**: Use airplane mode for offline tests
6. **Location Mocking**: Use Appium's location setting APIs

## Test Reporting

### Allure Reports
```bash
# Generate and open Allure report
npm run test:report
```

### Console Output
Tests log detailed steps with icons:
- 🔧 Setup/Configuration
- 📝 Test Step
- ✅ Pass
- ❌ Fail
- ⚠️ Warning
- 📸 Screenshot
- 📊 Summary

### Screenshots
Located in: `tests/reports/screenshots/`
- Named with test case ID and timestamp
- Captured on failure and at key steps

## Continuous Integration

### GitHub Actions Example
```yaml
name: Mobile E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: appium driver install uiautomator2
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: tests/reports/
```

## Test Coverage

### Current Test Cases
- **Authentication**: 10 test cases (AUTH-001 to AUTH-010)
- **Reporting**: 9 test cases (REPORT-001 to REPORT-009)
- **Location**: 6 test cases (LOC-001 to LOC-006)
- **Map**: 8 test cases (MAP-001 to MAP-008)

### Total: 33 automated test cases

## Best Practices

1. **Use Page Object Model**: Separate locators from test logic
2. **Explicit Waits**: Always wait for elements before interaction
3. **Independent Tests**: Each test should be self-contained
4. **Meaningful Names**: Use descriptive test case IDs and names
5. **Error Handling**: Capture screenshots on failure
6. **Test Data**: Use separate test accounts and data
7. **Clean Up**: Reset app state after each test
8. **Documentation**: Comment complex test logic

## Support

For issues or questions:
1. Check MASTER_TEST_PLAN.md for test scenarios
2. Review Appium documentation: https://appium.io/docs
3. Check WebDriverIO docs: https://webdriver.io
4. Review test execution logs and screenshots

## Next Steps

1. Install required dependencies
2. Configure test environment
3. Update test data with your credentials
4. Build test app (APK/IPA)
5. Start Appium server
6. Run smoke tests first
7. Review reports and screenshots
8. Integrate with CI/CD pipeline
