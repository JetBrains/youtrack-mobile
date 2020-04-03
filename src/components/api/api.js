/* @flow */
import qs from 'qs';
import issueFields from './api__issue-fields';
import BaseAPI from './api__base';
import ApiHelper from './api__helper';
import IssueAPI from './api__issue';
import AgileAPI from './api__agile';
import IssuesAPI from './api__issues';
import InboxAPI from './api__inbox';
import UserAPI from './api__user';
import urlJoin from 'url-join';

import type Auth from '../auth/auth';
import type {EndUserAgreement} from '../../flow/AppConfig';
import type {TransformedSuggestion, SavedQuery, CommandSuggestionResponse} from '../../flow/Issue';
import type {IssueProject} from '../../flow/CustomFields';
import type {User} from '../../flow/User';
import UserGroupAPI from './api__user-group';

class API extends BaseAPI {
  youTrackProjectUrl: string;
  youtTrackFieldBundleUrl: string;

  issue: IssueAPI;
  issues: IssuesAPI;
  agile: AgileAPI;
  inbox: InboxAPI;
  user: UserAPI;
  userGroup: UserGroupAPI;

  constructor(auth: Auth) {
    super(auth);

    this.issues = new IssuesAPI(auth);
    this.issue = new IssueAPI(auth);
    this.agile = new AgileAPI(auth);
    this.inbox = new InboxAPI(auth);
    this.user = new UserAPI(auth);
    this.userGroup = new UserGroupAPI(auth);

    this.youTrackProjectUrl = `${this.youTrackUrl}/api/admin/projects`;
    this.youtTrackFieldBundleUrl = `${this.youTrackUrl}/api/admin/customFieldSettings/bundles`;
  }

  async getUserAgreement(): Promise<?EndUserAgreement> {
    const queryString = qs.stringify({fields: 'endUserAgreement(enabled,text,majorVersion,minorVersion)'});
    const res = await this.makeAuthorizedRequest(
      urlJoin(this.auth.config.auth.serverUri, `/api/rest/settings/public?${queryString}`),
      'GET'
    );

    return res.endUserAgreement;
  }

  async acceptUserAgreement(): Promise<Object> {
    const body = {fields: issueFields.userConsent};
    return await this.makeAuthorizedRequest(
      urlJoin(this.auth.config.auth.serverUri, `/api/rest/users/endUserAgreementConsent`),
      'POST',
      {body}
    );
  }

  async getUserFromHub(id: string) {
    const queryString = qs.stringify({fields: 'avatar/url'});
    return await this.makeAuthorizedRequest(
      urlJoin(this.auth.config.auth.serverUri, `/api/rest/users/${id}?${queryString}`)
    );
  }

  async getProjects(query: string): Promise<Array<IssueProject>> {
    const queryString = qs.stringify({
      fields: issueFields.projectOnList.toString(),
      query: query
    });
    return await this.makeAuthorizedRequest(`${this.youTrackProjectUrl}?${queryString}`);
  }

  async getProject(projectId: string) {
    const queryString = qs.stringify({
      fields: issueFields.project.toString()
    });
    return await this.makeAuthorizedRequest(`${this.youTrackProjectUrl}/${projectId}?${queryString}`);
  }

  async getCustomFieldUserValues(bundleId: string): Promise<Array<User>> {
    const queryString = qs.stringify({
      banned: false,
      sort: true,
      fields: issueFields.user.toString()
    });

    const values = await this.makeAuthorizedRequest(
      `${this.youtTrackFieldBundleUrl}/user/${bundleId}/aggregatedUsers?${queryString}`
    );

    return ApiHelper.convertRelativeUrls(values, 'avatarUrl', this.config.backendUrl);
  }

  async getCustomFieldValues(bundleId: string, fieldValueType: string): Promise<Array<Object>> {
    if (fieldValueType === 'group') {
      return this.userGroup.getAllUserGroups();
    }

    if (fieldValueType === 'user') {
      return this.getCustomFieldUserValues(bundleId);
    }

    const queryString = API.createFieldsQuery(
      issueFields.bundleValues,
      {
        $includeArchived: false,
        sort: true
      });
    return await this.makeAuthorizedRequest(
      `${this.youtTrackFieldBundleUrl}/${fieldValueType}/${bundleId}/values?${queryString}`
    );
  }

  async getStateMachineEvents(issueId: string, fieldId: string) {
    const url = `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}/possibleEvents?fields=id,presentation`;
    return await this.makeAuthorizedRequest(url);
  }

  async getCommandSuggestions(issueIds: Array<string>, query: string, caret: number): Promise<CommandSuggestionResponse> {
    const queryString = qs.stringify({fields: issueFields.commandSuggestionFields.toString()});

    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/commands/assist?${queryString}`,
      'POST',
      {
        query,
        caret,
        issues: issueIds.map(id => ({id}))
      }
    );
  }

  async applyCommand(options: { issueIds: Array<string>, comment?: ?string, command: string }): Promise<any> {
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/commands`, 'POST', {
      query: options.command,
      comment: options.comment,
      issues: options.issueIds.map(id => ({id}))
    });
  }

  //TODO: this is old API usage, move to new one
  async getQueryAssistSuggestions(query: string, caret: number): Promise<Array<TransformedSuggestion>> {
    const queryString = qs.stringify({
      query,
      caret
    });
    const result = await this.makeAuthorizedRequest(`${this.youTrackUrl}/rest/search/underlineAndSuggest?${queryString}`);

    return ApiHelper.convertQueryAssistSuggestions(result.suggest.items);
  }

  async getSavedQueries(): Promise<Array<SavedQuery>> {
    const queryString = qs.stringify({fields: issueFields.issueFolder.toString()});
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/savedQueries?${queryString}`);
  }

  async getNotificationsToken(): Promise<string> {
    const url = `${this.youTrackUrl}/api/userNotifications/subscribe?fields=token`;
    const res = await this.makeAuthorizedRequest(url, 'POST');
    return res.token;
  }

  async subscribeToFCMNotifications(konnectorURL: string, youtrackToken: string, deviceToken: string): Promise<string> {
    const url = `${konnectorURL}/ring/fcmPushNotifications`;
    return await this.makeAuthorizedRequest(url, 'POST', {
      youtrackToken: youtrackToken,
      deviceToken: deviceToken
    });
  }

  async getWorkTimeSettings(): Promise<Object> {
    const fields = `id,daysAWeek,workDays,minutesADay`;
    const url = `${this.youTrackUrl}/api/admin/timeTrackingSettings/workTimeSettings?fields=${fields}`;
    return await this.makeAuthorizedRequest(url, 'GET');
  }

}

export default API;
