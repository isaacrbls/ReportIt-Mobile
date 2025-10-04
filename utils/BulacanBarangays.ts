export interface Barangay {
  name: string;
  code?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
    radiusKm?: number; // Approximate radius of the barangay in kilometers
  };
}

export interface City {
  name: string;
  barangays: Barangay[];
}

export const BULACAN_CITIES: City[] = [
  {
    name: "Malolos City",
    barangays: [
      { name: "Anilao" },
      { name: "Atlag" },
      { name: "Babatnin" },
      { name: "Bagna" },
      { name: "Bagong Bayan" },
      { name: "Balayong" },
      { name: "Balite" },
      { name: "Bangkal" },
      { name: "Barihan" },
      { name: "Bulihan" }, // One of the allowed reporting barangays
      { name: "Bustos" },
      { name: "Caingin" },
      { name: "Calero" },
      { name: "Caliligawan" },
      { name: "Canalate" },
      { name: "Caniogan" },
      { name: "Catmon" },
      { name: "Cofradia" },
      { name: "Dakila" }, // One of the allowed reporting barangays
      { name: "Guinhawa" },
      { name: "Ligas" },
      { name: "Loma de Gato" },
      { name: "Look" }, // One of the allowed reporting barangays
      { name: "Lugam" },
      { name: "Mabolo" },
      { name: "Maikling Parang" },
      { name: "Masile" },
      { name: "Matimbo" },
      { name: "Mojon" }, // One of the allowed reporting barangays
      { name: "Namayan" },
      { name: "Niugan" },
      { name: "Pamarawan" },
      { name: "Pinagbakahan" }, // One of the allowed reporting barangays
      { name: "San Agustin" },
      { name: "San Gabriel" },
      { name: "San Juan" },
      { name: "San Pablo" },
      { name: "San Vicente" },
      { name: "Santa Isabel" },
      { name: "Santa Rosa" },
      { name: "Santiago" },
      { name: "Santisima Trinidad" },
      { name: "Santo Cristo" },
      { name: "Santo Niño" },
      { name: "Sumapang Bata" },
      { name: "Sumapang Matanda" },
      { name: "Taal" },
      { name: "Tikay" }
    ]
  },
  {
    name: "Meycauayan City",
    barangays: [
      { name: "Bagbaguin" },
      { name: "Bahay Pare" },
      { name: "Bancal" },
      { name: "Banga" },
      { name: "Batia" },
      { name: "Calvario" },
      { name: "Camalig" },
      { name: "Hulo" },
      { name: "Iba" },
      { name: "Langka" },
      { name: "Lawa" },
      { name: "Libtong" },
      { name: "Liputan" },
      { name: "Malhacan" },
      { name: "Pandayan" },
      { name: "Perez" },
      { name: "Poblacion" },
      { name: "Saint Francis" },
      { name: "Saluysoy" },
      { name: "Tugatog" },
      { name: "Ubihan" },
      { name: "Zamora" }
    ]
  },
  {
    name: "San Jose del Monte City",
    barangays: [
      { name: "Assumption" },
      { name: "Bagong Buhay I" },
      { name: "Bagong Buhay II" },
      { name: "Bagong Buhay III" },
      { name: "Ciudad Real" },
      { name: "Dulong Bayan" },
      { name: "Fatima I" },
      { name: "Fatima II" },
      { name: "Fatima III" },
      { name: "Fatima IV" },
      { name: "Fatima V" },
      { name: "Francisco Homes - Guijo" },
      { name: "Francisco Homes - Mulawin" },
      { name: "Francisco Homes - Narra" },
      { name: "Francisco Homes - Yakal" },
      { name: "Gaya-gaya" },
      { name: "Graceville" },
      { name: "Greenland" },
      { name: "Kaypian" },
      { name: "Kaybanban" },
      { name: "Lawang Pare" },
      { name: "Minuyan" },
      { name: "Minuyan II" },
      { name: "Minuyan III" },
      { name: "Minuyan IV" },
      { name: "Minuyan V" },
      { name: "Muzon" },
      { name: "Paradise III" },
      { name: "Poblacion" },
      { name: "Rio de Oro" },
      { name: "San Isidro" },
      { name: "San Manuel" },
      { name: "San Martin" },
      { name: "San Pedro" },
      { name: "San Rafael I" },
      { name: "San Rafael II" },
      { name: "San Rafael III" },
      { name: "San Rafael IV" },
      { name: "San Rafael V" },
      { name: "Santa Cruz" },
      { name: "Santo Cristo" },
      { name: "Santo Niño" },
      { name: "Sapang Palay" },
      { name: "Tungkong Mangga" }
    ]
  },
  {
    name: "Angat",
    barangays: [
      { name: "Banaban" },
      { name: "Binagbag" },
      { name: "Donacion" },
      { name: "Encanto" },
      { name: "Hilario" },
      { name: "Marungko" },
      { name: "Niugan" },
      { name: "Poblacion" },
      { name: "San Roque" },
      { name: "Sulit" },
      { name: "Wawa" }
    ]
  },
  {
    name: "Balagtas",
    barangays: [
      { name: "Balagtas" },
      { name: "Borol 1st" },
      { name: "Borol 2nd" },
      { name: "Longos" },
      { name: "Panginay" },
      { name: "Poblacion" },
      { name: "Santol" },
      { name: "Wawa" }
    ]
  },
  {
    name: "Baliuag",
    barangays: [
      { name: "Bagong Nayon" },
      { name: "Barangca" },
      { name: "Borol 1st" },
      { name: "Borol 2nd" },
      { name: "Calantipay" },
      { name: "Catulinan" },
      { name: "Concepcion" },
      { name: "Hinukay" },
      { name: "Makinabang" },
      { name: "Matangtubig" },
      { name: "Pagala" },
      { name: "Poblacion" },
      { name: "Sabang" },
      { name: "San Jose" },
      { name: "Santa Barbara" },
      { name: "Tangos" },
      { name: "Tarikan" },
      { name: "Tibag" },
      { name: "Virgen delas Flores" }
    ]
  },
  {
    name: "Bocaue",
    barangays: [
      { name: "Antipona" },
      { name: "Bagumbayan" },
      { name: "Bambang" },
      { name: "Biñang 1st" },
      { name: "Biñang 2nd" },
      { name: "Bundukan" },
      { name: "Bunlo" },
      { name: "Capa" },
      { name: "Duhat" },
      { name: "Igulot" },
      { name: "Lolomboy" },
      { name: "Poblacion" },
      { name: "Sulucan" },
      { name: "Taal" },
      { name: "Tambobong" },
      { name: "Turo" },
      { name: "Wakas" }
    ]
  },
  {
    name: "Bulakan",
    barangays: [
      { name: "Balubad" },
      { name: "Bambang" },
      { name: "Bungo" },
      { name: "Calumpang" },
      { name: "Mambog" },
      { name: "Matungao" },
      { name: "Perez" },
      { name: "Pitpitan" },
      { name: "Poblacion" },
      { name: "San Francisco" },
      { name: "San Jose" },
      { name: "San Nicolas" },
      { name: "Taliptip" },
      { name: "Tibig" }
    ]
  },
  {
    name: "Bustos",
    barangays: [
      { name: "Bonga Mayor" },
      { name: "Bonga Menor" },
      { name: "Camachilihan" },
      { name: "Catacte" },
      { name: "Liciada" },
      { name: "Malamig" },
      { name: "Malawak" },
      { name: "Poblacion" },
      { name: "San Pedro" },
      { name: "Tanawan" },
      { name: "Tibagan" }
    ]
  },
  {
    name: "Calumpit",
    barangays: [
      { name: "Balite" },
      { name: "Bulusan" },
      { name: "Calumpang" },
      { name: "Caniogan" },
      { name: "Frances" },
      { name: "Iba O'Este" },
      { name: "Longos" },
      { name: "Poblacion" },
      { name: "Palapat" },
      { name: "Pitpitan" },
      { name: "Pungo" },
      { name: "San Jose" },
      { name: "Sucad" }
    ]
  },
  {
    name: "Doña Remedios Trinidad",
    barangays: [
      { name: "Camachile" },
      { name: "Kabatuhan" },
      { name: "Nangka" },
      { name: "Poblacion" },
      { name: "Pulong Sampaloc" },
      { name: "Villa Aurora" }
    ]
  },
  {
    name: "Guiguinto",
    barangays: [
      { name: "Daungan" },
      { name: "Ilang-ilang" },
      { name: "Malis" },
      { name: "Panginay" },
      { name: "Poblacion" },
      { name: "Pritil" },
      { name: "Pulong Gubat" },
      { name: "Santa Rita" },
      { name: "Tabang" },
      { name: "Tuktukan" }
    ]
  },
  {
    name: "Hagonoy",
    barangays: [
      { name: "Carillo" },
      { name: "Iba" },
      { name: "Mercado" },
      { name: "Palapat" },
      { name: "Poblacion" },
      { name: "San Agustin" },
      { name: "San Isidro" },
      { name: "San Jose" },
      { name: "San Juan" },
      { name: "San Miguel" },
      { name: "San Nicolas" },
      { name: "San Pablo" },
      { name: "San Pascual" },
      { name: "San Pedro" },
      { name: "Santa Monica" },
      { name: "Santo Niño" },
      { name: "Santo Rosario" },
      { name: "Tampok" },
      { name: "Tibaguin" },
      { name: "Tugdan" }
    ]
  },
  {
    name: "Marilao",
    barangays: [
      { name: "Abangan Norte" },
      { name: "Abangan Sur" },
      { name: "Bukol" },
      { name: "Ibayo" },
      { name: "Lambakin" },
      { name: "Lias" },
      { name: "Loma de Gato" },
      { name: "Nagbabalon" },
      { name: "Patubig" },
      { name: "Poblacion" },
      { name: "Prenza I" },
      { name: "Prenza II" },
      { name: "Santa Rosa I" },
      { name: "Santa Rosa II" },
      { name: "Saog" },
      { name: "Tabing Ilog" }
    ]
  },
  {
    name: "Norzagaray",
    barangays: [
      { name: "Bangkal" },
      { name: "Bigte" },
      { name: "Bitungol" },
      { name: "Bonga Menor" },
      { name: "Calawagan" },
      { name: "Camachile" },
      { name: "Canchinche" },
      { name: "Kaangtinaan" },
      { name: "Loma de Gato" },
      { name: "Matictic" },
      { name: "Minahan" },
      { name: "Partida" },
      { name: "Pinaod" },
      { name: "Poblacion" },
      { name: "San Lorenzo" },
      { name: "San Mateo" },
      { name: "Tigbe" },
      { name: "Tigpalas" }
    ]
  },
  {
    name: "Obando",
    barangays: [
      { name: "Binuangan" },
      { name: "Catanghalan" },
      { name: "Lawa" },
      { name: "Paco" },
      { name: "Paliwas" },
      { name: "Panghulo" },
      { name: "Poblacion" },
      { name: "San Pascual" }
    ]
  },
  {
    name: "Pandi",
    barangays: [
      { name: "Bunsuran I" },
      { name: "Bunsuran II" },
      { name: "Bunsuran III" },
      { name: "Cacarong Bata" },
      { name: "Cacarong Matanda" },
      { name: "Cupang" },
      { name: "Malibo" },
      { name: "Mapulang Lupa" },
      { name: "Masagana" },
      { name: "Poblacion" },
      { name: "Pinagkuartelan" },
      { name: "Real de Cacarong" },
      { name: "Salikneta" },
      { name: "Santo Niño" },
      { name: "Sipat" },
      { name: "Sulucan" }
    ]
  },
  {
    name: "Paombong",
    barangays: [
      { name: "Binakod" },
      { name: "Kapitangan" },
      { name: "Masukol" },
      { name: "Pinalagdan" },
      { name: "Poblacion" },
      { name: "San Isidro" },
      { name: "San Jose" },
      { name: "San Roque" },
      { name: "San Vicente" },
      { name: "Santa Cruz" }
    ]
  },
  {
    name: "Plaridel",
    barangays: [
      { name: "Banga" },
      { name: "Barangca" },
      { name: "Bintog" },
      { name: "Bulihan" },
      { name: "Culianin" },
      { name: "Lalakhan" },
      { name: "Lugam" },
      { name: "Parulan" },
      { name: "Poblacion" },
      { name: "Rueda" },
      { name: "Tabang" },
      { name: "Sipat" }
    ]
  },
  {
    name: "Pulilan",
    barangays: [
      { name: "Balatong" },
      { name: "Cutcut" },
      { name: "Dampol 1st" },
      { name: "Dampol 2nd" },
      { name: "Dulong Malabon" },
      { name: "Inaon" },
      { name: "Longos" },
      { name: "Lumbac" },
      { name: "Penabatan" },
      { name: "Poblacion" },
      { name: "Tibag" },
      { name: "Tinejero" }
    ]
  },
  {
    name: "San Ildefonso",
    barangays: [
      { name: "Alagao" },
      { name: "Anyatam" },
      { name: "Bago" },
      { name: "Bubulong Munti" },
      { name: "Calasag" },
      { name: "Calawakan" },
      { name: "Garlang" },
      { name: "Labangan" },
      { name: "Maasim" },
      { name: "Magmarale" },
      { name: "Maronquillo" },
      { name: "Poblacion" },
      { name: "Pulong Tamo" },
      { name: "San Juan" },
      { name: "Santa Monica" },
      { name: "Sapang Bakaw" },
      { name: "Sapang Bayan" },
      { name: "Sumandig" },
      { name: "Upig" }
    ]
  },
  {
    name: "San Miguel",
    barangays: [
      { name: "Bagbaguin" },
      { name: "Bahay Pare" },
      { name: "Buliran" },
      { name: "Camias" },
      { name: "Lawang Pare" },
      { name: "Parada" },
      { name: "Poblacion" },
      { name: "Salacot" },
      { name: "San Gabriel" }
    ]
  },
  {
    name: "Santa Maria",
    barangays: [
      { name: "Bagbaguin" },
      { name: "Balasing" },
      { name: "Bulihan" },
      { name: "Camangyanan" },
      { name: "Can-awan" },
      { name: "Catmon" },
      { name: "Cay Pombo" },
      { name: "Caysasay" },
      { name: "Dulong Bayan" },
      { name: "Guyong" },
      { name: "Lalakhan" },
      { name: "Mag-asawang Sapa" },
      { name: "Mahabang Parang" },
      { name: "Parada" },
      { name: "Poblacion" },
      { name: "Pulong Buhangin" },
      { name: "San Gabriel" },
      { name: "San Jose Patag" },
      { name: "Santa Clara" },
      { name: "Santa Cruz" },
      { name: "Santo Tomas" },
      { name: "Silangan" },
      { name: "Tumana" }
    ]
  }
];

// List of barangays allowed for reporting
export const ALLOWED_REPORTING_BARANGAYS = [
  "Pinagbakahan",
  "Look", 
  "Bulihan",
  "Dakila",
  "Mojon"
];

// Barangay coordinates for the allowed reporting barangays (approximate center points)
// These are the 5 barangays in Malolos City that allow reporting
export const BARANGAY_COORDINATES: { [key: string]: { latitude: number; longitude: number; radiusKm: number } } = {
  "Pinagbakahan": {
    latitude: 14.8441,
    longitude: 120.8118,
    radiusKm: 2.0 // Approximate 2km radius
  },
  "Look": {
    latitude: 14.8523,
    longitude: 120.8234,
    radiusKm: 1.5 // Approximate 1.5km radius
  },
  "Bulihan": {
    latitude: 14.8635,
    longitude: 120.8156,
    radiusKm: 1.8 // Approximate 1.8km radius
  },
  "Dakila": {
    latitude: 14.8498,
    longitude: 120.8089,
    radiusKm: 1.5 // Approximate 1.5km radius
  },
  "Mojon": {
    latitude: 14.8357,
    longitude: 120.8201,
    radiusKm: 1.7 // Approximate 1.7km radius
  }
};

// Helper function to get all barangays as a flat array
export const getAllBarangays = (): { cityName: string; barangayName: string; fullName: string }[] => {
  const allBarangays: { cityName: string; barangayName: string; fullName: string }[] = [];
  
  BULACAN_CITIES.forEach(city => {
    city.barangays.forEach(barangay => {
      allBarangays.push({
        cityName: city.name,
        barangayName: barangay.name,
        fullName: `${barangay.name}, ${city.name}`
      });
    });
  });
  
  return allBarangays;
};

// Helper function to check if a barangay allows reporting
export const isReportingAllowed = (barangayName: string): boolean => {
  return ALLOWED_REPORTING_BARANGAYS.includes(barangayName);
};

// Helper function to find city by barangay name
export const findCityByBarangay = (barangayName: string): string | null => {
  for (const city of BULACAN_CITIES) {
    const barangay = city.barangays.find(b => b.name === barangayName);
    if (barangay) {
      return city.name;
    }
  }
  return null;
};

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

// Helper function to check if user's current location is within their barangay's vicinity
export const isWithinBarangayVicinity = (
  userBarangay: string,
  currentLatitude: number,
  currentLongitude: number
): { isWithin: boolean; distance: number; allowedRadius: number } => {
  // Check if the barangay has coordinates defined
  const barangayCoords = BARANGAY_COORDINATES[userBarangay];
  
  if (!barangayCoords) {
    // If barangay doesn't have coordinates, we can't verify location
    // Return true to allow reporting (fail-open for barangays without coordinates)
    console.warn(`No coordinates defined for barangay: ${userBarangay}`);
    return {
      isWithin: true,
      distance: 0,
      allowedRadius: 0
    };
  }
  
  // Calculate distance between user's location and barangay center
  const distance = calculateDistance(
    currentLatitude,
    currentLongitude,
    barangayCoords.latitude,
    barangayCoords.longitude
  );
  
  // Check if user is within the barangay's radius
  const isWithin = distance <= barangayCoords.radiusKm;
  
  console.log(`📍 Location check for ${userBarangay}:`, {
    userLocation: { lat: currentLatitude, lng: currentLongitude },
    barangayCenter: { lat: barangayCoords.latitude, lng: barangayCoords.longitude },
    distance: `${distance.toFixed(2)} km`,
    allowedRadius: `${barangayCoords.radiusKm} km`,
    isWithin: isWithin
  });
  
  return {
    isWithin: isWithin,
    distance: distance,
    allowedRadius: barangayCoords.radiusKm
  };
};