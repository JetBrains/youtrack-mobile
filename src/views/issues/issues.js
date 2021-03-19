/* @flow */

import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import React, {Component} from 'react';

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as issueActions from './issues-actions';
import ErrorMessage from '../../components/error-message/error-message';
import IssueRow from './issues__row';
import IssuesCount from './issues__count';
import log from '../../components/log/log';
import QueryAssistPanel from '../../components/query-assist/query-assist-panel';
import QueryPreview from '../../components/query-assist/query-preview';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import SelectSectioned from '../../components/select/select-sectioned';
import usage from '../../components/usage/usage';
import {ANALYTICS_ISSUES_PAGE} from '../../components/analytics/analytics-ids';
import {ERROR_MESSAGE_DATA} from '../../components/error/error-message-data';
import {HIT_SLOP} from '../../components/common-styles/button';
import {IconAdd, IconAngleDown, IconBookmark} from '../../components/icon/icon';
import {IconNothingFound} from '../../components/icon/icon-no-found';
import {initialState} from './issues-reducers';
import {isReactElement} from '../../util/util';
import {logEvent} from '../../components/log/log-helper';
import {notifyError} from '../../components/notification/notification';
import {routeMap} from '../../app-routes';
import {SkeletonIssues} from '../../components/skeleton/skeleton';
import {ThemeContext} from '../../components/theme/theme-context';
import {UNIT} from '../../components/variables/variables';
import {View as AnimatedView} from 'react-native-animatable';

import styles, {noIssuesFoundIconSize} from './issues.styles';

import type Api from '../../components/api/api';
import type Auth from '../../components/auth/auth';
import type {IssueOnList} from '../../flow/Issue';
import type {IssuesState} from './issues-reducers';
import type {Theme, UITheme} from '../../flow/Theme';

type Props = $Shape<IssuesState & typeof issueActions & {
  auth: Auth,
  api: Api,
  initialSearchQuery: ?string,
  onOpenContextSelect: () => any
}>;

type State = {
  isEditQuery: boolean,
  clearSearchQuery: boolean
}

export class Issues extends Component<Props, State> {
  searchPanelNode: Object;
  unsubscribeOnDispatch: Function;

  constructor(props: Props) {
    super(props);
    this.state = {
      isEditQuery: false,
      clearSearchQuery: false,
    };
    usage.trackScreenView('Issue list');
  }

  componentDidMount() {
    this.props.initializeIssuesList(this.props.initialSearchQuery);

    this.unsubscribeOnDispatch = Router.setOnDispatchCallback((routeName: string, prevRouteName: string, options: Object) => {
      if (routeName === routeMap.Issues && prevRouteName === routeMap.Issue && options?.issueId) {
        this.props.updateIssue(options.issueId);
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribeOnDispatch();
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
    Router.Issue({
      issuePlaceholder: issue,
      issueId: issue.id,
    });
  }

  renderCreateIssueButton = (isDisabled: boolean, uiTheme: UITheme) => {
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        style={styles.createIssueButton}
        onPress={() => Router.CreateIssue()}
        disabled={isDisabled}
      >
        <IconAdd size={20} color={uiTheme.colors.$link}/>
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
        onTagPress={(query) => Router.Issues({query})}/>
    );
  };

  getKey = (item: Object) => {
    return `${isReactElement(item) ? item.key : item.id}`;
  };

  _renderRefreshControl(uiTheme: UITheme) {
    return <RefreshControl
      refreshing={this.props.isRefreshing}
      onRefresh={this.props.refreshIssues}
      tintColor={uiTheme.colors.$link}
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

  renderContextButton = (uiTheme: UITheme) => {
    const {onOpenContextSelect, isRefreshing, searchContext, isSearchContextPinned} = this.props;

    return (
      <TouchableOpacity
        key="issueListContext"
        style={[
          styles.searchContext,
          isSearchContextPinned ? styles.searchContextPinned : null,
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
          </Text>
          {searchContext && <IconAngleDown color={uiTheme.colors.$text} size={17}/>}
        </View>
      </TouchableOpacity>
    );
  };


  renderContextSelect() {
    const {selectProps} = this.props;

    if (selectProps.isOwnSearches) {
      return (
        <SelectSectioned
          getTitle={item => item.name + (item.shortName ? ` (${item.shortName})` : '')}
          {...selectProps}
        />
      );
    }

    return (
      <Select
        getTitle={item => item.name + (item.shortName ? ` (${item.shortName})` : '')}
        {...selectProps}
      />
    );
  }

  searchPanelRef = (instance: ?QueryAssistPanel) => {
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
      isEditQuery: isEditQuery,
    });
  }

  clearSearchQuery(clearSearchQuery: boolean) {
    this.setState({
      clearSearchQuery: clearSearchQuery,
    });
  }

  onSearchQueryPanelFocus = (clearSearchQuery: boolean = false) => {
    logEvent({
      message: 'Focus search panel',
      analyticsId: ANALYTICS_ISSUES_PAGE,
    });
    this.setEditQueryMode(true);
    this.clearSearchQuery(clearSearchQuery);
  };


  renderSearchPanel = () => {
    const {query, suggestIssuesQuery, queryAssistSuggestions, onQueryUpdate, setIssuesCount} = this.props;
    const _query = this.state.clearSearchQuery ? '' : query;

    return (
      <QueryAssistPanel
        key="QueryAssistPanel"
        ref={this.searchPanelRef}
        queryAssistSuggestions={queryAssistSuggestions}
        query={_query}
        suggestIssuesQuery={suggestIssuesQuery}
        onQueryUpdate={(query: string) => {
          logEvent({
            message: 'Apply search',
            analyticsId: ANALYTICS_ISSUES_PAGE,
          });
          this.setEditQueryMode(false);
          setIssuesCount(null);
          onQueryUpdate(query);
        }}
        onClose={() => this.setEditQueryMode(false)}
        clearButtonMode="always"
      />
    );
  };

  renderSearchQuery = (uiTheme: UITheme) => {
    const {query, issuesCount, openSavedSearchesSelect} = this.props;

    return (
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
        style={styles.listHeader}
      >
        <View style={styles.listHeaderTop}>
          <QueryPreview
            style={styles.searchPanel}
            query={query}
            onFocus={this.onSearchQueryPanelFocus}
          />
          <TouchableOpacity
            style={styles.userSearchQueryButton}
            onPress={openSavedSearchesSelect}
          >
            <IconBookmark size={28} color={uiTheme.colors.$link}/>
          </TouchableOpacity>

        </View>

        <IssuesCount issuesCount={issuesCount}/>
      </AnimatedView>
    );
  };

  renderIssuesFooter = () => {
    const {isLoadingMore} = this.props;
    if (isLoadingMore) {
      return <SkeletonIssues/>;
    }
    return null;
  };

  renderIssues(uiTheme: UITheme) {
    const {issues, isRefreshing} = this.props;
    const contextButton = this.renderContextButton(uiTheme);
    const searchQuery = this.renderSearchQuery(uiTheme);

    if (isRefreshing && (!issues || issues.length === 0)) {
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
      searchQuery,
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

        refreshControl={this._renderRefreshControl(uiTheme)}
        onScroll={(params) => this.onScroll(params.nativeEvent)}
        tintColor={uiTheme.colors.$link}

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
        : (issues?.length === 0 ? {
          errorMessageData: {
            ...ERROR_MESSAGE_DATA.NO_ISSUES_FOUND,
            icon: () => <IconNothingFound size={noIssuesFoundIconSize} style={styles.noIssuesFoundIcon} />,
          },
        } : null)
    );

    if (Object.keys(props).length > 0) {
      return <ErrorMessage testID="issuesLoadingError" {...props}/>;
    }

    return null;
  }

  render() {
    const {isIssuesContextOpen, isRefreshing} = this.props;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <View
              style={styles.listContainer}
              testID="issue-list-page"
            >
              {isIssuesContextOpen && this.renderContextSelect()}
              {this.state.isEditQuery && this.renderSearchPanel()}

              {this.renderIssues(theme.uiTheme)}
              {this.renderError()}

              {this.renderCreateIssueButton(isRefreshing, theme.uiTheme)}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...state.issueList,
    ...state.app,
    initialSearchQuery: ownProps.query,
    searchContext: state.app?.user?.profiles?.general?.searchContext,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    onQueryUpdate: (query) => dispatch(issueActions.onQueryUpdate(query)),
    onOpenContextSelect: () => dispatch(issueActions.openContextSelect()),
    openSavedSearchesSelect: () => dispatch(issueActions.openSavedSearchesSelect()),
    updateSearchContextPinned: (isSearchScrolledUp) => dispatch(
      issueActions.updateSearchContextPinned(isSearchScrolledUp)),
    setIssuesCount: (count: number | null) => dispatch(issueActions.setIssuesCount(count)),
    updateIssue: (issueId: string) => dispatch(issueActions.updateIssue(issueId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Issues);
