/* @flow */

import {Text, View, ScrollView, ActivityIndicator} from 'react-native';
import React, {PureComponent} from 'react';
import {getApi} from '../../components/api/api__instance';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import IssueAdditionalInfo from './single-issue__additional-info';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';
import IssueSummary from '../../components/issue-summary/issue-summary';
import styles from './single-issue.styles';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import Tags from '../../components/tags/tags';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {IssueFull, IssueOnList, TabRoute} from '../../flow/Issue';
import type {Attachment, CustomField, FieldValue, IssueProject} from '../../flow/CustomFields';

import commonIssueStyles from '../../components/common-styles/issue';
import IssueDescription from './single-issue__description';
import IssueVotes from '../../components/issue-toolbar/issue-votes';


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

  onVoteToggle: (voted: boolean) => any
}

type TabsState = {
  index: number,
  routes: Array<TabRoute>
};

const tabRoutes: Array<TabRoute> = [
  {key: 'details', title: 'Details'},
  {key: 'activity', title: 'Activity'},
];


export default class IssueDetails extends PureComponent<Props, TabsState> {
  imageHeaders = getApi().auth.getAuthorizationHeaders();
  backendUrl = getApi().config.backendUrl;
  state = {
    index: 0,
    routes: tabRoutes,
  };

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
            this.props.analyticCategory,
            type === 'image' ? 'Showing image' : 'Open attachment by URL')}
        /></View>
    );
  }

  renderIssueVotes() {
    const {issue, issuePermissions, onVoteToggle} = this.props;
    return (
      <IssueVotes
        canVote={issuePermissions.canVote(issue)}
        votes={issue.votes}
        voted={issue.voters.hasVote}
        onVoteToggle={onVoteToggle}
      />
    );
  }

  _renderIssueView(issue: IssueFull | IssueOnList) {
    const {
      editMode,
      isSavingEditedIssue,
      summaryCopy,
      descriptionCopy,
      openIssueListWithSearch,
      openNestedIssueView
    } = this.props;
    return (
      <View style={styles.issueView}>

        <View style={styles.issueAdditionalInfoContainer}>
          <IssueAdditionalInfo
            style={styles.issueAdditionalInfo}
            created={issue.created}
            updated={issue.updated}
            reporter={issue.reporter}
            updater={issue.updater}
          />
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

        {!editMode && <View>
          <Text
            style={[styles.summary, issue.resolved ? commonIssueStyles.resolvedSummary : null]}
            selectable={true}
            testID="issue-summary">
            {issue.summary}
          </Text>

          <Tags
            style={styles.tags}
            multiline={true}
            tags={issue?.tags}
            onTagPress={openIssueListWithSearch}
            showMore={true}
          />

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
        </View>}

        {this.renderAttachments(issue.attachments)}
      </View>
    );
  }

  renderCustomFieldPanel() {
    const {issue, issuePermissions, updateIssueFieldValue, updateProject} = this.props;

    return <CustomFieldsPanel
      api={getApi()}
      autoFocusSelect
      canEditProject={issuePermissions.canUpdateGeneralInfo(issue)}
      issue={issue}
      issuePermissions={issuePermissions}
      onUpdate={async (field, value) => await updateIssueFieldValue(field, value)}
      onUpdateProject={async (project) => await updateProject(project)}/>;
  }

  render() {
    const {issue, issuePlaceholder, issueLoaded, renderRefreshControl} = this.props;

    return (
      <ScrollView
        style={styles.issueContent}
        refreshControl={renderRefreshControl()}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {Boolean(issue) && this.renderCustomFieldPanel()}
        {this._renderIssueView(issue || issuePlaceholder)}
        {!issueLoaded && <ActivityIndicator style={styles.loading}/>}
      </ScrollView>
    );
  }
}

