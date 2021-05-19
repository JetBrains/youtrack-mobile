/* @flow */

import type {Node} from 'React';
import React, {PureComponent} from 'react';
import {ScrollView, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as activityActions from './issue-activity__actions';
import * as commentActions from './issue-activity__comment-actions';
import AddSpentTimeForm from './activity__add-spent-time';
import ErrorMessage from '../../../components/error-message/error-message';
import IssueActivitiesSettings from './issue__activity-settings';
import IssueActivityStream from './issue__activity-stream';
import IssueCommentInput from '../issue__comment-input';
import IssuePermissions from '../../../components/issue-permissions/issue-permissions';
import KeyboardSpacerIOS from '../../../components/platform/keyboard-spacer.ios';
import Router from '../../../components/router/router';
import Select from '../../../components/select/select';
import {attachmentActions} from '../issue__attachment-actions-and-types';
import {convertCommentsToActivityPage, createActivityModel} from '../../../components/activity/activity-helper';
import {getApi} from '../../../components/api/api__instance';
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

  componentDidMount() {
    this.loadIssueActivities();
  }

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

  onSubmitComment: ((comment: Comment) => any) = (comment: Comment) => {
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

  renderEditCommentInput(uiTheme: UITheme) {
    const {
      loadCommentSuggestions,
      suggestionsAreLoading,
      commentSuggestions,
      editingComment,
      setEditingComment,
      onGetCommentVisibilityOptions,
      issue,
      attachOrTakeImage,
    } = this.props;
    const canAddWork: boolean = (
      issue?.project?.plugins?.timeTrackingSettings?.enabled &&
      this.issuePermissions.canCreateWork(issue)
    );

    return <View>
      <IssueCommentInput
        onCommentChange={(comment: IssueComment) => { updateDraftComment(comment); }}
        getCommentVisibilityOptions={onGetCommentVisibilityOptions}
        onSubmitComment={this.onSubmitComment}
        editingComment={editingComment}
        getCommentSuggestions={loadCommentSuggestions}
        suggestionsAreLoading={suggestionsAreLoading}
        mentions={commentSuggestions}
        canAttach={this.issuePermissions.canAddAttachmentTo(issue)}
        onAttach={() => attachOrTakeImage(this.context.actionSheet())}
        uiTheme={uiTheme}
        onAddSpentTime={canAddWork ? this.renderAddSpentTimePage : null}
        draftGetter={this.props.getDraftComment}
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

  render(): Node {
    const {isVisibilitySelectShown, activitiesLoadingError} = this.props;
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

                  {Boolean(this.canAddComment()) && this.renderEditCommentInput(theme.uiTheme)}
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


