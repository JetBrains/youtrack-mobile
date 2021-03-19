/* @flow */

import React, {PureComponent} from 'react';
import {View, ScrollView} from 'react-native';

import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as activityActions from './issue-activity__actions';
import * as activityCommentActions from './issue-activity__comment-actions';
import AddSpentTimeForm from './activity__add-spent-time';
import ErrorMessage from '../../../components/error-message/error-message';
import IssueActivitiesSettings from './issue__activity-settings';
import IssueActivityStream from './issue__activity-stream';
import IssueCommentInput from '../issue__comment-input';
import IssueVisibility from '../../../components/visibility/issue-visibility';
import KeyboardSpacerIOS from '../../../components/platform/keyboard-spacer.ios';
import Router from '../../../components/router/router';
import Select from '../../../components/select/select';
import {attachmentActions} from '../issue__attachment-actions-and-types';
import {convertCommentsToActivityPage, createActivityModel} from '../../../components/activity/activity-helper';
import {getApi} from '../../../components/api/api__instance';
import {getEntityPresentation} from '../../../components/issue-formatter/issue-formatter';
import {isIssueActivitiesAPIEnabled} from './issue-activity__helper';
import {ThemeContext} from '../../../components/theme/theme-context';

import styles from './issue-activity.styles';

import type {IssueComment} from '../../../flow/CustomFields';
import type {State as IssueActivityState} from './issue-activity__reducers';
import type {State as IssueCommentActivityState} from './issue-activity__comment-reducers';
import type {Theme, UITheme} from '../../../flow/Theme';
import type {User, UserAppearanceProfile} from '../../../flow/User';
import type {YouTrackWiki} from '../../../flow/Wiki';
import type {WorkItem} from '../../../flow/Work';

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
    actionSheet: PropTypes.func,
  };

  backendUrl = getApi().config.backendUrl;
  imageHeaders = getApi().auth.getAuthorizationHeaders();
  props: IssueActivityProps;

  componentDidMount() {
    this.loadIssueActivities();
  }

  loadIssueActivities = (doNotReset?: boolean) => {
    if (isIssueActivitiesAPIEnabled()) {
      this.props.loadActivitiesPage(doNotReset);
    } else {
      this.props.loadIssueCommentsAsActivityPage();
    }
  };

  renderActivitySettings(disabled: boolean, uiTheme: UITheme) {
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
      copyCommentUrl, openNestedIssueView, issuePermissions,
      startEditingComment,
      workTimeSettings,
      showIssueCommentActions,
      startReply,
      deleteComment,
      restoreComment,
      deleteCommentPermanently,
      onReactionSelect,
      user,
      deleteWorkItem,
    } = this.props;

    const youtrackWiki: YouTrackWiki = {
      backendUrl: this.backendUrl,
      imageHeaders: this.imageHeaders,
      onIssueIdTap: issueId => openNestedIssueView({issueId}),
    };

    const canUpdateComment = (comment: IssueComment) => issuePermissions.canUpdateComment(issue, comment);
    const canDeleteComment = (comment: IssueComment) => issuePermissions.canDeleteComment(issue, comment);
    const commentActions = {
      canCommentOn: issuePermissions.canCommentOn(issue),
      canUpdateComment: canUpdateComment,
      canDeleteComment: canDeleteComment,
      canDeleteCommentPermanently: issuePermissions.canDeleteCommentPermanently(issue),
      canRestoreComment: (comment: IssueComment) => issuePermissions.canRestoreComment(issue, comment),
      onReply: (comment: IssueComment) => (
        startReply(comment?.author?.login || getEntityPresentation(comment?.author))
      ),
      onCopyCommentLink: copyCommentUrl,
      onDeleteCommentPermanently: deleteCommentPermanently,
      onDeleteComment: deleteComment,
      onRestoreComment: restoreComment,
      onStartEditing: startEditingComment,
      onShowCommentActions: (comment: IssueComment) => showIssueCommentActions(
        this.context.actionSheet(),
        comment,
        canUpdateComment(comment),
        canDeleteComment(comment)
      ),
      isAuthor: (comment: IssueComment) => issuePermissions.isCurrentUser(comment?.author),
    };
    const onWorkUpdate = () => this.loadIssueActivities(true);

    return (
      <View style={styles.activitiesContainer}>
        <IssueActivityStream
          activities={createActivityModel(activityPage, this.getUserAppearanceProfile().naturalCommentsOrder)}
          attachments={issue?.attachments}
          commentActions={commentActions}
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
      }
    )];

    let newActivityPage = [].concat(activityPage);
    if (currentUser?.profiles?.appearance?.naturalCommentsOrder) {
      newActivityPage = newActivityPage.concat(commentActivity);
    } else {
      newActivityPage = commentActivity.concat(activityPage);
    }
    updateOptimisticallyActivityPage(newActivityPage);

    return addOrEditComment(comment);
  };

  renderEditCommentInput(focus: boolean, uiTheme: UITheme) {
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
      stopSubmittingComment,
    } = this.props;
    const isSecured: boolean = !!editingComment && IssueVisibility.isSecured(editingComment.visibility);
    const canAddWork: boolean = (
      issue?.project?.plugins?.timeTrackingSettings?.enabled &&
      issuePermissions.canCreateWork(issue)
    );

    return <View>
      <IssueCommentInput
        autoFocus={focus}
        initialText={commentText}
        onChangeText={setCommentText}
        onSubmitComment={this.onSubmitComment}

        editingComment={editingComment}
        onEditCommentVisibility={onOpenCommentVisibilitySelect}
        isSecured={isSecured}

        onRequestCommentSuggestions={loadCommentSuggestions}
        suggestionsAreLoading={suggestionsAreLoading}
        mentions={commentSuggestions}

        canAttach={issuePermissions.canAddAttachmentTo(issue)}
        onAttach={() => attachOrTakeImage(this.context.actionSheet())}

        onCancel={stopSubmittingComment}
        uiTheme={uiTheme}

        onAddSpentTime={canAddWork ? this.renderAddSpentTimePage : null}
      />

      <KeyboardSpacerIOS top={98}/>
    </View>;
  }

  renderAddSpentTimePage = () => {
    const {issue, issuePermissions} = this.props;
    return Router.PageModal({
      children: <AddSpentTimeForm
        canCreateNotOwn={issuePermissions.canCreateWorkNotOwn(issue)}
        onAdd={() => this.loadIssueActivities(true)}
      />,
    });
  };

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
    const {isVisibilitySelectShown, activitiesLoadingError} = this.props;
    const activitiesApiEnabled: boolean = isIssueActivitiesAPIEnabled();
    const hasError: boolean = this.hasLoadingError();
    const activityLoaded: boolean = this.isActivityLoaded();
    const showLoading: boolean = !activityLoaded && !hasError;
    const isActivitySettingEnabled: boolean = (
      activitiesApiEnabled && !showLoading && !hasError && activityLoaded
    );

    return (
      <ThemeContext.Consumer>
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

              {Boolean(this.canAddComment()) && this.renderEditCommentInput(false, theme.uiTheme)}
            </View>
          );
        }}
      </ThemeContext.Consumer>
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
    updateOptimisticallyActivityPage: (activityPage) => dispatch(activityActions.receiveActivityPage(activityPage)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueActivity);


