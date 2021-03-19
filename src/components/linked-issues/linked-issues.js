/* @flow */

import {View, Text, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import EStyleSheet from 'react-native-extended-stylesheet';

import {getReadableID} from '../issue-formatter/issue-formatter';

import styles from './linked-issues.style';

import type {IssueLink} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  links: Array<IssueLink>,
  onIssueTap: (issue: IssueOnList) => any,
  style?: ViewStyleProp,
}

export default class LinkedIssues extends PureComponent<Props, void> {
  static defaultProps: Props = {
    onIssueTap: (issue: IssueOnList) => {},
    links: [],
  };

  _getLinkTitle(link: IssueLink) {
    if (link.direction === 'OUTWARD' || link.direction === 'BOTH') {
      return link.linkType.localizedSourceToTarget || link.linkType.sourceToTarget;
    }
    return link.linkType.localizedTargetToSource || link.linkType.targetToSource;
  }

  _renderLinkedIssue(issue: IssueOnList) {
    const issueTextStyle = issue.resolved ? {color: EStyleSheet.value('$resolved'), textDecorationLine: 'line-through'} : null;

    return <TouchableOpacity key={issue.id}
      onPress={() => this.props.onIssueTap && this.props.onIssueTap(issue)}
      style={styles.linkedIssueContainer}>
      <Text style={[styles.linkedIssueText, issueTextStyle]}>
        {getReadableID(issue)}
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
    const {links, style} = this.props;
    const linksWithIssues = links.filter(link => (link.trimmedIssues || []).length > 0);

    if (linksWithIssues.length > 0) {
      return (
        <View style={[styles.linkedIssuesContainer, style]}>
          {linksWithIssues.map(link => this._renderLinkType(link))}
        </View>
      );
    }

    return null;
  }
}
