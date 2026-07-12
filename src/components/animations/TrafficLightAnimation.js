import React from 'react';
import { Viro3DObject, ViroNode, ViroSphere } from '@reactvision/react-viro';

export default function TrafficLightAnimation({
  obj,
  config,
  opacity,
  animationTime = 0,
}) {
  const t = animationTime;

  // Cycle definition (12 seconds total):
  // Green: 0 <= t < 5000ms
  // Yellow: 5000 <= t < 7000ms
  // Red: 7000 <= t < 12000ms
  const isGreen = t >= 0 && t < 5000;
  const isYellow = t >= 5000 && t < 7000;
  const isRed = t >= 7000 && t < 12000;

  const bulbOpacity = opacity ?? 1.0;

  return (
    <ViroNode scale={config.scale}>
      {/* Base traffic light mesh */}
      <Viro3DObject
        position={[0, 0, 0]}
        source={config.source}
        type={config.fileFormat || 'GLB'}
        opacity={opacity}
      />

      {/* Red Indicator Bulb */}
      <ViroSphere
        position={[0, 2.2, 0.35]}
        scale={[1, 1, 1]}
        radius={0.12}
        materials={[isRed ? 'trafficRedActive' : 'trafficRedDim']}
        opacity={bulbOpacity}
      />

      {/* Yellow Indicator Bulb */}
      <ViroSphere
        position={[0, 1.8, 0.35]}
        scale={[1, 1, 1]}
        radius={0.12}
        materials={[isYellow ? 'trafficYellowActive' : 'trafficYellowDim']}
        opacity={bulbOpacity}
      />

      {/* Green Indicator Bulb */}
      <ViroSphere
        position={[0, 1.4, 0.35]}
        scale={[1, 1, 1]}
        radius={0.12}
        materials={[isGreen ? 'trafficGreenActive' : 'trafficGreenDim']}
        opacity={bulbOpacity}
      />
    </ViroNode>
  );
}
