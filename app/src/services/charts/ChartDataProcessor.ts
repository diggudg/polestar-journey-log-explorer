// @ts-nocheck
/**
 * ChartDataProcessor - Service for processing trip data into chart-ready formats
 * Follows Single Responsibility Principle: Only handles data transformation for charts
 */
export class ChartDataProcessor {
  /**
   * Process distance and consumption data over time
   * @param {Array} data - Raw trip data
   * @param {number} days - Number of days to include (default: 30)
   * @returns {Array} Time series data
   */
  processTimeSeriesData(data, days = 30) {
    const distanceByDate = data.reduce((acc, trip) => {
      const date = trip.startDate.split(',')[0];
      if (!acc[date]) {
        acc[date] = { date, distance: 0, consumption: 0, trips: 0 };
      }
      acc[date].distance += trip.distanceKm;
      acc[date].consumption += trip.consumptionKwh;
      acc[date].trips += 1;
      return acc;
    }, {});

    return Object.values(distanceByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-days);
  }

  /**
   * Process efficiency distribution data
   * @param {Array} data - Raw trip data
   * @param {number} min - Minimum efficiency
   * @param {number} max - Maximum efficiency
   * @param {number} step - Step size for buckets
   * @returns {Array} Efficiency distribution data
   */
  processEfficiencyDistribution(data, min = 0, max = 50, step = 5) {
    const buckets = {};
    for (let i = min; i < max; i += step) {
      buckets[`${i}-${i + step}`] = 0;
    }

    data.forEach((trip) => {
      const eff = parseFloat(trip.efficiency);
      if (eff >= min && eff < max) {
        const lowerBound = Math.floor((eff - min) / step) * step + min;
        const key = `${lowerBound}-${lowerBound + step}`;
        if (buckets[key] !== undefined) {
          buckets[key]++;
        }
      }
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }

  /**
   * Process trip distance distribution into ranges
   * @param {Array} data - Raw trip data
   * @returns {Array} Distance range data with counts
   */
  processDistanceDistribution(data) {
    const distanceRanges = [
      { name: '0-5 km', min: 0, max: 5, value: 0 },
      { name: '5-10 km', min: 5, max: 10, value: 0 },
      { name: '10-20 km', min: 10, max: 20, value: 0 },
      { name: '20-50 km', min: 20, max: 50, value: 0 },
      { name: '50+ km', min: 50, max: Infinity, value: 0 },
    ];

    data.forEach((trip) => {
      const range = distanceRanges.find((r) => trip.distanceKm >= r.min && trip.distanceKm < r.max);
      if (range) range.value++;
    });

    return distanceRanges.filter((r) => r.value > 0);
  }

  /**
   * Process SOC (State of Charge) drop distribution
   * @param {Array} data - Raw trip data
   * @param {number} step - Step size for buckets
   * @returns {Array} SOC drop distribution data
   */
  processSOCDropDistribution(data, step = 10) {
    const buckets = {};
    for (let i = 0; i < 100; i += step) {
      buckets[`${i}-${i + step}%`] = 0;
    }

    data.forEach((trip) => {
      const drop = trip.socDrop;
      if (drop >= 0 && drop <= 100) {
        const lowerBound = Math.floor(drop / step) * step;
        const key = `${lowerBound}-${lowerBound + step}%`;
        if (buckets[key] !== undefined) {
          buckets[key]++;
        }
      }
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }

  /**
   * Process consumption by time of day
   * @param {Array} data - Raw trip data
   * @returns {Array} Consumption grouped by hour
   */
  processConsumptionByTimeOfDay(data) {
    const consumptionByHour = {};

    data.forEach((trip) => {
      // Extract hour from startDate format: "YYYY-MM-DD, HH:MM"
      const timePart = trip.startDate.split(',')[1]?.trim();
      if (!timePart) return;

      const hour = parseInt(timePart.split(':')[0], 10);
      if (Number.isNaN(hour)) return;

      if (!consumptionByHour[hour]) {
        consumptionByHour[hour] = {
          hour,
          totalConsumption: 0,
          trips: 0,
        };
      }

      consumptionByHour[hour].totalConsumption += trip.consumptionKwh;
      consumptionByHour[hour].trips += 1;
    });

    return Object.values(consumptionByHour)
      .map((item) => ({
        ...item,
        avgConsumption: item.totalConsumption / item.trips,
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  /**
   * Process charging sessions based on SOC increase between trips
   * @param {Array} data - Raw trip data (must be sorted by date)
   * @returns {Object} Charging statistics and sessions
   */
  processChargingSessions(data) {
    // Ensure data is sorted by date
    const sortedData = [...data].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const sessions = [];
    let totalChargedKwh = 0;

    // Battery capacity estimation (Polestar 2 Long Range is ~75-78 kWh usable)
    const BATTERY_CAPACITY_KWH = 75;

    for (let i = 0; i < sortedData.length - 1; i++) {
      const currentTrip = sortedData[i];
      const nextTrip = sortedData[i + 1];

      // If SOC at start of next trip is significantly higher than SOC at end of current trip
      if (nextTrip.socSource > currentTrip.socDestination + 2) {
        // +2% buffer for fluctuation
        const socDiff = nextTrip.socSource - currentTrip.socDestination;
        const kwhAdded = (socDiff / 100) * BATTERY_CAPACITY_KWH;

        totalChargedKwh += kwhAdded;

        sessions.push({
          date: currentTrip.endDate, // Assumed charged after this trip
          location: currentTrip.endAddress, // Assumed charged at destination of this trip
          lat: currentTrip.endLat,
          lng: currentTrip.endLng,
          socStart: currentTrip.socDestination,
          socEnd: nextTrip.socSource,
          kwhAdded: kwhAdded,
          socDiff: socDiff,
        });
      }
    }

    // Group by location
    const locationStats = sessions.reduce((acc, session) => {
      const loc = session.location || 'Unknown';
      if (!acc[loc]) {
        acc[loc] = {
          location: loc,
          count: 0,
          totalKwh: 0,
          lat: session.lat,
          lng: session.lng,
        };
      }
      acc[loc].count += 1;
      acc[loc].totalKwh += session.kwhAdded;
      return acc;
    }, {});

    const topLocations = Object.values(locationStats)
      .sort((a, b) => b.totalKwh - a.totalKwh)
      .slice(0, 5);

    return {
      totalSessions: sessions.length,
      totalChargedKwh: totalChargedKwh,
      avgChargeKwh: sessions.length > 0 ? totalChargedKwh / sessions.length : 0,
      sessions: sessions,
      topLocations: topLocations,
    };
  }

  /**
   * Process route analysis to find repeated routes and efficiency
   * @param {Array} data - Raw trip data
   * @returns {Object} Route statistics
   */
  processRouteAnalysis(data) {
    const routes = {};

    // Helper to calculate Haversine distance (crow-flies)
    const getCrowFliesDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Helper to create a unique key for a route (approximate coordinates to group nearby points)
    const getCoordKey = (lat, lng) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

    data.forEach((trip) => {
      if (!trip.startLat || !trip.endLat) return;

      const startKey = getCoordKey(trip.startLat, trip.startLng);
      const endKey = getCoordKey(trip.endLat, trip.endLng);
      const routeKey = `${startKey}->${endKey}`;

      if (!routes[routeKey]) {
        const crowFliesDist = getCrowFliesDistance(
          trip.startLat,
          trip.startLng,
          trip.endLat,
          trip.endLng
        );
        routes[routeKey] = {
          id: routeKey,
          startAddress: trip.startAddress,
          endAddress: trip.endAddress,
          count: 0,
          totalDistance: 0,
          totalConsumption: 0,
          crowFliesDistance: crowFliesDist,
          trips: [],
        };
      }

      routes[routeKey].count++;
      routes[routeKey].totalDistance += trip.distanceKm;
      routes[routeKey].totalConsumption += trip.consumptionKwh;
      routes[routeKey].trips.push(trip);
    });

    // Process aggregated route data
    const processedRoutes = Object.values(routes).map((route) => {
      const avgDistance = route.totalDistance / route.count;
      const avgConsumption = route.totalConsumption / route.count;
      const avgEfficiency = (avgConsumption / avgDistance) * 100;

      // Detour factor: How much longer is the driven path vs straight line?
      // > 1.5 usually implies inefficient routing or winding roads
      const detourFactor = route.crowFliesDistance > 0 ? avgDistance / route.crowFliesDistance : 1;

      return {
        ...route,
        avgDistance,
        avgConsumption,
        avgEfficiency,
        detourFactor,
      };
    });

    const repeatedRoutes = processedRoutes
      .filter((r) => r.count > 1)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const inefficientRoutes = processedRoutes
      .filter((r) => r.detourFactor > 1.5 && r.avgDistance > 5) // Filter out short parking moves
      .sort((a, b) => b.detourFactor - a.detourFactor)
      .slice(0, 10);

    return {
      repeatedRoutes,
      inefficientRoutes,
    };
  }

  /**
   * Process speed vs efficiency data
   * @param {Array} data - Raw trip data
   * @returns {Array} Scatter plot data
   */
  processSpeedVsEfficiency(data) {
    return data
      .map((trip) => {
        // Parse dates manually if needed, but assuming standard format or Date objects
        // The file shows split(',')[0] usage, so strings: "YYYY-MM-DD, HH:MM"
        // Let's rely on standard Date parsing which usually handles "YYYY-MM-DD, HH:MM" or similar
        // If not, we might need robust parsing.
        // Existing code uses `new Date(trip.startDate)`.
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        let speed = 0;
        if (durationHours > 0) {
          speed = trip.distanceKm / durationHours;
        }

        return {
          speed: parseFloat(speed.toFixed(1)),
          efficiency: parseFloat(trip.efficiency),
          distance: trip.distanceKm,
          category: trip.category,
        };
      })
      .filter((d) => d.speed > 5 && d.speed < 180 && d.distance > 2 && d.efficiency < 100); // Filter outliers (parking, errors)
  }
}
