import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  BackHandler,
  StatusBar,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { AuthService, SignupData } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { BULACAN_CITIES, getAllBarangays, isReportingAllowed } from '../utils/BulacanBarangays';
import { NavigationHelper } from '../utils/NavigationHelper';


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

const EyeIcon = ({ size = 24, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const EyeOffIcon = ({ size = 24, color = "#6B7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 1l22 22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckIcon = ({ size = 20, color = "#EF4444" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 6L9 17l-5-5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface SignupScreenProps {
  navigation: any;
  route?: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation, route }) => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isBarangayModalVisible, setIsBarangayModalVisible] = useState(false);
  const [isTermsRequiredModalVisible, setIsTermsRequiredModalVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    barangay: '',
    terms: '',
    general: ''
  });


  // Handle hardware back button with modal priority and logical navigation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Priority 1: Close terms required modal if visible
      if (isTermsRequiredModalVisible) {
        setIsTermsRequiredModalVisible(false);
        return true; // Prevent default back behavior
      }
      
      // Priority 2: Close barangay modal if visible
      if (isBarangayModalVisible) {
        setIsBarangayModalVisible(false);
        return true; // Prevent default back behavior
      }
      
      // Priority 3: If accessed from hamburger menu, go back to Map
      if (route?.params?.fromMenu) {
        navigation.navigate('Map');
        return true;
      }
      
      // Priority 4: Use logical navigation for normal signup flow
      const context = NavigationHelper.createContext('Signup', route?.params?.fromTerms ? 'TermsAndConditions' : undefined);
      const handled = NavigationHelper.handleBackNavigation(navigation, 'Signup', context);
      
      return handled;
    });

    return () => backHandler.remove();
  }, [isTermsRequiredModalVisible, isBarangayModalVisible, navigation, route]);

  React.useEffect(() => {
    if (route?.params?.termsAccepted === true) {
      setAgreeToTerms(true);
    } else if (route?.params?.termsAccepted === false) {
      setAgreeToTerms(false);
    }
    
    // Restore form data if coming back from terms
    if (route?.params?.formData) {
      const formData = route?.params?.formData;
      setFirstName(formData.firstName || '');
      setLastName(formData.lastName || '');
      setUsername(formData.username || '');
      setEmail(formData.email || '');
      setPassword(formData.password || '');
      setConfirmPassword(formData.confirmPassword || '');
      setSelectedBarangay(formData.selectedBarangay || '');
      setSelectedCity(formData.selectedCity || '');
    }
  }, [route?.params?.termsAccepted, route?.params?.formData]);

  if (!fontsLoaded) {
    return null;
  }


  const checkPasswordStrength = (pwd: string) => {
    if (!pwd) {
      setPasswordStrength('');
      return;
    }
    
    const hasNumber = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasLength = pwd.length >= 8;
    
    if (hasLength && hasNumber && hasSpecialChar) {
      setPasswordStrength('STRONG');
    } else {
      setPasswordStrength('WEAK');
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    checkPasswordStrength(text);
    // Clear password error when user starts typing
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const validateInputs = () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      barangay: '',
      terms: '',
      general: ''
    };
    let isValid = true;

    // First Name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last Name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (passwordStrength === 'WEAK') {
      newErrors.password = 'Password must contain at least one number and one special character';
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Barangay validation
    if (!selectedBarangay) {
      newErrors.barangay = 'Please select your barangay';
      isValid = false;
    }

    // Terms validation
    if (!agreeToTerms) {
      setIsTermsRequiredModalVisible(true);
      return false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCreateAccount = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));

    try {
      // Temporarily skip database connection test until rules are fixed
      // const dbTest = await UserService.testDatabaseConnection();
      // if (!dbTest.success) {
      //   console.error('Database connection test failed:', dbTest.error);
      //   setErrors(prev => ({ ...prev, general: 'Database connection failed: ' + dbTest.error }));
      //   Alert.alert('Database Error', 'Cannot connect to database: ' + dbTest.error);
      //   return;
      // }

      const signupData: SignupData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password: password,
        barangay: selectedBarangay,
        city: selectedCity
      };

      console.log('Starting signup with data:', { ...signupData, password: '[HIDDEN]' });
      const result = await AuthService.signUpWithProfile(signupData);
      
      if (result.success && result.user) {
        console.log('Signup successful for user:', result.user.uid);
        // Navigate directly to Login without showing success modal
        navigation.navigate('Login');
      } else {
        console.error('Signup failed:', result.error);
        setErrors(prev => ({ ...prev, general: result.error || 'Account creation failed' }));
        Alert.alert('Signup Failed', result.error || 'Please try again.');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors(prev => ({ ...prev, general: 'An unexpected error occurred' }));
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBarangaySelect = (barangay: string, city: string) => {
    setSelectedBarangay(barangay);
    setSelectedCity(city);
    setIsBarangayModalVisible(false);
    if (errors.barangay) {
      setErrors(prev => ({ ...prev, barangay: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            // If accessed from hamburger menu, go back to Map
            if (route?.params?.fromMenu) {
              navigation.navigate('Map');
            } else {
              // Otherwise use normal navigation flow
              const context = NavigationHelper.createContext('Signup', route?.params?.fromTerms ? 'TermsAndConditions' : undefined);
              NavigationHelper.handleBackNavigation(navigation, 'Signup', context);
            }
          }}
        >
          <FontAwesome name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.logoSection}>
          <ShieldIcon size={48} color="#EF4444" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join ReportIt to help keep your community safe
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, errors.firstName ? styles.inputError : null]}
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (errors.firstName) {
                  setErrors(prev => ({ ...prev, firstName: '' }));
                }
              }}
              placeholder="First Name"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, errors.lastName ? styles.inputError : null]}
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (errors.lastName) {
                  setErrors(prev => ({ ...prev, lastName: '' }));
                }
              }}
              placeholder="Last Name"
              placeholderTextColor="#9CA3AF"
              editable={!loading}
            />
            {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, errors.username ? styles.inputError : null]}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (errors.username) {
                  setErrors(prev => ({ ...prev, username: '' }));
                }
              }}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Barangay</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerButton, errors.barangay ? styles.inputError : null]}
              onPress={() => !loading && setIsBarangayModalVisible(true)}
              disabled={loading}
            >
              <Text style={[
                styles.pickerText, 
                selectedBarangay ? styles.selectedText : { color: '#9CA3AF' }
              ]}>
                {selectedBarangay ? `${selectedBarangay}, ${selectedCity}` : 'Select your barangay'}
              </Text>
            </TouchableOpacity>
            {errors.barangay ? <Text style={styles.errorText}>{errors.barangay}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, errors.password ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </TouchableOpacity>
            </View>
            {passwordStrength && (
              <View style={styles.passwordStrengthContainer}>
                <View style={[
                  styles.strengthIndicator,
                  passwordStrength === 'STRONG' ? styles.strongIndicator : styles.weakIndicator
                ]} />
                <Text style={[
                  styles.strengthText,
                  passwordStrength === 'STRONG' ? styles.strongText : styles.weakText
                ]}>
                  {passwordStrength} - {passwordStrength === 'STRONG' 
                    ? 'Good password strength' 
                    : 'Must be at least 8 characters with a number and special character'
                  }
                </Text>
              </View>
            )}
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.passwordContainer, errors.confirmPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errors.confirmPassword) {
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => {
                // Save current form data before navigating
                const formData = {
                  firstName,
                  lastName,
                  username,
                  email,
                  password,
                  confirmPassword,
                  selectedBarangay,
                  selectedCity
                };
                navigation.navigate('TermsAndConditions', { 
                  fromSignup: true,
                  formData: formData
                });
              }}
            >
              <View style={[styles.checkboxBox, agreeToTerms && styles.checkboxChecked]}>
                {agreeToTerms && <CheckIcon size={16} color="white" />}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>I Agree to the </Text>
                <TouchableOpacity onPress={() => {
                  const formData = {
                    firstName,
                    lastName,
                    username,
                    email,
                    password,
                    confirmPassword,
                    selectedBarangay,
                    selectedCity
                  };
                  navigation.navigate('TermsAndConditions', { 
                    fromSignup: true,
                    formData: formData
                  });
                }}>
                  <Text style={styles.linkText}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> and </Text>
                <TouchableOpacity onPress={() => {
                  const formData = {
                    firstName,
                    lastName,
                    username,
                    email,
                    password,
                    confirmPassword,
                    selectedBarangay,
                    selectedCity
                  };
                  navigation.navigate('TermsAndConditions', { 
                    fromSignup: true,
                    formData: formData
                  });
                }}>
                  <Text style={styles.linkText}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.createButton, (!agreeToTerms || loading) && styles.createButtonDisabled]}
            onPress={handleCreateAccount}
            disabled={!agreeToTerms || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {errors.general ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Barangay Selection Modal */}
      <Modal
        visible={isBarangayModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBarangayModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Select Your Barangay</Text>
              <TouchableOpacity
                onPress={() => setIsBarangayModalVisible(false)}
                style={modalStyles.closeButton}
              >
                <Text style={modalStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={BULACAN_CITIES}
              keyExtractor={(item) => item.name}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: city }) => (
                <View style={modalStyles.citySection}>
                  <Text style={modalStyles.cityName}>{city.name}</Text>
                  {city.barangays.map((barangay) => (
                    <TouchableOpacity
                      key={`${city.name}-${barangay.name}`}
                      style={modalStyles.barangayItem}
                      onPress={() => handleBarangaySelect(barangay.name, city.name)}
                    >
                      <Text style={modalStyles.barangayText}>{barangay.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Terms Required Modal */}
      <Modal
        visible={isTermsRequiredModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsTermsRequiredModalVisible(false)}
      >
        <View style={modalStyles.termsModalOverlay}>
          <View style={modalStyles.termsModalContent}>
            <View style={modalStyles.termsIconContainer}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                  fill="#EF4444"
                />
              </Svg>
            </View>
            <Text style={modalStyles.termsModalTitle}>Terms & Conditions Required</Text>
            <Text style={modalStyles.termsModalText}>
              You must read and accept the Terms and Conditions before creating an account.
            </Text>
            <View style={modalStyles.termsModalButtons}>
              <TouchableOpacity
                style={modalStyles.termsModalButtonSecondary}
                onPress={() => setIsTermsRequiredModalVisible(false)}
              >
                <Text style={modalStyles.termsModalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={modalStyles.termsModalButtonPrimary}
                onPress={() => {
                  setIsTermsRequiredModalVisible(false);
                  // Navigate to Terms and Conditions with form data
                  navigation.navigate('TermsAndConditions', {
                    fromSignup: true,
                    formData: {
                      firstName,
                      lastName,
                      username,
                      email,
                      password,
                      confirmPassword,
                      selectedBarangay,
                      selectedCity,
                    }
                  });
                }}
              >
                <Text style={modalStyles.termsModalButtonTextPrimary}>Read Terms</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#111827',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  termsContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  checkboxChecked: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginTop: 1,
  },
  termsText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  linkText: {
    color: '#EF4444',
    fontFamily: 'Poppins_500Medium',
  },
  createButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
  },
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  weakIndicator: {
    backgroundColor: '#EF4444',
  },
  strongIndicator: {
    backgroundColor: '#10B981',
  },
  strengthText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  weakText: {
    color: '#EF4444',
  },
  strongText: {
    color: '#10B981',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  pickerButton: {
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  selectedText: {
    color: '#111827',
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontFamily: 'Poppins_400Regular',
  },
  citySection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cityName: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#EF4444',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  barangayItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  barangayText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#374151',
  },
  termsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  termsIconContainer: {
    marginBottom: 16,
  },
  termsModalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  termsModalText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  termsModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  termsModalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  termsModalButtonTextSecondary: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#6B7280',
  },
  termsModalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  termsModalButtonTextPrimary: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: 'white',
  },
});

export default SignupScreen;