import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';


const ShieldIcon = ({ size = 24, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BackIcon = ({ size = 24, color = "white" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 12H5M12 19l-7-7 7-7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface TermsAndConditionsScreenProps {
  navigation: any;
  route?: any;
}

const TermsAndConditionsScreen: React.FC<TermsAndConditionsScreenProps> = ({ navigation, route }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleAcceptTerms = () => {

    if (route?.params?.fromSignup) {
      navigation.navigate('Signup', { termsAccepted: true });
    } else {
      navigation.goBack();
    }
  };

  const handleDeclineTerms = () => {

    if (route?.params?.fromSignup) {
      navigation.navigate('Signup', { termsAccepted: false });
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ShieldIcon size={32} color="white" />
          <Text style={styles.headerTitle}>ReportIt</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Terms & Conditions</Text>
        
        <ScrollView style={styles.termsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              These Terms govern your use of ReportIt and constitute a legally binding agreement between you and the developers of ReportIt ("we", "us", or "our"). By using the application, you agree to these applicable laws and regulations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. User Account</Text>
            <Text style={styles.sectionSubtitle}>2.1.</Text>
            <Text style={styles.sectionText}>
              To access certain features of the App, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials.
            </Text>
            
            <Text style={styles.sectionSubtitle}>2.2.</Text>
            <Text style={styles.sectionText}>
              You agree to provide accurate, complete, and up-to-date information when creating your account and to update such information to maintain its accuracy.
            </Text>
            
            <Text style={styles.sectionSubtitle}>2.3.</Text>
            <Text style={styles.sectionText}>
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Permitted Use</Text>
            <Text style={styles.sectionSubtitle}>3.1.</Text>
            <Text style={styles.sectionText}>
              The App is intended for personal and non-commercial use only.
            </Text>
            
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Use the App for any illegal, harmful, or fraudulent purposes.</Text>
              <Text style={styles.bulletPoint}>• Attempt to gain unauthorized access to any part of the App without authorization.</Text>
              <Text style={styles.bulletPoint}>• Interfere with or disrupt the App's functionality.</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Privacy Policy</Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the App, to understand our practices regarding the collection and use of your personal information.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Modifications to Terms</Text>
            <Text style={styles.sectionText}>
              We reserve the right to modify these Terms at any time. We will notify users of any changes by posting the new Terms on this page. Your continued use of the App after any such changes constitutes your acceptance of the new Terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Contact Information</Text>
            <Text style={styles.sectionText}>
              If you have any questions about these Terms & Conditions, please contact us at support@reportit.com.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.declineButton} onPress={handleDeclineTerms}>
            <Text style={styles.declineButtonText}>Decline Terms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptTerms}>
            <Text style={styles.acceptButtonText}>Accept Terms</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    marginLeft: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  termsContainer: {
    flex: 1,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletPoints: {
    marginTop: 8,
    marginLeft: 16,
  },
  bulletPoint: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  declineButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  declineButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default TermsAndConditionsScreen;