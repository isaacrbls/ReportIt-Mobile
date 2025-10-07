/**
 * Ready-to-Use Font Awesome Icon Components
 * 
 * Import these components into your screens to easily use Font Awesome icons
 * Example: import { LoginIcon, PasswordIcon, EmailIcon } from './components/IconComponents';
 */

import React from 'react';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

// ============================================================================
// AUTHENTICATION ICONS
// ============================================================================

export const ShieldIcon = ({ size = 24, color = "#EF4444", solid = true }) => (
  <FontAwesome5 name="shield-alt" size={size} color={color} solid={solid} />
);

export const LockIcon = ({ size = 24, color = "#6B7280", solid = false }) => (
  <FontAwesome5 name="lock" size={size} color={color} solid={solid} />
);

export const UnlockIcon = ({ size = 24, color = "#6B7280", solid = false }) => (
  <FontAwesome5 name="unlock" size={size} color={color} solid={solid} />
);

export const EyeIcon = ({ size = 20, color = "#6B7280" }) => (
  <FontAwesome name="eye" size={size} color={color} />
);

export const EyeOffIcon = ({ size = 20, color = "#6B7280" }) => (
  <FontAwesome name="eye-slash" size={size} color={color} />
);

export const CheckIcon = ({ size = 16, color = "#FFF" }) => (
  <FontAwesome name="check" size={size} color={color} />
);

export const CheckCircleIcon = ({ size = 24, color = "#28a745" }) => (
  <FontAwesome name="check-circle" size={size} color={color} />
);

export const TimesCircleIcon = ({ size = 24, color = "#dc3545" }) => (
  <FontAwesome name="times-circle" size={size} color={color} />
);

// ============================================================================
// USER & PROFILE ICONS
// ============================================================================

export const UserIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="user" size={size} color={color} />
);

export const UserCircleIcon = ({ size = 24, color = "#960C12", solid = true }) => (
  <FontAwesome5 name="user-circle" size={size} color={color} solid={solid} />
);

export const UsersIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="users" size={size} color={color} />
);

export const EditIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="edit" size={size} color={color} />
);

// ============================================================================
// COMMUNICATION ICONS
// ============================================================================

export const EmailIcon = ({ size = 20, color = "#6B7280" }) => (
  <FontAwesome name="envelope" size={size} color={color} />
);

export const PhoneIcon = ({ size = 20, color = "#6B7280" }) => (
  <FontAwesome name="phone" size={size} color={color} />
);

export const BellIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="bell" size={size} color={color} />
);

export const CommentIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="comment" size={size} color={color} />
);

// ============================================================================
// NAVIGATION ICONS
// ============================================================================

export const ArrowLeftIcon = ({ size = 24, color = "#333" }) => (
  <FontAwesome name="arrow-left" size={size} color={color} />
);

export const ArrowRightIcon = ({ size = 24, color = "#333" }) => (
  <FontAwesome name="arrow-right" size={size} color={color} />
);

export const ChevronLeftIcon = ({ size = 24, color = "#333" }) => (
  <FontAwesome5 name="chevron-left" size={size} color={color} />
);

export const ChevronRightIcon = ({ size = 24, color = "#333" }) => (
  <FontAwesome5 name="chevron-right" size={size} color={color} />
);

export const HomeIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="home" size={size} color={color} solid={solid} />
);

// ============================================================================
// MEDIA ICONS
// ============================================================================

export const CameraIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="camera" size={size} color={color} />
);

export const ImageIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="image" size={size} color={color} />
);

export const VideoIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="video-camera" size={size} color={color} />
);

export const DownloadIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="download" size={size} color={color} />
);

export const UploadIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="upload" size={size} color={color} />
);

// ============================================================================
// LOCATION & MAP ICONS
// ============================================================================

export const MapIcon = ({ size = 24, color = "#960C12", solid = true }) => (
  <FontAwesome5 name="map-marked-alt" size={size} color={color} solid={solid} />
);

export const MapMarkerIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="map-marker" size={size} color={color} />
);

export const LocationIcon = ({ size = 24, color = "#960C12", solid = true }) => (
  <FontAwesome5 name="map-marker-alt" size={size} color={color} solid={solid} />
);

export const CompassIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="compass" size={size} color={color} />
);

// ============================================================================
// INCIDENT CATEGORY ICONS (Matching MapScreen Categories)
// ============================================================================

export const TheftIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="money-bill-wave" size={size} color={color} solid={solid} />
);

export const AccidentIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="car-crash" size={size} color={color} solid={solid} />
);

export const DebtIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="dollar-sign" size={size} color={color} solid={solid} />
);

export const DefamationIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="comment-slash" size={size} color={color} solid={solid} />
);

export const AssaultIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="hand-rock" size={size} color={color} solid={solid} />
);

export const PropertyDamageIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="home" size={size} color={color} solid={solid} />
);

export const AnimalIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="paw" size={size} color={color} solid={solid} />
);

export const VerbalAbuseIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="bullhorn" size={size} color={color} solid={solid} />
);

export const AlarmIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="exclamation-triangle" size={size} color={color} solid={solid} />
);

export const LostItemsIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="search" size={size} color={color} solid={solid} />
);

export const ScamIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="shield-alt" size={size} color={color} solid={solid} />
);

export const DrugsIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="pills" size={size} color={color} solid={solid} />
);

export const MissingPersonIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="user-slash" size={size} color={color} solid={solid} />
);

export const ReportIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="file-alt" size={size} color={color} solid={solid} />
);

export const OthersIcon = ({ size = 24, color = "#960C12", solid = false }) => (
  <FontAwesome5 name="ellipsis-h" size={size} color={color} solid={solid} />
);

// ============================================================================
// STATUS & ALERTS ICONS
// ============================================================================

export const SuccessIcon = ({ size = 50, color = "#28a745" }) => (
  <FontAwesome name="check-circle" size={size} color={color} />
);

export const ErrorIcon = ({ size = 50, color = "#dc3545" }) => (
  <FontAwesome name="times-circle" size={size} color={color} />
);

export const WarningIcon = ({ size = 50, color = "#ffc107", solid = true }) => (
  <FontAwesome5 name="exclamation-triangle" size={size} color={color} solid={solid} />
);

export const InfoIcon = ({ size = 24, color = "#17a2b8" }) => (
  <FontAwesome name="info-circle" size={size} color={color} />
);

// ============================================================================
// ACTION ICONS
// ============================================================================

export const PlusIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="plus" size={size} color={color} />
);

export const MinusIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="minus" size={size} color={color} />
);

export const TimesIcon = ({ size = 24, color = "#dc3545" }) => (
  <FontAwesome name="times" size={size} color={color} />
);

export const SearchIcon = ({ size = 24, color = "#6B7280" }) => (
  <FontAwesome name="search" size={size} color={color} />
);

export const FilterIcon = ({ size = 24, color = "#6B7280" }) => (
  <FontAwesome name="filter" size={size} color={color} />
);

export const RefreshIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="refresh" size={size} color={color} />
);

export const TrashIcon = ({ size = 24, color = "#dc3545" }) => (
  <FontAwesome name="trash" size={size} color={color} />
);

// ============================================================================
// SETTINGS & PREFERENCES ICONS
// ============================================================================

export const SettingsIcon = ({ size = 24, color = "#960C12" }) => (
  <FontAwesome name="cog" size={size} color={color} />
);

export const MenuIcon = ({ size = 24, color = "#333" }) => (
  <FontAwesome name="bars" size={size} color={color} />
);

export const DotsVerticalIcon = ({ size = 24, color = "#333" }) => (
  <FontAwesome name="ellipsis-v" size={size} color={color} />
);

export const DotsHorizontalIcon = ({ size = 24, color = "#333" }) => (
  <FontAwesome name="ellipsis-h" size={size} color={color} />
);

// ============================================================================
// FILE & DOCUMENT ICONS
// ============================================================================

export const FileIcon = ({ size = 24, color = "#6B7280" }) => (
  <FontAwesome name="file" size={size} color={color} />
);

export const FileTextIcon = ({ size = 24, color = "#6B7280", solid = false }) => (
  <FontAwesome5 name="file-alt" size={size} color={color} solid={solid} />
);

export const FolderIcon = ({ size = 24, color = "#6B7280" }) => (
  <FontAwesome name="folder" size={size} color={color} />
);

export const ClipboardIcon = ({ size = 24, color = "#6B7280" }) => (
  <FontAwesome name="clipboard" size={size} color={color} />
);

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * HOW TO USE THESE COMPONENTS:
 * 
 * 1. Import the icons you need:
 *    import { ShieldIcon, EmailIcon, EyeIcon } from './components/IconComponents';
 * 
 * 2. Use them in your JSX:
 *    <ShieldIcon size={80} color="#EF4444" />
 *    <EmailIcon size={20} color="#6B7280" />
 *    <EyeIcon size={20} color="#6B7280" />
 * 
 * 3. All props are optional and have default values
 * 
 * 4. For LoginScreen.tsx example:
 *    // Logo
 *    <ShieldIcon size={80} color="#EF4444" solid />
 *    
 *    // Password Toggle
 *    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
 *    
 *    // Checkbox
 *    {rememberMe && <CheckIcon size={16} color="#FFF" />}
 */
