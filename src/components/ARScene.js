import React, { useRef, useEffect, useState } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
} from '@reactvision/react-viro';
import PlacedObject from './PlacedObject';

export default function ARScene(props) {
  const {
    activeObject,
    placedObjects,
    selectedObjectId,
    onPlaceObject,
    onSelectObject,
    onRotationChange,
    onPositionChange,
    setTrackingState,
    placeTrigger,
    modelConfigs,
    onCameraPositionUpdate,
  } = props.sceneNavigator.viroAppProps;

  const arSceneRef = useRef(null);

  const [animationTime, setAnimationTime] = useState(0);

  useEffect(() => {
    let lastTime = Date.now();
    let elapsed = 0;
    let frameId;

    const tick = () => {
      const now = Date.now();
      let delta = now - lastTime;
      lastTime = now;

      // Handle system suspension/sleep mode jumps
      if (delta < 0 || delta > 1000) {
        delta = 16.67;
      }

      elapsed = (elapsed + delta) % 12000;
      setAnimationTime(elapsed);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Local camera transform state for rendering the placement preview object locally (keeps HUD decoupled)
  const [cameraTransform, setCameraTransform] = useState({
    position: [0, 0, 0],
    forward: [0, 0, -1],
    rotation: [0, 0, 0],
  });

  // Reference for the most recent camera transform to use in performARHitTest without stale closure issues
  const cameraTransformRef = useRef({
    position: [0, 0, 0],
    forward: [0, 0, -1],
    rotation: [0, 0, 0],
  });

  // Native references of placed object nodes for running 60fps gestures screen-wide without state lag
  const objectRefs = useRef({});

  // Gesture tracking refs
  const startPosRef = useRef([0, 0, 0]);
  const startDistRef = useRef(1.5);
  const dirVecRef = useRef([0, 0, -1]);
  const startRotRef = useRef([0, 0, 0]);

  const registerRef = (id, ref) => {
    if (ref) {
      objectRefs.current[id] = ref;
    } else {
      delete objectRefs.current[id];
    }
  };

  const handlePinch = (pinchState, scaleFactor, source) => {
    if (selectedObjectId == null) return;
    const selectedNode = objectRefs.current[selectedObjectId];
    if (!selectedNode) return;

    const camPos = cameraTransformRef.current.position || [0, 0, 0];
    const selectedObj = placedObjects.find(o => o.id === selectedObjectId);
    if (!selectedObj) return;

    if (pinchState === 1) { // Pinch Start
      const currentPos = selectedObj.position || [0, 0, -1.5];
      startPosRef.current = [...currentPos];
      const dx = startPosRef.current[0] - camPos[0];
      const dy = startPosRef.current[1] - camPos[1];
      const dz = startPosRef.current[2] - camPos[2];
      const startDist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      startDistRef.current = startDist;
      dirVecRef.current = startDist > 0 ? [dx / startDist, dy / startDist, dz / startDist] : [0, 0, -1];
    } else if (pinchState === 2) { // Pinch Move
      const newDist = Math.max(0.3, startDistRef.current * scaleFactor);
      const nextPos = [
        camPos[0] + dirVecRef.current[0] * newDist,
        camPos[1] + dirVecRef.current[1] * newDist,
        camPos[2] + dirVecRef.current[2] * newDist,
      ];
      selectedNode.setNativeProps({ position: nextPos });
      startPosRef.current = nextPos;
    } else if (pinchState === 3) { // Pinch End
      onPositionChange && onPositionChange(selectedObjectId, startPosRef.current);
    }
  };

  const handleRotate = (rotateState, rotationFactor, source) => {
    if (selectedObjectId == null) return;
    const selectedNode = objectRefs.current[selectedObjectId];
    if (!selectedNode) return;

    const selectedObj = placedObjects.find(o => o.id === selectedObjectId);
    if (!selectedObj) return;

    if (rotateState === 1) { // Rotate Start
      const currentRot = selectedObj.rotation || [0, 0, 0];
      startRotRef.current = [...currentRot];
    } else if (rotateState === 2) { // Rotate Move
      const nextRotation = [
        startRotRef.current[0],
        startRotRef.current[1] + rotationFactor,
        startRotRef.current[2],
      ];
      selectedNode.setNativeProps({ rotation: nextRotation });
      startRotRef.current = nextRotation;
    } else if (rotateState === 3) { // Rotate End
      onRotationChange && onRotationChange(selectedObjectId, startRotRef.current);
    }
  };

  const safeSetTrackingState = (newState) => {
    Promise.resolve().then(() => {
      setTrackingState && setTrackingState(newState);
    });
  };

  const handleTrackingUpdate = (state) => {
    if (state === 3) {
      safeSetTrackingState('found'); // 'found' represents the 'READY' status in the HUD
    } else {
      safeSetTrackingState('initializing');
    }
  };

  const handleCameraTransformUpdate = (event) => {
    const newTransform = {
      position: event.position,
      forward: event.forward,
      rotation: event.rotation,
    };
    cameraTransformRef.current = newTransform;

    // Only update local state if we don't have an active selection (editing) and have an active object to preview
    if (selectedObjectId == null && activeObject) {
      setCameraTransform(newTransform);
    }

    // Update parent's shared ref to keep trace of position without re-rendering parent HUD
    if (onCameraPositionUpdate) {
      onCameraPositionUpdate(event.position);
    }
  };

  const handlePlacement = async () => {
    if (selectedObjectId != null) return;
    if (!activeObject) return;

    let position = null;
    const currentCameraTransform = cameraTransformRef.current;

    // Perform real-world raycast hit test to detect surfaces (floors/tables)
    if (arSceneRef.current && currentCameraTransform.forward) {
      try {
        const results = await arSceneRef.current.performARHitTestWithRay(currentCameraTransform.forward);
        if (results && results.length > 0) {
          // Look for the first plane intersection (either using extent or infinite plane)
          const planeHit = results.find(
            r => r.type === 'ExistingPlaneUsingExtent' || r.type === 'ExistingPlane'
          );
          if (planeHit && planeHit.transform && planeHit.transform.position) {
            position = planeHit.transform.position;
          }
        }
      } catch (err) {
        console.warn('Raycast hit test failed:', err);
      }
    }

    // Fallback: if no plane is detected in the line of sight, place at a fixed 1.5m distance in front of the camera
    if (!position) {
      const distance = 1.5;
      position = [
        currentCameraTransform.position[0] + currentCameraTransform.forward[0] * distance,
        currentCameraTransform.position[1] + currentCameraTransform.forward[1] * distance,
        currentCameraTransform.position[2] + currentCameraTransform.forward[2] * distance,
      ];
    }

    // Keep object vertical, rotate around Y (yaw) matching the camera
    const rotation = [0, currentCameraTransform.rotation[1], 0];
    onPlaceObject(position, rotation);
  };

  // Trigger placement when the HUD "PLACE" button is clicked in App.js
  useEffect(() => {
    if (placeTrigger && placeTrigger > 0) {
      handlePlacement();
    }
  }, [placeTrigger]);

  const distance = 1.5;
  const previewPosition = [
    cameraTransform.position[0] + cameraTransform.forward[0] * distance,
    cameraTransform.position[1] + cameraTransform.forward[1] * distance,
    cameraTransform.position[2] + cameraTransform.forward[2] * distance,
  ];
  const previewRotation = [0, cameraTransform.rotation[1], 0];

  const previewObj = {
    id: 'preview',
    type: activeObject,
    position: previewPosition,
    rotation: previewRotation,
  };

  return (
    <ViroARScene
      ref={arSceneRef}
      anchorDetectionTypes={['PlanesHorizontal']}
      onTrackingUpdated={handleTrackingUpdate}
      onCameraTransformUpdate={handleCameraTransformUpdate}
      onClick={handlePlacement}
      onPinch={selectedObjectId != null ? handlePinch : undefined}
      onRotate={selectedObjectId != null ? handleRotate : undefined}
    >
      <ViroAmbientLight color="#ffffff" intensity={250} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0.5, -1, -0.5]}
        intensity={800}
      />

      {/* Render placement preview if no object is selected and an object type is chosen */}
      {selectedObjectId == null && activeObject && (
        <PlacedObject
          obj={previewObj}
          isSelected={false}
          isPreview={true}
          modelConfigs={modelConfigs}
          animationTime={animationTime}
        />
      )}

      {/* Render all placed objects in the world */}
      {placedObjects.map((obj) => (
        <PlacedObject
          key={obj.id}
          obj={obj}
          isSelected={selectedObjectId === obj.id}
          onSelect={onSelectObject}
          onRotationChange={onRotationChange}
          onPositionChange={onPositionChange}
          modelConfigs={modelConfigs}
          getCameraPosition={() => cameraTransformRef.current.position}
          registerRef={registerRef}
          animationTime={animationTime}
        />
      ))}
    </ViroARScene>
  );
}
