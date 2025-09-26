import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  Alert 
} from 'react-native';
import { 
  ArrowLeftIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon
} from 'react-native-heroicons/outline';

const { width } = Dimensions.get('window');

export default function IncidentAnalysisScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 days');

  // Risk prediction data
  const riskPredictions = [
    { area: 'Bulihan', risk: 'High risk', level: 90 },
    { area: 'Barasoan', risk: 'Moderate risk', level: 60 },
    { area: 'Sumapa', risk: 'Low risk', level: 25 }
  ];

  // Incident types data for bar chart
  const incidentData = [
    { type: 'Theft', value: 45, height: 180 },
    { type: 'Robbery', value: 25, height: 100 },
    { type: 'Burglary', value: 35, height: 140 }
  ];

  const getRiskColor = (level) => {
    if (level >= 80) return '#EF4444';
    if (level >= 50) return '#F59E0B'; 
    return '#22C55E';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View className="bg-primary-500 flex-row items-center justify-center py-4" style={{ backgroundColor: '#EF4444', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 }}>
        <TouchableOpacity
          className="absolute left-4"
          style={{ position: 'absolute', left: 16 }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color="white" />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-bold" style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Incident Analysis</Text>
      </View>

      <ScrollView className="flex-1" style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Theft Trend Analysis Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6" style={{ backgroundColor: 'white', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 24 }}>
          <Text className="text-xl font-bold text-gray-900 mb-2" style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
            Theft Trend analysis
          </Text>
          <Text className="text-gray-600 text-sm mb-6" style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
            View incident patterns and predictions based on ML analysis
          </Text>

          {/* Incident Types Chart */}
          <View className="mb-6" style={{ marginBottom: 24 }}>
            <View className="flex-row justify-between items-center mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text className="text-base font-semibold text-gray-800" style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                Incident Types
              </Text>
              <TouchableOpacity className="flex-row items-center" style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text className="text-sm text-gray-600 mr-1" style={{ fontSize: 14, color: '#6B7280', marginRight: 4 }}>
                  {selectedPeriod}
                </Text>
                <Text className="text-gray-400" style={{ color: '#9CA3AF' }}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Bar Chart */}
            <View className="bg-gray-100 rounded-xl p-4" style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16 }}>
              <View className="flex-row items-end justify-around h-48" style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 192 }}>
                {incidentData.map((item, index) => (
                  <View key={index} className="items-center" style={{ alignItems: 'center' }}>
                    <View 
                      className="bg-primary-500 rounded-t-md w-12 mb-2" 
                      style={{ 
                        backgroundColor: '#EF4444', 
                        borderTopLeftRadius: 6, 
                        borderTopRightRadius: 6, 
                        width: 48, 
                        height: item.height,
                        marginBottom: 8 
                      }} 
                    />
                    <Text className="text-xs text-gray-700 font-medium" style={{ fontSize: 12, color: '#374151', fontWeight: '500' }}>
                      {item.type}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Risk Prediction Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-6" style={{ backgroundColor: 'white', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 24 }}>
          <View className="flex-row justify-between items-center mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text className="text-base font-semibold text-gray-800" style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
              Risk Prediction
            </Text>
            <Text className="text-sm text-gray-500" style={{ fontSize: 14, color: '#6B7280' }}>
              ML-based forecast
            </Text>
          </View>

          {riskPredictions.map((prediction, index) => (
            <View key={index} className="mb-4" style={{ marginBottom: 16 }}>
              <View className="flex-row justify-between items-center mb-2" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text className="text-gray-800 font-medium" style={{ color: '#1F2937', fontWeight: '500' }}>
                  {prediction.area}
                </Text>
                <Text className="text-sm text-gray-600" style={{ fontSize: 14, color: '#6B7280' }}>
                  {prediction.risk}
                </Text>
              </View>
              <View className="bg-gray-200 rounded-full h-2" style={{ backgroundColor: '#E5E7EB', borderRadius: 10, height: 8 }}>
                <View 
                  className="rounded-full h-2" 
                  style={{ 
                    backgroundColor: getRiskColor(prediction.level), 
                    borderRadius: 10, 
                    height: 8, 
                    width: prediction.level + '%'
                  }} 
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="bg-primary-500 flex-row justify-around py-4" style={{ backgroundColor: '#EF4444', flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16 }}>
        <TouchableOpacity 
          className="items-center"
          style={{ alignItems: 'center' }}
          onPress={() => Alert.alert('Report', 'Report incident feature')}
        >
          <ExclamationTriangleIcon size={24} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="items-center"
          style={{ alignItems: 'center' }}
          onPress={() => navigation.navigate('Map')}
        >
          <ChartBarIcon size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
