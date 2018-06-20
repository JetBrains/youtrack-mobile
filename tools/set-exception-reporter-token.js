const updateJsonFile = require('update-json-file');

const EXCEPTION_REPORTER_TOKEN = process.env.exeptionReporterToken;

if (!EXCEPTION_REPORTER_TOKEN) {
  console.error('process.env', process.env);
  throw new Error('exeptionReporterToken is not set');
}

updateJsonFile('package.json', data => {
  data.config.EXCEPTION_REPORTER_TOKEN = EXCEPTION_REPORTER_TOKEN;
  console.info('EXCEPTION_REPORTER_TOKEN updated to', EXCEPTION_REPORTER_TOKEN);
  return data;
});
