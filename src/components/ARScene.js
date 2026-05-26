import React, { useState } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroARPlane,
  ViroBox,
  ViroSphere,
  Viro3DObject,
} from '@reactvision/react-viro';
import { MODEL_CONFIGS } from '../utils/modelLoader';

export default function ARScene(props) {
  const {
    activeObject,
    placedObjects,
    onPlaceObject,
    setTrackingState,
  } = props.sceneNavigator.viroAppProps;

  // Track all detected plane anchors to support multiple surfaces
  const [planes, setPlanes] = useState([]);

  // Defer state updates to the parent component to avoid React's warning
  // about updating a component during another component's rendering phase.
  const safeSetTrackingState = (newState) => {
    Promise.resolve().then(() => {
      setTrackingState && setTrackingState(newState);
    });
  };

  // Handles camera tracking state (initializing vs active searching)
  const handleTrackingUpdate = (state) => {
    // 3 represents ViroConstants.TRACKING_NORMAL (tracking ok)
    if (state === 3) {
      safeSetTrackingState(planes.length > 0 ? 'found' : 'searching');
    } else {
      safeSetTrackingState('initializing');
    }
  };

  // Triggered when ARCore/ARKit detects a new surface
  const handleAnchorFound = (anchor) => {
    if (anchor.type === 'plane') {
      setPlanes((prevPlanes) => [...prevPlanes, anchor]);
      safeSetTrackingState('found');
    }
  };

  // Triggered when an anchor is updated (e.g. plane expands or moves)
  const handleAnchorUpdated = (anchor) => {
    if (anchor.type === 'plane') {
      setPlanes((prevPlanes) =>
        prevPlanes.map((p) => (p.anchorId === anchor.anchorId ? anchor : p))
      );
    }
  };

  // Triggered when an anchor is removed
  const handleAnchorRemoved = (anchor) => {
    if (anchor.type === 'plane') {
      setPlanes((prevPlanes) => {
        const updatedPlanes = prevPlanes.filter((p) => p.anchorId !== anchor.anchorId);
        if (updatedPlanes.length === 0) {
          safeSetTrackingState('searching');
        }
        return updatedPlanes;
      });
    }
  };

  // Handle user tap on detected plane
  const handlePlaneClick = (planeAnchor, worldPosition) => {
    // Calculate the local coordinate relative to the plane anchor position
    const localPosition = [
      worldPosition[0] - planeAnchor.position[0],
      worldPosition[1] - planeAnchor.position[1],
      worldPosition[2] - planeAnchor.position[2],
    ];

    onPlaceObject(planeAnchor.anchorId, localPosition);
  };

  // Helper to render individual placed objects using local coordinates relative to the plane anchor
  const renderObject = (obj) => {
    const config = MODEL_CONFIGS[obj.type];
    if (!config) return null;

    switch (obj.type) {
      case 'cube':
        return (
          <ViroBox
            key={obj.id}
            position={obj.localPosition} // Anchored locally to the parent ViroARPlane coordinate space
            scale={config.scale}
            materials={[config.material]}
          />
        );
      case 'sphere':
        return (
          <ViroSphere
            key={obj.id}
            position={obj.localPosition} // Anchored locally
            scale={config.scale}
            radius={1} // Sized via scale
            materials={[config.material]}
          />
        );
      case 'chair':
        return (
          <Viro3DObject
            key={obj.id}
            position={obj.localPosition} // Anchored locally
            scale={config.scale}
            source={config.source}
            type="GLB"
            materials={[config.material]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ViroARScene
      onTrackingUpdated={handleTrackingUpdate}
      onAnchorFound={handleAnchorFound}
      onAnchorUpdated={handleAnchorUpdated}
      onAnchorRemoved={handleAnchorRemoved}
    >
      {/* Lights to enable shadowing and realistic textures */}
      <ViroAmbientLight color="#ffffff" intensity={250} />
      <ViroDirectionalLight
        color="#ffffff"
        direction={[0.5, -1, -0.5]}
        intensity={800}
      />

      {/* Render detected planes. Objects are rendered as children of their respective plane */}
      {planes.map((plane) => (
        <ViroARPlane
          key={plane.anchorId}
          anchorId={plane.anchorId}
          onClick={(worldPosition) => handlePlaneClick(plane, worldPosition)}
        >
          {/* Subtle horizontal grid to indicate the interactive plane boundary */}
          <ViroBox
            position={[0, 0, 0]}
            scale={[plane.width, 0.002, plane.height]}
            materials={['neonBlue']}
            opacity={0.12}
          />

          {/* Render all objects that belong to this specific plane */}
          {placedObjects
            .filter((obj) => obj.anchorId === plane.anchorId)
            .map(renderObject)}
        </ViroARPlane>
      ))}
    </ViroARScene>
  );
}
