/* @flow */

import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Text, SectionList, TouchableOpacity, ActivityIndicator} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import Header from '../header/header';
import IssueRow from 'views/issues/issues__row';
import LinkedIssuesAddLink from './linked-issues-add-link';
import Router from '../router/router';
import {createLinksList} from './linked-issues-helper';
import {i18n, i18nPlural} from 'components/i18n/i18n';
import {IconAdd, IconBack, IconClose} from '../icon/icon';
import {ThemeContext} from '../theme/theme-context';

import styles from './linked-issues.style';

import type {IssueLink} from 'flow/CustomFields';
import type {IssueOnList} from 'flow/Issue';
import type {LinksListData} from './linked-issues-helper';
import type {Node} from 'react';
import type {Theme} from 'flow/Theme';
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
  onHide: () => void,
  onAddLink?: ((onHide: () => any) => any) => any,
  closeIcon?: any,
  onIssueLinkPress?: (issue: IssueOnList) => any,
}

const LinkedIssues = (props: Props): Node => {
  // update UI on theme change
  // eslint-disable-next-line no-unused-vars
  const theme: Theme = useContext(ThemeContext);

  const [sections, updateSections] = useState([]);
  const [pressedButtonId, updatePressedButtonId] = useState(null);
  const [isLoading, updateLoading] = useState(false);

  const getLinkedIssues = useCallback(async (): Promise<Array<IssueLink>> => {
    const linkedIssues: Array<IssueLink> = await props.linksGetter();
    const linksListData: Array<LinksListData> = createLinksList(linkedIssues);
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
            if (props.onIssueLinkPress) {
              props.onIssueLinkPress(linkedIssue);
            } else {
              Router.Issue({
                issuePlaceholder: linkedIssue,
                issueId: linkedIssue.id,
              });
            }
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
                  props.onHide();
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
    const section: LinksListData = it.section;
    const issuesAmount: number = section.data.length;
    return (
      <Text
        numberOfLines={2}
        style={styles.linkedIssueTypeTitle}
      >
        {`${section.title} `}
        {i18nPlural(
          issuesAmount,
          '{{amount}} issue',
          '{{amount}} issues',
          {amount: issuesAmount}
        )}
        {section?.unresolvedIssuesSize > 0 ? i18n(' ({{amount}} unresolved)', {amount: section.unresolvedIssuesSize}) : null}
      </Text>
    );
  };

  const renderAddIssueLink = (onHide: () => any) => (
    <LinkedIssuesAddLink
      onLinkIssue={props.onLinkIssue}
      issuesGetter={props.issuesGetter}
      onUpdate={async () => {
        const linkedIssues: Array<IssueLink> = await getLinkedIssues();
        props.onUpdate(linkedIssues);
      }}
      subTitle={props.subTitle}
      onHide={onHide}
    />
  );

  const onAddIssueLink = () => {
    if (props.onAddLink) {
      return props.onAddLink((onHide: () => any) => renderAddIssueLink(onHide));
    } else {
      //TODO: use `props.onAddLink`
      Router.Page({
        children: renderAddIssueLink(props.onHide),
      });
    }
  };

  return (
    <View style={[styles.container, props.style]}>
      <Header
        showShadow={true}
        leftButton={props.closeIcon || <IconBack color={styles.link.color}/>}
        rightButton={props.canLink ? <IconAdd style={styles.addLinkButton} color={styles.link.color} size={20}/> : null}
        onRightButtonClick={onAddIssueLink}
        onBack={props.onHide}
      >
        <Text
          style={styles.headerSubTitle}
          numberOfLines={1}>
          {props.subTitle}
        </Text>
        <Text style={styles.headerTitle}>{i18n('Linked issues')}</Text>
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
