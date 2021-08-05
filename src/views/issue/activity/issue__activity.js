/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as activityActions from './issue-activity__actions';
import * as commentActions from './issue-activity__comment-actions';
import AddSpentTimeForm from './activity__add-spent-time';
import ErrorMessage from '../../../components/error-message/error-message';
import IssueActivitiesSettings from './issue__activity-settings';
import IssueActivityCommentAdd from './issue__activity-comment-add';
import IssueActivityStream from './issue__activity-stream';
import IssueActivityStreamCommentEdit from './issue-activity__comment-edit';
import IssuePermissions from '../../../components/issue-permissions/issue-permissions';
import KeyboardSpacerIOS from '../../../components/platform/keyboard-spacer.ios';
import Router from '../../../components/router/router';
import Select from '../../../components/select/select';
import {attachmentActions} from '../issue__attachment-actions-and-types';
import {convertCommentsToActivityPage, createActivityModel} from '../../../components/activity/activity-helper';
import {getApi} from '../../../components/api/api__instance';
import {IconClose} from '../../../components/icon/icon';
import {isIssueActivitiesAPIEnabled} from './issue-activity__helper';
import {IssueContext} from '../issue-context';
import {ThemeContext} from '../../../components/theme/theme-context';

import styles from './issue-activity.styles';

import type {IssueComment} from '../../../flow/CustomFields';
import type {IssueContextData} from '../../../flow/Issue';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {Theme, UITheme} from '../../../flow/Theme';
import type {User, UserAppearanceProfile} from '../../../flow/User';
import type {WorkItem} from '../../../flow/Work';
import type {YouTrackWiki} from '../../../flow/Wiki';
import type {Activity} from '../../../flow/Activity';

type IssueActivityProps = $Shape<IssueActivityState
  & typeof activityActions
  & IssueCommentActivityState
  & typeof attachmentActions
  & {
  canAttach: boolean,
  onAttach: () => any
}>;

export class IssueActivity extends PureComponent<IssueActivityProps, void> {
  static contextTypes: any | {actionSheet: typeof Function} = {
    actionSheet: Function,
  };

  backendUrl: string = getApi().config.backendUrl;
  imageHeaders: { Authorization: string, 'User-Agent': string } = getApi().auth.getAuthorizationHeaders();
  issuePermissions: $Shape<IssuePermissions>;
  props: IssueActivityProps;
  issueContext: IssueContextData;

  componentDidMount() {
    this.loadIssueActivities();
    this.loadDraftComment();
  }

  componentWillUnmount() {
    this.props.setEditingComment(null);
  }

  loadDraftComment = () => this.props.getDraftComment();

  loadIssueActivities: ((doNotReset?: boolean) => void) = (doNotReset?: boolean) => {
    if (isIssueActivitiesAPIEnabled()) {
      this.props.loadActivitiesPage(doNotReset);
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

    return <IssueActivitiesSettings
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
    />;
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
      doUpdateWorkItem
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
          onCheckboxUpdate={(checked: boolean, position: number, comment: IssueComment) => (
            onCheckboxUpdate(checked, position, comment)
          )}
        />
      </View>
    );
  }

  canAddComment = () => this.issuePermissions.canCommentOn(this.props.issue);

  onSubmitComment: ((comment: Comment) => any) = async (comment: IssueComment) => {
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

  renderEditCommentInput() {
    const {editingComment, submitEditedComment, setEditingComment} = this.props;
    return <>
      <IssueActivityStreamCommentEdit
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
      <KeyboardSpacerIOS top={98}/>

    </>;
  }

  renderAddCommentInput() {
    const {editingComment, issue, updateDraftComment} = this.props;
    const canAddWork: boolean = (
      issue?.project?.plugins?.timeTrackingSettings?.enabled &&
      this.issuePermissions.canCreateWork(issue)
    );

    return <View>
      <IssueActivityCommentAdd
        comment={editingComment}
        onAddSpentTime={canAddWork ? this.renderAddSpentTimePage : null}
        onCommentChange={(comment: IssueComment) => updateDraftComment(comment)}
        onSubmitComment={this.onSubmitComment}
      />

      <KeyboardSpacerIOS top={98}/>
    </View>;
  }

  renderAddSpentTimePage = () => {
    const {issue} = this.props;
    return Router.PageModal({
      children: <AddSpentTimeForm
        canCreateNotOwn={this.issuePermissions.canCreateWorkNotOwn(issue)}
        onAdd={() => this.loadIssueActivities(true)}
      />,
    });
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
    return this.props.renderRefreshControl(this.loadIssueActivities);
  };

  render() {
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
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(activityActions, dispatch),
    ...bindActionCreators(attachmentActions, dispatch),
    ...bindActionCreators(commentActions, dispatch),
    updateOptimisticallyActivityPage: (activityPage) => dispatch(activityActions.receiveActivityPage(activityPage)),
    onGetCommentVisibilityOptions: () => dispatch(commentActions.getCommentVisibilityOptions()),
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(IssueActivity): any);


