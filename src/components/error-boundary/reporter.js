/* @flow */
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import DeviceInfo from 'react-native-device-info';
import log from '../log/log';
import {getLogs} from '../debug-view/debug-view';
import {ResourceTypes, getShortEntityType} from '../api/api__resource-types';

const {EXCEPTION_REPORTER_TOKEN} = appPackage.config;

if (!EXCEPTION_REPORTER_TOKEN) {
  log.debug('Exception robot token is not set');
}

const SERVER_URI = 'https://youtrack.jetbrains.com/api/issues?fields=idReadable';

const YOUTRACK_MOBILE_PROJECT_ID = '22-174';
const YOUTRACK_MOBILE_TEAM_ID = '10-603';

export type ErrorData = { summary: string, description: string };

export async function reportCrash(summary: string, description: string): Promise<string> {
  const response = await fetch(SERVER_URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${EXCEPTION_REPORTER_TOKEN}`
    },
    body: JSON.stringify({
      summary,
      description,
      project: {id: YOUTRACK_MOBILE_PROJECT_ID},
      visibility: {
        $type: getShortEntityType(ResourceTypes.VISIBILITY_LIMITED),
        permittedGroups: [{id: YOUTRACK_MOBILE_TEAM_ID}]
      }
    })
  });
  const res: { idReadable: string } = await response.json();

  if (response.status > 400) {
    throw res;
  }

  return res.idReadable;
}

export async function createErrorData(error: Error): Promise<ErrorData> {
  const logs = await getLogs();
  const message = error.toString();
  const summary = message.split('\n')[0];
  const description = `
  App version: ${DeviceInfo.getVersion()};
  App build: ${DeviceInfo.getBuildNumber()};
  OS: ${DeviceInfo.getSystemName()};
  System version: ${DeviceInfo.getSystemVersion()};
  Device: ${DeviceInfo.getBrand()} ${DeviceInfo.getDeviceId()};

  ============== ERROR ==============
  \`\`\`
      ${message}
  \`\`\`

  ============== LOGS ===============
  \`\`\`
  ${logs}
  \`\`\`
      `;
  return {
    summary,
    description
  };
}
