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
    diffuseColor: '#39FF14',
    lightingModel: 'Constant',
  },
});

export const MODEL_CONFIGS = {
  cube: {
    type: 'cube',
    material: 'neonBlue',
    scale: [0.2, 0.2, 0.2], // 20cm box
    placementYOffset: 0.1, // half of scale Y — sits on plane
  },
  sphere: {
    type: 'sphere',
    material: 'neonPink',
    scale: [0.12, 0.12, 0.12],
    placementYOffset: 0.12, // radius at scale 1
  },
  chair: {
    type: '3d_model',
    source: require('../assets/models/chair.glb'),
    scale: [0.3, 0.3, 0.3],
    material: 'woodChair',
    placementYOffset: 0.02,
  },
};
