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
import {isPureHTMLBlock, prepareHTML} from 'components/wiki/markdown-helper';
import {
  SkeletonIssueContent,
  SkeletonIssueInfoLine,
} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './issue.styles';

import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {AnyIssue, IssueFull, IssueOnList} from 'types/Issue';
import type {
  Attachment,
  CustomField,
  CustomFieldText,
  CustomFieldTextValue,
  FieldValue,
  IssueLink,
  IssueProject,
} from 'types/CustomFields';

import type {ScrollData} from 'types/Markdown';
import type {Theme, UITheme} from 'types/Theme';
import type {Visibility} from 'types/Visibility';
import type {YouTrackWiki} from 'types/Wiki';

export type IssueDetailsProps = {
  loadIssue: () => any;
  openNestedIssueView: (arg0: {issue?: IssueFull; issueId?: string}) => any;
  attachingImage: Record<string, any> | null | undefined;
  refreshIssue: () => any;
  issuePermissions: IssuePermissions;
  updateIssueFieldValue: (
    field: CustomField | CustomFieldText,
    value: FieldValue,
  ) => any;
  updateProject: (project: IssueProject) => any;
  issue: IssueFull;
  issuePlaceholder: IssueOnList;
  issueLoaded: boolean;
  editMode: boolean;
  isSavingEditedIssue: boolean;
  summaryCopy: string;
  descriptionCopy: string;
  openIssueListWithSearch: (query: string) => any;
  onTagRemove: (tagId: string) => any;
  setIssueSummaryCopy: (summary: string) => any;
  setIssueDescriptionCopy: (description: string) => any;
  analyticCategory: string;
  renderRefreshControl: () => any;
  onSwitchToActivity: () => any;
  onRemoveAttachment: () => any;
  onVisibilityChange: (visibility: Visibility) => any;
  onAttach: (isVisible: boolean) => any;
  onCheckboxUpdate: (
    checked: boolean,
    position: number,
    description: string,
  ) => void;
  onLongPress: (text: string, title?: string) => void;
  getIssueLinksTitle: (linkedIssues?: IssueLink[]) => any;
  issuesGetter: (linkTypeName: string, q: string) => any;
  linksGetter: () => any;
  onUnlink: (linkedIssue: IssueOnList, linkTypeId: string) => any;
  onLinkIssue: (
    linkedIssueIdReadable: string,
    linkTypeName: string,
  ) => Promise<boolean>;
  setCustomFieldValue: (
    field: CustomFieldText,
    value: CustomFieldTextValue,
  ) => any;
  modal?: boolean;
  scrollData: ScrollData;
};
export default class IssueDetails extends Component<IssueDetailsProps, void> {
  imageHeaders: any = getApi().auth.getAuthorizationHeaders();
  backendUrl: any = getApi().config.backendUrl;
  uiTheme: UITheme;

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

    return false;
  }

  renderLinksBlock: () => React.ReactNode = () => {
    const {issuePermissions, getIssueLinksTitle} = this.props;
    const issue: AnyIssue = this.getIssue();
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
                    ? (linkedIssue: AnyIssue) =>
                        issuePermissions.canLink(linkedIssue)
                    : undefined
                }
                subTitle={`${issue.idReadable} ${issue.summary}`}
                onHide={() => Router.pop()}
                onAddLink={(renderChildren: (arg0: () => any) => any) =>
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

  renderAttachments(attachments: Attachment[] | null): React.ReactNode {
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

  renderAdditionalInfo(): React.ReactNode {
    const issue: IssueFull = this.getIssue() as IssueFull;
    return issue ? <CreateUpdateInfo
      analyticId={ANALYTICS_ISSUE_PAGE}
      reporter={issue.reporter}
      updater={issue.updater}
      created={issue.created}
      updated={issue.updated}
    /> : (
      <SkeletonIssueInfoLine lines={2}/>
    );
  }

  renderIssueVisibility(): React.ReactNode {
    const {onVisibilityChange} = this.props;
    const issue: IssueFull = this.getIssue() as IssueFull;
    return issue ? (
      <View style={styles.visibility}>
        <VisibilityControl
          visibility={issue.visibility}
          onSubmit={onVisibilityChange}
          uiTheme={this.uiTheme}
          getOptions={(q: string) => getApi().issue.getVisibilityOptions(issue.id, q)}
        />
      </View>
    ) : <SkeletonIssueInfoLine/>;
  }
  renderIssueTextFields(): React.ReactNode {
    const {editMode, onLongPress, setCustomFieldValue} = this.props;
    const issue: AnyIssue = this.getIssue();
    return getIssueTextCustomFields(issue.fields).map(
      (textField: CustomFieldText, index: number) => {
        return (
          <TouchableWithoutFeedback
            key={`issueCustomFieldText${index}`}
            onLongPress={() => {
              textField?.value?.text &&
                onLongPress(textField.value.text, i18n('Copy field text'));
            }}
            delayLongPress={250}
          >
            <View>
              <IssueCustomFieldText
                editMode={editMode}
                onUpdateFieldValue={async (text: string): Promise<void> => {
                  setCustomFieldValue(textField, {
                    ...(textField.value || {
                      id: undefined,
                    }),
                    text,
                  });
                }}
                textField={textField}
                usesMarkdown={issue.usesMarkdown}
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
        onIssueIdTap: (issueId: string) =>
          openNestedIssueView({
            issueId,
          }),
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

  renderIssueContent(): React.ReactNode {
    const {openIssueListWithSearch, onTagRemove, onLongPress} = this.props;
    const issue: AnyIssue = this.getIssue();

    if (!issue) {
      return <SkeletonIssueContent />;
    }

    return (
      <View>
        <Text
          style={[styles.summary, issue.resolved && styles.summaryResolved]}
          selectable={true}
          testID="issue-summary"
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
          accessibilityLabel="issue-description"
          accessible={true}
        >
          <View style={styles.description}>{this.renderMarkdown()}</View>
        </TouchableWithoutFeedback>

        {this.renderIssueTextFields()}
      </View>
    );
  }

  renderIssueEditContent(): React.ReactNode {
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

  renderIssueView(): React.ReactNode {
    const {issue, editMode, onAttach} = this.props;
    return (
      <View style={styles.issueView}>
        <View style={styles.issueTopActions}>
          {this.renderIssueVisibility()}
        </View>
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

  getIssue(): AnyIssue {
    return this.props.issue || this.props.issuePlaceholder;
  }

  getIssuePermissions: () => IssuePermissions = (): IssuePermissions => {
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
  canUpdateField: (field: CustomField) => any = (field: CustomField) =>
    this.getIssuePermissions().canUpdateField(this.getIssue(), field);
  canCreateIssueToProject: (project: IssueProject) => any = (
    project: IssueProject,
  ) => this.getIssuePermissions().canCreateIssueToProject(project);
  onFieldUpdate: (
    field: CustomField | CustomFieldText,
    value: any,
  ) => Promise<any> = async (
    field: CustomField | CustomFieldText,
    value: any,
  ) => await this.props.updateIssueFieldValue(field, value);
  onUpdateProject: (project: IssueProject) => Promise<any> = async (
    project: IssueProject,
  ) => await this.props.updateProject(project);
  renderCustomFieldPanel: ()=> React.ReactNode = () => {
    const _issue: AnyIssue = this.getIssue();

    return (
      <CustomFieldsPanel
        analyticsId={ANALYTICS_ISSUE_PAGE}
        autoFocusSelect
        issueId={_issue?.id}
        issueProject={_issue?.project}
        fields={getIssueCustomFieldsNotText(_issue?.fields || [])}
        hasPermission={{
          canUpdateField: this.canUpdateField,
          canCreateIssueToProject: this.canCreateIssueToProject,
          canEditProject: this.getIssuePermissions().canUpdateGeneralInfo(
            _issue,
          ),
        }}
        onUpdate={this.onFieldUpdate}
        onUpdateProject={this.onUpdateProject}
        uiTheme={this.uiTheme}
        modal={this.props.modal}
      />
    );
  };

  renderContent(): React.ReactNode {
    const {renderRefreshControl, onSwitchToActivity} = this.props;
    return (
      <ScrollView
        refreshControl={renderRefreshControl()}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
      >
        {this.renderCustomFieldPanel()}
        {this.renderIssueView()}

        <TouchableOpacity
          style={styles.switchToActivityButton}
          hitSlop={HIT_SLOP}
          onPress={onSwitchToActivity}
        >
          <Text style={styles.switchToActivityButtonText}>
            {i18n('View comments and other activity')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  render(): React.ReactNode {
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
