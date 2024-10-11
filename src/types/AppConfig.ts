import type {AuthConfig} from './Auth';

export interface AppConfig {
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
  mobile: {
    serviceId: string;
    serviceSecret?: string;
  }
  ring: {
    serviceId: string;
    url: string;
  }
}

export type EndUserAgreement = {
  enabled: boolean;
  text: string;
};
