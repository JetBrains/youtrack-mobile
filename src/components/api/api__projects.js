/* @flow */

import ApiBase from './api__base';

import type Auth from '../auth/oauth2';
import type {IssueProject} from 'flow/CustomFields';

export default class ProjectsAPI extends ApiBase {
  projectsURL: string = `${this.youTrackApiUrl}/admin/projects`;
  pinProjectURL: string = `${this.youTrackApiUrl}/users/me/pinnedProjects`;

  constructor(auth: Auth) {
    super(auth);
  }

  async addFavorite(projectId: string): Promise<IssueProject> {
    return this.makeAuthorizedRequest(
      `${this.pinProjectURL}?fields=id,pinned`,
      'POST',
      {id: projectId}
    );
  }

  async removeFavorite(projectId: string): Promise<IssueProject> {
    return this.makeAuthorizedRequest(
      `${this.pinProjectURL}/${projectId}`,
      'DELETE',
      null,
      {parseJson: false}
    );
  }

  async toggleFavorite(projectId: string, pinned: boolean): Promise<IssueProject> {
    if (pinned) {
      return this.removeFavorite(projectId);
    } else {
      return this.addFavorite(projectId);
    }
  }

  async getTimeTrackingSettings(projectId: string): Promise<IssueProject> {
    const fields: string = 'enabled,workItemTypes(id,name,ordinal,url)';
    return this.makeAuthorizedRequest(
      `${this.projectsURL}/${projectId}/timeTrackingSettings/?fields=${fields}`,
      'GET'
    );
  }

}
