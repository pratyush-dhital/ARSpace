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
  TextInput,
  Alert,
} from 'react-native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import ARScene from './src/components/ARScene';
import StatusBar from './src/components/StatusBar';
import ObjectSelector from './src/components/ObjectSelector';
import ObjectEditPanel from './src/components/ObjectEditPanel';
import { COLORS, SHADOWS } from './src/assets/styles/theme';
import { MODEL_CONFIGS, DEFAULT_THEME, getFirstAssetOfTheme } from './src/utils/modelLoader';
import * as DocumentPicker from 'expo-document-picker';

export default function App() {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [trackingState, setTrackingState] = useState('initializing');
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);
  const [activeObject, setActiveObject] = useState(null);
  const [placedObjects, setPlacedObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Custom 3D Model state
  const [customModels, setCustomModels] = useState([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSourceType, setCustomSourceType] = useState('local'); // 'local' or 'url'
  const [customUrl, setCustomUrl] = useState('');
  const [customFile, setCustomFile] = useState(null); // { uri, name }
  const [customScale, setCustomScale] = useState(1.0);

  // Track the camera position using a ref to prevent full-HUD re-renders at 60fps
  const cameraPositionRef = React.useRef([0, 0, 0]);

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
              'AR Mini World Builder needs access to your camera to construct and view elements in your physical environment.',
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
    setActiveObject(null); // Clear preview after placement
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
        const camPos = cameraPositionRef.current || [0, 0, 0];

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

  // Document picker handler
  const handlePickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (res.type === 'success') {
        const name = res.name;
        const uri = res.uri;

        if (name.toLowerCase().endsWith('.glb') || name.toLowerCase().endsWith('.gltf')) {
          setCustomFile({ uri, name });
          // Auto-fill custom name if it is currently empty
          if (!customName) {
            const baseName = name.substring(0, name.lastIndexOf('.')) || name;
            setCustomName(baseName);
          }
        } else {
          Alert.alert('Invalid Format', 'Please choose a .glb or .gltf 3D model.');
        }
      }
    } catch (err) {
      console.warn('File picking failed:', err);
    }
  };

  // Custom model submit handler
  const handleAddCustomModel = () => {
    if (!customName.trim()) {
      Alert.alert('Error', 'Please enter a name for the model.');
      return;
    }

    let source = null;
    let fileFormat = 'GLB';

    if (customSourceType === 'local') {
      if (!customFile) {
        Alert.alert('Error', 'Please select a local 3D model file.');
        return;
      }
      source = { uri: customFile.uri };
      fileFormat = customFile.name.toLowerCase().endsWith('.gltf') ? 'GLTF' : 'GLB';
    } else {
      if (!customUrl.trim()) {
        Alert.alert('Error', 'Please enter a web URL.');
        return;
      }
      source = { uri: customUrl.trim() };
      fileFormat = customUrl.toLowerCase().endsWith('.gltf') ? 'GLTF' : 'GLB';
    }

    const newModelId = 'custom_' + Date.now();
    const scaleValue = customScale; // Scale factor mapping directly to the metric system (e.g., 1.0 means [1, 1, 1] meters)

    const newCustomModel = {
      id: newModelId,
      name: customName.trim(),
      category: 'custom',
      theme: 'custom',
      thumbnail: '📦',
      source,
      type: '3d_model',
      scale: [scaleValue, scaleValue, scaleValue],
      fileFormat,
      placementYOffset: 0.0,
      supportsInteraction: true,
      supportsRotation: true,
      supportsScaling: true,
      supportsPhysics: false,
      label: customName.trim(),
      desc: customSourceType === 'local' ? 'Local File' : 'Web URL',
    };

    setCustomModels((prev) => [...prev, newCustomModel]);
    setActiveObject(newModelId); // select the new model
    setShowAddCustomModal(false);

    // Reset fields
    setCustomName('');
    setCustomUrl('');
    setCustomFile(null);
    setCustomScale(1.0);
  };

  const handleCancelAddCustom = () => {
    setShowAddCustomModal(false);
    setCustomName('');
    setCustomUrl('');
    setCustomFile(null);
    setCustomScale(1.0);
  };

  // Compile full model configuration dictionary to pass to ARScene and edit panels
  const combinedModelConfigs = {
    ...MODEL_CONFIGS,
    ...customModels.reduce((acc, m) => {
      acc[m.id] = m;
      return acc;
    }, {}),
  };

  // Flat data-driven assets list for the ObjectSelector
  const combinedAssetsList = [
    ...Object.values(MODEL_CONFIGS),
    ...customModels,
  ];

  const selectedObject = placedObjects.find((o) => o.id === selectedObjectId);

  if (!hasCameraPermission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={[styles.permissionCard, SHADOWS.glass]}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionDescription}>
            This application requires access to your camera to construct virtual 3D worlds in your
            physical workspace.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, SHADOWS.glow]}
            onPress={requestCameraPermission}
            activeOpacity={0.85}
          >
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const activeObjectLabel =
    customModels.find((m) => m.id === activeObject)?.label ||
    MODEL_CONFIGS[activeObject]?.label ||
    activeObject;

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
          placeTrigger,
          onPlaceObject: handlePlaceObject,
          onSelectObject: handleSelectObject,
          onRotationChange: handleRotationChange,
          onPositionChange: handlePositionChange,
          setTrackingState,
          modelConfigs: combinedModelConfigs,
          onCameraPositionUpdate: (pos) => {
            cameraPositionRef.current = pos;
          },
        }}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar
        trackingState={trackingState}
        selectedObjectId={selectedObjectId}
      />

      {/* Top Left Control (Undo) */}
      {selectedObjectId == null && placedObjects.length > 0 && (
        <View style={styles.topLeftControls}>
          <TouchableOpacity
            style={[styles.smallPillButton, SHADOWS.glass]}
            onPress={handleUndo}
            activeOpacity={0.7}
          >
            <Text style={styles.smallPillButtonText}>↩</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Right Control (Help Guide) */}
      <View style={styles.topRightControls}>
        <TouchableOpacity
          style={[styles.smallPillButton, SHADOWS.glass]}
          onPress={() => setShowHelp(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.smallPillButtonText}>?</Text>
        </TouchableOpacity>
      </View>

      {selectedObject ? (
        <ObjectEditPanel
          selectedType={
            combinedModelConfigs[selectedObject.type]?.label ||
            selectedObject.type
          }
          onRotateLeft={(deg) => rotateSelected(-deg)}
          onRotateRight={(deg) => rotateSelected(deg)}
          onDelete={handleDeleteSelected}
          onDeselect={() => setSelectedObjectId(null)}
          onAdjustDistance={adjustSelectedDistance}
        />
      ) : (
        <ObjectSelector
          assets={combinedAssetsList}
          activeObject={activeObject}
          onSelect={handleSelectPlacementType}
          disabled={false}
          onAddCustomPress={() => setShowAddCustomModal(true)}
          onConstructPress={triggerHUDPlacement}
          activeObjectLabel={activeObjectLabel}
          activeTheme={activeTheme}
          onThemeChange={setActiveTheme}
        />
      )}

      {/* Import Custom Model Modal */}
      <Modal visible={showAddCustomModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.glass, { maxWidth: 380 }]}>
            <Text style={styles.modalHeader}>Import Custom Element</Text>

            <Text style={styles.inputLabel}>Element Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Castle Tower"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={customName}
              onChangeText={setCustomName}
            />

            <Text style={styles.inputLabel}>Source Type</Text>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, customSourceType === 'local' && styles.tabButtonActive]}
                onPress={() => setCustomSourceType('local')}
              >
                <Text style={[styles.tabButtonText, customSourceType === 'local' && styles.tabButtonTextActive]}>
                  Local File
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, customSourceType === 'url' && styles.tabButtonActive]}
                onPress={() => setCustomSourceType('url')}
              >
                <Text style={[styles.tabButtonText, customSourceType === 'url' && styles.tabButtonTextActive]}>
                  Web URL
                </Text>
              </TouchableOpacity>
            </View>

            {customSourceType === 'local' ? (
              <View style={styles.sourceSection}>
                <TouchableOpacity style={styles.filePickerBtn} onPress={handlePickFile} activeOpacity={0.8}>
                  <Text style={styles.filePickerBtnText}>
                    {customFile ? 'Change GLB/GLTF File' : 'Choose GLB/GLTF File'}
                  </Text>
                </TouchableOpacity>
                {customFile && (
                  <Text style={styles.fileNameText} numberOfLines={1}>
                    Selected: {customFile.name}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.sourceSection}>
                <Text style={styles.inputLabel}>Model Web URL</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://example.com/assets/robot.glb"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={customUrl}
                  onChangeText={setCustomUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}

            <Text style={styles.inputLabel}>Initial Scale Factor</Text>
            <View style={styles.scaleContainer}>
              {[0.1, 0.5, 1.0, 2.0].map((factor) => (
                <TouchableOpacity
                  key={factor}
                  style={[styles.scaleButton, customScale === factor && styles.scaleButtonActive]}
                  onPress={() => setCustomScale(factor)}
                >
                  <Text style={[styles.scaleButtonText, customScale === factor && styles.scaleButtonTextActive]}>
                    {factor}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.modalActionBtn, styles.cancelBtn]} onPress={handleCancelAddCustom}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionBtn, styles.submitBtn]}
                onPress={handleAddCustomModel}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Add Element</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Help Instructions Modal */}
      <Modal visible={showHelp} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, SHADOWS.glass]}>
            <Text style={styles.modalHeader}>Mini World Builder Guide</Text>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepDesc}>
                Aim your camera at flat ground. A semi-transparent blueprint of the chosen element will float in front of you.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepDesc}>
                Choose a world element, then tap the terrain or press the CONSTRUCT button to build it.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepDesc}>
                Tap any constructed element to select it. Drag to slide it across the ground, or pinch-rotate with two fingers.
              </Text>
            </View>

            <View style={styles.stepContainer}>
              <View style={styles.stepNumberBadge}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepDesc}>
                Use the modify panel to rotate or deconstruct the element. Tap Done to finish building.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowHelp(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseText}>Enter Builder Mode</Text>
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
  topLeftControls: {
    position: 'absolute',
    top: 55,
    left: 20,
    zIndex: 30,
  },
  topRightControls: {
    position: 'absolute',
    top: 55,
    right: 20,
    zIndex: 30,
  },
  smallPillButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(18, 22, 28, 0.85)',
    borderColor: 'rgba(197, 160, 89, 0.25)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallPillButtonDisabled: {
    opacity: 0.25,
  },
  smallPillButtonText: {
    fontSize: 15,
    color: '#C5A059',
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionCard: {
    backgroundColor: 'rgba(18, 22, 28, 0.92)',
    borderColor: 'rgba(197, 160, 89, 0.25)',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C5A059',
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  permissionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  permissionButton: {
    backgroundColor: '#262423',
    borderColor: '#C5A059',
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 14,
  },
  permissionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EADBB6',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  placeButton: {
    position: 'absolute',
    bottom: 195,
    alignSelf: 'center',
    width: 220,
    height: 60,
    backgroundColor: COLORS.primary,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.background,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: 'rgba(18, 22, 28, 0.95)',
    borderColor: 'rgba(197, 160, 89, 0.25)',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#C5A059',
    letterSpacing: 1.5,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#1E2026',
    borderColor: 'rgba(197, 160, 89, 0.25)',
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  tabButtonTextActive: {
    color: '#C5A059',
    fontWeight: '600',
  },
  sourceSection: {
    minHeight: 65,
    justifyContent: 'center',
  },
  filePickerBtn: {
    backgroundColor: 'rgba(197, 160, 89, 0.08)',
    borderColor: '#C5A059',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filePickerBtnText: {
    color: '#C5A059',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  fileNameText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scaleButton: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  scaleButtonActive: {
    borderColor: '#C5A059',
    backgroundColor: 'rgba(197, 160, 89, 0.06)',
  },
  scaleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  scaleButtonTextActive: {
    color: '#C5A059',
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    marginRight: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  submitBtn: {
    backgroundColor: '#262423',
    borderColor: '#C5A059',
    borderWidth: 1,
    marginLeft: 6,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EADBB6',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
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
    backgroundColor: 'rgba(197, 160, 89, 0.12)',
    borderColor: '#C5A059',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    color: '#C5A059',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  stepDesc: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
  modalCloseBtn: {
    backgroundColor: '#262423',
    borderColor: '#C5A059',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 18,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EADBB6',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'sans-serif',
  },
});
