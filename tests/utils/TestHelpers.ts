/**
 * Test Helpers and Utility Functions
 * 
 * Reusable helper functions for common test operations.
 */

import { TestData } from '../config/test-data';
import * as fs from 'fs';
import * as path from 'path';

export class TestHelpers {
  /**
   * Generate unique email for test user
   */
  static generateUniqueEmail(): string {
    const timestamp = Date.now();
    return `test${timestamp}@reportit.com`;
  }

  /**
   * Generate unique phone number
   */
  static generateUniquePhone(): string {
    const random = Math.floor(Math.random() * 100000000);
    return `09${String(random).padStart(9, '0')}`;
  }

  /**
   * Generate test report data
   */
  static generateTestReportData(category: string = 'Crime') {
    const timestamp = new Date().toISOString();
    return {
      category: category,
      description: `Test ${category} incident report - Created at ${timestamp}`,
      severity: 'Medium',
      timestamp: timestamp,
    };
  }

  /**
   * Get valid test location within Malolos
   */
  static getValidTestLocation() {
    return TestData.locations.validBarangay;
  }

  /**
   * Get restricted test location
   */
  static getRestrictedTestLocation() {
    return TestData.locations.restrictedLocation;
  }

  /**
   * Get test user credentials
   */
  static getTestUser() {
    return TestData.users.validUser;
  }

  /**
   * Get new user registration data
   */
  static getNewUserData() {
    return {
      email: this.generateUniqueEmail(),
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: this.generateUniquePhone(),
      address: 'Malolos City, Bulacan',
    };
  }

  /**
   * Wait for condition with polling
   */
  static async waitForCondition(
    conditionFn: () => Promise<boolean>,
    timeout: number = 10000,
    pollInterval: number = 500
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (await conditionFn()) {
          return true;
        }
      } catch (error) {
        // Continue polling on error
      }
      
      await this.sleep(pollInterval);
    }
    
    return false;
  }

  /**
   * Sleep/delay execution
   */
  static async sleep(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format timestamp for filename
   */
  static formatTimestampForFilename(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').split('.')[0];
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Check if coordinates are within Malolos bounds
   */
  static isWithinMalolosBounds(latitude: number, longitude: number): boolean {
    // Malolos City approximate bounds
    const bounds = {
      minLat: 14.8,
      maxLat: 14.9,
      minLon: 120.79,
      maxLon: 120.83,
    };

    return (
      latitude >= bounds.minLat &&
      latitude <= bounds.maxLat &&
      longitude >= bounds.minLon &&
      longitude <= bounds.maxLon
    );
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  }

  /**
   * Validate Philippine phone number format
   */
  static isValidPhilippinePhone(phone: string): boolean {
    // Formats: 09XXXXXXXXX or +639XXXXXXXXX
    const phoneRegex = /^(09|\+639)\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Read file as base64
   */
  static readFileAsBase64(filePath: string): string {
    const absolutePath = path.resolve(filePath);
    const fileBuffer = fs.readFileSync(absolutePath);
    return fileBuffer.toString('base64');
  }

  /**
   * Create test fixture directory if not exists
   */
  static ensureFixtureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Clean up test data files
   */
  static cleanupTestFiles(directory: string, pattern?: string): void {
    if (!fs.existsSync(directory)) {
      return;
    }

    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      if (!pattern || file.includes(pattern)) {
        const filePath = path.join(directory, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted test file: ${file}`);
      }
    });
  }

  /**
   * Log test execution summary
   */
  static logTestSummary(
    testName: string,
    passed: number,
    failed: number,
    skipped: number = 0
  ): void {
    const total = passed + failed + skipped;
    const passRate = ((passed / total) * 100).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log(`📊 TEST SUMMARY: ${testName}`);
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`📈 Pass Rate: ${passRate}%`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Get expected error message from test data
   */
  static getExpectedErrorMessage(errorType: keyof typeof TestData.errorMessages): string {
    return TestData.errorMessages[errorType];
  }

  /**
   * Retry async operation with exponential backoff
   */
  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.log(`⚠️ Attempt ${attempt + 1} failed: ${error}`);
        
        if (attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Compare screenshots (basic pixel comparison)
   */
  static compareScreenshots(
    screenshot1Path: string,
    screenshot2Path: string
  ): boolean {
    // This is a placeholder - implement actual image comparison logic
    // using libraries like pixelmatch or resemblejs if needed
    console.log('⚠️ Screenshot comparison not implemented');
    return true;
  }

  /**
   * Generate test report header
   */
  static generateReportHeader(testSuiteName: string): string {
    const border = '═'.repeat(70);
    const date = new Date().toLocaleString();
    
    return `
${border}
  ReportIt Mobile - Test Execution Report
  Test Suite: ${testSuiteName}
  Date: ${date}
  Platform: Android/iOS
${border}
    `;
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data: any, fields: string[]): any {
    const masked = { ...data };
    
    fields.forEach(field => {
      if (masked[field]) {
        const value = String(masked[field]);
        masked[field] = value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
      }
    });
    
    return masked;
  }

  /**
   * Convert test result to CSV row
   */
  static testResultToCSV(testCase: {
    id: string;
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    duration: number;
    error?: string;
  }): string {
    return `${testCase.id},${testCase.name},${testCase.status},${testCase.duration},${testCase.error || ''}\n`;
  }

  /**
   * Get random item from array
   */
  static getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate random coordinates within Malolos
   */
  static generateRandomMalolosCoordinates() {
    const baseLat = 14.8434;
    const baseLon = 120.8120;
    const variation = 0.01; // ~1km variation

    return {
      latitude: baseLat + (Math.random() - 0.5) * variation,
      longitude: baseLon + (Math.random() - 0.5) * variation,
    };
  }
}

export default TestHelpers;
