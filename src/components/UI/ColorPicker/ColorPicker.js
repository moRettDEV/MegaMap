import React, { useState, useRef, useEffect } from 'react';
import { useColorPicker } from '../../../hooks/useColorPicker';
import './ColorPicker.css';

const ColorPicker = ({ value = '#000000', onChange = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef(null);
  const { isSupported, pickColor } = useColorPicker();

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = (newColor) => {
    const normalizedColor = newColor.startsWith('#') ? newColor : `#${newColor}`;
    setInputValue(normalizedColor);
    onChange(normalizedColor);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validate and apply color if valid
    if (/^#?[0-9A-Fa-f]{6}$/.test(value) || /^#?[0-9A-Fa-f]{3}$/.test(value)) {
      const normalizedColor = value.startsWith('#') ? value : `#${value}`;
      onChange(normalizedColor);
    }
  };

  const handleInputBlur = () => {
    // Normalize input on blur
    if (inputValue && !inputValue.startsWith('#')) {
      const normalizedColor = `#${inputValue}`;
      setInputValue(normalizedColor);
      onChange(normalizedColor);
    }
  };

  const handleEyeDropper = async () => {
    if (!isSupported) return;
    
    try {
      const color = await pickColor();
      if (color) {
        handleColorChange(color);
      }
    } catch (error) {
      console.warn('EyeDropper not supported or cancelled:', error);
    }
  };

  // Preset colors for quick selection
  const presetColors = [
    '#000000', '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00',
    '#34C759', '#007AFF', '#5856D6', '#AF52DE', '#FF2D55',
    '#8E8E93', '#C7C7CC', '#D1D1D6', '#E5E5EA', '#F2F2F7'
  ];

  return (
    <div className="color-picker-container" ref={containerRef}>
      <div className="color-controls">
        <div 
          className="color-preview"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
          title="Click to open color picker"
        />
        
        <input
          type="text"
          className="color-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="#000000"
          maxLength={7}
        />
        
        {isSupported && (
          <button
            className="eye-dropper-btn"
            onClick={handleEyeDropper}
            title="Pick color from screen"
          >
            🎨
          </button>
        )}
      </div>

      {isOpen && (
        <div className="color-picker-dropdown">
          <div className="preset-colors">
            {presetColors.map((color) => (
              <button
                key={color}
                className="preset-color"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
                title={color}
              />
            ))}
          </div>
          
          <div className="custom-color-section">
            <input
              type="color"
              value={value}
              onChange={(e) => handleColorChange(e.target.value)}
              className="native-color-picker"
            />
            <label className="custom-color-label">Custom Color</label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;