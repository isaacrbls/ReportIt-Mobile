import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_REPORTS_KEY = '@reportit_offline_reports';

export interface OfflineReport {
  id: string; // Temporary local ID
  barangay: string;
  title: string;
  description: string;
  incidentType: string;
  category?: string;
  isSensitive?: boolean;
  latitude: number;
  longitude: number;
  submittedByEmail: string;
  createdAt: string; // Original timestamp when report was created
  mediaType?: string;
  mediaURL?: string;
  mediaAssets?: any[]; // Store media assets for later upload
}

export class OfflineReportsService {
  /**
   * Save a report to offline storage
   */
  static async saveOfflineReport(report: OfflineReport): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Saving report to offline storage:', report.id);
      
      // Get existing offline reports
      const existingReports = await this.getOfflineReports();
      
      // Add new report
      const updatedReports = [...existingReports, report];
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(updatedReports));
      
      console.log('✅ Report saved offline successfully. Total offline reports:', updatedReports.length);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error saving offline report:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to save offline report' 
      };
    }
  }

  /**
   * Get all offline reports
   */
  static async getOfflineReports(): Promise<OfflineReport[]> {
    try {
      const reportsJson = await AsyncStorage.getItem(OFFLINE_REPORTS_KEY);
      
      if (!reportsJson) {
        return [];
      }
      
      const reports = JSON.parse(reportsJson) as OfflineReport[];
      console.log('📋 Retrieved offline reports:', reports.length);
      return reports;
    } catch (error: any) {
      console.error('❌ Error getting offline reports:', error);
      return [];
    }
  }

  /**
   * Get count of pending offline reports
   */
  static async getOfflineReportsCount(): Promise<number> {
    try {
      const reports = await this.getOfflineReports();
      return reports.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Remove a specific offline report by ID
   */
  static async removeOfflineReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Removing offline report:', reportId);
      
      const existingReports = await this.getOfflineReports();
      const updatedReports = existingReports.filter(r => r.id !== reportId);
      
      await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(updatedReports));
      
      console.log('✅ Offline report removed. Remaining:', updatedReports.length);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error removing offline report:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to remove offline report' 
      };
    }
  }

  /**
   * Clear all offline reports
   */
  static async clearAllOfflineReports(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Clearing all offline reports');
      await AsyncStorage.removeItem(OFFLINE_REPORTS_KEY);
      console.log('✅ All offline reports cleared');
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error clearing offline reports:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to clear offline reports' 
      };
    }
  }

  /**
   * Generate a temporary local ID for offline reports
   */
  static generateLocalId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}
