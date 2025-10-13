/**
 * Category Icons - Maps incident categories to their corresponding SVG files
 * SVGs are loaded from the assets/report icons folder
 */

export const CATEGORY_ICON_FILES: { [key: string]: any } = {
  'Theft': require('../assets/report icons/theft.svg'),
  'Reports/Agreement': require('../assets/report icons/report⁄agreement.svg'),
  'Accident': require('../assets/report icons/accident.svg'),
  'Debt / Unpaid Wages Report': require('../assets/report icons/unpaid_debt.svg'),
  'Defamation Complaint': require('../assets/report icons/defamation.svg'),
  'Assault/Harassment': require('../assets/report icons/assault.svg'),
  'Property Damage/Incident': require('../assets/report icons/property_damage.svg'),
  'Animal Incident': require('../assets/report icons/animal_incident.svg'),
  'Verbal Abuse and Threats': require('../assets/report icons/verbal_abuse.svg'),
  'Alarm and Scandal': require('../assets/report icons/alarm_and_scandal.svg'),
  'Lost Items': require('../assets/report icons/lost_items.svg'),
  'Scam/Fraud': require('../assets/report icons/scam_fraud.svg'),
  'Others': require('../assets/report icons/others.svg'),
};

export const CATEGORY_DISPLAY_NAMES: { [key: string]: string } = {
  'Theft': 'Theft',
  'Reports/Agreement': 'Reports/Agreement',
  'Accident': 'Accident',
  'Debt / Unpaid Wages Report': 'Debt / Unpaid Wages',
  'Defamation Complaint': 'Defamation',
  'Assault/Harassment': 'Assault/Harassment',
  'Property Damage/Incident': 'Property Damage',
  'Animal Incident': 'Animal Incident',
  'Verbal Abuse and Threats': 'Verbal Abuse',
  'Alarm and Scandal': 'Alarm and Scandal',
  'Lost Items': 'Lost Items',
  'Scam/Fraud': 'Scam/Fraud',
  'Drugs Addiction': 'Drugs',
  'Missing Person': 'Missing Person',
  'Others': 'Others',
};
