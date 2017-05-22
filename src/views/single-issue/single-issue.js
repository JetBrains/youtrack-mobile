/* @flow */
import {Text, View, Image, TouchableOpacity, ScrollView, Platform, RefreshControl} from 'react-native';
import React, {PropTypes, Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {comment} from '../../components/icon/icon';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import IssueToolbar from '../../components/issue-toolbar/issue-toolbar';
import SingleIssueComments from './single-issue__comments';
import SingleIssueCommentInput from './single-issue__comment-input';
import SingleIssueTopPanel from './single-issue__top-panel';
import Header from '../../components/header/header';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import Wiki, {decorateRawText} from '../../components/wiki/wiki';
import {notifyError} from '../../components/notification/notification';
import {COLOR_PINK} from '../../components/variables/variables';
import usage from '../../components/usage/usage';
import IssueSummary from '../../components/issue-summary/issue-summary';
import CommandDialog from '../../components/command-dialog/command-dialog';
import styles from './single-issue.styles';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import * as issueActions from './single-issue-actions';
import type Api from '../../components/api/api';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {IssueFull, IssueOnList} from '../../flow/Issue';
import type {IssueComment} from '../../flow/CustomFields';

const CATEGORY_NAME = 'Issue';

type AdditionalProps = {
  api: Api,
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object
};

type SingleIssueProps = SingleIssueState & typeof issueActions & AdditionalProps;

class SingeIssueView extends Component<void, SingleIssueProps, void> {
  toolbarNode: Object;

  static contextTypes = {
    actionSheet: PropTypes.func
  };

  componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    this.props.setIssueId(this.props.issueId);
    this.props.loadIssue();
  }

  loadCommentSuggestions(query) {
    return this.props.api.getMentionSuggests([this.props.issueId], query)
      .catch(err => notifyError('Cannot load suggestions', err));
  }

  _canAddComment() {
    const {fullyLoaded, addCommentMode, issue} = this.props;
    return fullyLoaded && !addCommentMode && this.props.issuePermissions.canCommentOn(issue);
  }

  _updateToolbarPosition(newY: number) {
    const MAX_SHIFT = -50;
    let marginTop = newY < 0 ? 0 : -newY;
    if (marginTop < MAX_SHIFT) {
      marginTop = MAX_SHIFT;
    }
    this.toolbarNode.setNativeProps({style: {marginTop}});
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
      fullyLoaded,
      isSavingEditedIssue,
      closeSingleIssue,
      saveIssueSummaryAndDescriptionChange,
      showIssueActions,
      stopEditingIssue
    } = this.props;

    const issueToShow = issue || issuePlaceholder;
    const title = <Text style={styles.headerText} selectable={true}>
      {issueToShow ? getReadableID(issueToShow) : `Loading...`}
    </Text>;

    if (!editMode) {
      return (
        <Header
          onBack={closeSingleIssue}
          leftButton={<Text>Back</Text>}
          rightButton={<Text style={fullyLoaded ? null : styles.disabledSaveButton}>More</Text>}
          onRightButtonClick={() => fullyLoaded && showIssueActions(this.context.actionSheet())}
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

  _renderToolbar() {
    const {issue, editMode, fullyLoaded, issuePermissions, startEditingIssue, attachImage, stopEditingIssue, toggleVote, toggleStar} = this.props;
    if (!fullyLoaded) {
      return;
    }
    const canUpdateGeneralInfo = issuePermissions.canUpdateGeneralInfo(issue);

    return (
      <IssueToolbar
        ref={node => this.toolbarNode = node}
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
    const {editMode, api, isSavingEditedIssue, summaryCopy, descriptionCopy, attachingImage, openIssueListWithSearch, openNestedIssueView} = this.props;
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
          <Text style={styles.summary}  selectable={true}>{issue.summary}</Text>

          {issue.links && <LinkedIssues links={issue.links} onIssueTap={openNestedIssueView}/>}

          {issue.description ? <Wiki
            style={styles.description}
            attachments={issue.attachments}
            imageHeaders={api.auth.getAuthorizationHeaders()}
            onIssueIdTap={issueId => openNestedIssueView(null, issueId)}
          >
            {decorateRawText(issue.description, issue.wikifiedDescription, issue.attachments)}
          </Wiki> : null}
        </View>}

        {issue.attachments ? <AttachmentsRow
          attachments={issue.attachments}
          attachingImage={attachingImage}
          imageHeaders={api.auth.getAuthorizationHeaders()}
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

  render() {
    const {
      issue,
      issuePlaceholder,
      addCommentMode,
      fullyLoaded,
      commentText,
      issuePermissions,
      updateIssueFieldValue,
      updateProject,
      hideCommentInput,
      setCommentText,
      addComment,
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
      commandIsApplying
    } = this.props;
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

          {!fullyLoaded && <View><Text style={styles.loading}>Loading...</Text></View>}

          {fullyLoaded && <View style={styles.commentsListContainer}>
            <SingleIssueComments
              comments={issue.comments}
              attachments={issue.attachments}
              imageHeaders={this.props.api.auth.getAuthorizationHeaders()}
              onReply={(comment: IssueComment) => {
                this.props.showCommentInput();
                this.props.startReply(comment.author.login);
              }}
              onCopyCommentLink={copyCommentUrl}
              onIssueIdTap={issueId => openNestedIssueView(null, issueId)}/>
          </View>}

          {Platform.OS == 'ios' && <KeyboardSpacer/>}
        </ScrollView>}

        {addCommentMode && <View>
          <SingleIssueCommentInput
            autoFocus={true}
            onBlur={hideCommentInput}
            initialText={commentText}
            onChangeText={setCommentText}
            onAddComment={addComment}

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
          api={this.props.api}
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
          />
        )}

        {Platform.OS == 'ios' && !addCommentMode && <KeyboardSpacer style={styles.keyboardSpacer}/>}
      </View>
    );
  }
}

const mapStateToProps = (state: {app: Object, singleIssue: SingleIssueState}, ownProps): SingleIssueState & AdditionalProps => {
  return {
    issuePermissions: state.app.issuePermissions,
    api: state.app.api,
    ...state.singleIssue,
    issuePlaceholder: ownProps.issuePlaceholder,
    issueId: ownProps.issueId
  };
};

const mapDispatchToProps = (dispatch) => {
  return {...bindActionCreators(issueActions, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(SingeIssueView);
