import React from 'react';
import { Viro3DObject, ViroNode, ViroSphere } from '@reactvision/react-viro';

export default function CarAnimation({
  obj,
  config,
  opacity,
  animationTime = 0,
}) {
  const t = animationTime;

  // Cycle definition (12 seconds total):
  // Green: 0 <= t < 5000ms -> moves from Z = 1.0 to Z = 0.0 (constant speed)
  // Yellow: 5000 <= t < 7000ms -> slows down from Z = 0.0 to Z = -0.2 (ease-out deceleration)
  // Red Stop: 7000 <= t < 10000ms -> stopped at Z = -0.2
  // Red Fade Out: 10000 <= t < 11000ms -> stopped at Z = -0.2, fade 1.0 -> 0.0
  // Red Reset: 11000 <= t < 12000ms -> teleport to Z = 1.0, fade 0.0 -> 1.0

  let localZ = 1.0;
  let animOpacity = 1.0;

  if (t < 5000) {
    const progress = t / 5000;
    localZ = 1.0 - progress * 1.0;
    animOpacity = 1.0;
  } else if (t < 7000) {
    const progress = (t - 5000) / 2000;
    const easeOut = progress * (2 - progress); // quadratic ease-out
    localZ = 0.0 - easeOut * 0.2;
    animOpacity = 1.0;
  } else if (t < 10000) {
    localZ = -0.2;
    animOpacity = 1.0;
  } else if (t < 11000) {
    localZ = -0.2;
    const progress = (t - 10000) / 1000;
    animOpacity = 1.0 - progress;
  } else {
    localZ = 1.0;
    const progress = (t - 11000) / 1000;
    animOpacity = progress;
  }

  // Combined opacity considering both selection/preview opacity and animation state
  const combinedOpacity = (opacity ?? 1.0) * animOpacity;

  return (
    <ViroNode position={[0, 0, localZ]} scale={config.scale} opacity={combinedOpacity}>
      {/* Base car mesh */}
      <Viro3DObject
        position={[0, 0, 0]}
        source={config.source}
        type={config.fileFormat || 'GLB'}
      />

      {/* Headlights: two small glowing spheres at the front of the car.
          Positioned in model space so they scale automatically. */}
      {combinedOpacity > 0.05 ? (
        <>
          {/* Left Headlight */}
          <ViroSphere
            position={[-0.5, 0.5, -1.6]}
            scale={[1, 1, 1]}
            radius={0.15}
            materials={['carHeadlightActive']}
          />
          {/* Right Headlight */}
          <ViroSphere
            position={[0.5, 0.5, -1.6]}
            scale={[1, 1, 1]}
            radius={0.15}
            materials={['carHeadlightActive']}
          />
        </>
      ) : null}
    </ViroNode>
  );
}
