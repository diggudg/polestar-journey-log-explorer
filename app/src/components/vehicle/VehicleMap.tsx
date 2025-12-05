// @ts-nocheck
import { Paper } from '@mantine/core';
import 'ol/ol.css';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OlMap from 'ol/Map';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import View from 'ol/View';
import { useEffect, useRef } from 'react';

interface VehicleMapProps {
  latitude: number;
  longitude: number;
}

export default function VehicleMap({ latitude, longitude }: VehicleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<OlMap | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const vehicleLocation = fromLonLat([longitude, latitude]);

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: '#FF4500' }), // Safety Orange
          stroke: new Stroke({ color: '#fff', width: 2 }),
        }),
      }),
    });

    const map = new OlMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: vehicleLocation,
        zoom: 15,
      }),
      controls: [], // Remove default controls for cleaner look
    });

    mapInstanceRef.current = map;

    // Add marker
    const marker = new Feature({
      geometry: new Point(vehicleLocation),
    });
    vectorSource.addFeature(marker);

    return () => {
      map.setTarget(undefined);
    };
  }, [latitude, longitude]);

  return (
    <Paper p={0} radius="md" withBorder style={{ height: '100%', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </Paper>
  );
}
