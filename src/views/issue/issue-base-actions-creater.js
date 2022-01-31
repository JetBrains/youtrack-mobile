/* @flow */

import {Clipboard, Share} from 'react-native';

import * as commandDialogHelper from '../../components/command-dialog/command-dialog-helper';
import ApiHelper from '../../components/api/api__helper';
import issueCommonLinksActions from '../../components/issue-actions/issue-links-actions';
import log from '../../components/log/log';
import Router from '../../components/router/router';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from '../../components/analytics/analytics-ids';
import {getEntityPresentation, getReadableID} from '../../components/issue-formatter/issue-formatter';
import {getIssueTextCustomFields} from '../../components/custom-field/custom-field-helper';
import {initialState} from './issue-base-reducer';
import {isIOSPlatform, until} from '../../util/util';
import {logEvent} from '../../components/log/log-helper';
import {notify, notifyError} from '../../components/notification/notification';
import {receiveUserAppearanceProfile} from '../../actions/app-actions';
import {resolveError, resolveErrorMessage} from '../../components/error/error-resolver';
import {showActions} from '../../components/action-sheet/action-sheet';

import type ActionSheet from '@expo/react-native-action-sheet';
import type Api from '../../components/api/api';
import type {AppState} from '../../reducers';
import type {Attachment, CustomField, CustomFieldText, FieldValue, IssueProject, Tag} from '../../flow/CustomFields';
import type {CommandSuggestionResponse, IssueFull, IssueOnList, OpenNestedViewParams} from '../../flow/Issue';
import type {IssueLink} from '../../flow/CustomFields';
import type {IssueState} from './issue-base-reducer';
import type {NormalizedAttachment} from '../../flow/Attachment';
import type {UserAppearanceProfile} from '../../flow/User';
import type {Visibility} from '../../flow/Visibility';

type ApiGetter = () => Api;
type StateGetter = () => IssueState;

function makeIssueWebUrl(api: Api, issue: IssueFull, commentId: ?string) {
  const commentHash = commentId ? `#comment=${commentId}` : '';
  return `${api.config.backendUrl}/issue/${issue.idReadable}${commentHash}`;
}

export const createActions = (dispatchActions: any, stateFieldName: string = 'issueState') : any => {
  const actions = {
    loadIssueAttachments: function (): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueId = getState()[stateFieldName].issueId;
        if (!issueId) {
          return;
        }

        try {
          const attachments = await getApi().issue.getIssueAttachments(issueId);
          dispatch(dispatchActions.receiveAllAttachments(attachments));
        } catch (error) {
          log.warn('Failed to load issue attachments', error);
        }
      };
    },

    loadIssueLinksTitle: function (): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<Array<IssueLink>> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issue: IssueFull = getState()[stateFieldName].issue;
        return await issueCommonLinksActions(issue).loadIssueLinksTitle();
      };
    },

    getIssueLinksTitle: function (links?: Array<IssueLink>): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        dispatch(dispatchActions.receiveIssueLinks(links || await dispatch(actions.loadIssueLinksTitle())));
      };
    },

    loadIssue: function (): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<IssueFull | void>) {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueId = getState()[stateFieldName].issueId;
        const api: Api = getApi();

        try {
          if (!issueId) {
            throw new Error('Attempt to load issue with no ID');
          }
          log.debug(`Loading issue "${issueId}"`);
          const issue = await api.issue.getIssue(issueId);
          log.info(`Issue "${issueId}" loaded`);
          issue.fieldHash = ApiHelper.makeFieldHash(issue);

          dispatch(dispatchActions.setIssueId(issue.id)); //Set issue ID again because first one could be readable like YTM-111
          dispatch(dispatchActions.receiveIssue(issue));
          dispatch(actions.getIssueLinksTitle());
          return issue;
        } catch (rawError) {
          const error = await resolveError(rawError);
          dispatch(dispatchActions.setError(error));
          log.warn('Failed to load issue', error);
        }
      };
    },

    loadLinkedIssues: function (): (
      dispatch: (any) => any,
      getState: () => AppState,
      getApi: ApiGetter,
    ) => Promise<Array<IssueLink>> {
      return async (dispatch: (any) => any, getState: () => AppState, getApi: ApiGetter) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Load linked issue');
        const issue: IssueFull = getState()[stateFieldName].issue;
        return await issueCommonLinksActions(issue).loadLinkedIssues();
      };
    },

    onUnlinkIssue: function (linkedIssue: IssueOnList, linkTypeId: string): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<boolean> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issue: IssueFull = getState()[stateFieldName].issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Remove linked issue');
        return issueCommonLinksActions(issue).onUnlinkIssue(linkedIssue, linkTypeId);
      };
    },

    loadIssuesXShort: function (linkTypeName: string, query: string = '', page?: number): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<IssueOnList> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Search to link issues');
        const issue: IssueFull = getState()[stateFieldName].issue;
        const searchQuery = [
          `(project:${issue.project.shortName})`,
          query.length > 0 ? `(${query})` : '',
          `(${linkTypeName.split(' ').join('+')}:+-${getReadableID(issue)})`,
        ].filter(Boolean).join('+and+');

        return await issueCommonLinksActions(issue).loadIssuesXShort(searchQuery, page);
      };
    },

    onLinkIssue: function (linkedIssueIdReadable: string, linkTypeName: string): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<boolean> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issue: IssueFull = getState()[stateFieldName].issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Link issue');
        return await issueCommonLinksActions(issue).onLinkIssue(linkedIssueIdReadable, linkTypeName);
      };
    },

    refreshIssue: function (): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter) => {
        dispatch(dispatchActions.startIssueRefreshing());
        try {
          const successMessage = 'Issue updated';
          await dispatch(actions.loadIssue());
          notify(successMessage);
          log.debug(`${successMessage} "${getState()[stateFieldName].issueId}" loaded`);
        } catch (error) {
          const errorMessage = 'Cannot update issue';
          notify(errorMessage, error);
        } finally {
          dispatch(dispatchActions.stopIssueRefreshing());
        }
      };
    },

    saveIssueSummaryAndDescriptionChange: function (): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        const {summaryCopy, descriptionCopy} = getState()[stateFieldName];
        const textCustomFields: Array<CustomFieldText> = getIssueTextCustomFields(issue.fields);

        dispatch(dispatchActions.setIssueSummaryAndDescription(summaryCopy, descriptionCopy));
        dispatch(dispatchActions.startSavingEditedIssue());

        try {
          await api.issue.saveIssueSummaryAndDescriptionChange(
            issue.id,
            summaryCopy,
            descriptionCopy,
            textCustomFields.length > 0 ? textCustomFields : undefined,
          );
          log.info(`Issue (${issue.id}) summary/description has been updated`);
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update issue', 'Success');

          await dispatch(actions.loadIssue());
          dispatch(dispatchActions.stopEditingIssue());
          dispatch(dispatchActions.issueUpdated(getState()[stateFieldName].issue));
        } catch (err) {
          notifyError('Failed to update issue', err);
        } finally {
          dispatch(dispatchActions.stopSavingEditedIssue());
        }
      };
    },

    onCheckboxUpdate: function (checked: boolean, position: number, description: string): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        const preIssueDescription: string = issue.description;
        dispatch(dispatchActions.setIssueSummaryAndDescription(issue.summary, description));

        const textCustomFields: Array<CustomFieldText> = getIssueTextCustomFields(issue.fields);
        const [error] = await until(api.issue.saveIssueSummaryAndDescriptionChange(
          issue.id,
          issue.summary,
          description,
          textCustomFields.length > 0 ? textCustomFields : undefined,
        ));

        if (error) {
          dispatch(dispatchActions.setIssueSummaryAndDescription(issue.summary, preIssueDescription));
          const message: string = 'Failed to update a checkbox';
          notify(message);
          logEvent({
            message,
            isError: true,
            analyticsId: ANALYTICS_ISSUE_PAGE,
          });
        } else {
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, `Checkbox: ${checked ? 'checked' : 'unchecked'}`);
        }
      };
    },

    setCustomFieldValue: function (field: CustomField, value: FieldValue): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void>) {
      return async (dispatch: any => any, getState: StateGetter, getApi: ApiGetter) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update field value');
        dispatch(dispatchActions.setIssueFieldValue(field, value));
      };
    },

    updateIssueFieldValue: function (field: CustomField, value: FieldValue): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void>) {
      return async (
        dispatch: any => any,
        getState: StateGetter,
        getApi: ApiGetter
      ) => {
        const api: Api = getApi();
        const issue: IssueFull = getState()[stateFieldName].issue;

        dispatch(actions.setCustomFieldValue(field, value));
        const updateMethod = (...args) => {
          if (field.hasStateMachine) {
            return api.issue.updateIssueFieldEvent(...args);
          }
          return api.issue.updateIssueFieldValue(...args);
        };

        try {
          await updateMethod(issue.id, field.id, value);
          log.info('Field value updated', field, value);
          await dispatch(actions.loadIssue());
          dispatch(dispatchActions.issueUpdated(getState()[stateFieldName].issue));
        } catch (err) {
          const error = await resolveError(err);

          if (error.error_type === 'workflow' && error.error_workflow_type === 'require') {
            log.info('Workflow require received', error);
            dispatch(dispatchActions.openCommandDialog(`${error.error_field} `));
          }

          notifyError('Failed to update issue field', error);
          dispatch(actions.loadIssue());
        }
      };
    },

    updateProject: function (project: IssueProject): ((
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void>) {
      return async (
        dispatch: any => any,
        getState: StateGetter,
        getApi: ApiGetter
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update project');

        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        dispatch(dispatchActions.setProject(project));

        try {
          await api.issue.updateProject(issue, project);
          log.info('Project updated');
          await dispatch(actions.loadIssue());
          dispatch(dispatchActions.issueUpdated(getState()[stateFieldName].issue));
        } catch (err) {
          notifyError('Failed to update issue project', err);
          dispatch(actions.loadIssue());
        }
      };
    },

    toggleVote: function (voted: boolean): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (
        dispatch: any => any,
        getState: StateGetter,
        getApi: ApiGetter
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        dispatch(dispatchActions.setVoted(voted));
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, `Vote: ${voted ? 'voted' : 'unvoted'}`);
        try {
          await api.issue.updateIssueVoted(issue.id, voted);
        } catch (err) {
          const errorMessage: string = await resolveErrorMessage(err);
          notify(errorMessage || 'Cannot vote');
          dispatch(dispatchActions.setVoted(!voted));
        }
      };
    },

    toggleStar: function (starred: boolean): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (
        dispatch: any => any,
        getState: StateGetter,
        getApi: ApiGetter
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];

        dispatch(dispatchActions.setStarred(starred));
        try {
          await api.issue.updateIssueStarred(issue.id, starred);
        } catch (err) {
          notifyError('Cannot update "Starred"', err);
          dispatch(dispatchActions.setStarred(!starred));
        }
      };
    },

    onOpenTagsSelect: function (): (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => void {
      return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const issue: IssueFull = getState()[stateFieldName].issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open Tags select');

        dispatch(dispatchActions.openTagsSelect({
          multi: true,
          placeholder: 'Filter tags',
          dataSource: async () => {
            const issueProjectId: string = issue.project.id;
            const [error, relevantProjectTags] = await until(api.issueFolder.getProjectRelevantTags(issueProjectId));
            if (error) {
              return [];
            }
            return relevantProjectTags;
          },

          selectedItems: issue?.tags || [],
          getTitle: item => getEntityPresentation(item),
          onCancel: () => dispatch(actions.onCloseTagsSelect()),
          onSelect: async (tags: Array<Tag>) => {
            const [error, issueWithTags] = await until(api.issue.addTags(issue.id, tags));
            dispatch(dispatchActions.receiveIssue({...issue, tags: issueWithTags?.tags || []}));

            dispatch(actions.onCloseTagsSelect());
            if (error) {
              dispatch(dispatchActions.receiveIssue(issue));
              notify('Failed to add a tag');
            }

          },
        }));
      };
    },

    showIssueActions: function (
      actionSheet: ActionSheet,
      permissions: { canAttach: boolean, canEdit: boolean, canApplyCommand: boolean, canTag: boolean },
      switchToDetailsTab: () => any,
      renderLinkIssues?: () => any,
    ): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];

        const actionSheetActions = [
          {
            title: 'Share…',
            execute: () => {
              const url = makeIssueWebUrl(api, issue);
              if (isIOSPlatform()) {
                Share.share({url});
              } else {
                Share.share({title: issue.summary, message: url}, {dialogTitle: 'Share URL'});
              }
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Share URL');
            },
          },
          {
            title: 'Copy URL',
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy URL');
              Clipboard.setString(makeIssueWebUrl(api, issue));
              notify('URL copied');
            },
          },
        ];

        if (permissions.canEdit) {
          actionSheetActions.push({
            title: 'Edit',
            execute: () => {
              dispatch(dispatchActions.startEditingIssue());
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Edit issue');
            },
          });
        }

        if (permissions.canTag) {
          actionSheetActions.push({
            title: 'Add tag',
            execute: () => {
              dispatch(actions.onOpenTagsSelect());
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add tag');
            },
          });
        }

        if (permissions.canAttach) {
          actionSheetActions.push({
            title: 'Attach file',
            execute: () => {
              switchToDetailsTab();
              dispatch(dispatchActions.toggleAttachFileDialog(true));
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Attach file');
            },
          });
        }

        if (typeof renderLinkIssues === 'function') {
          actionSheetActions.push({
            title: 'Link issue',
            execute: () => {
              renderLinkIssues();
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Link issue');
            },
          });
        }

        if (permissions.canApplyCommand) {
          actionSheetActions.push({
            title: 'Apply command…',
            execute: () => {
              dispatch(dispatchActions.openCommandDialog());
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Apply command');
            },
          });
        }

        actionSheetActions.push({title: 'Cancel'});

        const selectedAction = await showActions(
          actionSheetActions,
          actionSheet,
          issue.idReadable,
          issue.summary.length > 155 ? `${issue.summary.substr(0, 153)}…` : issue.summary
        );

        if (selectedAction && selectedAction.execute) {
          selectedAction.execute();
        }
      };
    },

    onShowCopyTextContextActions: function (actionSheet: ActionSheet, text: string, title?: string): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const selectedAction = await showActions(
          [
            {
              title: title || 'Copy text',
              execute: () => {
                usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy text via action');
                Clipboard.setString(text);
                notify('Text copied');
              },
            },
            {title: 'Cancel'},
          ],
          actionSheet,
        );

        if (selectedAction && selectedAction.execute) {
          selectedAction.execute();
        }
      };
    },

    openNestedIssueView: function (params: OpenNestedViewParams): () => any | void {
      return () => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Navigate to linked issue');
        if (!params.issue) {
          return Router.Issue({issueId: params.issueId});
        }

        Router.Issue({
          issuePlaceholder: {...params.issue, ...{fieldHash: ApiHelper.makeFieldHash(params.issue)}},
          issueId: params.issue?.id,
        });
      };
    },

    unloadIssueIfExist: function (): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter) => {
        const state = getState()[stateFieldName];
        if (state !== initialState) {
          dispatch(dispatchActions.unloadActiveIssueView());
        }
      };
    },

    openIssueListWithSearch: function (query: string): () => void {
      return () => {
        Router.Issues({query});
      };
    },

    onTagRemove: function (tagId: string): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issue = getState()[stateFieldName].issue;
        const api: Api = getApi();
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Remove tag');
        try {
          await api.issue.removeTag(issue.id, tagId);
          const updatedIssue: IssueFull = {...issue, tags: issue.tags.filter((tag: Tag) => tag.id !== tagId)};
          dispatch(dispatchActions.receiveIssue(updatedIssue));
        } catch (err) {
          const errorMsg: string = 'Failed to remove tag';
          log.warn(errorMsg, err);
          notify(errorMsg, err);
        }
      };
    },


    getCommandSuggestions: function (command: string, caret: number): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueId = getState()[stateFieldName].issueId;
        await commandDialogHelper.loadIssueCommandSuggestions([issueId], command, caret).then(
          (suggestions: CommandSuggestionResponse) => {
            suggestions && dispatch(dispatchActions.receiveCommandSuggestions(suggestions));
          }).catch(() => {
          //
        });
      };
    },

    applyCommand: function (command: string): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter): Promise<void> => {
        const issueId = getState()[stateFieldName].issueId;

        dispatch(dispatchActions.startApplyingCommand());
        return await commandDialogHelper.applyCommand([issueId], command).then(async () => {
          dispatch(dispatchActions.closeCommandDialog());
          if (command.toLowerCase().trim() === 'delete') {
            notify('Issue deleted');
            Router.Issues();
          } else {
            await dispatch(actions.loadIssue());
            dispatch(dispatchActions.issueUpdated(getState()[stateFieldName].issue));
          }
        }).finally(() => {
          dispatch(dispatchActions.stopApplyingCommand());
        });
      };
    },

    updateUserAppearanceProfile: function (userAppearanceProfile: UserAppearanceProfile): (dispatch: (any) => any) => Promise<void> {
      return async (dispatch: (any) => any) => {
        dispatch(receiveUserAppearanceProfile(userAppearanceProfile));
      };
    },

    uploadIssueAttach: function (files: Array<NormalizedAttachment>): (
      dispatch: (any) => any,
      getState: StateGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter) => {
        await dispatch(dispatchActions.uploadFile(files, getState()[stateFieldName].issueId));
      };
    },

    cancelAddAttach: function (attach: Attachment): (dispatch: (any) => any) => Promise<void> {
      return async (dispatch: (any) => any) => {
        await dispatch(dispatchActions.cancelImageAttaching(attach));
      };
    },

    loadAttachments: function (): (dispatch: (any) => any, getState: StateGetter) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter) => {
        dispatch(actions.loadIssueAttachments(getState()[stateFieldName].issueId));
      };
    },

    toggleVisibleAddAttachDialog: function (isVisible: boolean): (dispatch: (any) => any) => Promise<void> {
      return async (dispatch: (any) => any) => {
        dispatch(dispatchActions.toggleAttachFileDialog(isVisible));
      };
    },

    removeAttachment: function (attach: Attachment): (dispatch: (any) => any, getState: StateGetter) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter) => {
        await dispatch(dispatchActions.removeAttachment(attach, getState()[stateFieldName].issueId));
      };
    },

    updateIssueVisibility: function (visibility: Visibility): (
      dispatch: (any) => any,
      getState: StateGetter,
      getApi: ApiGetter
    ) => Promise<void> {
      return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
        const issueState: IssueFull = getState()[stateFieldName];
        const prevVisibility: Visibility = issueState.issue.visibility;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update visibility');

        try {
          const issueWithUpdatedVisibility: Visibility = await getApi().issue.updateVisibility(
            issueState.issueId, visibility);
          dispatch(dispatchActions.receiveIssueVisibility(issueWithUpdatedVisibility.visibility));

        } catch (err) {
          dispatch(dispatchActions.receiveIssueVisibility(Object.assign({timestamp: Date.now()}, prevVisibility)));
          const message: string = 'Cannot update issue visibility';
          notify(message, err);
          log.warn(message, err);
        }
      };
    },

    onCloseTagsSelect: function (): (dispatch: (any) => any) => void {
      return (dispatch: (any) => any) => {
        dispatch(dispatchActions.closeTagsSelect({
          selectProps: null,
          isTagsSelectVisible: false,
        }));
      };
    },
  };

  return actions;
};
