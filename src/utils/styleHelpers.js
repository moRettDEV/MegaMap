// Utility functions for map style operations

export const validateMapStyle = (style) => {
  const errors = [];
  
  if (!style) {
    errors.push('Style is undefined');
    return errors;
  }
  
  if (style.version !== 8) {
    errors.push('Only Mapbox GL version 8 styles are supported');
  }
  
  if (!style.sources) {
    errors.push('Style must have sources object');
  }
  
  if (!style.layers || !Array.isArray(style.layers)) {
    errors.push('Style must have layers array');
  }
  
  return errors;
};

export const findLayerById = (style, layerId) => {
  return style.layers?.find(layer => layer.id === layerId);
};

export const getLayerProperties = (layer) => {
  if (!layer) return {};
  
  const properties = {
    id: layer.id,
    type: layer.type,
    source: layer.source,
    'source-layer': layer['source-layer'],
    minzoom: layer.minzoom,
    maxzoom: layer.maxzoom,
    filter: layer.filter
  };
  
  // Extract paint properties
  if (layer.paint) {
    Object.keys(layer.paint).forEach(key => {
      properties[`paint.${key}`] = layer.paint[key];
    });
  }
  
  // Extract layout properties
  if (layer.layout) {
    Object.keys(layer.layout).forEach(key => {
      properties[`layout.${key}`] = layer.layout[key];
    });
  }
  
  return properties;
};

export const createDefaultLayer = (type, id, source = 'openmaptiles') => {
  const baseLayer = {
    id,
    type,
    source,
    'source-layer': 'your-source-layer'
  };
  
  switch (type) {
    case 'background':
      return {
        ...baseLayer,
        paint: {
          'background-color': '#000000',
          'background-opacity': 1
        }
      };
      
    case 'fill':
      return {
        ...baseLayer,
        paint: {
          'fill-color': '#3388ff',
          'fill-opacity': 0.5
        }
      };
      
    case 'line':
      return {
        ...baseLayer,
        paint: {
          'line-color': '#3388ff',
          'line-width': 2
        }
      };
      
    case 'symbol':
      return {
        ...baseLayer,
        layout: {
          'text-field': '{name}',
          'text-size': 14
        },
        paint: {
          'text-color': '#ffffff'
        }
      };
      
    default:
      return baseLayer;
  }
};

export const generateLayerId = () => {
  return `layer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};