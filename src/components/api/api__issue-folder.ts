import ApiBase from './api__base';
import issueFields from './api__issue-fields';
import UserAPI from './api__user';
import type Auth from '../auth/oauth2';
import type {Folder} from 'types/User';
import type {Tag} from 'types/CustomFields';
export default class IssueFolderAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getIssueFolders(top: number = 50, skip: number = 0): Promise<Tag> {
    const queryString = UserAPI.createFieldsQuery(
      issueFields.ISSUE_TAGS_FIELDS,
    );
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issueFolders?$top=${top}&$skip=${skip}&${queryString}`,
    );
  }

  async getPinnedIssueFolder(
    top: number = 100,
    skip: number = 0,
  ): Promise<Folder> {
    const queryString = UserAPI.createFieldsQuery([
      'id',
      'name',
      'ringId',
      'pinned',
      'template',
    ]);
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issueFolders?pinned=true&$top=${top}&$skip=${skip}&${queryString}`,
    );
  }

  async getProjectRelevantTags(
    projectId: string,
    top: number = 100,
    skip: number = 0,
  ): Promise<Tag> {
    const queryString = UserAPI.createFieldsQuery(
      issueFields.ISSUE_TAGS_FIELDS,
    );
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/admin/projects/${projectId}/relevantTags?$top=${top}&$skip=${skip}&${queryString}`,
    );
  }
}
