/* @flow */

import ApiBase from './api__base';
import {inboxThreadFields} from './api__inbox-fields';

import type Auth from '../auth/oauth2';
import type {InboxThread} from 'flow/Inbox';


export const threadsPageSize: number = 16;

export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getInbox(skip: number = 0, top: number = 5): Promise<Object[]> {
    const since = +new Date() - 60 * 60 * 24 * 1000 * 7;

    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/notifications?fields=id,sender(login,fullName,email,avatarUrl),recipient(login),metadata&reverse=true&since=${since}&$top=${top}&$skip=${skip}&uncompressed=true`
    );
  }

  async getThreads(end?: number): Promise<InboxThread[]> {
    return this.makeAuthorizedRequest(
      [
        `${this.youTrackApiUrl}/inbox/threads?$top=${threadsPageSize}`,
        'customFields=assignee',
        `customFieldsTypes=user`,
        `reverse=true`,
        `fields=${inboxThreadFields.toString()}`,
        typeof end === 'number' ? `end=${end}` : undefined,
      ].filter(Boolean).join('&')
    );
  }
}
