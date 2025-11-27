import React, { useState } from 'react';
import { useMapStyle } from '../../../context/MapStyleContext';
import GlassCard from '../../UI/GlassCard/GlassCard';
import PropertiesPanel from './PropertiesPanel/PropertiesPanel';
import './RightPanel.css';

const RightPanel = () => {
  const { mapStyle, dispatch } = useMapStyle();
  const [isHidden, setIsHidden] = useState(false);
  const [configName, setConfigName] = useState(mapStyle?.name || '');

  // keep configName in sync when a new style is loaded via context
  React.useEffect(() => {
    setConfigName(mapStyle?.name || '');
  }, [mapStyle]);

  const handleHideToggle = () => {
    const newHidden = !isHidden;
    setIsHidden(newHidden);
    toggleUIHidden(newHidden, true);
  };

  // Toggle UI with keyboard (F). If toggled via keyboard, do not create floating unhide button;
  // use F again to restore UI.
  React.useEffect(() => {
    const onKey = (e) => {
      // ignore when typing in inputs or editable elements
      const target = e.target;
      const tag = target && target.tagName && target.tagName.toLowerCase();
      const editable = target && (target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select');
      if (editable) return;

      if (e.key === 'f' || e.key === 'F' || e.code === 'KeyF') {
        e.preventDefault();
        const newHidden = !isHidden;
        setIsHidden(newHidden);
        // when using keyboard, do NOT create the floating unhide button
        toggleUIHidden(newHidden, false);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isHidden]);

  // Toggle hiding entire UI (for fullscreen map screenshots)
  const toggleUIHidden = (hide, createUnhideButton = true) => {
    const root = document.querySelector('.main-layout');
    const existing = document.getElementById('ui-unhide-btn');

    if (hide) {
      if (root) root.classList.add('ui-hidden');

      // create a small unhide button if it doesn't exist and caller allows it
      if (createUnhideButton && !existing) {
        const btn = document.createElement('button');
        btn.id = 'ui-unhide-btn';
        btn.innerText = 'Show UI';
        btn.title = 'Show UI';
        Object.assign(btn.style, {
          position: 'fixed',
          top: '10px',
          right: '10px',
          zIndex: 99999,
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        });
        btn.onclick = () => {
          toggleUIHidden(false, true);
          setIsHidden(false);
        };
        document.body.appendChild(btn);
      }
    } else {
      if (root) root.classList.remove('ui-hidden');
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    }
  };

  const handleSave = () => {
    const styleToSave = {
      ...(mapStyle || {}),
      name: configName || 'Unnamed Style'
    };
    
    const blob = new Blob([JSON.stringify(styleToSave, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${configName || 'map-style'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.style.display = 'none';

      input.onchange = (e) => {
        try {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const styleJson = JSON.parse(event.target.result);
                dispatch({ type: 'LOAD_STYLE', payload: styleJson });
                setConfigName(styleJson.name || '');
              } catch (error) {
                alert('Error loading style file');
              }
            };
            reader.readAsText(file);
          }
        } finally {
          // remove input after use
          if (input && input.parentNode) input.parentNode.removeChild(input);
        }
      };

      // append to DOM before clicking to avoid some browsers blocking the file dialog
      document.body.appendChild(input);
      input.click();
    } catch (err) {
      console.error('handleLoad error', err);
      alert('Не удалось открыть диалог выбора файла');
    }
  };

  const handleReset = () => {
  const defaultStyle = {
    version: 8,
    name: 'Default Dark Style',
    sources: {
      "openmaptiles": {
        "type": "vector",
        "url": "https://api.maptiler.com/tiles/v3/tiles.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL"
      }
    },
    glyphs: "https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=get_your_own_OpIi9ZULNHzrESv6T2vL",
    sprite: "https://api.maptiler.com/maps/basic/sprite",
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': 'rgba(15, 17, 22, 1)'
        }
      },
      {
        id: 'water',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'water',
        paint: {
          'fill-color': 'rgba(40, 100, 190, 1)',
          'fill-opacity': 0.8
        }
      },
      {
        id: 'park',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'park',
        paint: {
          'fill-color': 'rgba(40, 52, 59, 1)',
          'fill-opacity': 0.3
        }
      },
      {
        id: 'landcover_wood',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'landcover',
        filter: ['==', 'class', 'wood'],
        paint: {
          'fill-color': 'rgba(35, 60, 55, 0.85)',
          'fill-opacity': 0.8
        }
      },
      {
        id: 'roads',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        paint: {
          'line-color': 'rgba(100, 100, 100, 1)',
          'line-width': 2
        }
      },
      {
        id: 'buildings',
        type: 'fill',
        source: 'openmaptiles',
        'source-layer': 'building',
        paint: {
          'fill-color': 'rgba(55, 62, 75, 1)',
          'fill-opacity': 0.6
        }
      }
    ]
  };
  
  dispatch({ type: 'LOAD_STYLE', payload: defaultStyle });
  setConfigName('Default Dark Style');
};

  if (isHidden) {
    return (
      <div className="right-panel-hidden">
        <button className="show-panel-btn" onClick={handleHideToggle}>◀</button>
      </div>
    );
  }

  return (
    <GlassCard className="right-panel">
      <div className="config-header">
        <h4>Style Properties</h4>
        <div className="config-controls">
          <input 
            type="text" 
            placeholder="Style name..."
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            className="config-input"
          />
          <div className="control-buttons">
            <button className="control-btn save-btn" onClick={handleSave}>💾 Save</button>
            <button className="control-btn load-btn" onClick={handleLoad}>📂 Load</button>
            <button className="control-btn reset-btn" onClick={handleReset}>🔄 Reset</button>
            <button className="control-btn hide-btn" onClick={handleHideToggle}>👁️ Hide</button>
          </div>
        </div>
      </div>
      
      <div className="properties-section">
        <PropertiesPanel />
      </div>
    </GlassCard>
  );
};

export default RightPanel;