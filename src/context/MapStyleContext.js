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