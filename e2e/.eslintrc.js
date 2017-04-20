const ERROR = 'error';
const WARNING = 'warn';
const OFF = 'off';

module.exports = {
  rules: {
    'import/no-commonjs': OFF,
  },
  globals: {
    expect: true,
    element: true,
    device: true,
    by: true,
    waitFor: true
  }
};
