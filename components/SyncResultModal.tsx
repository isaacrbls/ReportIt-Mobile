import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface SyncResultModalProps {
  visible: boolean;
  onClose: () => void;
  successCount: number;
  failedCount: number;
  syncTimestamp: string;
  failedReports?: Array<{
    title: string;
    error: string;
  }>;
}

export const SyncResultModal: React.FC<SyncResultModalProps> = ({
  visible,
  onClose,
  successCount,
  failedCount,
  syncTimestamp,
  failedReports = [],
}) => {
  const totalReports = successCount + failedCount;
  const hasFailures = failedCount > 0;
  const allSucceeded = successCount > 0 && failedCount === 0;

  // Format timestamp
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={[styles.header, hasFailures && styles.headerWarning]}>
            <FontAwesome
              name={allSucceeded ? 'check-circle' : hasFailures ? 'exclamation-triangle' : 'info-circle'}
              size={48}
              color="white"
              style={styles.icon}
            />
            <Text style={styles.headerTitle}>
              {allSucceeded ? 'Sync Successful!' : hasFailures ? 'Sync Partially Complete' : 'Sync Complete'}
            </Text>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                {allSucceeded
                  ? `All ${successCount} ${successCount === 1 ? 'report' : 'reports'} successfully submitted to the server.`
                  : hasFailures
                  ? `${successCount} of ${totalReports} ${totalReports === 1 ? 'report' : 'reports'} successfully submitted.`
                  : 'No reports were synced.'}
              </Text>
            </View>

            {/* Success Count */}
            {successCount > 0 && (
              <View style={styles.statRow}>
                <View style={styles.statIconContainer}>
                  <FontAwesome name="check" size={18} color="#10B981" />
                </View>
                <Text style={styles.statLabel}>Successfully Submitted:</Text>
                <Text style={styles.statValue}>{successCount}</Text>
              </View>
            )}

            {/* Failed Count */}
            {failedCount > 0 && (
              <View style={styles.statRow}>
                <View style={[styles.statIconContainer, styles.errorIconContainer]}>
                  <FontAwesome name="times" size={18} color="#EF4444" />
                </View>
                <Text style={styles.statLabel}>Failed:</Text>
                <Text style={[styles.statValue, styles.errorValue]}>{failedCount}</Text>
              </View>
            )}

            {/* Timestamp */}
            <View style={styles.timestampContainer}>
              <FontAwesome name="clock-o" size={14} color="#6B7280" />
              <Text style={styles.timestampText}>{formatTimestamp(syncTimestamp)}</Text>
            </View>

            {/* Failed Reports Details */}
            {failedReports.length > 0 && (
              <View style={styles.failedReportsContainer}>
                <Text style={styles.failedReportsTitle}>Failed Reports:</Text>
                {failedReports.map((report, index) => (
                  <View key={index} style={styles.failedReportItem}>
                    <FontAwesome name="file-text-o" size={14} color="#EF4444" style={styles.failedReportIcon} />
                    <View style={styles.failedReportContent}>
                      <Text style={styles.failedReportTitle} numberOfLines={1}>
                        {report.title}
                      </Text>
                      <Text style={styles.failedReportError} numberOfLines={2}>
                        {report.error}
                      </Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.retryNote}>
                  These reports will be automatically retried when you're online.
                </Text>
              </View>
            )}

            {/* Success Message */}
            {allSucceeded && (
              <View style={styles.successMessageContainer}>
                <Text style={styles.successMessage}>
                  Your reports are now visible on the map and will be reviewed by administrators.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>Got it!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: Math.min(screenWidth - 40, 450),
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    backgroundColor: '#10B981',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerWarning: {
    backgroundColor: '#F59E0B',
  },
  icon: {
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    maxHeight: 400,
  },
  contentContainer: {
    padding: 20,
  },
  summaryContainer: {
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  errorIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  statLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  errorValue: {
    color: '#EF4444',
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  timestampText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 6,
  },
  failedReportsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  failedReportsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 12,
  },
  failedReportItem: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  failedReportIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  failedReportContent: {
    flex: 1,
  },
  failedReportTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  failedReportError: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  retryNote: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  successMessageContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  successMessage: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 18,
  },
  closeButton: {
    backgroundColor: '#960C12',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
