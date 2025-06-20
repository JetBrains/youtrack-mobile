import {
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {Component} from 'react';
import AttachmentAddPanel from 'components/attachments-row/attachments-add-panel';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import CreateUpdateInfo from 'components/issue-tabbed/issue-tabbed__created-updated';
import CustomFieldsPanel from 'components/custom-fields-panel/custom-fields-panel';
import HTML from 'components/wiki/markdown/markdown-html';
import IssueCustomFieldText from 'components/custom-field/issue-custom-field-text';
import IssueMarkdown from './issue__markdown';
import IssueUsersCC from 'views/issue/issue-user-cc';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import LinkedIssues from 'components/linked-issues/linked-issues';
import LinkedIssuesTitle from 'components/linked-issues/linked-issues-title';
import log from 'components/log/log';
import Router from 'components/router/router';
import Separator from 'components/separator/separator';
import SummaryDescriptionForm from 'components/form/summary-description-form';
import Tags from 'components/tags/tags';
import usage from 'components/usage/usage';
import VisibilityControl from 'components/visibility/visibility-control';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {getReadableID} from 'components/issue-formatter/issue-formatter';
import {
  getIssueCustomFieldsNotText,
  getIssueTextCustomFields,
} from 'components/custom-field/custom-field-helper';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {isHelpdeskProject} from 'components/helpdesk';
import {isPureHTMLBlock, prepareHTML} from 'components/wiki/markdown-helper';
import {SkeletonIssueContent, SkeletonIssueInfoLine} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issue.styles';

import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {
  Attachment,
  CustomField,
  CustomFieldText,
  TextFieldValue,
  FieldValue,
  IssueLink,
} from 'types/CustomFields';
import type {IssueFull, IssueOnListExtended} from 'types/Issue';
import type {NormalizedAttachment} from 'types/Attachment';
import type {Project} from 'types/Project';
import type {ScrollData} from 'types/Markdown';
import type {Theme, UITheme} from 'types/Theme';
import type {Visibility} from 'types/Visibility';
import type {YouTrackWiki} from 'types/Wiki';
import type {UserCC} from 'types/User';

export interface IssueDetailsProps {
  loadIssue: () => any;
  openNestedIssueView: (p: {issue?: IssueFull; issueId?: string;}) => void;
  attachingImage: NormalizedAttachment;
  refreshIssue: () => void;
  issuePermissions: IssuePermissions;
  updateIssueFieldValue: (
    field: CustomField | CustomFieldText,
    value: FieldValue,
  ) => void;
  updateProject: (project: Project) => void;
  onUpdateSprints: () => void;
  issue: IssueFull;
  issuePlaceholder: IssueOnListExtended;
  issueLoaded: boolean;
  editMode: boolean;
  isSavingEditedIssue: boolean;
  summaryCopy: string;
  descriptionCopy: string;
  openIssueListWithSearch: (query: string) => void;
  onTagRemove: (tagId: string) => void;
  setIssueSummaryCopy: (summary: string) => void;
  setIssueDescriptionCopy: (description: string) => void;
  analyticCategory: string;
  renderRefreshControl: () => React.ReactElement;
  onSwitchToActivity: () => void;
  onRemoveAttachment: () => void;
  onVisibilityChange: (visibility: Visibility | null) => void;
  onAttach: (isVisible: boolean) => void;
  onCheckboxUpdate: (
    checked: boolean,
    position: number,
    description: string,
  ) => void;
  onLongPress: (text: string, title?: string) => void;
  getIssueLinksTitle: (linkedIssues?: IssueLink[]) => void;
  issuesGetter: (linkTypeName: string, q: string) => void;
  linksGetter: () => void;
  onUnlink: (linkedIssue: IssueOnListExtended, linkTypeId: string) => void;
  onLinkIssue: (
    linkedIssueIdReadable: string,
    linkTypeName: string,
  ) => Promise<boolean>;
  setCustomFieldValue: (
    field: CustomFieldText,
    value: TextFieldValue,
  ) => void;
  modal?: boolean;
  scrollData: ScrollData;
  canEditVisibility: boolean;
  isReporter: boolean;
  isAgent: boolean;
  usersCC: Array<UserCC> | null;
}

export default class IssueDetails extends Component<IssueDetailsProps, void> {
  imageHeaders: any = getApi().auth.getAuthorizationHeaders();
  backendUrl: any = getApi().config.backendUrl;
  uiTheme: UITheme | undefined;

  constructor(props: IssueDetailsProps) {
    super(props);
    this.renderContent = this.renderContent.bind(this);
  }

  UNSAFE_componentWillUpdate(nextProps: IssueDetailsProps) {
    if (!this.props?.issue?.id && nextProps?.issue?.id) {
      this.props.getIssueLinksTitle();
    }
  }

  shouldComponentUpdate(nextProps: IssueDetailsProps): boolean {
    if (nextProps.issue !== this.props.issue) {
      return true;
    }

    if (nextProps.editMode !== this.props.editMode) {
      return true;
    }

    if (nextProps.isSavingEditedIssue !== this.props.isSavingEditedIssue) {
      return true;
    }

    if (nextProps.usersCC !== this.props.usersCC) {
      return true;
    }

    return false;
  }

  renderLinksBlock = () => {
    const {issuePermissions, getIssueLinksTitle} = this.props;
    const issue = this.getIssue();
    return (
      <LinkedIssuesTitle
        issueLinks={issue.links}
        onPress={() =>
          Router.Page({
            children: (
              <LinkedIssues
                issuesGetter={this.props.issuesGetter}
                linksGetter={this.props.linksGetter}
                onUnlink={this.props.onUnlink}
                onLinkIssue={this.props.onLinkIssue}
                onUpdate={(issues?: IssueLink[]) => {
                  getIssueLinksTitle(issues);
                }}
                canLink={
                  issuePermissions.canLink(issue)
                    ? (linkedIssue) => issuePermissions.canLink(linkedIssue)
                    : undefined
                }
                subTitle={`${issue.idReadable} ${issue.summary}`}
                onHide={() => Router.pop()}
                onAddLink={(renderChildren: () => React.ReactNode) =>
                  Router.Page({
                    children: renderChildren(),
                  })
                }
              />
            ),
          })
        }
      />
    );
  };

  renderAttachments(attachments: Attachment[] | null) {
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
          canRemoveAttachment={
            editMode && issuePermissions.canRemoveAttachment(issue)
          }
          onRemoveImage={onRemoveAttachment}
          onOpenAttachment={type =>
            usage.trackEvent(
              this.props.analyticCategory,
              type === 'image' ? 'Showing image' : 'Open attachment by URL',
            )
          }
          uiTheme={this.uiTheme}
        />
      </View>
    );
  }

  renderAdditionalInfo() {
    const issue = this.getIssue();
    return issue ? <CreateUpdateInfo
      analyticId={ANALYTICS_ISSUE_PAGE}
      reporter={issue.reporter}
      updater={this.props.isReporter ? null : issue.updater}
      created={issue.created}
      updated={issue.updated}
    /> : (
      <SkeletonIssueInfoLine lines={2}/>
    );
  }

  renderIssueVisibility() {
    const {onVisibilityChange, canEditVisibility } = this.props;
    const issue = this.getIssue();
    return issue ? (
      <View style={styles.visibility}>
        <VisibilityControl
          disabled={!canEditVisibility}
          visibility={issue.visibility}
          onSubmit={onVisibilityChange}
          uiTheme={this.uiTheme}
          getOptions={(q: string) => getApi().issue.getVisibilityOptions(issue.id, q)}
        />
      </View>
    ) : <SkeletonIssueInfoLine/>;
  }
  renderIssueTextFields() {
    const {editMode, onLongPress, setCustomFieldValue} = this.props;
    const i = this.getIssue();
    return getIssueTextCustomFields(i.fields).map(
      (f, index: number) => {
        return (
          <TouchableWithoutFeedback
            key={`issueCustomFieldText${index}`}
            onLongPress={() => {
              f?.value?.text &&
                onLongPress(f.value.text, i18n('Copy field text'));
            }}
            delayLongPress={250}
          >
            <View>
              <IssueCustomFieldText
                editMode={editMode}
                onUpdateFieldValue={async (text: string): Promise<void> => {
                  setCustomFieldValue(f, {
                    ...(f.value || {
                      id: undefined,
                    }),
                    text,
                  });
                }}
                textField={f}
                usesMarkdown={i.usesMarkdown}
              />
            </View>
          </TouchableWithoutFeedback>
        );
      },
    );
  }

  renderMarkdown() {
    const {
      issue,
      openNestedIssueView,
      onCheckboxUpdate,
      scrollData,
    } = this.props;

    if (!issue) {
      return null;
    }

    if (
      issue.description &&
      (issue.hasEmail || isPureHTMLBlock(issue.description))
    ) {
      return <HTML html={prepareHTML(issue.description)} />;
    }

    const ytWikiProps: {
      youtrackWiki: YouTrackWiki;
      attachments: Attachment[];
    } = {
      youtrackWiki: {
        style: styles.description,
        backendUrl: this.backendUrl,
        attachments: issue.attachments,
        imageHeaders: this.imageHeaders,
        onIssueIdTap: (issueId: string) => openNestedIssueView({issueId}),
        title: getReadableID(issue),
        description: issue.wikifiedDescription,
      },
      attachments: issue.attachments,
    };
    return (
      <IssueMarkdown
        {...ytWikiProps}
        scrollData={scrollData}
        attachments={issue.attachments}
        markdown={issue.usesMarkdown ? issue.description : null}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          description: string,
        ) => onCheckboxUpdate(checked, position, description)}
        mentions={{
          articles: issue.mentionedArticles,
          issues: issue.mentionedIssues,
          users: issue.mentionedUsers,
        }}
      />
    );
  }

  renderIssueContent() {
    const {openIssueListWithSearch, onTagRemove, onLongPress} = this.props;
    const issue = this.getIssue();

    if (!issue) {
      return <SkeletonIssueContent />;
    }

    return (
      <View testID="test:id/issue-summary">
        <Text
          style={[styles.summary, issue.resolved && styles.summaryResolved]}
          selectable={true}
          testID="test:id/issue-summary-text"
        >
          {issue.summary}
        </Text>

        {Boolean(issue?.tags?.length) && (
          <Tags
            style={styles.tags}
            multiline={true}
            tags={issue?.tags}
            onTagPress={openIssueListWithSearch}
            onTagRemove={onTagRemove}
          />
        )}

        {this.renderLinksBlock()}

        <TouchableWithoutFeedback
          onLongPress={() => {
            onLongPress(issue.description, i18n('Copy description'));
          }}
          delayLongPress={250}
          testID="test:id/issue-description"
          accessible={true}
        >
          <View style={styles.description}>{this.renderMarkdown()}</View>
        </TouchableWithoutFeedback>

        {this.renderIssueTextFields()}
      </View>
    );
  }

  renderIssueEditContent() {
    const {isSavingEditedIssue, summaryCopy, descriptionCopy} = this.props;
    return (
      <>
        <SummaryDescriptionForm
          analyticsId={ANALYTICS_ISSUE_PAGE}
          editable={!isSavingEditedIssue}
          summary={summaryCopy}
          description={descriptionCopy}
          onSummaryChange={this.props.setIssueSummaryCopy}
          onDescriptionChange={this.props.setIssueDescriptionCopy}
        />
        {this.renderIssueTextFields()}
      </>
    );
  }

  renderIssueView() {
    const {issue, editMode, onAttach, isReporter} = this.props;
    return (
      <View style={styles.issueView}>
        {!isReporter && <View style={styles.issueTopActions}>{this.renderIssueVisibility()}</View>}
        {this.renderAdditionalInfo()}

        {editMode && this.renderIssueEditContent()}
        {!editMode && this.renderIssueContent()}

        {editMode && (
          <>
            <Separator fitWindow indent />
            <AttachmentAddPanel showAddAttachDialog={() => onAttach(true)} />
          </>
        )}

        {issue?.attachments && this.renderAttachments(issue.attachments)}

        {editMode && <KeyboardSpacerIOS />}
      </View>
    );
  }

  getIssue() {
    return this.props.issue || this.props.issuePlaceholder;
  }

  getIssuePermissions = (): IssuePermissions => {
    const noop = () => false;
    return (
      this.props.issuePermissions || {
        canCreateIssueToProject: noop,
        canUpdateField: noop,
        canUpdateGeneralInfo: noop,
        canEditProject: noop,
      }
    );
  };

  canUpdateField = (field: CustomField) => this.getIssuePermissions().canUpdateField(this.getIssue(), field);

  canCreateIssueToProject = (project: Project) => this.getIssuePermissions().canCreateIssueToProject(project);

  onFieldUpdate = async (field: CustomField | CustomFieldText, value: FieldValue) =>
    await this.props.updateIssueFieldValue(field, value);

  onUpdateProject = async (project: Project) => await this.props.updateProject(project);

  onUpdateSprints = async () => await this.props.onUpdateSprints();

  renderCustomFieldPanel = () => {
    const i = this.getIssue();

    return (
      <CustomFieldsPanel
        analyticsId={ANALYTICS_ISSUE_PAGE}
        autoFocusSelect={true}
        issueId={i?.id}
        issueProject={i?.project}
        fields={getIssueCustomFieldsNotText(i?.fields || [])}
        hasPermission={{
          canUpdateField: this.canUpdateField,
          canCreateIssueToProject: this.canCreateIssueToProject,
          canEditProject: this.getIssuePermissions().canUpdateGeneralInfo(i),
        }}
        onUpdate={this.onFieldUpdate}
        onUpdateProject={this.onUpdateProject}
        onUpdateSprints={this.onUpdateSprints}
        uiTheme={this.uiTheme!}
        modal={this.props.modal}
        helpDeskProjectsOnly={!!i?.project?.plugins?.helpDeskSettings?.enabled}
      />
    );
  };

  renderContent() {
    const {renderRefreshControl, onSwitchToActivity} = this.props;
    return (
      <ScrollView
        refreshControl={renderRefreshControl()}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {this.renderCustomFieldPanel()}
        {isHelpdeskProject(this.props.issue) && (
          <IssueUsersCC
            style={styles.usersCCSelect}
            textStyle={styles.usersCCSelectInner}
            disabled={!this.props.isAgent}
          />
        )}
        {this.renderIssueView()}

        <TouchableOpacity style={styles.switchToActivityButton} hitSlop={HIT_SLOP} onPress={onSwitchToActivity}>
          <Text style={styles.switchToActivityButtonText}>{i18n('View comments and other activity')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  render() {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          return this.renderContent();
        }}
      </ThemeContext.Consumer>
    );
  }
}
