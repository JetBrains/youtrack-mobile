const path = require('path');

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    extraNodeModules: {
      components: path.resolve(__dirname, 'src/components'),
      views: path.resolve(__dirname, 'src/views'),
      util: path.resolve(__dirname, 'src/util'),
      actions: path.resolve(__dirname, 'src/actions'),
      assets: path.resolve(__dirname, 'src/assets'),
      test: path.resolve(__dirname, 'test'),
      types: path.resolve(__dirname, 'src/types'),
      reducers: path.resolve(__dirname, 'src/reducers'),
    },
  },
  watchFolders: [path.resolve(__dirname, 'src')],
};

module.exports = mergeConfig(defaultConfig, config);
