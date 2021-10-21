/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View, FlatList, Text, RefreshControl} from 'react-native';

import {useDispatch} from 'react-redux';

import Header from '../header/header';
import IssueRow from '../../views/issues/issues__row';
import Router from '../router/router';
import Select from '../select/select';
import SelectButton from '../select/select-button';

import {IconBack} from '../icon/icon';
import {createLinkTypes} from './linked-issues-helper';
import {loadIssueLinkTypes, loadIssuesXShort, onLinkIssue} from '../../views/issue/issue-actions';

import styles from './linked-issues.style';

import type {IssueOnList} from '../../flow/Issue';
import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {IssueLinkType} from '../../flow/CustomFields';
import type {IssueLinkTypeExtended} from './linked-issues-helper';
import {getReadableID} from '../issue-formatter/issue-formatter';

type Props = {
  onUpdate: () => void,
  style?: ViewStyleProp,
}


const LinkedIssuesAddLink = (props: Props): Node => {
  const dispatch: Function = useDispatch();

  const [issues, updateIssues]:
    [Array<IssueOnList>, (issues: Array<IssueOnList>) => any] = useState([]);
  const [issueLinkTypes, updateIssueLinkTypes]:
    [Array<IssueLinkTypeExtended>, (linkTypes: Array<IssueLinkTypeExtended>) => any] = useState([]);
  const [currentIssueLinkType, updateCurrentIssueLinkType]:
    [IssueLinkTypeExtended | null, (linkType: IssueLinkTypeExtended) => any] = useState(null);
  const [isSelectVisible, updateSelectVisible]:
    [boolean, (isVisible: boolean) => any] = useState(false);

  const loadLinkTypes = useCallback(
    async (): Promise<Array<IssueLinkType>> => {
      return (await dispatch(loadIssueLinkTypes())).filter((it: IssueLinkType) => !it.readOnly);
      },
    [dispatch]
  );

  const doSearch = useCallback(async (linkType: IssueLinkTypeExtended) => {
    const _issues: Array<IssueOnList> = await dispatch(loadIssuesXShort(linkType.getName()));
    updateIssues(_issues);
  }, [dispatch]);


  useEffect(() => {
    loadLinkTypes().then((linkTypes: Array<IssueLinkType>) => {
      const issueLinkTypesExtended: Array<IssueLinkTypeExtended> = createLinkTypes(linkTypes);
      updateCurrentIssueLinkType(issueLinkTypesExtended[0]);
      updateIssueLinkTypes(issueLinkTypesExtended);
      doSearch(issueLinkTypesExtended[0]);
    });
  }, [doSearch, loadLinkTypes]);

  const renderIssue = (issue: IssueOnList) => {
    return (
      <IssueRow
        style={[styles.linkedIssueItem, styles.linkedIssue]}
        issue={issue}
        onClick={async () => {
          await dispatch(onLinkIssue(getReadableID(issue), currentIssueLinkType.getName()));
          props.onUpdate();
          Router.pop();
        }}
      />
    );
  };

  const renderLinkTypesSelect = () => {
    const hideSelect = () => updateSelectVisible(false);
    const selectProps = {
      multi: false,
      selectedItems: [currentIssueLinkType],
      emptyValue: null,
      placeholder: 'Filter items',
      getTitle: (linkType: IssueLinkTypeExtended) => linkType.getPresentation(),
      dataSource: () => Promise.resolve(issueLinkTypes),
      onSelect: (linkType: IssueLinkType) => {
        updateCurrentIssueLinkType(linkType);
        hideSelect();
      },
      onCancel: hideSelect,
    };
    return (
      <Select {...selectProps}/>
    );
  };
  return (
    <View style={[styles.container, props.style]}>
      <Header
        title="Link issue"
        showShadow={true}
        leftButton={<IconBack color={styles.link.color}/>}
        onBack={() => Router.pop()}
      />

      {!isSelectVisible && !!currentIssueLinkType && (
        <SelectButton
          style={styles.linkTypeSelect}
          subTitle="Current issue"
          onPress={() => updateSelectVisible(true)}
        >
          <Text>{currentIssueLinkType.getPresentation()}</Text>
        </SelectButton>
      )}

      <FlatList
        style={styles.issuesToLinkContainer}
        contentContainerStyle={styles.linkedList}
        data={issues}
        refreshControl={<RefreshControl
          refreshing={false}
          onRefresh={() => doSearch(currentIssueLinkType)}
          tintColor={styles.link.color}
        />}
        scrollEventThrottle={10}
        keyExtractor={(issue: $Shape<IssueOnList>) => issue.id}
        renderItem={(info: { item: any, ... }) => (renderIssue(info.item))}
        ItemSeparatorComponent={() => <View style={styles.separator}/>}
      />

      {isSelectVisible && renderLinkTypesSelect()}
    </View>
  );
};


export default (React.memo<Props>(LinkedIssuesAddLink): React$AbstractComponent<Props, mixed>);
