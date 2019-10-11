/* @flow */
import ApiBase from './api__base';

import type Auth from '../auth/auth';

export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getInbox(skip: number = 0, top: number = 5): Promise<Array<Object>> {
    const since = +new Date() - 60*60*24*1000 * 7;

    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/notifications?fields=id,sender(login,fullName,email,avatarUrl),recipient(login),metadata&reverse=true&since=${since}&$top=${top}&$skip=${skip}&uncompressed=true`
    );
  }
}
