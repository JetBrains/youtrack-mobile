/* @flow */

import React, {PureComponent} from 'react';
import {Text, View, ScrollView} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import IssueVisibility from '../../../components/issue-visibility/issue-visibility';
import KeyboardSpacerIOS from '../../../components/platform/keyboard-spacer.ios';
import Select from '../../../components/select/select';
import SingleIssueActivities from './single-issue__activities-stream';
import SingleIssueActivitiesSettings from './single-issue__activities-settings';
import SingleIssueCommentInput from '../single-issue__comment-input';
import {getApi} from '../../../components/api/api__instance';

import * as activityActions from './single-issue-activity__actions';
import * as activityCommentActions from './single-issue-activity__comment-actions';
import * as activityImageAttachActions from './single-issue-activity__image-attach-actions';

import {isActivitiesAPIEnabled} from './single-issue-activity__helper';

import styles from './single-issue-activity.styles';

import PropTypes from 'prop-types';

import type {UserAppearanceProfile} from '../../../flow/User';
import type {IssueComment} from '../../../flow/CustomFields';
import type {State as IssueActivityState} from './single-issue-activity__reducers';
import type {State as IssueCommentActivityState} from './single-issue-activity__comment-reducers';

//TODO: understand why FlowJs throws
// property `activitiesEnabled/loadActivityPage/commentSuggestions/addComment`
// is missing in `*__actions.js but exists in State` without $Shape
type IssueActivityProps = $Shape<
  IssueActivityState
  & typeof activityActions
  & IssueCommentActivityState
  & typeof activityCommentActions
  & typeof activityImageAttachActions
  & {
  canAttach: boolean,
  onAttach: () => any
}
  >;

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

  loadIssueActivities() {
    if (isActivitiesAPIEnabled()) {
      this.props.loadActivitiesPage();
    } else {
      this.props.loadIssueCommentsAsActivityPage();
    }
  }

  renderActivitySettings() {
    const {
      issueActivityTypes,
      issueActivityEnabledTypes,
      updateUserAppearanceProfile,
    } = this.props;

    return <SingleIssueActivitiesSettings
      style={styles.settings}
      issueActivityTypes={issueActivityTypes}
      issueActivityEnabledTypes={issueActivityEnabledTypes}
      onApply={(userAppearanceProfile: UserAppearanceProfile) => {
        updateUserAppearanceProfile(userAppearanceProfile);

        //TODO(xi-eye:performance): do not reload activityPage if only `naturalCommentsOrder` has changed, just reverse the model
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
          activityPage={activityPage}
          naturalCommentsOrder={this.getUserAppearanceProfile().naturalCommentsOrder}

          issueFields={issue.fields}
          attachments={issue.attachments}

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

  renderEditCommentInput(focus: boolean) {
    const {
      commentText,
      setCommentText,
      addOrEditComment,

      loadCommentSuggestions,
      suggestionsAreLoading,
      commentSuggestions,

      editingComment,

      onOpenCommentVisibilitySelect,

      issuePermissions,
      issue,
      attachOrTakeImage
    } = this.props;
    const isSecured = !!editingComment && IssueVisibility.isSecured(editingComment.visibility);

    return <View>
      <SingleIssueCommentInput
        autoFocus={focus}
        initialText={commentText}
        onChangeText={setCommentText}
        onSubmitComment={comment => addOrEditComment(comment)}

        editingComment={editingComment}
        onEditCommentVisibility={onOpenCommentVisibilitySelect}
        isSecured={isSecured}

        onRequestCommentSuggestions={loadCommentSuggestions}
        suggestionsAreLoading={suggestionsAreLoading}
        suggestions={commentSuggestions}

        canAttach={issuePermissions.canAddAttachmentTo(issue)}
        onAttach={() => attachOrTakeImage(this.context.actionSheet())}
      />

      <KeyboardSpacerIOS/>
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

  render() {
    const {isSelectOpen} = this.props;
    const activitiesApiEnabled: boolean = isActivitiesAPIEnabled();
    const hasError: boolean = this.hasLoadingError();
    const activityLoaded: boolean = this.isActivityLoaded();
    const showLoading: boolean = !activityLoaded && !hasError;
    const showActivitySettings: boolean = (
      activitiesApiEnabled && !showLoading && !hasError && activityLoaded
    );

    return (
      <View style={styles.activities}>

        {isSelectOpen && this.renderCommentVisibilitySelect()}

        <ScrollView
          style={styles.issueContent}
          refreshControl={this.props.renderRefreshControl(() => this.loadIssueActivities())}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          scrollEventThrottle={16}
        >

          {hasError && <View><Text style={styles.loadingActivityError}>Failed to load activities.</Text></View>}

          {showActivitySettings && this.renderActivitySettings()}

          {activityLoaded && this._renderActivities()}

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
    ...bindActionCreators(activityImageAttachActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueActivity);


