# Incident Type Icon Mapping

This document describes the dynamic icon system for map markers in ReportIt Mobile app.

## Color Scheme
All incident markers use the color: **#960C12** (deep red)

## Icon Design
- **Shape**: Teardrop/pin shape with white background
- **Border**: 3px solid #960C12
- **Icon Color**: #960C12
- **Size**: 36x44 pixels
- **Shadow**: 0 4px 10px rgba(0,0,0,0.3)

## Incident Type to Font Awesome Icon Mapping

### Theft-Related
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Theft | User Secret (spy) | `fa-user-secret` |
| Robbery | Gun | `fa-gun` |
| Burglary | Cracked House | `fa-house-crack` |
| Pickpocket | Wallet | `fa-wallet` |
| Shoplifting | Shop with Slash | `fa-shop-slash` |

### Accident-Related
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Accident | Car Burst | `fa-car-burst` |
| Car Accident | Car Crash | `fa-car-crash` |
| Traffic Accident | Traffic Light | `fa-traffic-light` |
| Motorcycle Accident | Motorcycle | `fa-motorcycle` |

### Assault/Violence
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Assault/Harassment | Fist | `fa-hand-fist` |
| Assault | Back Fist | `fa-hand-back-fist` |
| Physical Violence | Injured User | `fa-user-injured` |
| Harassment | Person Harassing | `fa-person-harassing` |

### Property Damage
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Property Damage/Incident | House Damage | `fa-house-damage` |
| Vandalism | Spray Can | `fa-spray-can` |
| Arson | Fire Flame | `fa-fire-flame-curved` |

### Animal Incident
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Animal Incident | Shield Dog | `fa-shield-dog` |
| Dog Attack | Dog | `fa-dog` |
| Stray Animals | Cats | `fa-cats` |

### Verbal Abuse
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Verbal Abuse and Threats | Message Slash | `fa-message-slash` |
| Bullying | User with Slash | `fa-user-large-slash` |
| Threats | Skull Crossbones | `fa-skull-crossbones` |

### Public Disturbance
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Alarm and Scandal | Bell | `fa-bell` |
| Public Disturbance | Megaphone | `fa-megaphone` |
| Noise Complaint | Volume Muted | `fa-volume-xmark` |

### Lost Items
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Lost Items | Magnifying Glass | `fa-magnifying-glass` |
| Lost ID | ID Card | `fa-id-card-clip` |
| Lost Wallet | Wallet | `fa-wallet` |
| Lost Keys | Key | `fa-key` |

### Scam/Fraud
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Scam/Fraud | Ninja | `fa-user-ninja` |
| Online Scam | Credit Card | `fa-credit-card` |
| Identity Theft | Fingerprint | `fa-fingerprint` |

### Drugs
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Drugs Addiction | Syringe | `fa-syringe` |
| Drugs | Pills | `fa-pills` |

### Missing Person
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Missing Person | Person with Question | `fa-person-circle-question` |
| Kidnapping | Locked User | `fa-user-lock` |

### Debt/Financial
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Debt / Unpaid Wages Report | Money Transfer | `fa-money-bill-transfer` |
| Unpaid Debt | Hand Holding Dollar | `fa-hand-holding-dollar` |

### Legal
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Defamation Complaint | Gavel | `fa-gavel` |
| Reports/Agreement | File Contract | `fa-file-contract` |

### Default/Others
| Incident Type | Font Awesome Icon | Icon Class |
|--------------|-------------------|------------|
| Others | Info Circle | `fa-circle-info` |
| Unknown/Fallback | Exclamation Triangle | `fa-exclamation-triangle` |

## Implementation Details

### JavaScript Functions (in WebView)

```javascript
// Function to get icon for incident type
function getIncidentIcon(incidentType) {
    var icon = incidentTypeIcons[incidentType] || 'fa-exclamation-triangle';
    return icon;
}

// Function to create custom icon based on incident type
function createIncidentIcon(incidentType) {
    var iconClass = getIncidentIcon(incidentType);
    return L.divIcon({
        html: '<div style="position: relative; width: 36px; height: 44px;">' +
              '<div style="width: 36px; height: 36px; background: white; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid #960C12; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; position: absolute; top: 0; left: 0;">' +
              '<div style="transform: rotate(45deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">' +
              '<i class="fas ' + iconClass + '" style="font-size: 18px; color: #960C12;"></i>' +
              '</div>' +
              '</div>' +
              '</div>',
        iconSize: [36, 44],
        iconAnchor: [18, 40],
        popupAnchor: [0, -36],
        className: 'custom-report-pin'
    });
}
```

### Usage

When creating markers, the system automatically reads the `incidentType` from the database and creates the appropriate icon:

```javascript
L.marker([latitude, longitude], {
    icon: createIncidentIcon('Theft') // Reads from report.incidentType
})
```

## Adding New Incident Types

To add new incident types:

1. Add the incident type and Font Awesome icon class to the `incidentTypeIcons` object in `MapScreen.tsx`
2. Ensure the Font Awesome icon class is available in Font Awesome 6.5.1 (currently loaded via CDN)
3. Update this documentation with the new mapping

## Example Database Structure

Based on the screenshot provided:
```json
{
  "Barangay": "Look 1st",
  "DateTime": "October 6, 2025 at 7:27:20 PM UTC+8",
  "Description": "...",
  "GeoLocation": "[14.864866840055516° N, 120.81543159511058° E]",
  "IncidentType": "Theft",  // <-- This field determines the icon
  "Status": "Verified",
  "Title": "theft"
}
```

The system will read `IncidentType: "Theft"` and display a spy icon (fa-user-secret) in the color #960C12.

## Font Awesome Library

The map uses Font Awesome 6.5.1 loaded via CDN:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
```

All icons use the solid variant (`.fas` class).
