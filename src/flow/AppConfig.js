declare type ConfigAuth = {
  serverUri: ?string,
  clientId: ?string,
  clientSecret: ?string,
  sessionCookie: ?string,
  scopes: string,
  landingUrl: string,
  youtrackServiceId: ?string
};

declare type ConfigAuthFilled = {
  serverUri: string,
  clientId: string,
  clientSecret: string,
  sessionCookie: ?string,
  scopes: string,
  landingUrl: string,
  youtrackServiceId: string
}

declare type AppConfig = {
  backendUrl: ?string;
  auth: ConfigAuth;
  statisticsEnabled: ?boolean;
  version: ?string;
};

declare type AppConfigFilled = {
  backendUrl: string;
  auth: ConfigAuthFilled;
  statisticsEnabled: boolean;
  version: string;
};
