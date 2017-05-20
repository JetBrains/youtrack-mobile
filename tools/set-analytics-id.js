const updateJsonFile = require('update-json-file');

const ANALYTICS_ID = process.env.googleAnalyticsID;

if (!ANALYTICS_ID) {
  console.error('process.env', process.env);
  throw new Error('ANALYTICS_ID is not set');
}

updateJsonFile('package.json', data => {
  data.config.ANALYTICS_ID = ANALYTICS_ID;
  console.info('ANALYTICS_ID updated to', ANALYTICS_ID);
  return data;
});
