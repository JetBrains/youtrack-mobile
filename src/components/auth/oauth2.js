/* @flow */

import EncryptedStorage from 'react-native-encrypted-storage';

import log from '../log/log';
import {AuthBase} from './auth-base';
import {doAuthorize, refreshToken, revokeToken} from './oauth2-helper';
import {getOAuthParamsKey, getStoredSecurelyAuthParams, storeSecurelyAuthParams} from '../storage/storage__oauth';
import {logEvent} from '../log/log-helper';
import {STORAGE_OAUTH_PARAMS_KEY} from '../storage/storage';

import type {AppConfig} from '../../flow/AppConfig';
import type {OAuthParams} from '../../flow/Auth';


export default class OAuth2 extends AuthBase {
  authParams: OAuthParams;

  static obtainToken(config: AppConfig): Promise<OAuthParams> {
    return doAuthorize(config);
  }

  async setAuthParamsFromCache(): Promise<void> {
    this.authParams = await this.getCachedAuthParams();
    await this.loadCurrentUser(this.authParams); //TODO: should be loaded separately
  }

  getPermissionsCacheURL(): string { //TODO: same as in the base class
    return this.PERMISSIONS_CACHE_URL;
  }

  getTokenType(): string {
    return this.authParams.tokenType;
  }

  getAccessToken(): string {
    return this.authParams.accessToken;
  }

  getRefreshToken(authParams: OAuthParams): string {
    return authParams.refreshToken;
  }

  async logOut(): Promise<void> {
    await EncryptedStorage.removeItem(STORAGE_OAUTH_PARAMS_KEY, () => {
      EncryptedStorage.setItem(STORAGE_OAUTH_PARAMS_KEY, '');
    });
    await revokeToken(this.config, this.authParams.accessToken);
    this.authParams = null;
  }

  async refreshToken(): Promise<OAuthParams> {
    let authParams: OAuthParams;
    const prevAuthParams: OAuthParams = ((await this.getCachedAuthParams(): any): OAuthParams);
    log.info('Token refresh: start...', prevAuthParams);

    if (!prevAuthParams.refreshToken) {
      try {
        authParams = await OAuth2.obtainToken(this.config);
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
        throw e;
      }
    }

    if (authParams.accessToken) {
      const updatedOauthParams: OAuthParams = {
        ...this.authParams,
        accessToken: authParams.accessToken,
        accessTokenExpirationDate: authParams.accessTokenExpirationDate || this.authParams.accessTokenExpirationDate,
        refreshToken: authParams.refreshToken || this.authParams.refreshToken,
      };
      await this.cacheAuthParams(updatedOauthParams, getOAuthParamsKey());
      await this.loadCurrentUser(updatedOauthParams);
    }

    return authParams;
  }

  async cacheAuthParams(oauthParams: OAuthParams, timestamp: string): Promise<void> {
    await storeSecurelyAuthParams(oauthParams, timestamp);
  }

  async getCachedAuthParams(): Promise<OAuthParams> {
    const oauthParams: OAuthParams | null = await getStoredSecurelyAuthParams(getOAuthParamsKey());
    if (!oauthParams) {
      throw new Error('No stored auth params found');
    }
    return oauthParams;
  }
}
