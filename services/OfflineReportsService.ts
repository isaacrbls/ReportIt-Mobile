import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_REPORTS_KEY = '@reportit_offline_reports';
const SYNC_METADATA_KEY = '@reportit_sync_metadata';

export interface OfflineReport {
  id: string; // Temporary local ID
  barangay: string;
  title?: string; // Optional - kept for backward compatibility but not used in new reports
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
  syncStatus?: 'pending' | 'syncing' | 'failed' | 'synced'; // Track sync status
  syncAttempts?: number; // Number of sync attempts
  lastSyncAttempt?: string; // Last sync attempt timestamp
  syncErrorMessage?: string; // Last error message if failed
}

export interface SyncMetadata {
  reportId: string;
  firestoreId?: string; // Firestore document ID after successful sync
  syncedAt?: string; // When successfully synced
  attempts: number; // Number of sync attempts
  lastAttempt?: string; // Last attempt timestamp
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
      
      // Ensure report has sync status
      const reportWithStatus: OfflineReport = {
        ...report,
        syncStatus: 'pending',
        syncAttempts: 0,
      };
      
      // Add new report
      const updatedReports = [...existingReports, reportWithStatus];
      
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

  /**
   * Update sync status of a specific report
   */
  static async updateReportSyncStatus(
    reportId: string, 
    status: 'pending' | 'syncing' | 'failed' | 'synced',
    errorMessage?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const reports = await this.getOfflineReports();
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            syncStatus: status,
            syncAttempts: (report.syncAttempts || 0) + (status === 'syncing' ? 1 : 0),
            lastSyncAttempt: status === 'syncing' || status === 'failed' ? new Date().toISOString() : report.lastSyncAttempt,
            syncErrorMessage: errorMessage || report.syncErrorMessage,
          };
        }
        return report;
      });

      await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(updatedReports));
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error updating sync status:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update sync status' 
      };
    }
  }

  /**
   * Save sync metadata after successful sync to Firestore
   */
  static async saveSyncMetadata(localId: string, firestoreId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const metadataJson = await AsyncStorage.getItem(SYNC_METADATA_KEY);
      const metadata: SyncMetadata[] = metadataJson ? JSON.parse(metadataJson) : [];
      
      // Check if already synced (prevent duplicates)
      const existingMeta = metadata.find(m => m.reportId === localId);
      if (existingMeta) {
        console.log('⚠️ Report already synced:', localId, '-> Firestore ID:', existingMeta.firestoreId);
        return { success: true }; // Already synced
      }

      const newMeta: SyncMetadata = {
        reportId: localId,
        firestoreId,
        syncedAt: new Date().toISOString(),
        attempts: 1,
        lastAttempt: new Date().toISOString(),
      };

      metadata.push(newMeta);
      await AsyncStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(metadata));
      
      console.log('✅ Sync metadata saved for report:', localId);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error saving sync metadata:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to save sync metadata' 
      };
    }
  }

  /**
   * Check if a report has already been synced (duplicate prevention)
   */
  static async isReportAlreadySynced(reportId: string): Promise<boolean> {
    try {
      const metadataJson = await AsyncStorage.getItem(SYNC_METADATA_KEY);
      if (!metadataJson) return false;
      
      const metadata: SyncMetadata[] = JSON.parse(metadataJson);
      return metadata.some(m => m.reportId === reportId);
    } catch (error) {
      console.error('❌ Error checking sync status:', error);
      return false; // Assume not synced if error
    }
  }

  /**
   * Get pending reports (not yet synced or failed)
   */
  static async getPendingReports(): Promise<OfflineReport[]> {
    try {
      const allReports = await this.getOfflineReports();
      return allReports.filter(report => 
        report.syncStatus === 'pending' || 
        report.syncStatus === 'failed' || 
        !report.syncStatus
      );
    } catch (error) {
      console.error('❌ Error getting pending reports:', error);
      return [];
    }
  }

  /**
   * Clean up old sync metadata (optional housekeeping)
   */
  static async cleanupSyncMetadata(olderThanDays: number = 30): Promise<{ success: boolean; error?: string }> {
    try {
      const metadataJson = await AsyncStorage.getItem(SYNC_METADATA_KEY);
      if (!metadataJson) return { success: true };
      
      const metadata: SyncMetadata[] = JSON.parse(metadataJson);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const cleanedMetadata = metadata.filter(m => {
        if (!m.syncedAt) return true;
        return new Date(m.syncedAt) > cutoffDate;
      });

      await AsyncStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(cleanedMetadata));
      console.log(`✅ Cleaned ${metadata.length - cleanedMetadata.length} old sync metadata entries`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Error cleaning sync metadata:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to clean sync metadata' 
      };
    }
  }
}
