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
};

type State = {
  modalData: ModalData,
}

//$FlowFixMe
export default class IssueModalDetails extends IssueDetails<IssueDetailsProps & {stacked: boolean}, State> {
  state: State = {
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
        onHide={this.toggleModalData}
        closeIcon={this.props.stacked ? null : <IconClose size={21} color={styles.link.color} style={stylesModal.backIcon}/>}
        onAddLink={(renderAddLink: (onHide: () => any) => any) => {
          const prevModalData: ModalData = this.state.modalData;
          this.toggleModalData({
            children: renderAddLink(() => this.toggleModalData(prevModalData)),
          });
        }}
        onIssueLinkPress={(linkedIssue: IssueOnList) => {
          const prevModalData: ModalData = this.state.modalData;
          this.toggleModalData({
            children: <IssueModal
              issuePlaceholder={linkedIssue}
              issueId={linkedIssue.id}
              onHide={this.toggleModalData}
              backIcon={<IconBack color={styles.link.color}/>}
              onBack={() => this.toggleModalData(prevModalData)}
              stacked={true}
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

  renderLinksBlock: () => Node = () => {
    return (
      <LinkedIssuesTitle
        issueLinks={this.props.issue.links}
        onPress={() => this.toggleModalData({children: this.renderLinkedIssues()})}
      />
    );
  };

  render(): Node {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return <>
            {super.renderContent(theme.uiTheme)}
            <ModalPortal
              hasOverlay={!this.props.stacked}
              onHide={() => {
                this.toggleModalData({children: null});
              }}
            >
              {this.state.modalData.children}
            </ModalPortal>
          </>;
        }}
      </ThemeContext.Consumer>
    );
  }
}

