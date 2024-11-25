export interface AuthParams {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}

export interface AuthConfig {
  serverUri: string;
  clientId: string;
  clientSecret?: string;
  scopes: string;
  sessionCookie?: string;
  landingUrl: string;
  youtrackServiceId: string;
}

export interface RequestHeaders extends Record<string, string> {
  'User-Agent': string;
}

export interface RequestHeadersExtended extends RequestHeaders {
  Authorization: string;
}
