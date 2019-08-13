/* @flow */
import {View, Text, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';
import styles from './linked-issues.style';
import {COLOR_FONT_GRAY} from '../variables/variables';
import type {IssueLink} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';

type Props = {
  links: Array<IssueLink>,
  onIssueTap: (issue: IssueOnList) => any
}

export default class LinkedIssues extends PureComponent<Props, void> {
  _getLinkTitle(link: IssueLink) {
    if (link.direction === 'OUTWARD' || link.direction === 'BOTH') {
      return link.linkType.localizedSourceToTarget || link.linkType.sourceToTarget;
    }
    return link.linkType.localizedTargetToSource || link.linkType.targetToSource;
  }

  _renderLinkedIssue(issue: IssueOnList) {
    const issueTextStyle = issue.resolved ? {color: COLOR_FONT_GRAY, textDecorationLine: 'line-through'}: null;

    return <TouchableOpacity key={issue.id}
      onPress={() => this.props.onIssueTap && this.props.onIssueTap(issue)}
      style={styles.linkedIssueContainer}>
      <Text style={[styles.linkedIssueText, issueTextStyle]}>
        {issue.idReadable}
      </Text>
    </TouchableOpacity>;
  }

  _renderLinkType(link: IssueLink) {
    return <View key={link.id} style={styles.linkedIssuesSection}>
      <Text style={styles.relationTitle}>{this._getLinkTitle(link)}:</Text>
      {link.trimmedIssues.map(issue => this._renderLinkedIssue(issue))}
    </View>;
  }

  render() {
    const links = this.props.links.filter(link => link.trimmedIssues.length > 0);

    return <View style={styles.linkedIssuesContainer}>
      {links.map(link => this._renderLinkType(link))}
    </View>;
  }
}
