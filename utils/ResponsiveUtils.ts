import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const isSmallPhone = () => screenWidth < 375;
export const isStandardPhone = () => screenWidth >= 375 && screenWidth < 414;
export const isLargePhone = () => screenWidth >= 414 && screenWidth < 768;
export const isTablet = () => screenWidth >= 768;
export const isLargeTablet = () => screenWidth >= 1024;

export const hasNotch = () => screenHeight >= 812;
export const isShortDevice = () => screenHeight < 667;

export const getDeviceSize = (): 'small' | 'medium' | 'medium-large' | 'large' | 'xlarge' => {
  if (isLargeTablet()) return 'xlarge';
  if (isTablet()) return 'large';
  if (isLargePhone()) return 'medium-large';
  if (isStandardPhone()) return 'medium';
  if (isSmallPhone()) return 'small';
  return 'medium';
};

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

export const responsiveFontSize = (baseSize: number): number => {
  const baseWidth = 414;
  let scale = screenWidth / baseWidth;
  
  scale = Math.max(0.85, Math.min(scale, 1.15));
  
  let fontSize = baseSize * scale;
  
  if (isSmallPhone()) {
    fontSize = baseSize * 0.9;
  } else if (isTablet()) {
    fontSize = baseSize * 1.1;
  }
  
  const minSize = baseSize * 0.85;
  const maxSize = baseSize * 1.2;
  
  return Math.round(Math.max(minSize, Math.min(fontSize, maxSize)));
};

export const responsivePadding = (base: number): number => {
  return responsiveSize(
    base * 0.8,
    base,
    base * 1.1,
    base * 1.3,
    base * 1.5
  );
};

export const responsiveWidth = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

export const responsiveHeight = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

export const minimumTouchTarget = (size: number): number => {
  const minSize = 44;
  return Math.max(size, minSize);
};
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
