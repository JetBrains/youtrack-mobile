import React from 'react';
import IssueDetails from '../issue__details';
import IssueModal from './issue.modal';
import LinkedIssues from 'components/linked-issues/linked-issues';
import LinkedIssuesTitle from 'components/linked-issues/linked-issues-title';
import ModalPortal from 'components/modal-view/modal-portal';
import {IconBack, IconClose} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import styles from '../issue.styles';
import stylesModal from './issue.modal.styles';
import type {AnyIssue, IssueOnList} from 'flow/Issue';
import type {IssueDetailsProps} from '../issue__details';
import type {IssueLink} from 'flow/CustomFields';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
type State = {
  modalChildren: any;
}; //@ts-expect-error

export default class IssueModalDetails extends IssueDetails<
  IssueDetailsProps & {
    stacked: boolean;
  },
  State
> {
  state: State = {
    modalChildren: null,
  };
  renderLinkedIssues: () => React.ReactElement<
    React.ComponentProps<any>,
    any
  > = () => {
    const {
      issue,
      issuePermissions,
      getIssueLinksTitle,
      issuesGetter,
      linksGetter,
      onUnlink,
      onLinkIssue,
    } = this.props;
    return (
      issue && (
        <LinkedIssues
          issuesGetter={issuesGetter}
          linksGetter={linksGetter}
          onUnlink={onUnlink}
          onLinkIssue={onLinkIssue}
          onUpdate={(issues?: Array<IssueLink>) => {
            getIssueLinksTitle(issues);
          }}
          canLink={
            issuePermissions.canLink(issue)
              ? (linkedIssue: AnyIssue) => issuePermissions.canLink(linkedIssue)
              : undefined
          }
          subTitle={`${issue.idReadable} ${issue.summary}`}
          onHide={this.toggleModalChildren}
          closeIcon={
            this.props.stacked ? null : (
              <IconClose
                size={21}
                color={styles.link.color}
                style={stylesModal.backIcon}
              />
            )
          }
          onAddLink={(renderAddLink: (onHide: () => any) => any) => {
            const prevModalData: any = this.state.modalChildren;
            this.toggleModalChildren(
              renderAddLink(() => this.toggleModalChildren(prevModalData)),
            );
          }}
          onIssueLinkPress={(linkedIssue: IssueOnList) => {
            const prevModalData: any = this.state.modalChildren;
            this.toggleModalChildren(
              <IssueModal
                issuePlaceholder={linkedIssue}
                issueId={linkedIssue.id}
                onHide={this.toggleModalChildren}
                backIcon={<IconBack color={styles.link.color} />}
                onBack={() => this.toggleModalChildren(prevModalData)}
                stacked={true}
              />,
            );
          }}
        />
      )
    );
  };
  toggleModalChildren: (modalChildren: any) => void = (
    modalChildren: any = null,
  ) => {
    this.setState({
      modalChildren,
    });
    this.forceUpdate(); //TODO: investigate
  };
  renderLinksBlock: () => Node = () => {
    const issue: AnyIssue = this.getIssue();
    return (
      <LinkedIssuesTitle
        issueLinks={issue.links}
        onPress={() => this.toggleModalChildren(this.renderLinkedIssues())}
      />
    );
  };

  render(): Node {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          return (
            <>
              {this.renderContent()}
              <ModalPortal
                hasOverlay={!this.props.stacked}
                onHide={() => this.toggleModalChildren()}
              >
                {this.state.modalChildren}
              </ModalPortal>
            </>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}