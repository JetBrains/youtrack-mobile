import {
  Dimensions,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';

import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import * as issueActions from './issues-actions';
import * as actions from './issues-reducers';
import CreateIssue from 'views/create-issue/create-issue';
import ErrorMessage from 'components/error-message/error-message';
import IconSettings from 'components/icon/assets/settings.svg';
import IconPlus from 'components/icon/assets/plus.svg';
import Issue from 'views/issue/issue';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import IssueRow, {IssueRowCompact} from './issues__row';
import IssuesCount from './issues__count';
import IssuesFilters from 'views/issues/issues__filters';
import IssuesListSettings from './issues__settings';
import log from 'components/log/log';
import ModalPortal from 'components/modal-view/modal-portal';
import NothingSelectedIconWithText from 'components/icon/nothing-selected-icon-with-text';
import QueryAssistPanel from 'components/query-assist/query-assist-panel';
import QueryPreview from 'components/query-assist/query-preview';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {addListenerGoOnline} from 'components/network/network-events';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {createAnimatedRotateStyle} from 'views/issues/issues-helper';
import {DEFAULT_THEME} from 'components/theme/theme';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {hasType} from 'components/api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconAngleDown} from 'components/icon/icon';
import {
  ICON_PICTOGRAM_DEFAULT_SIZE,
  IconNothingFound,
} from 'components/icon/icon-pictogram';
import {initialState} from './issues-reducers';
import {isReactElement} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {
  FilterSetting,
  issuesSearchSettingMode,
  issuesViewSettingMode,
} from 'views/issues/index';
import {logEvent} from 'components/log/log-helper';
import {notify} from 'components/notification/notification';
import {requestController} from 'components/api/api__request-controller';
import {routeMap} from 'app-routes';
import {SkeletonIssues, SkeletonIssuesS} from 'components/skeleton/skeleton';
import {Select, SelectModal} from 'components/select/select';
import {
  SectionedSelectWithItemActions,
  SectionedSelectWithItemActionsModal,
} from 'components/select/select-sectioned-with-item-and-star';
import {ThemeContext} from 'components/theme/theme-context';
import {UNIT} from 'components/variables';

import styles from './issues.styles';

import type Api from 'components/api/api';
import type Auth from 'components/auth/oauth2';
import type {AnyIssue, IssueOnList} from 'types/Issue';
import type {AppState} from 'reducers';
import type {ErrorMessageProps} from 'components/error-message/error-message';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type {Folder, User} from 'types/User';
import type {Theme, UIThemeColors} from 'types/Theme';
import {IssuesState} from './issues-reducers';
import {NetInfoState} from '@react-native-community/netinfo';
import {ReduxAction, ReduxThunkDispatch} from 'types/Redux';
import {isHelpdeskProject} from 'components/helpdesk';

type ReduxExtraActions = {[fnName: string]: ReduxAction<unknown>};
type IssuesActions = typeof issueActions;

export type IssuesProps = IssuesState & IssuesActions & ReduxExtraActions & {
  auth: Auth;
  api: Api;
  issueId?: string;
  searchQuery?: string;
  networkState: NetInfoState,
  isInProgress: boolean,
  user: User,
  onFilterPress: (filterField: FilterSetting) => any,
  issuePermissions: IssuePermissions,

  getIssueFromCache: (issueId: string) => ReduxThunkDispatch;
  onQueryUpdate: (query: string) => ReduxThunkDispatch
  onOpenContextSelect: () => ReduxThunkDispatch
  updateSearchContextPinned: ReduxThunkDispatch;
  setIssuesCount: (count: number | null) => ReduxThunkDispatch;
  updateIssue: (issueId: string) => ReduxThunkDispatch;
};

interface State {
  isEditQuery: boolean;
  clearSearchQuery: boolean;
  focusedIssue: AnyIssue | null;
  isSplitView: boolean;
  isCreateModalVisible: boolean;
  settingsVisible: boolean;
}


export class Issues<P extends IssuesProps> extends Component<P, State> {
  unsubscribeOnDispatch: ((...args: any[]) => any) | undefined;
  unsubscribeOnDimensionsChange: EventSubscription | undefined;
  theme: Theme = {uiTheme: DEFAULT_THEME, mode: DEFAULT_THEME.mode, setMode: () => {}};
  goOnlineSubscription: EventSubscription | undefined;

  constructor(props: P) {
    super(props);
    this.state = {
      isEditQuery: false,
      clearSearchQuery: false,
      focusedIssue: null,
      isSplitView: false,
      isCreateModalVisible: false,
      settingsVisible: false,
    };
    this.props.setIssuesMode();
    this.props.setIssuesFromCache();
    usage.trackScreenView('Issue list');
  }

  get searchQuery() {
    return this.props.query;
  }

  onDimensionsChange = (): void => {
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
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener(
      'change',
      this.onDimensionsChange,
    );
    this.onDimensionsChange();
    this.refresh();
    this.unsubscribeOnDispatch = Router.setOnDispatchCallback(
      (
        routeName: string,
        prevRouteName: string,
        options: Record<string, any>,
      ) => {
        if (
          prevRouteName === routeMap.Issues &&
          routeName !== routeMap.Issues
        ) {
          requestController.cancelIssuesRequests();
        }

        if (
          routeName === routeMap.Issues &&
          prevRouteName === routeMap.Issue &&
          options?.issueId
        ) {
          this.props.updateIssue(options.issueId);

          if (this.props.issuesCount === null) {
            this.props.refreshIssuesCount();
          }
        }
      },
    );
    const issueId: string | null | undefined = this.props.issueId;

    if (issueId) {
      const targetIssue: IssueOnList = this.props.getIssueFromCache(issueId) || ({
        id: issueId,
      }) as IssueOnList;
      this.updateFocusedIssue(targetIssue);
    }

    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.refresh();
    });
  }

  componentWillUnmount() {
    this.unsubscribeOnDimensionsChange?.remove?.();
    this.unsubscribeOnDispatch?.();
    this.goOnlineSubscription?.remove?.();
  }

  shouldComponentUpdate(nextProps: IssuesProps, nextState: State): boolean {
    if (
      Object.keys(initialState).some(
        // @ts-ignore
        (stateKey: string) => (this.props)[stateKey] !== nextProps[stateKey],
      )
    ) {
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

  isMatchesQuery = async (issueIdReadable: string) => {
    return await this.props.isIssueMatchesQuery(issueIdReadable);
  };

  renderModalPortal = () => {
    const onHide = () =>
      this.setState({
        isCreateModalVisible: false,
      });

    return this.state.isSplitView ? (
      <ModalPortal onHide={onHide}>
        {this.state.isCreateModalVisible && (
          <CreateIssue
            isSplitView={true}
            onHide={onHide}
            isMatchesQuery={this.isMatchesQuery}
          />
        )}
      </ModalPortal>
    ) : null;
  };

  renderSettingsButton() {
    const animatedStyle = (
      !this.props.isInProgress && !this.isFilterSearchMode() && this.props.searchQuery
        ? createAnimatedRotateStyle()
        : null
    );
    return (
      <TouchableOpacity
        style={styles.listActionsItem}
        disabled={this.props.isInProgress}
        testID="test:id/issuesSettingsButton"
        accessibilityLabel="issuesSettingsButton"
        onPress={() => {
          this.toggleSettingsVisibility(true);
        }}
      >
        <Animated.View style={animatedStyle}>
          <IconSettings
            style={styles.iconSettings}
            width={20}
            height={20}
            color={this.props.isInProgress
              ? this.getThemeColors().$disabled
              : this.getThemeColors().$link}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  renderCreateIssueButton = () => {
    return this.props?.issuePermissions?.canCreateProject?.() ? (
      <TouchableOpacity
        testID="test:id/create-issue-button"
        accessibilityLabel="create-issue-button"
        accessible={true}
        style={styles.listActionsItem}
        onPress={() => {
          if (this.state.isSplitView) {
            this.setState({
              isCreateModalVisible: true,
            });
          } else {
            Router.CreateIssue({
              onHide: () => Router.navigateToDefaultRoute(),
              isMatchesQuery: this.isMatchesQuery,
            });
          }
        }}
        disabled={this.props.isInProgress}
      >
        <IconPlus
          width={22}
          height={22}
          color={
            this.props.isInProgress
              ? this.getThemeColors().$disabled
              : this.getThemeColors().$link
          }
        />
      </TouchableOpacity>
    ) : null;
  };

  _renderRow = ({item}: { item: IssueOnList }) => {
    const {settings} = this.props;
    const {focusedIssue, isSplitView} = this.state;

    if (isReactElement(item)) {
      return item;
    }

    const IssueRowComponent = settings.view.mode === issuesViewSettingMode.S ? IssueRowCompact : IssueRow;
    const contextIsProject: any = hasType.project(this.props.searchContext);
    const filterFieldProject: FilterSetting | undefined = settings.search.filters?.project;
    const selectedProjects: string[] | undefined = filterFieldProject?.selectedValues;
    const hideId: boolean = (
      contextIsProject && selectedProjects?.length === 0 ||
      !contextIsProject && selectedProjects?.length === 1 ||
      (
        contextIsProject &&
        selectedProjects?.length === 1 &&
        this.props.searchContext.id === filterFieldProject.filterField?.[0]?.customField?.id
      )
    );
    return (
      <View
        style={[
          focusedIssue?.id === item.id || item.idReadable && focusedIssue?.id === item.idReadable
            ? styles.splitViewMainFocused
            : null,
        ]}
      >
        <IssueRowComponent
          helpdeskMode={this.props.helpDeskMode && isHelpdeskProject(item)}
          hideId={hideId}
          settings={settings}
          issue={item}
          onClick={issue => {
            if (isSplitView) {
              this.updateFocusedIssue(issue);
            } else {
              this.goToIssue(issue);
            }
          }}
          onTagPress={(searchQuery: string) =>
            Router.Issues({
              searchQuery,
            })
          }
        />
      </View>
    );
  };

  getKey = (item: Record<string, any>) => {
    return `${isReactElement(item) ? item.key : item.id}`;
  };

  _renderRefreshControl() {
    return (
      <RefreshControl
        refreshing={false}
        onRefresh={this.props.refreshIssues}
        tintColor={this.theme.uiTheme.colors.$link}
        testID="refresh-control"
        accessibilityLabel="refresh-control"
        accessible={true}
      />
    );
  }

  _renderSeparator = (item: unknown) => {
    if (isReactElement((item as any).leadingItem)) {
      return null;
    }

    return <View style={styles.separator}/>;
  };
  onEndReached = () => {
    this.props.loadMoreIssues();
  };

  getThemeColors(): UIThemeColors {
    return this.theme.uiTheme.colors;
  }

  getSearchContext(): Folder {
    return this.props.searchContext;
  }

  renderContextButton = () => {
    const {
      isRefreshing,
      isSearchContextPinned,
      networkState,
    } = this.props;
    const searchContext = this.getSearchContext();
    const isDisabled: boolean = isRefreshing || !searchContext || !networkState?.isConnected;
    const themeColors: UIThemeColors = this.getThemeColors();
    return (
      <TouchableOpacity
        key="issueListContext"
        accessible={true}
        testID="test:id/issue-list-context"
        style={[
          styles.searchContext,
          isSearchContextPinned ? styles.searchContextPinned : null,
        ]}
        disabled={isDisabled}
        onPress={this.props.onOpenContextSelect}
      >
        <View style={styles.searchContextButton}>
          <Text
            numberOfLines={1}
            style={styles.contextButtonText}
          >
            {`${searchContext?.name || ''}`}
          </Text>
          {searchContext && (
            <IconAngleDown
              style={styles.contextButtonIcon}
              color={
                isDisabled
                  ? themeColors.$disabled
                  : themeColors.$text
              }
              size={19}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  renderContextSelect() {
    const {selectProps} = this.props;
    const {onSelect, isSectioned, ...restProps} = selectProps!;
    const SelectComponent: React.ElementType = (
      isSplitView()
        ? isSectioned ? SectionedSelectWithItemActionsModal : SelectModal
        : isSectioned ? SectionedSelectWithItemActions : Select
    );
    return (
      <SelectComponent
        onSelect={async (selectedContext: Folder) => {
          this.updateFocusedIssue(null);
          onSelect?.(selectedContext);
        }}
        {...restProps}
        getTitle={(item: Folder) => item.name + (item.shortName ? ` (${item.shortName})` : '')}
      />
    );
  }

  onScroll: (nativeEvent: any) => void = (nativeEvent: Record<string, any>) => {
    const newY = nativeEvent.contentOffset.y;
    const isPinned: boolean = newY >= UNIT;

    if (this.props.isSearchContextPinned !== isPinned) {
      this.props.updateSearchContextPinned(isPinned);
    }
  };

  setEditQueryMode(isEditQuery: boolean) {
    this.setState({
      isEditQuery,
    });
  }

  clearSearchQuery(clearSearchQuery: boolean) {
    this.setState({
      clearSearchQuery,
    });
  }

  updateFocusedIssue(focusedIssue: AnyIssue | null) {
    this.setState({focusedIssue});
  }

  getAnalyticId() {
    return ANALYTICS_ISSUES_PAGE;
  }

  onSearchQueryPanelFocus: (clearSearchQuery?: boolean) => void = (
    clearSearchQuery: boolean = false,
  ) => {
    logEvent({
      message: 'Focus search panel',
      analyticsId: this.getAnalyticId(),
    });
    this.setEditQueryMode(true);
    this.clearSearchQuery(clearSearchQuery);
  };
  onQueryUpdate = (query: string) => {
    logEvent({
      message: 'Apply search',
      analyticsId: this.getAnalyticId(),
    });
    this.setEditQueryMode(false);
    this.props.setIssuesCount(null);
    this.props.onQueryUpdate(query);
  };

  renderSearchQueryAssist: () => React.ReactNode = () => {
    const {suggestIssuesQuery, queryAssistSuggestions} = this.props;
    const _query = this.state.clearSearchQuery ? '' : this.searchQuery;
    return (
      <QueryAssistPanel
        key="QueryAssistPanel"
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
              analyticsId: this.getAnalyticId(),
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

  isFilterSearchMode() {
    return this.props.settings.search.mode === issuesSearchSettingMode.filter;
  }

  renderSearchPanel() {
    return (
      <>
        <View style={styles.searchPanel}>
          {this.state.isEditQuery ? this.renderSearchQueryAssist() : this.renderSearchQueryPreview()}
        </View>
        {this.isFilterSearchMode() && <IssuesFilters/>}
      </>
    );
  }

  hasIssues: () => boolean = (): boolean => this.props.issues?.length > 0;

  toggleSettingsVisibility = (settingsVisible: boolean) => {
    this.setState({settingsVisible});
  };

  renderToolbar() {
    return (
      <View style={styles.toolbar}>
        {this.hasIssues() ? <IssuesCount
            issuesCount={this.props.issuesCount}
            isHelpdesk={this.props.helpDeskMode}
          /> : <View />}
      </View>
    );
  }

  renderSearchQueryPreview() {
    const {isRefreshing} = this.props;
    const isFilterSearchMode: boolean = this.isFilterSearchMode();
    return (
      <QueryPreview
        style={styles.searchQueryPreview}
        editable={!isRefreshing}
        placeholder={isFilterSearchMode ? i18n('Find issues that contain key words') : undefined}
        query={this.searchQuery}
        onSubmit={isFilterSearchMode ? this.props.onQueryUpdate : undefined}
        onFocus={!isFilterSearchMode ? this.onSearchQueryPanelFocus : undefined}
      />
    );
  }

  renderSkeleton() {
    return this.props.settings.view.mode === issuesViewSettingMode.S ? <SkeletonIssuesS/> : <SkeletonIssues/>;
  }

  renderIssuesFooter = () => {
    const {isLoadingMore} = this.props;
    return isLoadingMore ? this.renderSkeleton() : this.renderError();
  };

  renderIssueList(): React.ReactNode {
    const {issues, isRefreshing} = this.props;
    const contextButton = this.renderContextButton();
    const searchPanel: React.ReactNode = <>
      {this.renderSearchPanel()}
      {this.renderToolbar()}
    </>;

    if (isRefreshing && (!issues || issues.length === 0)) {
      return (
        <View style={styles.list}>
          {contextButton}
          {searchPanel}
          {this.renderSkeleton()}
        </View>
      );
    }

    const listData = [
      contextButton,
      searchPanel,
    ].concat((issues || []) as any);
    return (
      <FlatList
        style={styles.list}
        testID="issue-list"
        stickyHeaderIndices={[0]}
        removeClippedSubviews={false}
        data={listData}
        keyExtractor={this.getKey}
        renderItem={this._renderRow as any}
        ItemSeparatorComponent={this._renderSeparator}
        ListEmptyComponent={() => {
          return <Text>{i18n('No issues found')}</Text>;
        }}
        ListFooterComponent={this.renderIssuesFooter as any}
        refreshControl={this._renderRefreshControl()}
        onScroll={params => this.onScroll(params.nativeEvent)}
        onEndReached={this.onEndReached}
        onEndReachedThreshold={0.1}
      />
    );
  }

  renderError(): React.ReactNode {
    const {isRefreshing, loadingError, isInitialized} = this.props;

    if (isRefreshing || !isInitialized) {
      return null;
    }

    const props: ErrorMessageProps = Object.assign(
      {},
      loadingError
        ? {
          error: loadingError,
        }
        : !this.hasIssues()
          ? {
            errorMessageData: {
              ...ERROR_MESSAGE_DATA.NO_ISSUES_FOUND,
              icon: () => (
                <IconNothingFound
                  size={ICON_PICTOGRAM_DEFAULT_SIZE}
                  style={styles.noIssuesFoundIcon}
                />
              ),
            },
          }
          : null,
    ) as ErrorMessageProps;

    if (Object.keys(props).length > 0) {
      return <ErrorMessage testID="issuesLoadingError" {...props} />;
    }

    return null;
  }

  renderIssues: () => React.ReactNode = () => {
    const {isIssuesContextOpen} = this.props;
    return (
      <View style={styles.listContainer} testID="test:id/issueListPhone">
        {isIssuesContextOpen && this.renderContextSelect()}
        {this.renderIssueList()}
        <View style={styles.listActions}>
          {this.renderCreateIssueButton()}
          {this.renderSettingsButton()}
        </View>
      </View>
    );
  };
  renderFocusedIssue: () => React.ReactNode = () => {
    const {focusedIssue} = this.state;

    if (!focusedIssue || !this.hasIssues()) {
      return (
        <NothingSelectedIconWithText
          text={i18n('Select an issue from the list')}
        />
      );
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
  renderSplitView = () => {
    return (
      <>
        <View style={styles.splitViewSide}>{this.renderIssues()}</View>
        <View style={styles.splitViewMain}>{this.renderFocusedIssue()}</View>
      </>
    );
  };

  renderSettings() {
    return this.state.settingsVisible ? (
      <IssuesListSettings
        onQueryUpdate={this.onQueryUpdate}
        toggleVisibility={this.toggleSettingsVisibility}
      />
    ) : null;
  }

  render(): React.ReactNode {
    const {isSplitView} = this.state;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.theme = theme;
          return (
            <View
              style={[
                styles.listContainer,
                isSplitView ? styles.splitViewContainer : null,
              ]}
            >
              {isSplitView && this.renderSplitView()}
              {!isSplitView && this.renderIssues()}
              {this.renderModalPortal()}
              {this.renderSettings()}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

export function doConnectComponent(ReactComponent: React.ComponentType<any>, extraActions?: ReduxExtraActions) {
  return connect(
    (
      state: AppState,
      ownProps: {
        issueId?: string;
        searchQuery?: string;
      }
    ) => {
      return {
        ...state.issueList,
        ...ownProps,
        ...state.app,
      };
    },
    (dispatch: ReduxThunkDispatch) => {
      return {
        ...bindActionCreators(issueActions, dispatch),
        getIssueFromCache: (issueId: string) => dispatch(issueActions.getIssueFromCache(issueId)),
        onQueryUpdate: (query: string) => dispatch(issueActions.onQueryUpdate(query)),
        onOpenContextSelect: () => dispatch(issueActions.openContextSelect()),
        updateSearchContextPinned: (isSearchScrolledUp: boolean) => dispatch(
           actions.IS_SEARCH_CONTEXT_PINNED(isSearchScrolledUp)
        ),
        setIssuesCount: (count: number | null) => dispatch(actions.SET_ISSUES_COUNT(count)),
        updateIssue: (issueId: string) => dispatch(issueActions.updateIssue(issueId)),
        ...(extraActions ? bindActionCreators<ReduxExtraActions, ReduxExtraActions>(extraActions, dispatch) : {}),
      };
    }
  )(ReactComponent);
}


export default doConnectComponent(Issues);
