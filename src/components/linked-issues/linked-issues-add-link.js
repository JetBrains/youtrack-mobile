/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View, FlatList, Text, RefreshControl, ActivityIndicator} from 'react-native';

import {useDispatch} from 'react-redux';

import ErrorMessage from '../error-message/error-message';
import Header from '../header/header';
import IssueRow from '../../views/issues/issues__row';
import QueryAssistPanel from '../query-assist/query-assist-panel';
import QueryPreview from '../query-assist/query-preview';
import Router from '../router/router';
import Select from '../select/select';
import SelectButton from '../select/select-button';
import {createLinkTypes} from './linked-issues-helper';
import {ERROR_MESSAGE_DATA} from '../error/error-message-data';
import {getApi} from '../api/api__instance';
import {getAssistSuggestions} from '../query-assist/query-assist-helper';
import {getReadableID} from '../issue-formatter/issue-formatter';
import {IconBack} from '../icon/icon';
import {IconNothingFound} from '../icon/icon-no-found';
import {loadIssueLinkTypes, loadIssuesXShort, onLinkIssue} from '../../views/issue/issue-actions';
import {noIssuesFoundIconSize} from '../../views/issues/issues.styles';
import {UNIT} from '../variables/variables';

import styles from './linked-issues.style';

import type {IssueOnList, TransformedSuggestion} from '../../flow/Issue';
import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import type {IssueLinkType} from '../../flow/CustomFields';
import type {IssueLinkTypeExtended} from './linked-issues-helper';

type Props = {
  onUpdate: () => any,
  style?: ViewStyleProp,
  subTitle?: any,
}


const LinkedIssuesAddLink = (props: Props): Node => {
  const dispatch: Function = useDispatch();

  const [issues, updateIssues] = useState([]);
  const [isLoading, updateLoading] = useState(false);

  const [issueLinkTypes, updateIssueLinkTypes] = useState([]);
  const [currentIssueLinkTypeExtended, updateCurrentIssueLinkTypeExtended] = useState(null);

  const [isSelectVisible, updateSelectVisible] = useState(false);
  const [isScrolling, updateScrolling] = useState(false);

  const [query, updateQuery] = useState('');
  const [isQASelectVisible, updateQASelectVisible] = useState(false);
  const [suggestions, updateSuggestions] = useState([]);


  const loadLinkTypes = useCallback(
    async (): Promise<Array<IssueLinkType>> => {
      return (await dispatch(loadIssueLinkTypes())).filter((it: IssueLinkType) => !it.readOnly);
      },
    [dispatch]
  );

  const doSearch = useCallback(async (linkType: ?IssueLinkTypeExtended, q: string = query) => {
    if (linkType) {
      updateLoading(true);
      const _issues: Array<IssueOnList> = await dispatch(loadIssuesXShort(linkType.getName(), q));
      updateIssues(_issues);
      updateLoading(false);
    }
  }, [dispatch, query]);


  useEffect(() => {
    updateLoading(true);
    loadLinkTypes().then((linkTypes: Array<IssueLinkType>) => {
      const issueLinkTypesExtended: Array<IssueLinkTypeExtended> = createLinkTypes(linkTypes);
      updateCurrentIssueLinkTypeExtended(issueLinkTypesExtended[0]);
      updateIssueLinkTypes(issueLinkTypesExtended);
      doSearch(issueLinkTypesExtended[0]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuggestions = async (q: string, caret: number): Promise<Array<TransformedSuggestion>> => {
    const _suggestions: Array<TransformedSuggestion> = await getAssistSuggestions(getApi(), q, caret);
    updateSuggestions(_suggestions);
    return _suggestions;
  };

  const renderSearch = () => {
    if (isQASelectVisible) {
      return (
        <QueryAssistPanel
          queryAssistSuggestions={suggestions}
          query={query}
          suggestIssuesQuery={loadSuggestions}
          onQueryUpdate={(q: string) => {
            updateQuery(q);
            updateQASelectVisible(false);
            doSearch(currentIssueLinkTypeExtended, q);
          }}
          onClose={(q: string) => {
            updateQuery(q);
            updateQASelectVisible(false);
          }}
          clearButtonMode="always"
        />
      );
    } else {
      return <View style={isScrolling ? styles.searchPanelContainer : null}>
        <QueryPreview
          style={styles.searchPanel}
          query={query}
          onFocus={(clearQuery: boolean) => {
            if (clearQuery) {
              updateQuery('');
            }
            updateQASelectVisible(true);
          }}
        />
      </View>;
    }
  };

  const renderIssue = (issue: IssueOnList) => {
    return (
      <IssueRow
        style={[styles.linkedIssueItem, styles.linkedIssue]}
        issue={issue}
        onClick={async () => {
          if (currentIssueLinkTypeExtended) {
            updateLoading(true);
            await dispatch(onLinkIssue(getReadableID(issue), currentIssueLinkTypeExtended.getName()));
            updateLoading(false);
            props.onUpdate();
            Router.pop();
          }
        }}
      />
    );
  };

  const renderLinkTypesSelect = () => {
    const hideSelect = () => updateSelectVisible(false);
    const selectProps = {
      multi: false,
      selectedItems: [currentIssueLinkTypeExtended],
      emptyValue: null,
      placeholder: 'Filter items',
      getTitle: (linkType: IssueLinkTypeExtended) => linkType.getPresentation(),
      dataSource: () => Promise.resolve(issueLinkTypes),
      onSelect: (linkType: IssueLinkTypeExtended) => {
        updateCurrentIssueLinkTypeExtended(linkType);
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

      {!!currentIssueLinkTypeExtended && (
        <SelectButton
          style={styles.linkTypeSelect}
          subTitle={props.subTitle || 'Current issue'}
          onPress={() => updateSelectVisible(true)}
        >
          <Text>{currentIssueLinkTypeExtended.getPresentation()}</Text>
        </SelectButton>
      )}

      {renderSearch()}

      {isLoading && <ActivityIndicator size="large" style={styles.loader} color={styles.link.color}/>}

      <FlatList
        style={styles.issuesToLinkContainer}
        contentContainerStyle={styles.linkedList}
        data={issues}
        onScroll={(event: any) => {
          const isScrolled: boolean = event.nativeEvent.contentOffset.y > UNIT * 2;
          updateScrolling(isScrolled);
        }}
        refreshControl={<RefreshControl
          refreshing={false}
          onRefresh={() => doSearch(currentIssueLinkTypeExtended, query)}
          tintColor={styles.link.color}
        />}
        scrollEventThrottle={50}
        keyExtractor={(issue: $Shape<IssueOnList>) => issue.id}
        renderItem={(info: { item: any, ... }) => renderIssue(info.item)}
        ItemSeparatorComponent={() => <View style={styles.separator}/>}
        ListFooterComponent={(
          !isLoading && issues.length === 0 ? () => (
            <ErrorMessage style={styles.container} errorMessageData={{
              ...ERROR_MESSAGE_DATA.NO_ISSUES_FOUND,
              icon: () => <IconNothingFound size={noIssuesFoundIconSize / 1.5} style={styles.noIssuesMessage}/>,
            }}/>
          ) : null
        )}
      />

      {isSelectVisible && renderLinkTypesSelect()}
    </View>
  );
};


export default (React.memo<Props>(LinkedIssuesAddLink): React$AbstractComponent<Props, mixed>);
