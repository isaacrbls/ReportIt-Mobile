# ReportIt Mobile 📱

> A Capstone Project for Community Safety and Incident Reporting in Bulacan, Philippines

ReportIt is a mobile application designed to empower communities in Bulacan Province to report, track, and visualize local incidents in real-time. Built with React Native and Firebase, this app provides an accessible platform for citizens to contribute to public safety awareness through geo-located incident reporting and interactive hotspot mapping.

---

## 🎓 Project Information

**Project Type**: Academic Capstone Project  
**Institution**: Bulacan State University  
**Program**: Bachelor of Science in Information Technology 
**Academic Year**: 2024-2025  
**Target Region**: Bulacan Province

---

## 🌟 Features

### Core Functionality
- **📍 Geo-Located Incident Reporting**: Submit incident reports with precise GPS coordinates
- **🗺️ Interactive Map Visualization**: View all reported incidents on an interactive Leaflet map
- **🔥 Hotspot Analysis**: Automatically identify high-incident areas within the last 30 days
- **📊 Incident Analytics**: Analyze trends and patterns in local safety data
- **🔐 Secure Authentication**: Firebase-based user authentication with role-based access
- **📴 Offline Support**: Submit reports even without internet connectivity (synced later)
- **📸 Media Attachments**: Include photos or videos with incident reports
- **✅ Report Verification**: Status tracking (Pending, Verified, Resolved)

### User Experience
- **Responsive Design**: Optimized for all screen sizes (iPhone SE to iPad Pro)
- **Barangay-Specific Reporting**: Restricted to authorized barangays for accurate data
- **Location-Based Validation**: Ensures reports are submitted within designated areas
- **Real-Time Updates**: Live synchronization of new incidents and status changes
- **User Profile Management**: Edit personal information and preferences

---

## 🛠️ Technology Stack

### Frontend
- **React Native** 0.81 - Cross-platform mobile framework
- **Expo** SDK 54 - Development platform and toolchain
- **TypeScript** - Type-safe JavaScript
- **React Navigation** - Screen navigation and routing
- **Leaflet.js** - Interactive map rendering (via WebView)

### Backend & Services
- **Firebase Authentication** - User authentication and management
- **Firebase Firestore** - NoSQL cloud database for incident reports
- **Firebase Realtime Database** - User profiles and real-time data
- **Firebase Storage** - Media file storage (images/videos)
- **Expo Location** - GPS and geolocation services
- **Expo Notifications** - Push notification system

### Development Tools
- **Expo CLI** - Development server and build tools
- **AsyncStorage** - Local data persistence
- **NetInfo** - Network connectivity detection

---

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Expo CLI**: Install globally via `npm install -g expo-cli`
- **Expo Go App**: Download on your mobile device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- **Android Studio** (for Android development) or **Xcode** (for iOS development, macOS only)
- **Firebase Account**: Set up a Firebase project with Auth, Firestore, Realtime Database, and Storage

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/isaacrbls/ReportIt-Mobile.git
cd ReportIt-Mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Firebase
The Firebase configuration is located in `config/firebase.ts`. Ensure your Firebase project has:
- Authentication enabled (Email/Password)
- Firestore database created
- Realtime Database initialized
- Storage bucket configured
- Security rules properly set up

### 4. Configure Permissions (iOS)
The `app.json` file already includes required permissions for:
- Location services
- Camera access
- Photo library access
- Notifications

---

## 💻 Running the Application

### Development Mode
Start the Expo development server:
```bash
npm start
# or
npx expo start
```

This will open the Expo DevTools in your browser with a QR code.

### Run on Physical Device
1. Install **Expo Go** on your iOS/Android device
2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app
3. The app will load on your device

### Run on Emulator/Simulator

**Android Emulator:**
```bash
npm run android
```

**iOS Simulator (macOS only):**
```bash
npm run ios
```

**Web Preview (Limited Features):**
```bash
npm run web
```

---

## 📁 Project Structure

```
ReportIt-Mobile/
├── assets/                    # Images, icons, and static assets
│   ├── icon.png
│   ├── splash-icon.png
│   └── report icons/          # Category-specific SVG icons
├── components/                # Reusable UI components
│   ├── CustomAlertContext.tsx
│   └── IconComponents.tsx
├── config/                    # Configuration files
│   └── firebase.ts            # Firebase initialization
├── screens/                   # Application screens
│   ├── WelcomeScreen.tsx      # First launch screen
│   ├── LoginScreen.tsx        # User authentication
│   ├── SignupScreen.tsx       # User registration
│   ├── MapScreen.tsx          # Main map interface
│   ├── ViewReportsScreen.tsx  # Report list view
│   ├── IncidentAnalysisScreen.tsx  # Analytics dashboard
│   └── EditProfileScreen.tsx  # User profile management
├── services/                  # Business logic and API services
│   ├── AuthService.ts         # Authentication operations
│   ├── AuthContext.tsx        # Auth state management
│   ├── UserService.ts         # User profile operations
│   ├── ReportsService.ts      # Report CRUD operations
│   ├── LocationService.ts     # GPS and location services
│   ├── NotificationService.ts # Push notifications
│   └── OfflineReportsService.ts  # Offline report queue
├── utils/                     # Helper functions and utilities
│   ├── BulacanBarangays.ts    # Geographic data and validation
│   ├── NavigationHelper.ts    # Navigation flow management
│   ├── ResponsiveUtils.ts     # Responsive design utilities
│   └── CategoryIcons.ts       # Incident category mappings
├── .github/
│   └── copilot-instructions.md  # AI assistant guidelines
├── app.json                   # Expo configuration
├── App.tsx                    # Root application component
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

---

## 🗺️ Key Features Explained

### Geographic Restrictions
The app currently supports reporting in **5 specific barangays** in Malolos City:
1. Pinagbakahan
2. Look
3. Bulihan
4. Dakila
5. Mojon

Location validation uses the Haversine formula to ensure reports are submitted within authorized zones (1.5-2km radius from barangay centers).

### Incident Categories
- Theft
- Assault/Harassment
- Accident
- Property Damage
- Verbal Abuse and Threats
- Animal Incident
- Scam/Fraud
- Debt/Unpaid Wages
- Defamation Complaint
- Reports/Agreement
- Alarm and Scandal
- Lost Items
- Others

### Report Status Workflow
1. **Pending** → Newly submitted report awaiting verification
2. **Verified** → Report confirmed by authorities, included in hotspot calculations
3. **Resolved** → Incident addressed and closed

---

## 🔐 Security & Privacy

- **Role-Based Access**: Only users with 'user' role can access the mobile app
- **Account Status Management**: Deactivated accounts are automatically reactivated upon login
- **Sensitive Reports**: Flagged incidents excluded from public hotspot calculations
- **Firebase Security Rules**: Proper authentication and authorization enforced
- **Location Privacy**: GPS data only collected during active reporting

---

## 🧪 Testing

Currently, the app does not have automated tests configured. Future improvements should include:
- Unit tests for service layer functions
- Integration tests for Firebase operations
- E2E tests for critical user flows

---

## 📱 App Configuration

### Expo Configuration (`app.json`)
- **App Name**: ReportIt
- **Bundle Identifier**: `com.isaacrbls.ReportIt`
- **Version**: 1.0.0
- **Orientation**: Portrait only
- **Status Bar**: Auto theme
- **Splash Screen**: Custom icon with white background

### Permissions Required
- `ACCESS_FINE_LOCATION` - GPS location for report submission
- `ACCESS_COARSE_LOCATION` - Approximate location
- `CAMERA` - Photo capture for reports
- `READ_EXTERNAL_STORAGE` - Photo library access (Android)
- `NOTIFICATIONS` - Push notification delivery

---

## 🐛 Known Issues & Limitations

### Current Limitations
- **Testing**: No automated test suite implemented
- **Offline Mode**: Limited functionality without internet
- **Map Performance**: Large datasets may impact rendering speed
- **iOS Permissions**: Users must manually enable location services in Settings

### Common Issues
1. **Firebase Auth Error**: Ensure `getReactNativePersistence` is correctly imported
2. **Location Not Working**: Check device location services are enabled
3. **Map Not Loading**: Verify internet connection (Leaflet.js requires CDN access)
4. **Back Navigation**: Custom handlers required on Android

---

## 🚧 Future Enhancements

### Planned Features (Phase 2)
- [ ] Expand to all 21 municipalities in Bulacan
- [ ] Multi-language support (Tagalog, English)
- [ ] Admin web dashboard for report management
- [ ] Advanced analytics and data visualization
- [ ] Community engagement features (comments, upvotes)
- [ ] Integration with local government units (LGUs)
- [ ] Automated report categorization using AI/ML
- [ ] Emergency broadcast system

### Technical Improvements
- [ ] Implement comprehensive test coverage
- [ ] Optimize map rendering for large datasets
- [ ] Add report search and filtering
- [ ] Implement caching strategies
- [ ] Add biometric authentication support
- [ ] Migrate to Firebase Cloud Functions for backend logic

---

## 👥 Contributing

As this is a capstone project, external contributions are not currently accepted. However, feedback and suggestions are welcome!

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with descriptive messages: `git commit -m "Add feature: description"`
4. Push to branch: `git push origin feature/your-feature`
5. Internal review process

---

## 📄 License

This project is an academic capstone project. All rights reserved.

**For educational purposes only.** Not licensed for commercial use without permission.

---

## 📞 Contact & Support

**Project Team**:
- **Developer**: Emmanuel Isaac Robles & Josh Matrix Salonga

**Project Repository**: [ReportIt-Mobile](https://github.com/isaacrbls/ReportIt-Mobile)

For questions, issues, or suggestions, please contact the development team or open an issue on GitHub.

---

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure and services
- **Expo** - Mobile development framework
- **Leaflet.js** - Interactive mapping library
- **React Native Community** - Open-source components and support
  
---

## 🎯 Project Goals

This capstone project aims to:
1. **Improve Public Safety Awareness** - Provide real-time visibility into local incidents
2. **Empower Communities** - Enable citizen participation in safety monitoring
3. **Support Decision Making** - Offer data-driven insights for authorities
4. **Demonstrate Technical Competency** - Showcase modern mobile app development skills
5. **Create Social Impact** - Contribute to safer communities in Bulacan

---
