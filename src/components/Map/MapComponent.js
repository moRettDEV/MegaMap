import React, { useEffect, useRef, useState } from 'react';
import { useMapStyle } from '../../context/MapStyleContext'; // Импортируем контекст (путь поправлен)
import './MapComponent.css';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { mapStyle, dispatch } = useMapStyle(); // Используем контекст вместо пропса
  const [isMapReady, setIsMapReady] = useState(false);
  const previousStyle = useRef(null);

  // debug flag (set to true to enable debug logging)
  const DEBUG = false;

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (DEBUG) console.log('🗺️ Creating initial map...');
    
    // ИСПОЛЬЗУЕМ СТИЛЬ ИЗ КОНТЕКСТА ИЛИ БАЗОВЫЙ
    const initialStyle = mapStyle || getBasicStyle();
    createMap(initialStyle);

    return () => {
      if (map.current) {
        if (DEBUG) console.log('🧹 Cleaning up map...');
        map.current.remove();
        map.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // ОСНОВНОЙ ХУК ДЛЯ ОБНОВЛЕНИЯ СТИЛЯ ИЗ КОНТЕКСТА
  useEffect(() => {
    if (!mapStyle || !isMapReady || !map.current) {
      if (DEBUG) console.log('⏳ Cannot apply style yet:', { hasStyle: !!mapStyle, isMapReady, hasMap: !!map.current });
      return;
    }

    // ПРОВЕРЯЕМ, ЧТО СТИЛЬ ДЕЙСТВИТЕЛЬНО ИЗМЕНИЛСЯ
    const styleString = JSON.stringify(mapStyle);
    const previousStyleString = JSON.stringify(previousStyle.current);
    
    if (styleString === previousStyleString) {
      if (DEBUG) console.log('🔄 Style unchanged, skipping...');
      return;
    }
    if (DEBUG) console.log('🎨 Applying new style from context...', mapStyle.name);
    previousStyle.current = mapStyle;
    
    applyStyleToMap(mapStyle);

  }, [mapStyle, isMapReady]);

  const getBasicStyle = () => {
    return {
      version: 8,
      name: "Basic OSM",
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256
        }
      },
      layers: [{
        id: 'osm',
        type: 'raster',
        source: 'osm'
      }]
    };
  };

  const createMap = (style) => {
    try {
      if (DEBUG) console.log('🔄 Creating map with style:', style?.name);
      
      map.current = new window.maplibregl.Map({
        container: mapContainer.current,
        style: style,
        center: [37.6173, 55.7558],
        zoom: 13,
        pitch: 0,
        bearing: 0,
        antialias: true,
        pitchWithRotate: true,
        dragRotate: true,
        maxPitch: 85
      });

      map.current.on('load', () => {
        if (DEBUG) console.log('✅ Map loaded successfully!');
        setIsMapReady(true);
        enable3DControls();
        setupEventHandlers();
      });

      map.current.on('error', (e) => {
        // Если сервер возвращает 403 для tiles.json или другой источник не доступен,
        // переключаемся на базовый стиль чтобы карта отображалась.
        const msg = e.error?.message || '';
        if (DEBUG) console.log('Map error:', msg, e);
        try {
          if (msg.includes('403') || msg.toLowerCase().includes('tiles.json') || msg.toLowerCase().includes('failed to load')) {
            if (DEBUG) console.warn('Tile/source error detected — falling back to basic OSM style');
            const basic = getBasicStyle();
            map.current.setStyle(basic);
          }
        } catch (err) {
          if (DEBUG) console.error('Error handling map error event', err);
        }
      });

        map.current.on('style.load', () => {
          if (DEBUG) console.log('🎨 Style applied to map');
        });

    } catch (error) {
      console.error('❌ Failed to create map:', error);
    }
  };

  const applyStyleToMap = async (styleData) => {
    try {
      if (DEBUG) console.log('🔧 Preparing to apply style...');
      
      // ФИКСИМ СТИЛЬ ПЕРЕД ПРИМЕНЕНИЕМ
      const fixedStyle = await fixStyle(styleData);
      
      if (DEBUG) console.log('🔄 Setting new style on map...');
      
      // ИСПОЛЬЗУЕМ setStyle ДЛЯ ОБНОВЛЕНИЯ
      map.current.setStyle(fixedStyle);
      
      // ЖДЕМ ЗАГРУЗКИ НОВОГО СТИЛЯ
      map.current.once('style.load', () => {
        if (DEBUG) console.log('✅ New style loaded from context!');
        
        // ПЕРЕВКЛЮЧАЕМ 3D КОНТРОЛЫ
        setTimeout(() => {
          enable3DControls();
          if (DEBUG) console.log('🔄 3D controls re-enabled after style change');
        }, 500);
      });

    } catch (error) {
      console.error('❌ Failed to apply style:', error);
    }
  };

  const fixStyle = async (style) => {
    const fixed = JSON.parse(JSON.stringify(style));
    const apiKey = 'LSoCoGRcFWqdA4MxdZEz';

    if (DEBUG) console.log('🔧 Fixing style sources...');

    // Обрабатываем защищённые/placeholder источники (MapTiler с placeholder key).
    // Если источник содержит placeholder API key — заменяем его на OSM raster,
    // чтобы не получать 403 и чтобы карта отображалась корректно.
    if (fixed.sources) {
      Object.keys(fixed.sources).forEach(sourceKey => {
        const source = fixed.sources[sourceKey];
        const candidateUrl = source && (source.url || (Array.isArray(source.tiles) && source.tiles[0]));
        if (candidateUrl && typeof candidateUrl === 'string' && candidateUrl.includes('get_your_own_')) {
          if (DEBUG) console.warn(`Replacing protected source ${sourceKey} with OSM raster to avoid 403`);
          fixed.sources[sourceKey] = {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256
          };
        }
      });
    }

    // УБИРАЕМ ПРОБЛЕМНЫЕ SPRITE
    if (fixed.sprite && fixed.sprite.includes('maputnik.github.io')) {
      if (DEBUG) console.log('🗑️ Removing broken sprite');
      delete fixed.sprite;
    }

    // ФИКСИМ GLYPHS
    if (fixed.glyphs && fixed.glyphs.includes('orangemug.github.io')) {
      fixed.glyphs = `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${apiKey}`;
      if (DEBUG) console.log('🔤 Fixed glyphs URL');
    }

    return fixed;
  };

  const setupEventHandlers = () => {
    // ОБРАБОТЧИК ДЛЯ ОТСУТСТВУЮЩИХ ИКОНОК
    map.current.on('styleimagemissing', (e) => {
      createPlaceholderIcon(e.id);
    });

    // Handle click selection on features
    map.current.on('click', (e) => {
      try {
        const features = map.current.queryRenderedFeatures(e.point);
        if (features && features.length > 0) {
          const top = features[0];
          const layerId = (top.layer && (top.layer.id || top.layer.type)) || top.layerId || null;
          if (layerId && dispatch) {
            // try to find layer definition in current style
            const layerDef = mapStyle?.layers?.find(l => l.id === layerId) || { id: layerId, type: top.layer?.type || 'unknown' };
            dispatch({ type: 'SET_SELECTED_LAYER', payload: layerDef });
          }
        }
      } catch (err) {
        if (DEBUG) console.error('Selection error', err);
      }
    });
  };
  const createPlaceholderIcon = async (iconId) => {
    if (!map.current || !iconId) return;
    try {
      if (map.current.hasImage && map.current.hasImage(iconId)) return;

      const size = 24;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#3388ff';
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Convert canvas to ImageBitmap for addImage to avoid size mismatches
      if (typeof createImageBitmap === 'function') {
        const bitmap = await createImageBitmap(canvas);
        map.current.addImage(iconId, bitmap);
      } else {
        // Fallback: use data URL and Image
        const img = new Image();
        img.onload = () => {
          try { map.current.addImage(iconId, img); } catch (e) { if (DEBUG) console.error('addImage fallback error', e); }
        };
        img.src = canvas.toDataURL();
      }
    } catch (error) {
      if (DEBUG) console.error('Error creating icon:', error);
    }
  };

  const enable3DControls = () => {
    if (!map.current) return;
    
    try {
      map.current.dragRotate.enable();
      map.current.touchZoomRotate.enable();
      
      if (DEBUG) console.log('🎯 3D controls enabled');
      
      // АВТОМАТИЧЕСКОЕ ВКЛЮЧЕНИЕ 3D
      map.current.on('zoom', () => {
        if (map.current.getZoom() > 15 && map.current.getPitch() === 0) {
          if (DEBUG) console.log('🏙️ Auto-enabling 3D');
          map.current.easeTo({
            pitch: 60,
            bearing: -20,
            duration: 1000
          });
        }
      });
    } catch (error) {
      if (DEBUG) console.error('3D controls error:', error);
    }
  };

  return (
    <div className="map-container">
      <div 
        ref={mapContainer} 
        className="map"
        style={{ width: '100%', height: '100vh' }}
      />
    </div>
  );
};

export default MapComponent;