/* @flow */
import {Clipboard, Linking, Alert, Share, Platform} from 'react-native';
import * as types from './single-issue-action-types';
import ApiHelper from '../../components/api/api__helper';
import {notify, notifyError, resolveError} from '../../components/notification/notification';
import attachFile from '../../components/attach-file/attach-file';
import log from '../../components/log/log';
import Router from '../../components/router/router';
import {showActions} from '../../components/action-sheet/action-sheet';
import usage from '../../components/usage/usage';
import {initialState} from './single-issue-reducers';
import type {IssueFull, CommandSuggestionResponse} from '../../flow/Issue';
import type {CustomField, IssueProject, FieldValue, IssueComment} from '../../flow/CustomFields';
import type {IssueActivity, ActivityEnabledType} from '../../flow/Activity';
import type Api from '../../components/api/api';
import type {State as SingleIssueState} from './single-issue-reducers';
import {getEntityPresentation} from '../../components/issue-formatter/issue-formatter';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';
import {Activity} from '../../components/activity/activity__category';
import {checkVersion} from '../../components/feature/feature';
import {getStorageState, flushStoragePart} from '../../components/storage/storage';

const CATEGORY_NAME = 'Issue';

type ApiGetter = () => Api;
type StateGetter = () => {singleIssue: SingleIssueState};

export function setIssueId(issueId: string) {
  return {type: types.SET_ISSUE_ID, issueId};
}

export function startIssueRefreshing() {
  return {type: types.START_ISSUE_REFRESHING};
}

export function stopIssueRefreshing() {
  return {type: types.STOP_ISSUE_REFRESHING};
}

export function receiveIssue(issue: IssueFull) {
  return {type: types.RECEIVE_ISSUE, issue};
}

export function receiveComments(comments: Array<IssueComment>) {
  return {type: types.RECEIVE_COMMENTS, comments};
}

export function receiveActivityAPIAvailability(activitiesEnabled: boolean) {
  return {type: types.RECEIVE_ACTIVITY_API_AVAILABILITY, activitiesEnabled};
}

export function receiveActivityPage(activityPage: Array<IssueActivity>) {
  return {type: types.RECEIVE_ACTIVITY_PAGE, activityPage};
}

export function showCommentInput() {
  return {type: types.SHOW_COMMENT_INPUT};
}

export function hideCommentInput() {
  return {type: types.HIDE_COMMENT_INPUT};
}

export function startSubmittingComment() {
  return {type: types.START_SUBMITTING_COMMENT};
}

export function startReply(targetLogin: string) {
  return {type: types.START_SUBMITTING_COMMENT, comment: `@${targetLogin} `};
}

export function setCommentText(comment: string) {
  return {type: types.SET_COMMENT_TEXT, comment};
}

export function stopSubmittingComment() {
  return {type: types.STOP_SUBMITTING_COMMENT};
}

export function receiveComment(comment: Object) {
  return {type: types.RECEIVE_COMMENT, comment};
}

function updateComment(comment: IssueComment) {
  return {type: types.RECEIVE_UPDATED_COMMENT, comment};
}

function deleteCommentFromList(comment: IssueComment, activityId?: string) {
  return {type: types.DELETE_COMMENT, comment, activityId};
}

export function startImageAttaching(attachingImage: Object) {
  return {type: types.START_IMAGE_ATTACHING, attachingImage};
}

export function removeAttachingImage() {
  return {type: types.REMOVE_ATTACHING_IMAGE};
}

export function stopImageAttaching() {
  return {type: types.STOP_IMAGE_ATTACHING};
}

export function setIssueFieldValue(field: CustomField, value: FieldValue) {
  return {type: types.SET_ISSUE_FIELD_VALUE, field, value};
}

export function setProject(project: IssueProject) {
  return {type: types.SET_PROJECT, project};
}

export function startEditingIssue() {
  return {type: types.START_EDITING_ISSUE};
}

export function stopEditingIssue() {
  return {type: types.STOP_EDITING_ISSUE};
}

export function setIssueSummaryAndDescription(summary: string, description: string) {
  return {type: types.SET_ISSUE_SUMMARY_AND_DESCRIPTION, summary, description};
}

export function setIssueSummaryCopy(summary: string) {
  return {type: types.SET_ISSUE_SUMMARY_COPY, summary};
}

export function setIssueDescriptionCopy(description: string) {
  return {type: types.SET_ISSUE_DESCRIPTION_COPY, description};
}

export function startSavingEditedIssue() {
  return {type: types.START_SAVING_EDITED_ISSUE};
}

export function stopSavingEditedIssue() {
  return {type: types.STOP_SAVING_EDITED_ISSUE};
}

export function setVoted(voted: boolean) {
  return {type: types.SET_VOTED, voted};
}

export function setStarred(starred: boolean) {
  return {type: types.SET_STARRED, starred};
}

export function issueUpdated(issue: IssueFull) {
  return {type: types.ISSUE_UPDATED, issue};
}

export function resetIssueView() {
  return {type: types.RESET_SINGLE_ISSUE};
}

export function unloadActiveIssueView() {
  return {type: types.UNLOAD_ACTIVE_ISSUE_VIEW};
}

export function startLoadingCommentSuggestions() {
  return {type: types.START_LOADING_COMMENT_SUGGESTIONS};
}

export function stopLoadingCommentSuggestions() {
  return {type: types.STOP_LOADING_COMMENT_SUGGESTIONS};
}

export function receiveCommentSuggestions(suggestions: Object) {
  return {type: types.RECEIVE_COMMENT_SUGGESTIONS, suggestions};
}

export function openCommandDialog(initialCommand: string = '') {
  return {type: types.OPEN_COMMAND_DIALOG, initialCommand};
}

export function closeCommandDialog() {
  return {type: types.CLOSE_COMMAND_DIALOG};
}

export function receiveCommandSuggestions(suggestions: CommandSuggestionResponse) {
  return {type: types.RECEIVE_COMMAND_SUGGESTIONS, suggestions};
}

export function startApplyingCommand() {
  return {type: types.START_APPLYING_COMMAND};
}

export function stopApplyingCommand() {
  return {type: types.STOP_APPLYING_COMMAND};
}

export function loadIssueComments() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      const comments = await api.issue.getIssueComments(issueId);
      log.info(`Loaded ${comments.length} comments for "${issueId}" issue`);
      dispatch(receiveComments(comments));
    } catch (err) {
      dispatch({type: types.RECEIVE_COMMENTS_ERROR, error: err});
      notifyError(`Failed to load comments for "${issueId}"`, err);
    }
  };
}

export function saveIssueActivityEnabledTypes(enabledTypes: Array<Object>) {
  enabledTypes && flushStoragePart({issueActivitiesEnabledTypes: enabledTypes});
}

export function getIssueActivityAllTypes(): Array<ActivityEnabledType> {
  return Object.keys(Activity.ActivityCategories).map(
    (key) => Object.assign({id: key, name: Activity.CategoryPresentation[key]})
  );
}

export function getIssueActivitiesEnabledTypes(): Array<ActivityEnabledType> {
  let enabledTypes = getStorageState().issueActivitiesEnabledTypes || [];
  if (!enabledTypes.length) {
    enabledTypes = getIssueActivityAllTypes();
    saveIssueActivityEnabledTypes(enabledTypes);
  }
  return enabledTypes;
}

function getActivityCategories(categoryTypes) {
  return (categoryTypes || []).reduce(
    (list, category) => list.concat(Activity.ActivityCategories[category.id]), []
  );
}

export function loadActivitiesPage() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      log.info('Loading activities...');
      const enabledActivityTypes = getIssueActivitiesEnabledTypes();
      dispatch({
        type: types.RECEIVE_ACTIVITY_CATEGORIES,
        issueActivityTypes: getIssueActivityAllTypes(),
        issueActivityEnabledTypes: enabledActivityTypes
      });

      const activityCategories = getActivityCategories(enabledActivityTypes);
      const activityPage: Array<IssueActivity> = await api.issue.getActivitiesPage(issueId, activityCategories);
      log.info('Received activities', activityPage);
      dispatch(receiveActivityPage(activityPage));
    } catch (error) {
      dispatch({type: types.RECEIVE_ACTIVITY_ERROR, error: error});
      notifyError(`Failed to load activities for "${issueId}"`, error);
    }
  };
}

export function loadIssue() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      if (!issueId) {
        throw new Error('Attempt to load issue with no ID');
      }
      log.debug(`Loading issue "${issueId}"`);
      const issue = await api.issue.getIssue(issueId);
      log.info(`Issue "${issueId}" loaded`, {...issue, fields: 'CENSORED'});
      issue.fieldHash = ApiHelper.makeFieldHash(issue);

      dispatch(setIssueId(issue.id)); //Set issue ID again because first one could be readable like YTM-111
      dispatch(receiveIssue(issue));
      return issue;
    } catch (rawError) {
      const error = await resolveError(rawError);
      dispatch({type: types.RECEIVE_ISSUE_ERROR, error});
      notifyError('Failed to load issue', error);
    }
  };
}

export function isActivitiesAPIEnabled() {
  return checkVersion('2018.3');
}

export function loadIssueActivities() {
  return async (dispatch: (any) => any) => {
    const activitiesAPIEnabled = isActivitiesAPIEnabled();
    await dispatch(receiveActivityAPIAvailability(activitiesAPIEnabled));

    const loadActivities = activitiesAPIEnabled ? loadActivitiesPage : loadIssueComments;
    await dispatch(loadActivities());
  };
}

export function refreshIssue() {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    dispatch(startIssueRefreshing());
    log.debug(`About to refresh issue "${getState().singleIssue.issueId}"`);
    await Promise.all([
      await dispatch(loadIssue()),
      await dispatch(loadIssueActivities())
    ]);
    log.debug(`Issue "${getState().singleIssue.issueId}" has been refreshed`);
    dispatch(stopIssueRefreshing());
  };
}

export function saveIssueSummaryAndDescriptionChange() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {summaryCopy, descriptionCopy} = getState().singleIssue;

    dispatch(setIssueSummaryAndDescription(summaryCopy, descriptionCopy));
    dispatch(startSavingEditedIssue());

    try {
      const {issue} = getState().singleIssue;
      await api.issue.updateIssueSummaryDescription(issue);
      log.info(`Issue (${issue.id}) summary/description has been updated`);
      usage.trackEvent(CATEGORY_NAME, 'Update issue', 'Success');

      await dispatch(loadIssue());
      dispatch(stopEditingIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      await dispatch(loadIssue());
      notifyError('Failed to update issue', err);
    } finally {
      dispatch(stopSavingEditedIssue());
    }
  };
}

export function addComment(comment: Object) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    dispatch(startSubmittingComment());
    try {
      const createdComment = await api.issue.submitComment(issue.id, comment);
      log.info(`Comment added to issue ${issue.id}`);
      usage.trackEvent(CATEGORY_NAME, 'Add comment', 'Success');

      dispatch(receiveComment(createdComment));
      dispatch(hideCommentInput());

      if (isActivitiesAPIEnabled()) {
        dispatch(loadActivitiesPage());
      } else {
        dispatch(loadIssueComments());
      }
    } catch (err) {
      dispatch(showCommentInput());
      dispatch(setCommentText(comment.text));
      notifyError('Cannot post comment', err);
    } finally {
      dispatch(stopSubmittingComment());
    }
  };
}


export function startEditingComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch(setCommentText(comment.text));
    dispatch(showCommentInput());
    dispatch({type: types.SET_EDITING_COMMENT, comment});
  };
}

export function stopEditingComment() {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    dispatch(hideCommentInput());
    dispatch(setCommentText(''));
    dispatch({type: types.CLEAR_EDITING_COMMENT});
  };
}

export function submitEditedComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    dispatch(startSubmittingComment());

    try {
      const updatedComment = await getApi().issue.submitComment(issueId, comment);

      dispatch(updateComment(updatedComment));
      log.info(`Comment ${updatedComment.id} edited`);
      notify('Comment updated');
      dispatch(stopEditingComment());
      await dispatch(loadIssueActivities());
    } catch (err) {
      log.warn(`Edit comment failed`, err);
      notify('Cannot update comment');
    } finally {
      dispatch(stopSubmittingComment());
    }
  };
}

export function addOrEditComment(comment: IssueComment) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    const editingComment = getState().singleIssue.editingComment;
    if (editingComment) {
      dispatch(submitEditedComment({...editingComment, ...comment}));
    } else {
      dispatch(addComment(comment));
    }
  };
}

function toggleCommentDeleted(comment: IssueComment, deleted: boolean) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    try {
      dispatch(updateComment({...comment, deleted}));
      await getApi().issue.updateCommentDeleted(issueId, comment.id, deleted);
      log.info(`Comment ${comment.id} deleted state updated: ${deleted.toString()}`);
    } catch (err) {
      dispatch(updateComment({...comment}));
      notifyError(`Failed to ${deleted ? 'delete' : 'restore'} comment`, err);
    }
  };
}

export function deleteComment(comment: IssueComment) {
  return async (dispatch: (any) => any) => {
    return dispatch(toggleCommentDeleted(comment, true));
  };
}

export function restoreComment(comment: IssueComment) {
  return async (dispatch: (any) => any) => {
    return dispatch(toggleCommentDeleted(comment, false));
  };
}

export function deleteCommentPermanently(comment: IssueComment, activityId?: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;

    try {
      await new Promise((resolve, reject) => {
        Alert.alert(
          'Confirmation',
          'Delete comment permanently?',
          [
            {text: 'Cancel', style: 'cancel', onPress: reject},
            {text: 'OK', onPress: resolve}
          ],
          {cancelable: true}
        );
      });
    } catch (err) {
      log.log('Deletion confirmation declined');
    }

    try {
      dispatch(deleteCommentFromList(comment, activityId));
      log.info(`Comment ${comment.id} deleted forever`);
      await getApi().issue.deleteCommentPermanently(issueId, comment.id);
    } catch (err) {
      dispatch(loadIssue());
      notifyError(`Failed to delete comment`, err);
    }
  };
}

function attachImage(method: 'openCamera' | 'openPicker') {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    try {
      const attachingImage = await attachFile(method);
      if (!attachingImage) {
        return;
      }
      dispatch(startImageAttaching(attachingImage));

      try {
        await api.issue.attachFile(issue.id, attachingImage.url, attachingImage.name);
        log.info(`Image attached to issue ${issue.id}`);
        usage.trackEvent(CATEGORY_NAME, 'Attach image', 'Success');
      } catch (err) {
        notifyError('Cannot attach file', err);
        dispatch(removeAttachingImage());
      }
      dispatch(stopImageAttaching());
    } catch (err) {
      notifyError('ImagePicker error', err);
    }
  };
}

export function attachOrTakeImage(actionSheet: Object) {
  return async (dispatch: any => any) => {
    const actions = [
      {
        title: 'Take a photo…',
        execute: () => dispatch(attachImage('openCamera'))
      },
      {
        title: 'Choose from library…',
        execute: () => dispatch(attachImage('openPicker'))
      },
      {title: 'Cancel'}
    ];

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function updateIssueFieldValue(field: CustomField, value: FieldValue) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    usage.trackEvent(CATEGORY_NAME, 'Update field value');

    dispatch(setIssueFieldValue(field, value));
    const updateMethod = (...args) => {
      if (field.hasStateMachine) {
        return api.issue.updateIssueFieldEvent(...args);
      }
      return api.issue.updateIssueFieldValue(...args);
    };

    try {
      await updateMethod(issue.id, field.id, value);
      log.info('Field value updated', field, value);
      await dispatch(loadIssue());
      await dispatch(loadIssueActivities());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      const error = await resolveError(err);

      if (error.error_type === 'workflow' && error.error_workflow_type === 'require') {
        log.info('Workflow require received', error);
        dispatch(openCommandDialog(`${error.error_field} `));
      }

      notifyError('Failed to update issue field', error);
      dispatch(loadIssue());
    }
  };
}

export function updateProject(project: IssueProject) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    usage.trackEvent(CATEGORY_NAME, 'Update project');

    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    dispatch(setProject(project));

    try {
      await api.issue.updateProject(issue, project);
      log.info('Project updated');
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      notifyError('Failed to update issue project', err);
      dispatch(loadIssue());
    }
  };
}

export function toggleVote(voted: boolean) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    dispatch(setVoted(voted));
    try {
      await api.issue.updateIssueVoted(issue.id, voted);
    } catch (err) {
      notifyError('Cannot update "Voted"', err);
      dispatch(setVoted(!voted));
    }
  };
}

export function toggleStar(starred: boolean) {
  return async (
    dispatch: any => any,
    getState: StateGetter,
    getApi: ApiGetter
  ) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    dispatch(setStarred(starred));
    try {
      await api.issue.updateIssueStarred(issue.id, starred);
    } catch (err) {
      notifyError('Cannot update "Starred"', err);
      dispatch(setStarred(!starred));
    }
  };
}

function makeIssueWebUrl(api: Api, issue: IssueFull, commentId: ?string) {
  const commentHash = commentId ? `#comment=${commentId}` : '';
  return `${api.config.backendUrl}/issue/${issue.idReadable}${commentHash}`;
}

export function copyCommentUrl(comment: IssueComment) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;
    Clipboard.setString(makeIssueWebUrl(api, issue, comment.id));
    notify('Comment URL has been copied');
  };
}

export function showIssueActions(actionSheet: Object) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const {issue} = getState().singleIssue;

    const actions = [
      {
        title: 'Share…',
        execute: () => {
          const url = makeIssueWebUrl(api, issue);
          if (Platform.OS === 'ios') {
            Share.share({url});
          } else {
            Share.share({title: issue.summary, message: url}, {dialogTitle: 'Share issue URL'});
          }
          usage.trackEvent(CATEGORY_NAME, 'Copy issue URL');
        }
      },
      {
        title: 'Open issue in browser',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Open in browser');
          Linking.openURL(makeIssueWebUrl(api, issue));
        }
      },
      {
        title: 'Apply command…',
        execute: () => dispatch(openCommandDialog())
      },
      {title: 'Cancel'}
    ];

    const selectedAction = await showActions(actions, actionSheet);

    if (selectedAction && selectedAction.execute) {
      selectedAction.execute();
    }
  };
}

export function openNestedIssueView(issue: ?IssueFull, issueId: ?string) {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    if (!issue) {
      return Router.SingleIssue({issueId});
    }

    issue.fieldHash = ApiHelper.makeFieldHash(issue);
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  };
}

export function unloadIssueIfExist() {
  return async (dispatch: (any) => any, getState: StateGetter) => {
    const state = getState().singleIssue;
    if (state !== initialState) {
      dispatch(unloadActiveIssueView());
    }
  };
}

export function openIssueListWithSearch(query: string) {
  return () => {
    Router.IssueList({query});
  };
}

export function loadCommentSuggestions(query: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issue: IssueFull = getState().singleIssue.issue;
    dispatch(startLoadingCommentSuggestions());

    try {
      const suggestions = await api.issue.getMentionSuggests([issue.id], query);
      dispatch(receiveCommentSuggestions(suggestions));
    } catch (err) {
      notifyError('Failed to load comment suggestions', err);
    } finally {
      dispatch(stopLoadingCommentSuggestions());
    }
  };
}

export function loadCommandSuggestions(command: string, caret: number) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;
    const api: Api = getApi();

    try {
      const suggestionsRes = await api.getCommandSuggestions([issueId], command, caret);

      dispatch(receiveCommandSuggestions(suggestionsRes));
    } catch (err) {
      notifyError('Failed to load command suggestions', err);
    }
  };
}

export function applyCommand(command: string) {
  return async (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const issueId = getState().singleIssue.issueId;

    try {
      dispatch(startApplyingCommand());

      await getApi().applyCommand({issueIds: [issueId], command});

      notify('Command successfully applied');
      dispatch(closeCommandDialog());
      await dispatch(loadIssue());
      dispatch(issueUpdated(getState().singleIssue.issue));
    } catch (err) {
      notifyError('Failed to apply command', err);
    } finally {
      dispatch(stopApplyingCommand());
    }
  };
}

export function receiveCommentVisibilityOptions() {
  return {type: types.RECEIVE_VISIBILITY_OPTIONS};
}

export function onCloseSelect() {
  return {type: types.CLOSE_ISSUE_SELECT};
}

export function updateCommentWithVisibility(comment: IssueComment) {
  return {type: types.SET_COMMENT_VISIBILITY, comment};
}

export function onOpenCommentVisibilitySelect(comment: IssueComment) {
  return (dispatch: (any) => any, getState: StateGetter, getApi: ApiGetter) => {
    const api: Api = getApi();
    const issue: IssueFull = getState().singleIssue.issue;
    usage.trackEvent(CATEGORY_NAME, 'Open visibility select');
    const selectedItems = (
      comment &&
      comment.visibility &&
      [...(comment.visibility.permittedGroups || []), ...(comment.visibility.permittedUsers || [])]
    );

    dispatch({
      type: types.OPEN_ISSUE_SELECT,
      selectProps: {
        show: true,
        placeholder: 'Select user or group',
        dataSource: async () => {
          const options = await api.issue.getVisibilityOptions(issue.id);
          dispatch(receiveCommentVisibilityOptions());
          return [...(options.visibilityGroups || []), ...(options.visibilityUsers || [])];
        },

        selectedItems: selectedItems,
        getTitle: item => getEntityPresentation(item),
        onSelect: (selectedOption) => {
          dispatch(onCloseSelect());
          comment = comment || {};
          comment.visibility = IssueVisibility.toggleOption(comment.visibility, selectedOption);
          dispatch(updateCommentWithVisibility(comment));
          usage.trackEvent(CATEGORY_NAME, 'Visibility changed');
        }
      }
    });
  };
}
