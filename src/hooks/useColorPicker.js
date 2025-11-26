import { useState, useEffect } from 'react';

export const useColorPicker = () => {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if EyeDropper API is supported
    setIsSupported('EyeDropper' in window);
  }, []);

  const pickColor = async () => {
    if (!isSupported) return null;

    try {
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      return result.sRGBHex;
    } catch (error) {
      // User cancelled the eye dropper
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  };

  return { isSupported, pickColor };
};