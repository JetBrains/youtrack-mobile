/* @flow */
import {ScrollView, View, Text, Image, RefreshControl, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import styles from './agile-board.styles';
import Menu from '../../components/menu/menu';
import BoardHeader from './board-header';
import BoardRow from '../../components/agile-row/agile-row';
import Router from '../../components/router/router';
import Auth from '../../components/auth/auth';
import Api from '../../components/api/api';
import {COLOR_PINK} from '../../components/variables/variables';
import {zoomIn, zoomOut} from '../../components/icon/icon';
import type {SprintFull, Board, AgileBoardRow, AgileColumn} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';


import * as boardActions from './actions/boardActions';
import { connect } from 'react-redux';

type Props = {
  auth: Auth,
  api: Api,
  isLoading: boolean,
  isLoadingMore: boolean,
  noMoreSwimlanes: boolean,
  sprint: ?SprintFull,
  onLoadBoard: () => any,
  onLoadMoreSwimlanes: () => any,
  onRowCollapseToggle: (row: AgileBoardRow) => any
};

type State = {
  showMenu: boolean,
  zoomedOut: boolean
};

class AgileBoard extends Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      showMenu: false,
      zoomedOut: false
    };
    usage.trackScreenView('Agile board');
  }

  componentDidMount() {
    this.props.onLoadBoard();
  }

  _onLogOut = () => {

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
  _onColumnCollapseToggle = async (column: AgileColumn) => {

  }

  _renderHeader() {
    const {sprint} = this.props;
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text></Text>}
        onBack={() => this.setState({showMenu: true})}
      >
        <Text>{sprint ? `${sprint.agile.name} > ${sprint.name}` : 'Loading...'}</Text>
      </Header>
    );
  }

  _renderBoard() {
    const {sprint} = this.props;
    const {zoomedOut} = this.state;
    if (!sprint) {
      return;
    }
    const board: Board = sprint.board;

    const commonRowProps = {
      collapsedColumnIds: board.columns.filter(col => col.collapsed).map(col => col.id),
      onTapIssue: this._onTapIssue,
      onCollapseToggle: this.props.onRowCollapseToggle
    };

    return (
      <View style={zoomedOut && styles.rowContainerZoomedOut}>
        <BoardHeader columns={board.columns} onCollapseToggle={this._onColumnCollapseToggle}/>

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
    const {auth, sprint, isLoadingMore} = this.props;

    const {showMenu, zoomedOut} = this.state;
    return (
      <Menu
        show={showMenu}
        auth={auth}
        onLogOut={this._onLogOut}
        onOpen={() => this.setState({showMenu: true})}
        onClose={() => this.setState({showMenu: false})}
      >
        <View style={styles.container}>
          {this._renderHeader()}
          <ScrollView
            refreshControl={this._renderRefreshControl()}
            onScroll={this._onScroll}
            scrollEventThrottle={100}
          >
            <ScrollView horizontal>
              {sprint && this._renderBoard()}
            </ScrollView>
            {isLoadingMore && <ActivityIndicator color={COLOR_PINK} style={styles.loadingMoreIndicator}/>}
          </ScrollView>

          <View style={styles.zoomButtonContainer}>
            <TouchableOpacity
              style={styles.zoomButton}
              onPress={() => this.setState({zoomedOut: !zoomedOut})}>
              <Image source={zoomedOut ? zoomIn : zoomOut} style={styles.zoomButtonIcon}/>
            </TouchableOpacity>
          </View>
        </View>
      </Menu>
    );
  }
}


const mapStateToProps = (state, ownProps) => {
  return state.board;
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadBoard: () => dispatch(boardActions.fetchAgileBoard()),
    onLoadMoreSwimlanes: () => dispatch(boardActions.fetchMoreSwimlanes()),
    onRowCollapseToggle: (row) => console.log('rowCollapseToggle') || dispatch(boardActions.rowCollapseToggle(row))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(AgileBoard);
