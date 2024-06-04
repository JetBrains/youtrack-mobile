import * as qs from 'qs';
import AgileAPI from './api__agile';
import ApiHelper from './api__helper';
import ArticlesAPI from './api__articles';
import BaseAPI from './api__base';
import CustomFieldsAPI from './api__custom-fields';
import FilterFields from 'components/api/api__filter-fields';
import HelpDeskAPI from 'components/api/api__helpdesk';
import InboxAPI from './api__inbox';
import IssueAPI from './api__issue';
import issueFields from './api__issue-fields';
import IssueFolderAPI from './api__issue-folder';
import IssuesAPI from './api__issues';
import MentionsAPI from './api__mention';
import ProjectsAPI from './api__projects';
import SavedQueries from 'components/api/api__saved-queries';
import SearchAPI from './api__search';
import GlobalSettingsAPI from 'components/api/api__global-settings';
import UserAPI from './api__user';
import UserGroupAPI from './api__user-group';
import {createBtoa} from 'util/util';

import type Auth from '../auth/oauth2';
import type {EndUserAgreement} from 'types/AppConfig';
import type {CommandSuggestionResponse} from 'types/Issue';
import type {Project} from 'types/Project';
import type {User} from 'types/User';


class API extends BaseAPI {
  youtTrackFieldBundleUrl: string;
  agile: AgileAPI;
  articles: ArticlesAPI;
  customFields: CustomFieldsAPI;
  helpDesk: HelpDeskAPI;
  filterFields: FilterFields;
  globalSettings: GlobalSettingsAPI;
  inbox: InboxAPI;
  issue: IssueAPI;
  issueFolder: IssueFolderAPI;
  issues: IssuesAPI;
  mentions: MentionsAPI;
  projects: ProjectsAPI;
  savedQueries: SavedQueries;
  search: SearchAPI;
  user: UserAPI;
  userGroup: UserGroupAPI;

  constructor(auth: Auth) {
    super(auth);
    this.agile = new AgileAPI(auth);
    this.articles = new ArticlesAPI(auth);
    this.customFields = new CustomFieldsAPI(auth);
    this.filterFields = new FilterFields(auth);
    this.helpDesk = new HelpDeskAPI(auth);
    this.globalSettings = new GlobalSettingsAPI(auth);
    this.inbox = new InboxAPI(auth);
    this.issue = new IssueAPI(auth);
    this.issueFolder = new IssueFolderAPI(auth);
    this.issues = new IssuesAPI(auth);
    this.mentions = new MentionsAPI(auth);
    this.projects = new ProjectsAPI(auth);
    this.savedQueries = new SavedQueries(auth);
    this.search = new SearchAPI(auth);
    this.user = new UserAPI(auth);
    this.userGroup = new UserGroupAPI(auth);
    this.youtTrackFieldBundleUrl = `${this.youTrackUrl}/api/admin/customFieldSettings/bundles`;
  }

  async getUserAgreement(): Promise<EndUserAgreement | null | undefined> {
    const queryString = qs.stringify({
      fields: 'endUserAgreement(enabled,text,majorVersion,minorVersion)',
    });
    const res = await this.makeAuthorizedRequest(
      `${this.auth.config.auth.serverUri}/api/rest/settings/public?${queryString}`,
      'GET',
    );
    return res.endUserAgreement;
  }

  async acceptUserAgreement(): Promise<Record<string, any>> {
    const body = {
      fields: issueFields.userConsent,
    };
    return await this.makeAuthorizedRequest(
      `${this.auth.config.auth.serverUri}/api/rest/users/endUserAgreementConsent`,
      'POST',
      {
        body,
      },
    );
  }

  async getProjects<T = Project>(
    query: string = '',
    fields: string = issueFields.projectOnList.toString(),
    ): Promise<Array<T>> {
    const queryString = qs.stringify({fields, query});
    return await this.makeAuthorizedRequest(
      `${this.youTrackProjectUrl}?${queryString}`,
    );
  }

  async getCustomFieldUserValues(bundleId: string): Promise<User[]> {
    const queryString = qs.stringify({
      banned: false,
      sort: true,
      fields: issueFields.user.toString(),
    });
    const values: User[] = await this.makeAuthorizedRequest(
      `${this.youtTrackFieldBundleUrl}/user/${bundleId}/aggregatedUsers?${queryString}`,
    );
    return ApiHelper.convertRelativeUrls(
      values,
      'avatarUrl',
      this.config.backendUrl,
    ) as User[];
  }

  async getCustomFieldValues(
    bundleId: string,
    fieldValueType: string,
    query: string = '',
  ): Promise<Array<Record<string, any>>> {
    if (fieldValueType === 'group') {
      return this.userGroup.getAllUserGroups();
    }

    if (fieldValueType === 'user') {
      return this.getCustomFieldUserValues(bundleId);
    }

    const queryString = API.createFieldsQuery(issueFields.bundleValues, {
      $includeArchived: false,
      sort: true,
      query,
    });
    return await this.makeAuthorizedRequest(
      `${this.youtTrackFieldBundleUrl}/${fieldValueType}/${bundleId}/values?${queryString}`,
    );
  }

  async getStateMachineEvents(issueId: string, fieldId: string): Promise<any> {
    const url = `${this.youTrackIssueUrl}/${issueId}/fields/${fieldId}/possibleEvents?fields=id,presentation`;
    return await this.makeAuthorizedRequest(url);
  }

  async getCommandSuggestions(
    issueIds: string[],
    query: string,
    caret: number,
  ): Promise<CommandSuggestionResponse> {
    const queryString = qs.stringify({
      fields: issueFields.commandSuggestionFields.toString(),
    });
    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/commands/assist?${queryString}`,
      'POST',
      {
        query,
        caret,
        issues: issueIds.map(id => ({
          id,
        })),
      },
    );
  }

  async applyCommand(options: {
    issueIds: string[];
    comment?: string | null | undefined;
    command: string;
  }): Promise<any> {
    return await this.makeAuthorizedRequest(
      `${this.youTrackUrl}/api/commands`,
      'POST',
      {
        query: options.command,
        comment: options.comment,
        issues: options.issueIds.map(id => ({
          id,
        })),
      },
    );
  }

  async getNotificationsToken(): Promise<string> {
    const url = `${this.youTrackUrl}/api/userNotifications/subscribe?fields=token`;
    const res = await this.makeAuthorizedRequest(url, 'POST');
    return res.token;
  }

  generateAccountHash(deviceToken: string = '', userLogin: string = '') {
    return createBtoa(`${this.youTrackUrl}${deviceToken}${userLogin}`);
  }

  async subscribeToFCMNotifications(
    konnectorURL: string,
    youtrackToken: string,
    deviceToken: string,
    userLogin: string,
  ): Promise<string> {
    const url = `${konnectorURL}/ring/fcmPushNotifications`;
    return await this.makeAuthorizedRequest(url, 'POST', {
      youtrackToken: youtrackToken,
      deviceToken: deviceToken,
      accountHash: this.generateAccountHash(deviceToken, userLogin),
    });
  }

  async unsubscribeFromFCMNotifications(
    konnectorURL: string,
    deviceToken: string,
    userLogin: string,
  ): Promise<any> {
    return this.makeAuthorizedRequest(
      `${konnectorURL}/ring/fcmPushNotifications/unsubscribe`,
      'POST',
      {
        deviceToken,
        accountHash: this.generateAccountHash(deviceToken, userLogin),
      },
    );
  }

  async subscribeToIOSNotifications(
    konnectorURL: string,
    youtrackToken: string,
    deviceToken: string,
    userLogin: string,
  ): Promise<string> {
    const url = `${konnectorURL}/ring/pushNotifications`;
    return await this.makeAuthorizedRequest(url, 'POST', {
      token: youtrackToken,
      appleDeviceId: deviceToken,
      accountHash: this.generateAccountHash(deviceToken, userLogin),
    });
  }

  async unsubscribeFromIOSNotifications(
    konnectorURL: string,
    deviceToken: string,
    userLogin: string,
  ): Promise<any> {
    return this.makeAuthorizedRequest(
      `${konnectorURL}/ring/pushNotifications/unsubscribe`,
      'POST',
      {
        appleDeviceId: deviceToken,
        accountHash: this.generateAccountHash(deviceToken, userLogin),
      },
    );
  }

  async getWorkTimeSettings(): Promise<Record<string, any>> {
    const fields = 'id,daysAWeek,workDays,minutesADay';
    const url = `${this.youTrackUrl}/api/admin/timeTrackingSettings/workTimeSettings?fields=${fields}`;
    return await this.makeAuthorizedRequest(url, 'GET');
  }
}

export default API;
