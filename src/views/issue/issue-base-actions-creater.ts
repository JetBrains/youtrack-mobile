import {Clipboard, Share} from 'react-native';

import {ActionSheetProvider} from '@expo/react-native-action-sheet';

import * as commandDialogHelper from 'components/command-dialog/command-dialog-helper';
import ApiHelper from 'components/api/api__helper';
import issueCommonLinksActions from 'components/issue-actions/issue-links-actions';
import log from 'components/log/log';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {ActionSheetOption, showActions} from 'components/action-sheet/action-sheet';
import {confirmDeleteIssue} from 'components/confirmation/issue-confirmations';
import {getEntityPresentation, getReadableID} from 'components/issue-formatter/issue-formatter';
import {getIssueTextCustomFields} from 'components/custom-field/custom-field-helper';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {initialState, IssueState} from './issue-base-reducer';
import {i18n} from 'components/i18n/i18n';
import {isIOSPlatform, until} from 'util/util';
import {logEvent} from 'components/log/log-helper';
import {makeIssueWebUrl} from 'views/issue/activity/issue-activity__helper';
import {notify, notifyError} from 'components/notification/notification';
import {receiveUserAppearanceProfile} from 'actions/app-actions';
import {resolveError} from 'components/error/error-resolver';

import type Api from 'components/api/api';
import type {AnyError} from 'types/Error';
import type {AppState} from 'reducers';
import type {Attachment, CustomField, CustomFieldText, FieldValue, IssueLink, Tag} from 'types/CustomFields';
import type {
  AnyIssue,
  CommandSuggestionResponse,
  IssueFull,
  IssueOnList,
  IssueSprint,
  OpenNestedViewParams,
} from 'types/Issue';
import type {BoardOnIssue, SprintOnIssue} from 'types/Agile';
import type {NormalizedAttachment} from 'types/Attachment';
import type {UserAppearanceProfile, UserCC} from 'types/User';
import type {Visibility} from 'types/Visibility';
import type {Project} from 'types/Project';
import type {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

export const DEFAULT_ISSUE_STATE_FIELD_NAME: keyof AppState = 'issueState';

export const createActions = (
  dispatchActions: any,
  stateFieldName: keyof AppState = DEFAULT_ISSUE_STATE_FIELD_NAME,
): any => {
  const actions = {
    loadIssueAttachments: function (): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const issueId: string | undefined = (getState()[stateFieldName] as IssueState).issueId;

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
    loadIssueLinksTitle: function (): ReduxAction<Promise<IssueLink[]>> {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
      ) => {
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        return await issueCommonLinksActions(issue).loadIssueLinksTitle();
      };
    },
    getIssueLinksTitle: function (links?: IssueLink[]): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
      ) => {
        dispatch(
          dispatchActions.receiveIssueLinks(
            links || (await dispatch(actions.loadIssueLinksTitle())),
          ),
        );
      };
    },
    loadIssue: function (issuePlaceholder?: IssueOnList): ReduxAction<Promise<IssueFull | undefined>> {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const issueId = (getState()[stateFieldName] as IssueState).issueId;
        const api: Api = getApi();

        const doUpdate = (issue: AnyIssue): void => {
          dispatch(dispatchActions.setIssueId(issue.id)); //Set issue ID again because first one could be readable id

          dispatch(dispatchActions.receiveIssue(issue));
          dispatch(actions.getIssueLinksTitle());
        };

        const updateCache = (issue: AnyIssue) => {
          const updatedCache: AnyIssue[] = (
            getStorageState().issuesCache || []
          ).map((it: AnyIssue) => {
            if (it.id === issue.id) {
              return {...it, ...issue};
            }

            return it;
          });
          flushStoragePart({
            issuesCache: updatedCache,
          });
        };

        try {
          log.info('Issue Actions: Loading issue');
          const issue = await api.issue.getIssue(issueId);
          log.info('Issue Actions: Issue loaded');
          issue.fieldHash = ApiHelper.makeFieldHash(issue);
          doUpdate(issue);
          updateCache(issue);
          return issue;
        } catch (err) {
          if (getState().app?.networkState?.isConnected === false) {
            const cachedIssue: IssueOnList | undefined =
              (getStorageState().issuesCache || []).find(
                (issue: IssueOnList) => issue.id === issueId || issue.idReadable === issueId
              ) || issuePlaceholder;
            if (cachedIssue) {
              doUpdate(cachedIssue);
            }
          } else {
            log.warn('Failed to load issue', err);
            const error = await resolveError(err as AnyError);
            dispatch(dispatchActions.setError(error));
          }
        }
      };
    },
    loadLinkedIssues: function (): ReduxAction<Promise<IssueLink[]>> {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Load linked issue');
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        return await issueCommonLinksActions(issue).loadLinkedIssues();
      };
    },
    onUnlinkIssue: function (
      linkedIssue: IssueOnList,
      linkTypeId: string,
    ): ReduxAction<Promise<boolean>> {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
      ) => {
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Remove linked issue');
        return issueCommonLinksActions(issue).onUnlinkIssue(
          linkedIssue,
          linkTypeId,
        );
      };
    },
    loadIssuesXShort: function (
      linkTypeName: string,
      query: string = '',
      page?: number,
    ): ReduxAction<Promise<IssueOnList>> {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Search to link issues');
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        const searchQuery: string = encodeURIComponent(
          [
            query.length > 0 ? `(${query})` : '',
            `(${linkTypeName.split(' ').join(' ')}: -${getReadableID(issue)})`,
          ]
            .filter(Boolean)
            .join(' and '),
        );
        return await issueCommonLinksActions(issue).loadIssuesXShort(
          searchQuery,
          page,
        );
      };
    },
    onLinkIssue: function (
      linkedIssueIdReadable: string,
      linkTypeName: string,
    ): ReduxAction<Promise<boolean>> {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
      ) => {
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Link issue');
        return await issueCommonLinksActions(issue).onLinkIssue(
          linkedIssueIdReadable,
          linkTypeName,
        );
      };
    },
    refreshIssue: function (): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
        dispatch(dispatchActions.startIssueRefreshing());

        try {
          const successMessage = i18n('Issue updated');
          await dispatch(actions.loadIssue());
          notify(successMessage);
        } catch (error) {
          notifyError(error as AnyError);
        } finally {
          dispatch(dispatchActions.stopIssueRefreshing());
        }
      };
    },
    saveIssueSummaryAndDescriptionChange: function (): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const api: Api = getApi();
        const issueState = getState()[stateFieldName] as IssueState;
        const {issue} = issueState;
        const {summaryCopy, descriptionCopy} = issueState;
        const textCustomFields: CustomFieldText[] = getIssueTextCustomFields(
          issue.fields,
        );
        dispatch(
          dispatchActions.setIssueSummaryAndDescription(
            summaryCopy,
            descriptionCopy,
          ),
        );
        dispatch(dispatchActions.startSavingEditedIssue());

        try {
          await api.issue.saveIssueSummaryAndDescriptionChange(
            issue.id,
            summaryCopy,
            descriptionCopy,
            textCustomFields.length > 0 ? textCustomFields : undefined,
          );
          log.info(`Issue Actions: Issue summary/description has been updated`);
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update issue', 'Success');
          await dispatch(actions.loadIssue());
          dispatch(dispatchActions.stopEditingIssue());
          dispatch(
            dispatchActions.issueUpdated((issueState as IssueState).issue),
          );
        } catch (err) {
          notifyError(err as AnyError);
        } finally {
          dispatch(dispatchActions.stopSavingEditedIssue());
        }
      };
    },
    onCheckboxUpdate: function (
      checked: boolean,
      position: number,
      description: string,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName] as IssueState;
        dispatch(
          dispatchActions.setIssueSummaryAndDescription(
            issue.summary,
            description,
          ),
        );
        const [error] = await until(
          api.issue.updateDescriptionCheckbox(
            issue.id,
            checked,
            position,
            issue.description,
          ),
        );

        if (error) {
          dispatch(
            dispatchActions.setIssueSummaryAndDescription(
              issue.summary,
              issue.description,
            ),
          );
          notifyError(error);
        } else {
          usage.trackEvent(
            ANALYTICS_ISSUE_PAGE,
            `Checkbox: ${checked ? 'checked' : 'unchecked'}`,
          );
        }
      };
    },
    setCustomFieldValue: function (
      field: CustomField,
      value: FieldValue,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update field value');
        dispatch(dispatchActions.setIssueFieldValue(field, value));
      };
    },
    updateIssueFieldValue: function (
      field: CustomField,
      value: FieldValue,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const api: Api = getApi();
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        dispatch(actions.setCustomFieldValue(field, value));

        const updateMethod = (issueId: string, fieldId: string, fieldValue: FieldValue) => {
          if (field.hasStateMachine) {
            return api.issue.updateIssueFieldEvent(issueId, fieldId, fieldValue);
          }

          return api.issue.updateIssueFieldValue(issueId, fieldId, fieldValue);
        };

        try {
          await updateMethod(issue.id, field.id, value);
          log.info('Issue Actions: Field value updated');
          await dispatch(actions.loadIssue());
          dispatch(
            dispatchActions.issueUpdated((getState()[stateFieldName] as IssueState).issue),
          );
        } catch (err) {
          const error = await resolveError(err as AnyError);

          if (
            error.error_type === 'workflow' &&
            error.error_workflow_type === 'require'
          ) {
            log.info('Issue Actions: Workflow require received', error);
            dispatch(
              dispatchActions.openCommandDialog(`${error.error_field} `),
            );
          }

          notifyError(error);
          dispatch(actions.loadIssue());
        }
      };
    },
    updateProject: function (
      project: Project,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update project');
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName] as IssueState;
        dispatch(dispatchActions.setProject(project));

        try {
          await api.issue.updateProject(issue, project);
          log.info('Issue Actions: Project updated');
          await dispatch(actions.loadIssue());
          dispatch(
            dispatchActions.issueUpdated((getState()[stateFieldName] as IssueState).issue),
          );
        } catch (err) {
          notifyError(err as AnyError);
          dispatch(actions.loadIssue());
        }
      };
    },
    toggleVote: function (
      voted: boolean,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName] as IssueState;
        dispatch(dispatchActions.setVoted(voted));
        usage.trackEvent(
          ANALYTICS_ISSUE_PAGE,
          `Vote: ${voted ? 'voted' : 'unvoted'}`,
        );

        try {
          await api.issue.updateIssueVoted(issue.id, voted);
        } catch (err) {
          notifyError(err as AnyError);
          dispatch(dispatchActions.setVoted(!voted));
        }
      };
    },
    toggleStar: function (
      starred: boolean,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName] as IssueState;
        dispatch(dispatchActions.setStarred(starred));

        try {
          await api.issue.updateIssueStarred(issue.id, starred);
        } catch (err) {
          notifyError(err as AnyError);
          dispatch(dispatchActions.setStarred(!starred));
        }
      };
    },
    onOpenTagsSelect: function (): ReduxAction {
      return (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const api: Api = getApi();
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open Tags select');
        dispatch(
          dispatchActions.openTagsSelect({
            multi: true,
            placeholder: i18n('Filter tags'),
            dataSource: async (q: string) => {
              const issueProjectId: string = issue.project.id;
              const [error, relevantProjectTags] = await until<Tag[]>(
                api.issueFolder.getProjectRelevantTags(issueProjectId, q)
              );
              return error
                ? []
                : relevantProjectTags.filter((it: Tag) => {
                    return it.id !== getState()?.app?.user?.profiles?.general?.star?.id;
                  });
            },
            selectedItems: issue?.tags || [],
            getTitle: (item: Tag) => getEntityPresentation(item),
            onCancel: () => dispatch(actions.onCloseTagsSelect()),
            onSelect: async (tags: Tag[]) => {
              const [error, issueWithTags] = await until(api.issue.addTags(issue.id, tags));
              dispatch(
                dispatchActions.receiveIssue({
                  ...issue,
                  tags: issueWithTags?.tags || [],
                }),
              );
              dispatch(actions.onCloseTagsSelect());

              if (error) {
                dispatch(dispatchActions.receiveIssue(issue));
                notifyError(error);
              }
            },
          }),
        );
      };
    },
    deleteIssue: function (issueId: string): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const [error] = await until(getApi().issue.deleteIssue(issueId));
        if (error) {
          notifyError(error);
        } else {
          Router.Issues({searchQuery: getState().issueList.query});
        }
      };
    },
    showIssueActions: function (
      actionSheet: typeof ActionSheetProvider,
      permissions: {
        canAttach: boolean;
        canEdit: boolean;
        canApplyCommand: boolean;
        canTag: boolean;
        canDeleteIssue: boolean;
      },
      switchToDetailsTab: () => void,
      renderLinkIssues?: () => void,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const api: Api = getApi();
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        const actionSheetActions: ActionSheetOption[] = [
          {
            title: i18n('Share…'),
            execute: () => {
              const url: string = makeIssueWebUrl(api, issue);

              if (isIOSPlatform()) {
                Share.share({
                  url,
                });
              } else {
                Share.share(
                  {
                    title: issue.summary,
                    message: url,
                  },
                  {
                    dialogTitle: i18n('Share link'),
                  },
                );
              }

              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Share URL');
            },
          },
          {
            title: i18n('Copy link'),
            execute: () => {
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy URL');
              Clipboard.setString(makeIssueWebUrl(api, issue));
              notify(i18n('Copied'));
            },
          },
        ];

        if (permissions.canEdit) {
          actionSheetActions.push({
            title: i18n('Edit'),
            execute: () => {
              dispatch(dispatchActions.startEditingIssue());
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Edit issue');
            },
          });
        }

        if (permissions.canTag) {
          actionSheetActions.push({
            title: i18n('Add tag'),
            execute: () => {
              dispatch(actions.onOpenTagsSelect());
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Add tag');
            },
          });
        }

        if (permissions.canAttach) {
          actionSheetActions.push({
            title: i18n('Attach file'),
            execute: () => {
              switchToDetailsTab();
              dispatch(dispatchActions.toggleAttachFileDialog(true));
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Attach file');
            },
          });
        }

        if (typeof renderLinkIssues === 'function') {
          actionSheetActions.push({
            title: i18n('Link issue'),
            execute: () => {
              renderLinkIssues();
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Link issue');
            },
          });
        }

        if (permissions.canApplyCommand) {
          actionSheetActions.push({
            title: i18n('Apply command…'),
            execute: () => {
              dispatch(dispatchActions.openCommandDialog());
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Apply command');
            },
          });
        }
        if (permissions.canDeleteIssue) {
          actionSheetActions.push({
            title: i18n('Delete'),
            execute: async () => {
              logEvent({
                message: 'Delete article',
                analyticsId: ANALYTICS_ISSUE_PAGE,
              });
              confirmDeleteIssue(issue.idReadable || issue.id)
                .then(() =>
                  dispatch(actions.deleteIssue(issue.id)),
                )
                .catch(() => {
                });
            },
          });
        }

        actionSheetActions.push({
          title: i18n('Cancel'),
        });
        const selectedAction = await showActions(
          actionSheetActions,
          actionSheet,
          issue.idReadable,
          issue.summary?.length > 155
            ? `${issue.summary.substring(0, 153)}…`
            : issue.summary,
        );

        selectedAction?.execute?.();
      };
    },
    onShowCopyTextContextActions: function (
      actionSheet: typeof ActionSheetProvider,
      text: string,
      title?: string,
    ): ReduxAction {
      return async () => {
        const selectedAction: ActionSheetOption = await showActions(
          [
            {
              title: title || i18n('Copy text'),
              execute: () => {
                usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Copy text via action');
                Clipboard.setString(text);
                notify(i18n('Copied'));
              },
            },
            {
              title: i18n('Cancel'),
            },
          ],
          actionSheet,
        );

        selectedAction?.execute?.();
      };
    },
    openNestedIssueView: function (
      params: OpenNestedViewParams,
    ): ReduxAction {
      return () => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Navigate to linked issue');

        if (!params.issue) {
          return Router.Issue({
            issueId: params.issueId,
          });
        }

        Router.Issue({
          issuePlaceholder: {
            ...params.issue,
            ...{
              fieldHash: ApiHelper.makeFieldHash(params.issue),
            },
          },
          issueId: params.issue?.id,
        });
      };
    },
    unloadIssueIfExist: function (): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
        const state = getState()[stateFieldName];

        if (state !== initialState) {
          dispatch(dispatchActions.unloadActiveIssueView());
        }
      };
    },
    openIssueListWithSearch: function (searchQuery: string): ReduxAction {
      return () => {
        Router.Issues({
          searchQuery,
        });
      };
    },
    onTagRemove: function (
      tagId: string,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        const api: Api = getApi();
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Remove tag');

        try {
          await api.issue.removeTag(issue.id, tagId);
          const updatedIssue: IssueFull = {
            ...issue,
            tags: issue.tags.filter((tag: Tag) => tag.id !== tagId),
          };
          dispatch(dispatchActions.receiveIssue(updatedIssue));
        } catch (err) {
          notifyError(err as AnyError);
        }
      };
    },
    getCommandSuggestions: function (
      command: string,
      caret: number,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
      ) => {
        const issueId: string = (getState()[stateFieldName] as IssueState).issueId;
        await commandDialogHelper
          .loadIssueCommandSuggestions([issueId], command, caret)
          .then((suggestions: CommandSuggestionResponse) => {
            suggestions &&
            dispatch(dispatchActions.receiveCommandSuggestions(suggestions));
          })
          .catch(() => {});
      };
    },
    applyCommand: function (
      command: string,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
      ): Promise<void> => {
        const issueId: string = (getState()[stateFieldName] as IssueState).issueId;
        dispatch(dispatchActions.startApplyingCommand());
        return await commandDialogHelper
          .applyCommand([issueId], command)
          .then(async () => {
            dispatch(dispatchActions.closeCommandDialog());

            if (command.toLowerCase().trim() === 'delete') {
              notify(i18n('Issue deleted'));
              Router.Issues();
            } else {
              await dispatch(actions.loadIssue());
              dispatch(
                dispatchActions.issueUpdated((getState()[stateFieldName] as IssueState).issue),
              );
            }
          })
          .finally(() => {
            dispatch(dispatchActions.stopApplyingCommand());
          });
      };
    },
    updateUserAppearanceProfile: function (
      userAppearanceProfile: UserAppearanceProfile,
    ): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        dispatch(receiveUserAppearanceProfile(userAppearanceProfile));
      };
    },
    uploadIssueAttach: function (
      files: NormalizedAttachment[],
    ): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
        await dispatch(
          dispatchActions.uploadFile(files, (getState()[stateFieldName] as IssueState).issue),
        );
      };
    },
    cancelAddAttach: function (
      attach: Attachment,
    ): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        await dispatch(dispatchActions.cancelImageAttaching(attach));
      };
    },
    loadAttachments: function (): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        dispatch(
          actions.loadIssueAttachments(),
        );
      };
    },
    toggleVisibleAddAttachDialog: function (
      isVisible: boolean,
    ): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        dispatch(dispatchActions.toggleAttachFileDialog(isVisible));
      };
    },
    removeAttachment: function (
      attach: Attachment,
    ): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
        await dispatch(
          dispatchActions.removeAttachment(
            attach,
            (getState()[stateFieldName] as IssueState).issueId,
          ),
        );
      };
    },
    updateIssueVisibility: function (
      visibility: Visibility,
    ): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        const issueState = getState()[stateFieldName] as IssueState;
        const prevVisibility: Visibility = issueState.issue.visibility;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update visibility');

        try {
          const issueWithUpdatedVisibility: { id: string; visibility: Visibility } = await getApi().issue.updateVisibility(
            issueState.issueId,
            visibility,
          );
          dispatch(
            dispatchActions.receiveIssueVisibility(
              issueWithUpdatedVisibility.visibility,
            ),
          );
        } catch (err) {
          dispatch(
            dispatchActions.receiveIssueVisibility(
              Object.assign(
                {
                  timestamp: Date.now(),
                },
                prevVisibility,
              ),
            ),
          );
          notifyError(err as AnyError);
        }
      };
    },
    onCloseTagsSelect: function (): ReduxAction {
      return (dispatch: ReduxThunkDispatch) => {
        dispatch(
          dispatchActions.closeTagsSelect({
            selectProps: null,
            isTagsSelectVisible: false,
          }),
        );
      };
    },
    loadUsersCC: function (issueId: string): ReduxAction {
      return async (
        dispatch: ReduxThunkDispatch,
        getState: ReduxStateGetter,
        getApi: ReduxAPIGetter,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Load CC users');
        const [error, usersCC] = await until<UserCC[]>(getApi().issue.getUsersCC(issueId));
        if (error) {
          notifyError(error);
        }
        if (usersCC) {
          dispatch(dispatchActions.setUserCC(usersCC));
        }
      };
    },
    setUsersCC: function (users: UserCC[]): ReduxAction {
      return async (dispatch: ReduxThunkDispatch) => {
        dispatch(dispatchActions.setUserCC(users));
      };
    },
    loadIssueSprints: function (issueId: string): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter,) => {
        const [e, sprints] = await until<IssueSprint[]>(getApi().issue.getIssueSprints(issueId));
        if (e) {
          notifyError(e);
        } else if (sprints.length) {
          dispatch(dispatchActions.setIssueSprints(sprints));
        }
      };
    },
    getIssueBoards: function (): ReduxAction<Promise<BoardOnIssue[]>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter,) => {
        const [e, boards] = await until<BoardOnIssue[]>(getApi().agile.getIssueAgileBoards());
        if (e) {
          notifyError(e);
        }
        return e ? [] : boards;
      };
    },
    getIssueSprints: function (boardId: string): ReduxAction<Promise<SprintOnIssue[]>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter,) => {
        const [e, sprints] = await until<SprintOnIssue[]>(getApi().agile.getIssueBoardSprints(boardId));
        if (e) {
          notifyError(e);
        }
        return e ? [] : sprints;
      };
    },
    addIssueToSprint: function (issueId: string, boardName: string, sprintName: string | null): ReduxAction<Promise<SprintOnIssue[]>> {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter,) => {
        const [e, sprints] = await until<SprintOnIssue[]>(getApi().applyCommand({
          issueIds: [issueId],
          command: `add board ${boardName} ${sprintName !== null ? sprintName : ''}`.trim(),
        }));
        if (e) {
          notifyError(e);
        }
        return e ? [] : sprints;
      };
    },
    removeIssueFromSprint: function (boardId: string, sprintId: string, issueId: string): ReduxAction {
      return async (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter, getApi: ReduxAPIGetter,) => {
        const [e] = await until(getApi().agile.removeIssueFromSprint(boardId, sprintId, issueId));
        if (e) {
          notifyError(e, 8000);
        }
      };
    },
  };
  return actions;
};
