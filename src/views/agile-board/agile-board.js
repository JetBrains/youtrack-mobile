/* @flow */
import {View, Text, Image, RefreshControl, Modal, TouchableOpacity, ActivityIndicator, Dimensions} from 'react-native';
import React, {Component} from 'react';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import Select from '../../components/select/select';
import styles from './agile-board.styles';
import Menu from '../../components/menu/menu';
import log from '../../components/log/log';
import BoardHeader from './board-header';
import BoardRow from '../../components/agile-row/agile-row';
import AgileCard from '../../components/agile-card/agile-card';
import BoardScroller, {COLUMN_SCREEN_PART} from '../../components/board-scroller/board-scroller';
import Router from '../../components/router/router';
import Auth from '../../components/auth/auth';
import {Draggable, DragContainer} from '../../components/draggable/';
import Api from '../../components/api/api';
import {COLOR_PINK, AGILE_COLLAPSED_COLUMN_WIDTH} from '../../components/variables/variables';
import {zoomIn, zoomOut, arrowDownGray} from '../../components/icon/icon';
import {getStorageState, flushStoragePart} from '../../components/storage/storage';
import type {SprintFull, Board, AgileBoardRow, AgileColumn} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';
import type {AgilePageState} from './board-reducers';

import * as boardActions from './board-actions';
import {openMenu} from '../../actions/app-actions';
import {connect} from 'react-redux';
import type IssuePermissions from '../../components/issue-permissions/issue-permissions';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

const CATEGORY_NAME = 'Agile board';

type Props = AgilePageState & {
  auth: Auth,
  api: Api,
  isLoading: boolean,
  isLoadingMore: boolean,
  noMoreSwimlanes: boolean,
  noBoardSelected: boolean,
  sprint: ?SprintFull,
  isSprintSelectOpen: boolean,
  selectProps: Object,
  issuePermissions: IssuePermissions,
  onLoadBoard: () => any,
  onLoadMoreSwimlanes: () => any,
  onRowCollapseToggle: (row: AgileBoardRow) => any,
  onColumnCollapseToggle: (column: AgileColumn) => any,
  onOpenSprintSelect: (any) => any,
  onOpenBoardSelect: (any) => any,
  onCloseSelect: (any) => any,
  createCardForCell: (columnId: string, cellId: string) => any,
  onOpenMenu: (any) => any,
  onCardDrop: (any) => any
};

type State = {
  zoomedIn: boolean
};

class AgileBoard extends Component<Props, State> {
  boardHeader: ?BoardHeader;

  constructor(props: Props) {
    super(props);
    this.state = {
      zoomedIn: getStorageState().agileZoomedIn ?? true
    };
  }

  componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    this.props.onLoadBoard();
  }

  onVerticalScroll = (event) => {
    const {nativeEvent} = event;
    const viewHeight = nativeEvent.layoutMeasurement.height;
    const scroll = nativeEvent.contentOffset.y;
    const contentHeight = nativeEvent.contentSize.height;
    const maxScroll = contentHeight - viewHeight;

    if (maxScroll > 0 && scroll > 0 && (maxScroll - scroll) < 40) {
      this.props.onLoadMoreSwimlanes();
    }
  };

  onContentSizeChange = (width, height) => {
    const windowHeight = Dimensions.get('window').height;
    if (height < windowHeight) {
      this.props.onLoadMoreSwimlanes();
    }
  };

  syncHeaderPosition = (event) => {
    const {nativeEvent} = event;
    if (this.boardHeader) {
      this.boardHeader.setNativeProps({
        style: {left: -nativeEvent.contentOffset.x}
      });
    }
  };

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isLoading}
      tintColor={COLOR_PINK}
      onRefresh={() => this.props.onLoadBoard()}
    />;
  }

  _onTapIssue = (issue: IssueOnList) => {
    log.debug(`Opening issue "${issue.id}" from Agile Board`);
    usage.trackEvent(CATEGORY_NAME, 'Open issue');
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  };

  _getScrollableWidth = (): number | null => {
    const {sprint} = this.props;

    if (!sprint || !sprint.board || !sprint.board.columns) { //YTM-835
      return null;
    }

    const COLUMN_WIDTH = Dimensions.get('window').width * COLUMN_SCREEN_PART;
    return sprint.board.columns
      .map(col => col.collapsed ? AGILE_COLLAPSED_COLUMN_WIDTH : COLUMN_WIDTH)
      .reduce((res, item) => res + item, 0);
  };

  renderHeaderButton(text: ?string, onPress: () => any, buttonStyle: ViewStyleProp = null) {
    if (text) {
      const {isLoading} = this.props;
      return (
        <TouchableOpacity
          style={[styles.headerBoardButton, buttonStyle]}
          disabled={isLoading}
          onPress={onPress}
        >
          <Text
            style={[styles.headerText, isLoading ? styles.headerTextDisabled : null]}
            numberOfLines={1}
          >
            {text}
          </Text>
          <Image source={arrowDownGray} style={[
            styles.headerSelectIcon,
            isLoading ? styles.headerIconDisabled : null
          ]}/>
        </TouchableOpacity>
      );
    }
  }

  _renderHeader() {
    const {sprint, onOpenSprintSelect, onOpenBoardSelect} = this.props;

    return (
      <Header
        leftButton={<Text>Menu</Text>}
        onBack={this.props.onOpenMenu}
      >
        {Boolean(sprint) && <View style={styles.headerContent}>
          {this.renderHeaderButton(
            sprint?.agile?.name,
            onOpenBoardSelect
          )}
          {this.renderHeaderButton(
            sprint?.name,
            onOpenSprintSelect,
            styles.headerBoardNotCollapsibleButton
          )}

        </View>}
      </Header>
    );
  }

  boardHeaderRef = (instance: ?BoardHeader) => {
    if (instance) {
      this.boardHeader = instance;
    }
  };

  _renderBoardHeader(sprint: SprintFull) {
    const {zoomedIn} = this.state;
    return (
      <View style={styles.boardHeaderContainer}>
        <BoardHeader
          ref={this.boardHeaderRef}
          style={{minWidth: zoomedIn ? this._getScrollableWidth() : null}}
          columns={sprint?.board?.columns}
          onCollapseToggle={this.props.onColumnCollapseToggle}
        />
      </View>
    );
  }

  _renderSelect() {
    const {selectProps} = this.props;
    return (
      <Modal
        visible
        animationType="fade"
        onRequestClose={() => true}
      >
        <Select
          getTitle={item => item.name}
          onCancel={this.props.onCloseSelect}
          style={styles.selectModal}
          {...selectProps}
        />
      </Modal>
    );
  }

  _renderNoSprint() {
    return (
      <View style={styles.agileBoardMessage}>
        <Text style={styles.agileBoardSmile}>(・_・)</Text>
        <Text style={styles.agileBoardMessageText}>No agile board selected</Text>
        <TouchableOpacity onPress={this.props.onOpenBoardSelect}>
          <Text style={styles.selectBoardMessage} numberOfLines={1}>Select board</Text>
        </TouchableOpacity>
      </View>
    );
  }

  _renderBoard(sprint: SprintFull) {
    const board: Board = sprint.board;

    const commonRowProps = {
      collapsedColumnIds: board.columns.filter(col => col.collapsed).map(col => col.id),
      onTapIssue: this._onTapIssue,
      onTapCreateIssue: this.props.createCardForCell,
      onCollapseToggle: this.props.onRowCollapseToggle,
      renderIssueCard: (issue: IssueOnList) => {
        const canDrag = sprint.agile.isUpdatable || this.props.issuePermissions.canRunCommand(issue);
        return (
          <Draggable key={issue.id} data={issue.id} onPress={() => this._onTapIssue(issue)} disabled={!canDrag}>
            <AgileCard issue={issue} style={styles.card} estimationField={sprint.agile.estimationField}/>
          </Draggable>
        );
      }
    };

    const orphan = <BoardRow key="orphan" row={board.orphanRow} {...commonRowProps}/>;

    return [
      sprint.agile.orphansAtTheTop && orphan,

      board.trimmedSwimlanes.map(swimlane => {
        return (
          <BoardRow
            key={swimlane.id}
            row={swimlane}
            {...commonRowProps}
          />
        );
      }),

      !sprint.agile.orphansAtTheTop && orphan,
    ];
  }

  onDragStart() {
    usage.trackEvent(CATEGORY_NAME, 'Card drag start');
  }

  onDragEnd = (draggingComponent: Object, hitZones: Array<Object>) => {
    const movedId = draggingComponent.data;
    const dropZone = hitZones[0];
    if (!dropZone) {
      return;
    }

    this.props.onCardDrop({
      columnId: dropZone.data.columnId,
      cellId: dropZone.data.cellId,
      leadingId: dropZone.data.issueIds
        .filter(id => id !== movedId)[dropZone.placeholderIndex - 1],
      movedId
    });
  };

  toggleZoom = () => {
    const zoomedIn = !this.state.zoomedIn;
    this.setState({zoomedIn});
    flushStoragePart({agileZoomedIn: zoomedIn});
  };

  render() {
    const {sprint, isLoadingMore, isSprintSelectOpen, noBoardSelected} = this.props;

    const {zoomedIn} = this.state;

    return (
      <Menu>
        <View
          testID='pageAgile'
          style={styles.container}>
          {this._renderHeader()}

          {sprint && this._renderBoardHeader(sprint)}
          {noBoardSelected && this._renderNoSprint()}

          <DragContainer onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
            <BoardScroller
              columns={sprint?.board?.columns}
              snap={zoomedIn}
              refreshControl={this._renderRefreshControl()}
              horizontalScrollProps={{
                contentContainerStyle: {
                  display: 'flex',
                  flexDirection: 'column',
                  width: zoomedIn ? this._getScrollableWidth() : '100%'
                },
                onScroll: this.syncHeaderPosition
              }}
              verticalScrollProps={{
                onScroll: this.onVerticalScroll,
                onContentSizeChange: this.onContentSizeChange,
                contentContainerStyle: {
                  minHeight: '100%'
                }
              }}
            >
              {sprint && this._renderBoard(sprint)}
              {isLoadingMore && <ActivityIndicator color={COLOR_PINK} style={styles.loadingMoreIndicator}/>}
            </BoardScroller>
          </DragContainer>

          <View style={styles.zoomButtonContainer}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={this.toggleZoom}>
              <Image source={zoomedIn ? zoomOut : zoomIn} style={styles.zoomButtonIcon}/>
            </TouchableOpacity>
          </View>

          {isSprintSelectOpen && this._renderSelect()}
        </View>
      </Menu>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  return {
    ...state.agile,
    ...state.app
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadBoard: () => dispatch(boardActions.fetchDefaultAgileBoard()),
    onLoadMoreSwimlanes: () => dispatch(boardActions.fetchMoreSwimlanes()),
    onRowCollapseToggle: (row) => dispatch(boardActions.rowCollapseToggle(row)),
    onColumnCollapseToggle: (column) => dispatch(boardActions.columnCollapseToggle(column)),
    onOpenSprintSelect: () => dispatch(boardActions.openSprintSelect()),
    onOpenBoardSelect: () => dispatch(boardActions.openBoardSelect()),
    onCloseSelect: () => dispatch(boardActions.closeSelect()),
    onOpenMenu: () => dispatch(openMenu()),
    createCardForCell: (...args) => dispatch(boardActions.createCardForCell(...args)),
    onCardDrop: (...args) => dispatch(boardActions.onCardDrop(...args))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AgileBoard);
