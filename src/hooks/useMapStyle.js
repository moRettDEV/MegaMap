import { useState, useEffect } from 'react';

// Initial empty style
const initialStyle = {
  version: 8,
  name: 'New Style',
  sources: {},
  layers: []
};

export const useMapStyle = () => {
  const [mapStyle, setMapStyle] = useState(initialStyle);
  const [selectedLayer, setSelectedLayer] = useState(null);

  // Load style from localStorage on init
  useEffect(() => {
    const savedStyle = localStorage.getItem('map-style-editor-current-style');
    if (savedStyle) {
      try {
        setMapStyle(JSON.parse(savedStyle));
      } catch (error) {
        console.warn('Failed to parse saved style:', error);
      }
    }
  }, []);

  // Save style to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('map-style-editor-current-style', JSON.stringify(mapStyle));
  }, [mapStyle]);

  const updateLayerProperty = (layerId, property, value) => {
    setMapStyle(prevStyle => ({
      ...prevStyle,
      layers: prevStyle.layers.map(layer => {
        if (layer.id === layerId) {
          // Handle paint and layout properties
          if (property.startsWith('paint.')) {
            const paintProperty = property.replace('paint.', '');
            return {
              ...layer,
              paint: {
                ...layer.paint,
                [paintProperty]: value
              }
            };
          } else if (property.startsWith('layout.')) {
            const layoutProperty = property.replace('layout.', '');
            return {
              ...layer,
              layout: {
                ...layer.layout,
                [layoutProperty]: value
              }
            };
          } else {
            return {
              ...layer,
              [property]: value
            };
          }
        }
        return layer;
      })
    }));
  };

  const toggleLayerVisibility = (layerId, isVisible) => {
    updateLayerProperty(layerId, 'layout.visibility', isVisible ? 'visible' : 'none');
  };

  const loadStyle = (styleJson) => {
    try {
      setMapStyle(styleJson);
    } catch (error) {
      console.error('Failed to load style:', error);
    }
  };

  const saveStyle = () => {
    const blob = new Blob([JSON.stringify(mapStyle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mapStyle.name || 'map-style'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    mapStyle,
    setMapStyle,
    selectedLayer,
    setSelectedLayer,
    updateLayerProperty,
    toggleLayerVisibility,
    loadStyle,
    saveStyle
  };
};