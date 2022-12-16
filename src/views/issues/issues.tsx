/* @flow */

import {
  Dimensions,
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
import CreateIssue from 'views/create-issue/create-issue';
import ErrorMessage from 'components/error-message/error-message';
import Issue from '../issue/issue';
import IssueRow from './issues__row';
import IssuesCount from './issues__count';
import IssuesSortBy from './issues__sortby';
import log from '../../components/log/log';
import ModalPortal from '../../components/modal-view/modal-portal';
import NothingSelectedIconWithText from 'components/icon/nothing-selected-icon-with-text';
import QueryAssistPanel from '../../components/query-assist/query-assist-panel';
import QueryPreview from '../../components/query-assist/query-preview';
import Router from '../../components/router/router';
import Select, {SelectModal} from '../../components/select/select';
import SelectSectioned, {SelectSectionedModal} from '../../components/select/select-sectioned';
import usage from '../../components/usage/usage';
import {addListenerGoOnline} from '../../components/network/network-events';
import {ANALYTICS_ISSUES_PAGE} from '../../components/analytics/analytics-ids';
import {ERROR_MESSAGE_DATA} from '../../components/error/error-message-data';
import {getIssueFromCache} from './issues-actions';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {IconAdd, IconAngleDown, IconBookmark} from 'components/icon/icon';
import {ICON_PICTOGRAM_DEFAULT_SIZE, IconNothingFound} from 'components/icon/icon-pictogram';
import {initialState} from './issues-reducers';
import {isReactElement} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {logEvent} from 'components/log/log-helper';
import {notify} from 'components/notification/notification';
import {requestController} from 'components/api/api__request-controller';
import {routeMap} from '../../app-routes';
import {SkeletonIssues} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables/variables';

import styles from './issues.styles';

import type Api from 'components/api/api';
import type Auth from 'components/auth/oauth2';
import type {AnyIssue, IssueOnList} from 'flow/Issue';
import type {AppState} from '../../reducers';
import type {ErrorMessageProps} from 'components/error-message/error-message';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type {Folder} from 'flow/User';
import type {IssuesState} from './issues-reducers';
import type {Node} from 'react';
import type {Theme, UIThemeColors} from 'flow/Theme';

type IssuesActions = typeof issueActions;
type Props = {
  ...IssuesState,
  ...IssuesActions,
  auth: Auth,
  api: Api,
  onOpenContextSelect: () => any,
  issueId?: string,
  searchQuery?: string,
};


type State = {
  isEditQuery: boolean,
  clearSearchQuery: boolean,
  focusedIssue: ?AnyIssue,
  isSplitView: boolean,
  isCreateModalVisible: boolean,
}

export class Issues extends Component<Props, State> {
  searchPanelNode: Object;
  unsubscribeOnDispatch: Function;
  unsubscribeOnDimensionsChange: EventSubscription;
  theme: Theme;
  goOnlineSubscription: EventSubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      isEditQuery: false,
      clearSearchQuery: false,
      focusedIssue: null,
      isSplitView: false,
      isCreateModalVisible: false,
    };
    usage.trackScreenView('Issue list');
  }

  onDimensionsChange: () => void = (): void => {
    const isSplit: boolean = isSplitView();
    this.setState({
      isSplitView: isSplit,
      focusedIssue: isSplit ? this.state.focusedIssue : null,
    });
  };

  refresh() {
    this.props.initializeIssuesList(this.props.searchQuery);
  }

  async componentDidMount() {
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener('change', this.onDimensionsChange);
    this.onDimensionsChange();

    this.refresh();

    this.unsubscribeOnDispatch = Router.setOnDispatchCallback((routeName: string, prevRouteName: string, options: Object) => {
      if (prevRouteName === routeMap.Issues && routeName !== routeMap.Issues) {
        requestController.cancelIssuesRequests();
      }

      if (routeName === routeMap.Issues && prevRouteName === routeMap.Issue && options?.issueId) {
        this.props.updateIssue(options.issueId);
        if (this.props.issuesCount === null) {
          this.props.refreshIssuesCount();
        }
      }
    });

    const issueId: ?string = this.props.issueId;
    if (issueId) {
      const targetIssue: AnyIssue = getIssueFromCache(issueId) || ({id: issueId}: any);
      this.updateFocusedIssue(targetIssue);
    }

    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.refresh();
    });
  }

  componentWillUnmount() {
    this.unsubscribeOnDimensionsChange.remove();
    this.unsubscribeOnDispatch();
    this.goOnlineSubscription.remove();
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
      notify('Attempt to open issue without ID', 7000);
      return;
    }
    Router.Issue({
      issuePlaceholder: issue,
      issueId: issue.id,
    });
  }

  isMatchesQuery: (issueId: string) => Promise<boolean> = async (issueIdReadable: string): Function => {
    return await this.props.isIssueMatchesQuery(issueIdReadable);
  };

  renderModalPortal: () => ?Node = (): ?Node => {
    const onHide = () => this.setState({isCreateModalVisible: false});
    return (
      this.state.isSplitView ? (
        <ModalPortal
          onHide={onHide}
        >
          {this.state.isCreateModalVisible && (
            <CreateIssue
              isSplitView={true}
              onHide={onHide}
              isMatchesQuery={this.isMatchesQuery}
            />
          )}
        </ModalPortal>
      ) : null
    );
  };

  renderCreateIssueButton: ((isDisabled: boolean) => Node) = (isDisabled: boolean) => {
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        testID="test:id/create-issue-button"
        accessibilityLabel="create-issue-button"
        accessible={true}
        style={styles.createIssueButton}
        onPress={() => {
          if (this.state.isSplitView) {
            this.setState({isCreateModalVisible: true});
          } else {
            Router.CreateIssue({
              onHide: () => Router.pop(true),
              isMatchesQuery: this.isMatchesQuery,
            });
          }
        }}
        disabled={isDisabled}
      >
        <IconAdd size={20} color={isDisabled ? this.getThemeColors().$disabled : this.getThemeColors().$link}/>
      </TouchableOpacity>
    );
  };

  _renderRow = ({item}) => {
    const {focusedIssue} = this.state;

    if (isReactElement(item)) {
      return item;
    }

    return (
      <View
        style={[
          styles.row,
          focusedIssue?.id === item.id || focusedIssue?.id === item.idReadable ? styles.splitViewMainFocused : null,
        ]}
      >
        <IssueRow
          issue={item}
          onClick={(issue) => {
            if (this.state.isSplitView) {
              this.updateFocusedIssue(issue);
            } else {
              this.goToIssue(issue);
            }
          }}
          onTagPress={(searchQuery: string) => Router.Issues({searchQuery})}/>
      </View>
    );
  };

  getKey: ((item: any) => string) = (item: Object) => {
    return `${isReactElement(item) ? item.key : item.id}`;
  };

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={false}
      //$FlowFixMe
      onRefresh={this.props.refreshIssues}
      tintColor={this.theme.uiTheme.colors.$link}
      testID="refresh-control"
      accessibilityLabel="refresh-control"
      accessible={true}
    />;
  }

  _renderSeparator = (item) => {
    if (isReactElement(item.leadingItem)) {
      return null;
    }
    return <View style={styles.separator}/>;
  };

  onEndReached: (() => void) = () => {
    this.props.loadMoreIssues();
  };

  getThemeColors(): UIThemeColors {
    return this.theme.uiTheme.colors;
  }

  renderContextButton: () => Node = () => {
    const {onOpenContextSelect, isRefreshing, searchContext, isSearchContextPinned, networkState} = this.props;
    const isDisabled: boolean = isRefreshing || !searchContext || !networkState?.isConnected;
    return (
      <TouchableOpacity
        key="issueListContext"
        accessible={true}
        testID = "test:id/issue-list-context"
        accessibilityLabel = "search-context"
        style={[
          styles.searchContext,
          isSearchContextPinned ? styles.searchContextPinned : null,
        ]}
        disabled={isDisabled}
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
          {searchContext &&
            <IconAngleDown
              color={isDisabled ? this.getThemeColors().$disabled : this.getThemeColors().$text}
              size={17}
            />}
        </View>
      </TouchableOpacity>
    );
  };


  renderContextSelect(): any {
    const {selectProps} = this.props;
    const {onSelect, ...restSelectProps} = selectProps;
    const sp: any = {
      ...restSelectProps,
      onSelect: async (selectedContext: Folder) => {
        this.updateFocusedIssue(null);
        onSelect(selectedContext);
      },
    };
    const isSplitViewMode: boolean = isSplitView();
    let SelectComponent: any;
    if (selectProps.isOwnSearches) {
      SelectComponent = isSplitViewMode ? SelectSectionedModal : SelectSectioned;
      return (
        <SelectComponent
          getTitle={item => item.name + (item.shortName ? ` (${item.shortName})` : '')}
          {...sp}
        />
      );
    }

    SelectComponent = isSplitViewMode ? SelectModal : Select;
    return (
      <SelectComponent
        getTitle={item => item.name + (item.shortName ? ` (${item.shortName})` : '')}
        {...sp}
      />
    );
  }

  searchPanelRef: ((instance: ?QueryAssistPanel) => void) = (instance: ?QueryAssistPanel) => {
    if (instance) {
      this.searchPanelNode = instance;
    }
  };

  onScroll: ((nativeEvent: any) => void) = (nativeEvent: Object) => {
    const newY = nativeEvent.contentOffset.y;
    const isPinned: boolean = newY >= UNIT;
    if (this.props.isSearchContextPinned !== isPinned) {
      this.props.updateSearchContextPinned(isPinned);
    }
  };

  setEditQueryMode(isEditQuery: boolean) {
    this.setState({isEditQuery});
  }

  clearSearchQuery(clearSearchQuery: boolean) {
    this.setState({clearSearchQuery});
  }

  updateFocusedIssue(focusedIssue: ?AnyIssue) {
    this.setState({focusedIssue});
  }

  onSearchQueryPanelFocus: ((clearSearchQuery?: boolean) => void) = (clearSearchQuery: boolean = false) => {
    logEvent({
      message: 'Focus search panel',
      analyticsId: ANALYTICS_ISSUES_PAGE,
    });
    this.setEditQueryMode(true);
    this.clearSearchQuery(clearSearchQuery);
  };

  onQueryUpdate: (query: string) => void = (query: string) => {
    logEvent({
      message: 'Apply search',
      analyticsId: ANALYTICS_ISSUES_PAGE,
    });
    this.setEditQueryMode(false);
    this.props.setIssuesCount(null);
    this.props.onQueryUpdate(query);
  };

  renderSearchPanel: (() => Node) = () => {
    const {query, suggestIssuesQuery, queryAssistSuggestions} = this.props;
    const _query = this.state.clearSearchQuery ? '' : query;

    return (
      <QueryAssistPanel
        key="QueryAssistPanel"
        ref={this.searchPanelRef}
        queryAssistSuggestions={queryAssistSuggestions}
        query={_query}
        suggestIssuesQuery={suggestIssuesQuery}
        onQueryUpdate={(q: string) => {
          this.onQueryUpdate(q);
        }}
        onClose={(q: string) => {
          if (this.state.clearSearchQuery) {
            logEvent({
              message: 'Clear search',
              analyticsId: ANALYTICS_ISSUES_PAGE,
            });
            this.onQueryUpdate(q);
          } else {
            this.setEditQueryMode(false);
          }
        }}
        clearButtonMode="always"
      />
    );
  };

  hasIssues: () => boolean = (): boolean => this.props.issues?.length > 0;

  renderSearchQuery: () => Node = () => {
    const {query, issuesCount, openSavedSearchesSelect, searchContext, networkState} = this.props;
    return (
      <View style={styles.listHeader}>
        <View style={styles.listHeaderTop}>
          <QueryPreview
            style={styles.searchPanel}
            query={query}
            onFocus={this.onSearchQueryPanelFocus}
          />
          <TouchableOpacity
            style={styles.userSearchQueryButton}
            testID="test:id/user-search-query-button"
            accessibilityLabel="user-search-query-button"
            accessible={true}
            onPress={openSavedSearchesSelect}
            disabled={!networkState?.isConnected}
          >
            <IconBookmark
              size={28}
              color={networkState?.isConnected ? this.getThemeColors().$link : this.getThemeColors().$disabled}
            />
          </TouchableOpacity>

        </View>

        {this.hasIssues() && <View style={styles.toolbar}>
          <IssuesCount issuesCount={issuesCount}/>
          <IssuesSortBy
            context={searchContext}
            onApply={(q: string) => {this.onQueryUpdate(q);}}
            query={query}
          />
        </View>}
      </View>
    );
  };

  renderIssuesFooter: (() => null | Node) = () => {
    const {isLoadingMore} = this.props;
    if (isLoadingMore) {
      return <SkeletonIssues/>;
    }
    return this.renderError();
  };

  renderIssueList(): Node {
    const {issues, isRefreshing} = this.props;
    const contextButton = this.renderContextButton();
    const searchQuery = this.renderSearchQuery();

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
          return <Text>{i18n('No issues found')}</Text>;
        }}
        ListFooterComponent={this.renderIssuesFooter}

        refreshControl={this._renderRefreshControl()}
        onScroll={(params) => this.onScroll(params.nativeEvent)}
        tintColor={this.theme.uiTheme.colors.$link}

        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.1}
      />
    );
  }

  renderError(): null | Node {
    const {isRefreshing, loadingError, isInitialized} = this.props;
    if (isRefreshing || !isInitialized) {
      return null;
    }

    const props: $Shape<ErrorMessageProps> = Object.assign(
      {},
      loadingError
        ? {error: loadingError}
        : (!this.hasIssues() ? {
          errorMessageData: {
            ...ERROR_MESSAGE_DATA.NO_ISSUES_FOUND,
            icon: () => <IconNothingFound size={ICON_PICTOGRAM_DEFAULT_SIZE} style={styles.noIssuesFoundIcon}/>,
          },
        } : null)
    );

    if (Object.keys(props).length > 0) {
      return <ErrorMessage testID="issuesLoadingError" {...props}/>;
    }

    return null;
  }

  renderIssues: () => Node = () => {
    const {isIssuesContextOpen, isRefreshing} = this.props;
    return (
      <View
        style={styles.listContainer}
        testID="test:id/issueListPhone"
      >
        {isIssuesContextOpen && this.renderContextSelect()}
        {this.state.isEditQuery && this.renderSearchPanel()}

        {this.renderIssueList()}

        {this.renderCreateIssueButton(isRefreshing)}
      </View>
    );
  };

  renderFocusedIssue: () => Node = () => {
    const {focusedIssue} = this.state;

    if (!focusedIssue || !this.hasIssues()) {
      return <NothingSelectedIconWithText text={i18n('Select an issue from the list')}/>;
    }

    return (
      <View style={styles.splitViewMain}>
        <Issue
          issuePlaceholder={focusedIssue}
          issueId={focusedIssue.id}
          onCommandApply={() => {
            this.refresh();
          }}
        />
      </View>
    );
  };

  renderSplitView: () => Node = () => {
    return (
      <>
        <View style={styles.splitViewSide}>
          {this.renderIssues()}
        </View>
        <View style={styles.splitViewMain}>
          {this.renderFocusedIssue()}
        </View>
      </>
    );
  };

  render(): Node {
    const {isSplitView} = this.state;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.theme = theme;
          return (
            <View
              style={[styles.listContainer, isSplitView ? styles.splitViewContainer : null]}
              testID="issue-list-page"
            >
              {isSplitView && this.renderSplitView()}
              {!isSplitView && this.renderIssues()}
              {this.renderModalPortal()}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state: AppState, ownProps: { issueId?: string, searchQuery?: string }) => {
  return {
    ...state.issueList,
    ...ownProps,
    ...state.app,
    searchContext: state.issueList.searchContext,
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

export default (connect(mapStateToProps, mapDispatchToProps)(Issues));
