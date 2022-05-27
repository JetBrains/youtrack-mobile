/* @flow */

import React, {PureComponent} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import AddSpentTimeForm from './activity__add-spent-time';
import BottomSheetModal from '../../../components/modal-panel-bottom/bottom-sheet-modal';
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
import {ANALYTICS_ISSUE_STREAM_SECTION} from 'components/analytics/analytics-ids';
import {attachmentActions} from '../issue__attachment-actions-and-types';
import {addListenerGoOnline} from '../../../components/network/network-events';
import {bindActionCreatorsExt} from 'util/redux-ext';
import {convertCommentsToActivityPage, createActivityModel} from 'components/activity/activity-helper';
import {createActivityCommentActions} from './issue-activity__comment-actions';
import {createIssueActivityActions, receiveActivityPage} from './issue-activity__actions';
import {getApi} from 'components/api/api__instance';
import {HIT_SLOP} from '../../../components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown, IconClose} from 'components/icon/icon';
import {isIssueActivitiesAPIEnabled} from './issue-activity__helper';
import {isSplitView} from 'components/responsive/responsive-helper';
import {IssueContext} from '../issue-context';
import {logEvent} from 'components/log/log-helper';
import {SkeletonIssueActivities} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issue-activity.styles';

import type {Activity} from 'flow/Activity';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type {IssueComment} from 'flow/CustomFields';
import type {IssueContextData} from 'flow/Issue';
import type {Node} from 'react';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {Theme, UITheme} from 'flow/Theme';
import type {User, UserAppearanceProfile} from 'flow/User';
import type {WorkItem} from 'flow/Work';
import type {YouTrackWiki} from 'flow/Wiki';

type IssueActivityProps = $Shape<IssueActivityState
  & IssueCommentActivityState
  & typeof attachmentActions
  & {
  canAttach: boolean,
  onAttach: () => any,
  stateFieldName: string,
}>;

type State = {
  modalChildren: any,
  settingsVisible: boolean,
};

export class IssueActivity extends PureComponent<IssueActivityProps, State> {
  static contextTypes: any | { actionSheet: typeof Function } = {
    actionSheet: Function,
  };

  backendUrl: string = getApi().config.backendUrl;
  imageHeaders: { Authorization: string, 'User-Agent': string } = getApi().auth.getAuthorizationHeaders();
  issuePermissions: $Shape<IssuePermissions>;
  props: IssueActivityProps;
  issueContext: IssueContextData;
  goOnlineSubscription: EventSubscription;

  state: State = {
    modalChildren: null,
    settingsVisible: false,
  };

  constructor(props: IssueActivityProps) {
    super(props);
    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.load(this.props.issuePlaceholder.id);
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
      (prevProps.issuePlaceholder && this.props.issuePlaceholder && prevProps.issuePlaceholder.id !== this.props.issuePlaceholder.id)
    ) {
      this.load(this.props.issuePlaceholder.id);
    }
  }

  componentWillUnmount() {
    this.props.setEditingComment(null);
    this.goOnlineSubscription?.remove();
  }

  load = (issueId?: string) => {
    this.loadIssueActivities(false, issueId);
    this.loadDraftComment(issueId);
  };

  loadDraftComment: (() => any) = () => this.props.getDraftComment();

  loadIssueActivities = (doNotReset?: boolean, issueId?: string) => {
    if (isIssueActivitiesAPIEnabled()) {
      this.props.loadActivitiesPage(doNotReset, issueId);
    } else {
      this.props.loadIssueCommentsAsActivityPage();
    }
  };

  renderActivitySettings(disabled: boolean, uiTheme: UITheme): Node {
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
          onPress={() => this.setState({settingsVisible: true})}>
          <Text style={styles.settingsButtonText}>{i18n('Activity Settings')}</Text>
          <IconAngleDown size={19} color={uiTheme.colors.$icon}/>
        </TouchableOpacity>
        <BottomSheetModal
          height={310}
          snapPoint={310}
          isVisible={this.state.settingsVisible}
          onClose={() => this.setState({settingsVisible: false})}
        >
          <IssueActivitiesSettings
            disabled={disabled}
            style={styles.settings}
            issueActivityTypes={issueActivityTypes}
            issueActivityEnabledTypes={issueActivityEnabledTypes}
            onApply={(userAppearanceProfile: UserAppearanceProfile) => {
              if (userAppearanceProfile) {
                return updateUserAppearanceProfile(userAppearanceProfile);
              }
              this.loadIssueActivities();
            }}
            userAppearanceProfile={this.getUserAppearanceProfile()}
            uiTheme={uiTheme}
          />
        </BottomSheetModal>
      </>
    );
  }

  getUserAppearanceProfile(): UserAppearanceProfile | { naturalCommentsOrder: boolean } {
    const DEFAULT_USER_APPEARANCE_PROFILE = {naturalCommentsOrder: true};
    const {user} = this.props;
    return user?.profiles?.appearance || DEFAULT_USER_APPEARANCE_PROFILE;
  }

  _renderActivities(uiTheme: UITheme) {
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
    } = this.props;

    const youtrackWiki: YouTrackWiki = {
      backendUrl: this.backendUrl,
      imageHeaders: this.imageHeaders,
      onIssueIdTap: issueId => openNestedIssueView({issueId}),
    };

    const onWorkUpdate = async (workItem?: WorkItem): Function => {
      if (workItem) {
        await doUpdateWorkItem(workItem);
      }
      this.loadIssueActivities(true);
    };

    if (!activityPage && isLoading) {
      return <SkeletonIssueActivities/>;
    }

    return (
      <View style={styles.activitiesContainer}>
        <IssueActivityStream
          activities={createActivityModel(activityPage, this.getUserAppearanceProfile().naturalCommentsOrder)}
          attachments={issue?.attachments}
          actionSheet={this.context.actionSheet}
          issueFields={issue?.fields}
          issueId={issue?.id}
          uiTheme={uiTheme}
          workTimeSettings={workTimeSettings}
          youtrackWiki={youtrackWiki}
          onReactionSelect={onReactionSelect}
          currentUser={user}
          onWorkUpdate={onWorkUpdate}
          onWorkDelete={async (workItem: WorkItem) => {
            const isDeleted = await deleteWorkItem(workItem);
            if (isDeleted) {
              onWorkUpdate();
            }
          }}
          onWorkEdit={(work: WorkItem) => {
            logEvent({
              message: 'SpentTime: actions:update',
              analyticsId: ANALYTICS_ISSUE_STREAM_SECTION,
            });
            this.renderAddSpentTimePage(work);
          }}
          onCheckboxUpdate={(checked: boolean, position: number, comment: IssueComment) => (
            onCheckboxUpdate(checked, position, comment)
          )}
        />
      </View>
    );
  }

  canAddComment: (() => boolean) = () => this.issuePermissions.canCommentOn(this.props.issue);

  onSubmitComment: ((comment: IssueComment) => any) = async (comment: IssueComment) => {
    const {submitDraftComment, activityPage, updateOptimisticallyActivityPage} = this.props;

    const currentUser: User = this.props.user;
    const timestamp: number = Date.now();
    const commentActivity = Object.assign(
      convertCommentsToActivityPage([{...comment, created: timestamp}])[0],
      {
        tmp: true,
        timestamp: timestamp,
        author: currentUser,
      }
    );

    const newActivityPage: Array<Activity> = (activityPage || []).slice();
    newActivityPage.unshift(commentActivity);
    updateOptimisticallyActivityPage(newActivityPage);
    await submitDraftComment(comment);
  };

  renderEditCommentInput(): Node {
    const {editingComment, submitEditedComment, setEditingComment, stateFieldName} = this.props;
    return <>
      <IssueActivityStreamCommentEdit
        stateFieldName={stateFieldName}
        issueContext={this.issueContext}
        comment={editingComment}
        onCommentChange={
          (comment: IssueComment, isAttachmentChange: boolean) => (
            isAttachmentChange ? submitEditedComment(comment, isAttachmentChange) : Promise.resolve()
          )
        }
        onSubmitComment={
          async (comment: IssueComment) => {
            await submitEditedComment(comment, false);
            this.loadDraftComment();
          }
        }
        header={<TouchableOpacity
          style={styles.editCommentCloseButton}
          onPress={async () => {
            await setEditingComment(null);
            this.loadDraftComment();
          }}
        >
          <IconClose size={21} color={styles.link.color}/>
        </TouchableOpacity>}
      />
      <KeyboardSpacerIOS top={66}/>

    </>;
  }

  renderAddCommentInput(): Node {
    const {editingComment, issue, updateDraftComment, stateFieldName} = this.props;
    const canAddWork: boolean = (
      issue?.project?.plugins?.timeTrackingSettings?.enabled &&
      this.issuePermissions.canCreateWork(issue)
    );

    return <View>
      <IssueActivityCommentAdd
        stateFieldName={stateFieldName}
        comment={editingComment}
        onAddSpentTime={canAddWork ? this.renderAddSpentTimePage : null}
        onCommentChange={(comment: IssueComment) => updateDraftComment(comment)}
        onSubmitComment={this.onSubmitComment}
      />

      <KeyboardSpacerIOS top={66}/>
    </View>;
  }

  renderAddSpentTimePage: ((workItem?: WorkItem) => any) = (workItem?: WorkItem) => {
    const {issue} = this.props;
    const isSplitViewMode: boolean = isSplitView();
    const onHide = () => isSplitViewMode ? this.setState({modalChildren: null}) : Router.pop(true);
    const addSpentTimeForm: React$Element<typeof AddSpentTimeForm> = (
      <AddSpentTimeForm
        workItem={workItem}
        issue={issue}
        canCreateNotOwn={this.issuePermissions.canCreateWorkNotOwn(issue)}
        onAdd={() => this.loadIssueActivities(true)}
        onHide={onHide}
      />
    );

    if (isSplitViewMode) {
      this.setState({modalChildren: addSpentTimeForm});
    } else {
      Router.PageModal({children: addSpentTimeForm});
    }
  };

  renderCommentVisibilitySelect(): Node {
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
    return !!this.props.activitiesLoadingError || !!this.props.commentsLoadingError;
  }

  isActivityLoaded(): boolean {
    return !this.hasLoadingError() && (!!this.props.activityPage || !!this.props.tmpIssueComments);
  }

  renderRefreshControl: (() => any) = () => {
    return this.props.renderRefreshControl(() => this.loadIssueActivities(false, this.getCurrentIssueId()));
  };

  render(): Node {
    const {isVisibilitySelectShown, activitiesLoadingError, editingComment} = this.props;
    const activitiesApiEnabled: boolean = isIssueActivitiesAPIEnabled();
    const hasError: boolean = this.hasLoadingError();
    const activityLoaded: boolean = this.isActivityLoaded();
    const showLoading: boolean = !activityLoaded && !hasError;
    const isActivitySettingEnabled: boolean = (
      activitiesApiEnabled && !showLoading && !hasError && activityLoaded
    );

    return (
      <IssueContext.Consumer>
        {(issueContext: IssueContextData) => {
          this.issueContext = issueContext;
          this.issuePermissions = issueContext.issuePermissions;
          return <ThemeContext.Consumer>
            {(theme: Theme) => {
              return (
                <View style={styles.activities}>

                  {isVisibilitySelectShown && this.renderCommentVisibilitySelect()}

                  <ScrollView
                    refreshControl={this.renderRefreshControl()}
                    keyboardDismissMode="interactive"
                    keyboardShouldPersistTaps="handled"
                    scrollEventThrottle={16}
                  >

                    {!hasError && this.renderActivitySettings(!isActivitySettingEnabled, theme.uiTheme)}

                    {hasError && <ErrorMessage error={activitiesLoadingError}/>}

                    {!hasError && this._renderActivities(theme.uiTheme)}

                  </ScrollView>

                  {Boolean(this.canAddComment()) && !editingComment?.isEdit && this.renderAddCommentInput()}
                  {editingComment?.isEdit && this.renderEditCommentInput()}

                  {this.state.modalChildren && <ModalPortal
                    onHide={() => this.setState({modalChildren: null})}>
                    {this.state.modalChildren}
                  </ModalPortal>}
                </View>
              );
            }}
          </ThemeContext.Consumer>;
        }}
      </IssueContext.Consumer>
    );
  }
}

const mapStateToProps = (
  state: {
    app: Object,
    issueActivity: IssueActivityState,
    issueCommentActivity: IssueCommentActivityState
  },
  ownProps
): IssueActivityState & IssueCommentActivityState => {

  return {
    ...state.issueCommentActivity,
    ...state.issueActivity,
    ...ownProps,
    workTimeSettings: state.app.workTimeSettings,
    user: state.app.user,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const commentActions = createActivityCommentActions(ownProps.stateFieldName);
  return {
    ...bindActionCreatorsExt(createIssueActivityActions(ownProps.stateFieldName), dispatch),
    ...bindActionCreators(attachmentActions, dispatch),
    ...bindActionCreatorsExt(commentActions, dispatch),
    updateOptimisticallyActivityPage: (activityPage) => dispatch(receiveActivityPage(activityPage)),
    onGetCommentVisibilityOptions: () => dispatch(commentActions.getCommentVisibilityOptions()),
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(IssueActivity): any);


