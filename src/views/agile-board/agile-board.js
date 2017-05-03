/* @flow */
import {ScrollView, View, Text, Image, RefreshControl, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import Modal from 'react-native-root-modal';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import Select from '../../components/select/select';
import styles from './agile-board.styles';
import Menu from '../../components/menu/menu';
import BoardHeader from './board-header';
import BoardRow from '../../components/agile-row/agile-row';
import Router from '../../components/router/router';
import Auth from '../../components/auth/auth';
import Api from '../../components/api/api';
import {COLOR_PINK, AGILE_COLUMN_MIN_WIDTH, AGILE_COLLAPSED_COLUMN_WIDTH} from '../../components/variables/variables';
import {zoomIn, zoomOut, next} from '../../components/icon/icon';
import type {SprintFull, Board, AgileBoardRow, AgileColumn} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';
import type {AgilePageState} from './board-reducers';

import * as boardActions from './board-actions';
import {openMenu} from '../../actions';
import { connect } from 'react-redux';

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
  onLoadBoard: () => any,
  onLoadMoreSwimlanes: () => any,
  onRowCollapseToggle: (row: AgileBoardRow) => any,
  onColumnCollapseToggle: (column: AgileColumn) => any,
  onOpenSprintSelect: (any) => any,
  onOpenBoardSelect: (any) => any,
  onCloseSelect: (any) => any,
  createCardForCell: (columnId: string, cellId: string) => any,
  onOpenMenu: (any) => any
};

type State = {
  zoomedOut: boolean
};

class AgileBoard extends Component {
  props: Props;
  state: State;
  boardHeader: ?BoardHeader;

  constructor(props: Props) {
    super(props);
    this.state = {
      zoomedOut: false
    };
  }

  componentDidMount() {
    usage.trackScreenView(CATEGORY_NAME);
    this.props.onLoadBoard();
  }

  _onScroll = (event) => {
    const {nativeEvent} = event;
    const viewHeight = nativeEvent.layoutMeasurement.height;
    const scroll = nativeEvent.contentOffset.y;
    const contentHeight = nativeEvent.contentSize.height;
    const maxScroll = contentHeight - viewHeight;

    if (this.boardHeader) {
      this.boardHeader.setNativeProps({
        style: {left: -nativeEvent.contentOffset.x}
      });
    }

    if (maxScroll - scroll < 20) {
      this.props.onLoadMoreSwimlanes();
    }
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.props.isLoading}
      tintColor={COLOR_PINK}
      onRefresh={() => this.props.onLoadBoard()}
    />;
  }

  _onTapIssue = (issue: IssueOnList) => {
    usage.trackEvent(CATEGORY_NAME, 'Open issue');
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id
    });
  }

  _getScrollableWidth = () => {
    if (!this.props.sprint) {
      return null;
    }

    return this.props.sprint.board.columns
      .map(col => col.collapsed ? AGILE_COLLAPSED_COLUMN_WIDTH : AGILE_COLUMN_MIN_WIDTH)
      .reduce((res, item) => res + item);
  }

  _renderHeader() {
    const {sprint, onOpenSprintSelect, onOpenBoardSelect} = this.props;

    return (
      <Header
        leftButton={<Text>Menu</Text>}
        onBack={this.props.onOpenMenu}
      >
        {sprint && <View style={styles.headerContent}>
          <TouchableOpacity style={styles.headerBoardButton} onPress={onOpenBoardSelect}>
            <Text style={styles.headerBoardText} numberOfLines={1}>{sprint.agile.name}</Text>
          </TouchableOpacity>
          <Image style={styles.headerSeparatorIcon} source={next}/>
          <TouchableOpacity
            style={[styles.headerBoardButton, styles.headerBoardNotCollapsibleButton]}
            onPress={onOpenSprintSelect}
          >
            <Text style={styles.headerSprintText} numberOfLines={1}>{sprint.name}</Text>
          </TouchableOpacity>
        </View>}
      </Header>
    );
  }

  _renderBoardHeader(sprint: SprintFull) {
    const {zoomedOut} = this.state;
    return (
      <View>
      <BoardHeader
        ref={node => this.boardHeader = node}
        style={[
          styles.boardHeader,
          {minWidth: zoomedOut ? null : this._getScrollableWidth()}
        ]}
        columns={sprint.board.columns}
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
        style={styles.selectModal}
      >
        <Select
          getTitle={item => item.name}
          onCancel={this.props.onCloseSelect}
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
      onCollapseToggle: this.props.onRowCollapseToggle
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

  render() {
    const {sprint, isLoadingMore, isSprintSelectOpen, noBoardSelected} = this.props;

    const {zoomedOut} = this.state;
    return (
      <Menu>
        <View style={styles.container}>
          {this._renderHeader()}

          {sprint && this._renderBoardHeader(sprint)}

          <ScrollView
            refreshControl={this._renderRefreshControl()}
            onScroll={this._onScroll}
            scrollEventThrottle={30}
            contentContainerStyle={[
              {minWidth: zoomedOut? null: this._getScrollableWidth()}
            ]}
          >
            {noBoardSelected && this._renderNoSprint()}
            {sprint && this._renderBoard(sprint)}
            {isLoadingMore && <ActivityIndicator color={COLOR_PINK} style={styles.loadingMoreIndicator}/>}
          </ScrollView>

          <View style={styles.zoomButtonContainer}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => this.setState({zoomedOut: !zoomedOut})}>
              <Image source={zoomedOut ? zoomIn : zoomOut} style={styles.zoomButtonIcon}/>
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
    createCardForCell: (...args) => dispatch(boardActions.createCardForCell(...args))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AgileBoard);
