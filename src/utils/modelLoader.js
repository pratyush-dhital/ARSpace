import { ViroMaterials } from '@reactvision/react-viro';

// Define premium materials with glowing physically-based rendering (PBR) attributes
ViroMaterials.createMaterials({
  neonBlue: {
    diffuseColor: '#00E5FF',
    lightingModel: 'PBR',
    roughness: 0.15,
    metalness: 0.8,
  },
  neonPink: {
    diffuseColor: '#FF007F',
    lightingModel: 'PBR',
    roughness: 0.1,
    metalness: 0.9,
  },
  woodChair: {
    lightingModel: 'Blinn',
  },
  selectionRing: {
    diffuseColor: '#00C2FF',
    lightingModel: 'Constant',
  },
});

export const MODEL_CONFIGS = {
  cube: {
    type: 'cube',
    material: 'neonBlue',
    scale: [0.2, 0.2, 0.2], // 20cm box
    placementYOffset: 0.1, // half of scale Y — sits on plane
    label: 'Cube',
  },
  sphere: {
    type: 'sphere',
    material: 'neonPink',
    scale: [0.12, 0.12, 0.12],
    placementYOffset: 0.12, // radius at scale 1
    label: 'Sphere',
  },
  chair: {
    type: '3d_model',
    source: { uri: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb' },
    scale: [0.4, 0.4, 0.4],
    placementYOffset: 0.0,
    label: 'Chair',
  },
  table: {
    type: '3d_model',
    source: { uri: 'https://raw.githubusercontent.com/wass08/meetup-r3f-workshop/master/public/models/table.glb' },
    scale: [0.35, 0.35, 0.35],
    placementYOffset: 0.0,
    label: 'Table',
  },
  lamp: {
    type: '3d_model',
    source: { uri: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb' },
    scale: [0.02, 0.02, 0.02],
    placementYOffset: 0.0,
    label: 'Lamp',
  },
  plant: {
    type: '3d_model',
    source: { uri: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb' },
    scale: [6.0, 6.0, 6.0],
    placementYOffset: 0.0,
    label: 'Plant',
  },
};
