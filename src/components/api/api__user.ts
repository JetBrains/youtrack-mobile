import ApiBase from './api__base';
import issueFields from './api__issue-fields';
import {ResourceTypes} from './api__resource-types';

import type Auth from '../auth/oauth2';
import type {Folder, User, UserAppearanceProfile, UserHelpdeskProfile} from 'types/User';
import type {IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';

const appearanceProfileFields = [
  'naturalCommentsOrder',
  'useAbsoluteDates',
  'firstDayOfWeek',
  'liteUiFilters',
];
const SEARCH_CONTEXT_FIELDS: string[] = ['id', 'name', 'shortName', 'query'];
const userProfiles = {
  general: {
    star: ['id'],
    searchContext: SEARCH_CONTEXT_FIELDS,
    timezone: ['id'],
    dateFieldFormat: ['dateNoYearPattern', 'datePattern', 'pattern'],
    locale: ['language', 'locale'],
  },
  appearance: appearanceProfileFields,
  articles: {
    lastVisitedArticle: ['id,idReadable,summary,project(id,ringId)'],
  },
  helpdesk: [
    {
      helpdeskFolder: SEARCH_CONTEXT_FIELDS,
    },
    'isAgent',
    'isReporter',
    {
      agentInProjects: ['id'],
    },
    {
      reporterInProjects: ['id'],
    },
    'ticketFilters',
  ],
};


export default class UserAPI extends ApiBase {
  apiUrl: string;

  constructor(auth: Auth) {
    super(auth);
    this.apiUrl = `${this.youTrackApiUrl}${
      this.isActualAPI ? '' : '/admin'
    }/users`;
  }

  async getUserCard(userId: string): Promise<User> {
    return this.getUser(userId, 'avatarUrl,email,fullName,login,issueRelatedGroup(icon)');
  }
  async getUser(userId: string = 'me', fields?: string): Promise<User> {
    const queryString = ApiBase.createFieldsQuery(fields ? [fields] : [
      'id',
      'ringId',
      'avatarUrl',
      'login',
      'guest',
      'fullName',
      'userType(id)',
      {
        profiles: userProfiles,
      },
    ]);
    const user: User = await this.makeAuthorizedRequest(`${this.apiUrl}/${userId}?${queryString}`);
    if (user?.issueRelatedGroup?.icon) {
      user.issueRelatedGroup.icon = this.convertToAbsURL(user.issueRelatedGroup.icon);
    }
    return {
      ...user,
      avatarUrl: this.convertToAbsURL(user.avatarUrl),
    };
  }

  async getUserFolders(folderId: string = '', fields?: string[]): Promise<Folder[]> {
    const queryString = ApiBase.createFieldsQuery(fields || issueFields.issueFolder);
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/userIssueFolders/${folderId}?${queryString}`,
    );
  }

  async updateUserAppearanceProfile(
    userId: string = 'me',
    appearanceProfile: UserAppearanceProfile,
  ): Promise<UserAppearanceProfile> {
    const queryString = ApiBase.createFieldsQuery(appearanceProfileFields);
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/${userId}/profiles/appearance?${queryString}`,
      'POST',
      appearanceProfile.$type
        ? appearanceProfile
        : Object.assign({}, appearanceProfile, {
            $type: ResourceTypes.USER_APPEARANCE_PROFILE,
          }),
    );
  }

  async updateUserHelpdeskProfiles(
    userId: string = 'me',
    helpdeskProfiles: UserHelpdeskProfile,
  ): Promise<UserHelpdeskProfile> {
    const queryString = ApiBase.createFieldsQuery(userProfiles.helpdesk);
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/${userId}/profiles/helpdesk?${queryString}`,
      'POST',
      {...helpdeskProfiles, $type: ResourceTypes.USER_HELPDESK_PROFILE}
    );
  }

  async reactionsFeed(
    skip: number = 0,
    top: number = 10,
  ): Promise<{
    $type: string;
    added: boolean;
    comment: IssueComment;
    id: string;
    reaction: Reaction;
    timestamp: number;
  }> {
    const queryString = `$skip=${skip}&$top=${top}&ignoreLicenseErrors=true&fields=added,comment(created,deleted,id,issue(id,idReadable,resolved,summary),reactionOrder,reactions(author(fullName,id,isLocked),id,reaction),text),id,reaction(author(fullName,id,isLocked),reaction),timestamp`;
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/users/me/reactionsFeed?${queryString}`,
      'GET',
    );
  }

  async getHubUsers(
    query: string,
    fields: string | string[],
    restParams?: Record<string, any> | null
  ): Promise<Array<Record<string, any>>> {
    const searchQuery: string = query ? `query=${query}` : '';
    const response: {
      skip: number;
      total: number;
      users: Array<Record<string, any>>;
    } = await this.makeAuthorizedRequest(
      `${this.config.auth.serverUri}/api/rest/users?${searchQuery}&${ApiBase.createFieldsQuery(fields, restParams)}`,
      'GET'
    );
    return response.users;
  }

  async getHubProjectUsers(
    query: string = '',
    fields: string | string[] = 'id,name'
  ): Promise<Array<{ringId: string; name: string}>> {
    const users = await this.getHubUsers(query, fields);
    return users.map(hubUser => ({
      ringId: hubUser.id,
      name: hubUser.name,
    }));
  }

  async logout(): Promise<User> {
    return await this.makeAuthorizedRequest(`${this.apiUrl}/me/logout`, 'POST', null, {parseJson: false});
  }
}
