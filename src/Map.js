import { useState, useEffect, useRef } from 'react';

import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { toRgb, gradation } from './utils';

const THRESHOLDS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];

const data = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'urn:ogc:def:crs:OGC:1.3:CRS84'
    }
  },
  'features': []
};

// 中央を適当に高くする。0.0〜100.0
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    data.features.push({
      'type': 'Feature',
      'properties': {
        'value': ((i < 2) ? i : 4 - i) * ((j < 2) ? j : 4 - j) / 4.0 * 100.0,
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [
          139.7 + 0.01 * i,
          36.0 + 0.01 * j,
        ]
      }
    });
  }
}


// 中央を適当に高くする。0.0〜100.0
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    data.features.push({
      'type': 'Feature',
      'properties': {
        'value': i / 4.0 * 100.0,
      },
      'geometry': {
        'type': 'Point',
        'coordinates': [
          139.8 + 0.01 * i,
          36.0 + 0.01 * j,
        ]
      }
    });
  }
}


export const useMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);
  const [lng, setLng] = useState(139.7);
  const [lat, setLat] = useState(36.0);
  const [zoom, setZoom] = useState(12);

  const weightRef = useRef({ lower: 0.0, upper: 100.0 }); // lower〜upper を 0.0〜1.0 にマッピングする
  const radiusRef = useRef(50);
  const intensityRef = useRef(1);

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
          'circle-color': makeCircleColor(),
          'circle-opacity': OPACITY,
        }
      });

      // weight=単純リニア、color=単色、intensity=固定、radius=固定
      map.current.addLayer({
        id: 'sample-heatmap-layer',
        type: 'heatmap',
        source: 'sample-source',
        paint: {
          'heatmap-weight': [
            'interpolate', ['linear'], ["get", "value"],
            weightRef.current.lower, 0,
            weightRef.current.upper, 1,
          ],
          'heatmap-intensity': intensityRef.current,
          'heatmap-radius': radiusRef.current,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 0, 0, 0.5)',
            1, 'rgba(255, 255, 255, 0.5)'
          ],
          'heatmap-opacity': 1,
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

  const setHeatmapProperty = (props) => {
    if (props.weight) weightRef.current = props.weight;
    if (props.radius) radiusRef.current = props.radius;
    if (props.intensity) intensityRef.current = props.intensity;

    if (map.current.getLayer('sample-heatmap-layer')) {
      if (props.weight) {
        map.current.setPaintProperty('sample-heatmap-layer', 'heatmap-weight',
          [
            'interpolate', ['linear'], ["get", "value"],
            weightRef.current.lower, 0,
            weightRef.current.upper, 1,
          ]
        );
      }

      if (props.radius) {
        map.current.setPaintProperty('sample-heatmap-layer', 'heatmap-radius', props.radius);
      }

      if (props.intensity) {
        map.current.setPaintProperty('sample-heatmap-layer', 'heatmap-intensity', props.intensity);
      }
    }
  }

  return [mapContainer, { weight: weightRef.current, radius: radiusRef.current, intensity: intensityRef.current }, { setHeatmapProperty }];
};



export default useMap;

const makeCircleColor = () => {
  const colormap = THRESHOLDS
    .reduce((acc, cur, idx) => {
      acc[cur] = gradation(idx / (THRESHOLDS.length - 1));
      return acc
    }, {});

  let circleColor = null;
  circleColor = ["case"];

  Object.keys(colormap)
    .sort((a, b) => { return Number(a) < Number(b) ? 1 : -1; })  // 降順でソートする
    .forEach(key => {
      circleColor.push(["<=", Number(key), ["get", "value"]], toRgb(colormap[key]));
    });
  circleColor.push("rgb(255, 0, 255)"); // 想定していない値

  return circleColor;
}
