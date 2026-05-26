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
  }
});

export const MODEL_CONFIGS = {
  cube: {
    type: 'cube',
    material: 'neonBlue',
    scale: [0.2, 0.2, 0.2], // 20cm box
  },
  sphere: {
    type: 'sphere',
    material: 'neonPink',
    scale: [0.12, 0.12, 0.12], // 24cm diameter sphere
  },
  chair: {
    type: '3d_model',
    // We point to a local model file.
    // If the file is missing, Viro can fail gracefully or render a placeholder.
    // We use the require statement so React Native bundles it.
    source: require('../assets/models/chair.glb'),
    scale: [0.3, 0.3, 0.3],
    material: 'woodChair',
  }
};
