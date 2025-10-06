# Database Report Submission Fix

## Issues Fixed

### 1. **Missing Fields in Firestore Document**
**Problem**: The `createReport` function wasn't including `Category` and `IsSensitive` fields even though they were passed in the reportData.

**Solution**: Added these fields to the Firestore document:
```typescript
Category: reportData.category || 'Others',
IsSensitive: reportData.isSensitive || false,
createdAt: Timestamp.now()
```

### 2. **Hardcoded Barangay Value**
**Problem**: The MapScreen was using a hardcoded 'Pinagbakahan' value instead of the user's actual barangay.

**Solution**: Now fetches the user's barangay from their profile:
```typescript
const userProfileResult = await UserService.getCurrentUserProfile();
const userBarangay = userProfileResult.success && userProfileResult.data 
  ? userProfileResult.data.barangay 
  : 'Pinagbakahan'; // Fallback to default
```

### 3. **Undefined Category Value**
**Problem**: Category could be `undefined` if user didn't select from dropdown, which could cause issues.

**Solution**: Changed to always provide a value:
```typescript
category: reportCategory !== 'Select type of incident' ? reportCategory : 'Others',
```

### 4. **Enhanced Error Logging**
**Problem**: Errors weren't descriptive enough to debug Firestore issues.

**Solution**: Added comprehensive error logging:
- Console logs before/after Firestore operations
- Detailed error object logging (code, message, stack)
- User-friendly error messages for common Firestore errors:
  - `permission-denied`: Security rules issue
  - `unavailable`: Database connection issue
  - `failed-precondition`: Configuration problem

## Potential Issues to Check

### 1. **Firestore Security Rules**
If reports still don't save, check your Firestore security rules. They should allow authenticated users to create reports:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      // Allow authenticated users to create reports
      allow create: if request.auth != null;
      
      // Allow reading reports
      allow read: if true;
      
      // Only admins can update/delete (customize as needed)
      allow update, delete: if request.auth.token.role == 'admin';
    }
  }
}
```

### 2. **Network Connectivity**
Ensure the device/emulator has internet access to reach Firebase servers.

### 3. **Firebase Project Configuration**
Verify that:
- The Firebase project is active and not suspended
- The Firestore database is enabled (not in "disabled" mode)
- The project has not exceeded its free tier quota

### 4. **Authentication State**
The fix includes a check for authenticated users. Make sure users are properly logged in before submitting reports.

## Testing the Fix

1. **Start the app**: `npm start` or `npx expo start`
2. **Login** with the admin account (emmnlisaac@gmail.com) or any user account
3. **Try to submit a report** with all fields filled:
   - Select incident category from dropdown
   - Enter incident type/title
   - Enter description
   - Optionally add media
4. **Check the console** for detailed logs:
   - Look for "🔄 Creating report in Firestore with data:"
   - Look for "✅ Document successfully created with ID:"
   - If error, look for "❌ Error creating report:" with details

## Console Output to Look For

**Successful submission:**
```
🔄 Creating report in Firestore with data: {...}
📝 Attempting to add document to Firestore reports collection...
✅ Document successfully created with ID: abc123xyz
```

**Failed submission:**
```
❌ Error creating report: [Error object]
Error details: {
  code: 'permission-denied',
  message: '...',
  stack: '...'
}
```

## Next Steps if Issue Persists

1. Check the Metro bundler terminal for any Firebase initialization errors
2. Verify Firebase config in `config/firebase.ts` is correct
3. Check Firestore console to see if documents are being created (even if app shows error)
4. Enable Firebase debug logging by adding to firebase.ts:
   ```typescript
   import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
   // Add debug logging
   ```
5. Test with a simple document write to isolate the issue

## Admin User Bypass Feature

Note: The admin user (emmnlisaac@gmail.com) can now report from anywhere without barangay restrictions, as per previous fix.
