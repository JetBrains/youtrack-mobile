/* @flow */

import DeviceInfo from 'react-native-device-info';

import appPackage from '../../../package.json';
import log, {getLogs} from '../log/log';
import {getStorageState} from '../storage/storage';
import {ResourceTypes, getShortEntityType} from '../api/api__resource-types';

import type {AppConfig} from 'flow/AppConfig';

export type ReportErrorData = { summary: string, description: string };

const {EXCEPTION_REPORTER_TOKEN} = appPackage.config;
if (!EXCEPTION_REPORTER_TOKEN) {
  log.debug('Exception reporter token is not set');
}

const SERVER_URI = 'https://youtrack.jetbrains.com/api/issues?fields=idReadable';
const YOUTRACK_MOBILE_TEAM_ID = '10-603';

export const YOUTRACK_MOBILE_PROJECT_ID = '22-174';


export async function sendReport(summary: string, description: string): Promise<string> {
  const response: Response = await fetch(SERVER_URI, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/plain, */*',
      Authorization: `Bearer ${EXCEPTION_REPORTER_TOKEN}`,
    },
    body: JSON.stringify({
      summary,
      description,
      project: {id: YOUTRACK_MOBILE_PROJECT_ID},
      visibility: {
        $type: getShortEntityType(ResourceTypes.VISIBILITY_LIMITED),
        permittedGroups: [{id: YOUTRACK_MOBILE_TEAM_ID}],
      },
    }),
  });

  const parsedResponse: { idReadable: string } = await response.json();
  if (response.status > 400) {
    throw parsedResponse;
  }

  return parsedResponse.idReadable;
}

export const getAppAndDeviceData = (): string => {
  let config: $Shape<AppConfig>;
  try {
    config = ((getStorageState().config: any): AppConfig);
  } catch (e) {
    const notDefined: string = '<not-defined>';
    config = {
      version: notDefined,
      backendUrl: notDefined,
      build: notDefined,
    };
  }

  return `
  App version: ${DeviceInfo.getVersion()};
  App build: ${DeviceInfo.getBuildNumber()};
  OS: ${DeviceInfo.getSystemName()};
  System version: ${DeviceInfo.getSystemVersion()};
  Device: ${DeviceInfo.getBrand()} ${DeviceInfo.getDeviceId()};

  YouTrack version: ${config.version};
  YouTrack build: ${config?.build};
  YouTrack URL: ${config.backendUrl};
  `;
};

export const getDeviceLogs = async (): Promise<string> => {
  return await getLogs();
};

export async function createReportErrorData(error: Error | string, isCrashReport: boolean = false): Promise<ReportErrorData> {
  const message: string = error.toString();
  const summary: string = message.split('\n')[0];

  const description: string = `
  ${isCrashReport ? '#### CrashReport' : ''}
  ${getAppAndDeviceData()}

  ============== ERROR ==============
  \`\`\`
      ${message}
  \`\`\`

  ============== LOGS ===============
  \`\`\`
  ${await getDeviceLogs()}
  \`\`\`
      `;
  return {
    summary,
    description,
  };
}
