import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import LeftPanel from '../SidePanels/LeftPanel/LeftPanel';
import RightPanel from '../SidePanels/RightPanel/RightPanel';
import MapComponent from '../Map/MapComponent';
import './MainLayout.css';

const MainLayout = () => {
  const { theme } = useTheme();

  return (
    <div className="main-layout" data-theme={theme}>
      <div className="layout-container">
        <div className="panel-container left-panel-container">
          <LeftPanel />
        </div>

        <div className="map-container">
          <MapComponent />
        </div>

        <div className="panel-container right-panel-container">
          <RightPanel />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;