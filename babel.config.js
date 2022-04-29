module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module-resolver', {
      root: ['.', './src', '../..', '../../src'],
      extensions: ['.js', '.jsx', '.ts', '.json'],
      alias: {
        actions: './src/actions',
        assets: './src/assets',
        components: './src/components',
        flow: './src/flow',
        util: './src/util',
        views: './src/views',
      },
    }],
    'react-native-reanimated/plugin',
    '@babel/plugin-transform-named-capturing-groups-regex',
  ],
};
