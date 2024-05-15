import React, {PureComponent} from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';

import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as createIssueActions from './create-issue-actions';
import AttachFileDialog from 'components/attach-file/attach-file-dialog';
import AttachmentAddPanel from 'components/attachments-row/attachments-add-panel';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import CommandDialog from 'components/command-dialog/command-dialog';
import CustomFieldsPanel from 'components/custom-fields-panel/custom-fields-panel';
import Header from 'components/header/header';
import IssueCustomFieldText from 'components/custom-field/issue-custom-field-text';
import IssueDrafts from 'views/create-issue/create-issue-drafts';
import KeyboardSpacerIOS from 'components/platform/keyboard-spacer.ios';
import LinkedIssues from 'components/linked-issues/linked-issues';
import LinkedIssuesAddLink from 'components/linked-issues/linked-issues-add-link';
import LinkedIssuesTitle from 'components/linked-issues/linked-issues-title';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import SummaryDescriptionForm from 'components/form/summary-description-form';
import TagAddPanel from 'components/tags/tag-add-panel';
import TagAddSelect from 'components/tags/tag-add-select';
import Tags from 'components/tags/tags';
import usage from 'components/usage/usage';
import VisibilityControl from 'components/visibility/visibility-control';
import {ANALYTICS_ISSUE_CREATE_PAGE} from 'components/analytics/analytics-ids';
import {getApi} from 'components/api/api__instance';
import {
  getIssueCustomFieldsNotText,
  getIssueTextCustomFields,
} from 'components/custom-field/custom-field-helper';
import {DEFAULT_THEME} from 'components/theme/theme';
import {HIT_SLOP} from 'components/common-styles';
import {i18n, i18nPlural} from 'components/i18n/i18n';
import {
  IconCheck,
  IconClose,
  IconBack,
  IconMoreOptions,
  IconLink,
} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {AnyIssue, IssueFull} from 'types/Issue';
import type {AttachmentActions} from 'components/attachments-row/attachment-actions';
import type {CreateIssueState} from './create-issue-reducers';
import type {
  Attachment,
  CustomField,
  CustomFieldText,
  IssueLink,
  Tag,
} from 'types/CustomFields';

import styles from './create-issue.styles';

import type {NormalizedAttachment} from 'types/Attachment';
import type {Theme, UITheme, UIThemeColors} from 'types/Theme';
import {AppState} from 'reducers';
import {IssueCreate} from 'types/Issue';
import {Project} from 'types/Project';

type AdditionalProps = {
  issuePermissions: IssuePermissions;
  predefinedDraftId: string | null;
  drafts: IssueCreate[];
  updateDraft: (ignoreFields: boolean, tags?: Tag[]) => () => Promise<void>;
  onHide?: () => void;
  isMatchesQuery?: () => boolean;
  isConnected: boolean;
  starId: string;
};

type Props = CreateIssueState &
  typeof createIssueActions &
  AttachmentActions &
  AdditionalProps & {
  isSplitView?: boolean;
};

interface State {
  modalChildren: any;
  showAddTagSelect: boolean;
}


class CreateIssue extends PureComponent<Props, State> {
  static contextTypes = {
    actionSheet: Function,
  };
  private uiTheme: UITheme | undefined;
  state = {
    modalChildren: null,
    showAddTagSelect: false,
  };

  constructor(props: Props) {
    super(props);
    usage.trackScreenView(ANALYTICS_ISSUE_CREATE_PAGE);
    this.toggleSetModalChildren = this.toggleSetModalChildren.bind(this);
  }

  getUITheme(): UITheme {
    return this.uiTheme || DEFAULT_THEME;
  }

  getUIThemeColors(): UIThemeColors {
    return this.getUITheme().colors;
  }

  componentDidMount() {
    this.props.initializeWithDraftOrProject(this.props.predefinedDraftId);
  }

  onAddAttachment = async (
    files: NormalizedAttachment[],
    onAttachingFinish: () => any,
  ) => {
    const {uploadIssueAttach, loadAttachments} = this.props;
    await uploadIssueAttach(files);
    onAttachingFinish();
    loadAttachments();
  };
  cancelAddAttach = () => {
    const {cancelAddAttach, hideAddAttachDialog, attachingImage} = this.props;
    cancelAddAttach(attachingImage as Attachment);
    hideAddAttachDialog();
  };
  renderAttachFileDialog = (): React.ReactNode => {
    const {issue} = this.props;

    if (!issue || !issue.id) {
      return null;
    }

    return (
      <AttachFileDialog
        analyticsId={ANALYTICS_ISSUE_CREATE_PAGE}
        getVisibilityOptions={() =>
          getApi().issue.getVisibilityOptions(issue.id)
        }
        actions={{
          onAttach: this.onAddAttachment,
          onCancel: this.cancelAddAttach,
        }}
      />
    );
  };
  canUpdateField = (field: CustomField) => this.props.issuePermissions.canUpdateField(this.props.issue as IssueFull, field);
  canCreateIssueToProject = (project: Project) => this.props.issuePermissions.canCreateIssueToProject(project);
  onFieldUpdate = async (field: CustomField, value: any) => await this.props.updateFieldValue(field, value);
  onUpdateProject = async (project: Project) => await this.props.updateProject(project);

  renderCustomFieldPanel() {
    const {issue, isConnected} = this.props;
    return (
      <CustomFieldsPanel
        analyticsId={ANALYTICS_ISSUE_CREATE_PAGE}
        autoFocusSelect
        testID="test:id/createIssueFields"
        accessibilityLabel="createIssueFields"
        accessible={false}
        issueId={issue.id}
        issueProject={issue.project as Project}
        fields={getIssueCustomFieldsNotText(issue.fields)}
        hasPermission={{
          canUpdateField: isConnected ? this.canUpdateField : undefined,
          canCreateIssueToProject: isConnected ? this.canCreateIssueToProject : undefined,
          canEditProject: isConnected,
        }}
        onUpdate={this.onFieldUpdate}
        onUpdateProject={this.onUpdateProject}
        uiTheme={this.getUITheme()}
      />
    );
  }

  renderIssueVisibility() {
    const {issue, updateVisibility} = this.props;
    return (
      <View style={styles.visibility}>
        <VisibilityControl
          visibility={issue.visibility}
          onSubmit={updateVisibility}
          uiTheme={this.getUITheme()}
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
    return (
      <CommandDialog
        suggestions={commandSuggestions}
        onCancel={() => toggleCommandDialog(false)}
        onChange={getCommandSuggestions}
        onApply={applyCommand}
        isApplying={commandIsApplying}
        initialCommand={''}
        uiTheme={this.getUITheme()}
      />
    );
  }

  isActionDisabled(): boolean {
    return this.isProcessing() || !this.hasProject() || !this.props.isConnected;
  }

  renderActionsIcon() {
    return (
      <TouchableOpacity
        style={styles.moreActionsButton}
        hitSlop={HIT_SLOP}
        onPress={() => {
          !this.isProcessing() &&
          this.props.showContextActions((this.context as any).actionSheet());
        }}
      >
        <Text style={styles.iconMore}>
          <IconMoreOptions color={this.getUIThemeColors().$link}/>
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

  toggleSetModalChildren(modalChildren: any = null) {
    this.setState({
      modalChildren,
    });
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
      isSplitView,
    } = this.props;

    const renderLinkedIssues = (onHide: () => void) => (
      <LinkedIssues
        issuesGetter={loadIssuesXShort}
        linksGetter={loadLinkedIssues}
        onUnlink={onUnlinkIssue}
        onLinkIssue={onLinkIssue}
        onUpdate={(issues?: IssueLink[]) => {
          getIssueLinksTitle(issues);
        }}
        canLink={
          issuePermissions.canLink(issue)
            ? (linkedIssue: AnyIssue) => issuePermissions.canLink(linkedIssue)
            : undefined
        }
        subTitle={i18n('Current issue')}
        onHide={onHide}
        onAddLink={(renderChildren: (arg0: () => any) => any) => {
          if (isSplitView) {
            this.toggleSetModalChildren(
              renderChildren(this.toggleSetModalChildren),
            );
          } else {
            Router.Page({
              children: renderChildren(onHide),
            });
          }
        }}
      />
    );

    return (
      <LinkedIssuesTitle
        issueLinks={issue.links}
        onPress={() => {
          if (this.props.isSplitView) {
            this.toggleSetModalChildren(
              renderLinkedIssues(this.toggleSetModalChildren),
            );
          } else {
            Router.Page({
              children: renderLinkedIssues(() => Router.pop()),
            });
          }
        }}
      />
    );
  }

  onHide = async () => {
    await this.props.storeDraftAndGoBack();

    if (this.props.onHide) {
      this.props.onHide();
    } else {
      Router.pop();
    }
  };
  renderLinkedIssuesAddLink = () => {
    const {
      loadIssuesXShort,
      onLinkIssue,
      getIssueLinksTitle,
      processing,
    } = this.props;
    const iconLink = (
      <IconLink
        color={
          processing
            ? styles.addLinkButtonTextDisabled.color
            : styles.addLinkButtonText.color
        }
      />
    );

    const renderAddLinkedIssue = (onHide: () => void) => (
      <LinkedIssuesAddLink
        issuesGetter={loadIssuesXShort}
        onLinkIssue={onLinkIssue}
        onUpdate={(issues?: IssueLink[]) => {
          getIssueLinksTitle(issues);
        }}
        onHide={onHide}
      />
    );

    return (
      <>
        <TouchableOpacity
          style={styles.addLinkButton}
          onPress={() => {
            if (this.props.isSplitView) {
              this.toggleSetModalChildren(
                renderAddLinkedIssue(this.toggleSetModalChildren),
              );
            } else {
              Router.Page({
                children: renderAddLinkedIssue(() => Router.pop()),
              });
            }
          }}
        >
          {iconLink}
          <Text style={styles.addLinkButtonText}>{i18n('Link issue')}</Text>
        </TouchableOpacity>

        {this.props.isSplitView && (
          <ModalPortal
            hasOverlay={false}
            onHide={() => this.toggleSetModalChildren(null)}
          >
            {this.state.modalChildren ? this.state.modalChildren : null}
          </ModalPortal>
        )}
      </>
    );
  };

  renderDraftsButton() {
    const {drafts} = this.props;
    return drafts.length > 0 ? (
      <TouchableOpacity
        style={styles.draftsButton}
        hitSlop={HIT_SLOP}
        onPress={async () => {
          await this.props.updateDraft(false);
          Router.PageModal({children: <IssueDrafts onHide={this.props.onHide}/>});
        }}
      >
        <Text style={styles.draftsButtonText}>
          {`${i18nPlural(
            drafts.length, '{{amount}} draft', '{{amount}} drafts', {amount: drafts.length}
          )}`}
        </Text>
      </TouchableOpacity>
    ) : null;
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
      onHide,
      isMatchesQuery,
      isConnected,
      starId,
    } = this.props;
    const isAttaching = attachingImage !== null;
    const isProcessing = processing || isAttaching;
    const canCreateIssue = issue.summary && issue?.project?.id && !isProcessing;
    const Icon = onHide ? IconClose : IconBack;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          const uiThemeColors: UIThemeColors = this.getUIThemeColors();
          const hasProject: boolean = this.hasProject();
          const rightButton = processing ? (
            <ActivityIndicator color={uiThemeColors.$link}/>
          ) : (
            <IconCheck
              style={styles.applyButton}
              color={
                canCreateIssue && isConnected
                  ? uiThemeColors.$link
                  : uiThemeColors.$disabled
              }
            />
          );
          return (
            <View testID="createIssue" style={styles.container}>
              <Header
                title={i18n('New Issue')}
                showShadow={true}
                leftButton={<Icon color={uiThemeColors.$link}/>}
                onBack={this.onHide}
                rightButton={rightButton}
                extraButton={!this.isActionDisabled() ? (
                  <View style={styles.row}>
                    {this.renderDraftsButton()}
                    {this.renderActionsIcon()}
                  </View>
                ) : null}
                onRightButtonClick={() =>
                  canCreateIssue &&
                  isConnected &&
                  createIssue(onHide, isMatchesQuery)
                }
              />

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

                {hasProject &&
                  getIssueTextCustomFields(this.props.issue.fields).map(
                    (textField: CustomFieldText, index: number) => {
                      return (
                        <IssueCustomFieldText
                          testID="test:id/issue-custom-field"
                          accessibilityLabel="issue-custom-field"
                          accessible={true}
                          key={`issueCustomFieldText${index}`}
                          style={styles.textFields}
                          editMode={true}
                          onUpdateFieldValue={async (
                            fieldValue: string,
                          ): Promise<void> => {
                            await this.props.updateFieldValue(textField, {
                              text: fieldValue,
                            });
                          }}
                          textField={textField}
                          usesMarkdown={issue.usesMarkdown}
                        />
                      );
                    },
                  )}

                {hasProject && (
                  <>
                    <View
                      style={[styles.separator, styles.separatorWithMargin]}
                    />
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

                      <View
                        testID="test:id/attachment-button"
                        accessibilityLabel="attachment-button"
                        accessible={true}
                      >
                        <AttachmentsRow
                          style={[
                            styles.additionalData,
                            styles.issueAttachments,
                          ]}
                          attachments={issue.attachments}
                          attachingImage={attachingImage}
                          imageHeaders={getApi().auth.getAuthorizationHeaders()}
                          canRemoveAttachment={true}
                          onRemoveImage={removeAttachment}
                          uiTheme={this.getUITheme()}
                        />
                      </View>
                    </View>
                  </>
                )}

                {hasProject && (
                  <>
                    <View style={styles.separator}/>
                    <View
                      testID="test:id/attachment-button"
                      accessibilityLabel="attachment-button"
                      accessible={false}
                      style={styles.additionalData}
                    >
                      {hasProject && (
                        <TagAddPanel
                          disabled={processing}
                          onAdd={() =>
                            this.setState({
                              showAddTagSelect: true,
                            })
                          }
                        />
                      )}
                      {!!issue.tags && (
                        <Tags tags={issue.tags} multiline={true}/>
                      )}
                      {this.state.showAddTagSelect && (
                        <TagAddSelect
                          starId={starId}
                          existed={issue?.tags}
                          projectId={issue.project.id as string}
                          onAdd={(tags: Tag[]) =>
                            this.props.updateDraft(true, tags)
                          }
                          onHide={() =>
                            this.setState({
                              showAddTagSelect: false,
                            })
                          }
                        />
                      )}
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
                      {hasProject &&
                        issuePermissions.canLink(issue) &&
                        this.renderLinkedIssuesAddLink()}
                      {hasProject && this.renderLinksBlock()}
                    </View>
                  </>
                )}
              </ScrollView>

              <KeyboardSpacerIOS/>

              {isAttachFileDialogVisible && this.renderAttachFileDialog()}
              {!this.isProcessing() &&
                showCommandDialog &&
                this.renderCommandDialog()}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: { predefinedDraftId?: string }) => {
  return {
    ...state.creation,
    ...ownProps,
    issuePermissions: state.app.issuePermissions,
    isConnected: !!state.app.networkState?.isConnected,
    starId: state.app.user?.profiles?.general?.star?.id,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    ...bindActionCreators(createIssueActions, dispatch),
    deleteAllDrafts: () => {
      dispatch(createIssueActions.deleteAllDrafts());
    },
    deleteDraft: (id: string) => {
      dispatch(createIssueActions.deleteDraft(id));
    },
    updateDraft: (ignoreFields: boolean, tags?: Tag[]) => {
      dispatch(createIssueActions.updateIssueDraft(ignoreFields, tags ? {tags} : undefined));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateIssue);
