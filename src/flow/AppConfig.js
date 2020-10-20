export type ConfigAuth = {
  serverUri: ?string,
  clientId: ?string,
  clientSecret: ?string,
  sessionCookie: ?string,
  scopes: string,
  landingUrl: string,
  youtrackServiceId: ?string
};

export type ConfigAuthFilled = {
  serverUri: string,
  clientId: string,
  clientSecret: string,
  sessionCookie: ?string,
  scopes: string,
  landingUrl: string,
  youtrackServiceId: string
}

export type AppConfig = {
  backendUrl: ?string;
  auth: ConfigAuth;
  statisticsEnabled: ?boolean;
  version: ?string;
};

export type AppConfigFilled = {
  backendUrl: string;
  auth: ConfigAuthFilled;
  statisticsEnabled: boolean;
  version: string;
};

export type EndUserAgreement = {
  enabled: boolean,
  text: string,
  majorVersion: number,
  minorVersion: number
}
