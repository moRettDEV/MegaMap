import React, { useEffect, useRef } from 'react';
import { useMapStyle } from '../../context/MapStyleContext';
import './MapComponent.css';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { mapStyle } = useMapStyle();

  useEffect(() => {
    if (map.current || !mapContainer.current || !window.maplibregl) return;

    console.log('🔄 Creating map...');

    // ПРОСТО ИСПОЛЬЗУЕМ СТИЛЬ КАК ЕСТЬ
    const initialStyle = mapStyle || {
      version: 8,
      sources: {
        "osm": {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256
        }
      },
      layers: [{
        id: "osm",
        type: "raster", 
        source: "osm"
      }]
    };

    map.current = new window.maplibregl.Map({
      container: mapContainer.current,
      style: initialStyle,
      center: [37.6173, 55.7558],
      zoom: 13,
      attributionControl: false,
      antialias: true,
      pitchWithRotate: true,
      dragRotate: true,
      maxPitch: 85
    });

    // ИГНОРИРУЕМ ВСЕ ОШИБКИ
    map.current.on('error', (e) => {
      console.log('Ignoring map error:', e.error?.message);
      return;
    });

    map.current.on('load', () => {
      console.log('✅ Map loaded');
      
      // Включаем 3D
      map.current.dragRotate.enable();
      map.current.touchZoomRotate.enable();
      console.log('🎯 3D controls enabled');
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // ПРОСТО ОБНОВЛЯЕМ СТИЛЬ БЕЗ ИЗМЕНЕНИЙ
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && mapStyle) {
      console.log('🔄 Updating map style...');
      
      try {
        map.current.setStyle(mapStyle);
        
        map.current.once('idle', () => {
          console.log('✅ Map style updated');
        });
      } catch (error) {
        console.log('Style update error (ignoring):', error.message);
      }
    }
  }, [mapStyle]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default MapComponent;