import React, {Component} from 'react';
import {
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import isEqual from 'react-fast-compare';
import {connect} from 'react-redux';
import {View as AnimatedView} from 'react-native-animatable';

import * as boardActions from './board-actions';
import AgileBoardSprint from './agile-board__sprint';
import Api from 'components/api/api';
import Auth from 'components/auth/oauth2';
import BoardHeader from './board-header';
import BoardScroller from 'components/board-scroller/board-scroller';
import CreateIssue from '../create-issue/create-issue';
import ErrorMessage from 'components/error-message/error-message';
import IssueModal from '../issue/modal/issue.modal';
import log from 'components/log/log';
import ModalPortal from 'components/modal-view/modal-portal';
import QueryAssistPanel from 'components/query-assist/query-assist-panel';
import QueryPreview from 'components/query-assist/query-preview';
import Router from 'components/router/router';
import usage from 'components/usage/usage';
import {addListenerGoOnline} from 'components/network/network-events';
import {ANALYTICS_AGILE_PAGE} from 'components/analytics/analytics-ids';
import {DragContainer} from 'components/draggable';
import {flushStoragePart, getStorageState} from 'components/storage/storage';
import {i18n} from 'components/i18n/i18n';
import {getScrollableWidth} from 'components/board-scroller/board-scroller__math';
import {hasType} from 'components/api/api__resource-types';
import {IconException, IconMagnifyZoom} from 'components/icon/icon';
import {isSplitView} from 'components/responsive/responsive-helper';
import {notify} from 'components/notification/notification';
import {renderSelector} from './agile-board__renderer';
import {routeMap} from 'app-routes';
import {Select, SelectModal} from 'components/select/select';
import {SkeletonAgile} from 'components/skeleton/skeleton';
import {ThemeContext} from 'components/theme/theme-context';
import {HIT_SLOP} from 'components/common-styles';
import {UNIT} from 'components/variables';

import styles from './agile-board.styles';

import type IssuePermissions from 'components/issue-permissions/issue-permissions';
import type {AgilePageState} from './board-reducers';
import type {AnyIssue, IssueOnList} from 'types/Issue';
import type {AppState} from 'reducers';
import type {CustomError} from 'types/Error';
import type {EventSubscription} from 'react-native/Libraries/vendor/emitter/EventEmitter';
import type {
  SprintFull,
  AgileBoardRow,
  BoardColumn,
  BoardOnList,
  Sprint,
} from 'types/Agile';
import type {Theme, UITheme} from 'types/Theme';
import {
  SectionedSelectWithItemActions,
  SectionedSelectWithItemActionsModal,
} from 'components/select/select-sectioned-with-item-and-star';

const CATEGORY_NAME = 'Agile board';

type Props = AgilePageState & {
  auth: Auth;
  api: Api;
  isLoadingMore: boolean;
  sprint: SprintFull | null | undefined;
  isSprintSelectOpen: boolean;
  selectProps: Record<string, any>;
  issuePermissions: IssuePermissions;
  onLoadBoard: (query: string, refresh: boolean) => any;
  onLoadMoreSwimlanes: (query?: string) => any;
  onRowCollapseToggle: (row: AgileBoardRow) => any;
  onColumnCollapseToggle: (column: BoardColumn) => any;
  onOpenSprintSelect: (arg0: any) => any;
  onOpenBoardSelect: (arg0: any) => any;
  onCloseSelect: (arg0: any) => any;
  createCardForCell: (columnId: string, cellId: string) => any;
  onCardDrop: (arg0: any) => any;
  refreshAgile: (agileId: string, sprintId: string, query?: string) => any;
  suggestAgileQuery: (query: string | null | undefined, caret: number) => any;
  storeLastQuery: (query: string) => any;
  updateIssue: (issueId: string, sprint?: SprintFull) => any;
};

type State = {
  zoomedIn: boolean;
  stickElement: {
    agile: boolean;
    boardHeader: boolean;
  };
  offsetY: number;
  showAssist: boolean;
  clearQuery: boolean;
  isSplitView: boolean;
  modalChildren: any;
};

class AgileBoard extends Component<Props, State> {
  boardHeader: BoardHeader | null | undefined;
  query: string;
  unsubscribeOnDispatch: (...args: any[]) => any;
  uiTheme: UITheme;
  unsubscribeOnDimensionsChange: EventSubscription;
  goOnlineSubscription: EventSubscription;

  constructor(props: Props) {
    super(props);
    this.updateZoomedInStorageState(true);
    this.query = getStorageState().agileQuery || '';
    this.state = {
      zoomedIn: true,
      stickElement: {
        agile: false,
        boardHeader: false,
      },
      offsetY: 0,
      showAssist: false,
      clearQuery: false,
      isSplitView: isSplitView(),
      modalChildren: null,
    };
  }

  componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    this.unsubscribeOnDimensionsChange = Dimensions.addEventListener(
      'change',
      this.onDimensionsChange,
    );
    this.loadBoard();
    this.unsubscribeOnDispatch = Router.setOnDispatchCallback(
      (
        routeName: string,
        prevRouteName: string,
        options: Record<string, any>,
      ) => {
        if (
          routeName === routeMap.AgileBoard &&
          prevRouteName === routeMap.Issue &&
          options?.issueId
        ) {
          options.issueId &&
            this.props.updateIssue(options.issueId, this.props?.sprint);
        }
      },
    );
    this.goOnlineSubscription = addListenerGoOnline(() => {
      this.loadBoard(true);
    });
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    const isPropsEqual: boolean = isEqual(this.props, nextProps);
    const isStateEqual: boolean = isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  componentWillUnmount() {
    boardActions.destroySSE();
    this.unsubscribeOnDispatch();
    this.unsubscribeOnDimensionsChange.remove();
    this.goOnlineSubscription.remove();
  }

  onDimensionsChange: () => Promise<void> = async (): Promise<void> => {
    const isLandscape: boolean = await DeviceInfo.isLandscape();
    this.setState({
      isSplitView: isSplitView(),
      zoomedIn: !isLandscape,
    });
  };
  loadBoard = (refresh: boolean = false) => {
    this.props.onLoadBoard(this.query, refresh);
  };
  onVerticalScroll = event => {
    const {nativeEvent} = event;
    const newY = nativeEvent.contentOffset.y;
    const viewHeight = nativeEvent.layoutMeasurement.height;
    const contentHeight = nativeEvent.contentSize.height;
    const maxY = contentHeight - viewHeight;

    if (maxY > 0 && newY > 0 && maxY - newY < 40) {
      this.props.onLoadMoreSwimlanes(this.query);
    }

    this.setState({
      stickElement: {
        agile: newY > UNIT * 2,
        boardHeader: newY > UNIT * (this.isSprintDisabled() ? 2 : 14),
      },
    });
  };
  onContentSizeChange = (width, height) => {
    const windowHeight = Dimensions.get('window').height;

    if (height < windowHeight) {
      this.props.onLoadMoreSwimlanes(this.query);
    }
  };
  syncHeaderPosition = event => {
    const {nativeEvent} = event;

    if (this.boardHeader) {
      this.boardHeader.setNativeProps({
        style: {
          left: -nativeEvent.contentOffset.x,
        },
      });
    }
  };
  _renderRefreshControl = () => {
    return (
      <RefreshControl
        testID="refresh-control"
        accessibilityLabel="refresh-control"
        accessible={true}
        refreshing={false}
        tintColor={styles.link.color}
        onRefresh={() => this.loadBoard(true)}
      />
    );
  };

  toggleModalChildren(modalChildren: any = null) {
    this.setState({
      modalChildren,
    });
  }

  clearModalChildren = () => this.toggleModalChildren(null);
  _onTapIssue = (issue: IssueOnList) => {
    log.debug(`Opening issue "${issue.id}" from Agile Board`);
    usage.trackEvent(CATEGORY_NAME, 'Open issue');

    if (this.state.isSplitView) {
      this.toggleModalChildren(
        <IssueModal
          issuePlaceholder={issue}
          issueId={issue.id}
          onHide={this.clearModalChildren}
          stacked={true}
          onCommandApply={() => {
            this.loadBoard(true);
          }}
        />,
      );
    } else {
      Router.Issue({
        issuePlaceholder: issue,
        issueId: issue.id,
      });
    }
  };
  _getScrollableWidth = (): number | null => {
    const {sprint} = this.props;

    if (!sprint || !sprint.board || !sprint.board.columns) {
      return null;
    }

    return getScrollableWidth(
      sprint.board.columns,
      this.state.isSplitView && this.state.zoomedIn,
    );
  };

  renderAgileSelector() {
    const {agile, onOpenBoardSelect, sprint, networkState} = this.props;
    const agileName: string = agile?.name || sprint?.agile?.name;
    const agileId: string = agile?.id || sprint?.agile?.id;

    if (agileName && agileId) {
      return renderSelector({
        key: agileId,
        label: agileName,
        onPress: onOpenBoardSelect,
        isDisabled: networkState?.isConnected === false,
        style: styles.agileSelector,
        textStyle: styles.agileSelectorText,
        showBottomBorder: this.state.stickElement.agile,
        showLoader: true,
        uiTheme: this.uiTheme,
      });
    }

    return <View style={styles.agileSelector} />;
  }

  isSprintDisabled(): boolean {
    const {agile} = this.props;
    return agile?.sprintsSettings?.disableSprints === true;
  }

  renderSprintSelector() {
    const {
      agile,
      sprint,
      onOpenSprintSelect,
      isLoading,
      networkState,
    } = this.props;

    if (!agile || !sprint) {
      return null;
    }

    if (this.isSprintDisabled()) {
      return null;
    }

    if (sprint) {
      return renderSelector({
        key: sprint.id,
        label: sprint.name,
        onPress: onOpenSprintSelect,
        style: styles.sprintSelector,
        isDisabled: isLoading || networkState?.isConnected === false,
        uiTheme: this.uiTheme,
      });
    }
  }

  renderZoomButton() {
    const {isLoading, isLoadingAgile, sprint} = this.props;
    const {zoomedIn, stickElement} = this.state;

    if (!stickElement.boardHeader && !isLoading && !isLoadingAgile && sprint) {
      return (
        <AnimatedView
          useNativeDriver
          duration={3000}
          animation="tada"
          style={styles.zoomButton}
        >
          <TouchableOpacity
            testID="magnifier-button"
            accessibilityLabel="magnifier-button"
            accessible={true}
            hitSlop={HIT_SLOP}
            onPress={this.toggleZoom}
          >
            <IconMagnifyZoom
              zoomedIn={zoomedIn}
              size={24}
              color={styles.link.color}
            />
          </TouchableOpacity>
        </AnimatedView>
      );
    }

    return null;
  }

  boardHeaderRef = (instance: BoardHeader | null | undefined) => {
    if (instance) {
      this.boardHeader = instance;
    }
  };
  toggleColumn = (column: BoardColumn) => {
    notify(
      column.collapsed ? i18n('Column expanded') : i18n('Column collapsed'),
    );
    this.props.onColumnCollapseToggle(column);
  };

  renderBoardHeader() {
    const {zoomedIn} = this.state;
    return (
      <View style={styles.boardHeaderContainer}>
        {!!this.props.sprint && (
          <BoardHeader
            ref={this.boardHeaderRef}
            style={{
              minWidth: zoomedIn ? this._getScrollableWidth() : null,
            }}
            columns={this.props.sprint.board?.columns}
            onCollapseToggle={this.toggleColumn}
          />
        )}
      </View>
    );
  }

  updateQuery = (query: string | null | undefined) => {
    this.query = query || '';
  };

  _renderSelect() {
    const {selectProps} = this.props;
    const SelectComponent: any = (
      this.state.isSplitView
        ? selectProps.agileSelector ? SectionedSelectWithItemActionsModal : SelectModal
        : selectProps.agileSelector ? SectionedSelectWithItemActions : Select
    );
    return (
      <SelectComponent
        getTitle={(item: BoardOnList | Sprint) => item.name}
        onCancel={this.props.onCloseSelect}
        {...selectProps}
        onSelect={(selected: BoardOnList | Sprint) => {
          if (hasType.agile(selected)) {
            this.updateQuery(null);
          }

          return selectProps.onSelect(selected, this.query);
        }}
      />
    );
  }

  getAgileError(): string | null {
    const errors: string[] = this.props.agile?.status?.errors || [];
    return errors.length > 0 ? errors.join('\n') : null;
  }

  renderErrors() {
    const error: CustomError | null | undefined = this.props.error;
    const agileErrors: string | null = this.getAgileError();

    if (error) {
      return <ErrorMessage style={styles.error} error={error} />;
    }

    if (agileErrors) {
      const boardName: string = this.props.agile?.name || '';
      return (
        <ErrorMessage
          style={styles.error}
          errorMessageData={{
            title: i18n('The board {{boardName}} has configuration errors', {
              boardName,
            }),
            description: agileErrors,
            icon: IconException,
            iconSize: 56,
          }}
        />
      );
    }
  }

  canRunCommand = (issue: AnyIssue): boolean => {
    return this.props.issuePermissions.canRunCommand(issue);
  };
  renderSprint = () => {
    const {
      sprint,
      createCardForCell,
      onRowCollapseToggle,
      agile,
      networkState,
    } = this.props;
    return (
      <AgileBoardSprint
        testID="agileBoardSprint"
        sprint={{
          ...sprint,
          agile: sprint?.agile
            ? {
                ...sprint?.agile,
                hideOrphansSwimlane: agile?.hideOrphansSwimlane,
              }
            : agile,
        }}
        zoomedIn={this.state.zoomedIn}
        canRunCommand={this.canRunCommand}
        onTapIssue={this._onTapIssue}
        onTapCreateIssue={
          networkState?.isConnected === false
            ? null
            : async (cellColumnId: string, cellId: string): Promise<void> => {
                const draft: Partial<IssueOnList> | null = await createCardForCell(cellColumnId, cellId);
                if (draft?.id) {
                  if (this.state.isSplitView) {
                    this.toggleModalChildren(
                      <CreateIssue
                        isSplitView={this.state.isSplitView}
                        onHide={this.clearModalChildren}
                        predefinedDraftId={draft.id}
                      />,
                    );
                  } else {
                    Router.CreateIssue({
                      predefinedDraftId: draft.id,
                    });
                  }
                }
              }
        }
        onCollapseToggle={onRowCollapseToggle}
        uiTheme={this.uiTheme}
      />
    );
  };

  onDragStart() {
    usage.trackEvent(CATEGORY_NAME, 'Card drag start');
  }

  onDragEnd = (
    draggingComponent: Record<string, any>,
    hitZones: Array<Record<string, any>>,
  ) => {
    const movedId = draggingComponent.data;
    const dropZone = hitZones[0];

    if (!dropZone) {
      return;
    }

    this.props.onCardDrop({
      columnId: dropZone.data.columnId,
      cellId: dropZone.data.cellId,
      leadingId: dropZone.data.issueIds.filter(id => id !== movedId)[
        dropZone.placeholderIndex - 1
      ],
      movedId,
    });
  };

  updateZoomedInStorageState(agileZoomedIn: boolean) {
    flushStoragePart({
      agileZoomedIn,
    });
  }

  toggleZoom = () => {
    const zoomedIn: boolean = !this.state.zoomedIn;
    this.setState({
      zoomedIn,
    });
    this.updateZoomedInStorageState(zoomedIn);
    usage.trackEvent(
      ANALYTICS_AGILE_PAGE,
      `Toggle zoom-in: ${zoomedIn.toString()}`,
    );
  };
  toggleQueryAssist = (isAssistVisible: boolean = false) => {
    this.setState({
      showAssist: isAssistVisible,
    });
  };
  onQueryApply = (query: string) => {
    const {refreshAgile, sprint, storeLastQuery} = this.props;
    usage.trackEvent(ANALYTICS_AGILE_PAGE, 'Apply search');
    this.updateQuery(query);
    storeLastQuery(query);

    if (sprint && sprint.agile) {
      refreshAgile(sprint.agile.id, sprint.id, query);
    }

    this.toggleQueryAssist(false);
  };
  onShowAssist = async (clearQuery: boolean = false) => {
    const {networkState} = this.props;

    if (networkState?.isConnected !== false) {
      if (clearQuery) {
        this.query = '';
      }

      this.setState({
        clearQuery,
      });
      this.toggleQueryAssist(true);
    }
  };
  renderSearchPanel = () => {
    const {suggestAgileQuery, queryAssistSuggestions} = this.props;
    return (
      <QueryAssistPanel
        queryAssistSuggestions={queryAssistSuggestions}
        query={this.query}
        suggestIssuesQuery={suggestAgileQuery}
        onQueryUpdate={this.onQueryApply}
        onClose={(q: string) => {
          if (this.state.clearQuery) {
            usage.trackEvent(ANALYTICS_AGILE_PAGE, 'Clear query');
            this.onQueryApply(q);
          } else {
            this.toggleQueryAssist(false);
          }
        }}
        clearButtonMode="always"
      />
    );
  };
  renderSearchPanelPreview = () => {
    return (
      <View>
        <QueryPreview
          style={styles.searchQueryPreview}
          query={this.query}
          onFocus={this.onShowAssist}
        />
      </View>
    );
  };

  renderBoard() {
    const {sprint, isLoadingMore, error, agile} = this.props;
    const {zoomedIn} = this.state;

    const renderAgileSelector = () => (
      <View style={styles.agileNoSprint}>{this.renderAgileSelector()}</View>
    );

    if (agile?.status?.errors?.length || error) {
      return renderAgileSelector();
    }

    if (!sprint) {
      if (error && error.noAgiles) {
        return null;
      }

      return (
        <View>
          {renderAgileSelector()}
          <SkeletonAgile />
        </View>
      );
    }

    return (
      <DragContainer onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        <BoardScroller
          columns={sprint?.board?.columns}
          snap={zoomedIn}
          refreshControl={this._renderRefreshControl()}
          horizontalScrollProps={{
            contentContainerStyle: {
              display: 'flex',
              flexDirection: 'column',
              width: zoomedIn ? this._getScrollableWidth() : '100%',
            },
            onScroll: this.syncHeaderPosition,
          }}
          verticalScrollProps={{
            onScroll: this.onVerticalScroll,
            onContentSizeChange: this.onContentSizeChange,
            contentContainerStyle: {
              minHeight: '100%',
            },
          }}
          agileSelector={this.renderAgileSelector()}
          sprintSelector={this.renderSprintSelector()}
          boardHeader={this.renderBoardHeader()}
          boardSearch={this.renderSearchPanelPreview()}
        >
          {this.renderSprint()}
          {isLoadingMore && (
            <ActivityIndicator
              color={styles.link.color}
              style={styles.loadingMoreIndicator}
            />
          )}
        </BoardScroller>
      </DragContainer>
    );
  }

  render() {
    const {isSprintSelectOpen} = this.props;
    const {isSplitView, modalChildren, showAssist} = this.state;
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          this.uiTheme = theme.uiTheme;
          return (
            <View testID="pageAgile" style={styles.agile}>
              {this.renderZoomButton()}

              {this.renderBoard()}

              {this.renderErrors()}

              {isSprintSelectOpen && this._renderSelect()}

              {showAssist && this.renderSearchPanel()}

              {isSplitView && (
                <ModalPortal onHide={this.clearModalChildren}>
                  {modalChildren}
                </ModalPortal>
              )}
            </View>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}

const mapStateToProps = (state: AppState) => {
  return {...state.agile, ...state.app};
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadBoard: (query: string, refresh: boolean) =>
      dispatch(boardActions.loadDefaultAgileBoard(query, refresh)),
    onLoadMoreSwimlanes: (query?: string) =>
      dispatch(boardActions.fetchMoreSwimlanes(query)),
    onRowCollapseToggle: row => dispatch(boardActions.rowCollapseToggle(row)),
    onColumnCollapseToggle: (column: BoardColumn) =>
      dispatch(boardActions.columnCollapseToggle(column)),
    onOpenSprintSelect: () => dispatch(boardActions.openSprintSelect()),
    onOpenBoardSelect: () => dispatch(boardActions.openBoardSelect()),
    onCloseSelect: () => dispatch(boardActions.closeSelect()),
    createCardForCell: (cellColumnId: string, cellId: string) => {
      dispatch(boardActions.createCardForCell(cellColumnId, cellId));
    },
    onCardDrop: (...args) => dispatch(boardActions.onCardDrop(...args)),
    refreshAgile: (agileId: string, sprintId: string, query: string = '') =>
      dispatch(boardActions.refreshAgile(agileId, sprintId, query)),
    suggestAgileQuery: (query: string, caret: number) =>
      dispatch(boardActions.suggestAgileQuery(query, caret)),
    storeLastQuery: (query: string) =>
      dispatch(boardActions.storeLastQuery(query)),
    updateIssue: (issueId: string, sprint?: SprintFull) =>
      dispatch(boardActions.updateIssue(issueId, sprint)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AgileBoard);
