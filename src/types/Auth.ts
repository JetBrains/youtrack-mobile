export interface AuthParams {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export type AuthConfig = {
  serverUri: string;
  clientId: string;
  clientSecret?: string;
  scopes: string;
  sessionCookie?: string;
  landingUrl: string;
  youtrackServiceId: string;
};

export type OAuthParams = {
  accessToken: string;
  accessTokenExpirationDate: string;
  authorizationCode: string;
  authorizeAdditionalParameters: Record<string, any>;
  codeVerifier: string;
  idToken: string;
  refreshToken: string;
  scopes: string[];
  tokenAdditionalParameters: Record<string, any>;
  tokenType: string;
};

export type OAuthParams2 = AuthParams & OAuthParams;

export type RequestHeaders = {
  Authorization?: string;
  'User-Agent': string;
};
