import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  Modal,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARScene from './src/components/ARScene';
import StatusBar from './src/components/StatusBar';
import ObjectSelector from './src/components/ObjectSelector';
import ControlButtons from './src/components/ControlButtons';
import ObjectEditPanel from './src/components/ObjectEditPanel';
import { COLORS, SHADOWS } from './src/assets/styles/theme';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [trackingState, setTrackingState] = useState('initializing');
  const [activeObject, setActiveObject] = useState('cube');
  const [placedObjects, setPlacedObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Track the camera transform (shared with ARScene via viroAppProps)
  const [cameraTransform, setCameraTransform] = useState({
    position: [0, 0, 0],
    forward: [0, 0, -1],
    rotation: [0, 0, 0],
  });

  const [placeTrigger, setPlaceTrigger] = useState(0);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message:
              'AR Space Placer needs access to your camera to place virtual objects in your environment.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Deny',
            buttonPositive: 'Grant',
          }
        );
        setHasCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } catch (err) {
        console.warn('Permission request error:', err);
      }
    } else {
      setHasCameraPermission(true);
    }
  };

  const handlePlaceObject = (position, rotation = [0, 0, 0]) => {
    const newObject = {
      id: Date.now(),
      type: activeObject,
      position,
      rotation,
    };
    setPlacedObjects((prev) => [...prev, newObject]);
    setSelectedObjectId(null);
  };

  const handlePositionChange = (objectId, position) => {
    setPlacedObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, position } : obj))
    );
  };

  const handleSelectObject = (objectId) => {
    setSelectedObjectId(objectId);
  };

  const handleRotationChange = (objectId, rotation) => {
    setPlacedObjects((prev) =>
      prev.map((obj) => (obj.id === objectId ? { ...obj, rotation } : obj))
    );
  };

  const rotateSelected = (degrees) => {
    if (selectedObjectId == null) return;
    setPlacedObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== selectedObjectId) return obj;
        const rot = obj.rotation ?? [0, 0, 0];
        return {
          ...obj,
          rotation: [rot[0], rot[1] + degrees, rot[2]],
        };
      })
    );
  };

  const adjustSelectedDistance = (delta) => {
    if (selectedObjectId == null) return;
    setPlacedObjects((prev) =>
      prev.map((obj) => {
        if (obj.id !== selectedObjectId) return obj;

        const objPos = obj.position ?? [0, 0, -1.5];
        const camPos = cameraTransform.position ?? [0, 0, 0];

        // Vector from camera to object
        const dx = objPos[0] - camPos[0];
        const dy = objPos[1] - camPos[1];
        const dz = objPos[2] - camPos[2];
        const currentDist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (currentDist === 0) return obj;

        // Normalized direction vector
        const ux = dx / currentDist;
        const uy = dy / currentDist;
        const uz = dz / currentDist;

        // Calculate new distance (clamped to minimum 0.3m)
        const newDist = Math.max(0.3, currentDist + delta);

        const newPosition = [
          camPos[0] + ux * newDist,
          camPos[1] + uy * newDist,
          camPos[2] + uz * newDist,
        ];

        return {
          ...obj,
          position: newPosition,
        };
      })
    );
  };

  const handleDeleteSelected = () => {
    if (selectedObjectId == null) return;
    setPlacedObjects((prev) => prev.filter((obj) => obj.id !== selectedObjectId));
    setSelectedObjectId(null);
  };

  const handleUndo = () => {
    setPlacedObjects((prev) => prev.slice(0, -1));
    setSelectedObjectId(null);
  };

  const handleClearAll = () => {
    setPlacedObjects([]);
    setSelectedObjectId(null);
  };

  const handleSelectPlacementType = (type) => {
    setActiveObject(type);
    setSelectedObjectId(null);
  };

  const triggerHUDPlacement = () => {
    setPlaceTrigger(Date.now());
  };

  const selectedObject = placedObjects.find((o) => o.id === selectedObjectId);

  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={[styles.permissionCard, SHADOWS.glass]}>
          <Text style={styles.permissionTitle}>CAMERA ACCESS NEEDED</Text>
          <Text style={styles.permissionDescription}>
            This application requires access to your camera to overlay virtual 3D models in your
            physical workspace.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, SHADOWS.glow]}
            onPress={requestCameraPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.permissionButtonText}>ALLOW CAMERA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        initialScene={{
          scene: ARScene,
        }}
        viroAppProps={{
          activeObject,
          placedObjects,
          selectedObjectId,
          cameraTransform,
          setCameraTransform,
          placeTrigger,
          onPlaceObject: handlePlaceObject,
          onSelectObject: handleSelectObject,
          onRotationChange: handleRotationChange,
          onPositionChange: handlePositionChange,
          setTrackingState,
        }}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar
        trackingState={trackingState}
        activeObject={activeObject}
        selectedObjectId={selectedObjectId}
      />

      <ControlButtons
        onUndo={handleUndo}
        onDeleteSelected={handleDeleteSelected}
        selectedObjectId={selectedObjectId}
        onToggleHelp={() => setShowHelp(true)}
        hasObjects={placedObjects.length > 0}
      />

      {/* Floating placement button */}
      {selectedObjectId == null && activeObject && (
        <TouchableOpacity
          style={[styles.placeButton, SHADOWS.glow]}
          onPress={triggerHUDPlacement}
          activeOpacity={0.8}
        >
          <Text style={styles.placeButtonText}>PLACE {activeObject.toUpperCase()}</Text>
        </TouchableOpacity>
      )}

      {selectedObject && (
        <ObjectEditPanel
          selectedType={selectedObject.type}
          onRotateLeft={(deg) => rotateSelected(-deg)}
          onRotateRight={(deg) => rotateSelected(deg)}
          onDelete={handleDeleteSelected}
          onDeselect={() => setSelectedObjectId(null)}
          onAdjustDistance={adjustSelectedDistance}
        />
      )}

      <ObjectSelector
        activeObject={activeObject}
        onSelect={handleSelectPlacementType}
        disabled={selectedObjectId != null}
      />

      <Modal visible={showHelp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.glass]}>
            <Text style={styles.modalHeader}>HOW TO USE AR APP</Text>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepDesc}>
                Point your camera to aim. A semi-transparent preview of the chosen object will float 1.5m in front of you.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepDesc}>
                Pick Cube, Sphere, or Chair, then tap the screen or press the PLACE button to fix it in space.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepDesc}>
                Tap a placed object to select it. Drag it with one finger to move it, or pinch-rotate with two fingers.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepDesc}>
                Use the edit panel to rotate in increments or delete the object. Tap DONE to finalize.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowHelp(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>START PLACING</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  permissionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.background,
    letterSpacing: 1.5,
  },
  placeButton: {
    position: 'absolute',
    bottom: 180,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.background,
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 2,
    marginBottom: 24,
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  stepNumberBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  stepDesc: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalCloseBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 18,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 1.5,
  },
});
