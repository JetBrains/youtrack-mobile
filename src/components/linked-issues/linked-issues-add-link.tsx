import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

import ErrorMessage from 'components/error-message/error-message';
import Header from 'components/header/header';
import issueCommonLinksActions from 'components/issue-actions/issue-links-actions';
import IssueRow from 'views/issues/issues__row';
import QueryAssistPanel from 'components/query-assist/query-assist-panel';
import QueryPreview from 'components/query-assist/query-preview';
import Select from 'components/select/select';
import SelectButton from 'components/select/select-button';
import {createLinkTypes} from './linked-issues-helper';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {getApi} from 'components/api/api__instance';
import {getAssistSuggestions} from 'components/query-assist/query-assist-helper';
import {getReadableID} from 'components/issue-formatter/issue-formatter';
import {i18n} from 'components/i18n/i18n';
import {
  ICON_PICTOGRAM_DEFAULT_SIZE,
  IconNothingFound,
} from 'components/icon/icon-pictogram';
import {IconBack} from 'components/icon/icon';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './linked-issues.style';

import type {AssistSuggest, IssueOnListExtended} from 'types/Issue';
import type {IssueLinkTypeExtended} from './linked-issues-helper';
import type {IssueLinkType} from 'types/CustomFields';
import type {Theme} from 'types/Theme';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  issuesGetter: (linkTypeName: string, q: string) => any;
  onLinkIssue: (linkedIssueIdReadable: string, linkTypeName: string) => any;
  onUpdate: () => any;
  style?: ViewStyleProp;
  subTitle?: any;
  onHide: () => any;
  closeIcon?: any;
}

const LinkedIssuesAddLink = (props: Props): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme: Theme = useContext(ThemeContext);

  const [issues, updateIssues] = useState<IssueOnListExtended[]>([]);
  const [isLoading, updateLoading] = useState<boolean>(false);
  const [issueLinkTypes, updateIssueLinkTypes] = useState<IssueLinkTypeExtended[]>([]);
  const [
    currentIssueLinkTypeExtended,
    updateCurrentIssueLinkTypeExtended,
  ] = useState<IssueLinkTypeExtended | null>(null);
  const [isSelectVisible, updateSelectVisible] = useState(false);
  const [isScrolling, updateScrolling] = useState(false);
  const [queryData, updateQueryData] = useState({
    query: '',
    _query: '',
  });
  const [isQASelectVisible, updateQASelectVisible] = useState(false);
  const [suggestions, updateSuggestions] = useState<AssistSuggest[]>([]);
  const loadLinkTypes = useCallback(async (): Promise<Array<IssueLinkType>> => {
    return await issueCommonLinksActions({}).loadIssueLinkTypes();
  }, []);
  const doLinkIssue = useCallback(
    async (issue: IssueOnListExtended) => {
      if (currentIssueLinkTypeExtended) {
        updateLoading(true);
        await props.onLinkIssue(
          getReadableID(issue),
          currentIssueLinkTypeExtended.getName(),
        );
        updateLoading(false);
        props.onUpdate();
        props?.onHide?.();
      }
    },
    [currentIssueLinkTypeExtended, props],
  );
  const getIssueToLink = useCallback((q: string, _issues: IssueOnListExtended[]):
    | IssueOnListExtended
    | null
    | undefined => {
    const issueToLinkIdReadable: string = (q[0] === '#' ? q.slice(1) : q)
      .trim()
      .toLowerCase();
    const issueIdTokens: string[] = issueToLinkIdReadable.split('-');
    const isSingleIssueQuery: boolean =
      issueIdTokens.length === 2 &&
      issueIdTokens[1].length > 0 &&
      issueIdTokens[1]
        .split('')
        .some((char: string) => char >= '0' && char <= '9');
    return isSingleIssueQuery
      ? _issues.find((issue: IssueOnListExtended) => issue.idReadable?.toLowerCase() === issueToLinkIdReadable)
      : null;
  }, []);
  const doSearch = useCallback(
    async (
      linkType: IssueLinkTypeExtended | null | undefined,
      q: string = queryData.query,
    ) => {
      if (linkType) {
        updateLoading(true);

        const _issues: IssueOnListExtended[] = await props.issuesGetter(
          linkType.getName(),
          q,
        );

        const issueToLink: IssueOnListExtended | null | undefined = getIssueToLink(
          q,
          _issues,
        );

        if (issueToLink) {
          await doLinkIssue(issueToLink);
        } else {
          updateIssues(_issues);
        }

        updateLoading(false);
      }
    },
    [doLinkIssue, getIssueToLink, props, queryData.query],
  );
  useEffect(() => {
    updateLoading(true);
    loadLinkTypes().then((linkTypes: IssueLinkType[]) => {
      const issueLinkTypesExtended: IssueLinkTypeExtended[] = createLinkTypes(
        linkTypes,
      );
      updateCurrentIssueLinkTypeExtended(issueLinkTypesExtended[0]);
      updateIssueLinkTypes(issueLinkTypesExtended);
      doSearch(issueLinkTypesExtended[0]);
    }); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuggestions = async (
    q: string,
    caret: number,
  ): Promise<AssistSuggest[]> => {
    const _suggestions = await getAssistSuggestions(
      getApi(),
      q,
      caret,
    );

    updateSuggestions(_suggestions);
    return _suggestions;
  };

  const renderSearch = () => {
    if (isQASelectVisible) {
      return (
        <QueryAssistPanel
          queryAssistSuggestions={suggestions}
          query={queryData.query}
          suggestIssuesQuery={loadSuggestions}
          onQueryUpdate={(q: string) => {
            updateQueryData({
              query: q,
              _query: q,
            });
            updateQASelectVisible(false);
            doSearch(currentIssueLinkTypeExtended, q);
          }}
          onClose={(q: string) => {
            if (!q && q !== queryData._query) {
              doSearch(currentIssueLinkTypeExtended, q);
            }

            updateQueryData({
              query: q,
              _query: q,
            });
            updateQASelectVisible(false);
          }}
          clearButtonMode="always"
        />
      );
    } else {
      return (
        <View style={isScrolling ? styles.searchPanelContainer : null}>
          <QueryPreview
            style={styles.searchPanel}
            query={queryData.query}
            onFocus={(clearQuery: boolean) => {
              if (clearQuery) {
                updateQueryData({
                  query: '',
                  _query: queryData.query,
                });
              }

              updateQASelectVisible(true);
            }}
          />
        </View>
      );
    }
  };

  const renderIssue = (issue: IssueOnListExtended) => {
    return (
      <AnimatedView useNativeDriver duration={500} animation="fadeIn">
        <IssueRow
          issue={issue}
          onClick={doLinkIssue}
        />
      </AnimatedView>
    );
  };

  const renderLinkTypesSelect = () => {
    const hideSelect = () => updateSelectVisible(false);

    const selectProps = {
      multi: false,
      selectedItems: [currentIssueLinkTypeExtended],
      emptyValue: null,
      getTitle: (linkType: IssueLinkTypeExtended) => linkType.getPresentation(),
      dataSource: () => Promise.resolve(issueLinkTypes),
      onSelect: (linkType: IssueLinkTypeExtended) => {
        updateCurrentIssueLinkTypeExtended(linkType);
        hideSelect();
      },
      onCancel: hideSelect,
    };
    return <Select {...selectProps} />;
  };

  return (
    <View style={[styles.container, props.style]}>
      <Header
        testID="test:id/link-issue-button"
        accessibilityLabel="link-issue-button"
        accessible={true}
        title={i18n('Link issue')}
        showShadow={true}
        leftButton={props.closeIcon || <IconBack color={styles.link.color} />}
        onBack={props.onHide}
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

      {isLoading && (
        <ActivityIndicator
          size="large"
          style={styles.loader}
          color={styles.link.color}
        />
      )}

      <FlatList
        style={styles.issuesToLinkContainer}
        contentContainerStyle={styles.linkedList}
        data={issues}
        onScroll={(event: any) => {
          const isScrolled: boolean =
            event.nativeEvent.contentOffset.y > UNIT * 2;
          updateScrolling(isScrolled);
        }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() =>
              doSearch(currentIssueLinkTypeExtended, queryData.query)
            }
            tintColor={styles.link.color}
          />
        }
        scrollEventThrottle={50}
        keyExtractor={(issue: Partial<IssueOnListExtended>): string => issue.id as string}
        renderItem={(info: {item: any}) => renderIssue(info.item)}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          !isLoading && issues.length === 0
            ? () => (
                <ErrorMessage
                  style={styles.container}
                  errorMessageData={{
                    ...ERROR_MESSAGE_DATA.NO_ISSUES_FOUND,
                    icon: () => (
                      <IconNothingFound
                        size={ICON_PICTOGRAM_DEFAULT_SIZE / 1.5}
                        style={styles.noIssuesMessage}
                      />
                    ),
                  }}
                />
              )
            : null
        }
      />

      {isSelectVisible && renderLinkTypesSelect()}
    </View>
  );
};

export default React.memo<Props>(LinkedIssuesAddLink);
