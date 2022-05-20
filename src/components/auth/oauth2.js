/* @flow */

import log from '../log/log';
import {AuthBase} from './auth-base';
import {doAuthorize, normalizeAuthParams, refreshToken} from './oauth2-helper';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';
import {getAuthParamsKey} from '../storage/storage__oauth';
import {logEvent} from '../log/log-helper';

import type {AppConfig} from 'flow/AppConfig';
import type {AuthParams, OAuthParams} from 'flow/Auth';


export default class OAuth2 extends AuthBase {
  authParams: AuthParams;

  static async obtainTokenWithOAuthCode(config: AppConfig): Promise<AuthParams> {
    return await doAuthorize(config);
  }

  async setAuthParamsFromCache(): Promise<void> {
    const authParams: ?AuthParams = await this.getCachedAuthParams();
    if (authParams) {
      this.setAuthParams(authParams);
    }
  }

  setAuthParams(authParams: AuthParams) {
    this.authParams = authParams;
  }

  getAuthParams(): AuthParams {
    return this.authParams;
  }

  async refreshToken(): Promise<AuthParams> {
    let authParams: OAuthParams;
    const prevAuthParams: AuthParams = ((await this.getCachedAuthParams(): any): AuthParams);
    log.info('OAuth2 token refresh: start...', prevAuthParams);

    try {
      authParams = await refreshToken(this.config, prevAuthParams.refresh_token);
      log.info('OAuth2 token refresh: success', authParams);
    } catch (e) {
      const message: string = `OAuth2 token refresh: failed. ${e.message || e}`;
      logEvent({message, isError: true});
      if (e.error === 'banned_user') {
        e.error_description = ERROR_MESSAGE_DATA.USER_BANNED.title;
      }
      throw e;
    }

    if (authParams) {
      const updatedOauthParams: AuthParams = normalizeAuthParams({
        ...this.authParams,
        ...authParams,
      });
      this.setAuthParams(updatedOauthParams);
      await this.cacheAuthParams(updatedOauthParams, getAuthParamsKey());
      await this.loadCurrentUser(updatedOauthParams);
    }

    return authParams;
  }

}
