module.exports = {
  'extends': [
    'defaults'
  ],
  'parser': 'babel-eslint',
  'plugins': [
    'react',
    'react-native',
    'flow-vars'
  ],
  'rules': {
    'no-unused-vars': [2, {'vars': 'local', 'args': 'none'}],
    'no-console': 0,
    'quotes': [2, 'single', {'allowTemplateLiterals': true}],
    //ES6
    'constructor-super': 2,
    'arrow-spacing': 2,
    'no-const-assign': 2,
    'no-var': 2,
    'prefer-spread': 2,
    'prefer-template': 2,
    'no-dupe-class-members': 2,
    'no-this-before-super': 2,
    //React
    'react/jsx-uses-react': 2,
    'react/jsx-key': 2,
    'react/no-deprecated': 2,
    'react/jsx-max-props-per-line': [2, {maximum: 4}],
    'react/jsx-uses-vars': 2,
    'react-native/no-unused-styles': 2,
    'react-native/split-platform-components': 2,

    'flow-vars/define-flow-type': 1,
    'flow-vars/use-flow-type': 1
  },
  'env': {
    'es6': true,
    'commonjs': true,
    'mocha': true,
    'node': true
  },
  'globals': {
    'fetch': true,
    'console': true,
    'expect': true
  }
};
