// @ts-nocheck
import { Feature } from 'ol';
import { LineString, Point } from 'ol/geom';
import { fromLonLat } from 'ol/proj';
import { Stroke, Style } from 'ol/style';

/**
 * Builder Pattern: Constructs complex Feature objects step by step
 * Single Responsibility: Only responsible for building map features
 */
export class FeatureBuilder {
    constructor(colorCalculator) {
        this.colorCalculator = colorCalculator;
    }

    /**
     * Create a route line feature
     * @param {Object} trip - Trip data
     * @param {number} index - Trip index for z-ordering
     * @returns {Feature} OpenLayers Feature
     */
    createRouteLine(trip, index, geometry = null) {
        const color = this.colorCalculator.getEfficiencyColor(trip.efficiency);

        let lineGeometry;
        
        if (geometry) {
            // If we have a real route geometry (GeoJSON coordinates)
            // OSRM returns [lon, lat], so we need to transform each point
            const points = geometry.map(coord => fromLonLat(coord));
            lineGeometry = new LineString(points);
        } else {
            // Fallback to straight line
            lineGeometry = new LineString([
                fromLonLat([trip.startLng, trip.startLat]),
                fromLonLat([trip.endLng, trip.endLat])
            ]);
        }

        const routeLine = new Feature({
            geometry: lineGeometry
        });

        routeLine.setStyle(new Style({
            stroke: new Stroke({
                color: this.colorCalculator.rgbToRgba(color, 0.8),
                width: 4,
                lineCap: 'round',
                lineJoin: 'round'
            }),
            zIndex: 500 + index
        }));

        return routeLine;
    }

    /**
     * Create a day connection line feature
     * @param {Object} startTrip - Starting trip
     * @param {Object} endTrip - Ending trip
     * @param {number} dayIndex - Day index for color selection
     * @returns {Feature} OpenLayers Feature
     */
    createDayConnectionLine(startTrip, endTrip, dayIndex) {
        const color = this.colorCalculator.getDayColor(dayIndex);

        const connectionLine = new Feature({
            geometry: new LineString([
                fromLonLat([startTrip.endLng, startTrip.endLat]),
                fromLonLat([endTrip.startLng, endTrip.startLat])
            ])
        });

        connectionLine.setStyle(new Style({
            stroke: new Stroke({
                color: this.colorCalculator.rgbToRgba(color, 0.6),
                width: 5,
                lineDash: [15, 10],
                lineCap: 'round'
            }),
            zIndex: 500
        }));

        return connectionLine;
    }

    /**
     * Create a heatmap point feature
     * @param {number} lng - Longitude
     * @param {number} lat - Latitude
     * @returns {Feature} OpenLayers Feature
     */
    createHeatmapPoint(lng, lat) {
        return new Feature({
            geometry: new Point(fromLonLat([lng, lat]))
        });
    }
}
