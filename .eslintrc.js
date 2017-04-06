const ERROR = 'error';
const WARNING = 'warn';
const OFF = 'off';

module.exports = {
  'extends': "eslint:recommended",
  'parser': 'babel-eslint',
  'plugins': [
    'react',
    'react-native',
    'flowtype',
    'import'
  ],
  'rules': {
    'no-unused-vars': [ERROR, {'vars': 'local', 'args': 'none'}],
    'no-console': ERROR,
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
    'require-yield': OFF,

    //Modules
    'import/no-commonjs': ERROR,
    'import/first': ERROR,
    'import/no-duplicates': ERROR,
    'import/extensions': ERROR,
    'import/newline-after-import': ERROR,
    'import/named': ERROR,

    //React
    'react/jsx-uses-react': ERROR,
    'react/jsx-key': ERROR,
    'react/no-deprecated': ERROR,
    'react/jsx-max-props-per-line': [ERROR, {maximum: 4}],
    'react/jsx-uses-vars': ERROR,
    'react-native/no-unused-styles': ERROR,
    'react-native/split-platform-components': ERROR,

    'flowtype/define-flow-type': WARNING,
    'flowtype/no-weak-types': OFF
  },
  'env': {
    'es6': true,
    'commonjs': true,
    'mocha': true,
    'jest': true,
    'node': true
  },
  'globals': {
    'fetch': true,
    'console': true,
    'expect': true
  }
};
