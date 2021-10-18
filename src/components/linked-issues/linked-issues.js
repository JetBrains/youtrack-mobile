/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import {getLinkTitle} from './linked-issues-helper';
import {getReadableID} from '../issue-formatter/issue-formatter';

import styles from './linked-issues.style';

import type {IssueOnList} from '../../flow/Issue';
import type {IssueLink} from '../../flow/CustomFields';
import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  links: Array<IssueLink>,
  onPress: (issue: IssueOnList) => any,
  style?: ViewStyleProp,
}


const LinkedIssues = (props: Props): Node => {
  const renderLinkedIssue = (issue: IssueOnList): Node => {
    return (
      <TouchableOpacity
        key={issue.id}
        onPress={() => props.onPress && props.onPress(issue)}
        style={styles.linkedIssueContainer}
      >
        <Text style={[styles.linkedIssueText, issue.resolved && styles.resolved]}>
          {getReadableID(issue)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderLinkType = (link: IssueLink): Node => {
    return (
      <View
        key={link.id}
        style={styles.linkedIssuesSection}
      >
        <Text style={styles.relationTitle}>{getLinkTitle(link)}:</Text>
        {link.trimmedIssues.map(issue => renderLinkedIssue(issue))}
      </View>
    );
  };


  const linksWithIssues: Array<IssueLink> = props.links.filter(
    (link: IssueLink) => (link.trimmedIssues || []).length > 0
  );
  if (linksWithIssues.length > 0) {
    return (
      <View style={[styles.linkedIssuesContainer, props.style]}>
        {linksWithIssues.map(link => renderLinkType(link))}
      </View>
    );
  }

  return null;
};


export default (React.memo<Props>(LinkedIssues): React$AbstractComponent<Props, mixed>);
