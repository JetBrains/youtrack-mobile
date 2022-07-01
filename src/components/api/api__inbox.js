/* @flow */

import ApiBase from './api__base';
import {inboxThreadFields} from './api__inbox-fields';

import {InboxFolders} from 'flow/Inbox';
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

  async getThreads(folder?: string, end?: ?number): Promise<InboxThread[]> {
    return this.makeAuthorizedRequest(
      [
        `${this.youTrackApiUrl}/inbox/threads?$top=${threadsPageSize}`,
        'customFields=assignee',
        `customFieldsTypes=user`,
        `reverse=true`,
        `fields=${inboxThreadFields.toString()}`,
        typeof end === 'number' ? `end=${end}` : undefined,
        folder && `folder=${folder}`,
      ].filter(Boolean).join('&')
    );
  }

  async muteToggle(id: string, muted: boolean): Promise<InboxThread> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/threads/${id}?fields=muted`,
      'POST',
      {muted}
    );
  }

  async inboxFolders(start: number): Promise<InboxFolders> {
    return this.makeAuthorizedRequest(`${this.youTrackApiUrl}/inbox/folders?fields=id,lastNotified,lastSeen&${start}`);
  }

  async saveAllAsSeen(lastSeen: number): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/lastSeen`,
      'POST',
      {lastSeen}
    );
  }
}
