/* @flow */

import qs from 'qs';

import ApiBase from './api__base';

import ApiHelper from './api__helper';

export default class MentionsAPI extends ApiBase {

  async getMentions(query: string, issueIds?: Array<string>, $top: number = 10) {
    const fields = 'issues(id),users(id,login,fullName,avatarUrl)';
    const queryString = qs.stringify({$top, fields, query});
    const suggestions = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/mention?${queryString}`,
      'POST',
      issueIds ? {issues: issueIds.map(id => ({id}))} : null
    );
    return ApiHelper.patchAllRelativeAvatarUrls(suggestions, this.config.backendUrl);
  }


}
