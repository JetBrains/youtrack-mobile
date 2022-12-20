import {
  authorize,
  prefetchConfiguration,
  refresh,
  revoke,
} from 'react-native-app-auth';
import log from '../log/log';
import type {AppConfig} from 'flow/AppConfig';
import type {AuthParams, OAuthConfig, OAuthParams2} from 'flow/Auth';
const ACCEPT_HEADER: string = 'application/json, text/plain, */*';
const URL_ENCODED_TYPE: string = 'application/x-www-form-urlencoded';

const normalizeAuthParams = (authParams: OAuthParams2): Promise<AuthParams> => {
  return {
    access_token: authParams.accessToken || authParams.access_token,
    accessTokenExpirationDate: authParams.accessTokenExpirationDate,
    expires_in: authParams.expires_in,
    refresh_token: authParams.refreshToken || authParams.refresh_token,
    scope: authParams.scope,
    scopes: authParams.scopes,
    token_type: authParams.tokenType || authParams.token_type,
  };
};

const createConfig = (
  config: AppConfig,
  isRefresh: boolean = false,
): OAuthConfig => {
  let authConfiguration: OAuthConfig = {
    clientId: config.auth.clientId,
    clientSecret: config.auth.clientSecret,
    dangerouslyAllowInsecureHttpRequests: true,
    redirectUrl: config.auth.landingUrl,
    serviceConfiguration: {
      authorizationEndpoint: `${config.auth.serverUri}/api/rest/oauth2/auth`,
      tokenEndpoint: `${config.auth.serverUri}/api/rest/oauth2/token`,
    },
  };

  if (!isRefresh) {
    authConfiguration = {
      ...authConfiguration,
      additionalParameters: {
        access_type: 'offline',
        prompt: 'login',
      },
      scopes: config.auth.scopes.split(' '),
      usePKCE: !config.auth.clientSecret,
    };
  }

  if (!config.auth.clientSecret) {
    delete authConfiguration.clientSecret;
  }

  return authConfiguration;
};

const prefetch = (config: AppConfig): void => {
  prefetchConfiguration({
    warmAndPrefetchChrome: true,
    ...createConfig(config),
  });
};

const revokeToken = async (
  config: AppConfig,
  tokenToRevoke: string,
): Promise<void> => {
  try {
    await revoke(createConfig(config), {
      tokenToRevoke,
      sendClientId: true,
    });
    log.log('Access token revoked');
  } catch (error) {
    log.warn('Failed to revoke access token', error.message);
  }
};

const refreshToken = async (
  config: AppConfig,
  refreshToken: string,
): Promise<OAuthParams2> => {
  try {
    const newOAuthParams: OAuthParams2 = await refresh(
      createConfig(config, true),
      {
        refreshToken,
      },
    );
    log.log('Access token refreshed');
    return newOAuthParams;
  } catch (error) {
    log.warn('Failed to refresh token', error.message);
    throw error;
  }
};

const doAuthorize = async (config: AppConfig): Promise<AuthParams> => {
  try {
    const authParams: OAuthParams2 = await authorize(createConfig(config));
    log.log('Access token received');
    return normalizeAuthParams(authParams);
  } catch (error) {
    log.warn('Authorization failed', error.message);
    throw error;
  }
};

export {
  ACCEPT_HEADER,
  doAuthorize,
  normalizeAuthParams,
  prefetch,
  refreshToken,
  revokeToken,
  URL_ENCODED_TYPE,
};