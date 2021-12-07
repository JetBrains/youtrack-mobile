/* @flow */

import React, {PureComponent} from 'react';
import {ScrollView, View, ActivityIndicator, Text, TouchableOpacity} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as createIssueActions from './create-issue-actions';
import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import AttachmentAddPanel from '../../components/attachments-row/attachments-add-panel';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import CommandDialog from '../../components/command-dialog/command-dialog';
import CustomFieldsPanel from '../../components/custom-fields-panel/custom-fields-panel';
import Header from '../../components/header/header';
import IconLink from '@jetbrains/icons/link.svg';
import IssueCustomFieldText from '../../components/custom-field/issue-custom-field-text';
import KeyboardSpacerIOS from '../../components/platform/keyboard-spacer.ios';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import LinkedIssuesAddLink from '../../components/linked-issues/linked-issues-add-link';
import LinkedIssuesTitle from '../../components/linked-issues/linked-issues-title';
import Router from '../../components/router/router';
import SummaryDescriptionForm from '../../components/form/summary-description-form';
import TagAddPanel from '../../components/tags/tag-add-panel';
import TagAddSelect from '../../components/tags/tag-add-select';
import Tags from '../../components/tags/tags';
import usage from '../../components/usage/usage';
import VisibilityControl from '../../components/visibility/visibility-control';
import {ANALYTICS_ISSUE_CREATE_PAGE} from '../../components/analytics/analytics-ids';
import {getApi} from '../../components/api/api__instance';
import {getIssueCustomFieldsNotText, getIssueTextCustomFields} from '../../components/custom-field/custom-field-helper';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconCheck, IconClose, IconDrag, IconMoreOptions} from '../../components/icon/icon';
import {isIOSPlatform} from '../../util/util';
import {modalHide, modalShow} from '../../components/modal-view/modal-helper';
import {ThemeContext} from '../../components/theme/theme-context';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {AnyIssue} from '../../flow/Issue';
import type {AttachmentActions} from '../../components/attachments-row/attachment-actions';
import type {CreateIssueState} from './create-issue-reducers';
import type {CustomField, CustomFieldText, IssueLink, IssueProject, Tag} from '../../flow/CustomFields';
import type {NormalizedAttachment} from '../../flow/Attachment';
import type {Theme, UITheme, UIThemeColors} from '../../flow/Theme';

import styles from './create-issue.styles';


type AdditionalProps = {
  issuePermissions: IssuePermissions,
  predefinedDraftId: ?string,
  onAddTags: (tags: Array<Tag>) => () => Promise<void>,
  onHide?: () => void,
};

type Props = CreateIssueState & typeof createIssueActions & AttachmentActions & AdditionalProps & {
  isSplitView?: boolean,
};

type State = {
  showAddTagSelect: boolean,
};

class CreateIssue extends PureComponent<Props, State> {
  static contextTypes = {
    actionSheet: Function,
  };

  uiTheme: UITheme;
  state = {showAddTagSelect: false};

  constructor(props) {
    super(props);
    usage.trackScreenView(ANALYTICS_ISSUE_CREATE_PAGE);
  }

  UNSAFE_componentWillMount() {
    this.props.initializeWithDraftOrProject(this.props.predefinedDraftId);
  }

  onAddAttachment = async (files: Array<NormalizedAttachment>, onAttachingFinish: () => any) => {
    const {uploadIssueAttach, loadAttachments} = this.props;
    await uploadIssueAttach(files);
    onAttachingFinish();
    loadAttachments();
  };

  cancelAddAttach = () => {
    const {cancelAddAttach, hideAddAttachDialog, attachingImage} = this.props;
    cancelAddAttach(attachingImage);
    hideAddAttachDialog();
  };

  renderAttachFileDialog = (): React$Element<typeof AttachFileDialog> | null => {
    const {issue} = this.props;

    if (!issue || !issue.id) {
      return null;
    }

    return (
      <AttachFileDialog
        getVisibilityOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
        actions={{
          onAttach: this.onAddAttachment,
          onCancel: this.cancelAddAttach,
        }}
      />
    );
  };

  canUpdateField = (field: CustomField) => this.props.issuePermissions.canUpdateField(this.props.issue, field);

  canCreateIssueToProject = (project: IssueProject) => this.props.issuePermissions.canCreateIssueToProject(project);

  onFieldUpdate = async (field: CustomField, value: any) => await this.props.updateFieldValue(field, value);

  onUpdateProject = async (project: IssueProject) => await this.props.updateProject(project);

  renderCustomFieldPanel() {
    const {issue} = this.props;

    return <CustomFieldsPanel
      analyticsId={ANALYTICS_ISSUE_CREATE_PAGE}
      autoFocusSelect
      testID="test:id/createIssueFields"
      accessibilityLabel="createIssueFields"
      accessible={true}
      issueId={issue.id}
      issueProject={issue.project}
      fields={getIssueCustomFieldsNotText(issue.fields)}

      hasPermission={{
        canUpdateField: this.canUpdateField,
        canCreateIssueToProject: this.canCreateIssueToProject,
        canEditProject: true,
      }}

      onUpdate={this.onFieldUpdate}
      onUpdateProject={this.onUpdateProject}

      uiTheme={this.uiTheme}
    />;
  }

  renderIssueVisibility() {
    const {issue, updateVisibility} = this.props;
    return (
      <View style={styles.visibility}>
        <VisibilityControl
          visibility={issue.visibility}
          onSubmit={updateVisibility}
          uiTheme={this.uiTheme}
          getOptions={() => getApi().issue.getVisibilityOptions(issue.id)}
        />
      </View>
    );
  }

  renderCommandDialog() {
    const {
      applyCommand,
      commandSuggestions,
      getCommandSuggestions,
      commandIsApplying,
      toggleCommandDialog,
    } = this.props;
    return <CommandDialog
      suggestions={commandSuggestions}
      onCancel={() => toggleCommandDialog(false)}
      onChange={getCommandSuggestions}
      onApply={applyCommand}
      isApplying={commandIsApplying}
      initialCommand={''}
      uiTheme={this.uiTheme}
    />;
  }

  renderActionsIcon() {
    if (this.isProcessing() || !this.hasProject()) {
      return null;
    }
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={() => {
          !this.isProcessing() && this.props.showContextActions(this.context.actionSheet());
        }}
      >
        <Text style={styles.iconMore}>
          {isIOSPlatform()
            ? <IconMoreOptions size={18} color={this.uiTheme.colors.$link}/>
            : <Text><IconDrag size={18} color={this.uiTheme.colors.$link}/></Text>
          }
          <Text>{' '}</Text>
        </Text>
      </TouchableOpacity>
    );
  }

  isProcessing(): boolean {
    const {attachingImage, processing} = this.props;
    const isAttaching = attachingImage !== null;
    return processing || isAttaching;
  }

  hasProject(): boolean {
    return !!this.props.issue?.project?.id;
  }

  renderLinksBlock() {
    const {
      issue,
      issuePermissions,
      loadIssuesXShort,
      loadLinkedIssues,
      onUnlinkIssue,
      onLinkIssue,
      getIssueLinksTitle,
    } = this.props;
    const renderLinkedIssues = (onHide: () => void) => (
      <LinkedIssues
        issuesGetter={loadIssuesXShort}
        linksGetter={loadLinkedIssues}
        onUnlink={onUnlinkIssue}
        onLinkIssue={onLinkIssue}
        onUpdate={(issues?: Array<IssueLink>) => {
          getIssueLinksTitle(issues);
        }}
        canLink={(
          issuePermissions.canLink(issue)
            ? (linkedIssue: AnyIssue) => issuePermissions.canLink(linkedIssue)
            : undefined
        )}
        subTitle="Current issue"
        onHide={onHide}
      />
    );

    return <LinkedIssuesTitle
      issueLinks={issue.links}
      onPress={() => {
        let modalId: string = '';
        if (this.props.isSplitView) {
          modalId = modalShow(
            renderLinkedIssues(
              () => modalHide(modalId)),
            {hasOverlay: false}
          );
        } else {
          Router.Page({
            children: renderLinkedIssues(() => Router.pop()),
          });
        }
      }}
    />;
  }

  onHide = async () => {
    await this.props.storeDraftAndGoBack();
    if (this.props.onHide) {
      this.props.onHide();
    } else {
      Router.pop(true);
    }
  }

  renderLinkedIssuesAddLink = () => {
    const {loadIssuesXShort, onLinkIssue, getIssueLinksTitle, processing} = this.props;
    //$FlowFixMe
    const iconLink: any = <IconLink
      width={24}
      height={24}
      fill={processing ? styles.addLinkButtonTextDisabled.color : styles.addLinkButtonText.color}
    />;
    const renderAddLinkedIssue = (onHide: () => void) => (
      <LinkedIssuesAddLink
        issuesGetter={loadIssuesXShort}
        onLinkIssue={onLinkIssue}
        onUpdate={(issues?: Array<IssueLink>) => {
          getIssueLinksTitle(issues);
        }}
        onHide={onHide}
      />
    );

    return (
      <TouchableOpacity
        style={styles.addLinkButton}
        onPress={() => {
          if (this.props.isSplitView) {
            let modalId: string = '';
            modalId = modalShow(
              renderAddLinkedIssue(() => modalHide(modalId)),
              {hasOverlay: false},
            );
          } else {
            Router.Page({
              children: (renderAddLinkedIssue(() => Router.pop())),
            });
          }
        }}
      >
        {iconLink}
        <Text style={styles.addLinkButtonText}>Link issue</Text>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      setIssueSummary,
      setIssueDescription,
      createIssue,
      issue,
      attachingImage,
      processing,
      removeAttachment,
      showAddAttachDialog,
      isAttachFileDialogVisible,
      showCommandDialog,
      issuePermissions,
    } = this.props;

    const isAttaching = attachingImage !== null;
    const isProcessing = processing || isAttaching;
    const canCreateIssue = issue.summary && issue?.project?.id && !isProcessing;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          const uiThemeColors: UIThemeColors = this.uiTheme.colors;
          const hasProject: boolean = this.hasProject();

          const rightButton = (
            processing
              ? <ActivityIndicator color={uiThemeColors.$link}/>
              : <IconCheck size={20} color={canCreateIssue ? uiThemeColors.$link : uiThemeColors.$disabled}/>
          );

          return (
            <View
              testID="createIssue"
              style={styles.container}
            >
              <Header
                title="New Issue"
                showShadow={true}
                leftButton={<IconClose size={21} color={uiThemeColors.$link}/>}
                onBack={this.onHide}
                rightButton={rightButton}
                extraButton={this.renderActionsIcon()}
                onRightButtonClick={() => canCreateIssue && createIssue()}/>

              {this.renderCustomFieldPanel()}

              {hasProject && this.renderIssueVisibility()}

              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
              >
                <SummaryDescriptionForm
                  analyticsId={ANALYTICS_ISSUE_CREATE_PAGE}
                  testID="createIssueSummary"
                  style={styles.issueSummary}
                  summary={issue.summary}
                  description={issue.description}
                  editable={!processing}
                  onSummaryChange={setIssueSummary}
                  onDescriptionChange={setIssueDescription}
                />

                {hasProject && (
                  getIssueTextCustomFields(this.props.issue.fields).map((textField: CustomFieldText, index: number) => {
                    return (
                      <IssueCustomFieldText
                        testID="test:id/issue-custom-field"
                        accessibilityLabel="issue-custom-field"
                        accessible={true}
                        key={`issueCustomFieldText${index}`}
                        style={styles.textFields}
                        editMode={true}
                        onUpdateFieldValue={async (fieldValue: string): Promise<void> => {
                          await this.props.updateFieldValue(textField, {text: fieldValue});
                        }}
                        textField={textField}
                        usesMarkdown={issue.usesMarkdown}
                      />
                    );
                  })
                )}

                {hasProject && (
                  <>
                    <View style={styles.separator}/>
                    <View
                      testID="test:id/attachment-button"
                      accessibilityLabel="attachment-button"
                      accessible={true}
                      style={[styles.additionalData, styles.issueAttachments]}
                    >
                      <AttachmentsRow
                        attachments={issue.attachments}
                        attachingImage={attachingImage}
                        imageHeaders={getApi().auth.getAuthorizationHeaders()}
                        canRemoveAttachment={true}
                        onRemoveImage={removeAttachment}
                        uiTheme={this.uiTheme}
                      />
                    </View>
                  </>
                )}

                {hasProject && (
                  <View
                    testID="test:id/attachment-button"
                    accessibilityLabel="attachment-button"
                    accessible={true}
                    style={styles.additionalData}
                  >
                    <AttachmentAddPanel
                      isDisabled={processing}
                      showAddAttachDialog={showAddAttachDialog}
                    />
                  </View>
                )}

                {hasProject && (
                  <>
                    <View style={styles.separator}/>
                    <View
                      testID="test:id/attachment-button"
                      accessibilityLabel="attachment-button"
                      accessible={true}
                      style={styles.additionalData}
                    >
                      {!!issue.tags && (
                        <Tags
                          tags={issue.tags}
                          multiline={true}
                        />
                      )}
                      {hasProject && (
                        <TagAddPanel
                          disabled={processing}
                          onAdd={() => this.setState({showAddTagSelect: true})}
                        />
                      )}
                      {this.state.showAddTagSelect && <TagAddSelect
                        existed={issue?.tags}
                        projectId={issue.project?.id}
                        onAdd={(tags: Array<Tag>) => this.props.onAddTags(tags)}
                        onHide={() => this.setState({showAddTagSelect: false})}
                      />}
                    </View>
                  </>
                )}

                {hasProject && (
                  <>
                    <View style={styles.separator}/>
                    <View
                      testID="test:id/link-issue-button"
                      accessibilityLabel="link-issue-button"
                      accessible={true}
                      style={styles.additionalData}
                    >
                      {hasProject && issuePermissions.canLink(issue) && this.renderLinkedIssuesAddLink()}
                      {hasProject && this.renderLinksBlock()}
                    </View>
                  </>
                )}

              </ScrollView>

              <KeyboardSpacerIOS/>

              {isAttachFileDialogVisible && this.renderAttachFileDialog()}
              {!this.isProcessing() && showCommandDialog && this.renderCommandDialog()}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.creation,
    predefinedDraftId: ownProps.predefinedDraftId,
    issuePermissions: state.app.issuePermissions,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(createIssueActions, dispatch),
    onAddTags: (tags: Array<Tag>) => dispatch(createIssueActions.updateIssueDraft(true, {tags})),
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(CreateIssue): any);
