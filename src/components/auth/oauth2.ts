import log from 'components/log/log';
import {AuthBase} from './auth-base';
import {doAuthorize, refreshToken} from './oauth2-helper';
import {getAuthParamsKey} from 'components/storage/storage__oauth';
import {getErrorMessage} from 'components/error/error-resolver';
import {logEvent} from 'components/log/log-helper';

import type {AnyError} from 'types/Error';
import type {AppConfig} from 'types/AppConfig';
import type {AuthParams} from 'types/Auth';
import type {RefreshResult} from 'react-native-app-auth';

export default class OAuth2 extends AuthBase {
  authParams: AuthParams = {} as AuthParams;

  static async obtainTokenWithOAuthCode(
    config: AppConfig,
  ): Promise<AuthParams> {
    return await doAuthorize(config);
  }

  async setAuthParamsFromCache(): Promise<void> {
    const authParams = await this.getCachedAuthParams();

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
    let prevAuthParams = this.getAuthParams();
    if (!prevAuthParams) {
      prevAuthParams = await this.getCachedAuthParams();
    }

    let refreshResult: RefreshResult;
    try {
      log.info('OAuth2(refreshToken) token refresh start...');
      refreshResult = await refreshToken(this.config, prevAuthParams.refresh_token);
      log.info('OAuth2(refreshToken) token refresh success');
    } catch (e) {
      const message: string = `OAuth2(refreshToken) token refresh failed. ${getErrorMessage(e as AnyError) || e}`;
      logEvent({message, isError: true});
      throw e;
    }

    let authParams = prevAuthParams;
    if (refreshResult) {
      authParams = {
        ...prevAuthParams,
        access_token: refreshResult.accessToken,
        refresh_token: refreshResult.refreshToken || prevAuthParams.refresh_token,
        scope: prevAuthParams.scope,
        token_type: refreshResult.tokenType,
      };
      this.setAuthParams(authParams);
      await this.cacheAuthParams(authParams, getAuthParamsKey());
      await this.loadCurrentHubUser(authParams);
    }

    return authParams;
  }
}
