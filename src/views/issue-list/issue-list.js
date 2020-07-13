/* @flow */

import {
  View,
  Text,
  FlatList,
  RefreshControl,
  AppState,
  TouchableOpacity
} from 'react-native';
import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {COLOR_BLACK, COLOR_PINK, UNIT} from '../../components/variables/variables';
import {notifyError} from '../../components/notification/notification';
import usage from '../../components/usage/usage';
import log from '../../components/log/log';

import IssueRow from './issue-list__row';
import ErrorMessage from '../../components/error-message/error-message';
import Router from '../../components/router/router';
import {View as AnimatedView} from 'react-native-animatable';
import * as issueActions from './issue-list-actions';
import type Auth from '../../components/auth/auth';
import type Api from '../../components/api/api';
import type {IssuesListState} from './issue-list-reducers';
import type {IssueOnList} from '../../flow/Issue';
import Select from '../../components/select/select';
import SearchPanel from './issue-list__search-panel';
import SearchQueryPreview from '../../components/query-assist/search-query-preview';
import IssuesCount from './issue-list__count';

import {IconAdd, IconAngleDown} from '../../components/icon/icon';
import {isReactElement} from '../../util/util';
import {LoadMoreList} from '../../components/progress/load-more-list';
import {SkeletonIssues} from '../../components/skeleton/skeleton';
import {initialState} from './issue-list-reducers';
import {HIT_SLOP} from '../../components/common-styles/button';
import {ERROR_MESSAGE_DATA} from '../../components/error/error-message-data';

import styles from './issue-list.styles';

type Props = $Shape<IssuesListState & typeof issueActions & {
  auth: Auth,
  api: Api,
  initialSearchQuery: ?string,
  onOpenContextSelect: () => any
}>;

type State = {
  isEditQuery: boolean,
  clearSearchQuery: boolean
}

export class IssueList extends Component<Props, State> {
  searchPanelNode: Object;

  constructor() {
    super();
    this.state = {
      isEditQuery: false,
      clearSearchQuery: false
    };
    usage.trackScreenView('Issue list');
  }

  _handleAppStateChange = (newState) => {
    if (newState === 'active') {
      this.props.refreshIssues();
    }
  };

  componentDidMount() {
    this.props.initializeIssuesList(this.props.initialSearchQuery);

    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    if (Object.keys(initialState).some((stateKey: string) => this.props[stateKey] !== nextProps[stateKey])) {
      return true;
    }

    return this.state !== nextState;
  }

  goToIssue(issue: IssueOnList) {
    log.debug(`Opening issue "${issue.id}" from list`);
    if (!issue.id) {
      log.warn('Attempt to open bad issue', issue);
      notifyError('Can\'t open issue', new Error('Attempt to open issue without ID'));
      return;
    }
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  }

  renderCreateIssueButton = (isDisabled: boolean) => {
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={styles.createIssueButton}
        onPress={() => Router.CreateIssue()}
        disabled={isDisabled}
      >
        <IconAdd size={20} color={COLOR_PINK}/>
      </TouchableOpacity>
    );
  };

  _renderRow = ({item}) => {
    if (isReactElement(item)) {
      return item;
    }

    return (
      <IssueRow
        key={item.id}
        issue={item}
        onClick={(issue) => this.goToIssue(issue)}
        onTagPress={(query) => Router.IssueList({query})}/>
    );
  };

  getKey = (item: Object) => {
    return `${isReactElement(item) ? item.key : item.id}`;
  };

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={false}
      onRefresh={this.props.refreshIssues}
      tintColor={COLOR_PINK}
      testID="refresh-control"
    />;
  }

  _renderSeparator = (item) => {
    if (isReactElement(item.leadingItem)) {
      return null;
    }
    return <View style={styles.separator}/>;
  };

  onEndReached = () => {
    this.props.loadMoreIssues();
  };

  renderContextButton = () => {
    const {onOpenContextSelect, isRefreshing, searchContext, isSearchContextPinned} = this.props;

    return (
      <TouchableOpacity
        key="issueListContext"
        style={[
          styles.searchContext,
          isSearchContextPinned ? styles.searchContextPinned : null
        ]}
        disabled={isRefreshing || !searchContext}
        onPress={onOpenContextSelect}
      >
        <View
          style={styles.searchContextButton}
        >
          <Text
            numberOfLines={1}
            style={styles.contextButtonText}
          >
            {`${searchContext?.name || ''} `}
            {searchContext && <IconAngleDown color={COLOR_BLACK} size={17}/>}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


  renderContextSelect() {
    return (
      <Select
        getTitle={item => item.name + (item.shortName ? ` (${item.shortName})` : '')}
        {...this.props.selectProps}
      />
    );
  }

  searchPanelRef = (instance: ?SearchPanel) => {
    if (instance) {
      this.searchPanelNode = instance;
    }
  };

  onScroll = (nativeEvent: Object) => {
    const newY = nativeEvent.contentOffset.y;
    const isPinned: boolean = newY >= UNIT;
    if (this.props.isSearchContextPinned !== isPinned) {
      this.props.updateSearchContextPinned(isPinned);
    }
  };

  setEditQueryMode(isEditQuery: boolean) {
    this.setState({
      isEditQuery: isEditQuery
    });
  }

  clearSearchQuery(clearSearchQuery: boolean) {
    this.setState({
      clearSearchQuery: clearSearchQuery
    });
  }

  onSearchQueryPanelFocus = (clearSearchQuery: boolean = false) => {
    this.setEditQueryMode(true);
    this.clearSearchQuery(clearSearchQuery);
  }


  renderSearchPanel = () => {
    const {query, suggestIssuesQuery, queryAssistSuggestions, onQueryUpdate, setIssuesCount} = this.props;
    const _query = this.state.clearSearchQuery ? '' : query;

    return (
      <SearchPanel
        key="SearchPanel"
        ref={this.searchPanelRef}
        queryAssistSuggestions={queryAssistSuggestions}
        query={_query}
        suggestIssuesQuery={suggestIssuesQuery}
        onQueryUpdate={(query: string) => {
          this.setEditQueryMode(false);
          setIssuesCount(null);
          onQueryUpdate(query);
        }}
        onClose={() => this.setEditQueryMode(false)}
        clearButtonMode="always"
      />
    );
  };

  renderSearchQuery = () => {
    const {query, issuesCount} = this.props;

    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
        style={styles.listHeader}
      >
        <SearchQueryPreview
          query={query}
          onFocus={this.onSearchQueryPanelFocus}
        />
        <IssuesCount issuesCount={issuesCount}/>
      </AnimatedView>
    );
  };

  renderIssuesFooter = () => {
    const {isLoadingMore, isListEndReached} = this.props;
    if (isLoadingMore && !isListEndReached) {
      return <LoadMoreList/>;
    }
    return null;
  }

  renderIssues() {
    const {issues, isRefreshing} = this.props;
    const contextButton = this.renderContextButton();
    const searchQuery = this.renderSearchQuery();

    if (isRefreshing || !issues) {
      return (
        <View style={styles.list}>
          {contextButton}
          {searchQuery}

          <SkeletonIssues/>
        </View>
      );
    }

    const listData: Array<Object> = [
      contextButton,
      searchQuery
    ].concat(issues || []);

    return (
      <FlatList
        style={styles.list}
        testID="issue-list"
        stickyHeaderIndices={[0]}
        removeClippedSubviews={false}

        data={listData}
        keyExtractor={this.getKey}
        renderItem={this._renderRow}
        ItemSeparatorComponent={this._renderSeparator}
        ListEmptyComponent={() => {
          return <Text>No issues found</Text>;
        }}
        ListFooterComponent={this.renderIssuesFooter}

        refreshControl={this._renderRefreshControl()}
        onScroll={(params) => this.onScroll(params.nativeEvent)}
        tintColor={COLOR_PINK}

        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.1}
      />
    );
  }

  renderError() {
    const {isRefreshing, loadingError, issues, isInitialized} = this.props;
    if (isRefreshing || !isInitialized) {
      return null;
    }

    const props = Object.assign(
      {},
      loadingError
        ? {error: loadingError}
        : issues?.length === 0
          ? {errorMessageData: ERROR_MESSAGE_DATA.NO_ISSUES_FOUND}
          : null
    );

    if (Object.keys(props).length > 0) {
      return <ErrorMessage testID="issuesLoadingError" {...props}/>;
    }

    return null;
  }

  render() {
    const {isIssuesContextOpen, isRefreshing} = this.props;
    return (
      <View
        style={styles.listContainer}
        testID="issue-list-page"
      >
        {isIssuesContextOpen && this.renderContextSelect()}
        {this.state.isEditQuery && this.renderSearchPanel()}

        {this.renderIssues()}
        {this.renderError()}

        {this.renderCreateIssueButton(isRefreshing)}
      </View>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.issueList,
    ...state.app,
    initialSearchQuery: ownProps.query,
    searchContext: state.app?.user?.profiles?.general?.searchContext
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    onQueryUpdate: (query) => dispatch(issueActions.onQueryUpdate(query)),
    onOpenContextSelect: () => dispatch(issueActions.openIssuesContextSelect()),
    updateSearchContextPinned: (isSearchScrolledUp) => dispatch(issueActions.updateSearchContextPinned(isSearchScrolledUp)),
    setIssuesCount: (count: number | null) => dispatch(issueActions.setIssuesCount(count))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(IssueList);
