/* @flow */
import {Text, View, Image, TouchableOpacity, ScrollView, Clipboard, Platform, RefreshControl, Linking} from 'react-native';
import React, {PropTypes, Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import ApiHelper from '../../components/api/api__helper';
import {comment} from '../../components/icon/icon';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import IssueToolbar from '../../components/issue-toolbar/issue-toolbar';
import SingleIssueComments from './single-issue__comments';
import SingleIssueCommentInput from './single-issue__comment-input';
import SingleIssueTopPanel from './single-issue__top-panel';
import Router from '../../components/router/router';
import Header from '../../components/header/header';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import {showActions} from '../../components/action-sheet/action-sheet';
import Wiki, {decorateRawText} from '../../components/wiki/wiki';
import {notifyError, notify} from '../../components/notification/notification';
import {COLOR_PINK} from '../../components/variables/variables';
import usage from '../../components/usage/usage';
import IssueSummary from '../../components/issue-summary/issue-summary';
import styles from './single-issue.styles';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import * as issueActions from './single-issue-actions';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {State as SingleIssueState} from './single-issue-reducers';
import type {IssueFull, IssueOnList} from '../../flow/Issue';
import type {IssueComment} from '../../flow/CustomFields';

const CATEGORY_NAME = 'Issue';

class SingeIssueView extends Component {
  toolbarNode: Object;

  props: SingleIssueState & {
    issuePermissions: IssuePermissions,
    issuePlaceholder: IssueOnList | IssueFull
  };

  state: {};

  static contextTypes = {
    actionSheet: PropTypes.func
  };

  static defaultProps = {
    onUpdate: () => {}
  };

  componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    this.props.setIssueId(this.props.issueId);
    this.props.loadIssue();
  }

  goToIssue(issue) {
    issue.fieldHash = ApiHelper.makeFieldHash(issue);

    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id,
      api: this.props.api
    });
  }

  goToIssueById(issueId) {
    Router.SingleIssue({
      issueId: issueId,
      api: this.props.api
    });
  }

  openIssueListWithSearch(query) {
    Router.IssueList({auth: this.props.api.auth, query: query});
  }

  _makeIssueWebUrl(issue, commentId) {
    const {numberInProject, project} = this.props.issue;
    const commentHash = commentId ? `#comment=${commentId}` : '';
    return `${this.props.api.config.backendUrl}/issue/${project.shortName}-${numberInProject}${commentHash}`;
  }

  _showActions() {
    const {issue} = this.props;
    const actions = [
      {
        title: 'Copy issue URL',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Copy isue URL');
          Clipboard.setString(this._makeIssueWebUrl(issue));
          notify('Issue URL has been copied');
        }
      },
      {
        title: 'Open issue in browser',
        execute: () => {
          usage.trackEvent(CATEGORY_NAME, 'Open in browser');
          Linking.openURL(this._makeIssueWebUrl(issue));
        }
      },
      {title: 'Cancel'}
    ];

    return showActions(actions, this.context.actionSheet())
      .then(action => action.execute())
      .catch(err => {});
  }

  copyCommentUrl = (comment: IssueComment) => {
    Clipboard.setString(this._makeIssueWebUrl(this.props.issue, comment.id));
    notify('Comment URL has been copied');
  };

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
    const {issue, editMode, summaryCopy, isSavingEditedIssue, saveIssueSummaryAndDescriptionChange} = this.props;
    const title = <Text style={styles.headerText} selectable={true}>
      {issue ? `${issue.project.shortName}-${issue.numberInProject}` : `Loading...`}
    </Text>;

    if (!editMode) {
      const actionsAvailable = issue;

      return (
        <Header
          leftButton={<Text>Back</Text>}
          rightButton={<Text style={actionsAvailable ? null : styles.disabledSaveButton}>More</Text>}
          onRightButtonClick={() => actionsAvailable && this._showActions()}
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
        onBack={this.props.stopEditingIssue}
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

  _renderIssueView(issue) {
    const {editMode, isSavingEditedIssue, summaryCopy, descriptionCopy, attachingImage} = this.props;
    return (
      <View style={styles.issueViewContainer}>
        <SingleIssueTopPanel issue={issue} onTagPress={query => this.openIssueListWithSearch(query)}/>

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

          {issue.links && <LinkedIssues links={issue.links} onIssueTap={issue => this.goToIssue(issue)}/>}

          {issue.description ? <Wiki
            style={styles.description}
            attachments={issue.attachments}
            imageHeaders={this.props.api.auth.getAuthorizationHeaders()}
            onIssueIdTap={issueId => this.goToIssueById(issueId)}
          >
            {decorateRawText(issue.description, issue.wikifiedDescription, issue.attachments)}
          </Wiki> : null}
        </View>}

        {issue.attachments ? <AttachmentsRow
          attachments={issue.attachments}
          attachingImage={attachingImage}
          imageHeaders={this.props.api.auth.getAuthorizationHeaders()}
          onOpenAttachment={(type, name) => usage.trackEvent(CATEGORY_NAME, type === 'image' ? 'Showing image' : 'Open attachment by URL')}
        /> : null}
      </View>
    );
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isLoading}
      tintColor={COLOR_PINK}
      onRefresh={this.props.refreshIssue}
    />;
  }

  render() {
    const {issue, addCommentMode, fullyLoaded, commentText, issuePermissions, updateIssueFieldValue, updateProject, hideCommentInput, setCommentText, addComment} = this.props;
    return (
      <View style={styles.container} testID="issue-view">
        {this._renderHeader()}
        {this._renderToolbar()}

        {issue &&
        <ScrollView
          refreshControl={this._renderRefreshControl()}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onScroll={this._handleScroll}
          scrollEventThrottle={16}
        >
          {this._renderIssueView(issue)}

          {!fullyLoaded && <View><Text style={styles.loading}>Loading...</Text></View>}

          {fullyLoaded && <View style={styles.commentsListContainer}>
            <SingleIssueComments
              comments={issue.comments}
              attachments={issue.attachments}
              imageHeaders={this.props.api.auth.getAuthorizationHeaders()}
              onReply={(comment: IssueComment) => this.props.startReply(comment.author.login)}
              onCopyCommentLink={this.copyCommentUrl}
              onIssueIdTap={issueId => this.goToIssueById(issueId)}/>
          </View>}

          {Platform.OS == 'ios' && <KeyboardSpacer/>}
        </ScrollView>}

        {addCommentMode && <View>
          <SingleIssueCommentInput
            autoFocus={true}
            suggestionsDataSource={query => this.loadCommentSuggestions(query)}
            onBlur={hideCommentInput}
            initialText={commentText}
            onChangeText={setCommentText}
            onAddComment={addComment}
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
          onUpdate={updateIssueFieldValue}
          onUpdateProject={updateProject}/>}

        {Platform.OS == 'ios' && !addCommentMode && <KeyboardSpacer style={styles.keyboardSpacer}/>}
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    issuePermissions: state.app.issuePermissions,
    api: state.app.api,
    ...state.singleIssue,
    issueId: ownProps.issueId
  };
};

const mapDispatchToProps = (dispatch) => {
  return {...bindActionCreators(issueActions, dispatch)};
};

export default connect(mapStateToProps, mapDispatchToProps)(SingeIssueView);
