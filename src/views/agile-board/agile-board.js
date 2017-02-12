/* @flow */
import {ScrollView, View, Text, Image, RefreshControl, TouchableOpacity, ActivityIndicator} from 'react-native';
import React, {Component} from 'react';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import styles from './agile-board.styles';
import Menu from '../../components/menu/menu';
import BoardHeader from './components/board-header';
import BoardRow from './components/board-row';
import Router from '../../components/router/router';
import Auth from '../../components/auth/auth';
import Api from '../../components/api/api';
import {COLOR_PINK} from '../../components/variables/variables';
import {notifyError} from '../../components/notification/notification';
import {updateRowCollapsedState} from './components/board-updater';
import {zoomIn, zoomOut} from '../../components/icon/icon';
import type {SprintFull, Board, AgileUserProfile, AgileBoardRow, AgileColumn} from '../../flow/Agile';
import type {IssueOnList} from '../../flow/Issue';

const PAGE_SIZE = 4;

type Props = {
  auth: Auth
};

type State = {
  showMenu: boolean,
  isRefreshing: boolean,
  isLoadingMore: boolean,
  noMoreSwimlanes: boolean,
  zoomedOut: boolean,
  sprint: ?SprintFull,
  profile: ?AgileUserProfile,
};

export default class AgileBoard extends Component {
  props: Props;
  state: State;
  api: Api;

  constructor(props: Props) {
    super(props);
    this.state = {
      showMenu: false,
      isRefreshing: false,
      isLoadingMore: false,
      noMoreSwimlanes: false,
      zoomedOut: false,
      sprint: null,
      profile: null
    };

    this.api = new Api(this.props.auth);
    usage.trackScreenView('Agile board');
  }

  componentDidMount() {
    this.loadBoard();
  }

  _onLogOut = () => {

  }

  async loadBoard() {
    const {api} = this;
    try {
      this.setState({isRefreshing: true});
      const profile = await api.getAgileUserProfile();
      const lastSprint = profile.visitedSprints.filter(s => s.agile.id === profile.defaultAgile.id)[0];
      const sprint = await api.getSprint(lastSprint.agile.id, lastSprint.id, PAGE_SIZE);

      this.setState({profile, sprint});
    } catch (e) {
      notifyError('Could not load sprint', e);
    } finally {
      this.setState({isRefreshing: false});
    }
  }

  async loadMoreSwimlanes() {
    const {sprint, noMoreSwimlanes} = this.state;
    if (!sprint || noMoreSwimlanes) {
      return;
    }
    try {
      this.setState({isLoadingMore: true});
      const swimlanes = await this.api.getSwimlanes(sprint.agile.id, sprint.id, PAGE_SIZE, sprint.board.trimmedSwimlanes.length);
      this.setState({sprint: {
        ...sprint,
        board: {
          ...sprint.board,
          trimmedSwimlanes: sprint.board.trimmedSwimlanes.concat(swimlanes)
        },
        noMoreSwimlanes: swimlanes.length < PAGE_SIZE
      }});
    } catch (e) {
      notifyError('Could not load more swimlanes', e);
    } finally {
      this.setState({isLoadingMore: false});
    }
  }

  _onScroll = (event) => {
    const {nativeEvent} = event;
    const viewHeight = nativeEvent.layoutMeasurement.height;
    const scroll = nativeEvent.contentOffset.y;
    const contentHeight = nativeEvent.contentSize.height;
    const maxScroll = contentHeight - viewHeight;

    if (maxScroll - scroll < 20) {
      this.loadMoreSwimlanes();
    }
  }

  _renderRefreshControl() {
    return <RefreshControl
      refreshing={this.state.isRefreshing}
      tintColor={COLOR_PINK}
      onRefresh={() => this.loadBoard()}
    />;
  }

  _onTapIssue = (issue: IssueOnList) => {
    Router.SingleIssue({
      issuePlaceholder: issue,
      issueId: issue.id,
      api: this.api,
    });
  }

  _onRowCollapseToggle = async (row: AgileBoardRow) => {
    const {sprint} = this.state;
    if (!sprint) {
      return;
    }
    const oldCollapsed = row.collapsed;

    try {
      this.setState({
        sprint: {
          ...sprint,
          board: updateRowCollapsedState(sprint.board, row, !row.collapsed)
        }
      });
      await this.api.updateRowCollapsedState(sprint.agile.id, sprint.id, {
        ...row,
        collapsed: !row.collapsed
      });
    } catch (e) {
      this.setState({
        sprint: {...sprint,
          board: updateRowCollapsedState(sprint.board, row, oldCollapsed)
        }
      });
      notifyError('Could not update row', e);
    }
  }

  _onColumnCollapseToggle = async (column: AgileColumn) => {

  }

  _renderHeader() {
    const {sprint} = this.state;
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
    const {sprint, zoomedOut} = this.state;
    if (!sprint) {
      return;
    }
    const board: Board = sprint.board;

    const commonRowProps = {
      collapsedColumnIds: board.columns.filter(col => col.collapsed).map(col => col.id),
      onTapIssue: this._onTapIssue,
      onCollapseToggle: this._onRowCollapseToggle
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
    const {auth} = this.props;
    const {showMenu, sprint, isLoadingMore, zoomedOut} = this.state;
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
