/* @flow */

import qs from 'qs';

import ApiBase from './api__base';
import ApiHelper from './api__helper';
import {handleRelativeUrl} from '../config/config';
import {ResourceTypes} from './api__resource-types';

import type Auth from '../auth/auth';
import type {IssueComment, Tag} from '../../flow/CustomFields';
import type {Reaction} from '../../flow/Reaction';
import type {SavedQuery} from '../../flow/Issue';
import type {User, UserAppearanceProfile, UserGeneralProfile} from '../../flow/User';


export default class UserAPI extends ApiBase {

  adminApiUrl: string;
  apiUrl: string;
  SEARCH_CONTEXT_FIELDS: Array<string> = [
    'id',
    'name',
    'shortName',
    'query'
  ];
  USER_FOLDERS_FIELDS = [
    'id',
    '$type',
    'shortName',
    'name',
    'query',
    'pinned',
    'star(id)',
    'shortName'
  ];


  static createFieldsQuery(fields: Object|Array<Object|string>): string {
    return qs.stringify({
      fields: ApiHelper.toField(fields).toString()
    });
  }

  constructor(auth: Auth) {
    super(auth);
    this.apiUrl = `${this.youTrackApiUrl}/users`;
    this.adminApiUrl = `${this.youTrackApiUrl}/admin/users`;
  }

  async getUser(userId: string = 'me'): Promise<User> {
    const queryString = UserAPI.createFieldsQuery([
      'id',
      'avatarUrl',
      'login',
      'fullName',
      {
        profiles: {
          general: {
            star: ['id'],
            searchContext: this.SEARCH_CONTEXT_FIELDS,
          },
          appearance: ['naturalCommentsOrder']
        }
      }
    ]);

    const user: User = await this.makeAuthorizedRequest(`${this.adminApiUrl}/${userId}?${queryString}`);
    user.avatarUrl = handleRelativeUrl(user.avatarUrl, this.config.backendUrl);
    return user;
  }

  async getUserFolders(folderId: string = '', fields?: Array<string>): Promise<User | Tag | SavedQuery> {
    const queryString = UserAPI.createFieldsQuery(fields || this.USER_FOLDERS_FIELDS);

    return await this.makeAuthorizedRequest(`${this.youTrackApiUrl}/userIssueFolders/${folderId}?${queryString}`);
  }

  async updateUserAppearanceProfile(userId: string = 'me', appearanceProfile: UserAppearanceProfile): Promise<User> {
    const queryString = UserAPI.createFieldsQuery(['naturalCommentsOrder']);

    return await this.makeAuthorizedRequest(
      `${this.adminApiUrl}/${userId}/profiles/appearance?${queryString}`,
      'POST',
      appearanceProfile.$type
        ? appearanceProfile
        : Object.assign({}, appearanceProfile, {$type: ResourceTypes.USER_APPEARANCE_PROFILE})
    );
  }

  async updateUserGeneralProfile(generalProfile: UserGeneralProfile, userId: string = 'me'): Promise<User> {
    const queryString = UserAPI.createFieldsQuery({searchContext: this.SEARCH_CONTEXT_FIELDS});

    return await this.makeAuthorizedRequest(
      `${this.adminApiUrl}/${userId}/profiles/general?${queryString}`,
      'POST',
      Object.assign({$type: ResourceTypes.USER_GENERAL_PROFILE}, generalProfile)
    );
  }

  async reactionsFeed(skip: number = 0, top: number = 10): Promise<{ $type: string, added: boolean, comment: IssueComment, id: string, reaction: Reaction, timestamp: number }> {
    const queryString = `$skip=${skip}&$top=${top}&ignoreLicenseErrors=true&fields=added,comment(created,deleted,id,issue(id,idReadable,resolved,summary),reactionOrder,reactions(author(fullName,id,isLocked),id,reaction),text),id,reaction(author(fullName,id,isLocked),reaction),timestamp`;

    return await this.makeAuthorizedRequest(
      `${this.apiUrl}/me/reactionsFeed?${queryString}`,
      'GET',
    );
  }

}
