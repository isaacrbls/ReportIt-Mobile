import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TheftIcon, AssaultIcon, getCategoryIcon } from './CategoryIconComponents';

/**
 * Example component showing how to use SVG icons
 */
export const CategoryIconExample = () => {
  return (
    <View style={styles.container}>
      {/* Method 1: Direct import and use */}
      <View style={styles.iconExample}>
        <TheftIcon width={40} height={40} fill="#960C12" />
        <Text>Theft Icon</Text>
      </View>

      <View style={styles.iconExample}>
        <AssaultIcon width={40} height={40} fill="#960C12" />
        <Text>Assault Icon</Text>
      </View>

      {/* Method 2: Get icon by category name */}
      <View style={styles.iconExample}>
        {(() => {
          const Icon = getCategoryIcon('Theft');
          return <Icon width={40} height={40} fill="#960C12" />;
        })()}
        <Text>Dynamic Icon</Text>
      </View>

      {/* Method 3: Use in lists with different colors */}
      <View style={styles.iconExample}>
        <TheftIcon 
          width={32} 
          height={32} 
          fill="#FF6B35" // Orange
        />
        <Text style={{ color: '#FF6B35' }}>Custom Color</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 15,
  },
  iconExample: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});
