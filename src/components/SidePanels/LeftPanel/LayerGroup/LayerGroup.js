import React, { useState } from 'react';
import { useMapStyle } from '../../../../context/MapStyleContext';
import LayerItem from '../LayerItem/LayerItem';
import './LayerGroup.css';

const LayerGroup = ({ group, isExpanded, selectedLayer }) => {
  const [isGroupExpanded, setIsGroupExpanded] = useState(isExpanded);
  const { dispatch, mapStyle } = useMapStyle();

  // Update when parent expansion state changes
  React.useEffect(() => {
    setIsGroupExpanded(isExpanded);
  }, [isExpanded]);

  const handleGroupToggle = () => {
    setIsGroupExpanded(!isGroupExpanded);
  };

  const handleLayerSelect = (layer) => {
    dispatch({
      type: 'SET_SELECTED_LAYER',
      payload: layer
    });
  };

  const getLayerVisibility = (layer) => {
    return layer.layout?.visibility !== 'none';
  };

  const toggleLayerVisibility = (layerId, isVisible) => {
    dispatch({
      type: 'TOGGLE_LAYER_VISIBILITY',
      payload: {
        layerId,
        isVisible
      }
    });
  };

  return (
    <div className="layer-group">
      <div 
        className="group-header"
        onClick={handleGroupToggle}
      >
        <div className="group-info">
          <span className="group-icon">{group.icon}</span>
          <span className="group-name">{group.name}</span>
          <span className="group-count">({group.layers.length})</span>
        </div>
        <span className="group-toggle">
          {isGroupExpanded ? '▼' : '►'}
        </span>
      </div>
      
      {isGroupExpanded && (
        <div className="group-layers">
          {group.layers.map(layer => (
            <LayerItem 
              key={layer.id}
              layer={layer}
              isSelected={selectedLayer?.id === layer.id}
              isVisible={getLayerVisibility(layer)}
              onSelect={handleLayerSelect}
              onToggleVisibility={toggleLayerVisibility}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LayerGroup;