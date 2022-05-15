/* @flow */

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import {ISSUE_ACTIVITIES_FIELDS} from './api__activities-issue-fields';

import type Auth from '../auth/oauth2';
import type {InboxThread} from '../../flow/Inbox';

const toField = ApiHelper.toField;


export default class IssueAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getInbox(skip: number = 0, top: number = 5): Promise<Array<Object>> {
    const since = +new Date() - 60 * 60 * 24 * 1000 * 7;

    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/notifications?fields=id,sender(login,fullName,email,avatarUrl),recipient(login),metadata&reverse=true&since=${since}&$top=${top}&$skip=${skip}&uncompressed=true`
    );
  }

  async getThreads(top: number = 16, end?: number): Promise<Array<InboxThread>> {
    const fields: string = toField([
      'id',
      {
        subject: [
          'id',
          {
            target: [
              'id',
              'idReadable',
              'resolved',
              'summary',
            ],
          },
        ],
      },
      {
        messages: [
          'id',
          'threadId',
          'timestamp',
          {
            activities: ISSUE_ACTIVITIES_FIELDS,
          },
          {
            reasons: [
              'id',
              'name',
              'type',
            ],
          },
        ],
      },
      'muted',
      'notified',
    ]).toString();

    return this.makeAuthorizedRequest(
      [
        `${this.youTrackApiUrl}/inbox/threads?$top=${top}`,
        'customFields=assignee',
        `customFieldsTypes=user`,
        `reverse=true`,
        `fields=${fields}`,
        typeof end === 'number' ? `$end=${end}` : undefined,
      ].filter(Boolean).join('&')
    );
  }
}
