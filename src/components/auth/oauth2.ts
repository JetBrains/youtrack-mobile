import log from 'components/log/log';
import {AuthBase} from './auth-base';
import {doAuthorize, refreshToken} from './oauth2-helper';
import {getAuthParamsKey} from 'components/storage/storage__oauth';
import {getErrorMessage} from 'components/error/error-resolver';
import {logEvent} from 'components/log/log-helper';

import type {AppConfig} from 'types/AppConfig';
import type {AuthParams} from 'types/Auth';
import type {RefreshResult} from 'react-native-app-auth';

export default class OAuth2 extends AuthBase {
  authParams: AuthParams | null = null;

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
    return this.authParams!;
  }

  async refreshToken(): Promise<AuthParams> {
    let refreshResult: RefreshResult;
    let prevAuthParams: AuthParams | null = this.getAuthParams();
    if (!prevAuthParams) {
      prevAuthParams = await this.getCachedAuthParams();
    }

    try {
      log.info('OAuth2(refreshToken) token refresh start...');
      refreshResult = await refreshToken(this.config, prevAuthParams.refresh_token);
      log.info('OAuth2(refreshToken) token refresh success');
    } catch (e: any) {
      const message: string = `OAuth2(refreshToken) token refresh failed. ${getErrorMessage(e) || e}`;
      logEvent({message, isError: true});
      throw e;
    }

    let authParams = this.getAuthParams()!;
    if (refreshResult) {
      authParams = {
        access_token: refreshResult.accessToken,
        refresh_token: refreshResult.refreshToken || this.getAuthParams()!.refresh_token,
        scope: this.getAuthParams()!.scope,
        token_type: refreshResult.tokenType,
      };
      this.setAuthParams(authParams);
      await this.cacheAuthParams(authParams, getAuthParamsKey());
      await this.loadCurrentHubUser(authParams);
    }

    return authParams;
  }
}
