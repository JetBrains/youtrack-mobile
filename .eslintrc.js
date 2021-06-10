const error = 'error';

module.exports = {
  root: true,
  extends: '@react-native-community',
  rules: {
    'prettier/prettier': 0,
    'no-trailing-spaces': 0,
    'no-console': error,
    'no-debugger': error,
    'constructor-super': error,
    'arrow-spacing': error,
    'no-const-assign': error,
    'no-var': error,
    'prefer-const': error,
    'prefer-spread': error,
    'prefer-template': error,
    'no-dupe-class-members': error,
    'no-this-before-super': error,
    'no-useless-escape': 'off',
    'no-unused-vars': [error, {'vars': 'local', 'args': 'none'}],
    'quotes': [error, 'single', {'allowTemplateLiterals': true}],
    'semi': error,
    // 'indent': [error, 2],
    'no-multi-spaces': error,
    'eqeqeq': error,

    //React
    'react/jsx-uses-react': error,
    'react/jsx-key': error,
    'react/no-deprecated': error,
    'react/jsx-max-props-per-line': [error, {maximum: 4}],
    'react/jsx-uses-vars': error,

    //React Native
    'react-native/no-unused-styles': error,
    'react-native/split-platform-components': error,

    'flowtype/define-flow-type': 1,
    'flowtype/no-weak-types': 0,

    //Jest
    'jest/no-focused-tests': error,
    'jest/no-identical-title': error,
    'jest/valid-expect': error,

  },
  'env': {
    'jest/globals': true,
    'jasmine': true,
  },
};
