import React, {PureComponent} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import AddSpentTimeForm from './activity__add-spent-time';
import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import ErrorMessage from 'components/error-message/error-message';
import IssueActivitiesSettings from './issue__activity-settings';
import IssueActivityCommentAdd from './issue__activity-comment-add';
import IssueActivityStream from './issue__activity-stream';
import IssueActivityStreamCommentEdit from './issue-activity__comment-edit';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Select from 'components/select/select';
import TipActivityActionAccessTouch from 'components/tip/tips/activity-touch-actions';
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {attachmentActions} from '../issue__attachment-actions-and-types';
import {addListenerGoOnline} from 'components/network/network-events';
import {bindActionCreatorsExt} from 'util/redux-ext';
import {
  convertCommentsToActivityPage,
  createActivityModel,
} from 'components/activity/activity-helper';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {
  createIssueActivityActions,
  receiveActivityPage,
} from './issue-activity__actions';
import {getApi} from 'components/api/api__instance';
import {guid} from 'util/util';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown, IconClose} from 'components/icon/icon';
import {isIssueActivitiesAPIEnabled} from './issue-activity__helper';
import {isSplitView} from 'components/responsive/responsive-helper';
import {IssueContext} from '../issue-context';
import {logEvent} from 'components/log/log-helper';
import {setDraftCommentData} from 'actions/app-actions';
import {SkeletonIssueActivities} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables';

import styles from './issue-activity.styles';

import type {Activity} from 'types/Activity';
import type {AnyIssue, IssueContextData} from 'types/Issue';
import type {EventSubscription} from 'react-native';
import type {IssueComment} from 'types/CustomFields';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {Theme, UITheme} from 'types/Theme';
import type {User, UserAppearanceProfile} from 'types/User';
import type {WorkItem} from 'types/Work';
import type {YouTrackWiki} from 'types/Wiki';
import {ContextMenuConfigItem} from 'types/MenuConfig';

type IssueActivityProps = Partial<
  IssueActivityState &
    IssueCommentActivityState &
    typeof attachmentActions & {
      canAttach: boolean;
      onAttach: () => any;
      stateFieldName: string;
      highlight?: {
        activityId: string;
        commentId?: string;
      };
    }
>;
type State = {
  modalChildren: any;
  settingsVisible: boolean;
};
export class IssueActivity extends PureComponent<IssueActivityProps, State> {
  static contextTypes: any = {
    actionSheet: Function,
  };
  backendUrl: string = getApi().config.backendUrl;
  imageHeaders: {
    Authorization: string;
    'User-Agent': string;
  } = getApi().auth.getAuthorizationHeaders();
  issuePermissions: Partial<IssuePermissions>;
  props: IssueActivityProps;
  issueContext: IssueContextData;
  goOnlineSubscription: EventSubscription;
  theme: Theme;
  state: State = {
    modalChildren: null,
    settingsVisible: false,
  };

  constructor(props: IssueActivityProps) {
    super(props);
    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.load(this.props.issuePlaceholder?.id);
    });
  }

  componentDidMount() {
    this.load(this.getCurrentIssueId());
  }

  getCurrentIssueId(): string {
    return this.props.issuePlaceholder?.id || this.props.issue?.id;
  }

  componentDidUpdate(prevProps: IssueActivityProps): void {
    if (
      (!prevProps.issuePlaceholder && this.props.issuePlaceholder) ||
      (prevProps.issuePlaceholder &&
        this.props.issuePlaceholder &&
        prevProps.issuePlaceholder.id !== this.props.issuePlaceholder.id)
    ) {
      this.load(this.props.issuePlaceholder.id);
    }
  }

  componentWillUnmount() {
    this.props.setEditingComment(null);
    this.goOnlineSubscription?.remove();
  }

  load = (issueId?: string) => {
    if (issueId) {
      this.loadIssueActivities(false, issueId);
      this.loadDraftComment();
    }
  };
  loadDraftComment = async () => {
    const draft: IssueComment | null = await this.props.getDraftComment();
    this.props.setEditingComment(draft);
  };
  loadIssueActivities = (doNotReset?: boolean, issueId?: string) => {
    if (isIssueActivitiesAPIEnabled()) {
      this.props.loadActivitiesPage(doNotReset, issueId);
    } else {
      this.props.loadIssueCommentsAsActivityPage();
    }
  };

  renderActivitySettings(disabled: boolean, uiTheme: UITheme): React.ReactNode {
    const {
      issueActivityTypes,
      issueActivityEnabledTypes,
      updateUserAppearanceProfile,
    } = this.props;
    return (
      <>
        <TouchableOpacity
          hitSlop={HIT_SLOP}
          disabled={disabled}
          style={styles.settingsButton}
          onPress={() =>
            this.setState({
              settingsVisible: true,
            })
          }
        >
          <Text style={styles.settingsButtonText}>
            {i18n('Activity Settings')}
          </Text>
          <IconAngleDown size={19} color={uiTheme.colors.$icon} />
        </TouchableOpacity>
        <BottomSheetModal
          height={310}
          snapPoint={310}
          isVisible={this.state.settingsVisible}
          onClose={() =>
            this.setState({
              settingsVisible: false,
            })
          }
        >
          <IssueActivitiesSettings
            disabled={disabled}
            issueActivityTypes={issueActivityTypes}
            issueActivityEnabledTypes={issueActivityEnabledTypes}
            onApply={(userAppearanceProfile: UserAppearanceProfile) => {
              if (userAppearanceProfile) {
                return updateUserAppearanceProfile(userAppearanceProfile);
              }

              this.loadIssueActivities(true);
            }}
            userAppearanceProfile={this.getUserAppearanceProfile()}
            uiTheme={uiTheme}
          />
        </BottomSheetModal>
      </>
    );
  }

  getUserAppearanceProfile():
    | UserAppearanceProfile
    | {
        naturalCommentsOrder: boolean;
      } {
    const DEFAULT_USER_APPEARANCE_PROFILE = {
      naturalCommentsOrder: true,
    };
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
      onIssueIdTap: issueId =>
        openNestedIssueView({
          issueId,
        }),
    };

    const onWorkUpdate = async (
      workItem?: WorkItem,
    ): ((...args: any[]) => any) => {
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
          this.getUserAppearanceProfile().naturalCommentsOrder,
        )}
        attachments={issue?.attachments}
        actionSheet={this.context.actionSheet}
        issueFields={issue?.fields}
        issueId={issue?.id}
        uiTheme={this.theme.uiTheme}
        workTimeSettings={workTimeSettings}
        youtrackWiki={youtrackWiki}
        onReactionSelect={onReactionSelect}
        currentUser={user}
        work={{
          onWorkUpdate,
          createContextActions: (workItem: WorkItem): ContextMenuConfigItem[] => {
            return [
              ...(issPermissions.canUpdateWork(issue as AnyIssue, workItem) ? [{
                actionTitle: i18n('Edit'),
                actionKey: guid(),
                execute: () => {
                  logEvent({
                    message: 'SpentTime: actions:update',
                    analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
                  });
                  this.renderAddSpentTimePage(workItem);
                },
              }] : []),
              ...(issPermissions.canDeleteWork(issue as AnyIssue, workItem) ? [{
                actionTitle: i18n('Delete'),
                actionKey: guid(),
                execute: async () => {
                  logEvent({
                    message: 'SpentTime: actions:delete',
                    analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
                  });
                  const isDeleted = await deleteWorkItem(workItem);
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
        renderHeader={() => {
          const hasError: boolean = this.hasLoadingError();

          if (hasError) {
            return <ErrorMessage error={this.props.activitiesLoadingError} />;
          } else {
            const activitiesApiEnabled: boolean = isIssueActivitiesAPIEnabled();
            const activityLoaded: boolean = this.isActivityLoaded();
            const showLoading: boolean = !activityLoaded && !hasError;
            const isActivitySettingEnabled: boolean =
              activitiesApiEnabled &&
              !showLoading &&
              !hasError &&
              activityLoaded;
            return this.renderActivitySettings(
              !isActivitySettingEnabled,
              this.theme.uiTheme,
            );
          }
        }}
        highlight={highlight}
      />
    );
  }

  canAddComment: () => boolean = () => this.issuePermissions.canCommentOn(this.props.issue);

  onSubmitComment: (comment: IssueComment) => any = async (comment: IssueComment) => {
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

  renderEditCommentInput(): React.ReactNode {
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
              style={styles.editCommentCloseButton}
              onPress={async () => {
                await setEditingComment(null);
                this.loadDraftComment();
              }}
            >
              <IconClose size={21} color={styles.link.color} />
            </TouchableOpacity>
          }
        />
        <KeyboardSpacerIOS top={66} />
      </>
    );
  }

  renderAddCommentInput(): React.ReactNode {
    const {
      editingComment,
      issue,
      updateDraftComment,
      stateFieldName,
    } = this.props;
    const canAddWork: boolean = (
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

        <KeyboardSpacerIOS top={66} />
      </View>
    );
  }

  renderAddSpentTimePage: (workItem?: WorkItem) => any = (
    workItem?: WorkItem,
  ) => {
    const {issue} = this.props;
    const isSplitViewMode: boolean = isSplitView();

    const onHide = () =>
      isSplitViewMode
        ? this.setState({
            modalChildren: null,
          })
        : Router.pop(true);

    const addSpentTimeForm: React.ReactElement<
      React.ComponentProps<typeof AddSpentTimeForm>,
      typeof AddSpentTimeForm
    > = (
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

  renderCommentVisibilitySelect(): React.ReactNode {
    const {selectProps, onCloseSelect} = this.props;
    return (
      <Select
        getTitle={item => item.name}
        onCancel={onCloseSelect}
        {...selectProps}
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

  renderRefreshControl: () => any = () => {
    return this.props.renderRefreshControl(() =>
      this.loadIssueActivities(false, this.getCurrentIssueId()),
    );
  };

  render(): React.ReactNode {
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
                  <View style={styles.activities}>
                    {isVisibilitySelectShown &&
                      this.renderCommentVisibilitySelect()}

                    <View style={styles.container}>
                      {!this.hasLoadingError() && this._renderActivities()}
                    </View>

                    {Boolean(this.canAddComment()) && !editingComment?.isEdit && this.renderAddCommentInput()}
                    {editingComment?.isEdit && this.renderEditCommentInput()}
                    <TipActivityActionAccessTouch canAddComment={this.canAddComment()}/>

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
                );
              }}
            </ThemeContext.Consumer>
          );
        }}
      </IssueContext.Consumer>
    );
  }
}

const mapStateToProps = (
  state: {
    app: Record<string, any>;
    issueActivity: IssueActivityState;
    issueCommentActivity: IssueCommentActivityState;
  },
  ownProps,
): IssueActivityState & IssueCommentActivityState => {
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
    ...bindActionCreatorsExt(
      createIssueActivityActions(ownProps.stateFieldName),
      dispatch,
    ),
    ...bindActionCreators(attachmentActions, dispatch),
    ...bindActionCreatorsExt(commentActions, dispatch),
    updateOptimisticallyActivityPage: (activityPage: Activity[]) => dispatch(receiveActivityPage(activityPage)),
    onGetCommentVisibilityOptions: () => dispatch(commentActions.getCommentVisibilityOptions()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueActivity);
