import type {AuthConfig} from './Auth';
export type AppConfig = {
  backendUrl: string;
  auth: AuthConfig;
  statisticsEnabled: boolean;
  version: string;
  build: string;
  l10n: {
    language: string;
    locale: string;
    predefinedQueries: {
      [id: string]: string;
    }
  };
};
export type EndUserAgreement = {
  enabled: boolean;
  text: string;
  majorVersion: number;
  minorVersion: number;
};
