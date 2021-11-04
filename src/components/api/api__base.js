/* @flow */

import ApiHelper from './api__helper';
import log from '../log/log';
import qs from 'qs';
import {HTTP_STATUS} from '../error/error-http-codes';
import {fetch2, requestController} from './api__request-controller';
import {routeMap} from '../../app-routes';

import type Auth from '../auth/auth';
import type {AppConfigFilled} from '../../flow/AppConfig';

const MAX_QUERY_LENGTH = 2048;

type RequestOptions = {
  controller?: {
    [$Keys<typeof routeMap>]: AbortController,
  },
  parseJson?: boolean,
};

function updateQueryStringParameter(uri, key, value) {
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
    log.warn(`Query length (${query.length}) is longer than ${MAX_QUERY_LENGTH}. This doesn't work on some servers`, url);
  }
}

requestController.init();

export default class BaseAPI {
  auth: Auth;
  config: AppConfigFilled;

  youTrackUrl: string;
  youTrackIssueUrl: string;
  youTrackApiUrl: string;

  constructor(auth: Auth) {
    this.auth = auth;
    this.config = auth.config;

    this.youTrackUrl = this.config.backendUrl;
    this.youTrackApiUrl = `${this.youTrackUrl}/api`;
    this.youTrackIssueUrl = `${this.youTrackApiUrl}/issues`;
  }

  static createFieldsQuery(fields: Object | Array<Object | string>, restParams?: ?Object, opts: ?Object): string {
    return qs.stringify(
      Object.assign({
        ...restParams,
        ...{fields: ApiHelper.toField(fields).toString()},
      }),
      opts
    );
  }

  async makeAuthorizedRequest(
    url: string,
    method: ?string,
    body: ?Object,
    options: RequestOptions = {parseJson: true},
  ): Promise<any> {
    url = patchTopParam(url);
    log.debug(`"${method || 'GET'}" to ${url}${body ? ` with body |${JSON.stringify(body)}|` : ''}`);
    assertLongQuery(url);

    const sendRequest = async () => {
      return await fetch2(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            ...this.auth.getAuthorizationHeaders(),
          },
          body: JSON.stringify(body),
        },
        options.controller
      );
    };

    let response = await sendRequest();

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      log.info('Token is expired, refreshing token', response);
      await this.auth.refreshToken();
      response = await sendRequest();
    }

    if (response.status < HTTP_STATUS.SUCCESS || response.status >= HTTP_STATUS.REDIRECT) {
      throw response;
    }

    if (options.parseJson === false) {
      return response;
    }

    return await response.json();
  }
}
