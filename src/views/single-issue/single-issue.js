/* @flow */
import {Text, View, Image, TouchableOpacity, ScrollView, Platform, RefreshControl, Modal} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {comment} from '../../components/icon/icon';
import {getApi} from '../../components/api/api__instance';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import IssueToolbar from '../../components/issue-toolbar/issue-toolbar';
import SingleIssueComments from './single-issue__comments';
import SingleIssueCommentInput from './single-issue__comment-input';
import SingleIssueTopPanel from './single-issue__top-panel';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import Wiki from '../../components/wiki/wiki';
import {COLOR_PINK} from '../../components/variables/variables';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';
import IssueSummary from '../../components/issue-summary/issue-summary';
import CommandDialog from '../../components/command-dialog/command-dialog';
import ErrorMessage from '../../components/error-message/error-message';
import styles from './single-issue.styles';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import * as issueActions from './single-issue-actions';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {IssueFull, IssueOnList} from '../../flow/Issue';
import type {IssueComment, Attachment} from '../../flow/CustomFields';
import Select from '../../components/select/select';
import IssueVisibility from '../../components/issue-visibility/issue-visibility';

import SingleIssueActivities from './single-issue__activities-stream';
import OpenScanButton from '../../components/scan/open-scan-button';

import SingleIssueActivitiesSettings from './single-issue__activities-settings';
import type {UserAppearanceProfile} from '../../flow/User';
import {receiveUserAppearanceProfile} from '../../actions/app-actions';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import Tags from '../../components/tags/tags';

const CATEGORY_NAME = 'Issue';

type AdditionalProps = {
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,

  selectProps: Object
};

type SingleIssueProps = SingleIssueState & typeof issueActions & AdditionalProps;

class SingeIssueView extends Component<SingleIssueProps, void> {
  toolbarNode: Object;
  imageHeaders = getApi().auth.getAuthorizationHeaders();
  backendUrl = getApi().config.backendUrl;

  static contextTypes = {
    actionSheet: PropTypes.func
  };

  async componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    await this.props.unloadIssueIfExist();
    await this.props.setIssueId(this.props.issueId);

    this.props.loadIssue();
    this.props.loadIssueActivities();
  }

  _onIssueIdTap(issueId) {
    this.props.openNestedIssueView(null, issueId);
  }

  _canAddComment() {
    const {issueLoaded, addCommentMode, issue} = this.props;
    return issueLoaded && !addCommentMode && this.props.issuePermissions.canCommentOn(issue);
  }

  _updateToolbarPosition(newY: number) {
    const MAX_SHIFT = -50;
    let marginTop = newY < 0 ? 0 : -newY;
    if (marginTop < MAX_SHIFT) {
      marginTop = MAX_SHIFT;
    }
    if (this.toolbarNode) {
      this.toolbarNode.setNativeProps({style: {marginTop}});
    }
  }

  _handleScroll = ({nativeEvent}) => {
    if (Platform.OS === 'ios') {
      this._updateToolbarPosition(nativeEvent.contentOffset.y);
    }
  };

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
          onRightButtonClick={() => issueLoaded && showIssueActions(this.context.actionSheet())}
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

  _renderLinks(issue: IssueFull | IssueOnList) {
    if (!issue.links || !issue.links.length) {
      return null;
    }
    return <LinkedIssues links={issue.links} onIssueTap={this.props.openNestedIssueView}/>;
  }

  _renderDescription(issue: IssueFull | IssueOnList) {
    const description: string = issue?.wikifiedDescription || issue.description;

    if (!description) {
      return null;
    }

    return <Wiki
      backendUrl={this.backendUrl}
      attachments={issue.attachments}
      imageHeaders={this.imageHeaders}
      onIssueIdTap={this._onIssueIdTap}
      title={issue.idReadable}
    >
      {description}
    </Wiki>;
  }

  _renderAttachments(attachments: Array<Attachment> | null) {
    if (!attachments || !attachments.length) {
      return null;
    }

    return (
      <View style={styles.attachments}>
        <AttachmentsRow
          attachments={attachments}
          attachingImage={this.props.attachingImage}
          imageHeaders={this.imageHeaders}
          onImageLoadingError={err => {
            log.warn('onImageLoadingError', err.nativeEvent);
            this.props.refreshIssue();
          }}
          onOpenAttachment={(type) => usage.trackEvent(
            CATEGORY_NAME,
            type === 'image' ? 'Showing image' : 'Open attachment by URL')}
        /></View>
    );
  }

  _renderIssueView(issue: IssueFull | IssueOnList) {
    const {editMode, isSavingEditedIssue, summaryCopy, descriptionCopy, openIssueListWithSearch} = this.props;
    return (
      <View style={styles.issueViewContainer}>

        <SingleIssueTopPanel
          created={issue.created}
          updated={issue.updated}
          reporter={issue.reporter}
          updater={issue.updater}
        />

        {editMode && <IssueSummary
          editable={!isSavingEditedIssue}
          summary={summaryCopy}
          showSeparator={false}
          description={descriptionCopy}
          onSummaryChange={this.props.setIssueSummaryCopy}
          onDescriptionChange={this.props.setIssueDescriptionCopy}
        />}

        {!editMode && <View>
          <Text style={styles.summary} selectable={true} testID="issue-summary">{issue.summary}</Text>

          <Tags
            style={styles.tags}
            tags={issue?.tags}
            onTagPress={openIssueListWithSearch}
            title={<Text style={styles.tagsTitle}>Tags: </Text>}
            showMore={true}
          />

          {this._renderLinks(issue)}
          {this._renderDescription(issue)}
        </View>}

        {this._renderAttachments(issue.attachments)}
      </View>
    );
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      tintColor={COLOR_PINK}
      onRefresh={() => {
        this.props.refreshIssue();
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
          style={styles.visibilitySelect}
          {...selectProps}
        />
      </Modal>
    );
  }

  _renderActivities() {
    const {
      activityPage,
      issue,
      copyCommentUrl, openNestedIssueView, issuePermissions,
      startEditingComment, deleteComment, restoreComment, deleteCommentPermanently,
      workTimeSettings,
      user
    } = this.props;

    return (
      <View style={styles.commentsListContainer}>
        <SingleIssueActivities
          activityPage={activityPage}
          naturalCommentsOrder={user.profiles.appearance.naturalCommentsOrder}

          issueFields={issue.fields}
          attachments={issue.attachments}

          imageHeaders={this.imageHeaders}
          backendUrl={this.backendUrl}

          onReply={(comment: IssueComment) => {
            this.props.showCommentInput();
            this.props.startReply(comment.author.login);
          }}
          onCopyCommentLink={copyCommentUrl}
          onIssueIdTap={issueId => openNestedIssueView(null, issueId)}

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
      <View style={styles.commentsListContainer}>
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
          onIssueIdTap={issueId => openNestedIssueView(null, issueId)}

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

  render() {
    const {
      issue,
      issuePlaceholder,
      addCommentMode,
      issueLoaded,
      issueLoadingError,
      refreshIssue,
      commentsLoaded,
      commentsLoadingError,
      commentText,
      issuePermissions,
      updateIssueFieldValue,
      updateProject,
      hideCommentInput,
      setCommentText,
      addOrEditComment,

      loadCommentSuggestions,
      suggestionsAreLoading,
      commentSuggestions,

      showCommandDialog,
      closeCommandDialog,
      commandSuggestions,
      loadCommandSuggestions,
      applyCommand,
      commandIsApplying,
      initialCommand,

      stopEditingComment,
      editingComment,

      onOpenCommentVisibilitySelect,
      isSelectOpen,

      activitiesEnabled,
      activityLoaded,
      activitiesLoadingError,
      issueActivityTypes,
      issueActivityEnabledTypes,
      loadIssueActivities,
      user,
      updateUserAppearanceProfile
    } = this.props;

    const isSecured = !!editingComment && IssueVisibility.isSecured(editingComment.visibility);
    const activityLoading = {
      error: () => activitiesEnabled ? activitiesLoadingError : commentsLoadingError,
      success: () => activitiesEnabled ? activityLoaded : commentsLoaded,
    };
    const showLoading = () => (!issueLoaded || !activityLoading.success()) && !activityLoading.error();
    const isActivityLoaded = () => issueLoaded && activityLoading.success();

    return (
      <View style={styles.container} testID="issue-view">
        {this._renderHeader()}

        {issueLoaded && !issueLoadingError && this._renderToolbar()}

        {issueLoadingError && <ErrorMessage error={issueLoadingError} onTryAgain={refreshIssue}/>}

        {(issue || issuePlaceholder) && !issueLoadingError &&
        <ScrollView
          refreshControl={this._renderRefreshControl()}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onScroll={this._handleScroll}
          scrollEventThrottle={16}
        >
          {this._renderIssueView(issue || issuePlaceholder)}

          {showLoading() && (
            <View><Text style={styles.loading}>Loading...</Text></View>
          )}

          {commentsLoadingError && (
            <View><Text style={styles.loading}>Failed to load comments.</Text></View>
          )}

          {
            isActivityLoaded()
              ? (activitiesEnabled ? this._renderActivities() : this._renderComments())
              : null
          }
          {activitiesEnabled && !addCommentMode && isActivityLoaded() &&
          <SingleIssueActivitiesSettings
            issueActivityTypes={issueActivityTypes}
            issueActivityEnabledTypes={issueActivityEnabledTypes}
            onApply={(userAppearanceProfile: UserAppearanceProfile) => {
              if (userAppearanceProfile) {
                updateUserAppearanceProfile(userAppearanceProfile);
              }
              loadIssueActivities(); //TODO(xi-eye:performance): do not reload activityPage if only `naturalCommentsOrder` has changed, just reverse the model
            }}
            userAppearanceProfile={user.profiles.appearance}
          />}

          {Platform.OS === 'ios' && <KeyboardSpacer/>}
        </ScrollView>}

        {addCommentMode && <View>
          <SingleIssueCommentInput
            autoFocus={true}
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
        </View>}

        {this._canAddComment() && <View style={styles.addCommentContainer}>
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={this.props.showCommentInput}>
            <Image source={comment} style={styles.addCommentIcon}/>
          </TouchableOpacity>
        </View>}


        {issue && !addCommentMode && <CustomFieldsPanel
          api={getApi()}
          autoFocusSelect
          canEditProject={issuePermissions.canUpdateGeneralInfo(issue)}
          issue={issue}
          issuePermissions={issuePermissions}
          onUpdate={async (field, value) => await updateIssueFieldValue(field, value)}
          onUpdateProject={async (project) => await updateProject(project)}/>}

        {showCommandDialog && (
          <CommandDialog
            headerContent={getReadableID(issue)}
            suggestions={commandSuggestions}
            onCancel={closeCommandDialog}
            onChange={loadCommandSuggestions}
            onApply={applyCommand}
            isApplying={commandIsApplying}
            initialCommand={initialCommand}
          />
        )}

        {!addCommentMode && <KeyboardSpacerIOS/>}

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
