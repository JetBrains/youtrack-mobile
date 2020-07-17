/* @flow */

import {Text, View, ScrollView, TouchableOpacity} from 'react-native';
import React, {Component} from 'react';

import {getApi} from '../../components/api/api__instance';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';
import IssueSummary from '../../components/issue-summary/issue-summary';
import styles from './single-issue.styles';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import {
  getEntityPresentation,
  getReadableID,
  shortRelativeDate
} from '../../components/issue-formatter/issue-formatter';
import Tags from '../../components/tags/tags';
import {HIT_SLOP} from '../../components/common-styles/button';

import IssueDescription from './single-issue__description';
import IssueVotes from '../../components/issue-actions/issue-votes';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import VisibilityControl from '../../components/visibility/visibility-control';
import {SkeletonIssueContent, SkeletonIssueInfoLine} from '../../components/skeleton/skeleton';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {AnyIssue, IssueFull, IssueOnList} from '../../flow/Issue';
import type {Attachment, CustomField, FieldValue, IssueProject} from '../../flow/CustomFields';
import type {Visibility} from '../../flow/Visibility';


type Props = {
  loadIssue: () => any,
  openNestedIssueView: ({ issue?: IssueFull, issueId?: string }) => any,
  attachingImage: ?Object,
  refreshIssue: () => any,

  issuePermissions: IssuePermissions,
  updateIssueFieldValue: (field: CustomField, value: FieldValue) => any,
  updateProject: (project: IssueProject) => any,

  issue: IssueFull,
  issuePlaceholder: IssueOnList,
  issueLoaded: boolean,

  editMode: boolean,
  isSavingEditedIssue: boolean,
  summaryCopy: string,
  descriptionCopy: string,
  openIssueListWithSearch: (query: string) => any,
  setIssueSummaryCopy: (summary: string) => any,
  setIssueDescriptionCopy: (description: string) => any,

  analyticCategory: string,

  renderRefreshControl: () => any,

  onVoteToggle: (voted: boolean) => any,

  onSwitchToActivity: () => any,

  onRemoveAttachment: () => any,

  onVisibilityChange: (visibility: Visibility) => any
}

export default class IssueDetails extends Component<Props, void> {
  imageHeaders = getApi().auth.getAuthorizationHeaders();
  backendUrl = getApi().config.backendUrl;

  shouldComponentUpdate(nextProps: Props): boolean {
    if (nextProps.issue !== this.props.issue) {
      return true;
    }
    if (nextProps.editMode !== this.props.editMode) {
      return true;
    }
    if (nextProps.isSavingEditedIssue !== this.props.isSavingEditedIssue) {
      return true;
    }
    return false;
  }

  renderLinks(issue: IssueFull) {
    if (issue.links && issue.links.length) {
      return (
        <LinkedIssues
          links={issue.links}
          onIssueTap={(issue: IssueOnList) => this.props.openNestedIssueView({issue})}/>
      );
    }
  }

  renderAttachments(attachments: Array<Attachment> | null) {
    if (!attachments || !attachments.length) {
      return null;
    }

    const {onRemoveAttachment, issue, issuePermissions} = this.props;

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
          canRemoveAttachment={issuePermissions.canRemoveAttachment(issue)}
          onRemoveImage={onRemoveAttachment}
          onOpenAttachment={(type) => usage.trackEvent(
            this.props.analyticCategory,
            type === 'image' ? 'Showing image' : 'Open attachment by URL')}
        /></View>
    );
  }

  renderIssueVotes() {
    const {issue, issuePermissions, onVoteToggle} = this.props;

    if (issue?.votes && issue?.voters) {
      return (
        <IssueVotes
          canVote={issuePermissions.canVote(issue)}
          votes={issue.votes}
          voted={issue.voters.hasVote}
          onVoteToggle={onVoteToggle}
        />
      );
    }
  }

  renderAdditionalInfo() {
    const {issue} = this.props;

    return (
      issue
        ? <View style={[styles.issueTopPanel, styles.issueAdditionalInfo]}>
          <Text
            style={styles.issueTopPanelText}
            selectable={true}
          >
            Created by {getEntityPresentation(issue.reporter)} {shortRelativeDate(issue?.created) || ''}
          </Text>

          {issue.created !== issue.updated && (
            <Text
              style={[styles.issueTopPanelText, styles.topPanelUpdatedInformation]}
              selectable={true}
            >
              Updated by {getEntityPresentation(issue.updater)} {shortRelativeDate(issue?.updated) || ''}
            </Text>
          )}
        </View>
        : <SkeletonIssueInfoLine lines={2}/>
    );
  }

  renderIssueVisibility() {
    const {issue, onVisibilityChange} = this.props;

    if (issue) {
      return (
        <VisibilityControl
          style={styles.visibility}
          issueId={issue.id}
          visibility={issue.visibility}
          onSubmit={onVisibilityChange}
        />
      );
    }

    return <SkeletonIssueInfoLine/>;
  }

  renderIssueContent() {
    const {issue, openIssueListWithSearch, openNestedIssueView} = this.props;

    if (!issue) {
      return <SkeletonIssueContent/>;
    }

    return (
      <View>
        <Text
          style={styles.summary}
          selectable={true}
          testID="issue-summary">
          {issue.summary}
        </Text>

        <Tags
          style={styles.tags}
          multiline={true}
          tags={issue?.tags}
          onTagPress={openIssueListWithSearch}
        />

        {Boolean(issue?.tags?.length > 0) && <View style={styles.tagsSeparator}/>}

        {this.renderLinks(issue)}

        <IssueDescription
          style={styles.description}
          backendUrl={this.backendUrl}
          attachments={issue.attachments}
          imageHeaders={this.imageHeaders}
          onIssueIdTap={issueId => openNestedIssueView({issueId})}
          title={getReadableID(issue)}
          description={issue.wikifiedDescription}
        />
      </View>
    );
  }

  _renderIssueView() {
    const {
      issue,
      editMode,
      isSavingEditedIssue,
      summaryCopy,
      descriptionCopy,
    } = this.props;

    return (
      <View style={styles.issueView}>

        {this.renderIssueVisibility()}

        <View style={styles.issueAdditionalInfoContainer}>
          {this.renderAdditionalInfo()}
          {this.renderIssueVotes()}
        </View>

        {editMode && <IssueSummary
          editable={!isSavingEditedIssue}
          summary={summaryCopy}
          showSeparator={false}
          description={descriptionCopy}
          onSummaryChange={this.props.setIssueSummaryCopy}
          onDescriptionChange={this.props.setIssueDescriptionCopy}
        />}

        {!editMode && this.renderIssueContent()}

        {issue?.attachments && this.renderAttachments(issue.attachments)}

        {editMode && <KeyboardSpacerIOS/>}
      </View>
    );
  }

  getIssue(): AnyIssue {
    return this.props.issue || this.props.issuePlaceholder;
  }

  canUpdateField = (field: CustomField) => this.props.issuePermissions.canUpdateField(this.getIssue(), field);

  canCreateIssueToProject = (project: IssueProject) => this.props.issuePermissions.canCreateIssueToProject(project);

  onFieldUpdate = async (field: CustomField, value: any) => await this.props.updateIssueFieldValue(field, value);

  onUpdateProject = async (project: IssueProject) => await this.props.updateProject(project);

  renderCustomFieldPanel() {
    const {issuePermissions} = this.props;
    const _issue: AnyIssue = this.getIssue();

    return <CustomFieldsPanel
      autoFocusSelect

      issueId={_issue?.id}
      issueProject={_issue?.project}
      fields={_issue?.fields}

      hasPermission={{
        canUpdateField: this.canUpdateField,
        canCreateIssueToProject: this.canCreateIssueToProject,
        canEditProject: issuePermissions.canUpdateGeneralInfo(_issue)
      }}

      onUpdate={this.onFieldUpdate}
      onUpdateProject={this.onUpdateProject}
    />;
  }

  render() {
    const {renderRefreshControl, onSwitchToActivity} = this.props;

    return (
      <ScrollView
        style={styles.issueContent}
        refreshControl={renderRefreshControl()}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {this.renderCustomFieldPanel()}
        {this._renderIssueView()}

        <TouchableOpacity
          style={styles.switchToActivityButton}
          hitSlop={HIT_SLOP}
          onPress={onSwitchToActivity}
        >
          <Text style={styles.switchToActivityButtonText}>View comments and other activity</Text>
        </TouchableOpacity>

      </ScrollView>
    );
  }
}

