import React from 'react';

import {connect} from 'react-redux';
import {connectActionSheet} from '@expo/react-native-action-sheet';

import issueModalActionsCreator, {
  dispatchActions,
  ISSUE_MODAL_STATE_FIELD_NAME,
} from './issue.modal-actions';
import IssueModalDetails from './issue.modal__details';
import {ANALYTICS_ISSUE_PAGE} from 'components/analytics/analytics-ids';
import {bindActionCreatorsExt} from 'util/redux-ext';
import {CommandDialogModal} from 'components/command-dialog/command-dialog';
import {IconClose} from 'components/icon/icon';
import {Issue} from '../issue';

import styles from '../issue.styles';

import type {IssueOnList} from 'types/Issue';
import type {IssueProps, OwnProps} from '../issue';
import type {ReduxThunkDispatch} from 'types/Redux';
import type {RootState} from 'reducers/app-reducer';
import type {ScrollData} from 'types/Markdown';
import type {IssueState} from '../issue-base-reducer';
import type {UITheme} from 'types/Theme';

type Props = IssueProps & {
  onHide: () => any;
  onBack?: () => any;
  backIcon?: any;
  onNavigate?: (issue: IssueOnList) => any;
  stacked?: boolean;
  onCommandApply: () => any;
};

class IssueModal extends Issue<Props> {
    handleOnBack = () => {
    if (this.props.onBack) {
      this.props.onBack();
    } else if (this.props.onHide) {
      this.props.onHide();
    } else {
      super.handleOnBack();
    }
  };
  renderBackIcon = () => {
    return this.props.backIcon !== undefined ? (
      this.props.backIcon
    ) : (
      <IconClose
        style={styles.issueModalCloseIcon}
        color={this.uiTheme.colors.$link}
      />
    );
  };
  createIssueDetails: (
    uiTheme: UITheme,
    scrollData: ScrollData,
  ) => React.ReactElement<React.ComponentProps<any>, any> = (
    uiTheme: UITheme,
    scrollData: ScrollData,
  ) => {
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
      issue,
      issuePlaceholder,
      issueLoaded,
      editMode,
      toggleVote,
      removeAttachment,
      updateIssueVisibility,
      toggleVisibleAddAttachDialog,
      onTagRemove,
      onCheckboxUpdate,
      onShowCopyTextContextActions,
      getIssueLinksTitle,
      setCustomFieldValue,
      onNavigate,
      stacked,
    } = this.props;
    return (
      <IssueModalDetails
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
        analyticCategory={ANALYTICS_ISSUE_PAGE}
        renderRefreshControl={() =>
          this.renderRefreshControl(() => this.loadIssue(), uiTheme)
        }
        onVoteToggle={toggleVote}
        onSwitchToActivity={this.switchToActivityTab}
        onRemoveAttachment={removeAttachment}
        onVisibilityChange={updateIssueVisibility}
        onAttach={toggleVisibleAddAttachDialog}
        onTagRemove={onTagRemove}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          description: string,
        ) => onCheckboxUpdate(checked, position, description)}
        onLongPress={(text: string, title?: string) => {
          onShowCopyTextContextActions(this.props.showActionSheetWithOptions, text, title);
        }}
        getIssueLinksTitle={getIssueLinksTitle}
        issuesGetter={this.props.loadIssuesXShort}
        linksGetter={this.props.loadLinkedIssues}
        onUnlink={this.props.onUnlinkIssue}
        onLinkIssue={this.props.onLinkIssue}
        setCustomFieldValue={setCustomFieldValue}
        onNavigate={onNavigate}
        stacked={stacked}
        scrollData={scrollData}
      />
    );
  };

  getActivityStateFieldName(): string {
    return ISSUE_MODAL_STATE_FIELD_NAME;
  }

  _renderCommandDialog() {
    const {
      closeCommandDialog,
      commandSuggestions,
      getCommandSuggestions,
      applyCommand,
      commandIsApplying,
      initialCommand,
    } = this.props;
    return (
      <CommandDialogModal
        suggestions={commandSuggestions}
        onCancel={closeCommandDialog}
        onChange={getCommandSuggestions}
        onApply={(command: string) => {
          applyCommand(command);

          if (this.props.onCommandApply) {
            this.props.onCommandApply();
          }
        }}
        isApplying={commandIsApplying}
        initialCommand={initialCommand}
        uiTheme={this.uiTheme}
      />
    );
  }
}

const mapStateToProps = (
  state: {
    app: RootState;
    issueModalState: IssueState;
  },
  ownProps: OwnProps,
): IssueState & OwnProps => {
    return {
    issuePermissions: state.app.issuePermissions,
    ...state.issueModalState,
    issuePlaceholder: ownProps.issuePlaceholder,
    issueId: ownProps.issueId,
    user: state.app.user,
    navigateToActivity: ownProps.navigateToActivity,
  };
};

export const issueModalActions = issueModalActionsCreator();

const mapDispatchToProps = (dispatch: ReduxThunkDispatch) => {
  return {
    ...bindActionCreatorsExt(issueModalActions, dispatch),
    dispatcher: dispatch,
    setIssueId: (issueId: string) => dispatch(dispatchActions.setIssueId(issueId)),
    setIssueSummaryCopy: (summary: string) =>
      dispatch(dispatchActions.setIssueSummaryCopy(summary)),
    setIssueDescriptionCopy: (description: string) =>
      dispatch(dispatchActions.setIssueDescriptionCopy(description)),
    stopEditingIssue: () => dispatch(dispatchActions.stopEditingIssue()),
    closeCommandDialog: () => dispatch(dispatchActions.closeCommandDialog()),
  };
};

export default connectActionSheet(connect(mapStateToProps, mapDispatchToProps)(IssueModal));
