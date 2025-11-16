/**
 * Base Test Class for Appium Mobile Testing
 * 
 * Provides common setup, teardown, and utility methods for all test cases.
 * Implements Page Object Model pattern support and screenshot capture.
 */

import { remote, RemoteOptions } from 'webdriverio';
import { config, getCapabilities } from '../config/appium.config';
import * as fs from 'fs';
import * as path from 'path';

export class BaseTestCase {
  protected driver: WebdriverIO.Browser;
  protected platform: 'android' | 'ios';
  protected screenshotDir: string;

  constructor(platform: 'android' | 'ios' = 'android') {
    this.platform = platform;
    this.screenshotDir = path.join(__dirname, '../reports/screenshots');
    
    // Ensure screenshot directory exists
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  /**
   * Setup method - Initialize Appium driver before each test
   */
  async setUp(): Promise<void> {
    console.log(`\n🔧 Setting up test environment for ${this.platform}...`);
    
    const capabilities = getCapabilities(this.platform);
    
    const options: RemoteOptions = {
      hostname: config.hostname,
      port: config.port,
      path: config.path,
      logLevel: config.logLevel as any,
      capabilities: capabilities,
    };

    try {
      this.driver = await remote(options);
      console.log('✅ Driver initialized successfully');
      
      // Set implicit wait timeout
      await this.driver.setTimeout({ implicit: 10000 });
      
    } catch (error) {
      console.error('❌ Failed to initialize driver:', error);
      throw error;
    }
  }

  /**
   * Teardown method - Cleanup after each test
   */
  async tearDown(): Promise<void> {
    console.log('🧹 Cleaning up test environment...');
    
    if (this.driver) {
      try {
        await this.driver.deleteSession();
        console.log('✅ Driver session closed');
      } catch (error) {
        console.error('❌ Error closing driver:', error);
      }
    }
  }

  /**
   * Take screenshot with custom name
   */
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}_${timestamp}.png`;
    const filepath = path.join(this.screenshotDir, filename);
    
    try {
      const screenshot = await this.driver.takeScreenshot();
      fs.writeFileSync(filepath, screenshot, 'base64');
      console.log(`📸 Screenshot saved: ${filename}`);
      return filepath;
    } catch (error) {
      console.error('❌ Failed to take screenshot:', error);
      throw error;
    }
  }

  /**
   * Wait for element to be present
   */
  async waitForElement(
    selector: string,
    timeout: number = 10000
  ): Promise<WebdriverIO.Element> {
    try {
      const element = await this.driver.$(selector);
      await element.waitForExist({ timeout });
      return element;
    } catch (error) {
      console.error(`❌ Element not found: ${selector}`);
      await this.takeScreenshot('element_not_found');
      throw error;
    }
  }

  /**
   * Wait for element to be clickable
   */
  async waitForClickable(
    selector: string,
    timeout: number = 10000
  ): Promise<WebdriverIO.Element> {
    const element = await this.waitForElement(selector, timeout);
    await element.waitForClickable({ timeout });
    return element;
  }

  /**
   * Find element by accessibility ID
   */
  async findByAccessibilityId(id: string): Promise<WebdriverIO.Element> {
    return await this.driver.$(`~${id}`);
  }

  /**
   * Find element by text content
   */
  async findByText(text: string): Promise<WebdriverIO.Element> {
    const selector = this.platform === 'android'
      ? `android=new UiSelector().text("${text}")`
      : `ios=predicate string:label == "${text}"`;
    
    return await this.driver.$(selector);
  }

  /**
   * Tap element with coordinates
   */
  async tapAtCoordinates(x: number, y: number): Promise<void> {
    await this.driver.touchAction({
      action: 'tap',
      x: x,
      y: y,
    });
  }

  /**
   * Scroll down on screen
   */
  async scrollDown(distance: number = 500): Promise<void> {
    const { width, height } = await this.driver.getWindowSize();
    const startX = width / 2;
    const startY = height * 0.8;
    const endY = startY - distance;

    await this.driver.touchAction([
      { action: 'press', x: startX, y: startY },
      { action: 'wait', ms: 500 },
      { action: 'moveTo', x: startX, y: endY },
      'release',
    ]);
  }

  /**
   * Scroll up on screen
   */
  async scrollUp(distance: number = 500): Promise<void> {
    const { width, height } = await this.driver.getWindowSize();
    const startX = width / 2;
    const startY = height * 0.2;
    const endY = startY + distance;

    await this.driver.touchAction([
      { action: 'press', x: startX, y: startY },
      { action: 'wait', ms: 500 },
      { action: 'moveTo', x: startX, y: endY },
      'release',
    ]);
  }

  /**
   * Swipe left
   */
  async swipeLeft(): Promise<void> {
    const { width, height } = await this.driver.getWindowSize();
    const startX = width * 0.8;
    const endX = width * 0.2;
    const y = height / 2;

    await this.driver.touchAction([
      { action: 'press', x: startX, y: y },
      { action: 'wait', ms: 300 },
      { action: 'moveTo', x: endX, y: y },
      'release',
    ]);
  }

  /**
   * Swipe right
   */
  async swipeRight(): Promise<void> {
    const { width, height } = await this.driver.getWindowSize();
    const startX = width * 0.2;
    const endX = width * 0.8;
    const y = height / 2;

    await this.driver.touchAction([
      { action: 'press', x: startX, y: y },
      { action: 'wait', ms: 300 },
      { action: 'moveTo', x: endX, y: y },
      'release',
    ]);
  }

  /**
   * Hide keyboard
   */
  async hideKeyboard(): Promise<void> {
    try {
      if (this.platform === 'android') {
        await this.driver.hideKeyboard();
      } else {
        // iOS - tap outside keyboard area
        const { width, height } = await this.driver.getWindowSize();
        await this.tapAtCoordinates(width / 2, height * 0.1);
      }
    } catch (error) {
      // Keyboard might not be visible
      console.log('ℹ️ Keyboard not visible or already hidden');
    }
  }

  /**
   * Press device back button (Android only)
   */
  async pressBack(): Promise<void> {
    if (this.platform === 'android') {
      await this.driver.back();
    } else {
      console.log('⚠️ Back button not available on iOS');
    }
  }

  /**
   * Set mock GPS location
   */
  async setLocation(latitude: number, longitude: number): Promise<void> {
    try {
      await this.driver.setGeoLocation({
        latitude: latitude,
        longitude: longitude,
        altitude: 0,
      });
      console.log(`📍 Location set to: ${latitude}, ${longitude}`);
    } catch (error) {
      console.error('❌ Failed to set location:', error);
      throw error;
    }
  }

  /**
   * Grant app permissions (Android)
   */
  async grantPermissions(permissions: string[]): Promise<void> {
    if (this.platform === 'android') {
      for (const permission of permissions) {
        try {
          await this.driver.execute('mobile: changePermissions', {
            permissions: permission,
            appPackage: config.androidCapabilities['appium:appPackage'],
            action: 'grant',
          });
          console.log(`✅ Granted permission: ${permission}`);
        } catch (error) {
          console.error(`❌ Failed to grant permission ${permission}:`, error);
        }
      }
    }
  }

  /**
   * Wait for specific duration
   */
  async wait(milliseconds: number): Promise<void> {
    await this.driver.pause(milliseconds);
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    try {
      const element = await this.driver.$(selector);
      return await element.isExisting();
    } catch {
      return false;
    }
  }

  /**
   * Get element text
   */
  async getElementText(selector: string): Promise<string> {
    const element = await this.driver.$(selector);
    return await element.getText();
  }

  /**
   * Assert element is displayed
   */
  async assertElementDisplayed(selector: string, message?: string): Promise<void> {
    const element = await this.driver.$(selector);
    const isDisplayed = await element.isDisplayed();
    
    if (!isDisplayed) {
      const errorMsg = message || `Element not displayed: ${selector}`;
      await this.takeScreenshot('assertion_failed');
      throw new Error(errorMsg);
    }
    
    console.log(`✅ Assertion passed: Element displayed - ${selector}`);
  }

  /**
   * Assert text equals
   */
  async assertTextEquals(
    selector: string,
    expectedText: string,
    message?: string
  ): Promise<void> {
    const actualText = await this.getElementText(selector);
    
    if (actualText !== expectedText) {
      const errorMsg = message || 
        `Text mismatch. Expected: "${expectedText}", Actual: "${actualText}"`;
      await this.takeScreenshot('text_assertion_failed');
      throw new Error(errorMsg);
    }
    
    console.log(`✅ Assertion passed: Text equals "${expectedText}"`);
  }

  /**
   * Assert text contains
   */
  async assertTextContains(
    selector: string,
    expectedSubstring: string,
    message?: string
  ): Promise<void> {
    const actualText = await this.getElementText(selector);
    
    if (!actualText.includes(expectedSubstring)) {
      const errorMsg = message || 
        `Text does not contain "${expectedSubstring}". Actual: "${actualText}"`;
      await this.takeScreenshot('text_contains_failed');
      throw new Error(errorMsg);
    }
    
    console.log(`✅ Assertion passed: Text contains "${expectedSubstring}"`);
  }

  /**
   * Restart app
   */
  async restartApp(): Promise<void> {
    console.log('🔄 Restarting app...');
    await this.driver.closeApp();
    await this.wait(2000);
    await this.driver.launchApp();
    await this.wait(3000);
    console.log('✅ App restarted');
  }

  /**
   * Clear app data and restart
   */
  async clearAppDataAndRestart(): Promise<void> {
    console.log('🗑️ Clearing app data and restarting...');
    
    if (this.platform === 'android') {
      await this.driver.execute('mobile: clearApp', {
        appId: config.androidCapabilities['appium:appPackage'],
      });
    }
    
    await this.restartApp();
    console.log('✅ App data cleared and restarted');
  }

  /**
   * Log test step
   */
  logStep(step: string): void {
    console.log(`\n📝 STEP: ${step}`);
  }

  /**
   * Log test result
   */
  logResult(result: string, passed: boolean = true): void {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} RESULT: ${result}`);
  }
}

export default BaseTestCase;
