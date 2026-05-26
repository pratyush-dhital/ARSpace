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
import { COLORS, SHADOWS } from './src/assets/styles/theme';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [trackingState, setTrackingState] = useState('initializing'); // initializing, searching, found
  const [activeObject, setActiveObject] = useState('cube'); // cube, sphere, chair
  const [placedObjects, setPlacedObjects] = useState([]); // Array of { id, type, anchorId, localPosition }
  const [showHelp, setShowHelp] = useState(false);

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
            message: 'AR Space Placer needs access to your camera to scan flat surfaces and place virtual objects.',
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

  // Receives anchorId and localPosition [x, y, z] to attach the object to the plane
  const handlePlaceObject = (anchorId, localPosition) => {
    const newObject = {
      id: Date.now(),
      type: activeObject,
      anchorId: anchorId,
      localPosition: localPosition,
    };
    setPlacedObjects((prevObjects) => [...prevObjects, newObject]);
  };

  const handleClearAll = () => {
    setPlacedObjects([]);
  };

  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={[styles.permissionCard, SHADOWS.glass]}>
          <Text style={styles.permissionTitle}>CAMERA ACCESS NEEDED</Text>
          <Text style={styles.permissionDescription}>
            This application requires access to your camera to overlay virtual 3D models in your physical workspace.
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
      {/* Augmented Reality Canvas */}
      <ViroARSceneNavigator
        initialScene={{
          scene: ARScene,
        }}
        viroAppProps={{
          activeObject,
          placedObjects,
          onPlaceObject: handlePlaceObject,
          setTrackingState,
        }}
        style={StyleSheet.absoluteFill}
      />

      {/* Floating Status Bar Overlay */}
      <StatusBar trackingState={trackingState} activeObject={activeObject} />

      {/* Quick Action Side Buttons */}
      <ControlButtons
        onClearAll={handleClearAll}
        onToggleHelp={() => setShowHelp(true)}
        hasObjects={placedObjects.length > 0}
      />

      {/* Glassmorphic Bottom Object Picker */}
      <ObjectSelector activeObject={activeObject} onSelect={setActiveObject} />

      {/* Instructions Help Modal */}
      <Modal visible={showHelp} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.glass]}>
            <Text style={styles.modalHeader}>HOW TO USE AR APP</Text>
            
            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepDesc}>Scan the room slowly until a neon plane grid boundary is visualised.</Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepDesc}>Toggle active object cards (Cube, Sphere, Chair) at the bottom selector.</Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepDesc}>Tap on any detected grid area to place your virtual model.</Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>4</Text></View>
              <Text style={styles.stepDesc}>Walk around the placed objects; they will stay anchored in physical space.</Text>
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
