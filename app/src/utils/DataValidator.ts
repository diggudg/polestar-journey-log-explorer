/**
 * DataValidator - Service for identifying anomalies in journey data
 */
export class DataValidator {
    /**
     * Validate a list of trips and return found anomalies
     * @param {Array} trips - List of trip objects
     * @returns {Array} List of anomalies found
     */
    static validate(trips) {
        const anomalies = [];

        trips.forEach((trip, index) => {
            const issues = this.validateTrip(trip);
            if (issues.length > 0) {
                anomalies.push({
                    tripIndex: index,
                    trip: trip,
                    issues: issues
                });
            }
        });

        return anomalies;
    }

    /**
     * Validate a single trip
     * @param {Object} trip - Trip object
     * @returns {Array} List of issue strings
     */
    static validateTrip(trip) {
        const issues = [];
        
        // Thresholds
        const MAX_CONSUMPTION_KWH = 150; // Polestar 2 battery is ~78kWh, allowing for some charging during trip but 150 is huge
        const MAX_EFFICIENCY = 100; // kWh/100km
        const MIN_EFFICIENCY = 5; // kWh/100km
        const MAX_CONSUMPTION_PER_KM = 5; // 5 kWh per km is impossible for a car

        // Check 1: Extreme Consumption
        if (trip.consumptionKwh > MAX_CONSUMPTION_KWH) {
            issues.push(`Extreme energy consumption: ${trip.consumptionKwh.toFixed(1)} kWh`);
        }

        // Check 2: Impossible Efficiency (High)
        // Efficiency is usually calculated as (consumption / distance) * 100
        // If distance is very small and consumption is high, efficiency explodes
        const efficiency = parseFloat(trip.efficiency);
        if (!isNaN(efficiency) && efficiency > MAX_EFFICIENCY) {
            issues.push(`Abnormal efficiency: ${efficiency.toFixed(1)} kWh/100km`);
        }

        // Check 3: Impossible Efficiency (Low)
        if (!isNaN(efficiency) && efficiency > 0 && efficiency < MIN_EFFICIENCY) {
            issues.push(`Unusually low efficiency: ${efficiency.toFixed(1)} kWh/100km`);
        }

        // Check 4: Consumption vs Distance Ratio
        if (trip.distanceKm > 0) {
            const kwhPerKm = trip.consumptionKwh / trip.distanceKm;
            if (kwhPerKm > MAX_CONSUMPTION_PER_KM) {
                issues.push(`High consumption per km: ${kwhPerKm.toFixed(1)} kWh/km`);
            }
        }

        return issues;
    }
}
