// @ts-nocheck
import { Group, Paper, Select, Stack, Switch, Text } from '@mantine/core';
import 'ol/ol.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColorCalculator } from '../../services/map/ColorCalculator';
import { FeatureBuilder } from '../../services/map/FeatureBuilder';
import { MapService } from '../../services/map/MapService';
import { TileLayerFactory } from '../../strategies/map/LayerStrategy';
import { MarkerFactory } from '../../strategies/map/MarkerStrategy';
import type { Trip } from '../../types';

interface MapViewProps {
  data: Trip[];
  selectedTripId?: string | null;
  onTripSelect?: (tripId: string | null) => void;
}

function MapView({ data, selectedTripId, onTripSelect: _onTripSelect }: MapViewProps) {
  const mapRef = useRef(null);
  const mapServiceRef = useRef(null);

  // const [selectedTrip, setSelectedTrip] = useState(null); // Removed internal state
  const [linkTripsByDay, setLinkTripsByDay] = useState(false);
  const [tripsToShow, setTripsToShow] = useState('100');
  const [selectedTileLayer, setSelectedTileLayer] = useState('osm');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [useRealRoutes] = useState(true);
  const [routeCache, setRouteCache] = useState({}); // Cache for route geometries

  // Initialize services (Dependency Injection)
  const colorCalculator = useMemo(() => new ColorCalculator(), []);
  const tileLayerFactory = useMemo(() => new TileLayerFactory(), []);
  const featureBuilder = useMemo(() => new FeatureBuilder(colorCalculator), [colorCalculator]);
  const markerFactory = useMemo(() => new MarkerFactory(colorCalculator), [colorCalculator]);

  const tileLayerOptions = tileLayerFactory.getAvailableLayers();

  const { allTrips, tripsByDay } = useMemo(() => {
    const validTrips = data.filter(
      (trip) => trip.startLat !== 0 && trip.startLng !== 0 && trip.endLat !== 0 && trip.endLng !== 0
    );

    if (validTrips.length === 0) {
      return { center: [-75.6972, 45.4215], allTrips: [], tripsByDay: {} }; // Ottawa default (lon, lat)
    }

    const avgLat = validTrips.reduce((sum, trip) => sum + trip.startLat, 0) / validTrips.length;
    const avgLng = validTrips.reduce((sum, trip) => sum + trip.startLng, 0) / validTrips.length;

    const validCenter = [
      Number.isFinite(avgLng) ? avgLng : -75.6972,
      Number.isFinite(avgLat) ? avgLat : 45.4215,
    ];

    const grouped = validTrips.reduce((acc, trip) => {
      const day = trip.startDate.split(',')[0].trim();
      if (!acc[day]) acc[day] = [];
      acc[day].push(trip);
      return acc;
    }, {});

    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    });

    return {
      center: validCenter,
      allTrips: validTrips,
      tripsByDay: grouped,
    };
  }, [data]);

  const tripsToShowOptions = [
    { value: '10', label: '10 trips' },
    { value: '20', label: '20 trips' },
    { value: '30', label: '30 trips' },
    { value: '40', label: '40 trips' },
    { value: '50', label: '50 trips' },
    { value: '60', label: '60 trips' },
    { value: '70', label: '70 trips' },
    { value: '80', label: '80 trips' },
    { value: '90', label: '90 trips' },
    { value: '100', label: '100 trips' },
    { value: 'ALL', label: `All trips (${allTrips.length})` },
  ];

  // Calculate selected trip index based on ID
  const selectedTripIndex = useMemo(() => {
    if (!selectedTripId) return null;
    return allTrips.findIndex(
      (t) => `${t.startDate}-${t.startOdometer}-${t.endOdometer}` === selectedTripId
    );
  }, [allTrips, selectedTripId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const displayTrips =
    selectedTripIndex !== null && selectedTripIndex !== -1
      ? [allTrips[selectedTripIndex]]
      : tripsToShow === 'ALL'
        ? allTrips
        : allTrips.slice(0, parseInt(tripsToShow, 10));

  // Initialize map service
  useEffect(() => {
    if (!mapRef.current || mapServiceRef.current) return;

    const mapService = new MapService(tileLayerFactory, featureBuilder, markerFactory);
    // Initialize with a default center, will be updated when data loads
    mapService.initializeMap(mapRef.current, [0, 0], selectedTileLayer);
    mapServiceRef.current = mapService;

    return () => {
      if (mapServiceRef.current) {
        mapServiceRef.current.destroy();
        mapServiceRef.current = null;
      }
    };
  }, [featureBuilder, markerFactory, selectedTileLayer, tileLayerFactory]);

  // Handle tile layer changes
  useEffect(() => {
    if (!mapServiceRef.current) return;
    mapServiceRef.current.changeTileLayer(selectedTileLayer);
  }, [selectedTileLayer]);

  // Handle heatmap visibility
  useEffect(() => {
    if (!mapServiceRef.current) return;
    mapServiceRef.current.setHeatmapVisibility(showHeatmap);
  }, [showHeatmap]);

  // Fetch routes from OSRM
  useEffect(() => {
    if (!useRealRoutes || displayTrips.length > 5) return; // Only fetch for small number of trips to avoid rate limits

    const fetchRoutes = async () => {
      const newCache = { ...routeCache };
      let cacheUpdated = false;

      for (const trip of displayTrips) {
        const tripId = `${trip.startDate}-${trip.startLat}-${trip.startLng}`;
        if (newCache[tripId]) continue;

        try {
          // OSRM Public API
          const url = `https://router.project-osrm.org/route/v1/driving/${trip.startLng},${trip.startLat};${trip.endLng},${trip.endLat}?overview=full&geometries=geojson`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            newCache[tripId] = data.routes[0].geometry.coordinates;
            cacheUpdated = true;
          }
        } catch (error) {
          console.warn('Failed to fetch route for trip:', tripId, error);
        }

        // Be nice to the public API
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      if (cacheUpdated) {
        setRouteCache(newCache);
      }
    };

    fetchRoutes();
  }, [displayTrips, useRealRoutes, routeCache]);

  // Update map view and features when data changes
  useEffect(() => {
    if (!mapServiceRef.current) return;

    const features = [];
    const heatmapFeatures = [];

    // Generate trip features using FeatureBuilder and MarkerFactory
    displayTrips.forEach((trip, tripIdx) => {
      // Route line
      const tripId = `${trip.startDate}-${trip.startLat}-${trip.startLng}`;
      const geometry = useRealRoutes ? routeCache[tripId] : null;

      const routeLine = featureBuilder.createRouteLine(trip, tripIdx, geometry);
      features.push(routeLine);

      // Add markers if enabled
      if (showMarkers) {
        const startMarker = markerFactory.createMarker(trip, 'start', tripIdx);
        const endMarker = markerFactory.createMarker(trip, 'end', tripIdx);
        features.push(startMarker, endMarker);
      }

      // Heatmap points
      heatmapFeatures.push(
        featureBuilder.createHeatmapPoint(trip.startLng, trip.startLat),
        featureBuilder.createHeatmapPoint(trip.endLng, trip.endLat)
      );
    });

    // Add day connection lines if enabled
    if (linkTripsByDay) {
      Object.entries(tripsByDay).forEach(([_day, trips], dayIdx) => {
        trips.forEach((trip, idx) => {
          if (idx < trips.length - 1) {
            const nextTrip = trips[idx + 1];
            const connectionLine = featureBuilder.createDayConnectionLine(trip, nextTrip, dayIdx);
            features.push(connectionLine);
          }
        });
      });
    }

    // Update map view and features
    mapServiceRef.current.updateFeatures(features, heatmapFeatures);
    mapServiceRef.current.fitToFeatures(features);
  }, [
    displayTrips,
    linkTripsByDay,
    tripsByDay,
    showMarkers,
    featureBuilder,
    markerFactory,
    useRealRoutes,
    routeCache,
  ]);

  return (
    <Stack gap="md">
      <Paper p={{ base: 'xs', sm: 'md' }} withBorder style={{ position: 'relative', zIndex: 1000 }}>
        <Stack gap="md">
          {/* Removed internal trip selector */}

          <Group grow align="flex-start" wrap="wrap">
            <Select
              label="How many trips to show"
              value={tripsToShow}
              onChange={setTripsToShow}
              data={tripsToShowOptions}
              disabled={selectedTripId !== null}
              size="sm"
              style={{ minWidth: '150px' }}
            />

            <Select
              label="Map tile layer"
              value={selectedTileLayer}
              onChange={setSelectedTileLayer}
              data={tileLayerOptions}
              size="sm"
              style={{ minWidth: '150px' }}
            />
          </Group>

          <Stack gap="sm">
            <Switch
              label="Link trips by day"
              description="Shows daily journey chains"
              checked={linkTripsByDay}
              onChange={(event) => setLinkTripsByDay(event.currentTarget.checked)}
              disabled={selectedTripId !== null}
              size="sm"
            />

            <Switch
              label="Show heatmap"
              description="Display density heatmap"
              checked={showHeatmap}
              onChange={(event) => setShowHeatmap(event.currentTarget.checked)}
              size="sm"
            />

            <Switch
              label="Show markers"
              description="Display trip start/end pins"
              checked={showMarkers}
              onChange={(event) => setShowMarkers(event.currentTarget.checked)}
              size="sm"
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        p={{ base: 'xs', sm: 'md' }}
        withBorder
        style={{ height: '600px', position: 'relative', zIndex: 1 }}
      >
        {allTrips.length > 0 ? (
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text c="dimmed" ta="center" p="xl">
            No valid trip data to display on map
          </Text>
        )}
      </Paper>
    </Stack>
  );
}

export default MapView;
