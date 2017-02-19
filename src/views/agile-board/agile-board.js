/* @flow */
import {ScrollView, View, Text, Image, RefreshControl, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
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

import * as boardActions from './board-actions';
import {openMenu} from '../../actions';
import { connect } from 'react-redux';

type Props = {
  auth: Auth,
  api: Api,
  isLoading: boolean,
  isLoadingMore: boolean,
  noMoreSwimlanes: boolean,
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
  onOpenMenu: (any) => any
};

type State = {
  zoomedOut: boolean
};

class AgileBoard extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      zoomedOut: false
    };
    usage.trackScreenView('Agile board');
  }

  componentDidMount() {
    this.props.onLoadBoard();
  }

  _onScroll = (event) => {
    const {nativeEvent} = event;
    const viewHeight = nativeEvent.layoutMeasurement.height;
    const scroll = nativeEvent.contentOffset.y;
    const contentHeight = nativeEvent.contentSize.height;
    const maxScroll = contentHeight - viewHeight;

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
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id,
      api: this.props.api,
    });
  }

  _getScrollableWidth = () => {
    const {sprint} = this.props;
    if (!sprint) {
      return null;
    }
    const {board} = sprint;

    return board.columns
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

  _renderSelect() {
    const {selectProps} = this.props;
    return (
      <Select
        {...selectProps}
        getTitle={item => item.name}
        onCancel={this.props.onCloseSelect}
      />
    );
  }

  _renderBoard(sprint: SprintFull) {
    const {zoomedOut} = this.state;
    const board: Board = sprint.board;

    const commonRowProps = {
      collapsedColumnIds: board.columns.filter(col => col.collapsed).map(col => col.id),
      onTapIssue: this._onTapIssue,
      onCollapseToggle: this.props.onRowCollapseToggle
    };

    return (
      <View style={zoomedOut && styles.rowContainerZoomedOut}>
        <BoardHeader columns={board.columns} onCollapseToggle={this.props.onColumnCollapseToggle}/>

        {sprint.agile.orphansAtTheTop && <BoardRow row={board.orphanRow} {...commonRowProps}/>}

        {board.trimmedSwimlanes.map(swimlane => {
          return (
            <BoardRow
              key={swimlane.id}
              row={swimlane}
              {...commonRowProps}
            />
          );
        })}

        {!sprint.agile.orphansAtTheTop && <BoardRow row={board.orphanRow} {...commonRowProps}/>}
      </View>
    );
  }

  render() {
    const {sprint, isLoadingMore, isSprintSelectOpen} = this.props;

    const {zoomedOut} = this.state;
    return (
      <Menu>
        <View style={styles.container}>
          {this._renderHeader()}

          <ScrollView
            refreshControl={this._renderRefreshControl()}
            onScroll={this._onScroll}
            scrollEventThrottle={100}
            contentContainerStyle={{minWidth: this._getScrollableWidth()}}
          >
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
    onOpenMenu: () => dispatch(openMenu())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AgileBoard);
