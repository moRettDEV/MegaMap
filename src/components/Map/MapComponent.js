import React, { useEffect, useRef, useState } from 'react';
import { useMapStyle } from '../../context/MapStyleContext';
import './MapComponent.css';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { mapStyle } = useMapStyle();
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  useEffect(() => {
    // Защита от двойной инициализации
    if (map.current || !mapContainer.current || !window.maplibregl) return;

    console.log('🔄 INITIALIZING MAP (ONCE)...');

    // Используем рабочие ресурсы
    const safeStyle = {
      ...mapStyle,
      sprite: mapStyle.sprite || 'https://api.maptiler.com/maps/basic/sprite',
      glyphs: mapStyle.glyphs || 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf'
    };

    map.current = new window.maplibregl.Map({
      container: mapContainer.current,
      style: safeStyle,
      center: [37.6173, 55.7558],
      zoom: 10,
      attributionControl: false,
      antialias: true,
      pitchWithRotate: true,
      dragRotate: true,
      maxPitch: 85,
      localIdeographFontFamily: "'Noto Sans', sans-serif"
    });

    // Обработчик отсутствующих изображений
    map.current.on('styleimagemissing', (e) => {
      const size = 32;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      context.fillStyle = '#666';
      context.fillRect(0, 0, size, size);
      map.current.addImage(e.id, canvas);
    });

    map.current.on('load', () => {
      console.log('✅ MAP LOADED! 3D ready.');
      setIsMapInitialized(true);
      
      map.current.dragRotate.enable();
      map.current.touchZoomRotate.enable();
      
      const extrusionLayers = map.current.getStyle().layers.filter(l => l.type === 'fill-extrusion');
      console.log('3D layers found:', extrusionLayers.length);
    });

    map.current.on('error', (e) => {
      if (e.error?.status === 404) return;
      console.log('Map resource issue:', e.error?.message);
    });

    // Очистка при размонтировании
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setIsMapInitialized(false);
      }
    };
  }, []); // ПУСТОЙ МАССИВ ЗАВИСИМОСТЕЙ - инициализация только при монтировании

  // ОБНОВЛЯЕМ ТОЛЬКО ЕСЛИ КАРТА УЖЕ ЗАГРУЖЕНА
  useEffect(() => {
    if (!map.current || !isMapInitialized || !mapStyle) return;

    console.log('🎨 Updating map style (full reload)...');

    // Используем setStyle для полной перезагрузки когда карта уже готова
    const safeStyle = {
      ...mapStyle,
      sprite: mapStyle.sprite || 'https://api.maptiler.com/maps/basic/sprite',
      glyphs: mapStyle.glyphs || 'https://api.maptiler.com/fonts/{fontstack}/{range}.pbf'
    };

    map.current.setStyle(safeStyle);

  }, [mapStyle, isMapInitialized]); // Обновляем когда меняется стиль И карта готова

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
    </div>
  );
};

export default MapComponent;