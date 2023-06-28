import React, {PureComponent} from 'react';
import {
  ScrollView,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as createIssueActions from './create-issue-actions';
import AttachFileDialog from 'components/attach-file/attach-file-dialog';
import AttachmentAddPanel from 'components/attachments-row/attachments-add-panel';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import CommandDialog from 'components/command-dialog/command-dialog';
import CustomFieldsPanel from 'components/custom-fields-panel/custom-fields-panel';
import Header from 'components/header/header';
import IconLink from '@jetbrains/icons/link.svg';
import IssueCustomFieldText from 'components/custom-field/issue-custom-field-text';
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
import {i18n} from 'components/i18n/i18n';
import {
  IconCheck,
  IconClose,
  IconDrag,
  IconMoreOptions,
} from 'components/icon/icon';
import {isIOSPlatform} from 'util/util';
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
  IssueProject,
  Tag,
} from 'types/CustomFields';

import styles from './create-issue.styles';

import type {NormalizedAttachment} from 'types/Attachment';
import type {Theme, UITheme, UIThemeColors} from 'types/Theme';
import {AppState} from 'reducers';

type AdditionalProps = {
  issuePermissions: IssuePermissions;
  predefinedDraftId: string | null | undefined;
  onAddTags: (tags: Tag[]) => () => Promise<void>;
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

  UNSAFE_componentWillMount() {
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
  renderAttachFileDialog = (): React.ReactElement<
    React.ComponentProps<typeof AttachFileDialog>,
    typeof AttachFileDialog
  > | null => {
    const {issue} = this.props;

    if (!issue || !issue.id) {
      return null;
    }

    return (
      <AttachFileDialog
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
  canCreateIssueToProject = (project: IssueProject) => this.props.issuePermissions.canCreateIssueToProject(project);
  onFieldUpdate = async (field: CustomField, value: any) => await this.props.updateFieldValue(field, value);
  onUpdateProject = async (project: IssueProject) => await this.props.updateProject(project);

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
        issueProject={issue.project as IssueProject}
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

  renderActionsIcon() {
    if (this.isProcessing() || !this.hasProject() || !this.props.isConnected) {
      return null;
    }

    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        onPress={() => {
          !this.isProcessing() &&
          this.props.showContextActions(this.context.actionSheet());
        }}
      >
        <Text style={styles.iconMore}>
          {isIOSPlatform() ? (
            <IconMoreOptions size={18} color={this.getUIThemeColors().$link}/>
          ) : (
            <Text>
              <IconDrag size={18} color={this.getUIThemeColors().$link}/>
            </Text>
          )}
          <Text> </Text>
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
      Router.pop(true);
    }
  };
  renderLinkedIssuesAddLink = () => {
    const {
      loadIssuesXShort,
      onLinkIssue,
      getIssueLinksTitle,
      processing,
    } = this.props;
    const iconLink: any = (
      <IconLink
        width={24}
        height={24}
        fill={
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
      onHide = () => Router.pop(true),
      isMatchesQuery,
      isConnected,
      starId,
    } = this.props;
    const isAttaching = attachingImage !== null;
    const isProcessing = processing || isAttaching;
    const canCreateIssue = issue.summary && issue?.project?.id && !isProcessing;
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
              size={20}
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
                leftButton={<IconClose size={21} color={uiThemeColors.$link}/>}
                onBack={this.onHide}
                rightButton={rightButton}
                extraButton={this.renderActionsIcon()}
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
                          projectId={issue.project?.id}
                          onAdd={(tags: Tag[]) =>
                            this.props.onAddTags(tags)
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
    predefinedDraftId: ownProps.predefinedDraftId,
    issuePermissions: state.app.issuePermissions,
    isConnected: !!state.app.networkState?.isConnected,
    starId: state.app.user?.profiles?.general?.star?.id,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    ...bindActionCreators(createIssueActions, dispatch),
    onAddTags: (tags: Tag[]) =>
      dispatch(
        createIssueActions.updateIssueDraft(true, {
          tags,
        }),
      ),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateIssue);
