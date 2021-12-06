/* @flow */

import React from 'react';

import IssueDetails from './issue__details';
import LinkedIssues from '../../components/linked-issues/linked-issues';
import LinkedIssuesTitle from '../../components/linked-issues/linked-issues-title';
import Router from '../../components/router/router';
import {IconClose} from '../../components/icon/icon';
import {modalHide, modalShow} from '../../components/modal-view/modal-helper';

import styles from './issue.styles';

import type {AnyIssue} from '../../flow/Issue';
import type {IssueDetailsProps} from './issue__details';
import type {IssueLink} from '../../flow/CustomFields';
import type {Node} from 'React';


//$FlowFixMe
export default class IssueModalDetails extends IssueDetails<{ ...IssueDetailsProps, linksHasOverlay: boolean }, void> {

  renderLinksBlock: (() => void | Node) = () => {
    const {issue, issuePermissions, getIssueLinksTitle, isTablet, linksHasOverlay = false} = this.props;
    let modalId: string = '';
    const renderLinkedIssues = (onHide: Function) => (
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
        onHide={onHide}
        closeIcon={<IconClose size={21} color={styles.link.color}/>}
      />
    );

    return (
      <LinkedIssuesTitle
        issueLinks={issue.links}
        onPress={() => {
          if (isTablet) {
            modalId = modalShow(renderLinkedIssues(
              () => modalHide(modalId)),
              {hasOverlay: linksHasOverlay});
          } else {
            Router.Page({
              children: renderLinkedIssues(() => Router.pop()),
            });
          }
        }}
      />
    );
  };
}

