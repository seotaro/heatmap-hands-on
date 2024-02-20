import React from 'react';
import Box from '@mui/material/Box';

import useMap from './Map';

function App() {
  const [mapContainer] = useMap();
  return (<Box ref={mapContainer} id='map-container' />);
}

export default App;
