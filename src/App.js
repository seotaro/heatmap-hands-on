import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

import useMap from './Map';

// 共通スタイル
const BGCOLOR = 'rgba(255, 255, 255, 0.9)';
const BOXSHADOW = '4px 4px 8px 0 rgba(0, 0, 0, 0.25)';
const BORDERRADIUS = 3;
const DEBUG_BGCOLOR = 'rgba(255, 0, 0, 0.5)';

const Settings = (props) => {
  return (
    <Box sx={{
      m: 2, mt: 3, p: 1,
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      bgcolor: BGCOLOR,
      borderRadius: BORDERRADIUS,
      boxShadow: BOXSHADOW,
      width: 400,
    }} >
      <Stack sx={{ flex: 1 }}>

        {/* weight */}
        <Box sx={{
          flex: 1, m: 0, p: 0,
          display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}>
          <Typography sx={{ mx: 1, width: 100 }} id="weight-input-slider" variant="subtitle1" >weight</Typography>
          <Slider
            sx={{ mx: 2, }}
            value={[props.weight.lower, props.weight.upper]}
            onChange={(_, newValue) => props.onChangeWeight({ lower: newValue[0], upper: newValue[1] })}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            aria-labelledby="weight-input-slider"
          />
        </Box>

        {/* radius */}
        <Box sx={{
          flex: 1, m: 0, p: 0,
          display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}>
          <Typography sx={{ mx: 1, width: 100 }} id="radius-input-slider" variant="subtitle1" >radius</Typography>
          <Slider
            sx={{ mx: 2, }}
            value={props.radius}
            onChange={(_, newValue) => props.onChangeRadius(newValue)}
            valueLabelDisplay="auto"
            track={false}
            min={0}
            max={100}
            aria-labelledby="radius-input-slider"
          />
        </Box>

        {/* intensity */}
        <Box sx={{
          flex: 1, m: 0, p: 0,
          display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}>
          <Typography sx={{ mx: 1, width: 100 }} id="intensity-input-slider" variant="subtitle1" >intensity</Typography>
          <Slider
            sx={{ mx: 2, }}
            value={props.intensity}
            onChange={(_, newValue) => props.onChangeIntensity(newValue)}
            valueLabelDisplay="auto"
            track={false}
            min={0}
            max={100}
            aria-labelledby="intensity-input-slider"
          />
        </Box>
      </Stack>
    </Box >
  );
};

function App() {
  const [mapContainer, heatmapProperty, { setHeatmapProperty }] = useMap();

  // 他の useState とは別に画面更新を行うためのフラグ
  const [rerenderFlg, setRerenderFlg] = useState(0);
  const rerender = () => {
    setRerenderFlg((c) => c + 1);
  }

  const onChangeWeight = (weight) => {
    if (weight.lower < weight.upper) {
      setHeatmapProperty({ weight });
      rerender();
    }
  };

  const onChangeRadius = (radius) => {
    setHeatmapProperty({ radius });
    rerender();
  };

  const onChangeIntensity = (intensity) => {
    setHeatmapProperty({ intensity });
    rerender();
  };

  return (<>
    <Box ref={mapContainer} id='map-container' />

    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      overflowY: 'scroll',
      zIndex: 1000,
    }}>
      <Settings
        weight={heatmapProperty.weight}
        intensity={heatmapProperty.intensity}
        radius={heatmapProperty.radius}
        onChangeWeight={onChangeWeight}
        onChangeRadius={onChangeRadius}
        onChangeIntensity={onChangeIntensity}
      />
    </Box>
  </>);
}

export default App;
