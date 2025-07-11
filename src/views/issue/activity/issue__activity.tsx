import React, {PureComponent} from 'react';
import {TouchableOpacity, View} from 'react-native';

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as activityActions from './issue-activity__actions';
import AddSpentTimeForm from './activity__add-spent-time';
import ErrorMessage from 'components/error-message/error-message';
import IssueActivityCommentAdd from './issue__activity-comment-add';
import IssueActivityStream from './issue__activity-stream';
import IssueActivityStreamCommentEdit from './issue-activity__comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import KeyboardWrapper from 'components/keyboard-wrapper/keyboard-wrapper';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Select, {ISelectProps} from 'components/select/select';
import TipActivityActionAccessTouch from 'components/tip/tips/activity-touch-actions';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {attachmentActions} from '../issue__attachment-actions-and-types';
import {addListenerGoOnline} from 'components/network/network-events';
import {bindActionCreatorsExt} from 'util/redux-ext';
import {
  convertCommentsToActivityPage,
  createActivityModel,
} from 'components/activity/activity-helper';
import {CommentActions, createActivityCommentActions} from './issue-activity__comment-actions';
import {defaultTheme} from 'components/theme/theme';
import {getApi} from 'components/api/api__instance';
import {guid} from 'util/util';
import {HIT_SLOP, UNIT} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconClose} from 'components/icon/icon';
import {isIssueActivitiesAPIEnabled} from './issue-activity__helper';
import {isSplitView} from 'components/responsive/responsive-helper';
import {IssueContext} from '../issue-context';
import {issuePermissionsNull} from 'components/issue-permissions/issue-permissions-helper';
import {logEvent} from 'components/log/log-helper';
import {setDraftCommentData} from 'actions/app-actions';
import {SkeletonIssueActivities} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issue-activity.styles';

import type {Activity, ActivityItem} from 'types/Activity';
import type {AppState} from 'reducers';
import type {ContextMenuConfigItem} from 'types/MenuConfig';
import type {CustomError} from 'types/Error';
import type {EventSubscription} from 'react-native';
import type {IssueActivityActions} from './issue-activity__actions';
import type {IssueComment} from 'types/CustomFields';
import type {IssueContextData, IssueFull, IssueOnListExtended} from 'types/Issue';
import type {RequestHeaders} from 'types/Auth';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {Theme} from 'types/Theme';
import type {User, UserAppearanceProfile} from 'types/User';
import type {WorkItem} from 'types/Work';
import type {YouTrackWiki} from 'types/Wiki';

export const DEFAULT_USER_APPEARANCE_PROFILE = {
  naturalCommentsOrder: true,
};

type IssueActivityProps = IssueActivityState &
  IssueActivityActions &
  IssueCommentActivityState &
  CommentActions &
  typeof attachmentActions & {
    canAttach: boolean;
    onAttach: () => void;
    stateFieldName: keyof AppState;
    highlight?: {
      activityId: string;
      commentId?: string;
    };
    issuePermissions: IssuePermissions;
    updateOptimisticallyActivityPage: (activityPage: Activity[]) => void;
    selectProps: ISelectProps<unknown>;
  };

interface State {
  modalChildren: any;
}

export class IssueActivity extends PureComponent<IssueActivityProps, State> {
  backendUrl: string = getApi().config.backendUrl;
  imageHeaders: RequestHeaders = getApi().auth.getAuthorizationHeaders();
  issuePermissions: IssuePermissions = issuePermissionsNull;
  issueContext: IssueContextData;
  goOnlineSubscription: EventSubscription;
  theme: Theme = defaultTheme;
  state: State = {
    modalChildren: null,
  };

  constructor(props: IssueActivityProps) {
    super(props);
    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.load(this.getCurrentIssue());
    });
  }

  async componentDidMount() {
    await this.load(this.getCurrentIssue());
  }

  getCurrentIssueId(): string {
    return this.props.issuePlaceholder?.id || this.props.issue?.id;
  }

  getCurrentIssue() {
    return this.props.issuePlaceholder || this.props.issue;
  }

  async componentDidUpdate(prevProps: IssueActivityProps) {
    if (this.props.isLoading) {
      return;
    }

    const redirectedFromIssueToIssue =
      prevProps?.issue?.id !== this.props.issue?.id && this.props.activityPage === null;
    const isIssueOpenedFromList = !prevProps.issuePlaceholder && this.props.issuePlaceholder;
    const isRedirectedFromIssueToIssue =
      prevProps.issuePlaceholder &&
      this.props.issuePlaceholder &&
      prevProps.issuePlaceholder.id !== this.props.issuePlaceholder.id;

    if (redirectedFromIssueToIssue && this.props.activityPage === null) {
      await this.load(this.props.issue);
      return;
    } else if (isIssueOpenedFromList || isRedirectedFromIssueToIssue) {
      await this.load(this.getCurrentIssue());
    }
  }

  componentWillUnmount() {
    this.props.setEditingComment(null);
    this.goOnlineSubscription?.remove();
  }

  load = async (issue: IssueFull | IssueOnListExtended) => {
    if (issue?.id) {
      this.loadIssueActivities(false, issue.id);
      this.loadDraftComment();
    }
    if (issue?.project) {
      await this.props.setDefaultProjectTeam(issue.project);
    }
  };
  loadDraftComment = async () => {
    await this.props.setEditingComment(null);
    const draft = await this.props.getDraftComment();
    this.props.setEditingComment(draft);
  };
  loadIssueActivities = (doNotReset?: boolean, issueId?: string) => {
    if (isIssueActivitiesAPIEnabled()) {
      this.props.loadActivitiesPage(doNotReset, issueId, this.props.user?.profiles?.helpdesk?.isReporter);
    } else {
      this.props.loadIssueCommentsAsActivityPage();
    }
  };

  getUserAppearanceProfile(): UserAppearanceProfile | { naturalCommentsOrder: boolean; } {
    const {user} = this.props;
    return user?.profiles?.appearance || DEFAULT_USER_APPEARANCE_PROFILE;
  }

  _renderActivities() {
    const {
      activityPage,
      issue,
      openNestedIssueView,
      workTimeSettings,
      onReactionSelect,
      user,
      deleteWorkItem,
      onCheckboxUpdate,
      doUpdateWorkItem,
      isLoading,
      highlight,
    } = this.props;
    const youtrackWiki: YouTrackWiki = {
      backendUrl: this.backendUrl,
      imageHeaders: this.imageHeaders,
      onIssueIdTap: (issueId: string) => openNestedIssueView({issueId}),
    };

    const onWorkUpdate = async (workItem?: WorkItem) => {
      if (workItem) {
        await doUpdateWorkItem(workItem);
      }
      this.loadIssueActivities(true);
    };

    if (!activityPage && isLoading) {
      return <SkeletonIssueActivities marginTop={UNIT * 6} marginLeft={UNIT} />;
    }

    const issPermissions: IssuePermissions = this.issuePermissions;
    return (
      <IssueActivityStream
        activities={createActivityModel(
          activityPage,
          !!this.getUserAppearanceProfile().naturalCommentsOrder,
        )}
        attachments={issue?.attachments}
        actionSheet={this.context!.actionSheet}
        issueFields={issue?.fields}
        issueId={issue?.id}
        uiTheme={this.theme.uiTheme}
        workTimeSettings={workTimeSettings}
        youtrackWiki={youtrackWiki}
        onReactionSelect={onReactionSelect}
        currentUser={user}
        work={{
          onWorkUpdate,
          createContextActions: (workItem: WorkItem | ActivityItem): ContextMenuConfigItem[] => {
            const work = workItem as WorkItem;
            return [
              ...(issPermissions.canUpdateWork(issue, work) ? [{
                actionTitle: i18n('Edit'),
                actionKey: guid(),
                execute: () => {
                  logEvent({
                    message: 'SpentTime: actions:update',
                    analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
                  });
                  this.renderAddSpentTimePage(work);
                },
              }] : []),
              ...(issPermissions.canDeleteWork(issue, work) ? [{
                actionTitle: i18n('Delete'),
                actionKey: guid(),
                execute: async () => {
                  logEvent({
                    message: 'SpentTime: actions:delete',
                    analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
                  });
                  const isDeleted = await deleteWorkItem(work);
                  if (isDeleted) {
                    onWorkUpdate();
                  }
                },
              }] : [])];
          },
        }}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          comment: IssueComment,
        ) => onCheckboxUpdate(checked, position, comment)}
        refreshControl={this.renderRefreshControl}
        onUpdate={() => this.refresh(true)}
        renderHeader={() => {
          return this.hasLoadingError() ? (
            <ErrorMessage error={this.props.activitiesLoadingError as CustomError} />
          ) : null;
        }}
        highlight={highlight}
      />
    );
  }

  canAddComment = () => this.issuePermissions.canCommentOn(this.props.issue);

  onSubmitComment = async (comment: IssueComment) => {
    const {
      submitDraftComment,
      activityPage,
      updateOptimisticallyActivityPage,
    } = this.props;
    const currentUser: User = this.props.user;
    const timestamp: number = Date.now();
    const commentActivity = Object.assign(
      convertCommentsToActivityPage([{...comment, created: timestamp}])[0],
      {
        tmp: true,
        timestamp: timestamp,
        author: currentUser,
      },
    );
    const newActivityPage: Activity[] = (activityPage || []).slice();
    newActivityPage.unshift(commentActivity);
    updateOptimisticallyActivityPage(newActivityPage);
    await submitDraftComment(comment);
  };

  renderEditCommentInput() {
    const {
      editingComment,
      submitEditedComment,
      setEditingComment,
      stateFieldName,
    } = this.props;
    return (
      <>
        <IssueActivityStreamCommentEdit
          stateFieldName={stateFieldName}
          issueContext={this.issueContext}
          comment={editingComment}
          onCommentChange={async (
            comment: IssueComment,
            isAttachmentChange: boolean,
          ) => (
            isAttachmentChange
              ? await submitEditedComment(comment, isAttachmentChange)
              : Promise.resolve(comment)
          )}
          onSubmitComment={async (comment: IssueComment) => {
            await submitEditedComment(comment, false);
            this.loadDraftComment();
          }}
          header={
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              style={styles.editCommentCloseButton}
              onPress={async () => {
                await setEditingComment(null);
                this.loadDraftComment();
              }}
            >
              <IconClose size={16} color={styles.icon.color} />
            </TouchableOpacity>
          }
        />
      </>
    );
  }

  renderAddCommentInput() {
    const {
      editingComment,
      issue,
      updateDraftComment,
      stateFieldName,
    } = this.props;
    const canAddWork = (
      issue?.project?.plugins?.timeTrackingSettings?.enabled &&
      this.issuePermissions.canCreateWork(issue)
    );
    return (
      <View>
        <IssueActivityCommentAdd
          stateFieldName={stateFieldName}
          comment={editingComment}
          onAddSpentTime={canAddWork ? this.renderAddSpentTimePage : null}
          onCommentChange={async (comment: IssueComment) => await updateDraftComment(comment)}
          onSubmitComment={this.onSubmitComment}
        />
      </View>
    );
  }

  renderAddSpentTimePage = (workItem?: WorkItem) => {
    const {issue} = this.props;
    const isSplitViewMode: boolean = isSplitView();

    const onHide = () =>
      isSplitViewMode
        ? this.setState({
            modalChildren: null,
          })
        : Router.pop(true);

    const addSpentTimeForm = (
      <AddSpentTimeForm
        workItem={workItem}
        issue={issue}
        canCreateNotOwn={this.issuePermissions.canCreateWorkNotOwn(issue)}
        onAdd={() => this.loadIssueActivities(true)}
        onHide={onHide}
      />
    );

    if (isSplitViewMode) {
      this.setState({
        modalChildren: addSpentTimeForm,
      });
    } else {
      Router.PageModal({
        children: addSpentTimeForm,
      });
    }
  };

  renderCommentVisibilitySelect() {
    const {selectProps, onCloseSelect} = this.props;
    return (
      <Select
        {...selectProps}
        getTitle={item => item.name}
        onCancel={onCloseSelect}
      />
    );
  }

  hasLoadingError(): boolean {
    return (
      !!this.props.activitiesLoadingError || !!this.props.commentsLoadingError
    );
  }

  isActivityLoaded(): boolean {
    return (
      !this.hasLoadingError() &&
      (!!this.props.activityPage || !!this.props.tmpIssueComments)
    );
  }

  refresh = (reset: boolean = false) => {
    this.loadIssueActivities(reset, this.getCurrentIssueId());
  };

  renderRefreshControl = () => {
    return this.props.renderRefreshControl(this.refresh);
  };

  render() {
    const {isVisibilitySelectShown, editingComment} = this.props;
    return (
      <IssueContext.Consumer>
        {(issueContext: IssueContextData) => {
          this.issueContext = issueContext;
          this.issuePermissions = issueContext.issuePermissions;
          return (
            <ThemeContext.Consumer>
              {(theme: Theme) => {
                this.theme = theme;
                return (
                  <KeyboardWrapper>
                    <View style={styles.activities}>
                      {isVisibilitySelectShown && this.renderCommentVisibilitySelect()}

                        <View style={styles.container}>
                          <View>{!this.hasLoadingError() && this._renderActivities()}</View>
                        </View>

                        {Boolean(this.canAddComment()) && !editingComment?.isEdit && this.renderAddCommentInput()}
                        {editingComment?.isEdit && this.renderEditCommentInput()}
                        <TipActivityActionAccessTouch canAddComment={this.canAddComment()} />

                        {this.state.modalChildren && (
                          <ModalPortal
                            onHide={() =>
                              this.setState({
                                modalChildren: null,
                              })
                            }
                          >
                            {this.state.modalChildren}
                          </ModalPortal>
                        )}
                    </View>
                    </KeyboardWrapper>
                );
              }}
            </ThemeContext.Consumer>
          );
        }}
      </IssueContext.Consumer>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: IssueActivityProps) => {
  return {
    ...state.issueCommentActivity,
    ...state.issueActivity,
    ...ownProps,
    workTimeSettings: state.app.workTimeSettings,
    user: state.app.user,
  };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: IssueActivityProps) => {
  const commentActions = createActivityCommentActions(ownProps.stateFieldName);
  dispatch(setDraftCommentData(
    commentActions.updateDraftComment,
    commentActions.getDraftComment,
    ownProps?.issue
  ));
  return {
    ...bindActionCreatorsExt(activityActions.createIssueActivityActions(ownProps.stateFieldName), dispatch),
    ...bindActionCreators(attachmentActions, dispatch),
    ...bindActionCreatorsExt(commentActions, dispatch),
    updateOptimisticallyActivityPage: (activityPage: Activity[]) => {
      dispatch(activityActions.receiveActivityPage(activityPage));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueActivity);
