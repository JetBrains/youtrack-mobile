// eslint-disable-next-line import/no-commonjs
module.exports = {
  'preset': 'react-native',
  'transform': {
    '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
    '^[./a-zA-Z0-9$_-]+\\.(bmp|gif|jpg|jpeg|png|psd|svg|webp)$': '<rootDir>/node_modules/react-native/jest/assetFileTransformer.js'
  },
  'setupFilesAfterEnv': [
    './test/jest-setup.js',
    '@testing-library/jest-native/extend-expect'
  ],
  'testResultsProcessor': 'jest-teamcity-reporter',
  'coverageReporters': [
    'teamcity'
  ],
  'testPathIgnorePatterns': [
    '/node_modules/',
    '/e2e/'
  ],
  'transformIgnorePatterns': [
    'node_modules/(?!(jest-)?react-native|@react-native-community|react-navigation|@huston007.*)'
  ]
};

