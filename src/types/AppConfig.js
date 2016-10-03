declare type ConfigAuth = {
  serverUri: ?string,
  clientId: ?string,
  clientSecret: ?string,
  scopes: string,
  landingUrl: string,
  youtrackServiceId: ?string
};

declare type ConfigAuthFilled = {
  serverUri: string,
  clientId: string,
  clientSecret: string,
  scopes: string,
  landingUrl: string,
  youtrackServiceId: string
}

declare type AppConfig = {
  backendUrl: ?string;
  auth: ConfigAuth;
  statisticsEnabled: ?boolean;
};

declare type AppConfigFilled = {
  backendUrl: string;
  auth: ConfigAuthFilled;
  statisticsEnabled: boolean;
};
