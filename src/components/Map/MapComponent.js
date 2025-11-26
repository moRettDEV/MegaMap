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

    // БАЗОВЫЙ СТИЛЬ КАК ФАЛЛБЭК
    const fallbackStyle = {
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

    // ИСПОЛЬЗУЕМ ТВОЙ СТИЛЬ ИЛИ ФАЛЛБЭК
    const initialStyle = mapStyle || fallbackStyle;

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

    // ОБРАБОТЧИК ДЛЯ ОТСУТСТВУЮЩИХ ИКОНОК
    map.current.on('styleimagemissing', (e) => {
      try {
        console.log(`🔄 Creating placeholder for: ${e.id}`);
        const size = 24;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        
        // Простая иконка
        context.fillStyle = '#3388ff';
        context.beginPath();
        context.arc(size/2, size/2, size/3, 0, Math.PI * 2);
        context.fill();
        
        map.current.addImage(e.id, canvas);
      } catch (error) {
        // Игнорируем ошибки
      }
    });

    // ИГНОРИРУЕМ ОШИБКИ ЗАГРУЗКИ ТАЙЛОВ
    map.current.on('error', (e) => {
      if (e.error && e.error.message && (
          e.error.message.includes('404') || 
          e.error.message.includes('Failed to fetch') ||
          e.error.message.includes('get_your_own')
        )) {
        return;
      }
      console.log('Map error:', e.error?.message);
    });

    map.current.on('load', () => {
      console.log('✅ Map loaded');
      
      // ВКЛЮЧАЕМ 3D
      map.current.dragRotate.enable();
      map.current.touchZoomRotate.enable();
      console.log('🎯 3D controls enabled');

      // ПРОВЕРЯЕМ СЛОИ
      setTimeout(() => {
        const style = map.current.getStyle();
        console.log('Available layers:', style.layers.map(l => l.id));
        
        // ВКЛЮЧАЕМ ВСЕ СЛОИ
        style.layers.forEach(layer => {
          try {
            map.current.setLayoutProperty(layer.id, 'visibility', 'visible');
          } catch (e) {}
        });
      }, 1000);
    });

    // АВТОМАТИЧЕСКОЕ ВКЛЮЧЕНИЕ 3D ПРИ ПРИБЛИЖЕНИИ
    map.current.on('zoom', () => {
      if (map.current && map.current.getZoom() > 15 && map.current.getPitch() === 0) {
        console.log('🏙️ Auto-enabling 3D');
        map.current.easeTo({
          pitch: 60,
          bearing: -20,
          duration: 1000
        });
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // ОБНОВЛЯЕМ СТИЛЬ С ОБРАБОТКОЙ ОШИБОК
  useEffect(() => {
    if (map.current && mapStyle) {
      console.log('🔄 Updating map style...');
      
      try {
        map.current.setStyle(mapStyle);
        
        map.current.once('idle', () => {
          console.log('✅ Map style updated');
        });
      } catch (error) {
        console.log('Style update failed:', error.message);
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