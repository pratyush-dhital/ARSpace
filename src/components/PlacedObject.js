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
}) {
  const nodeRef = useRef(null);
  const config = MODEL_CONFIGS[obj.type];
  if (!config) return null;

  const rotation = obj.rotation ?? [0, 0, 0];
  const position = obj.position ?? [0, 0, -1.5];

  const latestPosRef = useRef(position);

  // Sync ref with position changes from props (e.g. initial load or parent resets)
  useEffect(() => {
    latestPosRef.current = position;
  }, [position]);

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

  const handleClick = () => {
    if (isPreview) return;
    onSelect(obj.id);
  };

  let model = null;
  const opacity = isPreview ? 0.45 : 1.0;

  switch (obj.type) {
    case 'cube':
      model = (
        <ViroBox
          position={[0, 0, 0]}
          scale={config.scale}
          materials={[config.material]}
          opacity={opacity}
        />
      );
      break;
    case 'sphere':
      model = (
        <ViroSphere
          position={[0, 0, 0]}
          scale={config.scale}
          radius={1}
          materials={[config.material]}
          opacity={opacity}
        />
      );
      break;
    case 'chair':
      model = (
        <Viro3DObject
          position={[0, 0, 0]}
          scale={config.scale}
          source={config.source}
          type="GLB"
          materials={[config.material]}
          opacity={opacity}
        />
      );
      break;
    default:
      return null;
  }

  return (
    <ViroNode
      ref={nodeRef}
      position={position}
      rotation={rotation}
      onClick={isPreview ? undefined : handleClick}
      onRotate={(!isPreview && isSelected) ? handleRotate : undefined}
      onDrag={(!isPreview && isSelected) ? handleDrag : undefined}
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
