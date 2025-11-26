import React from 'react';
import './LayerItem.css';

const LayerItem = ({ layer, isSelected, isVisible, onSelect, onToggleVisibility }) => {
  const handleToggleVisibility = (e) => {
    e.stopPropagation();
    onToggleVisibility(layer.id, !isVisible);
  };

  const handleSelectLayer = () => {
    onSelect(layer);
  };

  const getDisplayName = (layer) => {
    return layer.id || 'Unnamed Layer';
  };

  return (
    <div 
      className={`layer-item ${isSelected ? 'selected' : ''}`}
      onClick={handleSelectLayer}
    >
      <div className="layer-main">
        <button 
          className="visibility-toggle"
          onClick={handleToggleVisibility}
          title={isVisible ? 'Hide layer' : 'Show layer'}
        >
          {isVisible ? '👁️' : '👁️‍🗨️'}
        </button>
        
        <span className="layer-icon">{layer.icon}</span>
        
        <span className="layer-name" title={layer.id}>
          {getDisplayName(layer)}
        </span>
        
        <span className="layer-type" data-type={layer.type}>
          {layer.type}
        </span>
      </div>
    </div>
  );
};

export default LayerItem;