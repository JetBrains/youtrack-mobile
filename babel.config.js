module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['.', './src', '../..', '../../src'],
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
          actions: './src/actions',
          assets: './src/assets',
          components: './src/components',
          test: './test',
          types: './src/types',
          util: './src/util',
          views: './src/views',
        },
      },
    ],
    '@babel/plugin-transform-named-capturing-groups-regex',
    'react-native-reanimated/plugin',
  ],
};
