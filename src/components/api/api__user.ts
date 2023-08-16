import ApiBase from './api__base';
import issueFields from './api__issue-fields';
import {ResourceTypes} from './api__resource-types';

import type Auth from '../auth/oauth2';
import type {Folder, User, UserAppearanceProfile} from 'types/User';
import type {IssueComment} from 'types/CustomFields';
import type {Reaction} from 'types/Reaction';

const appearanceProfileFields = [
  'naturalCommentsOrder',
  'useAbsoluteDates',
  'firstDayOfWeek',
  'liteUiFilters',
];


export default class UserAPI extends ApiBase {
  apiUrl: string;
  SEARCH_CONTEXT_FIELDS: string[] = ['id', 'name', 'shortName', 'query'];

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
      {
        profiles: {
          general: {
            star: ['id'],
            searchContext: this.SEARCH_CONTEXT_FIELDS,
            timezone: ['id'],
            dateFieldFormat: ['dateNoYearPattern', 'datePattern', 'pattern'],
            locale: ['language', 'locale'],
          },
          appearance: appearanceProfileFields,
          articles: {
            lastVisitedArticle: ['id,idReadable,summary,project(id,ringId)'],
          },
          helpdesk: [
            'isAgent',
            'isReporter',
          ],
        },
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

  async getHubProjectUsers(query?: string): Promise<Array<Partial<User>>> {
    const searchQuery: string = query ? `query=${query}` : '';
    const response: {
      skip: number;
      total: number;
      users: User[];
    } = await this.makeAuthorizedRequest(
      `${
        this.config.auth.serverUri
      }/api/rest/users?${searchQuery}&${ApiBase.createFieldsQuery([
        'id',
        'name',
      ])}`,
      'GET',
    );
    return response.users.map((hubUser: User) => ({
      ringId: hubUser.id,
      name: hubUser.name,
    }));
  }

  async logout(): Promise<User> {
    return await this.makeAuthorizedRequest(`${this.apiUrl}/me/logout`, 'POST', null, {parseJson: false});
  }
}
