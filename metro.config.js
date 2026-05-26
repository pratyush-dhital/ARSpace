const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for 3D model files and associated textures
config.resolver.assetExts.push(
  'glb',
  'gltf',
  'obj',
  'mtl',
  'png',
  'jpg'
);

module.exports = config;
