import { useState, useEffect } from 'react';

export const usePanelResize = (initialLeftWidth = '25%', initialRightWidth = '25%') => {
  const [leftPanelWidth, setLeftPanelWidth] = useState(initialLeftWidth);
  const [rightPanelWidth, setRightPanelWidth] = useState(initialRightWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const screenWidth = window.innerWidth;
      const mouseX = e.clientX;
      
      // Calculate percentages
      const leftPercent = (mouseX / screenWidth) * 100;
      const rightPercent = ((screenWidth - mouseX) / screenWidth) * 100;

      // Set constraints (min 15%, max 40%)
      const constrainedLeft = Math.max(15, Math.min(40, leftPercent));
      const constrainedRight = Math.max(15, Math.min(40, rightPercent));

      setLeftPanelWidth(`${constrainedLeft}%`);
      setRightPanelWidth(`${constrainedRight}%`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const startResizing = () => {
    setIsResizing(true);
  };

  return {
    leftPanelWidth,
    rightPanelWidth,
    isResizing,
    startResizing
  };
};