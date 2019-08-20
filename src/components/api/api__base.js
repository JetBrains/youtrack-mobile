/* @flow */
import log from '../log/log';
import type Auth from '../auth/auth';
import type {AppConfigFilled} from '../../flow/AppConfig';
import qs from 'qs';
import ApiHelper from './api__helper';

const STATUS_UNAUTHORIZED = 401;
const STATUS_OK_IF_MORE_THAN = 200;
const STATUS_BAD_IF_MORE_THATN = 300;

const MAX_QUERY_LENGTH = 2048;

type RequestOptions = {
  parseJson: boolean
};

const defaultRequestOptions: RequestOptions = {
  parseJson: true
};

function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, `$1${key}=${value}$2`);
  }
  else {
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

  static createFieldsQuery(fields: Object|Array<Object|string>, restParams?: Object): string {
    return qs.stringify(
      Object.assign({
        ...restParams,
        ...{fields: ApiHelper.toField(fields).toString()}
      })
    );
  }

  async makeAuthorizedRequest(url: string, method: ?string, body: ?Object, options: RequestOptions = defaultRequestOptions) {
    url = patchTopParam(url);
    log.debug(`Making ${method || 'GET'} request to ${url}${body ? ` with body |${JSON.stringify(body)}|` : ''}`);
    assertLongQuery(url);

    const sendRequest = async () => {
      return await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
          ...this.auth.getAuthorizationHeaders()
        },
        body: JSON.stringify(body)
      });
    };

    let res = await sendRequest();

    if (res.status === STATUS_UNAUTHORIZED) {
      log.info('Looks like the token is expired, will try to refresh', res);
      await this.auth.refreshToken();
      res = await sendRequest();
    }

    if (res.status < STATUS_OK_IF_MORE_THAN || res.status >= STATUS_BAD_IF_MORE_THATN) {
      log.debug(`Got error from ${url}: ${res?.status}. Response body: ${res?._bodyText}`);
      throw res;
    }

    if (!options.parseJson) {
      return res;
    }
    return await res.json();
  }
}
