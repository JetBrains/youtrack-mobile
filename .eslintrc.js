module.exports = {
  root: true,
  extends: [
    '@react-native-community',
    'plugin:import/typescript',
    'plugin:jest/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: [
    'import',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
      },
    ],
    '@typescript-eslint/no-shadow': 'warn', //TODO: must be an error
    '@typescript-eslint/no-unused-vars': ['error', {'vars': 'local', 'args': 'none'}],
    'arrow-spacing': 'error',
    'constructor-super': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'no-console': 'error',
    'no-const-assign': 'error',
    'no-debugger': 'error',
    'no-dupe-class-members': 'error',
    'no-shadow': 'off',
    'no-this-before-super': 'error',
    'no-trailing-spaces': 0,
    'no-undef': 'off',
    'no-useless-escape': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'quotes': ['error', 'single', {'allowTemplateLiterals': true}],
  },
  env: {
    es6: true,
    jest: true,
  },

  globals: {
    AbortController: true,
  },
};
