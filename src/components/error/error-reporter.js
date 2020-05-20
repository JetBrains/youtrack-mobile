/* @flow */
import appPackage from '../../../package.json'; // eslint-disable-line import/extensions
import DeviceInfo from 'react-native-device-info';
import log, {getLogs} from '../log/log';
import {ResourceTypes, getShortEntityType} from '../api/api__resource-types';
import {getStorageState} from '../storage/storage';
import {resolveErrorMessage} from './error-resolver';

import type {HTTPResponse} from '../../flow/Error';
import type {AppConfig} from '../../flow/AppConfig';

const {EXCEPTION_REPORTER_TOKEN} = appPackage.config;

if (!EXCEPTION_REPORTER_TOKEN) {
  log.debug('Exception reporter token is not set');
}

const SERVER_URI = 'https://youtrack.jetbrains.com/api/issues?fields=idReadable';

const YOUTRACK_MOBILE_PROJECT_ID = '22-174';
const YOUTRACK_MOBILE_TEAM_ID = '10-603';

export type ReportErrorData = { summary: string, description: string };


export async function sendErrorReport(summary: string, description: string): Promise<string> {
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

export async function createReportErrorData(error: Error | string): Promise<ReportErrorData> {
  const logs = await getLogs();
  const message = error.toString();
  const summary = message.split('\n')[0];
  let config: AppConfig | Object = {};
  try {
    config = getStorageState().config;
  } catch (e) {
    //
  }

  const description = `
  App version: ${DeviceInfo.getVersion()};
  App build: ${DeviceInfo.getBuildNumber()};
  OS: ${DeviceInfo.getSystemName()};
  System version: ${DeviceInfo.getSystemVersion()};
  Device: ${DeviceInfo.getBrand()} ${DeviceInfo.getDeviceId()};

  YouTrack version: ${config?.version};
  YouTrack URL: ${config?.backendUrl};

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

function getNowDate(): string {
  return new Date(Date.now()).toString();
}

function getResponseDate(response: HTTPResponse): string {
  return response?.headers?.map?.date || getNowDate();
}

async function resolveErrorMessageFromResponse(response: HTTPResponse): Promise<string> {
  let errorMessage: string;
  try {
    errorMessage = await resolveErrorMessage(response);
  } catch (e) {
    errorMessage = JSON.stringify(response);
  }
  return errorMessage;
}

export const createExtendedErrorMessage = async (response: HTTPResponse, url: string, method: ?string): Promise<string> => {
  const requestURL: string = url.split('?fields=')[0];
  const errorMessage: string = await resolveErrorMessageFromResponse(response);

  return `"${method || 'GET'}" to ${requestURL}\n\n${errorMessage}`;
};

export async function reportError(error: Error | string, title?: string) {
  try {
    const isErrorInstance: boolean = error instanceof Error;
    const date: string = isErrorInstance ? getResponseDate(error) : getNowDate();
    const errorMessage: string = isErrorInstance ? await resolveErrorMessageFromResponse(error) : error.toString();
    const reportErrorData: ReportErrorData = await createReportErrorData(errorMessage);

    sendErrorReport(`${title || 'Error'}: ${reportErrorData.summary}`, `${date}\n${reportErrorData.description}`);
  } catch (e) {
    //
  }
}
