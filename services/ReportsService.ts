import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  query,
  where,
  orderBy,
  GeoPoint,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

export interface Report {
  id: string;
  barangay: string;
  dateTime: string;
  description: string;
  title?: string;
  geoLocation: {
    latitude: number;
    longitude: number;
  };
  incidentType: string;
  category?: string;
  isSensitive?: boolean;
  latitude: number;
  longitude: number;
  mediaType: string | null;
  mediaURL: string | null;
  status: string;
  submittedByEmail: string;
  hasMedia: boolean;
}

export interface CreateReportData {
  barangay: string;
  title: string;
  description: string;
  incidentType: string;
  category?: string;
  isSensitive?: boolean;
  latitude: number;
  longitude: number;
  submittedByEmail: string;
  mediaType?: string;
  mediaURL?: string;
}

export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  incidentCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  incidents: Report[];
  radius: number;
  barangay?: string;
}

export class ReportsService {
  
  /**
   * Fetch all reports with geolocation data from Firestore
   */
  static async getAllReports(): Promise<{ success: boolean; data?: Report[]; error?: string }> {
    try {
      console.log('🔄 Connecting to Firestore reports collection...');
      const reportsCollection = collection(firestore, 'reports');
      const querySnapshot = await getDocs(reportsCollection);
      
      console.log(`📊 Found ${querySnapshot.size} documents in reports collection`);
      const reports: Report[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Convert Firestore data to our Report interface
        const geoLat = data.GeoLocation?._lat || data.geoLocation?.latitude || data.Latitude || data.latitude || 0;
        const geoLng = data.GeoLocation?._long || data.geoLocation?.longitude || data.Longitude || data.longitude || 0;
        
        // Extract all possible field variations
        const barangay = data.Barangay || data.barangay || '';
        // Handle Firestore Timestamp objects
        let dateTime = '';
        const rawDateTime = data.DateTime || data.dateTime;
        if (rawDateTime) {
          if (typeof rawDateTime === 'string') {
            dateTime = rawDateTime;
          } else if (rawDateTime.seconds) {
            // Firestore Timestamp object
            dateTime = new Date(rawDateTime.seconds * 1000).toISOString();
          }
        }
        const description = data.Description || data.description || '';
        const title = data.Title || data.title || '';
        const incidentType = data.IncidentType || data.incidentType || '';
        const category = data.Category || data.category || '';
        const isSensitive = data.IsSensitive || data.isSensitive || false;
        const status = data.Status || data.status || 'Pending';
        const submittedByEmail = data.SubmittedByEmail || data.submittedByEmail || '';
        
        const report: Report = {
          id: doc.id,
          barangay: barangay,
          dateTime: dateTime,
          description: description,
          title: title,
          geoLocation: {
            latitude: geoLat,
            longitude: geoLng
          },
          incidentType: incidentType,
          category: category,
          isSensitive: isSensitive,
          latitude: geoLat,
          longitude: geoLng,
          mediaType: data.MediaType || data.mediaType || null,
          mediaURL: data.MediaURL || data.mediaURL || null,
          status: status,
          submittedByEmail: submittedByEmail,
          hasMedia: data.hasMedia || (data.MediaURL || data.mediaURL) ? true : false
        };
        
        console.log(`📍 Processing report ${doc.id}:`, {
          coordinates: `lat=${geoLat}, lng=${geoLng}`,
          barangay: barangay || 'NOT SET',
          title: title || 'NOT SET',
          dateTime: dateTime || 'NOT SET',
          incidentType: incidentType || 'NOT SET',
          status: status || 'NOT SET',
          isSensitive: isSensitive,
          description: description ? description.substring(0, 50) + '...' : 'NOT SET'
        });
        
        // Only include reports that have valid coordinates
        if (report.geoLocation.latitude !== 0 && report.geoLocation.longitude !== 0) {
          reports.push(report);
        } else {
          console.log(`⚠️ Skipping report ${doc.id} - missing coordinates`);
        }
      });
      
      console.log(`Successfully fetched ${reports.length} reports with geolocation data`);
      return {
        success: true,
        data: reports
      };
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch reports'
      };
    }
  }

  /**
   * Fetch reports by status
   */
  static async getReportsByStatus(status: string): Promise<{ success: boolean; data?: Report[]; error?: string }> {
    try {
      const reportsCollection = collection(firestore, 'reports');
      const q = query(reportsCollection, where('Status', '==', status));
      const querySnapshot = await getDocs(q);
      
      const reports: Report[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        const report: Report = {
          id: doc.id,
          barangay: data.Barangay || '',
          dateTime: data.DateTime || '',
          description: data.Description || '',
          geoLocation: {
            latitude: data.GeoLocation?._lat || data.Latitude || 0,
            longitude: data.GeoLocation?._long || data.Longitude || 0
          },
          incidentType: data.IncidentType || '',
          latitude: data.Latitude || data.GeoLocation?._lat || 0,
          longitude: data.Longitude || data.GeoLocation?._long || 0,
          mediaType: data.MediaType || null,
          mediaURL: data.MediaURL || null,
          status: data.Status || 'Pending',
          submittedByEmail: data.SubmittedByEmail || '',
          hasMedia: data.hasMedia || data.MediaURL ? true : false
        };
        
        if (report.geoLocation.latitude !== 0 && report.geoLocation.longitude !== 0) {
          reports.push(report);
        }
      });
      
      return {
        success: true,
        data: reports
      };
    } catch (error: any) {
      console.error('Error fetching reports by status:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch reports'
      };
    }
  }

  /**
   * Get a specific report by ID
   */
  static async getReportById(reportId: string): Promise<{ success: boolean; data?: Report; error?: string }> {
    try {
      const reportDoc = doc(firestore, 'reports', reportId);
      const docSnap = await getDoc(reportDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const report: Report = {
          id: docSnap.id,
          barangay: data.Barangay || '',
          dateTime: data.DateTime || '',
          description: data.Description || '',
          geoLocation: {
            latitude: data.GeoLocation?._lat || data.Latitude || 0,
            longitude: data.GeoLocation?._long || data.Longitude || 0
          },
          incidentType: data.IncidentType || '',
          latitude: data.Latitude || data.GeoLocation?._lat || 0,
          longitude: data.Longitude || data.GeoLocation?._long || 0,
          mediaType: data.MediaType || null,
          mediaURL: data.MediaURL || null,
          status: data.Status || 'Pending',
          submittedByEmail: data.SubmittedByEmail || '',
          hasMedia: data.hasMedia || data.MediaURL ? true : false
        };
        
        return {
          success: true,
          data: report
        };
      } else {
        return {
          success: false,
          error: 'Report not found'
        };
      }
    } catch (error: any) {
      console.error('Error fetching report by ID:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch report'
      };
    }
  }

  /**
   * Create a new report
   */
  static async createReport(reportData: CreateReportData): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      console.log('🔄 Creating report in Firestore with data:', reportData);
      
      const newReport = {
        Barangay: reportData.barangay,
        Title: reportData.title,
        Description: reportData.description,
        IncidentType: reportData.incidentType,
        Category: reportData.category || 'Others',
        IsSensitive: reportData.isSensitive || false,
        GeoLocation: new GeoPoint(reportData.latitude, reportData.longitude),
        Latitude: reportData.latitude,
        Longitude: reportData.longitude,
        SubmittedByEmail: reportData.submittedByEmail,
        Status: 'Pending',
        DateTime: new Date().toISOString(),
        MediaType: reportData.mediaType || null,
        MediaURL: reportData.mediaURL || null,
        hasMedia: reportData.mediaURL ? true : false,
        createdAt: Timestamp.now()
      };
      
      console.log('📝 Attempting to add document to Firestore reports collection...');
      const docRef = await addDoc(collection(firestore, 'reports'), newReport);
      console.log('✅ Document successfully created with ID:', docRef.id);
      
      return {
        success: true,
        reportId: docRef.id
      };
    } catch (error: any) {
      console.error('❌ Error creating report:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide more specific error messages based on error code
      let errorMessage = error.message || 'Failed to create report';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Database is currently unavailable. Please try again.';
      } else if (error.code === 'failed-precondition') {
        errorMessage = 'Database configuration issue. Please contact support.';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Fetch reports within a geographic radius (for nearby reports)
   * Note: This is a simple implementation. For production, consider using GeoFirestore for more efficient geo queries.
   */
  static async getReportsNearLocation(
    centerLat: number, 
    centerLng: number, 
    radiusKm: number = 10
  ): Promise<{ success: boolean; data?: Report[]; error?: string }> {
    try {
      const allReportsResult = await this.getAllReports();
      
      if (!allReportsResult.success || !allReportsResult.data) {
        return allReportsResult;
      }
      
      // Filter reports within radius using Haversine formula
      const nearbyReports = allReportsResult.data.filter(report => {
        const distance = this.calculateDistance(
          centerLat, centerLng,
          report.geoLocation.latitude, report.geoLocation.longitude
        );
        return distance <= radiusKm;
      });
      
      return {
        success: true,
        data: nearbyReports
      };
    } catch (error: any) {
      console.error('Error fetching nearby reports:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch nearby reports'
      };
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Calculate hotspots for all barangays or a specific barangay
   */
  static async calculateHotspots(targetBarangay?: string): Promise<{ success: boolean; data?: Hotspot[]; error?: string }> {
    try {
      console.log('🔥 Calculating hotspots...', targetBarangay ? `for ${targetBarangay}` : 'for all areas');
      
      // Get all reports first
      const reportsResult = await this.getAllReports();
      if (!reportsResult.success || !reportsResult.data) {
        return {
          success: false,
          error: 'Failed to fetch reports for hotspot calculation'
        };
      }

      // Filter verified reports for the specific barangay (or all if no barangay specified)
      // Only include reports from the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const filteredReports = reportsResult.data.filter(r => {
        if (r.status !== "Verified") return false;
        if (r.geoLocation.latitude === 0 || r.geoLocation.longitude === 0) return false;
        if (targetBarangay && r.barangay !== targetBarangay) return false;
        
        // Check if report is within last 30 days
        try {
          const reportDate = new Date(r.dateTime);
          return reportDate >= thirtyDaysAgo;
        } catch (e) {
          console.warn('⚠️ Invalid date format for report:', r.id);
          return false;
        }
      });

      console.log(`📊 Found ${filteredReports.length} verified reports for hotspot analysis`);

      const gridSize = 0.001; // Grid size for clustering incidents
      const locations: { [key: string]: { lat: number; lng: number; incidents: Report[]; count: number; barangay?: string } } = {};
      
      // Group incidents by grid coordinates
      filteredReports.forEach(report => {
        const gridLat = Math.floor(report.geoLocation.latitude / gridSize) * gridSize;
        const gridLng = Math.floor(report.geoLocation.longitude / gridSize) * gridSize;
        const key = `${gridLat.toFixed(3)}_${gridLng.toFixed(3)}`;
        
        if (!locations[key]) {
          locations[key] = {
            lat: gridLat + (gridSize / 2), 
            lng: gridLng + (gridSize / 2),
            incidents: [],
            count: 0,
            barangay: report.barangay
          };
        }
        
        locations[key].incidents.push(report);
        locations[key].count++;
      });

      const hotspotThreshold = 2; // Minimum incidents to be considered a hotspot
      const calculatedHotspots: Hotspot[] = Object.entries(locations)
        .filter(([_, location]) => location.count >= hotspotThreshold)
        .map(([key, location]) => {
          const riskLevel: 'low' | 'medium' | 'high' = location.count >= 5 ? 'high' : location.count >= 3 ? 'medium' : 'low';
          return {
            id: key,
            lat: location.lat,
            lng: location.lng,
            incidentCount: location.count,
            riskLevel: riskLevel,
            incidents: location.incidents,
            radius: Math.max(50, Math.min(Math.sqrt(location.count) * 60, 150)),
            barangay: location.barangay
          };
        })
        .sort((a, b) => b.incidentCount - a.incidentCount);

      console.log(`🔥 Found ${calculatedHotspots.length} hotspots:`, {
        high: calculatedHotspots.filter(h => h.riskLevel === 'high').length,
        medium: calculatedHotspots.filter(h => h.riskLevel === 'medium').length,
        low: calculatedHotspots.filter(h => h.riskLevel === 'low').length
      });

      return {
        success: true,
        data: calculatedHotspots
      };
    } catch (error: any) {
      console.error('Error calculating hotspots:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate hotspots'
      };
    }
  }

  /**
   * Calculate hotspots for a specific barangay
   */
  static async calculateBarangayHotspots(targetBarangay: string): Promise<{ success: boolean; data?: Hotspot[]; error?: string }> {
    return this.calculateHotspots(targetBarangay);
  }

  /**
   * Subscribe to real-time reports updates
   * Returns an unsubscribe function to stop listening
   */
  static subscribeToReports(
    onUpdate: (reports: Report[]) => void,
    onError?: (error: string) => void
  ): () => void {
    try {
      console.log('🔄 Setting up real-time reports listener...');
      const reportsCollection = collection(firestore, 'reports');
      
      const unsubscribe = onSnapshot(
        reportsCollection,
        (snapshot) => {
          console.log(`📊 Real-time update: ${snapshot.size} documents in reports collection`);
          const reports: Report[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convert Firestore data to our Report interface
            const geoLat = data.GeoLocation?._lat || data.geoLocation?.latitude || data.Latitude || data.latitude || 0;
            const geoLng = data.GeoLocation?._long || data.geoLocation?.longitude || data.Longitude || data.longitude || 0;
            
            // Extract all possible field variations
            const barangay = data.Barangay || data.barangay || '';
            // Handle Firestore Timestamp objects
            let dateTime = '';
            const rawDateTime = data.DateTime || data.dateTime;
            if (rawDateTime) {
              if (typeof rawDateTime === 'string') {
                dateTime = rawDateTime;
              } else if (rawDateTime.seconds) {
                // Firestore Timestamp object
                dateTime = new Date(rawDateTime.seconds * 1000).toISOString();
              }
            }
            const description = data.Description || data.description || '';
            const title = data.Title || data.title || '';
            const incidentType = data.IncidentType || data.incidentType || '';
            const status = data.Status || data.status || 'Pending';
            const submittedByEmail = data.SubmittedByEmail || data.submittedByEmail || '';
            
            const report: Report = {
              id: doc.id,
              barangay: barangay,
              dateTime: dateTime,
              description: description,
              title: title,
              geoLocation: {
                latitude: geoLat,
                longitude: geoLng
              },
              incidentType: incidentType,
              category: data.Category || data.category,
              isSensitive: data.IsSensitive || data.isSensitive || false,
              latitude: geoLat,
              longitude: geoLng,
              mediaType: data.MediaType || data.mediaType || null,
              mediaURL: data.MediaURL || data.mediaURL || null,
              status: status,
              submittedByEmail: submittedByEmail,
              hasMedia: data.hasMedia || (data.MediaURL || data.mediaURL) ? true : false
            };
            
            // Only include reports that have valid coordinates
            if (report.geoLocation.latitude !== 0 && report.geoLocation.longitude !== 0) {
              reports.push(report);
            }
          });
          
          console.log(`✅ Real-time update processed: ${reports.length} reports with valid coordinates`);
          onUpdate(reports);
        },
        (error) => {
          console.error('❌ Real-time listener error:', error);
          if (onError) {
            onError(error.message || 'Failed to listen to reports updates');
          }
        }
      );
      
      console.log('✅ Real-time reports listener set up successfully');
      return unsubscribe;
    } catch (error: any) {
      console.error('❌ Error setting up real-time listener:', error);
      if (onError) {
        onError(error.message || 'Failed to set up real-time listener');
      }
      // Return a no-op function if setup fails
      return () => {};
    }
  }
}
