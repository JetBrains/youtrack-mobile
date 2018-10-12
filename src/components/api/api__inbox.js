/* @flow */
import ApiBase from './api__base';

import type Auth from '../auth/auth';

export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getInbox(): Promise<Array<Object>> {
    const inbox = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/notifications?fields=sender(login),recipient(login),metadata,content&since=1`
    );

    return inbox;
  }
}
