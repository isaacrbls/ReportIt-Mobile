# Role-Based Access Control Implementation

## Overview
This document describes the role-based access control system implemented in the ReportIt Mobile application.

## Implementation Date
October 4, 2025

## Features Implemented

### 1. User Role Assignment
All newly created accounts are automatically assigned the role of **"user"** during signup.

### 2. Login Role Validation
Only users with the **"user"** role can successfully log in to the application. Any account with a different role (e.g., "admin") will be denied access.

## Changes Made

### UserService.ts
1. **Updated `UserProfile` Interface**
   - Added `role: string` field to store user roles ('user' or 'admin')

2. **Updated `createUserProfile()` Method**
   - Sets `role: 'user'` for all new accounts during creation
   - This ensures all signups automatically get the user role

3. **Added `checkUserRole()` Method**
   - New method to verify user role during login
   - Returns:
     - `role`: The user's assigned role
     - `canLogin`: Boolean indicating if the user can access the app
   - Only allows login if role is 'user'

### AuthService.ts
1. **Enhanced `signIn()` Method**
   - Added role check before allowing login
   - Process flow:
     1. Authenticate with Firebase
     2. Check user role from database
     3. If role is not 'user', deny access and sign out
     4. If role is 'user', proceed with account status checks
     5. Reactivate account if needed
     6. Return success

## User Experience

### During Signup
- User fills out registration form
- Account is created with role: 'user'
- User profile is saved to database with role field
- No visible change to signup process

### During Login
- User enters email and password
- Firebase authenticates credentials
- System checks user role from database
- **If role is 'user'**: Login proceeds normally
- **If role is NOT 'user'**: 
  - User is immediately signed out
  - Error message displayed: "Access denied. Only user accounts can login to this application."
  - User cannot access the app

## Security Considerations

### Database Structure
```json
{
  "users": {
    "userId123": {
      "uid": "userId123",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user",  // <-- Role field
      "barangay": "Pinagbakahan",
      "city": "Malolos City",
      "createdAt": "2025-10-04T10:00:00Z",
      "isActive": true
    }
  }
}
```

### Firebase Security Rules (Recommended)
To ensure role integrity, update Firebase Realtime Database rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",
        "role": {
          ".write": false  // Prevent users from changing their own role
        }
      }
    }
  }
}
```

## Admin Account Management

### Creating Admin Accounts
Admin accounts should NOT be created through the app. To create an admin:

1. Create account through the app (gets 'user' role)
2. Manually update the role in Firebase Console:
   - Go to Firebase Realtime Database
   - Navigate to `users/{userId}`
   - Change `role: "user"` to `role: "admin"`
3. Admin accounts cannot login to the mobile app (by design)

### Separate Admin Interface
If admin access is needed:
- Create a separate web dashboard/admin panel
- Implement different authentication logic for admins
- Mobile app remains user-only

## Testing

### Test Cases

1. **New User Signup**
   - ✅ Create new account
   - ✅ Verify role is set to 'user' in database
   - ✅ User can login successfully

2. **User Login**
   - ✅ Login with valid user account (role: 'user')
   - ✅ Access granted to app

3. **Admin Login Attempt**
   - ✅ Manually change user role to 'admin' in database
   - ✅ Try to login with that account
   - ✅ Verify login is denied with error message
   - ✅ User is signed out automatically

4. **Role Persistence**
   - ✅ User role remains 'user' throughout app usage
   - ✅ Role cannot be changed by user

## Future Enhancements

### Possible Improvements
1. **Multiple User Roles**
   - Add roles like 'moderator', 'verified_user', 'banned'
   - Implement role hierarchy

2. **Role-Based Features**
   - Show/hide features based on role
   - Limit report submissions by role
   - Add role-specific capabilities

3. **Admin Dashboard**
   - Create separate admin interface
   - Allow admins to manage users and reports
   - Role assignment interface for admins

4. **Role Verification on Protected Actions**
   - Check role before allowing report submission
   - Verify role before profile updates
   - Add role checks to sensitive operations

## Error Handling

### Error Messages
- **Role Check Failed**: "Failed to verify account permissions"
- **Access Denied**: "Access denied. Only user accounts can login to this application."
- **Database Error**: "Failed to check user role"

### Fallback Behavior
- If role field doesn't exist: Defaults to 'user'
- If database read fails: Allows login (fail-open for user experience)
- If role check succeeds but canLogin is false: Denies access (fail-closed for security)

## Migration for Existing Users

If you have existing users without the role field:

```javascript
// Migration script (run once in Firebase Console or Cloud Functions)
const admin = require('firebase-admin');
const db = admin.database();

async function migrateExistingUsers() {
  const usersRef = db.ref('users');
  const snapshot = await usersRef.once('value');
  const users = snapshot.val();
  
  for (const uid in users) {
    if (!users[uid].role) {
      await usersRef.child(uid).update({
        role: 'user',
        updatedAt: new Date().toISOString()
      });
      console.log(`Updated role for user: ${uid}`);
    }
  }
}
```

## Conclusion

This role-based access control system ensures that:
- ✅ All new accounts are created as 'user' role
- ✅ Only 'user' role accounts can login to the mobile app
- ✅ Other roles (like 'admin') are blocked from mobile access
- ✅ System is extensible for future role-based features
- ✅ User experience remains smooth and transparent
