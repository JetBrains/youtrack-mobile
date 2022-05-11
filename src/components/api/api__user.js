/* @flow */

import ApiBase from './api__base';
import {handleRelativeUrl} from '../config/config';
import {ResourceTypes} from './api__resource-types';

import type Auth from '../auth/oauth2';
import type {IssueComment} from 'flow/CustomFields';
import type {Reaction} from 'flow/Reaction';
import type {Folder, User, UserAppearanceProfile} from 'flow/User';


export default class UserAPI extends ApiBase {

  adminApiUrl: string;
  apiUrl: string;
  SEARCH_CONTEXT_FIELDS: Array<string> = [
    'id',
    'name',
    'shortName',
    'query',
  ];
  USER_FOLDERS_FIELDS: Array<string> = [
    'id',
    '$type',
    'shortName',
    'name',
    'query',
    'pinned',
    'star(id)',
    'shortName',
  ];

  constructor(auth: Auth) {
    super(auth);
    this.apiUrl = `${this.youTrackApiUrl}/users`;
    this.adminApiUrl = `${this.youTrackApiUrl}/admin/users`;
  }

  async getUser(userId: string = 'me'): Promise<User> {
    const queryString = ApiBase.createFieldsQuery([
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
            dateFieldFormat: [
              'dateNoYearPattern',
              'datePattern',
              'pattern',
            ],
          },
          appearance: ['naturalCommentsOrder', 'useAbsoluteDates'],
          articles: {
            lastVisitedArticle: ['id,idReadable,summary,project(id,ringId)'],
          },
        },
      },
    ]);

    const user: User = await this.makeAuthorizedRequest(`${this.adminApiUrl}/${userId}?${queryString}`);
    user.avatarUrl = handleRelativeUrl(user.avatarUrl, this.config.backendUrl);
    return user;
  }

  async getUserFolders(folderId: string = '', fields?: Array<string>): Promise<Array<Folder>> {
    const queryString = ApiBase.createFieldsQuery(fields || this.USER_FOLDERS_FIELDS);

    return await this.makeAuthorizedRequest(`${this.youTrackApiUrl}/userIssueFolders/${folderId}?${queryString}`);
  }

  async updateUserAppearanceProfile(userId: string = 'me', appearanceProfile: UserAppearanceProfile): Promise<UserAppearanceProfile> {
    const queryString = ApiBase.createFieldsQuery(['naturalCommentsOrder']);

    return await this.makeAuthorizedRequest(
      `${this.adminApiUrl}/${userId}/profiles/appearance?${queryString}`,
      'POST',
      appearanceProfile.$type
        ? appearanceProfile
        : Object.assign({}, appearanceProfile, {$type: ResourceTypes.USER_APPEARANCE_PROFILE})
    );
  }

  async reactionsFeed(skip: number = 0, top: number = 10): Promise<{ $type: string, added: boolean, comment: IssueComment, id: string, reaction: Reaction, timestamp: number }> {
    const queryString = `$skip=${skip}&$top=${top}&ignoreLicenseErrors=true&fields=added,comment(created,deleted,id,issue(id,idReadable,resolved,summary),reactionOrder,reactions(author(fullName,id,isLocked),id,reaction),text),id,reaction(author(fullName,id,isLocked),reaction),timestamp`;

    return await this.makeAuthorizedRequest(
      `${this.apiUrl}/me/reactionsFeed?${queryString}`,
      'GET',
    );
  }

  async getHubProjectUsers(query?: string): Promise<Array<$Shape<User>>> {
    const searchQuery: string = query ? `query=${query}` : '';
    const response: { skip: number, total: number, users: Array<User> } = await this.makeAuthorizedRequest(
      `${this.config.auth.serverUri}/api/rest/users?${searchQuery}&${ApiBase.createFieldsQuery([
        'id',
        'name',
      ])}`,
      'GET'
    );
    return response.users.map((hubUser: User) => ({
      ringId: hubUser.id,
      name: hubUser.name,
    }));
  }

}
