import React, { useRef, useEffect } from 'react';
import { ViroBox, ViroSphere, Viro3DObject, ViroNode } from '@reactvision/react-viro';
import { MODEL_CONFIGS } from '../utils/modelLoader';

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
}) {
  const nodeRef = useRef(null);
  const config = modelConfigs ? modelConfigs[obj.type] : MODEL_CONFIGS[obj.type];
  if (!config) return null;

  const rotation = obj.rotation ?? [0, 0, 0];
  const position = obj.position ?? [0, 0, -1.5];

  const latestPosRef = useRef(position);
  const startPosRef = useRef(position);
  const startDistRef = useRef(1.5);
  const dirVecRef = useRef([0, 0, -1]);

  // Sync ref with position changes from props (e.g. initial load or parent resets)
  useEffect(() => {
    latestPosRef.current = position;
  }, [position]);

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

  if (config.type === 'cube') {
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
        materials={config.material ? [config.material] : undefined}
        opacity={opacity}
        onLoadStart={() => console.log('[Viro3DObject] Load start:', config.source)}
        onLoadEnd={() => console.log('[Viro3DObject] Load end success')}
        onError={(event) => console.warn('[Viro3DObject] Load error:', event.nativeEvent.error)}
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
