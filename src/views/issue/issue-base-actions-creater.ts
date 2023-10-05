import {Clipboard, Share} from 'react-native';

import * as commandDialogHelper from 'components/command-dialog/command-dialog-helper';
import ApiHelper from 'components/api/api__helper';
import issueCommonLinksActions from 'components/issue-actions/issue-links-actions';
import log from 'components/log/log';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {confirmDeleteIssue} from 'components/confirmation/issue-confirmations';
import {
  getEntityPresentation,
  getReadableID,
} from 'components/issue-formatter/issue-formatter';
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
import {showActions} from 'components/action-sheet/action-sheet';

import type Api from 'components/api/api';
import type {AppState} from 'reducers';
import type {
  Attachment,
  CustomField,
  CustomFieldText,
  FieldValue,
  IssueProject,
  Tag,
} from 'types/CustomFields';
import type {
  AnyIssue,
  CommandSuggestionResponse,
  IssueFull,
  IssueOnList,
  OpenNestedViewParams,
} from 'types/Issue';
import type {IssueLink} from 'types/CustomFields';
import type {NormalizedAttachment} from 'types/Attachment';
import type {UserAppearanceProfile} from 'types/User';
import type {Visibility} from 'types/Visibility';
import {CustomError} from 'types/Error';

type ApiGetter = () => Api;
type StateGetter = () => AppState;


export const DEFAULT_ISSUE_STATE_FIELD_NAME: keyof AppState = 'issueState';

export const createActions = (
  dispatchActions: any,
  stateFieldName: keyof AppState = DEFAULT_ISSUE_STATE_FIELD_NAME,
): any => {
  const actions = {
    loadIssueAttachments: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
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
    loadIssueLinksTitle: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<Array<IssueLink>> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        return await issueCommonLinksActions(issue).loadIssueLinksTitle();
      };
    },
    getIssueLinksTitle: function (
      links?: IssueLink[],
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        dispatch(
          dispatchActions.receiveIssueLinks(
            links || (await dispatch(actions.loadIssueLinksTitle())),
          ),
        );
      };
    },
    loadIssue: function (
      issuePlaceholder?: Partial<IssueFull>,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<IssueFull | void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: AppState,
        getApi: ApiGetter,
      ) => {
        const issueId = getState()[stateFieldName].issueId;
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
          if (!issueId) {
            throw new Error('Attempt to load issue with no ID');
          }

          log.debug(`Loading issue "${issueId}"`);
          const issue = await api.issue.getIssue(issueId);
          log.info(`Issue "${issueId}" loaded`);
          issue.fieldHash = ApiHelper.makeFieldHash(issue);
          doUpdate(issue);
          updateCache(issue);
          return issue;
        } catch (err) {
          if (getState().app?.networkState?.isConnected === false) {
            const cachedIssue: AnyIssue | null | undefined =
              (getStorageState().issuesCache || []).find((issue: AnyIssue) => {
                return issue.id === issueId || issue.idReadable === issueId;
              }) || issuePlaceholder;
            cachedIssue && doUpdate(cachedIssue);
          } else {
            log.warn('Failed to load issue', error);
            const error = await resolveError(err);
            dispatch(dispatchActions.setError(error));
          }
        }
      };
    },
    loadLinkedIssues: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<Array<IssueLink>> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Load linked issue');
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        return await issueCommonLinksActions(issue).loadLinkedIssues();
      };
    },
    onUnlinkIssue: function (
      linkedIssue: IssueOnList,
      linkTypeId: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<boolean> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
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
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<IssueOnList> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
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
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<boolean> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Link issue');
        return await issueCommonLinksActions(issue).onLinkIssue(
          linkedIssueIdReadable,
          linkTypeName,
        );
      };
    },
    refreshIssue: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (dispatch: (arg0: any) => any, getState: StateGetter) => {
        dispatch(dispatchActions.startIssueRefreshing());

        try {
          const successMessage = i18n('Issue updated');
          await dispatch(actions.loadIssue());
          notify(successMessage);
          log.debug(
            `${successMessage} "${(getState()[stateFieldName] as IssueState).issueId}" loaded`,
          );
        } catch (error) {
          notifyError(error);
        } finally {
          dispatch(dispatchActions.stopIssueRefreshing());
        }
      };
    },
    saveIssueSummaryAndDescriptionChange: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        const {summaryCopy, descriptionCopy} = getState()[stateFieldName];
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
          log.info(`Issue (${issue.id}) summary/description has been updated`);
          usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update issue', 'Success');
          await dispatch(actions.loadIssue());
          dispatch(dispatchActions.stopEditingIssue());
          dispatch(
            dispatchActions.issueUpdated((getState()[stateFieldName] as IssueState).issue),
          );
        } catch (err) {
          notifyError(err);
        } finally {
          dispatch(dispatchActions.stopSavingEditedIssue());
        }
      };
    },
    onCheckboxUpdate: function (
      checked: boolean,
      position: number,
      description: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
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
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update field value');
        dispatch(dispatchActions.setIssueFieldValue(field, value));
      };
    },
    updateIssueFieldValue: function (
      field: CustomField,
      value: FieldValue,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        dispatch(actions.setCustomFieldValue(field, value));

        const updateMethod = (...args: any[]) => {
          if (field.hasStateMachine) {
            return api.issue.updateIssueFieldEvent(...args);
          }

          return api.issue.updateIssueFieldValue(...args);
        };

        try {
          await updateMethod(issue.id, field.id, value);
          log.info('Field value updated', field, value);
          await dispatch(actions.loadIssue());
          dispatch(
            dispatchActions.issueUpdated((getState()[stateFieldName] as IssueState).issue),
          );
        } catch (err) {
          const error = await resolveError(err);

          if (
            error.error_type === 'workflow' &&
            error.error_workflow_type === 'require'
          ) {
            log.info('Workflow require received', error);
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
      project: IssueProject,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update project');
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        dispatch(dispatchActions.setProject(project));

        try {
          await api.issue.updateProject(issue, project);
          log.info('Project updated');
          await dispatch(actions.loadIssue());
          dispatch(
            dispatchActions.issueUpdated((getState()[stateFieldName] as IssueState).issue),
          );
        } catch (err) {
          notifyError(err);
          dispatch(actions.loadIssue());
        }
      };
    },
    toggleVote: function (
      voted: boolean,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        dispatch(dispatchActions.setVoted(voted));
        usage.trackEvent(
          ANALYTICS_ISSUE_PAGE,
          `Vote: ${voted ? 'voted' : 'unvoted'}`,
        );

        try {
          await api.issue.updateIssueVoted(issue.id, voted);
        } catch (err) {
          notifyError(err);
          dispatch(dispatchActions.setVoted(!voted));
        }
      };
    },
    toggleStar: function (
      starred: boolean,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const {issue} = getState()[stateFieldName];
        dispatch(dispatchActions.setStarred(starred));

        try {
          await api.issue.updateIssueStarred(issue.id, starred);
        } catch (err) {
          notifyError(err);
          dispatch(dispatchActions.setStarred(!starred));
        }
      };
    },
    onOpenTagsSelect: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => void {
      return (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Open Tags select');
        dispatch(
          dispatchActions.openTagsSelect({
            multi: true,
            placeholder: i18n('Filter tags'),
            dataSource: async () => {
              const issueProjectId: string = issue.project.id;
              const [error, relevantProjectTags]: [CustomError | null, Tag[]] = await until(
                api.issueFolder.getProjectRelevantTags(issueProjectId),
              );
              return error ? [] : relevantProjectTags.filter((it: Tag) => {
                return it.id !== getState()?.app?.user?.profiles?.general?.star?.id;
              });
            },
            selectedItems: issue?.tags || [],
            getTitle: item => getEntityPresentation(item),
            onCancel: () => dispatch(actions.onCloseTagsSelect()),
            onSelect: async (tags: Tag[]) => {
              const [error, issueWithTags] = await until(
                api.issue.addTags(issue.id, tags),
              );
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
    deleteIssue: function (issueId: string): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
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
      actionSheet: ActionSheet,
      permissions: {
        canAttach: boolean;
        canEdit: boolean;
        canApplyCommand: boolean;
        canTag: boolean;
        canDeleteIssue: boolean;
      },
      switchToDetailsTab: () => any,
      renderLinkIssues?: () => any,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const api: Api = getApi();
        const issue: IssueFull = (getState()[stateFieldName] as IssueState).issue;
        const actionSheetActions = [
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
                .catch(() => {});
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
          issue.summary.length > 155
            ? `${issue.summary.substr(0, 153)}…`
            : issue.summary,
        );

        if (selectedAction && selectedAction.execute) {
          selectedAction.execute();
        }
      };
    },
    onShowCopyTextContextActions: function (
      actionSheet: ActionSheet,
      text: string,
      title?: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const selectedAction = await showActions(
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

        if (selectedAction && selectedAction.execute) {
          selectedAction.execute();
        }
      };
    },
    openNestedIssueView: function (
      params: OpenNestedViewParams,
    ): () => any | void {
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
    unloadIssueIfExist: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (dispatch: (arg0: any) => any, getState: StateGetter) => {
        const state = getState()[stateFieldName];

        if (state !== initialState) {
          dispatch(dispatchActions.unloadActiveIssueView());
        }
      };
    },
    openIssueListWithSearch: function (searchQuery: string): () => void {
      return () => {
        Router.Issues({
          searchQuery,
        });
      };
    },
    onTagRemove: function (
      tagId: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
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
          notifyError(err);
        }
      };
    },
    getCommandSuggestions: function (
      command: string,
      caret: number,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issueId: string = (getState()[stateFieldName] as IssueState).issueId;
        await commandDialogHelper
          .loadIssueCommandSuggestions([issueId], command, caret)
          .then((suggestions: CommandSuggestionResponse) => {
            suggestions &&
              dispatch(dispatchActions.receiveCommandSuggestions(suggestions));
          })
          .catch(() => {
            //
          });
      };
    },
    applyCommand: function (
      command: string,
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
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
    ): (dispatch: (arg0: any) => any) => Promise<void> {
      return async (dispatch: (arg0: any) => any) => {
        dispatch(receiveUserAppearanceProfile(userAppearanceProfile));
      };
    },
    uploadIssueAttach: function (
      files: NormalizedAttachment[],
    ): (dispatch: (arg0: any) => any, getState: StateGetter) => Promise<void> {
      return async (dispatch: (arg0: any) => any, getState: StateGetter) => {
        await dispatch(
          dispatchActions.uploadFile(files, (getState()[stateFieldName] as IssueState).issue),
        );
      };
    },
    cancelAddAttach: function (
      attach: Attachment,
    ): (dispatch: (arg0: any) => any) => Promise<void> {
      return async (dispatch: (arg0: any) => any) => {
        await dispatch(dispatchActions.cancelImageAttaching(attach));
      };
    },
    loadAttachments: function (): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
    ) => Promise<void> {
      return async (dispatch: (arg0: any) => any, getState: StateGetter) => {
        dispatch(
          actions.loadIssueAttachments((getState()[stateFieldName] as IssueState).issueId),
        );
      };
    },
    toggleVisibleAddAttachDialog: function (
      isVisible: boolean,
    ): (dispatch: (arg0: any) => any) => Promise<void> {
      return async (dispatch: (arg0: any) => any) => {
        dispatch(dispatchActions.toggleAttachFileDialog(isVisible));
      };
    },
    removeAttachment: function (
      attach: Attachment,
    ): (dispatch: (arg0: any) => any, getState: StateGetter) => Promise<void> {
      return async (dispatch: (arg0: any) => any, getState: StateGetter) => {
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
    ): (
      dispatch: (arg0: any) => any,
      getState: StateGetter,
      getApi: ApiGetter,
    ) => Promise<void> {
      return async (
        dispatch: (arg0: any) => any,
        getState: StateGetter,
        getApi: ApiGetter,
      ) => {
        const issueState: IssueFull = getState()[stateFieldName];
        const prevVisibility: Visibility = issueState.issue.visibility;
        usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Update visibility');

        try {
          const issueWithUpdatedVisibility: Visibility = await getApi().issue.updateVisibility(
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
          notifyError(err);
        }
      };
    },
    onCloseTagsSelect: function (): (dispatch: (arg0: any) => any) => void {
      return (dispatch: (arg0: any) => any) => {
        dispatch(
          dispatchActions.closeTagsSelect({
            selectProps: null,
            isTagsSelectVisible: false,
          }),
        );
      };
    },
  };
  return actions;
};
