/* @flow */

import React from 'react';

import {Issue, connectIssue} from './issue';
import IssueModalDetails from './issue.modal__details';

import type {UITheme} from '../../flow/Theme';
import type {IssueProps} from './issue';
import {IconClose} from '../../components/icon/icon';

type Props = {
  ...IssueProps,
  onHide: () => any,
};

//$FlowFixMe
class IssueModal extends Issue<Props> {

  //$FlowFixMe
  handleOnBack = () => {
    if (this.props.onHide) {
      this.props.onHide();
    } else {
      //$FlowFixMe
      super.handleOnBack();
    }
  };

  renderBackIcon = () => {
    return <IconClose size={21} color={this.uiTheme.colors.$link}/>;
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
      onShowCopyTextContextActions,
      getIssueLinksTitle,

      setCustomFieldValue,
      isTablet,
    } = this.props;

    return (
      //$FlowFixMe
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

        analyticCategory={this.CATEGORY_NAME}
        renderRefreshControl={() => this.renderRefreshControl(() => this.loadIssue(), uiTheme)}

        onVoteToggle={toggleVote}
        onSwitchToActivity={this.switchToActivityTab}

        onRemoveAttachment={removeAttachment}

        onVisibilityChange={updateIssueVisibility}

        onAttach={toggleVisibleAddAttachDialog}
        onTagRemove={onTagRemove}

        onCheckboxUpdate={(checked: boolean, position: number, description: string) => onCheckboxUpdate(
          checked, position, description)}
        onLongPress={(text: string, title?: string) => {
          onShowCopyTextContextActions(this.context.actionSheet(), text, title);
        }}
        getIssueLinksTitle={getIssueLinksTitle}
        issuesGetter={this.props.loadIssuesXShort}
        linksGetter={this.props.loadLinkedIssues}
        onUnlink={this.props.onUnlinkIssue}
        onLinkIssue={this.props.onLinkIssue}

        setCustomFieldValue={setCustomFieldValue}
        isTablet={isTablet}
      />
    );
  };

}

export default (connectIssue(IssueModal): React$AbstractComponent<Props, mixed>);
