import React, { useState, useEffect } from 'react';
import { useMapStyle } from '../../../../context/MapStyleContext';
import ColorPicker from '../../../UI/ColorPicker/ColorPicker';
import './PropertiesPanel.css';

const PropertiesPanel = () => {
  const { selectedLayer, dispatch, mapStyle } = useMapStyle();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Принудительное обновление при изменении mapStyle
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [mapStyle]);

  // Улучшенная функция для получения простого значения
  const getSimpleValue = (value, defaultValue = 1) => {
    if (value === null || value === undefined) return defaultValue;
    
    if (typeof value === 'object') {
      if (value.stops && Array.isArray(value.stops) && value.stops.length > 0) {
        const firstStop = value.stops[0];
        return Array.isArray(firstStop) ? firstStop[1] : firstStop;
      }
      if (value.base !== undefined) {
        return value.base;
      }
      return defaultValue;
    }
    
    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    
    return value;
  };

  const updateLayerProperty = (property, value) => {
    if (!selectedLayer || !dispatch) return;
    dispatch({
      type: 'UPDATE_LAYER_PROPERTY',
      payload: {
        layerId: selectedLayer.id,
        property,
        value
      }
    });
    
    // Форсируем перерисовку
    setForceUpdate(prev => prev + 1);
  };

  // Улучшенная функция получения значений с учетом обновлений
  const getPropertyValue = (propertyPath) => {
    if (!selectedLayer) return null;
    
    // Обновляем selectedLayer из актуального mapStyle
    const currentLayer = mapStyle?.layers?.find(layer => layer.id === selectedLayer.id);
    if (!currentLayer) return null;
    
    const parts = propertyPath.split('.');
    let value = currentLayer;
    
    for (const part of parts) {
      if (value && value[part] !== undefined) {
        value = value[part];
      } else {
        return null;
      }
    }
    
    return value;
  };

  const getVisibility = () => {
    const currentLayer = mapStyle?.layers?.find(layer => layer.id === selectedLayer?.id);
    return currentLayer?.layout?.visibility !== 'none';
  };

  const handleVisibilityChange = (isVisible) => {
    updateLayerProperty('layout.visibility', isVisible ? 'visible' : 'none');
  };

  const toggleLayerVisibility = () => {
    const isVisible = getVisibility();
    handleVisibilityChange(!isVisible);
  };

  if (!selectedLayer) {
    return (
      <div className="no-selection">
        <div className="no-selection-icon">🎨</div>
        <p>Select a layer to edit properties</p>
      </div>
    );
  }

  const isLayerVisible = getVisibility();

  // Получаем актуальные значения для отображения
  const getDisplayValue = (propertyPath, defaultValue = '') => {
    const value = getPropertyValue(propertyPath);
    return value !== null && value !== undefined ? value : defaultValue;
  };

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <div className="layer-info-header">
          <h5 className="layer-name">{selectedLayer.id}</h5>
          <span className="layer-type-badge">{selectedLayer.type}</span>
        </div>
      </div>

      <div className="properties-list">
        {/* Background Properties */}
        {selectedLayer.type === 'background' && (
          <div className="property-group">
            <h6 className="property-group-title">Background Properties</h6>
            
            <div className="property-item">
              <label className="property-label">Background Color</label>
              <div className="property-control">
                <ColorPicker 
                  value={getDisplayValue('paint.backgroundColor') || getDisplayValue('paint.background-color') || '#000000'}
                  onChange={(color) => updateLayerProperty('paint.background-color', color)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Fill Properties */}
        {selectedLayer.type === 'fill' && (
          <div className="property-group">
            <h6 className="property-group-title">Fill Properties</h6>
            
            <div className="property-item">
              <label className="property-label">Fill Color</label>
              <div className="property-control">
                <ColorPicker 
                  value={getDisplayValue('paint.fillColor') || getDisplayValue('paint.fill-color') || '#3388ff'}
                  onChange={(color) => updateLayerProperty('paint.fill-color', color)}
                />
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Fill Opacity</label>
              <div className="property-control">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={getSimpleValue(
                    getDisplayValue('paint.fillOpacity') || getDisplayValue('paint.fill-opacity'), 
                    1
                  )}
                  onChange={(e) => updateLayerProperty('paint.fill-opacity', parseFloat(e.target.value))}
                  className="property-slider"
                />
                <span className="property-value">
                  {Math.round(getSimpleValue(
                    getDisplayValue('paint.fillOpacity') || getDisplayValue('paint.fill-opacity'), 
                    1
                  ) * 100)}%
                </span>
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Layer Visibility</label>
              <div className="property-control">
                <button 
                  className={`visibility-toggle ${isLayerVisible ? 'visible' : 'hidden'}`}
                  onClick={toggleLayerVisibility}
                  title={isLayerVisible ? 'Hide layer' : 'Show layer'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    {isLayerVisible ? (
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
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Outline Color</label>
              <div className="property-control">
                <ColorPicker 
                  value={getDisplayValue('paint.fillOutlineColor') || getDisplayValue('paint.fill-outline-color') || '#000000'}
                  onChange={(color) => updateLayerProperty('paint.fill-outline-color', color)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Line Properties */}
        {selectedLayer.type === 'line' && (
          <div className="property-group">
            <h6 className="property-group-title">Line Properties</h6>
            
            <div className="property-item">
              <label className="property-label">Line Color</label>
              <div className="property-control">
                <ColorPicker 
                  value={getDisplayValue('paint.lineColor') || getDisplayValue('paint.line-color') || '#000000'}
                  onChange={(color) => updateLayerProperty('paint.line-color', color)}
                />
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Line Width</label>
              <div className="property-control">
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="0.1"
                  value={getSimpleValue(
                    getDisplayValue('paint.lineWidth') || getDisplayValue('paint.line-width'), 
                    1
                  )}
                  onChange={(e) => updateLayerProperty('paint.line-width', parseFloat(e.target.value))}
                  className="property-slider"
                />
                <span className="property-value">
                  {getSimpleValue(
                    getDisplayValue('paint.lineWidth') || getDisplayValue('paint.line-width'), 
                    1
                  )}px
                </span>
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Line Opacity</label>
              <div className="property-control">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={getSimpleValue(
                    getDisplayValue('paint.lineOpacity') || getDisplayValue('paint.line-opacity'), 
                    1
                  )}
                  onChange={(e) => updateLayerProperty('paint.line-opacity', parseFloat(e.target.value))}
                  className="property-slider"
                />
                <span className="property-value">
                  {Math.round(getSimpleValue(
                    getDisplayValue('paint.lineOpacity') || getDisplayValue('paint.line-opacity'), 
                    1
                  ) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Fill-Extrusion (3D Buildings) Properties */}
        {selectedLayer.type === 'fill-extrusion' && (
          <div className="property-group">
            <h6 className="property-group-title">3D Building Properties</h6>

            <div className="property-item">
              <label className="property-label">Building Color</label>
              <div className="property-control">
                <ColorPicker 
                  value={getDisplayValue('paint.fillExtrusionColor') || getDisplayValue('paint.fill-extrusion-color') || '#cccccc'}
                  onChange={(color) => updateLayerProperty('paint.fill-extrusion-color', color)}
                />
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Extrusion Opacity</label>
              <div className="property-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={getSimpleValue(
                    getDisplayValue('paint.fillExtrusionOpacity') || getDisplayValue('paint.fill-extrusion-opacity'),
                    1
                  )}
                  onChange={(e) => updateLayerProperty('paint.fill-extrusion-opacity', parseFloat(e.target.value))}
                  className="property-slider"
                />
                <span className="property-value">
                  {Math.round(getSimpleValue(
                    getDisplayValue('paint.fillExtrusionOpacity') || getDisplayValue('paint.fill-extrusion-opacity'),
                    1
                  ) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Symbol (labels/icons) Properties */}
        {selectedLayer.type === 'symbol' && (
          <div className="property-group">
            <h6 className="property-group-title">Symbol / Label Properties</h6>

            <div className="property-item">
              <label className="property-label">Text Color</label>
              <div className="property-control">
                <ColorPicker
                  value={getDisplayValue('paint.textColor') || getDisplayValue('paint.text-color') || '#ffffff'}
                  onChange={(color) => updateLayerProperty('paint.text-color', color)}
                />
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Text Halo Color</label>
              <div className="property-control">
                <ColorPicker
                  value={getDisplayValue('paint.textHaloColor') || getDisplayValue('paint.text-halo-color') || '#000000'}
                  onChange={(color) => updateLayerProperty('paint.text-halo-color', color)}
                />
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Icon Color</label>
              <div className="property-control">
                <ColorPicker
                  value={getDisplayValue('paint.iconColor') || getDisplayValue('paint.icon-color') || '#ffffff'}
                  onChange={(color) => updateLayerProperty('paint.icon-color', color)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Zoom Settings */}
        <div className="property-group">
          <h6 className="property-group-title">Zoom Settings</h6>
          
          <div className="property-item">
            <label className="property-label">Min Zoom</label>
            <div className="property-control">
              <input 
                type="range" 
                min="0" 
                max="24" 
                step="1"
                value={getDisplayValue('minzoom', 0)}
                onChange={(e) => updateLayerProperty('minzoom', parseInt(e.target.value))}
                className="property-slider"
              />
              <input 
                type="number" 
                className="property-input"
                value={getDisplayValue('minzoom', 0)}
                onChange={(e) => updateLayerProperty('minzoom', parseInt(e.target.value) || 0)}
                min="0"
                max="24"
              />
            </div>
          </div>

          <div className="property-item">
            <label className="property-label">Max Zoom</label>
            <div className="property-control">
              <input 
                type="range" 
                min="0" 
                max="24" 
                step="1"
                value={getDisplayValue('maxzoom', 24)}
                onChange={(e) => updateLayerProperty('maxzoom', parseInt(e.target.value))}
                className="property-slider"
              />
              <input 
                type="number" 
                className="property-input"
                value={getDisplayValue('maxzoom', 24)}
                onChange={(e) => updateLayerProperty('maxzoom', parseInt(e.target.value) || 24)}
                min="0"
                max="24"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;