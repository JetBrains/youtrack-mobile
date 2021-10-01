/* @flow */

import {authorize, prefetchConfiguration, refresh, revoke} from 'react-native-app-auth';

import Auth from './auth';
import log from '../log/log';
import OAuth2 from './oauth2';

import type {AppConfig} from '../../flow/AppConfig';
import type {OAuthConfig, OAuthParams} from '../../flow/Auth';
const createConfig = (config: AppConfig): OAuthConfig => {
  return {
    additionalParameters: {
      access_type: 'offline',
      prompt: 'login',
    },
    clientId: config.auth.clientId,
    redirectUrl: config.auth.landingUrl,
    scopes: config.auth.scopes.split(' '),
    serviceConfiguration: {
      authorizationEndpoint: `${config.auth.serverUri}/api/rest/oauth2/auth`,
      tokenEndpoint: `${config.auth.serverUri}/api/rest/oauth2/token`,
    },
    usePKCE: true,
  };
};

const prefetch = (config: AppConfig): void => {
  prefetchConfiguration({
    warmAndPrefetchChrome: true,
    ...createConfig(config),
  });
};

const revokeToken = async (config: AppConfig, accessToken: string): Promise<void> => {
  try {
    await revoke(createConfig(config), {
      tokenToRevoke: accessToken,
      sendClientId: true,
    });
    log.log('Access token revoked');
  } catch (error) {
    log.warn('Failed to revoke access token', error.message);
  }
};

const refreshToken = async (config: AppConfig, refreshToken: string): Promise<OAuthParams> => {
  try {
    const newOAuthParams: OAuthParams = await refresh(createConfig(config), {refreshToken});
    log.log('Access token refreshed');
    return newOAuthParams;
  } catch (error) {
    log.warn('Failed to refresh token', error.message);
    throw error;
  }
};

const doAuthorize = async (config: AppConfig): Promise<OAuthParams> => {
  try {
    const authConfig: OAuthConfig = createConfig(config);
    const authParams: OAuthParams = await authorize(authConfig);
    log.log('Access token received');
    return authParams;
  } catch (error) {
    log.warn('Authorization failed', error.message);
    throw error;
  }
};

const createAuthInstance = (config: AppConfig): Auth | OAuth2 => {
  return config.auth?.clientSecret ? new Auth(config) : new OAuth2(config);
};

export {
  createAuthInstance,
  doAuthorize,
  prefetch,
  refreshToken,
  revokeToken,
};
