/* @flow */

import React from 'react';

import IssueDetails from './issue__details';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import LinkedIssuesTitle from '../../components/linked-issues/linked-issues-title';
import ModalPortal from '../../components/modal-view/modal-portal';
import {IconClose} from '../../components/icon/icon';
import {ThemeContext} from '../../components/theme/theme-context';

import styles from './issue.styles';

import type {AnyIssue} from '../../flow/Issue';
import type {IssueDetailsProps} from './issue__details';
import type {IssueLink} from '../../flow/CustomFields';
import type {Node} from 'React';
import type {Theme} from '../../flow/Theme';


type State = {
  addLinkChildren: any,
  isLinksVisible: boolean,
}

//$FlowFixMe
export default class IssueModalDetails extends IssueDetails<IssueDetailsProps, State> {
  state = {
    addLinkChildren: null,
    isLinksVisible: false,
  }

  renderLinkedIssues: () => React$Element<any> = () => {
    const {issue, issuePermissions, getIssueLinksTitle} = this.props;
    return (
      <LinkedIssues
        issuesGetter={this.props.issuesGetter}
        linksGetter={this.props.linksGetter}
        onUnlink={this.props.onUnlink}
        onLinkIssue={this.props.onLinkIssue}
        onUpdate={(issues?: Array<IssueLink>) => {
          getIssueLinksTitle(issues);
        }}
        canLink={(
          issuePermissions.canLink(issue)
            ? (linkedIssue: AnyIssue) => issuePermissions.canLink(linkedIssue)
            : undefined
        )}
        subTitle={`${issue.idReadable} ${issue.summary}`}
        onHide={this.toggleModal}
        closeIcon={<IconClose size={21} color={styles.link.color}/>}
        onAddLink={(renderAddLink: (onHide: () => any) => any) => {
          this.toggleAddLinkModal(renderAddLink(this.toggleAddLinkModal));
        }}
      />
    );
  };

  toggleModal: (isLinksVisible?: boolean) => void = (isLinksVisible: boolean = false): void => {
    this.setState({isLinksVisible});
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
        onPress={() => this.toggleModal(true)}
      />
    );
  };

  render(): Node {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          const onHide = () => {
            this.toggleModal();
            this.toggleAddLinkModal();
          };
          return <>
            {super.renderContent(theme.uiTheme)}
            <ModalPortal
              hasOverlay={this.props.isTablet}
              onHide={onHide}
            >
              {this.props.issue && this.state.isLinksVisible && this.renderLinkedIssues()}
            </ModalPortal>
            <ModalPortal
              hasOverlay={false}
              onHide={onHide}
            >
              {this.state.addLinkChildren ? this.state.addLinkChildren : null}
            </ModalPortal>
          </>;
        }}
      </ThemeContext.Consumer>
    );
  }
}

