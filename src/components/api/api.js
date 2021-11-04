/* @flow */

import qs from 'qs';
import urlJoin from 'url-join';

import AgileAPI from './api__agile';
import ApiHelper from './api__helper';
import ArticlesAPI from './api__articles';
import BaseAPI from './api__base';
import InboxAPI from './api__inbox';
import IssueAPI from './api__issue';
import issueFields from './api__issue-fields';
import IssueFolderAPI from './api__issue-folder';
import IssuesAPI from './api__issues';
import MentionsAPI from './api__mention';
import ProjectsAPI from './api__projects';
import CustomFieldsAPI from './api__custom-fields';
import SearchAPI from './api__search';
import UserAPI from './api__user';
import UserGroupAPI from './api__user-group';

import type Auth from '../auth/auth';
import type {EndUserAgreement} from '../../flow/AppConfig';
import type {IssueProject, Tag} from '../../flow/CustomFields';
import type {
  TransformedSuggestion,
  SavedQuery,
  CommandSuggestionResponse,
  ServersideSuggestionLegacy,
} from '../../flow/Issue';
import type {Folder, User} from '../../flow/User';
import type {ServersideSuggestion} from '../../flow/Issue';

class API extends BaseAPI {
  youTrackProjectUrl: string;
  youtTrackFieldBundleUrl: string;

  agile: AgileAPI;
  articles: ArticlesAPI;
  customFields: CustomFieldsAPI;
  inbox: InboxAPI;
  issue: IssueAPI;
  issueFolder: IssueFolderAPI
  issues: IssuesAPI;
  mentions: MentionsAPI;
  projects: ProjectsAPI;
  search: SearchAPI;
  user: UserAPI;
  userGroup: UserGroupAPI;

  constructor(auth: Auth) {
    super(auth);

    this.agile = new AgileAPI(auth);
    this.articles = new ArticlesAPI(auth);
    this.customFields = new CustomFieldsAPI(auth);
    this.inbox = new InboxAPI(auth);
    this.issue = new IssueAPI(auth);
    this.issueFolder = new IssueFolderAPI(auth);
    this.issues = new IssuesAPI(auth);
    this.mentions = new MentionsAPI(auth);
    this.projects = new ProjectsAPI(auth);
    this.search = new SearchAPI(auth);
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
      urlJoin(this.auth.config.auth.serverUri, '/api/rest/users/endUserAgreementConsent'),
      'POST',
      {body}
    );
  }
  async getProjects(query: string): Promise<Array<IssueProject>> {
    const queryString = qs.stringify({
      fields: issueFields.projectOnList.toString(),
      query: query,
    });
    return await this.makeAuthorizedRequest(`${this.youTrackProjectUrl}?${queryString}`);
  }
  async getCustomFieldUserValues(bundleId: string): Promise<Array<User>> {
    const queryString = qs.stringify({
      banned: false,
      sort: true,
      fields: issueFields.user.toString(),
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
        sort: true,
      });
    return await this.makeAuthorizedRequest(
      `${this.youtTrackFieldBundleUrl}/${fieldValueType}/${bundleId}/values?${queryString}`
    );
  }

  async getStateMachineEvents(issueId: string, fieldId: string): Promise<any> {
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
        issues: issueIds.map(id => ({id})),
      }
    );
  }

  async applyCommand(options: { issueIds: Array<string>, comment?: ?string, command: string }): Promise<any> {
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/commands`, 'POST', {
      query: options.command,
      comment: options.comment,
      issues: options.issueIds.map(id => ({id})),
    });
  }

  async getQueryAssistSuggestions(query: string, caret: number, folders: Array<Folder> | null = null): Promise<Array<TransformedSuggestion>> {
    const response: { suggestions: Array<ServersideSuggestion> } = await this.makeAuthorizedRequest(
      `${this.youTrackApiUrl}/search/assist?fields=caret,query,suggestions(auxiliaryIcon,caret,className,completionEnd,completionStart,description,group,icon,matchingEnd,matchingStart,option,prefix,suffix)`,
      'POST',
      {
        caret,
        folders,
        query,
      }
    );
    return ApiHelper.convertQueryAssistSuggestions(response.suggestions);
  }

  async getQueryAssistSuggestionsLegacy(query: string, caret: number): Promise<Array<TransformedSuggestion>> {
    const queryString = qs.stringify({
      query,
      caret,
    });
    const response: { suggest: { items: Array<ServersideSuggestionLegacy> } } = await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/rest/search/underlineAndSuggest?${queryString}`
    );
    return ApiHelper.convertQueryAssistSuggestionsLegacy(response.suggest.items);
  }

  async getSavedQueries(): Promise<Array<SavedQuery>> {
    const queryString = qs.stringify({fields: issueFields.issueFolder.toString()});
    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/savedQueries?${queryString}`);
  }

  async getIssueFolders(pinnedOnly: ?boolean = null): Promise<Array<IssueProject | SavedQuery | Tag>> {
    const fields = ApiHelper.toField([
      'id',
      '$type',
      'name',
      'query',
      'pinned',
      {
        owner: [
          'id',
          'ringId',
        ],
      },
      {
        color: ['id'],
      },
    ]);
    const queryString = qs.stringify({
      fields: fields.toString(),
      pinned: pinnedOnly,
    });

    return await this.makeAuthorizedRequest(`${this.youTrackUrl}/api/issueFolders?${queryString}`);
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
      deviceToken: deviceToken,
    });
  }
  async unsubscribeFromFCMNotifications(konnectorURL: string, deviceToken: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${konnectorURL}/ring/fcmPushNotifications/unsubscribe`,
      'POST',
      {deviceToken: deviceToken}
    );
  }

  async subscribeToIOSNotifications(konnectorURL: string, youtrackToken: string, deviceToken: string): Promise<string> {
    const url = `${konnectorURL}/ring/pushNotifications`;
    return await this.makeAuthorizedRequest(
      url,
      'POST',
      {
        token: youtrackToken,
        appleDeviceId: deviceToken,
      }
      );
  }

  async unsubscribeFromIOSNotifications(konnectorURL: string, deviceToken: string): Promise<any> {
    return this.makeAuthorizedRequest(
      `${konnectorURL}/ring/pushNotifications/unsubscribe`,
      'POST',
      {deviceToken: deviceToken}
    );
  }

  async getWorkTimeSettings(): Promise<Object> {
    const fields = 'id,daysAWeek,workDays,minutesADay';
    const url = `${this.youTrackUrl}/api/admin/timeTrackingSettings/workTimeSettings?fields=${fields}`;
    return await this.makeAuthorizedRequest(url, 'GET');
  }

}

export default API;
