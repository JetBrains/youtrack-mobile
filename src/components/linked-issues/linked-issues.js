/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, SectionList, TouchableOpacity, ActivityIndicator} from 'react-native';

import Header from '../header/header';
import IssueRow from '../../views/issues/issues__row';
import LinkedIssuesAddLink from './linked-issues-add-link';
import Router from '../router/router';

import {createLinksList} from './linked-issues-helper';
import {IconAdd, IconBack, IconClose} from '../icon/icon';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './linked-issues.style';

import type {IssueLink} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';
import type {LinksListData} from './linked-issues-helper';
import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  canLink?: (issue: IssueOnList) => boolean,
  issuesGetter: (linkTypeName: string, query: string) => any,
  linksGetter: () => any,
  onUnlink: (linkedIssue: IssueOnList, linkTypeId: string) => any,
  onLinkIssue: (linkedIssueId: string, linkTypeName: string) => any,
  onUpdate: (linkedIssues?: Array<IssueLink>) => void,
  style?: ViewStyleProp,
  subTitle?: any,
}

const LinkedIssues = (props: Props): Node => {
  const [sections, updateSections] = useState([]);
  const [pressedButtonId, updatePressedButtonId] = useState(null);
  const [isLoading, updateLoading] = useState(false);

  const getLinkedIssues = useCallback(async (): Promise<Array<IssueLink>> => {
    const linkedIssues: Array<IssueLink> = await props.linksGetter();
    const linksListData = createLinksList(linkedIssues);
    updateSections(linksListData);
    return linkedIssues;
  }, [props]);

  useEffect(() => {
    updateLoading(true);
    getLinkedIssues().then(() => {
      updateLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateBack = (): void => {Router.pop();};

  const doUpdateSections = (removedLinkedIssue: IssueOnList, linkTypeId: string): Array<LinksListData> => {
    const _sections: Array<LinksListData> = sections.map((it: LinksListData) => {
      if (it.linkTypeId === linkTypeId) {
        it.data = it.data.filter((il: IssueOnList) => il.id !== removedLinkedIssue.id);
      }
      it.unresolvedIssuesSize -= 1;
      return it;
    }).filter((it: LinksListData) => it.data.length > 0);
    updateSections(_sections);
    return _sections;
  };

  const renderLinkedIssue = (linkedIssue: IssueOnList, linkTypeId: string) => {
    const isButtonPressed: boolean = pressedButtonId !== null;
    const isCurrentButtonPressed: boolean = isButtonPressed && pressedButtonId === (linkedIssue.id + linkTypeId);
    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
        style={styles.linkedIssueItem}
      >
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
            disabled={isButtonPressed}
            onPress={async () => {
              updatePressedButtonId(linkedIssue.id + linkTypeId);
              const isRemoved: boolean = await props.onUnlink(linkedIssue, linkTypeId);
              updatePressedButtonId(null);
              if (isRemoved) {
                const updatedLinksList: Array<LinksListData> = doUpdateSections(linkedIssue, linkTypeId);
                props.onUpdate();
                if (updatedLinksList.length === 0) {
                  navigateBack();
                }
              }
            }}
            style={styles.linkedIssueRemoveAction}
          >
            {isCurrentButtonPressed && <ActivityIndicator color={styles.link.color}/>}
            {!isCurrentButtonPressed && <IconClose
              size={20}
              color={isButtonPressed ? styles.disabled.color : styles.linkedIssueRemoveAction.color}
            />}
          </TouchableOpacity>
        )}
      </AnimatedView>
    );
  };

  const renderSectionTitle = (it: { section: LinksListData, ... }) => {
    const amount: number = it.section.data.length;
    return (
      <Text
        numberOfLines={1}
        style={styles.linkedIssueTypeTitle}>
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
            onLinkIssue={props.onLinkIssue}
            issuesGetter={props.issuesGetter}
            onUpdate={async () => {
              const linkedIssues: Array<IssueLink> = await getLinkedIssues();
              props.onUpdate(linkedIssues);
            }}
            subTitle={props.subTitle}
          />,
        })}
        onBack={navigateBack}
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

      {isLoading && <ActivityIndicator style={styles.loader} color={styles.link.color}/>}
    </View>
  );
};


export default (React.memo<Props>(LinkedIssues): React$AbstractComponent<Props, mixed>);
