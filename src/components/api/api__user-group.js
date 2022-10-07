/* @flow */

import ApiBase from './api__base';

import type {UserGroup} from 'flow/UserGroup';
import type Auth from '../auth/oauth2';


export default class UserGroupAPI extends ApiBase {

  url: string;

  constructor(auth: Auth) {
    super(auth);
    this.url = `${this.youTrackApiUrl}${this.isActualAPI ? '' : '/admin'}/groups`;
  }


  async getAllUserGroups(): Promise<Array<UserGroup>> {
    const queryString = UserGroupAPI.createFieldsQuery([
      'id',
      'ringId',
      'name',
      'icon',
      'usersCount',
    ]);

    return await this.makeAuthorizedRequest(`${this.url}?${queryString}`);
  }
}
