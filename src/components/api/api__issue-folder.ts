import ApiBase from './api__base';
import issueFields from './api__issue-fields';
import UserAPI from './api__user';

import type {Folder} from 'types/User';
import type {Tag} from 'types/CustomFields';

const queryString = UserAPI.createFieldsQuery(issueFields.issueFolder);


export default class IssueFolderAPI extends ApiBase {

  async getIssueFolders(pinned: boolean = false, skip: number = 50): Promise<Folder> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issueFolders?${queryString}&pinned=${pinned}`,
    );
  }
  async issueFolders(id: string, body: Record<string, any>): Promise<Tag> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issueFolders/${id}?${queryString}`,
      'POST',
      body
    );
  }

  async getPinnedIssueFolder(
    top: number = 100,
    skip: number = 0,
  ): Promise<Folder> {
    const q: string = UserAPI.createFieldsQuery([
      'id',
      'name',
      'ringId',
      'pinned',
      'template',
    ]);
    return this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/issueFolders?pinned=true&$top=${top}&$skip=${skip}&${q}`,
    );
  }

  async getProjectRelevantTags(
    projectId: string,
    top: number = 100,
    skip: number = 0,
  ): Promise<Tag> {
    const q: string = UserAPI.createFieldsQuery(issueFields.ISSUE_TAGS_FIELDS);
    return await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/admin/projects/${projectId}/relevantTags?$top=${top}&$skip=${skip}&${q}`,
    );
  }
}
