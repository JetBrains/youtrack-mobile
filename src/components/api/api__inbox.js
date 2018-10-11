/* @flow */
import qs from 'qs';
import ApiBase from './api__base';

import type Auth from '../auth/auth';

export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getInbox(): Promise<Array> {
    const queryString = qs.stringify({
      fields: 'fields=sender(login),recipient(login),metadata,content&since=1'
    }, {encode: false});

    const inbox = await this.makeAuthorizedRequest(`${this.youTrackApiUrl}/users/notifications?${queryString}`);
    console.log(inbox);

    return inbox;
  }
}
