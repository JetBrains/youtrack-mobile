import {
  Dimensions,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';

import React, {Component} from 'react';
import {bindActionCreators, Dispatch} from 'redux';
import {connect} from 'react-redux';

import * as issueActions from './issues-actions';
import CreateIssue from 'views/create-issue/create-issue';
import BottomSheetModal from 'components/modal-panel-bottom/bottom-sheet-modal';
import ErrorMessage from 'components/error-message/error-message';
import Issue from 'views/issue/issue';
import IssueRow from './issues__row';
import IssuesCount from './issues__count';
import IssuesSortBy from './issues__sortby';
import log from 'components/log/log';
import ModalPortal from 'components/modal-view/modal-portal';
import NothingSelectedIconWithText from 'components/icon/nothing-selected-icon-with-text';
import QueryAssistPanel from 'components/query-assist/query-assist-panel';
import QueryPreview from 'components/query-assist/query-preview';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {addListenerGoOnline} from 'components/network/network-events';
import {ANALYTICS_ISSUES_PAGE} from 'components/analytics/analytics-ids';
import {DEFAULT_THEME} from 'components/theme/theme';
import {ERROR_MESSAGE_DATA} from 'components/error/error-message-data';
import {getIssueFromCache} from './issues-actions';
import {HIT_SLOP} from 'components/common-styles';
import {i18n} from 'components/i18n/i18n';
import {IconAdd, IconAngleDown, IconCheck, IconSettings} from 'components/icon/icon';
import {
  ICON_PICTOGRAM_DEFAULT_SIZE,
  IconNothingFound,
} from 'components/icon/icon-pictogram';
import {initialState} from './issues-reducers';
import {isReactElement} from 'util/util';
import {isSplitView} from 'components/responsive/responsive-helper';
import {
  issuesViewSetting,
  issuesSettingsIssueSizes,
  IssueSetting,
  issuesSettingsSearch,
  issuesSearchSetting,
} from 'views/issues/index';
import {logEvent} from 'components/log/log-helper';
import {notify} from 'components/notification/notification';
import {requestController} from 'components/api/api__request-controller';
import {routeMap} from 'app-routes';
import {SkeletonIssues, SkeletonIssuesS} from 'components/skeleton/skeleton';
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
import type {Folder} from 'types/User';
import type {IssuesState} from './issues-reducers';
import type {Theme, UIThemeColors} from 'types/Theme';
import {NetInfoState} from '@react-native-community/netinfo';

type IssuesActions = typeof issueActions;

type Props = IssuesState &
  IssuesActions & {
    auth: Auth;
    api: Api;
    onOpenContextSelect: () => any;
    issueId?: string;
    searchQuery?: string;
    networkState: NetInfoState,
    isInProgress: boolean,
  };

type State = {
  isEditQuery: boolean;
  clearSearchQuery: boolean;
  focusedIssue: AnyIssue | null | undefined;
  isSplitView: boolean;
  isCreateModalVisible: boolean;
  settingsVisible: boolean;
};


export class Issues extends Component<Props, State> {
  searchPanelNode: QueryAssistPanel | undefined;
  unsubscribeOnDispatch: ((...args: any[]) => any) | undefined;
  unsubscribeOnDimensionsChange: EventSubscription | undefined;
  theme: Theme = {uiTheme: DEFAULT_THEME, mode: DEFAULT_THEME.mode, setMode: () => {}};
  goOnlineSubscription: EventSubscription | undefined;

  constructor(props: Props) {
    super(props);
    this.state = {
      isEditQuery: false,
      clearSearchQuery: false,
      focusedIssue: null,
      isSplitView: false,
      isCreateModalVisible: false,
      settingsVisible: false,
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
      const targetIssue: AnyIssue =
        getIssueFromCache(issueId) ||
        ({
          id: issueId,
        } as any);
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

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
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
  renderCreateIssueButton: (isDisabled: boolean)=> React.ReactNode = (
    isDisabled: boolean,
  ) => {
    return (
      <TouchableOpacity
        hitSlop={HIT_SLOP}
        testID="test:id/create-issue-button"
        accessibilityLabel="create-issue-button"
        accessible={true}
        style={styles.createIssueButton}
        onPress={() => {
          if (this.state.isSplitView) {
            this.setState({
              isCreateModalVisible: true,
            });
          } else {
            Router.CreateIssue({
              onHide: () => Router.pop(true),
              isMatchesQuery: this.isMatchesQuery,
            });
          }
        }}
        disabled={isDisabled}
      >
        <IconAdd
          size={22}
          color={
            isDisabled
              ? this.getThemeColors().$disabled
              : this.getThemeColors().$link
          }
        />
      </TouchableOpacity>
    );
  };

  _renderRow = ({item}: {item: IssueOnList}) => {
    const {focusedIssue} = this.state;

    if (isReactElement(item)) {
      return item;
    }

    return (
      <View
        style={[
          focusedIssue?.id === item.id || item.idReadable && focusedIssue?.id === item.idReadable
            ? styles.splitViewMainFocused
            : null,
        ]}
      >
        <IssueRow
          settings={this.props.settings}
          issue={item}
          onClick={issue => {
            if (this.state.isSplitView) {
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
  getKey: (item: any) => string = (item: Record<string, any>) => {
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

    return <View style={styles.separator} />;
  };
  onEndReached: () => void = () => {
    this.props.loadMoreIssues();
  };

  getThemeColors(): UIThemeColors {
    return this.theme.uiTheme.colors;
  }

  renderContextButton: ()=> React.ReactNode = () => {
    const {
      onOpenContextSelect,
      isRefreshing,
      searchContext,
      isSearchContextPinned,
      networkState,
    } = this.props;
    const isDisabled: boolean =
      isRefreshing || !searchContext || !networkState?.isConnected;
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
        onPress={onOpenContextSelect}
      >
        <View style={styles.searchContextButton}>
          <Text numberOfLines={1} style={styles.contextButtonText}>
            {`${searchContext?.name || ''}`}
          </Text>
          {searchContext && (
            <IconAngleDown
              style={styles.contextButtonIcon}
              color={
                isDisabled
                  ? this.getThemeColors().$disabled
                  : this.getThemeColors().$text
              }
              size={19}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  renderContextSelect(): any {
    const {selectProps} = this.props;
    const {onSelect, ...restProps} = selectProps;
    const SelectComponent = (
      isSplitView() ? SectionedSelectWithItemActionsModal : SectionedSelectWithItemActions
    );
    return (
      <SelectComponent
        {...restProps}
        getTitle={item => item.name + (item.shortName ? ` (${item.shortName})` : '')}
        onSelect={async (selectedContext: Folder) => {
          this.updateFocusedIssue(null);
          onSelect?.(selectedContext);
        }}
      />
    );
  }

  searchPanelRef: (instance: QueryAssistPanel | undefined) => void = (
    instance: QueryAssistPanel | undefined,
  ) => {
    if (instance) {
      this.searchPanelNode = instance;
    }
  };
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

  updateFocusedIssue(focusedIssue: AnyIssue | null | undefined) {
    this.setState({
      focusedIssue,
    });
  }

  onSearchQueryPanelFocus: (clearSearchQuery?: boolean) => void = (
    clearSearchQuery: boolean = false,
  ) => {
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
  renderSearchPanel: ()=> React.ReactNode = () => {
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

  toggleSettingsVisibility(settingsVisible: boolean) {
    this.setState({settingsVisible});
  }
  renderSearchQuery: () => React.ReactNode = () => {
    const {
      query,
      issuesCount,
    } = this.props;
    return (
      <View style={styles.listHeader}>
        <View style={styles.listHeaderTop}>
          <QueryPreview
            style={styles.searchPanel}
            query={query}
            onFocus={this.onSearchQueryPanelFocus}
          />
        </View>

        <View style={styles.toolbar}>
          {this.hasIssues() ? <IssuesCount issuesCount={issuesCount}/> : <View/>}
          <TouchableOpacity
            style={[
              styles.rowLine,
              this.props.isInProgress && styles.toolbarItemDisabled,
            ]}
            disabled={this.props.isInProgress}
            onPress={() => {
              this.toggleSettingsVisibility(true);
            }}
          >
            <Text style={styles.toolbarText}>{i18n('Settings')}</Text>
            <IconSettings
              style={styles.toolbarIcon}
              size={13}
              color={styles.toolbarIcon.color}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  renderSkeleton(){
    return this.props.settings.view.mode === issuesViewSetting.S ? <SkeletonIssuesS/> : <SkeletonIssues/>;
  }

  renderIssuesFooter = () => {
    const {isLoadingMore} = this.props;
    return isLoadingMore ? this.renderSkeleton() : this.renderError();
  };

  renderIssueList(): React.ReactNode {
    const {issues, isRefreshing} = this.props;
    const contextButton = this.renderContextButton();
    const searchQuery = this.renderSearchQuery();

    if (isRefreshing && (!issues || issues.length === 0)) {
      return (
        <View style={styles.list}>
          {contextButton}
          {searchQuery}
          {this.renderSkeleton()}
        </View>
      );
    }

    const listData = [
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
        onScroll={params => this.onScroll(params.nativeEvent)}
        tintColor={this.theme.uiTheme.colors.$link}
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

  renderIssues: ()=> React.ReactNode = () => {
    const {isIssuesContextOpen, isRefreshing} = this.props;
    return (
      <View style={styles.listContainer} testID="test:id/issueListPhone">
        {isIssuesContextOpen && this.renderContextSelect()}
        {this.state.isEditQuery && this.renderSearchPanel()}

        {this.renderIssueList()}

        {this.renderCreateIssueButton(isRefreshing)}
      </View>
    );
  };
  renderFocusedIssue: ()=> React.ReactNode = () => {
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
  renderSplitView: ()=> React.ReactNode = () => {
    return (
      <>
        <View style={styles.splitViewSide}>{this.renderIssues()}</View>
        <View style={styles.splitViewMain}>{this.renderFocusedIssue()}</View>
      </>
    );
  };

  renderSettings(): React.JSX.Element {
    const {
      query,
      searchContext,
      onViewModeChange,
      settings,
    } = this.props;
    return (
      <BottomSheetModal
        style={styles.settingsModal}
        withHandle={true}
        height={Dimensions.get('window').height - 100}
        snapPoint={450}
        isVisible={this.state.settingsVisible}
        onClose={() => this.toggleSettingsVisibility(false)}
      >
        <>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemTitle}>{i18n('Search Settings')}</Text>
            {issuesSettingsSearch.map((it: IssueSetting) => {
              return (
                <TouchableOpacity
                  disabled={it.mode === issuesSearchSetting.filter}
                  style={styles.settingsRow}
                  onPress={() => {
                    this.toggleSettingsVisibility(false);
                  }}
                >
                  <Text style={[
                    styles.settingsItemText,
                    it.mode === issuesSearchSetting.filter && styles.toolbarItemDisabled,
                  ]}>{it.label}</Text>
                  {it.mode === settings.search.mode && <IconCheck
                    size={20}
                    color={styles.link.color}
                  />}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.settingsSeparator}/>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemTitle}>{i18n('List Settings')}</Text>
            <IssuesSortBy
              onOpen={() => this.toggleSettingsVisibility(false)}
              context={searchContext}
              onApply={(q: string) => this.onQueryUpdate(q)}
              query={query}
            />
          </View>
          <View style={styles.settingsItem}>
            <Text style={styles.settingsItemTitle}>{i18n('Issue size')}</Text>
            {issuesSettingsIssueSizes.map((it: IssueSetting) => {
              const isActive: boolean = it.mode === settings.view.mode;
              return (
                <TouchableOpacity
                  disabled={isActive}
                  style={styles.settingsRow}
                  onPress={() => {
                    onViewModeChange(it.mode);
                    this.toggleSettingsVisibility(false);
                  }}
                >
                  <Text
                    style={styles.settingsItemText}>
                    {`${it.label} `}
                  </Text>
                  {isActive && <IconCheck
                    size={20}
                    color={styles.link.color}
                  />}
                </TouchableOpacity>
              );
            })
            }
          </View>
        </>
      </BottomSheetModal>
    );
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
              testID="issue-list-page"
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

const mapStateToProps = (
  state: AppState,
  ownProps: {
    issueId?: string;
    searchQuery?: string;
  },
) => {
  return {
    ...state.issueList,
    ...ownProps,
    ...state.app,
    searchContext: state.issueList.searchContext,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    ...bindActionCreators(issueActions, dispatch),
    onQueryUpdate: (query: string) => dispatch(issueActions.onQueryUpdate(query)),
    onOpenContextSelect: () => dispatch(issueActions.openContextSelect()),
    updateSearchContextPinned: isSearchScrolledUp => dispatch(
      issueActions.updateSearchContextPinned(isSearchScrolledUp)
    ),
    setIssuesCount: (count: number | null) => dispatch(issueActions.setIssuesCount(count)),
    updateIssue: (issueId: string) => dispatch(issueActions.updateIssue(issueId)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Issues);
