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
import {notifyError} from '../../components/notification/notification';
import {COLOR_PINK} from '../../components/variables/variables';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';
import IssueSummary from '../../components/issue-summary/issue-summary';
import CommandDialog from '../../components/command-dialog/command-dialog';
import styles from './single-issue.styles';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import * as issueActions from './single-issue-actions';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {IssueFull, IssueOnList} from '../../flow/Issue';
import type {IssueComment} from '../../flow/CustomFields';
import Select from '../../components/select/select';

const CATEGORY_NAME = 'Issue';

type AdditionalProps = {
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,

  selectProps: Object,
  onOpenCommentVisibilitySelect: (any) => any,
  onCloseSelect: (any) => any,
};

type SingleIssueProps = SingleIssueState & typeof issueActions & AdditionalProps;

class SingeIssueView extends Component<SingleIssueProps, void> {
  toolbarNode: Object;

  static contextTypes = {
    actionSheet: PropTypes.func
  };

  componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    this.props.unloadIssueIfExist();
    this.props.setIssueId(this.props.issueId);
    this.props.loadIssue();
    this.props.loadIssueComments();
  }

  loadCommentSuggestions(query) {
    return getApi().getMentionSuggests([this.props.issueId], query)
      .catch(err => notifyError('Cannot load suggestions', err));
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
  }

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
          onRightButtonClick={() => issueLoaded && showIssueActions(this.context.actionSheet())}
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
        onRightButtonClick={canSave ? saveIssueSummaryAndDescriptionChange : () => {}}
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
  }

  _renderToolbar() {
    const {issue, editMode, issueLoaded, issuePermissions, startEditingIssue, attachImage, stopEditingIssue, toggleVote, toggleStar} = this.props;
    if (!issueLoaded) {
      return;
    }
    const canUpdateGeneralInfo = issuePermissions.canUpdateGeneralInfo(issue);

    return (
      <IssueToolbar
        ref={this.toolbarRef}
        canAttach={issuePermissions.canAddAttachmentTo(issue)}
        attachesCount={issue.attachments.length}
        onAttach={attachImage}

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

  _renderIssueView(issue: IssueFull | IssueOnList) {
    const {editMode, isSavingEditedIssue, summaryCopy, descriptionCopy, attachingImage, openIssueListWithSearch, openNestedIssueView} = this.props;
    return (
      <View style={styles.issueViewContainer}>
        <SingleIssueTopPanel issue={issue} onTagPress={openIssueListWithSearch}/>

        {editMode && <IssueSummary
              editable={!isSavingEditedIssue}
              summary={summaryCopy}
              showSeparator={false}
              description={descriptionCopy}
              onSummaryChange={this.props.setIssueSummaryCopy}
              onDescriptionChange={this.props.setIssueDescriptionCopy}
        />}

        {!editMode && <View>
          <Text style={styles.summary}  selectable={true} testID="issue-summary">{issue.summary}</Text>

          {issue.links && <LinkedIssues links={issue.links} onIssueTap={openNestedIssueView}/>}

          {issue.wikifiedDescription
          ? <Wiki
              backendUrl={getApi().auth.config.backendUrl}
              attachments={issue.attachments}
              imageHeaders={getApi().auth.getAuthorizationHeaders()}
              onIssueIdTap={issueId => openNestedIssueView(null, issueId)}
            >
              {issue.wikifiedDescription}
            </Wiki>
          : null}
        </View>}

        {issue.attachments ? <AttachmentsRow
          attachments={issue.attachments}
          attachingImage={attachingImage}
          imageHeaders={getApi().auth.getAuthorizationHeaders()}
          onImageLoadingError={err => {
            log.warn('onImageLoadingError', err.nativeEvent);
            this.props.refreshIssue();
          }}
          onOpenAttachment={(type, name) => usage.trackEvent(CATEGORY_NAME, type === 'image' ? 'Showing image' : 'Open attachment by URL')}
        /> : null}
      </View>
    );
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      tintColor={COLOR_PINK}
      onRefresh={this.props.refreshIssue}
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

  render() {
    const {
      issue,
      issuePlaceholder,
      addCommentMode,
      issueLoaded,
      commentsLoaded,
      commentsLoadingError,
      commentText,
      issuePermissions,
      updateIssueFieldValue,
      updateProject,
      hideCommentInput,
      setCommentText,
      addOrEditComment,
      copyCommentUrl,
      openNestedIssueView,

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

      startEditingComment,
      stopEditingComment,
      editingComment,

      deleteComment,
      restoreComment,
      deleteCommentPermanently,
      onOpenCommentVisibilitySelect,
      isSelectOpen
    } = this.props;

    const isSecured = this.props.issuePermissions.constructor.isSecured(editingComment);

    return (
      <View style={styles.container} testID="issue-view">
        {this._renderHeader()}
        {this._renderToolbar()}

        {(issue || issuePlaceholder) &&
        <ScrollView
          refreshControl={this._renderRefreshControl()}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onScroll={this._handleScroll}
          scrollEventThrottle={16}
        >
          {this._renderIssueView(issue || issuePlaceholder)}

          {(!issueLoaded || !commentsLoaded) && (
            <View><Text style={styles.loading}>Loading...</Text></View>
          )}

          {commentsLoadingError && (
            <View><Text style={styles.loading}>Failed to load comments.</Text></View>
          )}

          {issueLoaded && commentsLoaded && (
            <View style={styles.commentsListContainer}>
              <SingleIssueComments
                comments={issue.comments}
                attachments={issue.attachments}
                imageHeaders={getApi().auth.getAuthorizationHeaders()}
                backendUrl={getApi().config.backendUrl}
                onReply={(comment: IssueComment) => {
                  this.props.showCommentInput();
                  this.props.startReply(comment.author.login);
                }}
                onCopyCommentLink={copyCommentUrl}
                onIssueIdTap={issueId => openNestedIssueView(null, issueId)}

                canEditComment={comment => issuePermissions.canEditComment(issue, comment)}
                onStartEditing={startEditingComment}

                canDeleteComment={comment => issuePermissions.canDeleteComment(issue, comment)}
                canRestoreComment={comment => issuePermissions.canRestoreComment(issue, comment)}
                canDeleteCommentPermanently={comment => issuePermissions.canDeleteCommentPermanently(issue, comment)}
                onDeleteComment={deleteComment}
                onRestoreComment={restoreComment}
                onDeleteCommentPermanently={deleteCommentPermanently}
              />
            </View>
          )}

          {Platform.OS == 'ios' && <KeyboardSpacer/>}
        </ScrollView>}

        {addCommentMode && <View>
          <SingleIssueCommentInput
            autoFocus={true}
            onBlur={hideCommentInput}
            initialText={commentText}
            onChangeText={setCommentText}
            onSubmitComment={addOrEditComment}

            onCancelEditing={stopEditingComment}
            editingComment={editingComment}
            onEditCommentVisibility={onOpenCommentVisibilitySelect}
            isSecured={isSecured}

            onRequestCommentSuggestions={loadCommentSuggestions}
            suggestionsAreLoading={suggestionsAreLoading}
            suggestions={commentSuggestions}
          />

          {Platform.OS == 'ios' && <KeyboardSpacer style={styles.keyboardSpacer}/>}
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

        {Platform.OS == 'ios' && !addCommentMode && <KeyboardSpacer style={styles.keyboardSpacer}/>}

        {isSelectOpen && this._renderCommentVisibilitySelect()}
      </View>
    );
  }
}

const mapStateToProps = (state: {app: Object, singleIssue: SingleIssueState}, ownProps): SingleIssueState & AdditionalProps => {
  const isOnTop = Router._currentRoute.params.issueId === ownProps.issueId;

  return {
    issuePermissions: state.app.issuePermissions,
    ...state.singleIssue,
    issuePlaceholder: ownProps.issuePlaceholder,
    issueId: ownProps.issueId,

    selectProps: state.singleIssue.selectProps,
    onOpenCommentVisibilitySelect: state.singleIssue.onOpenCommentVisibilitySelect,
    onCloseSelect: state.singleIssue.onCloseSelect,
    ...(isOnTop ? {} : {addCommentMode: false})
  };
};

const mapDispatchToProps = (dispatch) => {
  return {...bindActionCreators(issueActions, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(SingeIssueView);
