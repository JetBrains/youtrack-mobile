/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import LinkedIssues from './linked-issues';
import Router from '../router/router';
import usage from '../usage/usage';
import {ANALYTICS_ISSUE_PAGE} from '../analytics/analytics-ids';
import {getIssueLinkedIssuesTitle} from './linked-issues-helper';
import {IconAngleRight} from '../icon/icon';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './linked-issues.style';

import type {IssueOnList} from '../../flow/Issue';
import type {IssueLink} from '../../flow/CustomFields';
import type {Node} from 'React';

type Props = {
  issueLinks: Array<IssueLink>,
  onPress: (issue: IssueOnList) => any,
}


const LinkedIssuesTitle = (props: Props): Node => {
  const issueLinkedIssuesTitle: string = getIssueLinkedIssuesTitle(props.issueLinks);

  return (
    <TouchableOpacity
      style={styles.linkedIssuesButton}
      onPress={() => Router.Page({
        children: (
          <LinkedIssues
            links={props.issueLinks}
            onPress={(issueLink: IssueOnList) => {
              usage.trackEvent(ANALYTICS_ISSUE_PAGE, 'Show issue links');
              Router.pop();
              props.onPress(issueLink);
            }}
          />),
      })}
    >
      <View style={styles.linkedIssuesTitle}>
        <Text style={styles.linkedIssuesTitleText}>
          Linked issues
        </Text>
        {issueLinkedIssuesTitle.length > 0 && (
          <AnimatedView
            animation="fadeIn"
            duration={500}
            useNativeDriver>
            <Text>
              {issueLinkedIssuesTitle}
            </Text>
          </AnimatedView>
        )}
      </View>
      <IconAngleRight size={18}/>
    </TouchableOpacity>
  );
};


export default (React.memo<Props>(LinkedIssuesTitle): React$AbstractComponent<Props, mixed>);
