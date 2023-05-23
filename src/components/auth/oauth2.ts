import log from 'components/log/log';
import {AuthBase} from './auth-base';
import {doAuthorize, normalizeAuthParams, refreshToken} from './oauth2-helper';
import {getAuthParamsKey} from 'components/storage/storage__oauth';
import {getErrorMessage} from 'components/error/error-resolver';
import {logEvent} from 'components/log/log-helper';

import type {AppConfig} from 'types/AppConfig';
import type {AuthParams, OAuthParams} from 'types/Auth';

export default class OAuth2 extends AuthBase {
  authParams: AuthParams;

  static async obtainTokenWithOAuthCode(
    config: AppConfig,
  ): Promise<AuthParams> {
    return await doAuthorize(config);
  }

  async setAuthParamsFromCache(): Promise<void> {
    const authParams:
      | AuthParams
      | null
      | undefined = await this.getCachedAuthParams();

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
    const prevAuthParams: AuthParams = ((await this.getCachedAuthParams()) as any) as AuthParams;
    log.info('OAuth2 token refresh: start...', prevAuthParams);

    try {
      authParams = await refreshToken(
        this.config,
        prevAuthParams.refresh_token,
      );
      log.info('OAuth2 token refresh: success', authParams);
    } catch (e: any) {
      const message: string = `OAuth2 token refresh failed. ${getErrorMessage(e) || e}`;
      logEvent({message, isError: true});
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


  isTokenOutdated(): boolean {
    const authParams: AuthParams | null | undefined = this.getAuthParams();

    if (!authParams?.access_token || !authParams?.accessTokenExpirationDate) {
      return true;
    }

    const date: Date = new Date(authParams.accessTokenExpirationDate);
    return isNaN(date.getTime()) ? true : date.getTime() < Date.now();
  }
}
