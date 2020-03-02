/* @flow */
import qs from 'qs';
import ApiBase from './api__base';
import agileFields from './api__agile-fields';
import ApiHelper from './api__helper';

import type Auth from '../auth/auth';
import type {AgileUserProfile, SprintFull, AgileBoardRow, BoardOnList, Board} from '../../flow/Agile';

export default class AgileAPI extends ApiBase {
  constructor(auth: Auth) {
    super(auth);
  }

  async getAgile(agileId: string): Promise<Board> {
    const queryString = qs.stringify({
      fields: 'id,name,status(errors,valid)',
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${agileId}?${queryString}`);
  }

  async getSprint(boardId: string, sprintId: string, top: number = 100, skip: number = 0): Promise<SprintFull> {
    const queryString = qs.stringify({
      fields: agileFields.sprint.toString(),
      $topSwimlanes: top,
      $skipSwimlanes: skip
    }, {encode: false});
    const sprint = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}?${queryString}`);
    return ApiHelper.patchAllRelativeAvatarUrls(sprint, this.config.backendUrl);
  }

  async getSwimlanes(boardId: string, sprintId: string, top: number, skip: number = 0): Promise<Array<AgileBoardRow>> {
    const queryString = qs.stringify({
      fields: `trimmedSwimlanes(${agileFields.row.toString()})`,
      $topSwimlanes: top,
      $skipSwimlanes: skip
    });

    const board = await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board?${queryString}`);
    const swimlanes = board.trimmedSwimlanes;
    return ApiHelper.patchAllRelativeAvatarUrls(swimlanes, this.config.backendUrl);
  }

  async updateRowCollapsedState(boardId: string, sprintId: string, row: Object): Promise<Object> {
    const isOrphan = row.id === 'orphans';
    const url = isOrphan ?
      `${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/orphanRow` :
      `${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/swimlanes/${row.id}`;

    return await this.makeAuthorizedRequest(`${url}`, 'POST', {
      $type: row.$type,
      id: isOrphan ? null : row.id,
      collapsed: row.collapsed
    });
  }

  async updateColumnCollapsedState(boardId: string, sprintId: string, column: Object): Promise<Object> {
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/columns/${column.id}`,
      'POST',
      {
        collapsed: column.collapsed
      });
  }

  async getSprintList(boardId: string): Promise<Object> {
    const queryString = qs.stringify({
      fields: agileFields.sprintShort.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles/${boardId}/sprints?${queryString}`);
  }

  async getAgileBoardsList(): Promise<Array<BoardOnList>> {
    const queryString = qs.stringify({
      fields: agileFields.boardOnList.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agiles?${queryString}`);
  }

  async getAgileUserProfile(): Promise<AgileUserProfile> {
    const queryString = qs.stringify({
      fields: agileFields.agileUserProfile.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agileUserProfile?${queryString}`);
  }

  async updateAgileUserProfile(sprintId: string): Promise<AgileUserProfile> {
    const queryString = qs.stringify({
      fields: agileFields.agileUserProfile.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/agileUserProfile?${queryString}`, 'POST', {
      visitedSprints: [{id: sprintId}]
    });
  }

  async getIssueDraftForAgileCell(boardId: string, sprintId: string, columnId: string, cellId: string): Promise<{id: string}> {
    const queryString = qs.stringify({fields: 'id'});
    const url =`${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/columns/${columnId}/cells/${cellId}/draftIssue?${queryString}`;
    return await this.makeAuthorizedRequest(url, 'POST', {});
  }

  async updateCardPosition(
    boardId: string,
    sprintId: string,
    columnId: string,
    cellId: string,
    leadingId?: ?string,
    movedId: string
  ) {
    const queryString = qs.stringify({fields: 'leading(id),moved(id)'});
    const url = `${this.youTrackUrl}/api/agiles/${boardId}/sprints/${sprintId}/board/columns/${columnId}/cells/${cellId}/issueOrder?${queryString}`;

    return await this.makeAuthorizedRequest(url, 'POST', {
      leading: leadingId ? {id: leadingId} : null,
      moved: {id: movedId}
    });
  }
}
