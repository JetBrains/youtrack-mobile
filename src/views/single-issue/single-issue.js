/* @flow */
import {
  Text,
  View,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {getApi} from '../../components/api/api__instance';
import IssueToolbar from '../../components/issue-toolbar/issue-toolbar';
import SingleIssueComments from './single-issue__comments';
import SingleIssueCommentInput from './single-issue__comment-input';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import {COLOR_DARK, COLOR_FONT_GRAY, COLOR_PINK} from '../../components/variables/variables';
import usage from '../../components/usage/usage';
import CommandDialog from '../../components/command-dialog/command-dialog';
import ErrorMessage from '../../components/error-message/error-message';
import styles from './single-issue.styles';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import * as issueActions from './single-issue-actions';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {TabRoute} from '../../flow/Issue';
import type {IssueComment} from '../../flow/CustomFields';
import Select from '../../components/select/select';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';

import SingleIssueActivities from './single-issue__activities-stream';
import OpenScanButton from '../../components/scan/open-scan-button';

import SingleIssueActivitiesSettings from './single-issue__activities-settings';
import type {UserAppearanceProfile} from '../../flow/User';
import {receiveUserAppearanceProfile} from '../../actions/app-actions';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import commentsStyles from './single-issue__comments.styles';

// $FlowFixMe: module throws on type check
import {TabView, TabBar} from 'react-native-tab-view';
import IssueDetails from './single-issue__details';

const CATEGORY_NAME = 'Issue';
const tabRoutes: Array<TabRoute> = [
  {key: 'details', title: 'Details'},
  {key: 'activity', title: 'Activity'},
];


type AdditionalProps = {
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,

  selectProps: Object
};

type SingleIssueProps = SingleIssueState & typeof issueActions & AdditionalProps;
type TabsState = {
  index: number,
  routes: Array<TabRoute>
};

class SingeIssueView extends Component<SingleIssueProps, TabsState> {
  static contextTypes = {
    actionSheet: PropTypes.func
  };

  toolbarNode: Object;
  imageHeaders = getApi().auth.getAuthorizationHeaders();
  backendUrl = getApi().config.backendUrl;
  activityLoaded: boolean;
  state = {
    index: 0,
    routes: tabRoutes,
  };

  async componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    await this.props.unloadIssueIfExist();
    await this.props.setIssueId(this.props.issueId);
    this.props.loadIssue();
  }

  renderDetailsTab() {
    const {
      loadIssue,
      openNestedIssueView,
      attachingImage,
      refreshIssue,
      issuePermissions,
      updateIssueFieldValue,
      updateProject,

      isSavingEditedIssue,
      summaryCopy,
      descriptionCopy,
      openIssueListWithSearch,
      setIssueSummaryCopy,
      setIssueDescriptionCopy,

      issue, issuePlaceholder, issueLoaded, addCommentMode, editMode
    } = this.props;

    const _issue = issue || issuePlaceholder;

    return (
      <IssueDetails
        loadIssue={loadIssue}
        openNestedIssueView={openNestedIssueView}
        attachingImage={attachingImage}
        refreshIssue={refreshIssue}

        issuePermissions={issuePermissions}
        updateIssueFieldValue={updateIssueFieldValue}
        updateProject={updateProject}

        issue={_issue}
        issuePlaceholder={issuePlaceholder}
        issueLoaded={issueLoaded}
        addCommentMode={addCommentMode}
        editMode={editMode}

        openIssueListWithSearch={openIssueListWithSearch}
        isSavingEditedIssue={isSavingEditedIssue}

        summaryCopy={summaryCopy}
        descriptionCopy={descriptionCopy}
        setIssueSummaryCopy={setIssueSummaryCopy}
        setIssueDescriptionCopy={setIssueDescriptionCopy}

        analyticCategory={CATEGORY_NAME}
        renderRefreshControl={this._renderRefreshControl.bind(this)}
      />
    );
  }

  loadActivity() {
    if (!this.activityLoaded) {
      this.props.loadIssueActivities();
      this.activityLoaded = true;
    }
  }

  renderActivityTab = () => {
    const {
      addCommentMode,
      issueLoaded,
      issueLoadingError,
      commentsLoaded,
      commentsLoadingError,
      activitiesEnabled,
      activityLoaded,
      activitiesLoadingError
    } = this.props;

    const activityLoading = {
      error: () => issueLoaded && (activitiesEnabled ? activitiesLoadingError : commentsLoadingError),
      success: () => issueLoaded && (activitiesEnabled ? activityLoaded : commentsLoaded),
    };
    const showLoading = () => (!issueLoaded || !activityLoading.success()) && !activityLoading.error();
    const isActivityLoaded = () => issueLoaded && activityLoading.success();

    if (!issueLoadingError) {
      return (
        <View style={{
          flexDirection: 'column',
          flex: 1
        }}>
          <ScrollView
            style={styles.issueContent}
            refreshControl={this._renderRefreshControl()}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
          >
            {showLoading() && <ActivityIndicator style={styles.loading}/>}

            {activityLoading.error() &&
            <View><Text style={styles.loadingActivityError}>Failed to load activities.</Text></View>}

            {activitiesEnabled && !addCommentMode && isActivityLoaded() && this._renderActivitySettings()}
            {
              isActivityLoaded()
                ? (activitiesEnabled ? this._renderActivities() : this._renderComments())
                : null
            }

          </ScrollView>

          {Boolean(!addCommentMode && this._canAddComment()) && this._renderEditCommentInput(false)}
          {Boolean(addCommentMode) && this._renderEditCommentInput(true)}
        </View>
      );
    }
  };

  renderTabBar() {
    return props => (
      <TabBar
        {...props}
        indicatorStyle={{backgroundColor: COLOR_PINK}}
        style={styles.tabsBar}
        renderLabel={({route, focused}) => (
          <Text style={{
            ...styles.tabLabel,
            color: focused ? COLOR_PINK : this.isTabChangeEnabled() ? COLOR_DARK : COLOR_FONT_GRAY
          }}>
            {route.title}
          </Text>
        )}
      />
    );
  }

  renderScene = ({route}) => {
    if (route.key === tabRoutes[0].key) {
      return this.renderDetailsTab();
    }
    return this.renderActivityTab();
  };

  isTabChangeEnabled() {
    const {editMode, addCommentMode, isSavingEditedIssue, isRefreshing, attachingImage} = this.props;
    return (
      !editMode && !addCommentMode && !isSavingEditedIssue && !isRefreshing && !attachingImage
    );
  }

  renderTabs() {
    const window = Dimensions.get('window');
    return (
      <TabView
        testID="issueTabs"
        lazy
        swipeEnabled={this.isTabChangeEnabled()}
        renderLazyPlaceholder={({route}) => (
          <View style={styles.tabLazyPlaceholder}>
            <Text>Loading {route.title}…</Text>
          </View>
        )}
        navigationState={this.state}
        renderScene={this.renderScene}
        initialLayout={{width: window.width, height: window.height}}
        renderTabBar={this.renderTabBar()}
        onIndexChange={index => {
          if (this.isTabChangeEnabled()) {
            index === 1 && this.loadActivity();
            this.setState({index});
          }
        }}
      />
    );
  }

  _canAddComment() {
    const {issueLoaded, addCommentMode, issue} = this.props;
    return issueLoaded && !addCommentMode && this.props.issuePermissions.canCommentOn(issue);
  }

  handleOnBack = () => {
    const returned = Router.pop();
    if (!returned) {
      Router.IssueList();
    }
  };

  onAttach = () => this.props.attachOrTakeImage(this.context.actionSheet());

  _renderHeader() {
    const {
      issue,
      issuePlaceholder,
      editMode,
      summaryCopy,
      issueLoaded,
      isSavingEditedIssue,
      saveIssueSummaryAndDescriptionChange,
      showIssueActions,
      stopEditingIssue
    } = this.props;

    const issueToShow = issueLoaded ? issue : issuePlaceholder;
    const title = <Text style={styles.headerText} selectable={true} testID="issue-id">
      {issueToShow ? getReadableID(issueToShow) : `Loading...`}
    </Text>;

    if (!editMode) {
      return (
        <Header
          leftButton={<Text>Back</Text>}
          rightButton={<Text style={issueLoaded ? null : styles.disabledSaveButton}>More</Text>}
          extraButton={<OpenScanButton/>}
          onRightButtonClick={() => this.state.index === 0 && issueLoaded && showIssueActions(this.context.actionSheet())}
          onBack={this.handleOnBack}
        >
          {title}
        </Header>
      );

    } else {
      const canSave = Boolean(summaryCopy) && !isSavingEditedIssue;
      const saveButton = <Text style={canSave ? null : styles.disabledSaveButton}>Save</Text>;

      return (
        <Header
          leftButton={<Text>Cancel</Text>}
          onBack={stopEditingIssue}
          rightButton={saveButton}
          onRightButtonClick={canSave ? saveIssueSummaryAndDescriptionChange : () => {
          }}
        >
          {title}
        </Header>
      );
    }
  }

  toolbarRef = (instance: ?IssueToolbar) => {
    if (instance) {
      this.toolbarNode = instance;
    }
  };

  _renderToolbar() {
    const {issue, editMode, issuePermissions, startEditingIssue, stopEditingIssue, toggleVote, toggleStar} = this.props;
    const canUpdateGeneralInfo = issuePermissions.canUpdateGeneralInfo(issue);

    return (
      <IssueToolbar
        ref={this.toolbarRef}
        canAttach={issuePermissions.canAddAttachmentTo(issue)}
        attachesCount={issue.attachments.length}
        onAttach={this.onAttach}

        canEdit={canUpdateGeneralInfo}
        onEdit={editMode ? stopEditingIssue : startEditingIssue}

        canVote={issuePermissions.canVote(issue)}
        votes={issue.votes}
        voted={issue.voters.hasVote}
        onVoteToggle={toggleVote}

        canStar={canUpdateGeneralInfo}
        starred={issue.watchers.hasStar}
        onStarToggle={toggleStar}
      />
    );
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      tintColor={COLOR_PINK}
      onRefresh={() => {
        this.props.refreshIssue(this.state.index > 0);
      }}
    />;
  }

  _renderCommentVisibilitySelect() {
    const {selectProps, onCloseSelect} = this.props;
    return (
      <Modal
        visible
        animationType="fade"
        onRequestClose={() => true}
      >
        <Select
          getTitle={item => item.name}
          onCancel={onCloseSelect}
          style={commentsStyles.visibilitySelect}
          {...selectProps}
        />
      </Modal>
    );
  }

  _getUserAppearanceProfile(): UserAppearanceProfile | { naturalCommentsOrder: boolean } {
    const DEFAULT_USER_APPEARANCE_PROFILE = {naturalCommentsOrder: true};
    const {user} = this.props;
    return user?.profiles?.appearance || DEFAULT_USER_APPEARANCE_PROFILE;
  }

  _renderActivities() {
    const {
      activityPage,
      issue,
      copyCommentUrl, openNestedIssueView, issuePermissions,
      startEditingComment, deleteComment, restoreComment, deleteCommentPermanently,
      workTimeSettings
    } = this.props;

    return (
      <View style={styles.activitiesContainer}>
        <SingleIssueActivities
          activityPage={activityPage}
          naturalCommentsOrder={this._getUserAppearanceProfile().naturalCommentsOrder}

          issueFields={issue.fields}
          attachments={issue.attachments}

          imageHeaders={this.imageHeaders}
          backendUrl={this.backendUrl}

          onReply={(comment: IssueComment) => {
            this.props.showCommentInput();
            this.props.startReply(comment.author.login);
          }}
          onCopyCommentLink={copyCommentUrl}
          onIssueIdTap={issueId => openNestedIssueView({issueId})}

          canUpdateComment={comment => issuePermissions.canUpdateComment(issue, comment)}
          onStartEditing={startEditingComment}

          canDeleteComment={comment => issuePermissions.canDeleteComment(issue, comment)}
          canRestoreComment={comment => issuePermissions.canRestoreComment(issue, comment)}
          canDeleteCommentPermanently={() => issuePermissions.canDeleteCommentPermanently(issue)}
          onDeleteComment={deleteComment}
          onRestoreComment={restoreComment}
          onDeleteCommentPermanently={(comment, activityId) => deleteCommentPermanently(comment, activityId)}

          workTimeSettings={workTimeSettings}
        />
      </View>
    );
  }

  _renderComments() {
    const {
      issue,
      copyCommentUrl, openNestedIssueView, issuePermissions,
      startEditingComment, deleteComment, restoreComment, deleteCommentPermanently,
      activitiesEnabled
    } = this.props;

    return (
      <View style={styles.activitiesContainer}>
        <SingleIssueComments
          comments={issue.comments}
          attachments={issue.attachments}
          imageHeaders={this.imageHeaders}
          backendUrl={this.backendUrl}
          onReply={(comment: IssueComment) => {
            this.props.showCommentInput();
            this.props.startReply(comment.author.login);
          }}
          onCopyCommentLink={copyCommentUrl}
          onIssueIdTap={issueId => openNestedIssueView({issueId})}

          canUpdateComment={comment => issuePermissions.canUpdateComment(issue, comment)}
          onStartEditing={startEditingComment}

          canDeleteComment={comment => issuePermissions.canDeleteComment(issue, comment)}
          canRestoreComment={comment => issuePermissions.canRestoreComment(issue, comment)}
          canDeleteCommentPermanently={() => issuePermissions.canDeleteCommentPermanently(issue)}
          onDeleteComment={deleteComment}
          onRestoreComment={restoreComment}
          onDeleteCommentPermanently={deleteCommentPermanently}

          activitiesEnabled={activitiesEnabled}
        />
      </View>
    );
  }

  _renderActivitySettings() {
    const {
      issueActivityTypes, issueActivityEnabledTypes, loadIssueActivities, updateUserAppearanceProfile
    } = this.props;

    return <SingleIssueActivitiesSettings
      issueActivityTypes={issueActivityTypes}
      issueActivityEnabledTypes={issueActivityEnabledTypes}
      onApply={(userAppearanceProfile: UserAppearanceProfile) => {
        if (userAppearanceProfile) {
          updateUserAppearanceProfile(userAppearanceProfile);
        }
        //TODO(xi-eye:performance): do not reload activityPage if only `naturalCommentsOrder` has changed, just reverse the model
        loadIssueActivities();
      }}
      userAppearanceProfile={this._getUserAppearanceProfile()}
    />;
  }

  _renderEditCommentInput(focus: boolean) {
    const {
      commentText,
      hideCommentInput,
      setCommentText,
      addOrEditComment,

      loadCommentSuggestions,
      suggestionsAreLoading,
      commentSuggestions,

      stopEditingComment,
      editingComment,

      onOpenCommentVisibilitySelect
    } = this.props;
    const isSecured = !!editingComment && IssueVisibility.isSecured(editingComment.visibility);

    return <View style={styles.issueCommentInputContainer}>
      <SingleIssueCommentInput
        autoFocus={focus}
        onBlur={hideCommentInput}
        initialText={commentText}
        onChangeText={setCommentText}
        onSubmitComment={comment => addOrEditComment(comment)}

        onCancelEditing={stopEditingComment}
        editingComment={editingComment}
        onEditCommentVisibility={onOpenCommentVisibilitySelect}
        isSecured={isSecured}

        onRequestCommentSuggestions={loadCommentSuggestions}
        suggestionsAreLoading={suggestionsAreLoading}
        suggestions={commentSuggestions}
      />

      <KeyboardSpacerIOS/>
    </View>;
  }

  _renderCommandDialog() {
    const {
      issue,
      closeCommandDialog,
      commandSuggestions,
      loadCommandSuggestions,
      applyCommand,
      commandIsApplying,
      initialCommand,
    } = this.props;

    return <CommandDialog
      headerContent={getReadableID(issue)}
      suggestions={commandSuggestions}
      onCancel={closeCommandDialog}
      onChange={loadCommandSuggestions}
      onApply={applyCommand}
      isApplying={commandIsApplying}
      initialCommand={initialCommand}
    />;
  }

  render() {
    const {
      issueLoaded,
      issueLoadingError,
      refreshIssue,
      showCommandDialog,
      isSelectOpen,
    } = this.props;

    const isIssueLoaded = Boolean(issueLoaded && !issueLoadingError);
    return (
      <View style={styles.container} testID="issue-view">
        {this._renderHeader()}

        {isIssueLoaded && this._renderToolbar()}

        {issueLoadingError && <ErrorMessage error={issueLoadingError} onTryAgain={refreshIssue}/>}

        {isIssueLoaded && this.renderTabs()}

        {showCommandDialog && this._renderCommandDialog()}

        {isSelectOpen && this._renderCommentVisibilitySelect()}
      </View>
    );
  }
}

const mapStateToProps = (state: { app: Object, singleIssue: SingleIssueState }, ownProps): SingleIssueState & AdditionalProps => {
  const isOnTop = Router._currentRoute.params.issueId === ownProps.issueId;

  return {
    issuePermissions: state.app.issuePermissions,
    ...state.singleIssue,
    issuePlaceholder: ownProps.issuePlaceholder,
    issueId: ownProps.issueId,

    selectProps: state.singleIssue.selectProps,
    ...(isOnTop ? {} : {addCommentMode: false}),

    workTimeSettings: state.app.workTimeSettings,

    user: state.app.user
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    ...{
      updateUserAppearanceProfile: (userAppearanceProfile: UserAppearanceProfile) => {
        return dispatch(
          receiveUserAppearanceProfile(userAppearanceProfile)
        );
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SingeIssueView);
