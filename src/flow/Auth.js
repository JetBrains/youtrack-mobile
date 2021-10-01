/* @flow */

export type AuthParams = {
  access_token: string,
  error_code?: string,
  refresh_token: string,
  token_type: string
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

export type OAuthConfig = {
  additionalParameters: {
    access_type: 'offline',
    prompt: 'login',
  },
  clientId: string,
  redirectUrl: string,
  scopes: Array<string>,
  serviceConfiguration: { authorizationEndpoint: string, tokenEndpoint: string },
  usePKCE: boolean,
};
