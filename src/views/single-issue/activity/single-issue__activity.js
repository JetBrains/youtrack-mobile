/* @flow */

import React, {PureComponent} from 'react';
import {View, ScrollView} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import IssueVisibility from '../../../components/visibility/issue-visibility';
import KeyboardSpacerIOS from '../../../components/platform/keyboard-spacer.ios';
import Select from '../../../components/select/select';
import SingleIssueActivities from './single-issue__activities-stream';
import IssueActivitiesSettings from './single-issue__activities-settings';
import SingleIssueCommentInput from '../single-issue__comment-input';
import ErrorMessage from '../../../components/error-message/error-message';

import * as activityActions from './single-issue-activity__actions';
import * as activityCommentActions from './single-issue-activity__comment-actions';
import {attachmentActions} from '../single-issue__attachment-actions-and-types';

import {getApi} from '../../../components/api/api__instance';
import {isActivitiesAPIEnabled, convertCommentsToActivityPage} from './single-issue-activity__helper';
import {createActivitiesModel} from '../../../components/activity/activity__create-model';
import {groupActivities} from '../../../components/activity/activity__group-activities';
import {isActivityCategory} from '../../../components/activity/activity__category';
import {mergeActivities} from '../../../components/activity/activity__merge-activities';

import styles from './single-issue-activity.styles';

import PropTypes from 'prop-types';

import type {ActivityItem} from '../../../flow/Activity';
import type {IssueComment} from '../../../flow/CustomFields';
import type {State as IssueActivityState} from './single-issue-activity__reducers';
import type {State as IssueCommentActivityState} from './single-issue-activity__comment-reducers';
import type {User, UserAppearanceProfile} from '../../../flow/User';

type IssueActivityProps = $Shape<IssueActivityState
  & typeof activityActions
  & IssueCommentActivityState
  & typeof activityCommentActions
  & typeof attachmentActions
  & {
  canAttach: boolean,
  onAttach: () => any
}>;

export class IssueActivity extends PureComponent<IssueActivityProps, void> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  backendUrl = getApi().config.backendUrl;
  imageHeaders = getApi().auth.getAuthorizationHeaders();
  props: IssueActivityProps;

  componentDidMount() {
    this.loadIssueActivities();
  }

  loadIssueActivities = () => {
    if (isActivitiesAPIEnabled()) {
      this.props.loadActivitiesPage();
    } else {
      this.props.loadIssueCommentsAsActivityPage();
    }
  };

  renderActivitySettings(disabled: boolean) {
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
    />;
  }

  getUserAppearanceProfile(): UserAppearanceProfile | { naturalCommentsOrder: boolean } {
    const DEFAULT_USER_APPEARANCE_PROFILE = {naturalCommentsOrder: true};
    const {user} = this.props;
    return user?.profiles?.appearance || DEFAULT_USER_APPEARANCE_PROFILE;
  }

  getGroupedActivity(activityPage: Array<IssueActivity> = []) {
    return groupActivities(activityPage, {
      onAddActivityToGroup: (group, activity: IssueActivity) => {
        if (isActivityCategory.issueCreated(activity)) {
          group.hidden = true;
        }
      },
      onCompleteGroup: (group: Object) => {
        group.events = mergeActivities(group.events);
      }
    });
  }

  createActivityModel(activityPage: Array<ActivityItem> | null) {
    if (!activityPage) {
      return null;
    }

    const naturalCommentsOrder = this.getUserAppearanceProfile().naturalCommentsOrder;
    const groupedActivities = this.getGroupedActivity(activityPage);

    return createActivitiesModel(
      naturalCommentsOrder ? groupedActivities.reverse() : groupedActivities
    ) || [];
  }

  _renderActivities() {
    const {
      activityPage,
      issue,
      copyCommentUrl, openNestedIssueView, issuePermissions,
      startEditingComment,
      workTimeSettings, showIssueCommentActions,
      startReply,
      deleteComment,
      restoreComment,
      deleteCommentPermanently
    } = this.props;


    return (
      <View style={styles.activitiesContainer}>
        <SingleIssueActivities
          activities={this.createActivityModel(activityPage)}

          issueFields={issue?.fields}
          attachments={issue?.attachments}

          imageHeaders={this.imageHeaders}
          backendUrl={this.backendUrl}

          onReply={(comment: IssueComment) => startReply(comment.author.login)}
          onCopyCommentLink={copyCommentUrl}
          onIssueIdTap={issueId => openNestedIssueView({issueId})}

          canUpdateComment={comment => issuePermissions.canUpdateComment(issue, comment)}
          onStartEditing={startEditingComment}

          canDeleteComment={comment => issuePermissions.canDeleteComment(issue, comment)}

          canDeleteCommentPermanently={() => issuePermissions.canDeleteCommentPermanently(issue)}
          onDeleteComment={deleteComment}
          onDeleteCommentPermanently={deleteCommentPermanently}

          canRestoreComment={comment => issuePermissions.canRestoreComment(issue, comment)}
          onRestoreComment={restoreComment}

          workTimeSettings={workTimeSettings}

          onShowCommentActions={
            (comment) => {
              showIssueCommentActions(
                this.context.actionSheet(),
                comment
              );
            }
          }
          issuePermissions={issuePermissions}
        />
      </View>
    );
  }

  canAddComment() {
    const {issuePermissions, issue} = this.props;
    return issuePermissions.canCommentOn(issue);
  }

  onSubmitComment = (comment: Comment) => {
    const {addOrEditComment, activityPage, updateOptimisticallyActivityPage} = this.props;

    const currentUser: User = this.props.user;
    const commentActivity = [Object.assign(
      convertCommentsToActivityPage([comment])[0],
      {
        tmp: true,
        timestamp: Date.now(),
        author: currentUser,
      })];

    let newActivityPage = [].concat(activityPage);
    if (currentUser?.profiles?.appearance?.naturalCommentsOrder) {
      newActivityPage = newActivityPage.concat(commentActivity);
    } else {
      newActivityPage = commentActivity.concat(activityPage);
    }
    updateOptimisticallyActivityPage(newActivityPage);

    return addOrEditComment(comment);
  };

  renderEditCommentInput(focus: boolean) {
    const {
      commentText,
      setCommentText,
      loadCommentSuggestions,
      suggestionsAreLoading,
      commentSuggestions,
      editingComment,
      onOpenCommentVisibilitySelect,
      issuePermissions,
      issue,
      attachOrTakeImage,
      stopSubmittingComment
    } = this.props;
    const isSecured = !!editingComment && IssueVisibility.isSecured(editingComment.visibility);

    return <View>
      <SingleIssueCommentInput
        autoFocus={focus}
        initialText={commentText}
        onChangeText={setCommentText}
        onSubmitComment={this.onSubmitComment}

        editingComment={editingComment}
        onEditCommentVisibility={onOpenCommentVisibilitySelect}
        isSecured={isSecured}

        onRequestCommentSuggestions={loadCommentSuggestions}
        suggestionsAreLoading={suggestionsAreLoading}
        suggestions={commentSuggestions}

        canAttach={issuePermissions.canAddAttachmentTo(issue)}
        onAttach={() => attachOrTakeImage(this.context.actionSheet())}

        onCancel={stopSubmittingComment}
      />

      <KeyboardSpacerIOS top={98}/>
    </View>;
  }

  renderCommentVisibilitySelect() {
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

  renderRefreshControl = () => {
    return this.props.renderRefreshControl(this.loadIssueActivities);
  };

  render() {
    const {isSelectOpen, activitiesLoadingError} = this.props;
    const activitiesApiEnabled: boolean = isActivitiesAPIEnabled();
    const hasError: boolean = this.hasLoadingError();
    const activityLoaded: boolean = this.isActivityLoaded();
    const showLoading: boolean = !activityLoaded && !hasError;
    const isActivitySettingEnabled: boolean = (
      activitiesApiEnabled && !showLoading && !hasError && activityLoaded
    );

    return (
      <View style={styles.activities}>

        {isSelectOpen && this.renderCommentVisibilitySelect()}

        <ScrollView
          style={styles.issueContent}
          refreshControl={this.renderRefreshControl()}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
        >

          {!hasError && this.renderActivitySettings(!isActivitySettingEnabled)}

          {hasError && <ErrorMessage error={activitiesLoadingError}/>}

          {!hasError && this._renderActivities()}

        </ScrollView>

        {Boolean(this.canAddComment()) && this.renderEditCommentInput(false)}
      </View>
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
    ...bindActionCreators(activityCommentActions, dispatch),
    ...bindActionCreators(attachmentActions, dispatch),
    stopSubmittingComment: () => dispatch(activityCommentActions.stopEditingComment()),
    updateOptimisticallyActivityPage: (activityPage) => dispatch(activityActions.receiveActivityPage(activityPage))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueActivity);


