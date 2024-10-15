import qs from 'qs';

import ApiHelper from './api__helper';
import issueFields from 'components/api/api__issue-fields';
import log from 'components/log/log';
import {fetch2, RequestController, requestController} from './api__request-controller';
import {getErrorMessage, resolveErrorMessage} from 'components/error/error-resolver.ts';
import {handleRelativeUrl} from 'components/config/config';
import {HTTP_STATUS} from 'components/error/error-http-codes';

import type Auth from 'components/auth/oauth2';
import type {AppConfig} from 'types/AppConfig';
import type {Attachment} from 'types/CustomFields';
import type {CustomError} from 'types/Error.ts';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Visibility, VisibilityGroups} from 'types/Visibility';

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
      url
    );
  }
}

requestController.init();

const defaultRequestOptions: RequestOptions = {parseJson: true};

export default class BaseAPI {
  auth: Auth;
  config: AppConfig;
  isActualAPI: boolean;
  isModernGAP: boolean;
  youTrackUrl: string;
  youTrackIssueUrl: string;
  youTrackApiUrl: string;
  isTokenRefreshFailed: boolean;
  youTrackProjectUrl: string;

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
    this.isTokenRefreshFailed = false;
    this.youTrackProjectUrl = `${this.youTrackUrl}/api/admin/projects`;
  }

  static createFieldsQuery(
    fields: Record<string, any> | Array<Record<string, any> | string> | string,
    restParams?: Record<string, any> | null,
    opts?: Record<string, any>
  ): string {
    return qs.stringify(
      Object.assign({
        ...(typeof restParams === 'object' ? restParams : {}),
        fields: ApiHelper.toField(fields).toString(),
      }),
      opts,
    );
  }

  convertToAbsURL(url: string): string {
    return handleRelativeUrl(url, this.config.backendUrl) as string;
  }

  async getErrorMessage(err: CustomError) {
    return await resolveErrorMessage(err);
  }

  isUnauthorized(err: Response | CustomError, status: number) {
    return getErrorMessage(err) === 'Invalid token' || status === HTTP_STATUS.UNAUTHORIZED;
  }

  isHTTPError(status: number): boolean {
    return status < HTTP_STATUS.SUCCESS || status >= HTTP_STATUS.REDIRECT;
  }

  async doRequest(apiCall: () => Promise<Response | CustomError>): Promise<Response | CustomError> {
    const send = async () => await apiCall();
    let response = await send();

    if (!this.isHTTPError(response.status)) {
      this.isTokenRefreshFailed = false;
      return response;
    }

    const error = await (response as Response).json();
    if (this.isUnauthorized(error, response.status)) {
      try {
        log.info('API(doRequest):Unauthorised: Refreshing token...');
        await this.auth.refreshToken();
        log.info('API(doRequest):Repeating a request');
        response = await send();
      } catch (tokenRefreshError) {
        try {
          log.info(
            'API(doRequest):Unauthorised: Token refresh failed. Logging in...',
            await this.getErrorMessage(tokenRefreshError as CustomError)
          );
        } catch (er) {}
        if (!this.isTokenRefreshFailed) {
          this.isTokenRefreshFailed = true;
          this.auth.onTokenRefreshError();
        }
        throw tokenRefreshError;
      }
      return response;
    } else {
      try {
        log.warn('API(doRequest): Request failed.', {
          error: error.error || '',
          error_description: error.error_description || '',
          error_type: error.error_type || '',
          error_workflow_type: error.error_workflow_type || '',
        });
      } catch (er) {}
      throw error;
    }
  }

  async makeAuthorizedRequest(
    url: string,
    method?: string | null,
    body?: Record<string, any> | null,
    options: RequestOptions = defaultRequestOptions
  ) {
    url = patchTopParam(url);
    assertLongQuery(url);

    const request = async () => {
      return await fetch2(
        url,
        {
          method,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/plain, */*',
            ...this.auth.getAuthorizationHeaders(),
          },
          body: JSON.stringify(body),
        },
        options.controller
      );
    };
    const response = await this.doRequest(request) as Response;
    return options.parseJson === false ? response : await response?.json?.();
  }

  async submitFormRequest(
    name: string,
    url: string,
    body: Record<string, any> | null,
    files: NormalizedAttachment[] | null,
    options: RequestOptions = defaultRequestOptions
  ) {
    log.info('API: Submitting a form');
    const request = async (): Promise<Response> => {
      const formData = new FormData();
      formData.append(name, JSON.stringify(body));
      if (files?.length) {
        files.forEach(f => formData.append('file', createFileData(f)));
      }
      return await fetch2(
        url,
        {
          method: 'POST',
          headers: this.auth.getAuthorizationHeaders(),
          body: formData,
        },
        options.controller,
      );
    };

    const response = await this.doRequest(request) as Response;
    return options.parseJson === false ? response : await response?.json?.();
  }

  async updateVisibility(url: string, visibility: VisibilityGroups | null): Promise<VisibilityGroups> {
    const queryString = BaseAPI.createFieldsQuery({visibility: issueFields.getVisibility.toString()});
    return await this.makeAuthorizedRequest(`${url}?${queryString}`, 'POST', {visibility});
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
      body: createFileFormData(file),
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
      body: createFileFormData(file),
      headers: this.auth.getAuthorizationHeaders(),
    });
    return await response.json();
  }
}

function createFileData(file: NormalizedAttachment) {
  return {
    uri: file.url,
    name: file.name,
    type: file.mimeType,
  };
}

function createFileFormData(file: NormalizedAttachment): FormData {
  const formData = new FormData();
  formData.append('file', createFileData(file));
  return formData;
}
