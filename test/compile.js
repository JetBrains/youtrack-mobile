const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const origJs = require.extensions['.js'];

const PREFIX = '.ios';

function checkPrefixedFileExistence(path) {
  try {
    fs.accessSync(path + PREFIX + '.js');
    return true;
  } catch (e) {
    return false;
  }
}

require.extensions['.png'] = function (module, fileName) {
  return {
    uri: JSON.stringify(fileName, fileName)
  };
};

require.extensions['.js'] = function (module, fileName) {
  if (fileName.indexOf('node_modules/react-native/Libraries/react-native/react-native.js') >= 0) {
    fileName = path.resolve('./test/mocks/react-native.js');
  }

  if (fileName.includes('node_modules/') && !fileName.includes('react-native')) {
    return (origJs || require.extensions['.js'])(module, fileName);
  }

  const src = fs.readFileSync(fileName, 'utf8');

  const output = babel.transform(src, {
    filename: fileName,
    resolveModuleSource: (source, filename) => {
      const filePath = path.resolve(path.dirname(filename), source);
      try {
        fs.accessSync(filePath);
        return source;
      } catch (e) {
        if (checkPrefixedFileExistence(filePath)) {
          return source + PREFIX;
        }
        return source;
      }
    }
  }).code;

  return module._compile(output, fileName);
};
