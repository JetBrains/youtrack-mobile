import type {AuthConfiguration} from 'react-native-app-auth';

export type AuthParams = {
  access_token: string;
  accessTokenExpirationDate: string;
  error_code?: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

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

export type OAuthConfig = AuthConfiguration;

export type OAuthParams2 = AuthParams &
  OAuthParams & {
  inAppLogin?: boolean;
};

export type RequestHeaders = {
  Authorization?: string;
  'User-Agent': string;
};
