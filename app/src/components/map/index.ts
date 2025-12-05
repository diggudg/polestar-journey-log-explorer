// @ts-nocheck
/**
 * Map module exports
 * Provides clean imports for map-related components and services
 */

// Re-export decorators
export * from '../../decorators/map/LayerDecorator';
export { ColorCalculator } from '../../services/map/ColorCalculator';
export { FeatureBuilder } from '../../services/map/FeatureBuilder';
// Re-export services for convenience
export { MapService } from '../../services/map/MapService';
export { TileLayerFactory as LayerFactory } from '../../strategies/map/LayerStrategy';
// Re-export strategies
export { MarkerFactory, TileLayerFactory } from '../../strategies/map/MarkerStrategy';
// Components
export { default as MapView } from './MapView';
