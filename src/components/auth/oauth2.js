/* @flow */

import log from '../log/log';
import {AuthBase} from './auth-base';
import {doAuthorize, refreshToken} from './oauth2-helper';
import {getAuthParamsKey} from '../storage/storage__oauth';
import {logEvent} from '../log/log-helper';

import type {AppConfig} from '../../flow/AppConfig';
import type {OAuthParams2} from '../../flow/Auth';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';


export default class OAuth2 extends AuthBase {
  authParams: OAuthParams2;

  static async obtainTokenWithOAuthCode(config: AppConfig): Promise<OAuthParams2> {
    return doAuthorize(config);
  }

  async checkAuthorization(): Promise<void> {
    this.authParams = await this.getCachedAuthParams();
    return await this.loadCurrentUser(this.authParams);
  }

  getTokenType(): string {
    return this.authParams.tokenType || this.authParams.token_type;
  }

  getAccessToken(): string {
    return this.authParams.accessToken || this.authParams.access_token;
  }

  getRefreshToken(authParams: OAuthParams2): string {
    return authParams.refreshToken || authParams.refresh_token;
  }

  async refreshTokenOAuth(): Promise<OAuthParams2> {
    let authParams: OAuthParams2;
    const prevAuthParams: OAuthParams2 = ((await this.getCachedAuthParams(): any): OAuthParams2);
    log.info('Token refresh: start...', prevAuthParams);

    if (!prevAuthParams.refreshToken) {
      try {
        authParams = await OAuth2.obtainTokenWithOAuthCode(this.config);
      } catch (e) {
        throw e;
      }
    } else {
      try {
        authParams = await refreshToken(this.config, prevAuthParams.refreshToken);
        log.info('Token refresh: success', authParams);
      } catch (e) {
        const message: string = `Token refresh: failed. ${e.message || e}`;
        logEvent({message, isError: true});
        if (e.error === 'banned_user') {
          e.error_description = ERROR_MESSAGE_DATA.USER_BANNED.title;
        }
        throw e;
      }
    }

    if (authParams.accessToken) {
      const updatedOauthParams: OAuthParams2 = {
        ...this.authParams,
        accessToken: authParams.accessToken,
        accessTokenExpirationDate: authParams.accessTokenExpirationDate || this.authParams.accessTokenExpirationDate,
        refreshToken: authParams.refreshToken || this.authParams.refreshToken,
      };
      await this.cacheAuthParams(updatedOauthParams, getAuthParamsKey());
      await this.loadCurrentUser(updatedOauthParams);
    }

    return authParams;
  }

  refreshToken(): Promise<any> {
    return this.authParams?.refreshToken ? this.refreshTokenOAuth() : super.refreshToken();
  }

}
