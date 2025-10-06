# Trend Analysis & AI Risk Prediction System

## Overview
The Incident Analysis screen now features a **data-driven, adaptive analysis system** that processes all real incident data from Firestore and provides ML-inspired risk predictions.

## Key Features

### 1. **Dynamic Data Loading**
- ✅ Fetches ALL reports from Firestore in real-time
- ✅ Analyzes verified incident data
- ✅ Auto-updates when new reports are added
- ✅ Filters by time period (7, 30, 90, or 365 days)

### 2. **Adaptive Trend Analysis**
The system analyzes incidents across multiple dimensions:

#### **Category Distribution**
- Automatically groups incidents by category/type
- Shows top 10 most common incident types
- Dynamic bar chart that scales based on actual data
- Real incident counts (not hardcoded)

#### **Trend Calculation**
Compares current period vs. previous period:
```
Trend % = ((Current Period Count - Previous Period Count) / Previous Period Count) × 100
```

**Example:**
- Last 30 days: 45 incidents
- Previous 30 days: 38 incidents
- Trend: +18.4% (increasing)

### 3. **AI-Powered Risk Prediction**

The risk prediction system uses a **multi-factor scoring algorithm** inspired by machine learning risk assessment:

#### **Risk Factors (Weighted Scoring)**

| Factor | Weight | Description |
|--------|--------|-------------|
| **Recent Activity** | 40% | Number of incidents in selected period |
| **Historical Total** | 30% | All-time incident count |
| **Recency** | 20% | Days since last incident |
| **Trend Direction** | 10% | Growth rate (recent vs. average) |

#### **Risk Score Calculation**
```typescript
Risk Score = (Recent × 4) + (Total × 0.3) + (Recency Bonus) + (Trend Bonus)

// Recency Bonus:
- Last 7 days: +20 points
- Last 30 days: +10 points
- Older: +0 points

// Trend Bonus:
- Growth > 50%: +10 points
- Growth > 0%: +5 points
- Decline: +0 points
```

#### **Risk Level Classification**

| Score Range | Risk Level | Color | Description |
|-------------|------------|-------|-------------|
| 70-100 | 🔴 **High Risk** | Red (#EF4444) | Immediate attention required |
| 40-69 | 🟠 **Moderate Risk** | Orange (#F59E0B) | Monitor closely |
| 0-39 | 🟢 **Low Risk** | Green (#10B981) | Normal activity |

### 4. **Barangay-Specific Analysis**

For each barangay, the system tracks:
- **Total Incidents**: All-time count
- **Recent Incidents**: Count in selected period
- **Trend**: Percentage change vs. historical average
- **Last Incident**: Days since most recent report
- **Risk Score**: Calculated using multi-factor algorithm

**Display Format:**
```
Pinagbakahan
12 recent • 45 total
High risk
↑ 35% [if trending up]
Risk Score: 85/100
```

### 5. **Key Insights Section**

AI-generated insights include:
- 🏆 Highest risk area identification
- 📈 Overall trend direction (increasing/decreasing)
- ⚠️ Count of high-risk areas
- 💡 Actionable intelligence

## Data Flow

```
1. Component Mount
   ↓
2. Fetch ALL Reports from Firestore
   ↓
3. Filter by Selected Period (7/30/90/365 days)
   ↓
4. Process Data:
   ├─ Generate Category Distribution
   ├─ Calculate Barangay Risk Scores
   ├─ Compute Trend Percentage
   └─ Identify Key Insights
   ↓
5. Render Charts & Predictions
   ↓
6. Display Results
```

## Time Period Selection

Users can cycle through time periods:
- **Last 7 days**: Recent activity focus
- **Last 30 days**: Monthly trends (default)
- **Last 90 days**: Quarterly patterns
- **Last year**: Annual overview

Tap the dropdown to cycle through periods. Data automatically refreshes.

## Algorithm Details

### Trend Calculation Algorithm
```typescript
function calculateTrend(allReports, currentPeriodDays) {
  // Define time windows
  now = current date/time
  currentStart = now - currentPeriodDays
  previousStart = now - (currentPeriodDays × 2)
  
  // Count reports in each period
  currentCount = reports between currentStart and now
  previousCount = reports between previousStart and currentStart
  
  // Calculate percentage change
  if (previousCount === 0) {
    return currentCount > 0 ? 100 : 0
  }
  
  return ((currentCount - previousCount) / previousCount) × 100
}
```

### Risk Score Algorithm
```typescript
function calculateRiskScore(barangay) {
  // Factor 1: Recent Activity (40% weight)
  recentWeight = recentIncidents × 4
  
  // Factor 2: Historical Total (30% weight)
  historicalWeight = totalIncidents × 0.3
  
  // Factor 3: Recency (20% weight)
  if (lastIncidentDays < 7) recencyWeight = 20
  else if (lastIncidentDays < 30) recencyWeight = 10
  else recencyWeight = 0
  
  // Factor 4: Trend Direction (10% weight)
  recentAvg = recentIncidents / periodDays
  historicalAvg = totalIncidents / 365
  trend = ((recentAvg - historicalAvg) / historicalAvg) × 100
  
  if (trend > 50) trendWeight = 10
  else if (trend > 0) trendWeight = 5
  else trendWeight = 0
  
  // Calculate total score (capped at 100)
  riskScore = min(100, recentWeight + historicalWeight + recencyWeight + trendWeight)
  
  return riskScore
}
```

## Real-World Example

### Scenario: Analyzing Pinagbakahan

**Raw Data:**
- Total historical incidents: 50
- Last 30 days incidents: 15
- Last incident: 3 days ago
- Historical daily average: 50/365 = 0.137
- Recent daily average: 15/30 = 0.5

**Risk Calculation:**
```
Recent Weight = 15 × 4 = 60
Historical Weight = 50 × 0.3 = 15
Recency Weight = 20 (< 7 days)
Trend = ((0.5 - 0.137) / 0.137) × 100 = +265%
Trend Weight = 10 (> 50%)

Risk Score = 60 + 15 + 20 + 10 = 105 → capped at 100
Risk Level = HIGH RISK (🔴)
```

## Performance Optimization

- ⚡ Data fetched once per period change
- ⚡ Calculations run in-memory (no repeated database calls)
- ⚡ Top 10 barangays displayed (sorted by risk)
- ⚡ Chart limited to top 10 categories
- ⚡ Loading state shows during data processing

## Console Logging

The system provides detailed console logs:

```
📊 Fetching reports for analysis...
📊 Analyzing 127 total reports
📊 85 reports in selected period (30 days)
✅ Analysis complete: {
  totalReports: 85,
  categories: 8,
  barangays: 12,
  trend: '+15.3%'
}
```

## Future Enhancements

Potential ML improvements:
1. **Temporal Patterns**: Day-of-week and time-of-day analysis
2. **Seasonal Detection**: Monthly/seasonal patterns
3. **Correlation Analysis**: Incident type co-occurrence
4. **Predictive Forecasting**: Next-period incident predictions
5. **Anomaly Detection**: Identify unusual spikes
6. **Geographic Clustering**: Hotspot evolution tracking
7. **Category-Specific Risk**: Per-incident-type risk scores

## Testing the System

### Manual Testing Steps

1. **Open Analysis Screen**
   ```
   Navigate to Map → Tap Analysis icon
   ```

2. **Verify Data Loading**
   - Should show loading spinner
   - Should display "Analyzing incident data..."
   - Should load within 2-3 seconds

3. **Check Data Accuracy**
   - Total Incidents count should match database
   - Category chart should show actual incident types
   - Barangay list should show areas with reports

4. **Test Period Selection**
   - Tap dropdown to cycle through periods
   - Data should update for each period
   - Charts should adapt to new data

5. **Verify Risk Calculations**
   - High-activity barangays should show higher scores
   - Risk levels should match activity levels
   - Trend indicators should be correct (↑ for increase)

### Expected Behaviors

**With No Data:**
- Charts show "No Data"
- Risk section shows "No data available"
- Trend shows 0%

**With Data:**
- Charts populate with real categories
- Top barangays ranked by risk
- Trend shows percentage change
- Insights section shows key findings

## Integration with Existing Features

- ✅ Uses same ReportsService as Map screen
- ✅ Analyzes same Firestore data
- ✅ Consistent with hotspot calculations
- ✅ Respects user authentication
- ✅ Works with admin bypass features

## Files Modified

- `screens/IncidentAnalysisScreen.tsx` - Main implementation
- Uses: `services/ReportsService.ts` - Data fetching

---

**Last Updated**: October 6, 2025
**Version**: 2.0 (Data-Driven with AI Risk Prediction)
