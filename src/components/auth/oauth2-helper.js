/* @flow */

import {authorize, prefetchConfiguration, refresh, revoke} from 'react-native-app-auth';

import log from '../log/log';

import type {AppConfig} from '../../flow/AppConfig';
import type {OAuthConfig, OAuthParams2} from '../../flow/Auth';

const ACCEPT_HEADER: string = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE: string = 'application/x-www-form-urlencoded';

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
    dangerouslyAllowInsecureHttpRequests: true,
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

const refreshToken = async (config: AppConfig, refreshToken: string): Promise<OAuthParams2> => {
  try {
    const newOAuthParams: OAuthParams2 = await refresh(createConfig(config), {refreshToken});
    log.log('Access token refreshed');
    return newOAuthParams;
  } catch (error) {
    log.warn('Failed to refresh token', error.message);
    throw error;
  }
};

const doAuthorize = async (config: AppConfig): Promise<OAuthParams2> => {
  try {
    const authParams: OAuthParams2 = await authorize(createConfig(config));
    log.log('Access token received');
    return authParams;
  } catch (error) {
    log.warn('Authorization failed', error.message);
    throw error;
  }
};


export {
  ACCEPT_HEADER,
  doAuthorize,
  prefetch,
  refreshToken,
  revokeToken,
  URL_ENCODED_TYPE,
};
