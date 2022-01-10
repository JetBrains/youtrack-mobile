/* @flow */

import React from 'react';

import IssueDetails from '../issue__details';
import IssueModal from './issue.modal';
import LinkedIssues from '../../../components/linked-issues/linked-issues';
import LinkedIssuesTitle from '../../../components/linked-issues/linked-issues-title';
import ModalPortal from '../../../components/modal-view/modal-portal';
import {IconBack, IconClose} from '../../../components/icon/icon';
import {ThemeContext} from '../../../components/theme/theme-context';

import styles from '../issue.styles';
import stylesModal from './issue.modal.styles';

import type {AnyIssue, IssueOnList} from '../../../flow/Issue';
import type {IssueDetailsProps} from '../issue__details';
import type {IssueLink} from '../../../flow/CustomFields';
import type {Node} from 'React';
import type {Theme} from '../../../flow/Theme';


type ModalData = {
  children: any,
  hasNoOverlay?: boolean,
};

type State = {
  addLinkChildren: any,
  modalData: ModalData,
}

//$FlowFixMe
export default class IssueModalDetails extends IssueDetails<IssueDetailsProps, State> {
  state: State = {
    addLinkChildren: null,
    modalData: {
      children: null,
    },
  };

  renderLinkedIssues: () => React$Element<any> = () => {
    const {issue, issuePermissions, getIssueLinksTitle, issuesGetter, linksGetter, onUnlink, onLinkIssue} = this.props;
    return issue && (
      <LinkedIssues
        issuesGetter={issuesGetter}
        linksGetter={linksGetter}
        onUnlink={onUnlink}
        onLinkIssue={onLinkIssue}
        onUpdate={(issues?: Array<IssueLink>) => {
          getIssueLinksTitle(issues);
        }}
        canLink={(
          issuePermissions.canLink(issue)
            ? (linkedIssue: AnyIssue) => issuePermissions.canLink(linkedIssue)
            : undefined
        )}
        subTitle={`${issue.idReadable} ${issue.summary}`}
        onHide={this.onHideModalPortal}
        closeIcon={<IconClose size={21} color={styles.link.color} style={stylesModal.backIcon}/>}
        onAddLink={(renderAddLink: (onHide: () => any) => any) => {
          this.toggleAddLinkModal(
            renderAddLink(this.toggleAddLinkModal)
          );
        }}
        onIssueLinkPress={(linkedIssue: IssueOnList) => {
          const prevModalData: ModalData = this.state.modalData;
          this.toggleModalData({
            hasNoOverlay: false,
            children: <IssueModal
              issuePlaceholder={linkedIssue}
              issueId={linkedIssue.id}
              onHide={this.onHideModalPortal}
              backIcon={<IconBack color={styles.link.color}/>}
              onBack={() => this.toggleModalData(prevModalData)}
            />,
          });
        }}
      />
    );
  };

  toggleModalData: (modalData?: ModalData) => void = (modalData: ModalData = {children: null}) => {
    this.setState({modalData});
    this.forceUpdate(); //TODO: investigate
  };

  toggleAddLinkModal: (addLinkChildren?: any) => void = (addLinkChildren: any = null): void => {
    this.setState({addLinkChildren});
    this.forceUpdate(); //TODO: investigate
  };

  renderLinksBlock: () => Node = () => {
    return (
      <LinkedIssuesTitle
        issueLinks={this.props.issue.links}
        onPress={() => this.toggleModalData({children: this.renderLinkedIssues()})}
      />
    );
  };

  onHideModalPortal: () => void = (): void => {
    this.toggleModalData();
    this.toggleAddLinkModal();
  };

  render(): Node {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const {addLinkChildren, modalData} = this.state;
          return <>
            {super.renderContent(theme.uiTheme)}
            <ModalPortal
              onHide={this.onHideModalPortal}
              hasOverlay={!modalData.hasNoOverlay}
            >
              {modalData.children}
            </ModalPortal>
            <ModalPortal
              hasOverlay={false}
              onHide={this.onHideModalPortal}
            >
              {addLinkChildren}
            </ModalPortal>
          </>;
        }}
      </ThemeContext.Consumer>
    );
  }
}

