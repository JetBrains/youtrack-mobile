module.exports = {
  globalSetup: '<rootDir>/test/jest-global.js',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  'preset': 'react-native',
  'automock': false,
  'resetMocks': false,
  'transform': {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
    '^[./a-zA-Z0-9$_-]+\\.(gif|jpg|jpeg|png|svg)$': 'jest-transform-stub',
  },
  'moduleNameMapper': {
    '^.+.(svg)$': '<rootDir>/test/svg-mock.js',
    '^@jetbrains/icons/(.*)$': '<rootDir>/test/svg-mock.js',
  },
  'setupFilesAfterEnv': [
    '<rootDir>/test/jest-setup.js',
    '@testing-library/jest-native/extend-expect',
  ],
  'testResultsProcessor': 'jest-teamcity-reporter',
  'coverageReporters': [
    'teamcity',
  ],
  'testPathIgnorePatterns': [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
  ],
  'transformIgnorePatterns': [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-native/polyfills|react-native-device-log|@react-native-community/netinfo|@react-native-community|react-navigation|@gpsgate.*|react-syntax-highlighter/)',
  ],
};

