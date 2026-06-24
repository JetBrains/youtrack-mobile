import ApiBase from './api__base';
import type Auth from '../auth/oauth2';
import {GlobalSettings} from 'types/GlobalSettings';

export default class GlobalSettingsAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getSettings(): Promise<GlobalSettings> {
    const config = this.auth.config;
    const legacySettings = await this.makeAuthorizedRequest(
      `${config.auth.serverUri}/api/rest/settings/public?fields=helpdeskEnabled`,
    );

    if (legacySettings.helpdeskEnabled !== undefined) {
      return legacySettings;
    }

    return await this.makeAuthorizedRequest(`${config.backendUrl}/api/config?fields=helpdeskEnabled`);
  }
}
