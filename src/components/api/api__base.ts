import qs from 'qs';

import ApiHelper from './api__helper';
import issueFields from 'components/api/api__issue-fields';
import log from 'components/log/log';
import Router from 'components/router/router';
import {fetch2, RequestController, requestController} from './api__request-controller';
import {handleRelativeUrl} from 'components/config/config';
import {HTTP_STATUS} from 'components/error/error-http-codes';

import Auth from 'components/auth/oauth2';
import type {AppConfig} from 'types/AppConfig';
import type {RequestHeaders} from 'types/Auth';
import {Attachment} from 'types/CustomFields';
import {NormalizedAttachment} from 'types/Attachment';
import {Visibility} from 'types/Visibility';

const MAX_QUERY_LENGTH = 2048;

type RequestOptions = {
  controller?: RequestController;
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
  isRefreshingToken: boolean;

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
    this.isRefreshingToken = false;
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

  convertToAbsURL(url: string): string {
    return handleRelativeUrl(url, this.config.backendUrl) as string;
  }

  isTokenOutdated(): boolean {
    return this.auth.isTokenOutdated();
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

    let response: any = await sendRequest();

    if (this.isError(response)) {
      const isNotAuthorized: boolean = response.status === HTTP_STATUS.UNAUTHORIZED || this.isTokenOutdated();
      if (!isNotAuthorized) {
        log.warn('Request failed', response);
        throw response;
      } else {
        log.debug('Unauthorised. Refreshing token...');
        try {
          await this.auth.refreshToken();
          log.debug('Repeat a request', url);
          response = await sendRequest();
        } catch (e) {
          if (!this.isRefreshingToken) {
            log.debug('Unauthorised. Token refresh failed. Logging in...', e);
            this.isRefreshingToken = true;
            Router.EnterServer({serverUrl: this.config.backendUrl});
          }
          throw e;
        }
      }
    } else {
      this.isRefreshingToken = false;
    }

    return options.parseJson === false ? response : await response?.json?.();
  }

  async updateAttachmentVisibility(
    subResourcePath: string,
    attachment: Attachment,
    visibility: Visibility | null,
  ): Promise<Attachment> {
    const queryString: string = qs.stringify({fields: issueFields.VISIBILITY.toString()});
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/${subResourcePath}/attachments/${attachment.id}?${queryString}`,
      'POST',
      {
        visibility,
      },
    );
  }

  async updateCommentAttachmentVisibility(
    subResourcePath: string,
    attachment: Attachment,
    visibility: Visibility | null,
  ): Promise<Attachment> {
    const queryString: string = qs.stringify({fields: issueFields.VISIBILITY.toString()});
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/${subResourcePath}/attachments/${attachment.id}?${queryString}`,
      'POST',
      {
        // name: attachment.name,
        visibility,
      },
    );
  }

  async attachFileToComment(
    subResourcePath: string,
    file: NormalizedAttachment,
    commentId: string | undefined,
  ): Promise<Attachment[]> {
    const commentResourcePath: string = commentId ? `comments/${commentId}` : 'draftComment';
    const url = `${subResourcePath}/${commentResourcePath}/attachments?fields=id,name,url,thumbnailURL,mimeType,imageDimensions(height,width)`;
    const response = await fetch(url, {
      method: 'POST',
      body: createFormData(file),
      headers: this.auth.getAuthorizationHeaders(),
    });
    const addedAttachments: Attachment[] = await response.json();
    return ApiHelper.convertAttachmentRelativeToAbsURLs(
      addedAttachments,
      this.config.backendUrl,
    );
  }

  async attachFile(subResourcePath: string, file: NormalizedAttachment): Promise<Attachment[]> {
    const url = `${subResourcePath}/attachments?fields=id,name`;
    const response = await fetch(url, {
      method: 'POST',
      body: createFormData(file),
      headers: this.auth.getAuthorizationHeaders(),
    });
    return await response.json();
  }
}


function createFormData(file: NormalizedAttachment): FormData {
  const formData = new FormData();
  formData.append('file', {
    uri: file.url,
    name: file.name,
    type: file.mimeType,
  });
  return formData;
}
