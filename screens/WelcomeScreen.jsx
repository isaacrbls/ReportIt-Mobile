import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MapPinIcon, ShieldCheckIcon } from 'react-native-heroicons/outline';

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#EF4444', paddingTop: 50, paddingBottom: 32, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 20, marginRight: 12 }}>
            <ShieldCheckIcon size={28} color="white" />
          </View>
          <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>ReportIt</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 40, paddingBottom: 40 }}>
        {/* Title Section */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 16 }}>
            Welcome to ReportIt
          </Text>
          
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 }}>
            A Machine Learning-Driven Mobile Application for Dynamic{'\n'}
            Theft Risk Assessment Using Crowd-Sourced Reports
          </Text>
        </View>

        {/* Feature Cards */}
        <View style={{ marginBottom: 40 }}>
          {/* Real-time Risk Assessment Card */}
          <View style={{ backgroundColor: '#F3F4F6', borderRadius: 16, padding: 24, marginBottom: 20, alignItems: 'center' }}>
            <View style={{ marginBottom: 20 }}>
              <MapPinIcon size={32} color="#EF4444" />
            </View>
            
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 12 }}>
              Real-time Risk Assessment
            </Text>
            
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
              View dynamic theft risk maps based on{'\n'}
              crowd-sourced reports and machine{'\n'}
              learning analysis.
            </Text>
          </View>

          {/* Community Protection Card */}
          <View style={{ backgroundColor: '#F3F4F6', borderRadius: 16, padding: 24, alignItems: 'center' }}>
            <View style={{ marginBottom: 20 }}>
              <ShieldCheckIcon size={32} color="#EF4444" />
            </View>
            
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 12 }}>
              Community Protection
            </Text>
            
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 }}>
              Contribute to community safety by{'\n'}
              reporting incidents and helping others{'\n'}
              stay informed.
            </Text>
          </View>
        </View>

        {/* Get Started Button */}
        <TouchableOpacity 
          style={{ 
            backgroundColor: '#EF4444', 
            borderRadius: 12, 
            paddingVertical: 16, 
            paddingHorizontal: 32, 
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
          }}
          onPress={handleGetStarted}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
