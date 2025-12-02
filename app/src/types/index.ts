// Trip data types
export interface Trip {
  id: number;
  startDate: string;
  endDate: string;
  startAddress: string;
  endAddress: string;
  distanceKm: number;
  consumptionKwh: number;
  category: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  startOdometer: number;
  endOdometer: number;
  tripType: string;
  socSource: number;
  socDestination: number;
  comments: string;
  efficiency: string;
  socDrop: number;
}

// Statistics types
export interface Statistics {
  totalTrips: number;
  totalDistance: string;
  totalConsumption: string;
  avgEfficiency: string;
  bestEfficiency: string | number;
  worstEfficiency: string | number;
  avgTripDistance: string;
  odometerStart: number;
  odometerEnd: number;
  carbonSaved: string;
  treesEquivalent: string;
  gasSaved: string;
}

// Charging session types
export interface ChargingSession {
  date: string;
  location: string;
  lat: number;
  lng: number;
  socStart: number;
  socEnd: number;
  kwhAdded: number;
  socDiff: number;
}

export interface ChargingLocation {
  location: string;
  count: number;
  totalKwh: number;
  lat: number;
  lng: number;
}

export interface ChargingStats {
  totalSessions: number;
  totalChargedKwh: number;
  avgChargeKwh: number;
  sessions: ChargingSession[];
  topLocations: ChargingLocation[];
}

// Route analysis types
export interface Route {
  id: string;
  startAddress: string;
  endAddress: string;
  count: number;
  totalDistance: number;
  totalConsumption: number;
  crowFliesDistance: number;
  trips: Trip[];
  avgDistance: number;
  avgConsumption: number;
  avgEfficiency: number;
  detourFactor: number;
}

export interface RouteStats {
  repeatedRoutes: Route[];
  inefficientRoutes: Route[];
}

// Filter types
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface Filters {
  dateRange: DateRange;
  category: string | null;
  minDistance: number;
  maxDistance: number;
}
