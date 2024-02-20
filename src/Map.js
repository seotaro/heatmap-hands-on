import { useState, useEffect, useRef } from 'react';

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { toRgb } from './utils';

const data = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
    }
  },
  'features': [
    {
      'type': 'Feature',
      'properties': {
        'value': 0.0
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [
          139.7,
          36.0,
        ]
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'value': 0.0
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [
          139.8,
          36.0,
        ]
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'value': 0.0
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [
          139.7,
          36.1,
        ]
      }
    },
    {
      'type': 'Feature',
      'properties': {
        'value': 0.0
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [
          139.8,
          36.1,
        ]
      }
    },
  ]
};


export const useMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const [lng, setLng] = useState(139.712);
  const [lat, setLat] = useState(36.039);
  const [zoom, setZoom] = useState(8);

  useEffect(() => {
    if (map.current) return; // initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'std-mono.json',
      // style: 'std.json',
      center: [lng, lat],
      zoom: zoom,
      minZoom: 4,
      maxZoom: 15,
      pitch: 0,
      hash: true,
    });

    map.current.on('load', async () => {
      map.current.addSource('sample-source', {
        type: 'geojson',
        data,
      });

      const OPACITY = 0.8;

      map.current.addLayer({
        id: 'sample-layer',
        type: 'circle',
        source: 'sample-source',
        paint: {
          'circle-radius': 6,
          'circle-stroke-color': 'gray',
          'circle-stroke-opacity': OPACITY,
          'circle-stroke-width': 1,
          'circle-color': 'rgba(255, 0, 255, 0.5)',
          'circle-opacity': OPACITY,
        }
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      popup.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      // feature にカーソルがあれば十字に変える。
      map.current.on('mousemove', (e) => {
        const layers = [];
        if (map.current.getLayer('sample-layer')) layers.push('sample-layer');

        const features = map.current.queryRenderedFeatures(e.point, { layers });
        map.current.getCanvas().style.cursor = features.length ? 'crosshair' : '';
      });

      // クリックした feature のプロパティーをポップアップで表示する。
      map.current.on('click', async (e) => {
        popup.current.remove();

        const layers = [];
        if (map.current.getLayer('sample-layer')) layers.push('sample-layer');

        if (layers.length === 0) return;

        let contents = [];

        const features = map.current.queryRenderedFeatures(e.point, { layers });
        if (0 < features.length) {
          for (let i = 0; i < features.length; i++) {
            const feature = features[i];
            contents.push(`
            <div class="point">
              <span class='location'>(${feature.geometry.coordinates[0].toFixed(2)}°E, ${feature.geometry.coordinates[1].toFixed(2)}°N):</span>
              <span class='value'>${feature.properties.value}</span>
            </div>
            `);
          }
        }

        if (0 < contents.length) {
          popup.current.setLngLat(e.lngLat)
            .setHTML(contents.join(''))
            .addTo(map.current);
        }
      });
    });

    return () => {
      map.current.remove();
      map.current = null;
    }
  }, []);

  return [mapContainer];
};

export default useMap;
