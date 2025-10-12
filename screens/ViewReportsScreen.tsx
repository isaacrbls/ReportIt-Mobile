import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  RefreshControl,
  Alert,
  StatusBar,
  Platform,
  Modal,
  Image,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { ReportsService, Report } from '../services/ReportsService';
import { useAuth } from '../services/AuthContext';
import { NavigationHelper } from '../utils/NavigationHelper';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

const statusOrder = ['Pending', 'Verified', 'Rejected'] as const;
type StatusKey = typeof statusOrder[number];

export default function ViewReportsScreen() {
  const navigation = useNavigation<any>();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Back handling per NavigationHelper rules
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      const handled = NavigationHelper.handleBackNavigation(
        navigation,
        'ViewReports',
        NavigationHelper.createContext('ViewReports', 'Map')
      );
      return handled ? true : false;
    });
    return () => sub.remove();
  }, [navigation]);

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setLoading(false);
      return;
    }

    // Subscribe to user's reports for live updates
    const unsubscribe = ReportsService.onUserReportsSnapshot(user.email, (items) => {
      setReports(items);
      setLoading(false);
    }, (e) => {
      setError(e || 'Failed to load your reports');
      setLoading(false);
    });

    return () => {
      try { unsubscribe && unsubscribe(); } catch {}
    };
  }, [isAuthenticated, user?.email]);

  const onRefresh = async () => {
    if (!user?.email) return;
    setRefreshing(true);
    const res = await ReportsService.getReportsByUser(user.email);
    if (res.success && res.data) {
      setReports(res.data);
      setError(null);
    } else {
      setError(res.error || 'Failed to refresh reports');
    }
    setRefreshing(false);
  };

  const grouped = useMemo(() => {
    const g: Record<StatusKey, Report[]> = {
      Pending: [],
      Verified: [],
      Rejected: [],
    };
    reports.forEach((r) => {
      const key = (r.status || 'Pending') as StatusKey;
      if (g[key]) g[key].push(r);
    });
    return g;
  }, [reports]);

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso.replace(' UTC', '').replace('T', ' '));
      return (
        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' ' +
        d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    } catch {
      return iso;
    }
  };

  const deleteReport = (report: Report) => {
    if (report.status !== 'Pending') return;
    Alert.alert(
      'Delete report',
      'Are you sure you want to delete this pending report?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await ReportsService.deleteReportIfPending(report.id);
            if (!res.success) {
              Alert.alert('Unable to delete', res.error || 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const openReportDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailModalVisible(true);
  };

  const openImageViewer = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageViewerVisible(true);
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            NavigationHelper.handleBackNavigation(
              navigation,
              'ViewReports',
              NavigationHelper.createContext('ViewReports', 'Map')
            );
          }}
          style={styles.headerBtn}
        >
          <FontAwesome name="chevron-left" size={18} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Reports</Text>
        <View style={styles.headerSpacer} />
      </View>

      {!isAuthenticated ? (
        <View style={styles.centerBox}>
          <Text style={styles.infoText}>Please log in to view your reports.</Text>
        </View>
      ) : loading ? (
        <View style={styles.centerBox}>
          <Text style={styles.infoText}>Loading…</Text>
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {statusOrder.map((status) => {
            const items = grouped[status];
            return (
              <View key={status} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{status}</Text>
                  <Text style={styles.sectionCount}>{items.length}</Text>
                </View>
                {items.length === 0 ? (
                  <Text style={styles.emptyText}>No {status.toLowerCase()} reports.</Text>
                ) : (
                  items.map((r) => (
                    <TouchableOpacity key={r.id} style={styles.card} onPress={() => openReportDetail(r)}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardTitle} numberOfLines={1}>
                          {r.title || 'Untitled Report'}
                        </Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>
                          <FontAwesome name="map-marker" /> {r.barangay || 'Unknown'}
                        </Text>
                        <Text style={styles.cardMeta} numberOfLines={1}>
                          <FontAwesome name="calendar" /> {formatDate(r.dateTime)}
                        </Text>
                        <Text style={styles.cardDesc} numberOfLines={2}>
                          {r.description || 'No description.'}
                        </Text>
                      </View>
                      <View style={styles.cardActions}>
                        <View
                          style={[
                            styles.statusChip,
                            status === 'Pending'
                              ? styles.pendingChip
                              : status === 'Verified'
                              ? styles.verifiedChip
                              : styles.rejectedChip,
                          ]}
                        >
                          <Text style={styles.chipText}>{status}</Text>
                        </View>
                        {status === 'Pending' ? (
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={(e) => {
                              e.stopPropagation();
                              deleteReport(r);
                            }}
                          >
                            <FontAwesome name="trash" size={16} color="#fff" />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Report Detail Modal */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedReport && (
                <>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Report Details</Text>
                    <TouchableOpacity
                      onPress={() => setDetailModalVisible(false)}
                      style={styles.modalCloseBtn}
                    >
                      <FontAwesome name="times" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.detailStatusBadge,
                      selectedReport.status === 'Pending'
                        ? styles.pendingChip
                        : selectedReport.status === 'Verified'
                        ? styles.verifiedChip
                        : styles.rejectedChip,
                    ]}
                  >
                    <Text style={styles.detailStatusText}>{selectedReport.status || 'Pending'}</Text>
                  </View>

                  {/* Title */}
                  <Text style={styles.detailTitle}>{selectedReport.title || 'Untitled Report'}</Text>

                  {/* Meta Info */}
                  <View style={styles.detailMeta}>
                    <View style={styles.detailMetaRow}>
                      <FontAwesome name="exclamation-triangle" size={16} color="#EF4444" />
                      <Text style={styles.detailMetaText}>
                        {selectedReport.incidentType || 'Unknown Type'}
                      </Text>
                    </View>
                    <View style={styles.detailMetaRow}>
                      <FontAwesome name="map-marker" size={16} color="#EF4444" />
                      <Text style={styles.detailMetaText}>
                        {selectedReport.barangay || 'Unknown Location'}
                      </Text>
                    </View>
                    <View style={styles.detailMetaRow}>
                      <FontAwesome name="calendar" size={16} color="#EF4444" />
                      <Text style={styles.detailMetaText}>{formatDate(selectedReport.dateTime)}</Text>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Description</Text>
                    <Text style={styles.detailDescription}>
                      {selectedReport.description || 'No description provided.'}
                    </Text>
                  </View>

                  {/* Media Attachments */}
                  {selectedReport.mediaURL && selectedReport.mediaURL.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Media Attachments</Text>
                      <View style={styles.mediaGrid}>
                        {selectedReport.mediaURL.split(';').map((url, index) => {
                          const isVideo = url.includes('video') || url.includes('.mp4') || url.includes('.mov');
                          return (
                            <TouchableOpacity
                              key={index}
                              style={styles.mediaThumbnail}
                              onPress={() => !isVideo && openImageViewer(url)}
                            >
                              {isVideo ? (
                                <View style={styles.videoPlaceholder}>
                                  <FontAwesome name="play-circle" size={32} color="#ffffff" />
                                  <Text style={styles.videoText}>Video</Text>
                                </View>
                              ) : (
                                <Image source={{ uri: url }} style={styles.thumbnailImage} resizeMode="cover" />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={imageViewerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity
            style={styles.imageViewerCloseBtn}
            onPress={() => setImageViewerVisible(false)}
          >
            <FontAwesome name="times-circle" size={36} color="#ffffff" />
          </TouchableOpacity>
          {selectedImageUrl && (
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 12 : 50,
    paddingBottom: 12,
    backgroundColor: '#EF4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerBtn: { padding: 8 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
  },
  headerSpacer: { width: 32 },
  centerBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  infoText: { color: '#6B7280', fontFamily: 'Poppins_400Regular' },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    margin: 16,
    borderRadius: 8,
    padding: 12,
  },
  errorText: { color: '#991B1B', fontFamily: 'Poppins_400Regular' },
  section: { paddingHorizontal: 16, paddingTop: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { flex: 1, fontFamily: 'Poppins_600SemiBold', color: '#111827', fontSize: 14 },
  sectionCount: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    textAlign: 'center',
    color: '#374151',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
  emptyText: { color: '#6B7280', fontFamily: 'Poppins_400Regular', marginBottom: 8 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: { fontFamily: 'Poppins_600SemiBold', color: '#111827', fontSize: 14 },
  cardMeta: { fontFamily: 'Poppins_400Regular', color: '#4B5563', marginTop: 2 },
  cardDesc: { fontFamily: 'Poppins_400Regular', color: '#6B7280', marginTop: 6, fontSize: 12 },
  cardActions: { marginLeft: 10, alignItems: 'flex-end', justifyContent: 'space-between' },
  statusChip: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  chipText: { color: '#fff', fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  pendingChip: { backgroundColor: '#F59E0B' },
  verifiedChip: { backgroundColor: '#22C55E' },
  rejectedChip: { backgroundColor: '#DC2626' },
  deleteBtn: {
    marginTop: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
  },
  modalCloseBtn: {
    padding: 8,
  },
  detailStatusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginHorizontal: 20,
    marginTop: 16,
  },
  detailStatusText: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 13,
  },
  detailTitle: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    color: '#111827',
    marginHorizontal: 20,
    marginTop: 16,
  },
  detailMeta: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailMetaText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4B5563',
  },
  detailSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#111827',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 12,
  },
  mediaThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    marginTop: 4,
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  // Full screen image viewer
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});
