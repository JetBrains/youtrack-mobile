import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {View as AnimatedView} from 'react-native-animatable';

import Header from 'components/header/header';
import IconPlus from 'components/icon/assets/plus.svg';
import IssueRow from 'views/issues/issues__row';
import LinkedIssuesAddLink from './linked-issues-add-link';
import Router from 'components/router/router';
import {createLinksList} from './linked-issues-helper';
import {i18n, i18nPlural} from 'components/i18n/i18n';
import {IconBack} from 'components/icon/icon';
import {IconClearText} from 'components/icon/icon-clear-text';
import {ThemeContext} from 'components/theme/theme-context';

import styles from './linked-issues.style';

import type {IssueLink} from 'types/CustomFields';
import type {IssueOnList} from 'types/Issue';
import type {LinksListData} from './linked-issues-helper';
import type {Theme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  canLink?: (issue: IssueOnList) => boolean;
  issuesGetter: (linkTypeName: string, query: string) => any;
  linksGetter: () => any;
  onUnlink: (linkedIssue: IssueOnList, linkTypeId: string) => any;
  onLinkIssue: (linkedIssueId: string, linkTypeName: string) => any;
  onUpdate: (linkedIssues?: IssueLink[]) => void;
  style?: ViewStyleProp;
  subTitle?: any;
  onHide: () => void;
  onAddLink?: (arg0: (onHide: () => any) => any) => any;
  closeIcon?: any;
  onIssueLinkPress?: (issue: IssueOnList) => any;
}

const LinkedIssues = (props: Props) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme: Theme = useContext(ThemeContext);
  const [sections, updateSections] = useState([]);
  const [pressedButtonId, updatePressedButtonId] = useState(null);
  const [isLoading, updateLoading] = useState(false);
  const getLinkedIssues = useCallback(async (): Promise<Array<IssueLink>> => {
    const linkedIssues: IssueLink[] = await props.linksGetter();
    const linksListData: LinksListData[] = createLinksList(linkedIssues);
    updateSections(linksListData);
    return linkedIssues;
  }, [props]);
  useEffect(() => {
    updateLoading(true);
    getLinkedIssues().then(() => {
      updateLoading(false);
    }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doUpdateSections = (
    removedLinkedIssue: IssueOnList,
    linkTypeId: string,
  ): LinksListData[] => {
    const _sections: LinksListData[] = sections
      .map((it: LinksListData) => {
        if (it.linkTypeId === linkTypeId) {
          it.data = it.data.filter(
            (il: IssueOnList) => il.id !== removedLinkedIssue.id,
          );
        }

        it.unresolvedIssuesSize -= 1;
        return it;
      })
      .filter((it: LinksListData) => it.data.length > 0);

    updateSections(_sections);
    return _sections;
  };

  const renderLinkedIssue = (linkedIssue: IssueOnList, linkTypeId: string) => {
    const isButtonPressed: boolean = pressedButtonId !== null;
    const isCurrentButtonPressed: boolean = isButtonPressed && pressedButtonId === linkedIssue.id + linkTypeId;
    return (
      <AnimatedView useNativeDriver duration={500} animation="fadeIn" style={styles.linkedIssueItem}>
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
                const updatedLinksList: LinksListData[] = doUpdateSections(linkedIssue, linkTypeId);
                props.onUpdate();

                if (updatedLinksList.length === 0) {
                  props.onHide();
                }
              }
            }}
            style={styles.linkedIssueRemoveAction}
          >
            {isCurrentButtonPressed && (
              <ActivityIndicator style={styles.linkedIssueRemoveActionProgress} color={styles.link.color} />
            )}
            {!isCurrentButtonPressed && (
              <IconClearText size={24} color={isButtonPressed ? styles.disabled.color : styles.link.color} />
            )}
          </TouchableOpacity>
        )}
      </AnimatedView>
    );
  };

  const renderSectionTitle = (it: {section: LinksListData}) => {
    const section: LinksListData = it.section;
    const issuesAmount: number = section.data.length;
    return (
      <Text numberOfLines={2} style={styles.linkedIssueTypeTitle}>
        {`${section.title} `}
        {i18nPlural(issuesAmount, '{{amount}} issue', '{{amount}} issues', {
          amount: issuesAmount,
        })}
        {section?.unresolvedIssuesSize > 0
          ? i18n(' ({{amount}} unresolved)', {
              amount: section.unresolvedIssuesSize,
            })
          : null}
      </Text>
    );
  };

  const renderAddIssueLink = (onHide: () => any) => (
    <LinkedIssuesAddLink
      onLinkIssue={props.onLinkIssue}
      issuesGetter={props.issuesGetter}
      onUpdate={async () => {
        const linkedIssues: IssueLink[] = await getLinkedIssues();
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
        leftButton={props.closeIcon || <IconBack color={styles.link.color} />}
        rightButton={
          props.canLink ? (
            <IconPlus style={styles.addLinkButton} color={styles.link.color} width={22} height={22} />
          ) : null
        }
        onRightButtonClick={onAddIssueLink}
        onBack={props.onHide}
      >
        <Text style={styles.headerSubTitle} numberOfLines={1}>
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
        renderItem={(info) => renderLinkedIssue(info.item, info.section.linkTypeId)}
        renderSectionHeader={renderSectionTitle}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        stickySectionHeadersEnabled={true}
      />

      {isLoading && <ActivityIndicator style={styles.loader} color={styles.link.color} />}
    </View>
  );
};

export default React.memo<Props>(LinkedIssues);
