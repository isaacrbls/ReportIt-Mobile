/**
 * Test Data Configuration
 * 
 * Central location for test data used across test cases.
 * Update these values based on your test environment.
 */

export const TestData = {
  // Test user credentials
  users: {
    validUser: {
      email: 'testuser@reportit.com',
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '09123456789',
      address: 'Malolos City, Bulacan',
    },
    
    invalidUser: {
      email: 'invalid@test.com',
      password: 'WrongPassword123',
    },
    
    adminUser: {
      email: 'admin@reportit.com',
      password: 'Admin@123456',
      role: 'admin', // Should be rejected on mobile login
    },
    
    deactivatedUser: {
      email: 'deactivated@reportit.com',
      password: 'Deactivated@123',
    },
    
    newUser: {
      email: `test${Date.now()}@reportit.com`, // Unique email
      password: 'NewUser@123456',
      firstName: 'New',
      lastName: 'Tester',
      phoneNumber: '09987654321',
      address: 'Barasoain, Malolos City',
    },
  },
  
  // Test locations (Malolos City, Bulacan)
  locations: {
    validBarangay: {
      name: 'Barasoain',
      latitude: 14.8434,
      longitude: 120.8120,
      isAllowed: true,
    },
    
    validBarangay2: {
      name: 'Bulihan',
      latitude: 14.8532,
      longitude: 120.8098,
      isAllowed: true,
    },
    
    restrictedLocation: {
      name: 'Outside Malolos',
      latitude: 14.9000,
      longitude: 120.9000,
      isAllowed: false,
    },
    
    outsidePhilippines: {
      name: 'Singapore',
      latitude: 1.3521,
      longitude: 103.8198,
      isAllowed: false,
    },
  },
  
  // Test incident reports
  reports: {
    crimeReport: {
      category: 'Crime',
      description: 'Test crime incident report for automated testing',
      severity: 'High',
      hasPhoto: false,
    },
    
    trafficReport: {
      category: 'Traffic',
      description: 'Test traffic incident - heavy congestion on main road',
      severity: 'Medium',
      hasPhoto: false,
    },
    
    healthReport: {
      category: 'Health',
      description: 'Test health incident - medical emergency',
      severity: 'High',
      hasPhoto: true,
      photoPath: './tests/fixtures/sample-photo.jpg',
    },
    
    fireReport: {
      category: 'Fire',
      description: 'Test fire incident - building fire reported',
      severity: 'Critical',
      hasPhoto: false,
    },
  },
  
  // App configuration
  app: {
    androidPackage: 'host.exp.exponent',
    androidActivity: 'host.exp.exponent.experience.HomeActivity',
    iosBundle: 'host.exp.Exponent',
    launchTimeout: 30000, // 30 seconds
    elementTimeout: 10000, // 10 seconds
  },
  
  // Firebase test configuration (optional - for direct API testing)
  firebase: {
    testProjectId: 'reportit-test',
    // Add test Firebase config if needed
  },
  
  // Test timeouts
  timeouts: {
    short: 5000,   // 5 seconds
    medium: 10000, // 10 seconds
    long: 30000,   // 30 seconds
    veryLong: 60000, // 60 seconds (for uploads)
  },
  
  // Expected error messages
  errorMessages: {
    invalidCredentials: 'Invalid email or password',
    emailInUse: 'Email already in use',
    roleRestriction: 'Only users can access this app',
    locationRequired: 'Location is required',
    reportingRestricted: 'Reporting not allowed in this area',
    permissionDenied: 'Permission denied',
    networkError: 'Network request failed',
  },
};

export default TestData;
