/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, SectionList, TouchableOpacity} from 'react-native';

import {useDispatch} from 'react-redux';

import Header from '../header/header';
import IssueRow from '../../views/issues/issues__row';
import LinkedIssuesAddLink from './linked-issues-add-link';
import Router from '../router/router';

import {createLinksList} from './linked-issues-helper';
import {IconAdd, IconBack, IconClose} from '../icon/icon';
import {loadLinkedIssues, onUnlinkIssue} from '../../views/issue/issue-actions';

import styles from './linked-issues.style';

import type {IssueOnList} from '../../flow/Issue';
import type {Node} from 'React';
import type {LinksListData} from './linked-issues-helper';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  canLink?: (issue: IssueOnList) => boolean,
  onUpdate: (linkedIssues: Array<IssueOnList>) => void,
  subTitle?: any,
  style?: ViewStyleProp,
}

const LinkedIssues = (props: Props): Node => {
  const dispatch: Function = useDispatch();

  const [sections, updateSections] = useState([]);

  const getLinkedIssues = useCallback(async (): Array<IssueOnList> => {
    const linkedIssue: Array<IssueOnList> = await dispatch(loadLinkedIssues());
    updateSections(createLinksList(linkedIssue));
    return linkedIssue;
  }, [dispatch]);

  useEffect(() => {
    getLinkedIssues();
  }, [getLinkedIssues]);

  const renderLinkedIssue = (linkedIssue: IssueOnList, linkTypeId: string) => (
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
      {props.canLink && props.canLink(linkedIssue) && (
        <TouchableOpacity
          onPress={async () => {
            const isRemoved: boolean = await dispatch(onUnlinkIssue(linkedIssue, linkTypeId));
            props.onUpdate();
            if (isRemoved) {
              const _sections: Array<LinksListData> = sections.map((it: LinksListData) => {
                if (it.linkTypeId === linkTypeId) {
                  it.data = it.data.filter((il: IssueOnList) => il.id !== linkedIssue.id);
                }
                return it;
              }).filter((it:LinksListData) => it.data.length > 0);
              updateSections(_sections);
            }
          }}
          style={styles.linkedIssueRemoveAction}
        >
          <IconClose
            size={20}
            color={styles.linkedIssueRemoveAction.color}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionTitle = (it: { section: LinksListData, ... }) => {
    const amount: number = it.section.data.length;
    return (
      <Text style={styles.linkedIssueTypeTitle}>
        {`${it.section.title} ${it.section.data.length} ${amount > 1 ? 'issues' : 'issue'}`}
        {it.section?.unresolvedIssuesSize > 0 ? ` (${it.section.unresolvedIssuesSize} unresolved)` : ''}
      </Text>
    );
  };

  return (
    <View style={[styles.container, props.style]}>
      <Header
        showShadow={true}
        leftButton={<IconBack color={styles.link.color}/>}
        rightButton={props.canLink ? <IconAdd style={styles.addLinkButton} color={styles.link.color} size={20}/> : null}
        onRightButtonClick={() => Router.Page({
          children: <LinkedIssuesAddLink
            onUpdate={async () => {
              const linkedIssues: Array<IssueOnList> = await getLinkedIssues();
              props.onUpdate(linkedIssues);
            }}
          />,
        })}
        onBack={() => Router.pop()}
      >
        <Text
          style={styles.headerSubTitle}
          numberOfLines={1}>
          {props.subTitle}
        </Text>
        <Text style={styles.headerTitle}>Linked issues</Text>
      </Header>
      <SectionList
        style={styles.linkedListContainer}
        contentContainerStyle={styles.linkedList}
        sections={sections}
        scrollEventThrottle={10}
        keyExtractor={(issue: IssueOnList) => issue.id}
        renderItem={(info: { item: any, section: LinksListData & any, ... }) => (
          renderLinkedIssue(info.item, info.section.linkTypeId)
        )}
        renderSectionHeader={renderSectionTitle}
        ItemSeparatorComponent={() => <View style={styles.separator}/>}
        stickySectionHeadersEnabled={true}
      />
    </View>
  );
};


export default (React.memo<Props>(LinkedIssues): React$AbstractComponent<Props, mixed>);
