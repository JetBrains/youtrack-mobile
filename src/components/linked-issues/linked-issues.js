/* @flow */

import React from 'react';
import {View, Text, SectionList} from 'react-native';

import Header from '../header/header';
import IssueRow from '../../views/issues/issues__row';
import Router from '../router/router';

import {getIssueLinkedIssuesMap} from './linked-issues-helper';
import {IconBack} from '../icon/icon';

import styles from './linked-issues.style';

import type {IssueLink} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';
import type {LinksMap} from './linked-issues-helper';
import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  links: Array<IssueLink>,
  onPress: (issue: IssueOnList) => any,
  style?: ViewStyleProp,
}


const LinkedIssues = (props: Props): Node => {
  const renderList = () => {
    const issueLinkedIssuesMap: LinksMap = getIssueLinkedIssuesMap(props.links);
    const sections: Array<{ title: string, data: Array<IssueOnList> }> = Object.keys(issueLinkedIssuesMap).map(
      (title: string) => ({
        title,
        data: issueLinkedIssuesMap[title],
      }));

    const renderIssue = (issue: IssueOnList) => (
      <IssueRow
        style={styles.linkedIssue}
        issue={issue}
        onClick={(issue: IssueOnList) => null}
      />
    );

    const renderSectionTitle = (it: { section: { title: string, data: Array<IssueOnList> }, ... }) => {
      const amount: number = it.section.data.length;
      return (
        <Text style={styles.linkedIssueTypeTitle}>
          {`${it.section.title} ${it.section.data.length} ${amount > 1 ? 'issues' : 'issue'}`}
        </Text>
      );
    };

    return (
      <SectionList
        contentContainerStyle={styles.linkedList}
        sections={sections}
        scrollEventThrottle={10}
        keyExtractor={(issue: IssueOnList) => issue.id}
        renderItem={(info: { item: any, ... }) => renderIssue(info.item)}
        renderSectionHeader={renderSectionTitle}
        ItemSeparatorComponent={() => <View style={styles.separator}/>}
        stickySectionHeadersEnabled={true}
      />
    );
  };


  return (
    <View style={props.style}>
      <Header
        title="Linked issues"
        showShadow={true}
        leftButton={<IconBack color={styles.link.color}/>}
        onBack={() => Router.pop()}
      />
      {renderList()}
    </View>
  );
};


export default (React.memo<Props>(LinkedIssues): React$AbstractComponent<Props, mixed>);
