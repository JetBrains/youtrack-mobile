/* @flow */
import qs from 'qs';

import type {User, UserAppearanceProfile} from '../../flow/User';
import type Auth from '../auth/auth';

import ApiBase from './api__base';
import ApiHelper from './api__helper';

import {ResourceTypes} from './api__resource-types';


export default class UserAPI extends ApiBase {

  apiUrl: string;

  static createFieldsQuery(fields: Object|Array<Object|string>): string {
    return qs.stringify({
      fields: ApiHelper.toField(fields).toString()
    });
  }


  constructor(auth: Auth) {
    super(auth);
    this.apiUrl = `${this.youTrackApiUrl}/admin/users`;
  }


  async getUser(userId?: string = 'me'): Promise<User> {
    const queryString = UserAPI.createFieldsQuery([
      'id',
      {
        profiles: {
          appearance: ['naturalCommentsOrder']
        }
      }
    ]);

    return await this.makeAuthorizedRequest(`${this.apiUrl}/${userId}?${queryString}`);
  }

  async updateUserAppearanceProfile(userId?: string = 'me', appearanceProfile: UserAppearanceProfile): Promise<User> {
    const queryString = UserAPI.createFieldsQuery(['naturalCommentsOrder']);

    return await this.makeAuthorizedRequest(
      `${this.apiUrl}/${userId}/profiles/appearance?${queryString}`,
      'POST',
      appearanceProfile.$type
        ? appearanceProfile
        : Object.assign({}, appearanceProfile, {$type: ResourceTypes.USER_APPEARANCE_PROFILE})
    );
  }

}
