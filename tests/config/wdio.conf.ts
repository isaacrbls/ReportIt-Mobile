/**
 * WebDriverIO Configuration for Appium Testing
 * 
 * This configuration file is used when running tests with WebDriverIO + Appium.
 * Run with: npx wdio run tests/config/wdio.conf.ts
 */

import { config as baseConfig } from './appium.config';

export const config: WebdriverIO.Config = {
  runner: 'local',
  
  // Appium server details
  hostname: baseConfig.hostname,
  port: baseConfig.port,
  path: baseConfig.path,
  
  // Test files
  specs: baseConfig.specs,
  
  // Exclude patterns
  exclude: [],
  
  // Maximum instances
  maxInstances: baseConfig.maxInstances,
  
  // Capabilities - Android by default
  capabilities: [{
    ...baseConfig.androidCapabilities
  }],
  
  // Test framework
  framework: baseConfig.framework,
  
  // Mocha options
  mochaOpts: baseConfig.mochaOpts,
  
  // Reporters
  reporters: baseConfig.reporters,
  
  // Log level
  logLevel: baseConfig.logLevel,
  
  // Base URL (not used for mobile apps, but required by WebDriverIO)
  baseUrl: '',
  
  // Timeouts
  waitforTimeout: 10000, // Default timeout for waitFor commands
  connectionRetryTimeout: 120000, // Timeout for Appium connection
  connectionRetryCount: 3, // Number of connection retry attempts
  
  // Services
  services: [
    ['appium', {
      command: 'appium',
      args: {
        relaxedSecurity: true,
        allowInsecure: ['chromedriver_autodownload'],
      },
      logPath: './tests/reports/logs/',
    }]
  ],
  
  // Hooks
  before: baseConfig.before,
  after: baseConfig.after,
  beforeTest: baseConfig.beforeTest,
  afterTest: baseConfig.afterTest,
  
  onPrepare: function (config, capabilities) {
    console.log('🔧 Preparing test environment...');
  },
  
  onComplete: function (exitCode, config, capabilities, results) {
    console.log('📊 All tests completed');
  },
};
