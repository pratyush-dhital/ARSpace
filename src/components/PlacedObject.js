import React, { useRef, useEffect } from 'react';
import { ViroBox, ViroSphere, Viro3DObject, ViroNode, ViroParticleEmitter, ViroOmniLight, ViroPolygon } from '@reactvision/react-viro';
import { MODEL_CONFIGS } from '../utils/modelLoader';
import TrafficLightAnimation from './animations/TrafficLightAnimation';
import CarAnimation from './animations/CarAnimation';

const SELECTION_RING_SCALE = [0.28, 0.004, 0.28];

export default function PlacedObject({
  obj,
  isSelected,
  onSelect,
  onRotationChange,
  onPositionChange,
  isPreview = false,
  modelConfigs,
  getCameraPosition,
  registerRef,
  animationTime = 0,
}) {
  const nodeRef = useRef(null);
  const config = modelConfigs ? modelConfigs[obj.type] : MODEL_CONFIGS[obj.type];
  if (!config) return null;

  const rotation = obj.rotation ?? [0, 0, 0];
  const position = obj.position ?? [0, 0, -1.5];
  const castleTorchPositions = [
    [-0.16, 0.32, 0.16],
    [0.16, 0.32, 0.16],
    [-0.2, 0.22, -0.1],
    [0.2, 0.22, -0.1],
    [0, 0.16, 0.24],
  ];

  const latestPosRef = useRef(position);
  const startPosRef = useRef(position);
  const startDistRef = useRef(1.5);
  const dirVecRef = useRef([0, 0, -1]);

  // Sync ref with position changes from props (e.g. initial load or parent resets)
  useEffect(() => {
    latestPosRef.current = position;
  }, [position]);

  // Register native node reference with parent ARScene for high-performance gestures
  useEffect(() => {
    if (registerRef && !isPreview) {
      registerRef(obj.id, nodeRef.current);
      return () => registerRef(obj.id, null);
    }
  }, [obj.id, registerRef, isPreview]);

  const handlePinch = (pinchState, scaleFactor, source) => {
    if (!isSelected || isPreview) return;

    const camPos = getCameraPosition ? getCameraPosition() : [0, 0, 0];

    if (pinchState === 1) { // Pinch Start
      startPosRef.current = [...latestPosRef.current];
      const dx = startPosRef.current[0] - camPos[0];
      const dy = startPosRef.current[1] - camPos[1];
      const dz = startPosRef.current[2] - camPos[2];
      const startDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      startDistRef.current = startDist;
      dirVecRef.current = startDist > 0 ? [dx / startDist, dy / startDist, dz / startDist] : [0, 0, -1];
    } else if (pinchState === 2) { // Pinch Move
      // Pinching out (scaleFactor > 1) pushes object farther, pinching in (scaleFactor < 1) pulls it closer
      const newDist = Math.max(0.3, startDistRef.current * scaleFactor);
      const nextPos = [
        camPos[0] + dirVecRef.current[0] * newDist,
        camPos[1] + dirVecRef.current[1] * newDist,
        camPos[2] + dirVecRef.current[2] * newDist,
      ];
      latestPosRef.current = nextPos;
      nodeRef.current?.setNativeProps?.({ position: nextPos });
    } else if (pinchState === 3) { // Pinch End
      onPositionChange && onPositionChange(obj.id, latestPosRef.current);
    }
  };

  const handleRotate = (rotateState, rotationFactor) => {
    if (!isSelected || isPreview) return;

    const nextRotation = [
      rotation[0],
      rotation[1] + rotationFactor,
      rotation[2],
    ];

    if (rotateState === 3) {
      onRotationChange(obj.id, nextRotation);
      return;
    }

    nodeRef.current?.setNativeProps?.({ rotation: nextRotation });
  };

  const handleDrag = (dragToPos, source) => {
    if (!isSelected || isPreview) return;
    // Update local ref to keep track of the latest position without triggering re-renders
    latestPosRef.current = dragToPos;
  };

  const handleTouch = (touchState, touchPos, source) => {
    if (!isSelected || isPreview) return;
    // touchState === 3 is Touch Up (Release). Commit final position to React state.
    if (touchState === 3) {
      onPositionChange && onPositionChange(obj.id, latestPosRef.current);
    }
  };

  const handleClickState = (clickState, clickPos, source) => {
    if (!isSelected || isPreview) return;
    // clickState === 2 is Click Up (Release/Finished)
    if (clickState === 2) {
      onPositionChange && onPositionChange(obj.id, latestPosRef.current);
    }
  };

  const handleClick = () => {
    if (isPreview) return;
    onSelect(obj.id);
  };

  let model = null;
  const opacity = isPreview ? 0.45 : 1.0;

  if (obj.type === 'traffic_light') {
    model = (
      <TrafficLightAnimation
        obj={obj}
        config={config}
        opacity={opacity}
        animationTime={animationTime}
      />
    );
  } else if (obj.type === 'car') {
    model = (
      <CarAnimation
        obj={obj}
        config={config}
        opacity={opacity}
        animationTime={animationTime}
      />
    );
  } else if (config.type === 'cube') {
    model = (
      <ViroBox
        position={[0, 0, 0]}
        scale={config.scale}
        materials={[config.material]}
        opacity={opacity}
      />
    );
  } else if (config.type === 'sphere') {
    model = (
      <ViroSphere
        position={[0, 0, 0]}
        scale={config.scale}
        radius={1}
        materials={[config.material]}
        opacity={opacity}
      />
    );
  } else if (config.type === '3d_model') {
    model = (
      <Viro3DObject
        position={[0, 0, 0]}
        scale={config.scale}
        source={config.source}
        type={config.fileFormat || 'GLB'}
        {...(config.material ? { materials: [config.material] } : {})}
        opacity={opacity}
        onLoadStart={() => console.log(`[Viro3DObject] Load start for ${config.id} (source: ${config.source})`)}
        onLoadEnd={() => console.log(`[Viro3DObject] Load end success for ${config.id}`)}
        onError={(event) => console.warn(`[Viro3DObject] Load error for ${config.id}:`, event.nativeEvent.error)}
      />
    );
  } else {
    return null;
  }

  return (
    <ViroNode
      ref={nodeRef}
      position={position}
      rotation={rotation}
      onClick={isPreview ? undefined : handleClick}
      onClickState={(!isPreview && isSelected) ? handleClickState : undefined}
      onRotate={(!isPreview && isSelected) ? handleRotate : undefined}
      onDrag={(!isPreview && isSelected) ? handleDrag : undefined}
      onPinch={(!isPreview && isSelected) ? handlePinch : undefined}
      onTouch={(!isPreview && isSelected) ? handleTouch : undefined}
      dragType="FixedDistance"
    >
      {model}

      {/* Dynamic Interaction Effects */}
      {!isPreview && obj.interactionActive && config.interaction && (
        <>
          {config.interaction.type === 'fire' && (
            <>
              {[0, 90].map((yRotation) => (
                <ViroNode key={`campfire-flame-${yRotation}`} rotation={[0, yRotation, 0]}>
                  <ViroPolygon
                    position={[0, 0.18, 0]}
                    vertices={[[-0.09, -0.08], [-0.045, 0.08], [0, 0.2], [0.05, 0.06], [0.09, -0.08]]}
                    holes={[]}
                    materials={['campfireFlame']}
                  />
                  <ViroPolygon
                    position={[0, 0.17, 0.002]}
                    vertices={[[-0.04, -0.045], [-0.018, 0.07], [0, 0.14], [0.025, 0.045], [0.045, -0.045]]}
                    holes={[]}
                    materials={['campfireInnerFlame']}
                  />
                </ViroNode>
              ))}
              <ViroParticleEmitter
                position={[0, 0.13, 0]}
                duration={1200}
                run={true}
                loop={true}
                fixedToEmitter={true}
                image={{
                  source: require('../assets/particles/particle_fire.png'),
                  height: 0.16,
                  width: 0.1,
                  bloomThreshold: 0.0,
                }}
                spawnBehavior={{
                  particleLifetime: [450, 850],
                  emissionRatePerSecond: [24, 34],
                  spawnVolume: { shape: 'box', params: [0.08, 0.02, 0.08], spawnOnSurface: false },
                  maxParticles: 60,
                }}
                particleAppearance={{
                  opacity: {
                    initialRange: [0.6, 0.95],
                    factor: 'time',
                    interpolation: [{ endValue: 0.0, interval: [450, 900] }],
                  },
                  scale: {
                    initialRange: [[0.7, 0.95, 0.7], [1.15, 1.45, 1.15]],
                    factor: 'time',
                    interpolation: [{ endValue: [0.15, 0.15, 0.15], interval: [500, 900] }],
                  },
                }}
                particlePhysics={{
                  velocity: {
                    initialRange: [[-0.03, 0.12, -0.03], [0.03, 0.28, 0.03]],
                  },
                }}
              />
              <ViroOmniLight
                position={[0, 0.2, 0]}
                color="#FF8A00"
                intensity={450}
                attenuationStartDistance={0.02}
                attenuationEndDistance={0.35}
              />
            </>
          )}

          {config.interaction.type === 'torch_glow' && (
            <>
              {castleTorchPositions.map((torchPosition, index) => (
                <ViroNode key={`castle-torch-${index}`} position={torchPosition}>
                  {[0, 90].map((yRotation) => (
                    <ViroNode key={`castle-torch-flame-${index}-${yRotation}`} rotation={[0, yRotation, 0]}>
                      <ViroPolygon
                        position={[0, 0.008, -0.001]}
                        vertices={[[-0.024, -0.022], [-0.027, 0.002], [-0.014, 0.026], [0, 0.036], [0.014, 0.026], [0.027, 0.002], [0.024, -0.022]]}
                        holes={[]}
                        materials={['torchHalo']}
                      />
                      <ViroPolygon
                        position={[0, 0.009, 0]}
                        vertices={[[-0.016, -0.017], [-0.018, 0.002], [-0.009, 0.022], [0, 0.032], [0.01, 0.021], [0.018, 0.002], [0.016, -0.017]]}
                        holes={[]}
                        materials={['torchFlame']}
                      />
                      <ViroPolygon
                        position={[0, 0.008, 0.001]}
                        vertices={[[-0.007, -0.009], [-0.009, 0.004], [-0.004, 0.016], [0, 0.023], [0.005, 0.015], [0.009, 0.004], [0.007, -0.009]]}
                        holes={[]}
                        materials={['torchInnerFlame']}
                      />
                    </ViroNode>
                  ))}
                </ViroNode>
              ))}
            </>
          )}

          {config.interaction.type === 'aura' && (
            <ViroParticleEmitter
              position={[0, 0.4, 0]}
              duration={1500}
              run={true}
              loop={true}
              fixedToEmitter={true}
              image={{
                source: require('../assets/particles/particle_sparkle.png'),
                height: 0.12,
                width: 0.12,
                bloomThreshold: 0.0,
              }}
              spawnBehavior={{
                particleLifetime: [1000, 1500],
                emissionRatePerSecond: [20, 30],
                spawnVolume: { shape: 'sphere', params: [0.35], spawnOnSurface: false },
                maxParticles: 100,
              }}
              particleAppearance={{
                opacity: {
                  initialRange: [0.7, 1.0],
                  factor: 'time',
                  interpolation: [{ endValue: 0.0, interval: [800, 1500] }],
                },
                scale: {
                  initialRange: [[0.8, 0.8, 0.8], [1.2, 1.2, 1.2]],
                  factor: 'time',
                  interpolation: [{ endValue: [0.0, 0.0, 0.0], interval: [800, 1500] }],
                },
              }}
              particlePhysics={{
                velocity: {
                  initialRange: [[-0.2, 0.3, -0.2], [0.2, 0.6, 0.2]],
                },
              }}
            />
          )}
        </>
      )}

      {!isPreview && isSelected && (
        <ViroBox
          position={[0, 0.002, 0]}
          scale={SELECTION_RING_SCALE}
          materials={['selectionRing']}
          opacity={0.55}
        />
      )}
    </ViroNode>
  );
}
