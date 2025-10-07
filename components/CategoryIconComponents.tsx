/**
 * CategoryIcons - SVG Icon Components
 * 
 * Import and use SVG icons as React components
 * Usage example:
 * 
 * import TheftIcon from '../assets/report icons/theft.svg';
 * 
 * <TheftIcon width={24} height={24} fill="#960C12" />
 */

// Import all category SVG icons
import AccidentIcon from '../assets/report icons/accident.svg';
import AlarmIcon from '../assets/report icons/alarm_and_scandal.svg';
import AnimalIcon from '../assets/report icons/animal_incident.svg';
import AssaultIcon from '../assets/report icons/assault.svg';
import DefamationIcon from '../assets/report icons/defamation.svg';
import LostItemsIcon from '../assets/report icons/lost_items.svg';
import OthersIcon from '../assets/report icons/others.svg';
import PropertyDamageIcon from '../assets/report icons/property_damage.svg';
import ScamFraudIcon from '../assets/report icons/scam_fraud.svg';
import TheftIcon from '../assets/report icons/theft.svg';
import UnpaidDebtIcon from '../assets/report icons/unpaid_debt.svg';
import VerbalAbuseIcon from '../assets/report icons/verbal_abuse.svg';

// Export all icons
export {
  AccidentIcon,
  AlarmIcon,
  AnimalIcon,
  AssaultIcon,
  DefamationIcon,
  LostItemsIcon,
  OthersIcon,
  PropertyDamageIcon,
  ScamFraudIcon,
  TheftIcon,
  UnpaidDebtIcon,
  VerbalAbuseIcon,
};

// Category icon mapping for easy access by category name
export const CategoryIconComponents: { [key: string]: React.FC<any> } = {
  'Theft': TheftIcon,
  'Accident': AccidentIcon,
  'Debt / Unpaid Wages Report': UnpaidDebtIcon,
  'Defamation Complaint': DefamationIcon,
  'Assault/Harassment': AssaultIcon,
  'Property Damage/Incident': PropertyDamageIcon,
  'Animal Incident': AnimalIcon,
  'Verbal Abuse and Threats': VerbalAbuseIcon,
  'Alarm and Scandal': AlarmIcon,
  'Lost Items': LostItemsIcon,
  'Scam/Fraud': ScamFraudIcon,
  'Others': OthersIcon,
};

/**
 * Get the icon component for a specific category
 * @param category - The incident category name
 * @returns The corresponding SVG icon component
 */
export const getCategoryIcon = (category: string | undefined) => {
  if (!category || !CategoryIconComponents[category]) {
    return OthersIcon;
  }
  return CategoryIconComponents[category];
};
