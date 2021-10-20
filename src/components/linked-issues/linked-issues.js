/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, SectionList} from 'react-native';

import {useDispatch} from 'react-redux';

import Header from '../header/header';
import IssueRow from '../../views/issues/issues__row';
import Router from '../router/router';

import {createLinksList} from './linked-issues-helper';
import {IconBack} from '../icon/icon';
import {loadIssueLinks} from '../../views/issue/issue-actions';

import styles from './linked-issues.style';

import type {IssueLink} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';
import type {Node} from 'React';
import type {LinksListData} from './linked-issues-helper';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  style?: ViewStyleProp,
}

const LinkedIssues = (props: Props): Node => {
  const dispatch: Function = useDispatch();

  const [sections, updateSections] = useState([]);

  const loadLinks = useCallback(async () => {
    const links: Array<IssueLink> = await dispatch(loadIssueLinks());
    updateSections(createLinksList(links));
  }, [dispatch]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const renderLinkedIssue = (linkedIssue: IssueOnList) => (
    <View style={styles.linkedIssueItem}>
      <IssueRow
        style={styles.linkedIssue}
        issue={linkedIssue}
        onClick={() => {
          Router.Issue({
            issuePlaceholder: linkedIssue,
            issueId: linkedIssue.id,
          });
        }}
      />
    </View>
  );

  const renderSectionTitle = (it: { section: LinksListData, ... }) => {
    const amount: number = it.section.data.length;
    return (
      <Text style={styles.linkedIssueTypeTitle}>
        {`${it.section.title} ${it.section.data.length} ${amount > 1 ? 'issues' : 'issue'}`}
      </Text>
    );
  };

  return (
    <View style={[styles.container, props.style]}>
      <Header
        title="Linked issues"
        showShadow={true}
        leftButton={<IconBack color={styles.link.color}/>}
        onBack={() => Router.pop()}
      />
      <SectionList
        contentContainerStyle={styles.linkedList}
        sections={sections}
        scrollEventThrottle={10}
        keyExtractor={(issue: IssueOnList) => issue.id}
        renderItem={(info: { item: any, section: LinksListData & any, ... }) => (
          renderLinkedIssue(info.item)
        )}
        renderSectionHeader={renderSectionTitle}
        ItemSeparatorComponent={() => <View style={styles.separator}/>}
        stickySectionHeadersEnabled={true}
      />
    </View>
  );
};


export default LinkedIssues;
