import React, { useEffect, useRef } from 'react';
import { useMapStyle } from '../../context/MapStyleContext';
import './MapComponent.css';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { mapStyle } = useMapStyle();

  useEffect(() => {
    if (map.current || !window.maplibregl) return;

    console.log('🔄 Initializing map...');

    try {
      // Сначала используем простой OSM стиль для инициализации
      map.current = new window.maplibregl.Map({
        container: mapContainer.current,
        style: {
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
        },
        center: [37.6173, 55.7558],
        zoom: 10,
        attributionControl: false
      });

      map.current.on('load', () => {
        console.log('✅ Map loaded! Now applying our style...');
        // После загрузки применяем наш стиль
        applyMapStyle(mapStyle);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    return () => {
      // Оставляем карту жить
    };
  }, []);

  // Функция для безопасного применения стиля
  const applyMapStyle = (style) => {
    if (!map.current) return;
    
    try {
      console.log('🎨 Applying map style:', style.name);
      map.current.setStyle(style);
    } catch (error) {
      console.error('Error applying map style:', error);
      // Fallback на OSM если стиль сломан
      map.current.setStyle({
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
      });
    }
  };

  // Обновляем стиль карты когда меняется mapStyle
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded() && mapStyle) {
      applyMapStyle(mapStyle);
    }
  }, [mapStyle]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default MapComponent;