import React, { useRef, useEffect } from 'react';
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
    cameraTransform,
    setCameraTransform,
    placeTrigger,
  } = props.sceneNavigator.viroAppProps;

  const arSceneRef = useRef(null);

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
    // Only update transform if we don't have an active selection (editing) and have an active object to preview
    if (selectedObjectId == null && activeObject) {
      setCameraTransform({
        position: event.position,
        forward: event.forward,
        rotation: event.rotation,
      });
    }
  };

  const handlePlacement = async () => {
    if (selectedObjectId != null) return;
    if (!activeObject) return;

    let position = null;

    // Perform real-world raycast hit test to detect surfaces (floors/tables)
    if (arSceneRef.current && cameraTransform.forward) {
      try {
        const results = await arSceneRef.current.performARHitTestWithRay(cameraTransform.forward);
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
        cameraTransform.position[0] + cameraTransform.forward[0] * distance,
        cameraTransform.position[1] + cameraTransform.forward[1] * distance,
        cameraTransform.position[2] + cameraTransform.forward[2] * distance,
      ];
    }

    // Keep object vertical, rotate around Y (yaw) matching the camera
    const rotation = [0, cameraTransform.rotation[1], 0];
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
        />
      ))}
    </ViroARScene>
  );
}
