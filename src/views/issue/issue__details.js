/* @flow */

import type {Node} from 'React';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';

import {View as AnimatedView} from 'react-native-animatable';

import AttachmentAddPanel from '../../components/attachments-row/attachments-add-panel';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import IssueDescription from './issue__description';
import IssueVotes from '../../components/issue-actions/issue-votes';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import log from '../../components/log/log';
import Separator from '../../components/separator/separator';
import SummaryDescriptionForm from '../../components/form/summary-description-form';
import Tags from '../../components/tags/tags';
import usage from '../../components/usage/usage';
import VisibilityControl from '../../components/visibility/visibility-control';
import {ANALYTICS_ISSUE_PAGE} from '../../components/analytics/analytics-ids';
import {getApi} from '../../components/api/api__instance';
import {getEntityPresentation, getReadableID, ytDate} from '../../components/issue-formatter/issue-formatter';
import {SkeletonIssueContent, SkeletonIssueInfoLine} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';

import {HIT_SLOP} from '../../components/common-styles/button';
import styles from './issue.styles';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {AnyIssue, IssueFull, IssueOnList} from '../../flow/Issue';
import type {Attachment, CustomField, FieldValue, IssueProject} from '../../flow/CustomFields';
import type {Theme, UITheme} from '../../flow/Theme';
import type {Visibility} from '../../flow/Visibility';
import type {YouTrackWiki} from '../../flow/Wiki';


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
  onTagRemove: (tagId: string) => any,
  setIssueSummaryCopy: (summary: string) => any,
  setIssueDescriptionCopy: (description: string) => any,

  analyticCategory: string,

  renderRefreshControl: () => any,

  onVoteToggle: (voted: boolean) => any,

  onSwitchToActivity: () => any,

  onRemoveAttachment: () => any,

  onVisibilityChange: (visibility: Visibility) => any,
  onAttach: (isVisible: boolean) => any,

  onCheckboxUpdate: (checked: boolean, position: number, description: string) => void,
}

export default class IssueDetails extends Component<Props, void> {
  imageHeaders: any = getApi().auth.getAuthorizationHeaders();
  backendUrl: any = getApi().config.backendUrl;

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

  renderLinks: ((issue: IssueFull) => void | Node) = (issue: IssueFull) => {
    if (issue.links && issue.links.length) {
      return (
        <AnimatedView
          animation="fadeIn"
          duration={500}
          useNativeDriver>
          <LinkedIssues
            links={issue.links}
            onIssueTap={(issue: IssueOnList) => this.props.openNestedIssueView({issue})}/>
        </AnimatedView>
      );
    }
  };

  renderAttachments(attachments: Array<Attachment> | null, uiTheme: UITheme): null | Node {
    if (!attachments || !attachments.length) {
      return null;
    }

    const {onRemoveAttachment, issue, issuePermissions, editMode} = this.props;

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
          canRemoveAttachment={editMode && issuePermissions.canRemoveAttachment(issue)}
          onRemoveImage={onRemoveAttachment}
          onOpenAttachment={(type) => usage.trackEvent(
            this.props.analyticCategory,
            type === 'image' ? 'Showing image' : 'Open attachment by URL')
          }
          uiTheme={uiTheme}
        />
      </View>
    );
  }

  renderIssueVotes(uiTheme: UITheme): Node {
    const {issue, issuePermissions, onVoteToggle} = this.props;

    return (
      <View style={styles.issueVote}>
        <IssueVotes
          canVote={issuePermissions.canVote(issue)}
          votes={issue?.votes}
          voted={issue?.voters?.hasVote}
          onVoteToggle={onVoteToggle}
          uiTheme={uiTheme}
        />
      </View>
    );
  }

  renderAdditionalInfo(): null | Node {
    const {issue} = this.props;

    if (!issue) {
      return null;
    }

    return (
      issue
        ? <View style={styles.issueTopPanel}>
          <Text
            style={styles.issueTopPanelText}
            selectable={true}
          >
            Created by {getEntityPresentation(issue.reporter)} {ytDate(issue?.created) || ''}
          </Text>

          <Text
            style={[styles.issueTopPanelText, styles.topPanelUpdatedInformation]}
            selectable={true}
          >
            Updated by {getEntityPresentation(issue.updater)} {ytDate(issue?.updated) || ''}
          </Text>
        </View>
        : <SkeletonIssueInfoLine lines={2}/>
    );
  }

  renderIssueVisibility(uiTheme: UITheme): Node {
    const {issue, onVisibilityChange} = this.props;

    if (issue) {
      return (
        <View style={styles.visibility}>
          <VisibilityControl
            visibility={issue.visibility}
            onSubmit={onVisibilityChange}
            uiTheme={uiTheme}
            getOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
          />
        </View>
      );
    }

    return <SkeletonIssueInfoLine/>;
  }

  renderIssueContent(uiTheme: UITheme): Node {
    const {issue, openIssueListWithSearch, openNestedIssueView, onTagRemove, onCheckboxUpdate} = this.props;

    if (!issue) {
      return <SkeletonIssueContent/>;
    }

    const ytWikiProps: YouTrackWiki = {
      youtrackWiki: {
        style: styles.description,
        backendUrl: this.backendUrl,
        attachments: issue.attachments,
        imageHeaders: this.imageHeaders,
        onIssueIdTap: issueId => openNestedIssueView({issueId}),
        title: getReadableID(issue),
        description: issue.wikifiedDescription,
      },
      markdown: issue.usesMarkdown && issue.description,
      attachments: issue.attachments,
    };

    return (
      <View>
        <Text
          style={[styles.summary, issue.resolved && styles.summaryResolved]}
          selectable={true}
          testID="issue-summary">
          {issue.summary}
        </Text>

        <Tags
          style={styles.tags}
          multiline={true}
          tags={issue?.tags}
          onTagPress={openIssueListWithSearch}
          onTagRemove={onTagRemove}
        />

        {Boolean(issue?.tags?.length > 0) && <View style={styles.tagsSeparator}/>}

        {this.renderLinks(issue)}

        <IssueDescription
          {...ytWikiProps}
          attachments={issue.attachments}
          markdown={issue.usesMarkdown && issue.description}
          uiTheme={uiTheme}
          onCheckboxUpdate={(checked: boolean, position: number, description: string) => onCheckboxUpdate(checked, position, description)}
        />
      </View>
    );
  }

  renderIssueView(uiTheme: UITheme): Node {
    const {
      issue,
      editMode,
      isSavingEditedIssue,
      summaryCopy,
      descriptionCopy,
      onAttach,
    } = this.props;

    return (
      <View style={styles.issueView}>

        <View style={styles.issueTopActions}>
          {this.renderIssueVisibility(uiTheme)}
          {this.renderIssueVotes(uiTheme)}
        </View>
        {this.renderAdditionalInfo()}

        {editMode && <SummaryDescriptionForm
          analyticsId={ANALYTICS_ISSUE_PAGE}
          editable={!isSavingEditedIssue}
          summary={summaryCopy}
          description={descriptionCopy}
          onSummaryChange={this.props.setIssueSummaryCopy}
          onDescriptionChange={this.props.setIssueDescriptionCopy}
        />}

        {!editMode && this.renderIssueContent(uiTheme)}

        {editMode && (
          <>
            <Separator fitWindow indent/>
            <AttachmentAddPanel
              showAddAttachDialog={() => onAttach(true)}
            />
          </>
        )}

        {issue?.attachments && this.renderAttachments(issue.attachments, uiTheme)}

        {editMode && <KeyboardSpacerIOS/>}
      </View>
    );
  }

  getIssue(): AnyIssue {
    return this.props.issue || this.props.issuePlaceholder;
  }

  getIssuePermissions: (() => AnyIssue) = (): AnyIssue => {
    const noop = () => false;
    return this.props.issuePermissions || {
      canCreateIssueToProject: noop,
      canUpdateField: noop,
      canUpdateGeneralInfo: noop,
      canEditProject: noop,
    };
  };

  canUpdateField: ((field: CustomField) => any) = (field: CustomField) => this.getIssuePermissions().canUpdateField(this.getIssue(), field);

  canCreateIssueToProject: ((project: IssueProject) => any) = (project: IssueProject) => this.getIssuePermissions().canCreateIssueToProject(project);

  onFieldUpdate: ((field: CustomField, value: any) => Promise<any>) = async (field: CustomField, value: any) => await this.props.updateIssueFieldValue(field, value);

  onUpdateProject: ((project: IssueProject) => Promise<any>) = async (project: IssueProject) => await this.props.updateProject(project);

  renderCustomFieldPanel: ((uiTheme: UITheme) => Node) = (uiTheme: UITheme) => {
    const _issue: AnyIssue = this.getIssue();

    return <CustomFieldsPanel
      analyticsId={ANALYTICS_ISSUE_PAGE}
      autoFocusSelect

      issueId={_issue?.id}
      issueProject={_issue?.project}
      fields={_issue?.fields}

      hasPermission={{
        canUpdateField: this.canUpdateField,
        canCreateIssueToProject: this.canCreateIssueToProject,
        canEditProject: this.getIssuePermissions().canUpdateGeneralInfo(_issue),
      }}

      onUpdate={this.onFieldUpdate}
      onUpdateProject={this.onUpdateProject}

      uiTheme={uiTheme}
    />;
  };

  render(): Node {
    const {renderRefreshControl, onSwitchToActivity} = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <ScrollView
              refreshControl={renderRefreshControl()}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              scrollEventThrottle={16}
            >
              {this.renderCustomFieldPanel(theme.uiTheme)}
              {this.renderIssueView(theme.uiTheme)}

              <TouchableOpacity
                style={styles.switchToActivityButton}
                hitSlop={HIT_SLOP}
                onPress={onSwitchToActivity}
              >
                <Text style={styles.switchToActivityButtonText}>View comments and other activity</Text>
              </TouchableOpacity>

            </ScrollView>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

