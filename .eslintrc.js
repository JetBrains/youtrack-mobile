var ERROR = 2;

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
    'no-unused-vars': [ERROR, {'vars': 'local', 'args': 'none'}],
    'no-console': 0,
    'quotes': [ERROR, 'single', {'allowTemplateLiterals': true}],
    'semi': ERROR,
    //ES6
    'constructor-super': ERROR,
    'arrow-spacing': ERROR,
    'no-const-assign': ERROR,
    'no-var': ERROR,
    'prefer-const': ERROR,
    'prefer-spread': ERROR,
    'prefer-template': ERROR,
    'no-dupe-class-members': ERROR,
    'no-this-before-super': ERROR,
    //React
    'react/jsx-uses-react': ERROR,
    'react/jsx-key': ERROR,
    'react/no-deprecated': ERROR,
    'react/jsx-max-props-per-line': [ERROR, {maximum: 4}],
    'react/jsx-uses-vars': ERROR,
    'react-native/no-unused-styles': ERROR,
    'react-native/split-platform-components': ERROR,

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
