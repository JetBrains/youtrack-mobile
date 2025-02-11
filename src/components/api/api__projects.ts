import ApiBase from './api__base';
import {USER_GROUP_FIELDS} from 'components/api/api__issue-fields';

import type Auth from '../auth/oauth2';
import type {Project, ProjectTeam, ProjectWithTeam} from 'types/Project';
import type {ProjectTimeTrackingSettings} from 'types/Work';

export default class ProjectsAPI extends ApiBase {
  projectsURL: string = `${this.youTrackApiUrl}/admin/projects`;
  pinProjectURL: string = `${this.youTrackApiUrl}/users/me/pinnedProjects`;

  constructor(auth: Auth) {
    super(auth);
  }

  async addFavorite(projectId: string): Promise<Project> {
    return this.makeAuthorizedRequest(
      `${this.pinProjectURL}?fields=id,pinned`,
      'POST',
      {
        id: projectId,
      },
    );
  }

  async removeFavorite(projectId: string): Promise<Project> {
    return this.makeAuthorizedRequest(
      `${this.pinProjectURL}/${projectId}`,
      'DELETE',
      null,
      {
        parseJson: false,
      },
    );
  }

  async toggleFavorite(
    projectId: string,
    pinned: boolean,
  ): Promise<Project> {
    if (pinned) {
      return this.removeFavorite(projectId);
    } else {
      return this.addFavorite(projectId);
    }
  }

  async getTimeTrackingSettings(projectId: string): Promise<ProjectTimeTrackingSettings> {
    const fields: string = 'enabled,workItemTypes(id,name,ordinal,url,color(id,background,foreground)),attributes(id,name,values(id,name,color(id,background,foreground),hasRunningJobs))';
    return this.makeAuthorizedRequest(
      `${this.projectsURL}/${projectId}/timeTrackingSettings/?fields=${fields}`,
      'GET',
    );
  }

  async getTeam(projectId: string): Promise<ProjectTeam> {
    const project: ProjectWithTeam = await this.makeAuthorizedRequest(
      `${this.projectsURL}/${projectId}/?fields=${USER_GROUP_FIELDS.toString()}`,
      'GET',
    );
    return project.team;
  }
}
