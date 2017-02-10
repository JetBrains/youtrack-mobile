/* @flow */
import {ScrollView, View, Text, RefreshControl} from 'react-native';
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

type Props = {
  auth: Auth
};

type State = {
  showMenu: boolean,
  isRefreshing: boolean,
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
      const sprint = await api.getSprint(lastSprint.agile.id, lastSprint.id);
      this.setState({profile, sprint});
    } catch (e) {
      notifyError('Could not load sprint', e);
    } finally {
      this.setState({isRefreshing: false});
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
    const {sprint} = this.state;
    if (!sprint) {
      return;
    }
    const board = sprint.board;

    const columns = board.columns.map(({agileColumn}) => {
      return agileColumn.fieldValues.map(val => val.presentation).join(', ');
    });

    return (
      <View>
        <BoardHeader columns={columns}/>

        {sprint.agile.orphansAtTheTop && <BoardRow row={board.orphanRow} onTapIssue={this._onTapIssue}/>}

        {board.trimmedSwimlanes.map(swimlane => {
          return (
            <BoardRow key={swimlane.id} row={swimlane} onTapIssue={this._onTapIssue}/>
          );
        })}

        {!sprint.agile.orphansAtTheTop && <BoardRow row={board.orphanRow} onTapIssue={this._onTapIssue}/>}
      </View>
    );
  }

  render() {
    const {auth} = this.props;
    const {showMenu, sprint} = this.state;
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
          <ScrollView refreshControl={this._renderRefreshControl()}>
            <ScrollView horizontal>
              {sprint && this._renderBoard()}
            </ScrollView>
          </ScrollView>
        </View>
      </Menu>
    );
  }
}
