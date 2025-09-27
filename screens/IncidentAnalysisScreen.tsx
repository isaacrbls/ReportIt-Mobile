import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const { width: screenWidth } = Dimensions.get('window');

// Bar Chart Component
const BarChart = ({ data, width, height }: { data: any[], width: number, height: number }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 60) / data.length - 10;
  
  return (
    <Svg width={width} height={height + 40}>
      <G>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * height;
          const x = 30 + index * (barWidth + 10);
          const y = height - barHeight;
          
          return (
            <G key={index}>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#EF4444"
                rx={4}
              />
              <SvgText
                x={x + barWidth / 2}
                y={height + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#6B7280"
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

// Progress Bar Component
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
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const chartData = [
    { label: 'Theft', value: 85 },
    { label: 'Robbery', value: 45 },
    { label: 'Burglary', value: 75 },
  ];

  const riskData = [
    { name: 'Bulihan', risk: 'High risk', value: 85, color: '#EF4444' },
    { name: 'Barasoain', risk: 'Moderate risk', value: 60, color: '#F59E0B' },
    { name: 'Sumapa', risk: 'Low risk', value: 25, color: '#10B981' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incident Analysis</Text>
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
              <TouchableOpacity style={styles.dropdown}>
                <Text style={styles.dropdownText}>{selectedPeriod}</Text>
                <FontAwesome name="chevron-down" size={12} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.chartContainer}>
              <BarChart 
                data={chartData} 
                width={screenWidth - 80} 
                height={200} 
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
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  chartCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    marginRight: 8,
  },
  chartContainer: {
    alignItems: 'center',
  },
  riskCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  riskTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
  },
  riskSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
  },
  riskList: {
    gap: 20,
  },
  riskItem: {
    gap: 12,
  },
  riskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskName: {
    fontSize: 16,
    fontFamily: 'Poppins_500Medium',
    color: '#111827',
  },
  riskLevel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 20,
    paddingHorizontal: 32,
    justifyContent: 'space-around',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  navItem: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default IncidentAnalysisScreen;