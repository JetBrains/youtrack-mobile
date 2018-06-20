const updateJsonFile = require('update-json-file');

const EXCEPTION_ROBOT_TOKEN = process.env.exeptionReporterToken;

if (!EXCEPTION_ROBOT_TOKEN) {
  console.error('process.env', process.env);
  throw new Error('exeptionReporterToken is not set');
}

updateJsonFile('package.json', data => {
  data.config.EXCEPTION_ROBOT_TOKEN = EXCEPTION_ROBOT_TOKEN;
  console.info('EXCEPTION_ROBOT_TOKEN updated to', EXCEPTION_ROBOT_TOKEN);
  return data;
});
