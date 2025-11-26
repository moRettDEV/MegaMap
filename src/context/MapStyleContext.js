import React, { createContext, useContext, useReducer } from 'react';

// Исходный работающий стиль
const ORIGINAL_MEGAMAP_JSON = {
  "version": 8,
  "name": "OSM Liberty Dark",
  "sources": {
    "openmaptiles": {
      "type": "vector",
      "url": "https://api.maptiler.com/tiles/v3-openmaptiles/tiles.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL"
    },
    "natural_earth_shaded_relief": {
      "maxzoom": 6,
      "tileSize": 256,
      "tiles": [
        "https://klokantech.github.io/naturalearthtiles/tiles/natural_earth_2_shaded_relief.raster/{z}/{x}/{y}.png"
      ],
      "type": "raster"
    }
  },
  "sprite": "https://maputnik.github.io/osm-liberty/sprites/osm-liberty",
  "glyphs": "https://orangemug.github.io/font-glyphs/glyphs/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {
        "background-color": "rgba(15, 17, 22, 1)"
      }
    },
    {
      "id": "natural_earth",
      "type": "raster",
      "source": "natural_earth_shaded_relief",
      "maxzoom": 6,
      "paint": {
        "raster-opacity": 0.5
      }
    },
    {
      "id": "water",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "water",
      "filter": [
        "all",
        [
          "!=",
          "brunnel",
          "tunnel"
        ]
      ],
      "paint": {
        "fill-color": "rgba(40, 100, 190, 1)"
      }
    },
    {
      "id": "building-3d",
      "type": "fill-extrusion",
      "source": "openmaptiles",
      "source-layer": "building",
      "minzoom": 14,
      "paint": {
        "fill-extrusion-color": "rgba(55, 62, 75, 1)",
        "fill-extrusion-height": {
          "property": "render_height",
          "type": "identity"
        },
        "fill-extrusion-base": {
          "property": "render_min_height",
          "type": "identity"
        },
        "fill-extrusion-opacity": 0.4
      }
    }
    // ... остальные слои из оригинального JSON
  ]
};

const MapStyleContext = createContext();

const initialState = {
  mapStyle: ORIGINAL_MEGAMAP_JSON, // Сразу используем работающий стиль
  selectedLayer: null
};

const ACTIONS = {
  SET_MAP_STYLE: 'SET_MAP_STYLE',
  SET_SELECTED_LAYER: 'SET_SELECTED_LAYER', 
  UPDATE_LAYER_PROPERTY: 'UPDATE_LAYER_PROPERTY',
  TOGGLE_LAYER_VISIBILITY: 'TOGGLE_LAYER_VISIBILITY',
  LOAD_STYLE: 'LOAD_STYLE'
};

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

export const MapStyleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(mapStyleReducer, initialState);

  // ВРЕМЕННО отключаем сохранение в localStorage чтобы не портить данные
  // React.useEffect(() => {
  //   try {
  //     localStorage.setItem('map-style-editor-current-style', JSON.stringify(state.mapStyle));
  //   } catch (error) {
  //     console.warn('Failed to save style to localStorage:', error);
  //   }
  // }, [state.mapStyle]);

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

export const useMapStyle = () => {
  const context = useContext(MapStyleContext);
  if (!context) {
    throw new Error('useMapStyle must be used within a MapStyleProvider');
  }
  return context;
};