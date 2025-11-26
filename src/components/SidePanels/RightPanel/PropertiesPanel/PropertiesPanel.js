import React from 'react';
import { useMapStyle } from '../../../../context/MapStyleContext';
import ColorPicker from '../../../UI/ColorPicker/ColorPicker';
import './PropertiesPanel.css';

const PropertiesPanel = () => {
  const { selectedLayer, dispatch } = useMapStyle();

  const updateLayerProperty = (property, value) => {
    if (!selectedLayer) return;

    dispatch({
      type: 'UPDATE_LAYER_PROPERTY',
      payload: {
        layerId: selectedLayer.id,
        property,
        value
      }
    });
  };

  const getPropertyValue = (propertyPath) => {
    if (!selectedLayer) return null;
    
    const parts = propertyPath.split('.');
    let value = selectedLayer;
    
    for (const part of parts) {
      if (value && value[part] !== undefined) {
        value = value[part];
      } else {
        return null;
      }
    }
    
    return value;
  };

  if (!selectedLayer) {
    return (
      <div className="no-selection">
        <div className="no-selection-icon">🎨</div>
        <p>Select a layer to edit properties</p>
      </div>
    );
  }

  const getVisibility = () => {
    return selectedLayer.layout?.visibility !== 'none';
  };

  const handleVisibilityChange = (isVisible) => {
    updateLayerProperty('layout.visibility', isVisible ? 'visible' : 'none');
  };

  return (
    <div className="properties-panel">
      <div className="layer-info">
        <h5 className="layer-name">{selectedLayer.id}</h5>
        <span className="layer-type-badge">{selectedLayer.type}</span>
      </div>

      <div className="properties-list">
        {/* Visibility Toggle */}
        <div className="property-group">
          <h6 className="property-group-title">Visibility</h6>
          
          <div className="property-item">
            <label className="property-label">Layer Visibility</label>
            <div className="property-control">
              <select 
                className="property-select"
                value={getVisibility() ? 'visible' : 'none'}
                onChange={(e) => handleVisibilityChange(e.target.value === 'visible')}
              >
                <option value="visible">Visible</option>
                <option value="none">Hidden</option>
              </select>
            </div>
          </div>
        </div>

        {/* Background Properties */}
        {selectedLayer.type === 'background' && (
          <div className="property-group">
            <h6 className="property-group-title">Background Properties</h6>
            
            <div className="property-item">
              <label className="property-label">Background Color</label>
              <div className="property-control">
                <ColorPicker 
                  value={getPropertyValue('paint.backgroundColor') || getPropertyValue('paint.background-color') || '#000000'}
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
                  value={getPropertyValue('paint.fillColor') || getPropertyValue('paint.fill-color') || '#3388ff'}
                  onChange={(color) => updateLayerProperty('paint.fill-color', color)}
                />
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Opacity</label>
              <div className="property-control">
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  value={getPropertyValue('paint.fillOpacity') || getPropertyValue('paint.fill-opacity') || 1}
                  onChange={(e) => updateLayerProperty('paint.fill-opacity', parseFloat(e.target.value))}
                  className="property-slider"
                />
                <span className="property-value">{getPropertyValue('paint.fillOpacity') || getPropertyValue('paint.fill-opacity') || 1}</span>
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
                  value={getPropertyValue('paint.lineColor') || getPropertyValue('paint.line-color') || '#000000'}
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
                  step="0.5"
                  value={getPropertyValue('paint.lineWidth') || getPropertyValue('paint.line-width') || 1}
                  onChange={(e) => updateLayerProperty('paint.line-width', parseFloat(e.target.value))}
                  className="property-slider"
                />
                <span className="property-value">{getPropertyValue('paint.lineWidth') || getPropertyValue('paint.line-width') || 1}px</span>
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
                type="number" 
                className="property-input"
                value={selectedLayer.minzoom || 0}
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
                type="number" 
                className="property-input"
                value={selectedLayer.maxzoom || 24}
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