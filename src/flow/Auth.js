/* @flow */

import type {AuthConfiguration} from 'react-native-app-auth';

export type AuthParams = {
  access_token: string,
  error_code?: string,
  refresh_token: string,
  token_type: string,
  scope: string,
};

export type AuthConfig = {
  serverUri: string,
  clientId: string,
  clientSecret?: string,
  scopes: string,
  sessionCookie?: string,
  landingUrl: string,
  youtrackServiceId: string
};

export type OAuthParams = {
  accessToken: string,
  accessTokenExpirationDate: string,
  authorizationCode: string,
  authorizeAdditionalParameters: Object,
  codeVerifier: string,
  idToken: string,
  refreshToken: string,
  scopes: Array<string>,
  tokenAdditionalParameters: Object,
  tokenType: string,
};

//$FlowFixMe
export type OAuthConfig = AuthConfiguration;

export type OAuthParams2 = {
  ...AuthParams,
  ...OAuthParams,
  inAppLogin?: boolean
};
