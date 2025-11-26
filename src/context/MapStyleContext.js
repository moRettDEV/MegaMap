import React, { createContext, useContext, useReducer } from 'react';

const MapStyleContext = createContext();

// Initial state with correct MapLibre properties
const initialState = {
  mapStyle: {
    version: 8,
    name: 'OSM Basic',
    sources: {
      "osm": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256
      }
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": "#1a1a1a"
        }
      },
      {
        id: "osm",
        type: "raster",
        source: "osm"
      }
    ]
  },
  selectedLayer: null
};

// Actions
const ACTIONS = {
  SET_MAP_STYLE: 'SET_MAP_STYLE',
  SET_SELECTED_LAYER: 'SET_SELECTED_LAYER',
  UPDATE_LAYER_PROPERTY: 'UPDATE_LAYER_PROPERTY',
  TOGGLE_LAYER_VISIBILITY: 'TOGGLE_LAYER_VISIBILITY',
  LOAD_STYLE: 'LOAD_STYLE'
};

// Reducer
const mapStyleReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_MAP_STYLE:
      return {
        ...state,
        mapStyle: action.payload
      };

    case ACTIONS.SET_SELECTED_LAYER:
      return {
        ...state,
        selectedLayer: action.payload
      };

    case ACTIONS.UPDATE_LAYER_PROPERTY:
      const { layerId, property, value } = action.payload;
      return {
        ...state,
        mapStyle: {
          ...state.mapStyle,
          layers: state.mapStyle.layers.map(layer => {
            if (layer.id === layerId) {
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
        }
      };

    case ACTIONS.TOGGLE_LAYER_VISIBILITY:
      return {
        ...state,
        mapStyle: {
          ...state.mapStyle,
          layers: state.mapStyle.layers.map(layer => {
            if (layer.id === action.payload.layerId) {
              return {
                ...layer,
                layout: {
                  ...layer.layout,
                  visibility: action.payload.isVisible ? 'visible' : 'none'
                }
              };
            }
            return layer;
          })
        }
      };

    case ACTIONS.LOAD_STYLE:
      return {
        ...state,
        mapStyle: action.payload,
        selectedLayer: null
      };

    default:
      return state;
  }
};

// Provider
export const MapStyleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapStyleReducer, initialState);

  // Load from localStorage on init
  React.useEffect(() => {
    const savedStyle = localStorage.getItem('map-style-editor-current-style');
    if (savedStyle) {
      try {
        const parsedStyle = JSON.parse(savedStyle);
        dispatch({
          type: ACTIONS.LOAD_STYLE,
          payload: parsedStyle
        });
      } catch (error) {
        console.warn('Failed to parse saved style:', error);
      }
    }
  }, []);

  // Save to localStorage when style changes
  React.useEffect(() => {
    try {
      localStorage.setItem('map-style-editor-current-style', JSON.stringify(state.mapStyle));
    } catch (error) {
      console.warn('Failed to save style to localStorage:', error);
    }
  }, [state.mapStyle]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <MapStyleContext.Provider value={value}>
      {children}
    </MapStyleContext.Provider>
  );
};

// Hook
export const useMapStyle = () => {
  const context = useContext(MapStyleContext);
  if (!context) {
    throw new Error('useMapStyle must be used within a MapStyleProvider');
  }
  return context;
};