import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
  Modal,
} from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { ReportsService, Report } from '../services/ReportsService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive utility functions (matching MapScreen)
const isTablet = () => screenWidth >= 768;
const isLargeTablet = () => screenWidth >= 1024;

const responsiveSize = (phone: number, tablet: number, largeTablet?: number) => {
  if (isLargeTablet() && largeTablet) return largeTablet;
  if (isTablet()) return tablet;
  return phone;
};

const responsiveFontSize = (size: number) => {
  const scale = screenWidth / 375; // Base on iPhone SE width
  const newSize = size * scale;
  if (isTablet()) return Math.round(newSize * 0.9); // Slightly smaller on tablets
  return Math.round(newSize);
};

const responsivePadding = (size: number) => {
  return responsiveSize(size, size * 1.5, size * 2);
};


const BarChart = ({ data, width, height }: { data: any[], width: number, height: number }) => {
  if (data.length === 0 || data[0].value === 0) {
    return (
      <View style={{ width, height: height + 40, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 14, color: '#9CA3AF', fontFamily: 'Poppins_400Regular' }}>No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 10); // Minimum scale of 10
  const barWidth = Math.min((width - 80) / data.length - 12, 60); // Max bar width of 60
  const leftPadding = 40;
  const barSpacing = 16;
  
  return (
    <Svg width={width} height={height + 60}>
      <G>
        {/* Horizontal grid lines for better readability */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <Line
            key={`grid-${i}`}
            x1={leftPadding}
            y1={height * (1 - ratio)}
            x2={width - 20}
            y2={height * (1 - ratio)}
            stroke="#E5E7EB"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}
        
        {/* Y-axis labels */}
        {[0, 0.5, 1].map((ratio, i) => {
          const value = Math.round(maxValue * ratio);
          return (
            <SvgText
              key={`y-label-${i}`}
              x={leftPadding - 8}
              y={height * (1 - ratio) + 5}
              textAnchor="end"
              fontSize="10"
              fill="#9CA3AF"
              fontFamily="Poppins_400Regular"
            >
              {value}
            </SvgText>
          );
        })}
        
        {/* Bars with gradient effect */}
        {data.map((item, index) => {
          const barHeight = Math.max((item.value / maxValue) * height, 4); // Minimum bar height
          const x = leftPadding + index * (barWidth + barSpacing);
          const y = height - barHeight;
          
          return (
            <G key={index}>
              {/* Bar */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#EF4444"
                rx={6}
              />
              
              {/* Value label on top of bar */}
              <SvgText
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fill="#1F2937"
                fontWeight="600"
                fontFamily="Poppins_600SemiBold"
              >
                {item.value}
              </SvgText>
              
              {/* Category label below */}
              <SvgText
                x={x + barWidth / 2}
                y={height + 18}
                textAnchor="middle"
                fontSize="10"
                fill="#6B7280"
                fontFamily="Poppins_400Regular"
              >
                {item.label}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};


const ProgressBar = ({ value, maxValue, color = "#EF4444" }: { value: number, maxValue: number, color?: string }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
};

interface IncidentAnalysisScreenProps {
  navigation: any;
}

const IncidentAnalysisScreen: React.FC<IncidentAnalysisScreenProps> = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly'); // 'daily', 'monthly', 'yearly'
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any[]>([]);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [trendPercentage, setTrendPercentage] = useState(0);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Fetch and analyze data on component mount
  useEffect(() => {
    fetchAndAnalyzeData();
  }, [selectedPeriod]);

  const fetchAndAnalyzeData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Fetching reports for analysis...');
      const result = await ReportsService.getAllReports();
      
      if (result.success && result.data) {
        const allReports = result.data;
        console.log(`📊 Analyzing ${allReports.length} total reports`);
        
        // Filter reports by selected period
        const filteredReports = filterReportsByPeriod(allReports, selectedPeriod);
        console.log(`📊 ${filteredReports.length} reports in selected period (${selectedPeriod} days)`);
        
        setReports(filteredReports);
        setTotalIncidents(filteredReports.length);
        
        // Generate chart data from actual reports
        const categoryData = generateCategoryData(filteredReports);
        setChartData(categoryData);
        
        // Calculate risk predictions for barangays
        const barangayRisks = calculateBarangayRisks(allReports, filteredReports);
        setRiskData(barangayRisks);
        
        // Calculate trend (compare with previous period)
        const trend = calculateTrend(allReports, selectedPeriod);
        setTrendPercentage(trend);
        
        console.log('✅ Analysis complete:', {
          totalReports: filteredReports.length,
          categories: categoryData.length,
          barangays: barangayRisks.length,
          trend: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`
        });
      } else {
        console.error('❌ Failed to fetch reports:', result.error);
        Alert.alert('Error', 'Failed to load incident data');
      }
    } catch (error: any) {
      console.error('❌ Error analyzing data:', error);
      Alert.alert('Error', 'Failed to analyze incident data');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter reports by time period
  const filterReportsByPeriod = (reports: Report[], period: string): Report[] => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch(period) {
      case 'daily':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'yearly':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    return reports.filter(report => {
      const reportDate = new Date(report.dateTime);
      return reportDate >= cutoffDate && reportDate <= now;
    });
  };

  // Generate category distribution data
  const generateCategoryData = (reports: Report[]) => {
    const categoryCounts: { [key: string]: number } = {};
    
    reports.forEach(report => {
      const category = report.category || report.incidentType || 'Others';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Sort by count and take top 3 for better readability
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, value]) => ({
        label: label.length > 8 ? label.substring(0, 6) + '..' : label,
        value,
        fullLabel: label
      }));
    
    return sortedCategories.length > 0 ? sortedCategories : [
      { label: 'No Data', value: 0, fullLabel: 'No Data' }
    ];
  };

  // Calculate risk predictions for barangays using ML-inspired approach
  const calculateBarangayRisks = (allReports: Report[], recentReports: Report[]) => {
    const barangayStats: { 
      [key: string]: { 
        total: number, 
        recent: number, 
        trend: number,
        lastIncidentDays: number 
      } 
    } = {};
    
    const now = new Date();
    
    // Gather statistics for each barangay
    allReports.forEach(report => {
      const barangay = report.barangay || 'Unknown';
      if (!barangayStats[barangay]) {
        barangayStats[barangay] = { total: 0, recent: 0, trend: 0, lastIncidentDays: Infinity };
      }
      barangayStats[barangay].total++;
      
      // Track most recent incident
      const daysSince = Math.floor((now.getTime() - new Date(report.dateTime).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince < barangayStats[barangay].lastIncidentDays) {
        barangayStats[barangay].lastIncidentDays = daysSince;
      }
    });
    
    // Count recent reports
    recentReports.forEach(report => {
      const barangay = report.barangay || 'Unknown';
      if (barangayStats[barangay]) {
        barangayStats[barangay].recent++;
      }
    });
    
    // Calculate risk scores and trends
    const barangayRisks = Object.entries(barangayStats).map(([name, stats]) => {
      // Risk factors:
      // 1. Recent activity (40% weight)
      // 2. Historical total (30% weight)
      // 3. Recency of last incident (20% weight)
      // 4. Trend direction (10% weight)
      
      const recentWeight = stats.recent * 4;
      const historicalWeight = stats.total * 0.3;
      const recencyWeight = stats.lastIncidentDays < 7 ? 20 : stats.lastIncidentDays < 30 ? 10 : 0;
      
      // Calculate trend (recent vs historical average)
      const periodDays = selectedPeriod === 'daily' ? 1 : selectedPeriod === 'yearly' ? 365 : 30;
      const historicalAvg = stats.total / 365; // Daily average
      const recentAvg = stats.recent / periodDays;
      stats.trend = ((recentAvg - historicalAvg) / Math.max(historicalAvg, 0.1)) * 100;
      
      const trendWeight = stats.trend > 50 ? 10 : stats.trend > 0 ? 5 : 0;
      
      const riskScore = Math.min(100, recentWeight + historicalWeight + recencyWeight + trendWeight);
      
      // Determine risk level and color
      let riskLevel = 'Low risk';
      let color = '#10B981'; // Green
      
      if (riskScore >= 70) {
        riskLevel = 'High risk';
        color = '#EF4444'; // Red
      } else if (riskScore >= 40) {
        riskLevel = 'Moderate risk';
        color = '#F59E0B'; // Orange
      }
      
      return {
        name,
        risk: riskLevel,
        value: Math.round(riskScore),
        color,
        recentIncidents: stats.recent,
        totalIncidents: stats.total,
        trend: stats.trend,
        lastIncidentDays: stats.lastIncidentDays
      };
    });
    
    // Sort by risk score (highest first) and take top 10
    return barangayRisks
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  };

  // Calculate trend compared to previous period
  const calculateTrend = (allReports: Report[], period: string): number => {
    const now = new Date();
    const currentPeriodDays = period === 'weekly' ? 7 : period === 'yearly' ? 365 : 30;
    const currentPeriodStart = new Date(now.getTime() - currentPeriodDays * 24 * 60 * 60 * 1000);
    const previousPeriodStart = new Date(now.getTime() - currentPeriodDays * 2 * 24 * 60 * 60 * 1000);
    
    const currentPeriodCount = allReports.filter(report => {
      const date = new Date(report.dateTime);
      return date >= currentPeriodStart && date <= now;
    }).length;
    
    const previousPeriodCount = allReports.filter(report => {
      const date = new Date(report.dateTime);
      return date >= previousPeriodStart && date < currentPeriodStart;
    }).length;
    
    if (previousPeriodCount === 0) return currentPeriodCount > 0 ? 100 : 0;
    
    return ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
  };

  const getPeriodLabel = (period: string): string => {
    switch(period) {
      case 'daily':
        return 'Today';
      case 'monthly':
        return 'This Month';
      case 'yearly':
        return 'This Year';
      default:
        return 'This Month';
    }
  };

  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.menuButton}>
            {/* Empty placeholder for alignment */}
          </View>
          <Text style={styles.headerTitle}>Incident Analysis</Text>
          <View style={styles.menuButton}>
            {/* Empty placeholder for alignment */}
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loadingText}>Analyzing incident data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.menuButton}>
          {/* Empty placeholder for alignment */}
        </View>
        <Text style={styles.headerTitle}>Incident Analysis</Text>
        <View style={styles.menuButton}>
          {/* Empty placeholder for alignment */}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theft Trend analysis</Text>
          <Text style={styles.sectionSubtitle}>
            View incident patterns and predictions based on{'\n'}ML anaylysis
          </Text>

          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Incident Types</Text>
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setIsDropdownVisible(true)}
              >
                <Text style={styles.dropdownText}>{getPeriodLabel(selectedPeriod)}</Text>
                <FontAwesome name="chevron-down" size={12} color="#000000" />
              </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
              <BarChart 
                data={chartData} 
                width={screenWidth - 80} 
                height={220} 
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <Text style={styles.riskTitle}>Risk Prediction</Text>
              <Text style={styles.riskSubtitle}>ML-based forecast</Text>
            </View>

            <View style={styles.riskList}>
              {riskData.map((item, index) => (
                <View key={index} style={styles.riskItem}>
                  <View style={styles.riskInfo}>
                    <Text style={styles.riskName}>{item.name}</Text>
                    <Text style={[styles.riskLevel, { color: item.color }]}>
                      {item.risk}
                    </Text>
                  </View>
                  <ProgressBar value={item.value} maxValue={100} color={item.color} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Map')}
        >
          <FontAwesome name="exclamation-triangle" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <FontAwesome name="bar-chart" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Period Dropdown Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isDropdownVisible}
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.dropdownModalContent}>
            <TouchableOpacity
              style={styles.dropdownOption}
              onPress={() => {
                setSelectedPeriod('daily');
                setIsDropdownVisible(false);
              }}
            >
              <Text style={[styles.dropdownOptionText, selectedPeriod === 'daily' && styles.dropdownOptionTextActive]}>
                Today
              </Text>
              {selectedPeriod === 'daily' && (
                <FontAwesome name="check" size={16} color="#EF4444" />
              )}
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownOption}
              onPress={() => {
                setSelectedPeriod('monthly');
                setIsDropdownVisible(false);
              }}
            >
              <Text style={[styles.dropdownOptionText, selectedPeriod === 'monthly' && styles.dropdownOptionTextActive]}>
                This Month
              </Text>
              {selectedPeriod === 'monthly' && (
                <FontAwesome name="check" size={16} color="#EF4444" />
              )}
            </TouchableOpacity>

            <View style={styles.dropdownDivider} />

            <TouchableOpacity
              style={styles.dropdownOption}
              onPress={() => {
                setSelectedPeriod('yearly');
                setIsDropdownVisible(false);
              }}
            >
              <Text style={[styles.dropdownOptionText, selectedPeriod === 'yearly' && styles.dropdownOptionTextActive]}>
                This Year
              </Text>
              {selectedPeriod === 'yearly' && (
                <FontAwesome name="check" size={16} color="#EF4444" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#EF4444',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    width: responsiveSize(44, 52, 60),
    height: responsiveSize(44, 52, 60),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: responsiveSize(8, 10, 12),
  },
  headerTitle: {
    color: 'white',
    fontSize: responsiveFontSize(18),
    fontFamily: 'Poppins_700Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    lineHeight: 21,
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
    letterSpacing: -0.2,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  dropdownText: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: '#4B5563',
    marginRight: 6,
  },
  chartContainer: {
    alignItems: 'center',
  },
  riskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  riskTitle: {
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
    letterSpacing: -0.2,
  },
  riskSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
  },
  riskList: {
    gap: 16,
  },
  riskItem: {
    gap: 8,
  },
  riskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  riskName: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  riskLevel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    letterSpacing: 0.1,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: responsiveSize(20, 24, 28),
    paddingHorizontal: responsivePadding(32),
    justifyContent: isTablet() ? 'center' : 'space-around',
    gap: isTablet() ? responsiveSize(40, 60, 80) : 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  navItem: {
    padding: responsiveSize(16, 20, 24),
    borderRadius: responsiveSize(12, 14, 16),
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: responsiveSize(64, 80, 96),
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#6B7280',
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#111827',
  },
  dropdownOptionTextActive: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#EF4444',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});

export default IncidentAnalysisScreen;