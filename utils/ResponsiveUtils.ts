import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ============================================
// COMPREHENSIVE RESPONSIVE UTILITIES
// Supports iPhone 8 to latest & Android devices
// ============================================

// Device breakpoints based on common device widths
export const isSmallPhone = () => screenWidth < 375;        // iPhone SE 1st gen, small Androids (360px)
export const isStandardPhone = () => screenWidth >= 375 && screenWidth < 414;  // iPhone 8, X, 12/13 Pro (375-390px)
export const isLargePhone = () => screenWidth >= 414 && screenWidth < 768;     // iPhone Plus, Pro Max (414-430px)
export const isTablet = () => screenWidth >= 768;           // iPad mini and larger
export const isLargeTablet = () => screenWidth >= 1024;     // iPad Pro and larger

// Device height detection for notched/long devices
export const hasNotch = () => screenHeight >= 812;          // iPhone X and newer, modern Androids
export const isShortDevice = () => screenHeight < 667;      // iPhone SE, compact devices

// Get device category for easier logic
export const getDeviceSize = (): 'small' | 'medium' | 'medium-large' | 'large' | 'xlarge' => {
  if (isLargeTablet()) return 'xlarge';
  if (isTablet()) return 'large';
  if (isLargePhone()) return 'medium-large';
  if (isStandardPhone()) return 'medium';
  if (isSmallPhone()) return 'small';
  return 'medium';
};

// Responsive size with granular device support
// Params: small, medium, mediumLarge, large, xlarge (last param optional)
export const responsiveSize = (
  small: number, 
  medium: number, 
  mediumLarge: number, 
  large: number, 
  xlarge?: number
): number => {
  if (isLargeTablet() && xlarge) return xlarge;
  if (isTablet()) return large;
  if (isLargePhone()) return mediumLarge;
  if (isStandardPhone()) return medium;
  if (isSmallPhone()) return small;
  return medium;
};

// Improved font scaling with min/max constraints
export const responsiveFontSize = (baseSize: number): number => {
  // Base scale on iPhone 11 (414px) for better modern device support
  const baseWidth = 414;
  let scale = screenWidth / baseWidth;
  
  // Constrain scale to prevent too small or too large fonts
  scale = Math.max(0.85, Math.min(scale, 1.15));
  
  let fontSize = baseSize * scale;
  
  // Apply device-specific adjustments
  if (isSmallPhone()) {
    fontSize = baseSize * 0.9; // Slightly smaller for small devices
  } else if (isTablet()) {
    fontSize = baseSize * 1.1; // Slightly larger for tablets
  }
  
  // Ensure minimum readability
  const minSize = baseSize * 0.85;
  const maxSize = baseSize * 1.2;
  
  return Math.round(Math.max(minSize, Math.min(fontSize, maxSize)));
};

// Responsive padding with device-specific scaling
export const responsivePadding = (base: number): number => {
  return responsiveSize(
    base * 0.8,      // small phones
    base,            // standard phones  
    base * 1.1,      // large phones
    base * 1.3,      // tablets
    base * 1.5       // large tablets
  );
};

// Responsive width (percentage-based)
export const responsiveWidth = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

// Responsive height (percentage-based)
export const responsiveHeight = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

// Ensure minimum touch target size (iOS HIG: 44x44pt, Material: 48x48dp)
export const minimumTouchTarget = (size: number): number => {
  const minSize = 44;
  return Math.max(size, minSize);
};

// Get safe area insets for notched devices
export const getSafeAreaTop = (): number => {
  if (hasNotch()) return responsiveSize(44, 44, 47, 50, 50);
  return responsiveSize(20, 20, 24, 24, 24);
};

export const getSafeAreaBottom = (): number => {
  if (hasNotch()) return responsiveSize(34, 34, 34, 34, 34);
  return 0;
};

// Responsive icon sizes
export const getIconSize = (base: number): number => {
  return responsiveSize(
    base * 0.9,      // small
    base,            // medium
    base * 1.05,     // medium-large
    base * 1.15,     // large
    base * 1.25      // xlarge
  );
};

// Export screen dimensions for convenience
export const SCREEN_WIDTH = screenWidth;
export const SCREEN_HEIGHT = screenHeight;

// Device info for debugging/logging
export const getDeviceInfo = () => ({
  width: screenWidth,
  height: screenHeight,
  size: getDeviceSize(),
  hasNotch: hasNotch(),
  isShort: isShortDevice(),
  aspectRatio: (screenHeight / screenWidth).toFixed(2),
});
