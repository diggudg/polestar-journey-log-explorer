import { Paper } from '@mantine/core';
import { Feature, Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { LineString, Point } from 'ol/geom';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Icon, Stroke, Style } from 'ol/style';
import { useEffect, useRef } from 'react';

// Reusing icons from strategies if possible, or defining inline for simplicity
// We'll define inline nicely.

interface TripMapProps {
  start: [number, number] | null; // [lat, lon]
  end: [number, number] | null;
  routeGeometry: [number, number][] | null; // Array of [lon, lat] from OSRM
  waypoints: { lat: number; lon: number; label: string; type: 'charger' | 'stop' }[];
}

export default function TripMap({ start, end, routeGeometry, waypoints }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<Map | null>(null);
  const vectorSource = useRef<VectorSource>(new VectorSource());

  useEffect(() => {
    if (!mapRef.current) return;

    const vectorLayer = new VectorLayer({
      source: vectorSource.current,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
      controls: defaultControls({ zoom: false, attribution: false }), // Minimal controls
    });

    mapInstance.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    vectorSource.current.clear();

    const features: Feature[] = [];

    // Start Marker
    if (start) {
      const startFeature = new Feature({
        geometry: new Point(fromLonLat([start[1], start[0]])),
      });
      startFeature.setStyle(
        new Style({
          image: new Icon({
            src: 'https://cdn-icons-png.flaticon.com/512/64/64113.png', // Generic location pin or similar
            // For now let's use a simple circle if we don't have assets,
            // but user had a specific style.
            // Let's use Polestar Orange Circle
            // Actually, SVG icons are better.
            // I'll create a simple function for styles.
            color: '#FF7500',
            scale: 0.05, // that icon is huge
            crossOrigin: 'anonymous',
          }),
        })
      );
      // Fallback style if icon fails or just circle
      const circleStyle = new Style({
        image: new Icon({
          src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF7500" width="24px" height="24px"><circle cx="12" cy="12" r="10"/></svg>',
          scale: 1,
        }),
      });
      startFeature.setStyle(circleStyle);
      features.push(startFeature);
    }

    // End Marker
    if (end) {
      const endFeature = new Feature({
        geometry: new Point(fromLonLat([end[1], end[0]])),
      });
      const endStyle = new Style({
        image: new Icon({
          src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="black" width="24px" height="24px"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>', // Flag icon
          scale: 1.5,
          color: '#000000',
        }),
      });
      endFeature.setStyle(endStyle);
      features.push(endFeature);
    }

    // Route Line
    if (routeGeometry && routeGeometry.length > 0) {
      const lineString = new LineString(routeGeometry.map((coord) => fromLonLat(coord)));
      const routeFeature = new Feature({
        geometry: lineString,
      });
      routeFeature.setStyle(
        new Style({
          stroke: new Stroke({
            color: '#339af0', // Blue
            width: 4,
          }),
        })
      );
      features.push(routeFeature);
    }

    // Waypoints (Chargers)
    waypoints.forEach((wp) => {
      const wpFeature = new Feature({
        geometry: new Point(fromLonLat([wp.lon, wp.lat])),
      });
      wpFeature.setStyle(
        new Style({
          image: new Icon({
            src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FCC419" width="24px" height="24px"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>', // Lightning
            scale: 1.2,
          }),
        })
      );
      features.push(wpFeature);
    });

    if (features.length > 0) {
      vectorSource.current.addFeatures(features);
      const extent = vectorSource.current.getExtent();
      if (extent && isFinite(extent[0])) {
        mapInstance.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          maxZoom: 15,
          duration: 1000,
        });
      }
    }
  }, [start, end, routeGeometry, waypoints]);

  return (
    <Paper p={0} withBorder radius="md" h={600} style={{ overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </Paper>
  );
}
