import ApiBase from './api__base';
import ApiHelper from './api__helper';
export default class MentionsAPI extends ApiBase {
  async getMentions(
    query: string,
    requestBody: Record<string, any>,
    $top: number = 15,
  ): Promise<any> {
    const queryString = ApiBase.createFieldsQuery(
      'users(id,login,fullName,avatarUrl)',
      {
        ...{
          $top,
        },
        ...{
          query,
        },
      },
    );
    const suggestions = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/mention?${queryString}`,
      'POST',
      requestBody,
    );
    return ApiHelper.patchAllRelativeAvatarUrls(
      suggestions,
      this.config.backendUrl,
    );
  }
}