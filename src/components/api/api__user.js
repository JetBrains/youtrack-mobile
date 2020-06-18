/* @flow */

import qs from 'qs';

import type {User, UserAppearanceProfile, UserGeneralProfile} from '../../flow/User';
import type Auth from '../auth/auth';

import ApiBase from './api__base';
import ApiHelper from './api__helper';

import {ResourceTypes} from './api__resource-types';


export default class UserAPI extends ApiBase {

  adminApiUrl: string;
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
    this.adminApiUrl = `${this.youTrackApiUrl}/admin/users`;
  }

  async getUser(userId: string = 'me'): Promise<User> {
    const queryString = UserAPI.createFieldsQuery([
      'id',
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

    return await this.makeAuthorizedRequest(`${this.adminApiUrl}/${userId}?${queryString}`);
  }

  async getUserFolders(folderId: string = ''): Promise<User> {
    const queryString = UserAPI.createFieldsQuery(this.USER_FOLDERS_FIELDS);

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

}
