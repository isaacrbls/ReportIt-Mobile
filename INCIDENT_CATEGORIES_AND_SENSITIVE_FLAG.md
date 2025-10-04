# Incident Categories and Sensitive Flag Feature

## Overview
Enhanced the incident reporting system to include predefined categories and a "Mark as Sensitive" flag for better incident classification and privacy management.

## Features Added

### 1. Incident Categories Dropdown
A comprehensive list of incident categories that users can select when reporting:

- **Theft** - Stolen items or property
- **Reports/Agreement** - Formal reports or agreement disputes
- **Accident** - Traffic or other accidents
- **Debt / Unpaid Wages Report** - Financial disputes
- **Defamation Complaint** - Reputation damage claims
- **Assault/Harassment** - Physical or verbal assault
- **Property Damage/Incident** - Damage to property
- **Animal Incident** - Animal-related incidents
- **Verbal Abuse and Threats** - Threatening behavior
- **Alarm and Scandal** - Public disturbances
- **Lost Items** - Missing personal items
- **Scam/Fraud** - Fraudulent activities
- **Drugs Addiction** - Drug-related incidents
- **Missing Person** - Missing people reports
- **Others** - Uncategorized incidents

### 2. Mark as Sensitive Toggle
A checkbox that allows users to mark reports as sensitive. This can be used to:
- Flag reports that contain sensitive content
- Mark reports requiring special handling
- Indicate privacy concerns
- Prioritize reports for admin review

## Implementation Details

### Modified Files

#### 1. `MapScreen.tsx`
**State Variables Added:**
```typescript
const [reportCategory, setReportCategory] = useState('Select type of incident');
const [isSensitive, setIsSensitive] = useState(false);
const [isCategoryDropdownVisible, setIsCategoryDropdownVisible] = useState(false);
```

**UI Components:**
- **Category Dropdown**: Expandable list with all incident categories
- **Sensitive Toggle**: Checkbox with "Mark as sensitive" label
- **Form Validation**: Ensures category is selected before submission

**Styles Added:**
```typescript
categoryDropdownButton    // Main dropdown button
categoryDropdownText      // Selected category text
placeholderText          // Placeholder styling
categoryDropdown         // Dropdown container
categoryOption           // Individual category item
selectedCategoryOption   // Selected item highlight
categoryOptionText       // Category text
selectedCategoryOptionText // Selected text styling
sensitiveToggle          // Toggle container
checkbox                 // Checkbox styling
checkboxChecked          // Checked state
sensitiveLabel           // Label text
```

#### 2. `ReportsService.ts`
**Report Interface Updated:**
```typescript
export interface Report {
  // ... existing fields
  category?: string;      // NEW: Incident category
  isSensitive?: boolean;  // NEW: Sensitive flag
}
```

**CreateReportData Interface Updated:**
```typescript
export interface CreateReportData {
  // ... existing fields
  category?: string;      // NEW: Incident category
  isSensitive?: boolean;  // NEW: Sensitive flag
}
```

## User Experience

### Category Selection
1. User taps "Report an Incident" button
2. Modal opens with report form
3. First field is "Category" dropdown
4. User taps dropdown to see all 15 categories
5. Selected category is highlighted in blue
6. Dropdown auto-closes after selection
7. Selected category is displayed in the dropdown button

### Marking as Sensitive
1. Below the category dropdown, user sees checkbox
2. Checkbox label: "Mark as sensitive"
3. Tap checkbox or label to toggle
4. Checked state shows red checkbox with white checkmark
5. State persists until form submission

### Form Validation
- Category selection is **required** before submission
- Error message: "Please select a category for the incident"
- Prevents submission if default "Select type of incident" is still shown

### Form Reset
After successful submission:
- Category resets to "Select type of incident"
- Sensitive flag resets to unchecked
- All other fields cleared as before

## Visual Design

### Category Dropdown
- **Button Style**: Light gray background (#F9FAFB) with border
- **Chevron Icon**: Up/down arrow indicating dropdown state
- **Options List**: White background, max height 200px, scrollable
- **Selected Item**: Blue background (#3B82F6) with white text
- **Hover Effect**: None (touch interface)

### Sensitive Checkbox
- **Unchecked**: White with gray border
- **Checked**: Red background (#EF4444) with white checkmark
- **Size**: 20x20 pixels
- **Label**: Bold text, dark gray color

## Data Flow

### Submission Process
```
1. User fills form with category and sensitive flag
   ↓
2. Form validation checks category is selected
   ↓
3. reportData object created with category and isSensitive
   ↓
4. Data sent to Firebase Firestore
   ↓
5. Report stored with all fields including category and flag
```

### Data Structure in Firebase
```javascript
{
  barangay: "Pinagbakahan",
  description: "Description text...",
  incidentType: "Type text...",
  category: "Theft",              // NEW
  isSensitive: true,              // NEW
  latitude: 14.8441,
  longitude: 120.8118,
  submittedByEmail: "user@email.com",
  status: "Pending",
  dateTime: "2025-10-04T12:00:00Z"
}
```

## Benefits

### For Users
1. **Easier Reporting**: Pre-defined categories make selection faster
2. **Better Classification**: Reports are properly categorized
3. **Privacy Control**: Can mark sensitive content explicitly
4. **Clear Organization**: Categories match common incident types

### For Administrators
1. **Better Filtering**: Can filter reports by category
2. **Priority Management**: Sensitive reports easily identified
3. **Analytics**: Category-based statistics and trends
4. **Resource Allocation**: Assign appropriate responders by category

### For System
1. **Data Consistency**: Standardized categories prevent typos
2. **Search Optimization**: Category-based queries more efficient
3. **Reporting Dashboard**: Category breakdown charts
4. **Automation**: Category-based routing possible

## Future Enhancements

### Potential Improvements
1. **Category Icons**: Add icons for each category
2. **Sensitive Filtering**: Hide sensitive reports from public view
3. **Category-Specific Forms**: Custom fields per category
4. **Search by Category**: Filter map markers by category
5. **Category Analytics**: Dashboard showing category distribution
6. **Admin Controls**: Manage sensitive reports separately
7. **Privacy Levels**: Multiple sensitivity levels (Low/Medium/High)
8. **Category Colors**: Color-code map markers by category

### Security Considerations
1. **Sensitive Data Encryption**: Encrypt sensitive report content
2. **Access Control**: Restrict sensitive report viewing
3. **Audit Logging**: Track who views sensitive reports
4. **Anonymization**: Option to submit sensitive reports anonymously

## Testing Checklist

- [ ] Category dropdown opens/closes correctly
- [ ] All 15 categories display properly
- [ ] Selected category highlights in blue
- [ ] Category text updates in dropdown button
- [ ] Checkbox toggles on/off
- [ ] Checkmark appears when checked
- [ ] Form validation prevents submission without category
- [ ] Category and sensitive flag save to Firebase
- [ ] Form resets after successful submission
- [ ] Category dropdown scrolls if needed
- [ ] Tap outside dropdown closes it (if implemented)
- [ ] Report displays category in map popup (if implemented)

## Conclusion

The incident categories and sensitive flag feature significantly improves the reporting system by:
- Providing structured incident classification
- Enabling privacy controls for sensitive content
- Improving data organization and searchability
- Enhancing user experience with clear categories
- Supporting future analytics and filtering capabilities

This implementation follows the design pattern shown in the provided screenshot and integrates seamlessly with the existing report submission workflow.
