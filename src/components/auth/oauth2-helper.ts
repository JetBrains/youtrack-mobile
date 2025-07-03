import {authorize, refresh, revoke} from 'react-native-app-auth';
import log from '../log/log';

import type {AppConfig} from 'types/AppConfig';
import type {AuthParams} from 'types/Auth';
import type {
  AppAuthError,
  AuthConfiguration,
  AuthorizeResult,
  RefreshResult,
} from 'react-native-app-auth';


const ACCEPT_HEADER: string = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE: string = 'application/x-www-form-urlencoded';

const createAuthConfig = (config: AppConfig, isRefresh: boolean = false): AuthConfiguration => {
  const {serverUri, clientId, landingUrl, scopes, clientSecret} = config.auth;
  const authURL = `${serverUri}/api/rest/oauth2`;
  const authConfig: AuthConfiguration = {
    clientId,
    dangerouslyAllowInsecureHttpRequests: true,
    redirectUrl: landingUrl,
    serviceConfiguration: {
      authorizationEndpoint: `${authURL}/auth`,
      tokenEndpoint: `${authURL}/token`,
    },
    scopes: scopes.split(' '),
  };
  if (clientSecret) {
    authConfig.clientSecret = clientSecret;
  }
  if (!isRefresh) {
    authConfig.additionalParameters = {
      access_type: 'offline',
      prompt: 'login',
    };
    authConfig.usePKCE = !clientSecret;
  }
  return authConfig;
};

const revokeToken = async (config: AppConfig, tokenToRevoke: string): Promise<void> => {
  try {
    await revoke(createAuthConfig(config), {
      tokenToRevoke,
      sendClientId: true,
    });
    log.log('OAuth2(revokeToken): Access token revoked');
  } catch (error) {
    log.warn('OAuth2(revokeToken): Failed to revoke access token', error);
  }
};

const refreshToken = async (config: AppConfig, refreshToken: string): Promise<RefreshResult> => {
  try {
    const results: RefreshResult = await refresh(createAuthConfig(config, true), {refreshToken});
    log.log('Access token refreshed');
    return results;
  } catch (error) {
    const e = error as AppAuthError;
    log.warn('OAuth2(refreshToken): Failed to refresh token', e.message || e);
    throw error;
  }
};

const doAuthorize = async (config: AppConfig): Promise<AuthParams> => {
  try {
    const authResult: AuthorizeResult = await authorize(createAuthConfig(config));
    log.log('OAuth2(doAuthorize): Access token received');
    return {
      access_token: authResult.accessToken,
      refresh_token: authResult.refreshToken,
      scope: authResult.scopes && authResult.scopes.length > 0 ? authResult.scopes.join(' ') : config.auth.scopes,
      token_type: authResult.tokenType,
    };
  } catch (error) {
    log.warn('Authorization failed', error);
    throw error;
  }
};

export {
  ACCEPT_HEADER,
  doAuthorize,
  refreshToken,
  revokeToken,
  URL_ENCODED_TYPE,
};
