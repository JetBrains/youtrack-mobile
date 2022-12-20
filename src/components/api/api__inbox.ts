import ApiBase from './api__base';
import {inboxThreadFields} from './api__inbox-fields';
import {InboxFolder} from 'flow/Inbox';
import type Auth from '../auth/oauth2';
import type {InboxThread} from 'flow/Inbox';
export const threadsPageSize: number = 16;
export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getInbox(
    skip: number = 0,
    top: number = 5,
  ): Promise<Record<string, any>[]> {
    const since = +new Date() - 60 * 60 * 24 * 1000 * 7;
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/notifications?fields=id,sender(login,fullName,email,avatarUrl),recipient(login),metadata&reverse=true&since=${since}&$top=${top}&$skip=${skip}&uncompressed=true`,
    );
  }

  async getThreads(
    folder?: string | null | undefined,
    end?: number | null | undefined,
    unreadOnly: boolean | null | undefined,
  ): Promise<InboxThread[]> {
    return this.makeAuthorizedRequest(
      [
        `${this.youTrackApiUrl}/inbox/threads?$top=${threadsPageSize}`,
        'customFields=assignee',
        `customFieldsTypes=user`,
        `reverse=true`,
        `fields=${inboxThreadFields.toString()}`,
        typeof end === 'number' ? `end=${end}` : undefined,
        unreadOnly === true ? 'unreadOnly=true' : undefined,
        folder && `folder=${folder}`,
      ]
        .filter(Boolean)
        .join('&'),
    );
  }

  async muteToggle(id: string, muted: boolean): Promise<InboxThread> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/threads/${id}?fields=muted`,
      'POST',
      {
        muted,
      },
    );
  }

  async getFolders(start: number | string = ''): Promise<InboxFolder> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/folders?fields=id,lastNotified,lastSeen&${start}`,
    );
  }

  async updateFolders(folderId: string = '', body: any): Promise<InboxFolder> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/folders/${folderId}?fields=id,lastNotified,lastSeen`,
      'POST',
      body,
    );
  }

  async saveAllAsSeen(lastSeen: number): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/lastSeen?fields=id,lastNotified,lastSeen`,
      'POST',
      {
        lastSeen,
      },
    );
  }

  async markMessages(
    ids: {
      id: string;
    }[],
    read: boolean,
  ): Promise<{
    read: boolean;
  }> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/markMessages?fields=read`,
      'POST',
      {
        messages: ids,
        read,
      },
    );
  }

  async markAllAsRead(): Promise<void> {
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/inbox/markAll`,
      'POST',
      {
        read: true,
      },
    );
  }
}