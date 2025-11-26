import React, { useState } from 'react';
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

  // Умная группировка слоев
  const getLayerGroups = () => {
    if (!mapStyle || !mapStyle.layers) return [];
    
    const layers = mapStyle.layers;
    const filteredLayers = searchTerm 
      ? layers.filter(layer => layer?.id?.toLowerCase().includes(searchTerm.toLowerCase()))
      : layers;

    // Определяем группы на основе логики имен
    const groups = {
      background: { name: '🌌 Background', layers: [] },
      land: { name: '🌍 Land & Nature', layers: [] },
      water: { name: '🌊 Water', layers: [] },
      transportation: { name: '🚗 Transportation', layers: [] },
      buildings: { name: '🏢 Buildings', layers: [] },
      labels: { name: '🔤 Labels & Text', layers: [] },
      other: { name: '📦 Other', layers: [] }
    };

    filteredLayers.forEach(layer => {
      if (!layer?.id) return;

      const layerId = layer.id.toLowerCase();
      
      if (layerId.includes('background')) {
        groups.background.layers.push(layer);
      }
      else if (layerId.includes('land') || layerId.includes('park') || layerId.includes('wood') || 
               layerId.includes('grass') || layerId.includes('forest') || layerId.includes('natural')) {
        groups.land.layers.push(layer);
      }
      else if (layerId.includes('water') || layerId.includes('river') || layerId.includes('ocean') || 
               layerId.includes('lake') || layerId.includes('sea')) {
        groups.water.layers.push(layer);
      }
      else if (layerId.includes('road') || layerId.includes('street') || layerId.includes('highway') ||
               layerId.includes('bridge') || layerId.includes('tunnel') || layerId.includes('transport') ||
               layerId.includes('path') || layerId.includes('rail') || layerId.includes('motorway')) {
        groups.transportation.layers.push(layer);
      }
      else if (layerId.includes('building') || layerId.includes('house') || layerId.includes('construction')) {
        groups.buildings.layers.push(layer);
      }
      else if (layerId.includes('label') || layerId.includes('text') || layerId.includes('name') ||
               layerId.includes('symbol') || layerId.includes('poi')) {
        groups.labels.layers.push(layer);
      }
      else {
        groups.other.layers.push(layer);
      }
    });

    // Удаляем пустые группы
    return Object.entries(groups)
      .filter(([_, group]) => group.layers.length > 0)
      .map(([key, group]) => ({
        key,
        name: group.name,
        layers: group.layers
      }));
  };

  const layerGroups = getLayerGroups();
  const totalLayers = layerGroups.reduce((sum, group) => sum + group.layers.length, 0);

  return (
    <GlassCard className="left-panel">
      <div className="panel-header">
        <div className="logo-section">
          <div className="app-logo">🗺️</div>
          <div className="app-title">
            <h3>Map Style Editor</h3>
            <span className="app-subtitle">v1.0</span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="search-section">
        <Search onSearch={handleSearch} />
      </div>

      <div className="layers-section">
        <h5 className="layers-title">
          Layers ({totalLayers})
          {searchTerm && (
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
              search: "{searchTerm}"
            </span>
          )}
        </h5>
        
        {layerGroups.map(group => (
          <div key={group.key} className="layer-group">
            <div 
              className="group-header"
              onClick={() => toggleGroup(group.key)}
            >
              <span className="group-name">{group.name}</span>
              <span className="group-count">({group.layers.length})</span>
              <span className="group-toggle">
                {expandedGroups[group.key] ? '▼' : '►'}
              </span>
            </div>
            
            {expandedGroups[group.key] && (
              <div className="nested-layers">
                {group.layers.map(layer => (
                  <div 
                    key={layer.id} 
                    className={`simple-layer-item nested ${selectedLayer?.id === layer.id ? 'selected' : ''}`}
                    onClick={() => handleLayerClick(layer)}
                  >
                    <span className="layer-name">{layer.id}</span>
                    <span className="layer-type" data-type={layer.type}>
                      {layer.type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {totalLayers === 0 && (
          <div className="no-layers">
            {searchTerm ? (
              <>
                <p>No layers found for "{searchTerm}"</p>
                <small>Try a different search term</small>
              </>
            ) : (
              <>
                <p>No layers found</p>
                <small>Load a style to see layers</small>
              </>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default LeftPanel;