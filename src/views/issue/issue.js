/* @flow */

import React from 'react';
import {RefreshControl, Text, View} from 'react-native';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as issueActions from './issue-actions';
import AttachFileDialog from '../../components/attach-file/attach-file-dialog';
import ColorField from '../../components/color-field/color-field';
import CommandDialog from '../../components/command-dialog/command-dialog';
import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IssueActivity from './activity/issue__activity';
import IssueDetails from './issue__details';
import IssueTabbed from '../../components/issue-tabbed/issue-tabbed';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Star from '../../components/star/star';
import usage from '../../components/usage/usage';
import {attachmentActions} from './issue__attachment-actions-and-types';
import {getApi} from '../../components/api/api__instance';
import {getReadableID} from '../../components/issue-formatter/issue-formatter';
import {IconBack, IconCheck, IconClose, IconDrag, IconMoreOptions} from '../../components/icon/icon';
import {isIOSPlatform} from '../../util/util';
import {IssueContext} from './issue-context';
import {Skeleton} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './issue.styles';

import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {AnyIssue} from '../../flow/Issue';
import type {Attachment, Tag} from '../../flow/CustomFields';
import type {IssueTabbedState} from '../../components/issue-tabbed/issue-tabbed';
import type {State as IssueState} from './issue-reducers';
import type {Theme, UITheme} from '../../flow/Theme';

const CATEGORY_NAME = 'Issue';

const isIOS: boolean = isIOSPlatform();

type AdditionalProps = {
  issuePermissions: IssuePermissions,
  issuePlaceholder: Object,

  uploadAttach: (attach: Attachment) => any,
  loadAttachments: () => any,
  hideAddAttachDialog: () => any,
  createAttachActions: () => any,
  removeAttachment: (attach: Attachment) => any,
  isTagsSelectVisible: boolean
};

type IssueProps = IssueState & typeof issueActions & AdditionalProps;

//$FlowFixMe
class Issue extends IssueTabbed<IssueProps, IssueTabbedState> {
  static contextTypes = {
    actionSheet: Function,
  };

  imageHeaders = getApi().auth.getAuthorizationHeaders();
  backendUrl = getApi().config.backendUrl;
  renderRefreshControl = this._renderRefreshControl.bind(this);


  async componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    await this.props.unloadIssueIfExist();
    await this.props.setIssueId(this.props.issueId);
    this.loadIssue();
  }

  componentDidUpdate(prevProps: $Shape<IssueProps>): void {
    if (this.props.editMode === true && !prevProps.editMode && this.state.index === 1) {
      this.switchToDetailsTab();
    }
  }

  async loadIssue() {
    await this.props.loadIssue();
    this.props.loadIssueLinks();
  }

  renderDetails = (uiTheme: UITheme) => {
    const {
      loadIssue,
      openNestedIssueView,
      attachingImage,
      refreshIssue,
      issuePermissions,
      updateIssueFieldValue,
      updateProject,

      isSavingEditedIssue,
      summaryCopy,
      descriptionCopy,
      openIssueListWithSearch,
      setIssueSummaryCopy,
      setIssueDescriptionCopy,

      issue, issuePlaceholder, issueLoaded, editMode,
      toggleVote,

      removeAttachment,
      updateIssueVisibility,

      toggleVisibleAddAttachDialog,
      onTagRemove,

      onCheckboxUpdate,
    } = this.props;

    return (
      <IssueDetails
        loadIssue={loadIssue}
        openNestedIssueView={openNestedIssueView}
        attachingImage={attachingImage}
        refreshIssue={refreshIssue}

        issuePermissions={issuePermissions}
        updateIssueFieldValue={updateIssueFieldValue}
        updateProject={updateProject}

        issue={issue}
        issuePlaceholder={issuePlaceholder}
        issueLoaded={issueLoaded}
        editMode={editMode}

        openIssueListWithSearch={openIssueListWithSearch}
        isSavingEditedIssue={isSavingEditedIssue}

        summaryCopy={summaryCopy}
        descriptionCopy={descriptionCopy}
        setIssueSummaryCopy={setIssueSummaryCopy}
        setIssueDescriptionCopy={setIssueDescriptionCopy}

        analyticCategory={CATEGORY_NAME}
        renderRefreshControl={() => this.renderRefreshControl(() => this.loadIssue(), uiTheme)}

        onVoteToggle={toggleVote}
        onSwitchToActivity={this.switchToActivityTab}

        onRemoveAttachment={removeAttachment}

        onVisibilityChange={updateIssueVisibility}

        onAttach={toggleVisibleAddAttachDialog}
        onTagRemove={onTagRemove}

        onCheckboxUpdate={(checked: boolean, position: number, description: string) => onCheckboxUpdate(checked, position, description)}
      />
    );
  }

  renderActivity = (uiTheme: UITheme) => {
    const {issue, user, issuePermissions, selectProps, updateUserAppearanceProfile, openNestedIssueView} = this.props;

    return (
      <IssueActivity
        issue={issue}
        user={user}
        openNestedIssueView={openNestedIssueView}
        issuePermissions={issuePermissions}
        selectProps={selectProps}
        updateUserAppearanceProfile={updateUserAppearanceProfile}
        renderRefreshControl={(loadActivities: () => any) => this.renderRefreshControl(loadActivities, uiTheme)}
      />
    );
  };

  isTabChangeEnabled() {
    const {editMode, isSavingEditedIssue, isRefreshing, attachingImage} = this.props;
    return !editMode && !isSavingEditedIssue && !isRefreshing && !attachingImage;
  }

  handleOnBack = () => {
    const returned = Router.pop(false, {issueId: this.props?.issue?.id});
    if (!returned) {
      Router.Issues();
    }
  };

  renderBackIcon(uiTheme: UITheme) {
    return <IconBack color={uiTheme.colors.$link}/>;
  }

  canStar = (): boolean => {
    const {issue, issuePermissions} = this.props;
    return issue && issuePermissions && issuePermissions.canStar();
  };

  renderActionsIcon(uiTheme: UITheme) {
    if (!this.isIssueLoaded()) {
      return <Skeleton width={24}/>;
    }
    return (
      <Text style={styles.iconMore}>
        {isIOS
          ? <IconMoreOptions size={18} color={uiTheme.colors.$link}/>
          : <Text><IconDrag size={18} color={uiTheme.colors.$link}/></Text>
        }
        <Text>{' '}</Text>
      </Text>
    );
  }

  renderStar = (uiTheme: UITheme) => {
    const {issue, toggleStar} = this.props;
    if (this.isIssueLoaded()) {
      return (
        <Star
          style={styles.issueStar}
          canStar={this.canStar()}
          hasStar={issue.watchers.hasStar}
          onStarToggle={toggleStar}
          uiTheme={uiTheme}
        />
      );
    }

    return <Skeleton width={24}/>;
  };


  renderHeaderIssueTitle() {
    const {issue, issuePlaceholder, issueLoadingError} = this.props;
    const _issue: AnyIssue = issue || issuePlaceholder;
    const readableID: ?string = getReadableID(_issue);
    if (readableID) {
      return (
        <Text
          style={[styles.headerText, _issue?.resolved ? styles.headerTextResolved : null]}
          selectable={true}
          testID="issue-id"
        >
          {readableID}
        </Text>
      );
    }

    return this.isIssueLoaded() ? null : !issueLoadingError && <Skeleton width={120}/> || null;
  }

  _renderHeader() {
    const {
      issue,
      editMode,
      summaryCopy,
      isSavingEditedIssue,
      saveIssueSummaryAndDescriptionChange,
      showIssueActions,
      stopEditingIssue,
      issuePermissions,
    } = this.props;

    const issueIdReadable = this.renderHeaderIssueTitle();
    if (!editMode) {
      const isIssueLoaded: boolean = this.isIssueLoaded();
      return (
        <Header
          leftButton={this.renderBackIcon(this.uiTheme)}
          rightButton={isIssueLoaded ? this.renderActionsIcon(this.uiTheme) : null}
          extraButton={isIssueLoaded ? this.renderStar(this.uiTheme) : null}
          onRightButtonClick={() => {
            if (isIssueLoaded) {
              showIssueActions(
                this.context.actionSheet(),
                {
                  canAttach: issuePermissions.canAddAttachmentTo(issue),
                  canEdit: issuePermissions.canUpdateGeneralInfo(issue),
                  canApplyCommand: issuePermissions.canRunCommand(issue),
                  canTag: issuePermissions.canTag(issue),
                },
                this.switchToDetailsTab,
              );
            }
          }
          }
          onBack={this.handleOnBack}
        >
          {issueIdReadable}
        </Header>
      );
    } else {
      const canSave: boolean = Boolean(summaryCopy) && !isSavingEditedIssue;
      const linkColor: string = this.uiTheme.colors.$link;
      const textSecondaryColor: string = this.uiTheme.colors.$textSecondary;

      return (
        <Header
          style={styles.header}
          leftButton={
            <IconClose
              size={21}
              color={isSavingEditedIssue ? textSecondaryColor : linkColor}
            />}
          onBack={stopEditingIssue}
          rightButton={<IconCheck size={20} color={canSave ? linkColor : textSecondaryColor}/>}
          onRightButtonClick={canSave ? saveIssueSummaryAndDescriptionChange : () => {}}
        >
          {issueIdReadable}
        </Header>
      );
    }
  }

  _renderRefreshControl(onRefresh?: Function, uiTheme: UITheme) {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      tintColor={uiTheme.colors.$link}
      onRefresh={() => {
        if (onRefresh) {
          onRefresh();
        }
      }}
    />;
  }

  _renderCommandDialog() {
    const {
      issue,
      closeCommandDialog,
      commandSuggestions,
      loadCommandSuggestions,
      applyCommand,
      commandIsApplying,
      initialCommand,
    } = this.props;

    return <CommandDialog
      headerContent={getReadableID(issue)}
      suggestions={commandSuggestions}
      onCancel={closeCommandDialog}
      onChange={loadCommandSuggestions}
      onApply={applyCommand}
      isApplying={commandIsApplying}
      initialCommand={initialCommand}
      uiTheme={this.uiTheme}
    />;
  }

  renderAttachFileDialog() {
    const {attachingImage, createAttachActions} = this.props;
    return (
      <AttachFileDialog
        issueId={this.props?.issue?.id}
        attach={attachingImage}
        actions={createAttachActions()}
        onCancel={this.cancelAddAttach}
        onAttach={this.addAttachment}
        uiTheme={this.uiTheme}
      />
    );
  }

  cancelAddAttach = () => {
    const {cancelAddAttach, toggleVisibleAddAttachDialog, attachingImage} = this.props;
    cancelAddAttach(attachingImage);
    toggleVisibleAddAttachDialog(false);
  };

  addAttachment = async (attach: Attachment, onAttachingFinish: () => any) => {
    const {uploadAttach, loadAttachments} = this.props;
    await uploadAttach(attach);
    onAttachingFinish();
    loadAttachments();
  };

  isIssueLoaded = (): boolean => {
    const {issueLoaded, issueLoadingError} = this.props;
    return Boolean(issueLoaded && !issueLoadingError);
  };

  renderTagsSelect() {
    const {selectProps} = this.props;
    return (
      <Select
        {...selectProps}
        titleRenderer={(tag: Tag) => {
          return (
            <ColorField
              fullText={true}
              text={tag.name}
              color={tag.color}
              style={styles.issueTagSelectItem}
            />
          );
        }}
      />
    );
  }

  render() {
    const {
      issue,
      issueLoadingError,
      showCommandDialog,
      isAttachFileDialogVisible,
      isTagsSelectVisible,
      issuePermissions,
      dispatcher
    } = this.props;

    return (
      <IssueContext.Provider
        value={{
          issue,
          issuePermissions,
          dispatcher
        }}
      >
        <ThemeContext.Consumer>
          {(theme: Theme) => {
            this.uiTheme = theme.uiTheme;
            return (
              <View style={styles.container} testID="issue-view">
                {this._renderHeader()}

                {issueLoadingError && <View style={styles.error}><ErrorMessage error={issueLoadingError}/></View>}

                {!issueLoadingError && this.renderTabs(this.uiTheme)}

                {this.isIssueLoaded() && showCommandDialog && this._renderCommandDialog()}

                {isAttachFileDialogVisible && this.renderAttachFileDialog()}

                {isTagsSelectVisible && this.renderTagsSelect()}
              </View>
            );
          }}
        </ThemeContext.Consumer>
      </IssueContext.Provider>
    );
  }
}

const mapStateToProps = (state: { app: Object, issueState: IssueState }, ownProps): IssueState => {
  return {
    issuePermissions: state.app.issuePermissions,
    ...state.issueState,
    issuePlaceholder: ownProps.issuePlaceholder,
    issueId: ownProps.issueId,
    user: state.app.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    createAttachActions: () => attachmentActions.createAttachActions(dispatch),
    dispatcher: dispatch,
  };
};

export default (connect(mapStateToProps, mapDispatchToProps)(Issue): any);
