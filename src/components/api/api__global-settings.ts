import ApiBase from './api__base';
import type Auth from '../auth/oauth2';
import {GlobalSettings} from 'types/GlobalSettings';

export default class GlobalSettingsAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getSettings(): Promise<GlobalSettings> {
    return await this.makeAuthorizedRequest(
      `${this.auth.config.auth.serverUri}/api/rest/settings/public?fields=helpdeskEnabled`
    );
  }
}
