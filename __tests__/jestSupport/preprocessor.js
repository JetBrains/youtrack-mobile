/**
 * Monkey patch of react-native/jestSupport/preprocessor.js
 * for working with npm@3.x
 * @see https://github.com/facebook/react-native/issues/3999
 */
const createCacheKeyFunction = require('fbjs-scripts/jest/createCacheKeyFunction');
const path = require('path');
const transformer = require('react-native/packager/transformer.js');

module.exports = {
  process(src, file) {
    if (file.match(/node_modules\/(?!react-tools\/)/)) {
      return src;
    }

    return transformer.transform(src, file, {inlineRequires: true}).code;
  },

  getCacheKey: createCacheKeyFunction([
    __filename,
    require.resolve('react-native/packager/transformer.js'),
    require.resolve('babel-core/package.json')
  ]),
};
