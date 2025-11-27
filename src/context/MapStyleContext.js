// context/MapStyleContext.js
import React, { createContext, useContext, useReducer } from 'react';

const MapStyleContext = createContext();

const mapStyleReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_STYLE':
      return {
        ...state,
        mapStyle: action.payload
      };
    case 'SET_SELECTED_LAYER':
      return {
        ...state,
        selectedLayer: action.payload || null
      };
    case 'TOGGLE_LAYER_VISIBILITY': {
      // payload: { layerId, isVisible }
      const { layerId, isVisible } = action.payload || {};
      if (!state.mapStyle || !Array.isArray(state.mapStyle.layers) || !layerId) return state;

      const updatedLayers = state.mapStyle.layers.map(layer => {
        if (layer.id !== layerId) return layer;
        return {
          ...layer,
          layout: {
            ...(layer.layout || {}),
            visibility: isVisible ? 'visible' : 'none'
          }
        };
      });

      return {
        ...state,
        mapStyle: {
          ...state.mapStyle,
          layers: updatedLayers
        }
      };
    }
    case 'REPLACE_COLOR_ACROSS_LAYERS': {
      // payload: { fromColor, toColor, property }
      const { fromColor, toColor, property } = action.payload || {};
      if (!state.mapStyle || !Array.isArray(state.mapStyle.layers) || !fromColor || !toColor || !property) return state;

      // helper: normalize color-like strings to a canonical hex (lowercase #rrggbb) when possible
      const toHex = (s) => {
        if (typeof s !== 'string') return null;
        const v = s.trim().toLowerCase();
        // hex (#fff, #ffffff, #ffffffff)
        const hexMatch = v.match(/^#([0-9a-f]{3,8})$/i);
        if (hexMatch) {
          let h = hexMatch[1];
          if (h.length === 3) {
            h = h.split('').map(c => c + c).join('');
          }
          // keep only rgb (ignore alpha if present)
          if (h.length >= 6) h = h.slice(0, 6);
          return `#${h}`.toLowerCase();
        }
        // rgb/rgba
        const rgbMatch = v.match(/^rgba?\(([^)]+)\)$/i);
        if (rgbMatch) {
          const parts = rgbMatch[1].split(',').map(p => p.trim());
          const r = parseInt(parts[0], 10) || 0;
          const g = parseInt(parts[1], 10) || 0;
          const b = parseInt(parts[2], 10) || 0;
          const toHexByte = (n) => (Math.max(0, Math.min(255, Number(n))) ).toString(16).padStart(2, '0');
          return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`.toLowerCase();
        }
        return v; // fallback to raw lowercased string
      };

      const normFrom = toHex(fromColor);

      // recursively replace occurrences inside values (strings or arrays/expressions)
      const replaceInValue = (val) => {
        if (typeof val === 'string') {
          const norm = toHex(val);
          if (norm && norm === normFrom) return toColor;
          return val;
        }
        if (Array.isArray(val)) {
          return val.map(replaceInValue);
        }
        // for objects or other types, leave unchanged
        return val;
      };

      const updated = state.mapStyle.layers.map(layer => {
        const parts = property.split('.');
        if (parts[0] !== 'paint' && parts[0] !== 'layout') return layer;

        const key = parts.slice(1).join('.');
        const paint = { ...(layer.paint || {}) };

        if (paint.hasOwnProperty(key)) {
          const newVal = replaceInValue(paint[key]);
          if (newVal !== paint[key]) {
            return {
              ...layer,
              paint: {
                ...paint,
                [key]: newVal
              }
            };
          }
        }

        // also try kebab-less key (legacy) for safety
        const altKey = key.replace(/-/g, '');
        if (paint.hasOwnProperty(altKey)) {
          const newVal = replaceInValue(paint[altKey]);
          if (newVal !== paint[altKey]) {
            return {
              ...layer,
              paint: {
                ...paint,
                [altKey]: newVal
              }
            };
          }
        }

        return layer;
      });

      return {
        ...state,
        mapStyle: {
          ...state.mapStyle,
          layers: updated
        }
      };
    }
    case 'UPDATE_LAYER_PROPERTY':
      // payload should be { layerId, property, value }
      // property can be a top-level key (e.g. 'minzoom') or a two-level path like 'paint.fill-color'
      const { layerId, property, value } = action.payload || {};
      if (!state.mapStyle || !Array.isArray(state.mapStyle.layers) || !layerId) {
        return state;
      }

      const layers = state.mapStyle.layers.map((layer) => {
        if (layer.id !== layerId) return layer;

        if (!property) {
          // merge provided value object into the layer when no property path provided
          if (value && typeof value === 'object') {
            return { ...layer, ...value };
          }
          return layer;
        }

        const parts = property.split('.');
        if (parts.length === 1) {
          return { ...layer, [property]: value };
        }

        // handle two-level property like 'paint.fill-color'
        const top = parts[0];
        const sub = parts.slice(1).join('.');
        return {
          ...layer,
          [top]: {
            ...(layer[top] || {}),
            [sub]: value
          }
        };
      });

      return {
        ...state,
        mapStyle: {
          ...state.mapStyle,
          layers
        }
      };
    default:
      return state;
  }
};

const initialState = {
  mapStyle: null, // или базовый стиль
  selectedLayer: null
};

export const MapStyleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapStyleReducer, initialState);

  return (
    <MapStyleContext.Provider value={{
      mapStyle: state.mapStyle,
      selectedLayer: state.selectedLayer,
      dispatch
    }}>
      {children}
    </MapStyleContext.Provider>
  );
};

export const useMapStyle = () => {
  const context = useContext(MapStyleContext);
  if (!context) {
    throw new Error('useMapStyle must be used within a MapStyleProvider');
  }
  return context;
};