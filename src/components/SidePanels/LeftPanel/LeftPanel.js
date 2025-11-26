import React, { useState, useMemo } from 'react';
import { useMapStyle } from '../../../context/MapStyleContext';
import GlassCard from '../../UI/GlassCard/GlassCard';
import ThemeToggle from '../../UI/ThemeToggle/ThemeToggle';
import Search from '../../UI/Search/Search';
import './LeftPanel.css';

const LeftPanel = () => {
  const { mapStyle, dispatch, selectedLayer } = useMapStyle();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleLayerClick = (layer) => {
    if (dispatch && layer) {
      dispatch({
        type: 'SET_SELECTED_LAYER',
        payload: layer
      });
    }
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const toggleLayerVisibility = (layerId, isVisible) => {
    if (dispatch) {
      dispatch({
        type: 'TOGGLE_LAYER_VISIBILITY',
        payload: {
          layerId,
          isVisible
        }
      });
    }
  };

  // Функция для получения русского названия слоя
  const getRussianName = (layerId) => {
    const names = {
      // Background & Base
      'background': 'Фон',
      'natural_earth': 'Рельеф Земли',
      
      // Land & Nature
      'park': 'Парки',
      'park_outline': 'Контур парков',
      'landuse_residential': 'Жилые районы',
      'landcover_wood': 'Леса',
      'landcover_grass': 'Луга',
      'landcover_ice': 'Ледники',
      'landcover_wetland': 'Болота',
      'landuse_pitch': 'Спортплощадки',
      'landuse_track': 'Тропы',
      'landuse_cemetery': 'Кладбища',
      'landuse_hospital': 'Больницы',
      'landuse_school': 'Школы',
      'landcover_sand': 'Песок',
      
      // Water
      'waterway_tunnel': 'Тоннели водные',
      'waterway_river': 'Реки',
      'waterway_other': 'Водотоки',
      'water': 'Вода',
      
      // Transportation
      'aeroway_fill': 'Аэропорты',
      'aeroway_runway': 'ВПП',
      'aeroway_taxiway': 'РД',
      'road_motorway_link_casing': 'Обводка съездов',
      'road_service_track_casing': 'Обводка сервисных',
      'road_link_casing': 'Обводка ответвлений',
      'road_minor_casing': 'Обводка мелких дорог',
      'road_secondary_tertiary_casing': 'Обводка второстепенных',
      'road_trunk_primary_casing': 'Обводка магистралей',
      'road_motorway_casing': 'Обводка автострад',
      'road_path_pedestrian': 'Тротуары',
      'road_motorway_link': 'Съезды',
      'road_service_track': 'Сервисные дороги',
      'road_link': 'Ответвления',
      'road_minor': 'Мелкие дороги',
      'road_secondary_tertiary': 'Второстепенные дороги',
      'road_trunk_primary': 'Магистрали',
      'road_motorway': 'Автострады',
      'road_major_rail': 'Железные дороги',
      'road_transit_rail': 'Метро',
      
      // Buildings
      'building': 'Здания 2D',
      'building-3d': 'Здания 3D',
      
      // Boundaries
      'boundary_3': 'Границы регионов',
      'boundary_2_z0-4': 'Границы стран',
      'boundary_2_z5-': 'Границы стран детальные',
      
      // Labels
      'water_name_line': 'Названия рек',
      'water_name_point': 'Названия водоемов',
      'poi_z16': 'POI детальные',
      'poi_z15': 'POI средние',
      'poi_z14': 'POI основные',
      'poi_transit': 'Транспорт POI',
      'road_label': 'Названия дорог',
      'road_shield': 'Номера дорог',
      'place_other': 'Малые населенные пункты',
      'place_village': 'Деревни',
      'place_town': 'Города',
      'place_city': 'Крупные города',
      'state': 'Штаты/области',
      'country_3': 'Страны малые',
      'country_2': 'Страны средние',
      'country_1': 'Страны крупные',
      'continent': 'Континенты'
    };

    return names[layerId] || layerId;
  };

  // Функция для получения цветной иконки слоя
  const getLayerColorIcon = (layer) => {
    // Получаем основной цвет и цвет обводки
    let fillColor = '#888'; // серый по умолчанию
    let strokeColor = null;
    let hasStroke = false;

    if (layer.paint) {
      // Для fill слоев
      if (layer.type === 'fill') {
        if (layer.paint['fill-color'] || layer.paint.fillColor) {
          fillColor = layer.paint['fill-color'] || layer.paint.fillColor || '#3388ff';
        }
        // Проверяем есть ли обводка у fill слоя
        if (layer.paint['fill-outline-color'] || layer.paint.fillOutlineColor) {
          strokeColor = layer.paint['fill-outline-color'] || layer.paint.fillOutlineColor;
          hasStroke = true;
        }
      }
      // Для line слоев
      else if (layer.type === 'line') {
        if (layer.paint['line-color'] || layer.paint.lineColor) {
          fillColor = layer.paint['line-color'] || layer.paint.lineColor || '#000000';
        }
        // Для линий считаем что есть "обводка" если есть dasharray
        if (layer.paint['line-dasharray']) {
          hasStroke = true;
          strokeColor = '#ffffff'; // Белая обводка для пунктирных линий
        }
      }
      // Для background
      else if (layer.type === 'background') {
        if (layer.paint['background-color'] || layer.paint.backgroundColor) {
          fillColor = layer.paint['background-color'] || layer.paint.backgroundColor || '#000000';
        }
      }
      // Для символов/текста
      else if (layer.type === 'symbol') {
        if (layer.paint['text-color'] || layer.paint.textColor) {
          fillColor = layer.paint['text-color'] || layer.paint.textColor || '#000000';
        }
      }
      // Для raster
      else if (layer.type === 'raster') {
        fillColor = '#666666'; // Серый для растров
      }
      // Для fill-extrusion (3D здания)
      else if (layer.type === 'fill-extrusion') {
        if (layer.paint['fill-extrusion-color'] || layer.paint.fillExtrusionColor) {
          fillColor = layer.paint['fill-extrusion-color'] || layer.paint.fillExtrusionColor || '#555555';
        }
      }
    }

    // Очищаем цвет от alpha канала для упрощения
    if (typeof fillColor === 'string') {
      if (fillColor.startsWith('rgba')) {
        const rgbMatch = fillColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          fillColor = `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
        }
      } else if (fillColor.startsWith('hsla')) {
        const hslMatch = fillColor.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
        if (hslMatch) {
          fillColor = `hsl(${hslMatch[1]}, ${hslMatch[2]}%, ${hslMatch[3]}%)`;
        }
      }
    }

    if (strokeColor && typeof strokeColor === 'string') {
      if (strokeColor.startsWith('rgba')) {
        const rgbMatch = strokeColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
          strokeColor = `rgb(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
        }
      }
    }

    return (
      <div 
        className="layer-color-icon"
        style={{
          backgroundColor: fillColor,
          border: hasStroke ? `2px solid ${strokeColor || '#fff'}` : '1px solid var(--glass-border)'
        }}
        title={`Цвет: ${fillColor}${hasStroke ? `, Обводка: ${strokeColor}` : ''}`}
      />
    );
  };

  // Умная группировка слоев
  const getLayerGroups = useMemo(() => {
    if (!mapStyle || !mapStyle.layers) return [];
    
    const layers = mapStyle.layers;
    
    // Фильтрация по поиску (ищем и в русских названиях и в оригинальных ID)
    const filteredLayers = searchTerm 
      ? layers.filter(layer => {
          const rusName = getRussianName(layer.id).toLowerCase();
          const engName = layer.id.toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          return rusName.includes(searchLower) || engName.includes(searchLower);
        })
      : layers;

    const groups = {
      background: { 
        name: 'Фон и Основа', 
        icon: '🌌',
        layers: [] 
      },
      land: { 
        name: 'Земля и Природа', 
        icon: '🌍',
        layers: [] 
      },
      water: { 
        name: 'Вода', 
        icon: '🌊',
        layers: [] 
      },
      transportation: { 
        name: 'Транспорт', 
        icon: '🚗',
        layers: [] 
      },
      buildings: { 
        name: 'Здания', 
        icon: '🏢',
        layers: [] 
      },
      boundaries: { 
        name: 'Границы', 
        icon: '🗺️',
        layers: [] 
      },
      labels: { 
        name: 'Надписи и POI', 
        icon: '🔤',
        layers: [] 
      },
      other: { 
        name: 'Прочее', 
        icon: '📦',
        layers: [] 
      }
    };

    filteredLayers.forEach(layer => {
      if (!layer?.id) return;

      const layerId = layer.id.toLowerCase();
      
      if (layerId.includes('background') || layerId.includes('natural_earth')) {
        groups.background.layers.push(layer);
      }
      else if (layerId.includes('landcover') || layerId.includes('landuse') || 
               layerId.includes('park') || layerId.includes('wood') || 
               layerId.includes('grass') || layerId.includes('ice') ||
               layerId.includes('wetland') || layerId.includes('sand') ||
               layerId.includes('cemetery') || layerId.includes('hospital') ||
               layerId.includes('school') || layerId.includes('pitch') ||
               layerId.includes('track')) {
        groups.land.layers.push(layer);
      }
      else if (layerId.includes('water') || layerId.includes('river') || 
               layerId.includes('waterway')) {
        groups.water.layers.push(layer);
      }
      else if (layerId.includes('road') || layerId.includes('street') || 
               layerId.includes('motorway') || layerId.includes('highway') ||
               layerId.includes('bridge') || layerId.includes('tunnel') || 
               layerId.includes('transport') || layerId.includes('path') || 
               layerId.includes('rail') || layerId.includes('aeroway') ||
               layerId.includes('link') || layerId.includes('service') ||
               layerId.includes('track') || layerId.includes('pedestrian')) {
        groups.transportation.layers.push(layer);
      }
      else if (layerId.includes('building')) {
        groups.buildings.layers.push(layer);
      }
      else if (layerId.includes('boundary')) {
        groups.boundaries.layers.push(layer);
      }
      else if (layerId.includes('label') || layerId.includes('text') || 
               layerId.includes('name') || layerId.includes('symbol') || 
               layerId.includes('poi') || layerId.includes('place') ||
               layerId.includes('country') || layerId.includes('state') ||
               layerId.includes('city') || layerId.includes('town') ||
               layerId.includes('village') || layerId.includes('continent')) {
        groups.labels.layers.push(layer);
      }
      else {
        groups.other.layers.push(layer);
      }
    });

    // Сортируем слои внутри групп
    Object.values(groups).forEach(group => {
      group.layers.sort((a, b) => {
        if (a.id.includes('background') && !b.id.includes('background')) return -1;
        if (!a.id.includes('background') && b.id.includes('background')) return 1;
        return a.id.localeCompare(b.id);
      });
    });

    return Object.entries(groups)
      .filter(([_, group]) => group.layers.length > 0)
      .map(([key, group]) => ({
        key,
        name: group.name,
        icon: group.icon,
        layers: group.layers
      }));
  }, [mapStyle, searchTerm]);

  const layerGroups = getLayerGroups;
  const totalLayers = layerGroups.reduce((sum, group) => sum + group.layers.length, 0);

  const getLayerVisibility = (layer) => {
    return layer.layout?.visibility !== 'none';
  };

  const handleVisibilityToggle = (e, layer) => {
    e.stopPropagation();
    const isVisible = getLayerVisibility(layer);
    toggleLayerVisibility(layer.id, !isVisible);
  };

  return (
    <GlassCard className="left-panel">
      <div className="panel-header">
        <div className="logo-section">
          <div className="app-logo">🗺️</div>
          <div className="app-title">
            <h3>Редактор карт</h3>
            <span className="app-subtitle">v1.0</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="search-section">
        <Search onSearch={handleSearch} placeholder="Поиск слоев..." />
      </div>

      <div className="layers-section">
        <h5 className="layers-title">
          Слои ({totalLayers})
          {searchTerm && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
              поиск: "{searchTerm}"
            </span>
          )}
        </h5>
        
        {layerGroups.map(group => (
          <div key={group.key} className="layer-group">
            <div 
              className="group-header"
              onClick={() => toggleGroup(group.key)}
            >
              <div className="group-info">
                <span className="group-icon">{group.icon}</span>
                <span className="group-name">{group.name}</span>
                <span className="group-count">({group.layers.length})</span>
              </div>
              <span className="group-toggle">
                {expandedGroups[group.key] ? '▼' : '►'}
              </span>
            </div>
            
            {expandedGroups[group.key] && (
              <div className="nested-layers">
                {group.layers.map(layer => {
                  const isVisible = getLayerVisibility(layer);
                  const isSelected = selectedLayer?.id === layer.id;
                  const russianName = getRussianName(layer.id);
                  
                  return (
                    <div 
                      key={layer.id} 
                      className={`simple-layer-item nested ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleLayerClick(layer)}
                    >
                      <button 
                        className={`visibility-toggle ${isVisible ? 'visible' : 'hidden'}`}
                        onClick={(e) => handleVisibilityToggle(e, layer)}
                        title={isVisible ? 'Скрыть слой' : 'Показать слой'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          {isVisible ? (
                            <path 
                              d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                              fill="currentColor"
                            />
                          ) : (
                            <>
                              <path 
                                d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                                fill="currentColor"
                              />
                              <path 
                                d="M3 3l18 18"
                                stroke="currentColor" 
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </>
                          )}
                        </svg>
                      </button>
                      
                      {getLayerColorIcon(layer)}
                      
                      <div className="layer-name-container">
                        <span className="layer-name" title={russianName}>
                          {russianName}
                        </span>
                        <span className="layer-id" title={layer.id}>
                          {layer.id}
                        </span>
                      </div>
                      
                      <span className="layer-type" data-type={layer.type}>
                        {layer.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        
        {totalLayers === 0 && (
          <div className="no-layers">
            {searchTerm ? (
              <>
                <p>Слои не найдены для "{searchTerm}"</p>
                <small>Попробуйте другой запрос</small>
              </>
            ) : (
              <>
                <p>Слои не найдены</p>
                <small>Загрузите стиль чтобы увидеть слои</small>
              </>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default LeftPanel;