# ReportIt Mobile - AI Coding Agent Instructions

## Project Overview
ReportIt is a capstone project - a React Native mobile app (Expo) for reporting and visualizing incidents in Bulacan, Philippines. Users can submit geo-located incident reports, view hotspot maps, and analyze local safety patterns to improve community awareness and public safety.

**Project Type**: Academic Capstone Project  
**Stack**: React Native 0.81, Expo 54, TypeScript, Firebase (Auth, Realtime Database, Firestore, Storage), React Navigation  
**Target Region**: Bulacan Province, Philippines (focused on Malolos City)

## Architecture & Data Flow

### Firebase Service Separation
- **Authentication**: Firebase Auth (`services/AuthService.ts`)
- **User Profiles**: Realtime Database at `users/{uid}` (`services/UserService.ts`)
- **Reports/Incidents**: Firestore `reports` collection (`services/ReportsService.ts`)
- **Media**: Firebase Storage for photos/videos

### Authentication Flow
1. Users sign up with role-based access (only 'user' role can login to mobile app)
2. `AuthContext.tsx` provides global auth state via `useAuth()` hook
3. On login, `AuthService.signIn()` checks role via `UserService.checkUserRole()` - rejects non-user roles
4. Deactivated accounts are automatically reactivated on successful login
5. Auth state persistence uses `onAuthStateChanged` observer

### Navigation Logic (Critical Pattern)
Navigation uses **logical back destinations** via `NavigationHelper`:
- `Login` and `Map` screens → Back button exits app (never returns to Welcome)
- `TermsAndConditions` → Always returns to `Signup`, preserving context
- All password reset screens follow strict linear flow
- Back handlers are custom-implemented per screen (see `App.tsx` Stack.Screen options)

**Example**: Check `NavigationHelper.getLogicalBackDestination()` before implementing screen transitions

### Geographic Restrictions
**Barangay-Specific Reporting** (Malolos City focused):
- Users can only report in specific barangays defined in `ALLOWED_REPORTING_BARANGAYS` (`utils/BulacanBarangays.ts`)
- Location validation via `isWithinBarangayVicinity()` - calculates Haversine distance from barangay center
- `isReportingAllowed()` checks if barangay permits incident reports
- Map bounds restricted to Philippines: `4.5°N-21.2°N, 116.9°E-126.6°E`

## Development Commands

```bash
# Start development
npm start           # Expo dev server with QR code
npm run android     # Direct Android launch
npm run ios         # Direct iOS launch (macOS only)
npm run web         # Web preview (limited mobile features)

# No test suite configured (consider adding)
```

## Key Patterns & Conventions

### Service Layer Pattern
All services are **static class methods** with standard return interface:
```typescript
interface ServiceResult {
  success: boolean;
  error?: string;
  data?: any;
}
```
Never instantiate service classes - use: `AuthService.signIn()`, `UserService.getUserProfile()`, etc.

### Location Services
`LocationService` is a **singleton**:
```typescript
const locationService = LocationService.getInstance();
const permission = await locationService.requestLocationPermission();
```
Always check both permission AND location services enabled before accessing GPS.

### Map Integration (WebView + Leaflet)
`MapScreen.tsx` embeds Leaflet.js in WebView with inline HTML:
- User location shown with custom blue pulse marker
- Report markers use category-specific inline SVGs (defined in `CATEGORY_INLINE_SVGS`)
- Hotspots rendered as red circles with radius based on incident density
- **All icon SVGs must be inline strings** (file:// URIs fail in WebView)

### Error Handling Philosophy
- Database permission errors during signup are **non-critical** - user auth succeeds even if profile write fails
- Username checks are **commented out** due to pending database rules setup
- Location errors prompt users to open device settings (no silent failures)
- Firebase errors use `AuthService.getErrorMessage()` for user-friendly translations

### Component Structure
All screens follow pattern:
1. Custom SVG icon components at top (using `react-native-svg`)
2. Font loading with `@expo-google-fonts/poppins`
3. State management with useState (no Redux/Zustand)
4. Custom back handlers with `BackHandler.addEventListener`
5. SafeAreaView wrapper + ScrollView for keyboard handling

## Common Tasks

### Adding New Screen
1. Create in `screens/`, import in `App.tsx`
2. Add to `Stack.Navigator` with appropriate gesture options
3. Update `NavigationHelper.NAVIGATION_FLOWS` with logical back route
4. Implement custom BackHandler if needed (see `LoginScreen.tsx` example)

### Adding Report Category
1. Add to `CATEGORY_INLINE_SVGS` in `MapScreen.tsx` (use inline SVG string)
2. Update category selection UI in report modal
3. Consider adding to Firestore report schema

### Modifying User Profile Fields
1. Update `UserProfile` interface in `UserService.ts`
2. Update `createUserProfile()` and `updateUserProfile()` methods
3. Modify signup form in `SignupScreen.tsx`
4. Update Realtime Database structure at `users/{uid}`

### Implementing New Firebase Query
- Firestore uses modular SDK: `collection()`, `getDocs()`, `query()`, `where()`
- Handle both PascalCase (old) and camelCase (new) field names in reports (see `ReportsService.getAllReports()`)
- Always check `snapshot.exists()` before accessing data
- Use `GeoPoint` for coordinates: `data.GeoLocation._lat` / `data.GeoLocation._long`

## Configuration Files
- **Firebase**: `config/firebase.ts` (API keys committed - consider env vars for production)
- **Expo**: `app.json` - handles permissions, splash, icons
- **TypeScript**: Extends `expo/tsconfig.base`, strict mode enabled
- **Navigation**: No `react-navigation.config.js` - all config in `App.tsx`

## Important Constraints
- Location features require **physical device** (emulator GPS unreliable)
- WebView map requires internet for Leaflet CDN
- Camera/ImagePicker need runtime permissions (iOS plist already configured)
- Back navigation on Android MUST be handled explicitly (no automatic stack behavior)
- First launch detection uses AsyncStorage key `hasLaunchedBefore`

## Debugging Tips
- Check console for prefixed logs: `🔄` (lifecycle), `📍` (location), `🗺️` (map), `📊` (data)
- Firebase errors logged in `AuthService.getErrorMessage()` with user-friendly translations
- Map debug messages posted to React Native via `window.ReactNativeWebView.postMessage()`
- App state changes logged: `onResume`, `onPause` via `AppState` listener

## Gotchas
⚠️ **Don't** use `file://` URIs for WebView assets (use inline data URIs or base64)  
⚠️ **Don't** call `createUserProfile()` without handling permission errors gracefully  
⚠️ **Don't** implement back navigation without checking `NavigationHelper` flow rules  
⚠️ **Don't** assume report field names - Firestore has mixed PascalCase/camelCase legacy data  
⚠️ **Don't** skip location permission checks - always validate before GPS access
