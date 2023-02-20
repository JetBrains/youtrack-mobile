import qs from 'qs';

import ApiHelper from './api__helper';
import log from 'components/log/log';
import {fetch2, requestController} from './api__request-controller';
import {HTTP_STATUS} from 'components/error/error-http-codes';
import {routeMap} from '../../app-routes';

import Auth from 'components/auth/oauth2';
import type {AppConfig} from 'types/AppConfig';
import type {CustomError} from 'types/Error';
import type {RequestHeaders} from 'types/Auth';

const MAX_QUERY_LENGTH = 2048;
type RequestOptions = {
  controller?: {[key in keyof typeof routeMap]?: AbortController};
  parseJson?: boolean;
};

function updateQueryStringParameter(uri: string, key: string, value: string) {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';

  if (uri.match(re)) {
    return uri.replace(re, `$1${key}=${value}$2`);
  } else {
    return `${uri + separator + key}=${value}`;
  }
}

function patchTopParam(url: string) {
  if (url.includes('$top') || url.includes(encodeURIComponent('$top'))) {
    return url;
  }

  return updateQueryStringParameter(url, '$top', '-1');
}

/**
 * https://youtrack.jetbrains.com/issue/YTM-261
 * http://www.mytecbits.com/microsoft/iis/iis-changing-maxquerystring-and-maxurl
 */
function assertLongQuery(url: string) {
  const [, ...queryParts] = url.split('?');
  const query = queryParts.join('');

  if (query.length > MAX_QUERY_LENGTH) {
    log.warn(
      `Query length (${query.length}) is longer than ${MAX_QUERY_LENGTH}. This doesn't work on some servers`,
      url,
    );
  }
}

requestController.init();

export default class BaseAPI {
  auth: Auth;
  config: AppConfig;
  isActualAPI: boolean;
  isModernGAP: boolean;
  youTrackUrl: string;
  youTrackIssueUrl: string;
  youTrackApiUrl: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.config = auth.config;
    const parts: string[] = (this.config.version || '').split('.') || [];
    const majorVersion: number = parseInt(parts[0], 10) || 0;
    const minorVersion: number = parseInt(parts[1] || '', 10);
    this.isActualAPI = majorVersion > 2022 || (majorVersion === 2022 && minorVersion >= 3);
    this.isModernGAP = (
      majorVersion > 2020 ||
      majorVersion === 2020 && minorVersion >= 6
    );

    this.youTrackUrl = this.config.backendUrl;
    this.youTrackApiUrl = `${this.youTrackUrl}/api`;
    this.youTrackIssueUrl = `${this.youTrackApiUrl}/issues`;
  }

  static createFieldsQuery(
    fields: Record<string, any> | Array<Record<string, any> | string>,
    restParams?: Record<string, any> | null | undefined,
    opts?: Record<string, any> | null | undefined,
  ): string {
    return qs.stringify(
      Object.assign({
        ...restParams,
        ...{
          fields: ApiHelper.toField(fields).toString(),
        },
      }),
      opts,
    );
  }

  shouldRefreshToken(response: Response | CustomError): boolean {
    let errText: string = '';
    const responseError: CustomError = response as CustomError;
    if (typeof responseError?.error === 'string') {
      errText = responseError.error;
    }
    return (
      response.status === HTTP_STATUS.UNAUTHORIZED ||
      ['invalid_grant', 'invalid_request', 'invalid_token'].includes(errText) ||
      this.auth.isTokenInvalid()
    );
  }

  isError(response: Response): boolean {
    return (
      response.status < HTTP_STATUS.SUCCESS ||
      response.status >= HTTP_STATUS.REDIRECT
    );
  }

  async makeAuthorizedRequest(
    url: string,
    method?: string | null | undefined,
    body?: Record<string, any> | null | undefined,
    options: RequestOptions = {
      parseJson: true,
    },
  ): Promise<any> {
    url = patchTopParam(url);
    log.debug(
      `"${method || 'GET'}" to ${url}${
        body ? ` with body |${JSON.stringify(body)}|` : ''
      }`,
    );
    assertLongQuery(url);

    const sendRequest = async (): Promise<Response> => {
      const requestHeaders: RequestHeaders = this.auth.getAuthorizationHeaders();

      if (!requestHeaders.Authorization) {
        log.warn(
          `Missing auth header in a request: "${method || 'GET'}":${url}`,
        );
      }

      return await fetch2(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            ...requestHeaders,
          },
          body: JSON.stringify(body),
        },
        options.controller,
      );
    };

    let response: Response = await sendRequest();

    if (
      response.status !== HTTP_STATUS.SUCCESS &&
      response.status !== HTTP_STATUS.SUCCESS_NO_CONTENT &&
      this.shouldRefreshToken(response)
    ) {
      log.debug('Token has expired');
      await this.auth.refreshToken();
      response = await sendRequest();
      log.debug('Repeat a request', url);
    }

    if (this.isError(response)) {
      log.warn('Request failed', response);
      throw response;
    }

    return options.parseJson === false ? response : await response.json();
  }
}
