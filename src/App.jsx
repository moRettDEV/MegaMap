import React from 'react';
import MainLayout from './components/Layout/MainLayout';
import { ThemeProvider } from './hooks/useTheme';
import { MapStyleProvider } from './context/MapStyleContext';
import './styles/globals.css';
import './styles/themes/dark.css';
import './styles/themes/light.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <MapStyleProvider>
        <div className="App">
          <MainLayout />
        </div>
      </MapStyleProvider>
    </ThemeProvider>
  );
}

export default App;