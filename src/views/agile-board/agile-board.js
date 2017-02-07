/* @flow */
import {ScrollView, View, Text} from 'react-native';
import React, {Component} from 'react';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import styles from './agile-board.styles';
import Menu from '../../components/menu/menu';
import BoardHeader from './components/board-header';
import BoardRow from './components/board-row';
import Auth from '../../components/auth/auth';
import Api from '../../components/api/api';
import {notifyError} from '../../components/notification/notification';

type Props = {
  auth: Auth
};

type State = {
  showMenu: boolean,
  sprint: ?Object,
  profile: ?Object,
};

export default class AgileBoard extends Component {
  props: Props;
  state: State;
  api: Api;

  state = {
    showMenu: false,
    sprint: null,
    profile: null
  };

  constructor(props: Props) {
    super(props);
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
      const profile = await api.getAgileUserProfile();
      const sprint = await api.getSprint(profile.defaultAgile.id, profile.defaultAgile.sprints[0].id);
      this.setState({profile, sprint});
    } catch (e) {
      notifyError('Could not load sprint', e);
    }
  }

  _renderHeader() {
    const {sprint} = this.state;
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text></Text>}
        onBack={() => this.setState({showMenu: true})}
      >
        <Text>{sprint ? sprint.name : 'Loading...'}</Text>
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

        <BoardRow row={board.orphanRow}/>

        {board.trimmedSwimlanes.map(swimlane => {
          return (
            <BoardRow key={swimlane.id} row={swimlane}/>
          );
        })}
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
          <ScrollView>
            <ScrollView horizontal>
              {sprint && this._renderBoard()}
            </ScrollView>
          </ScrollView>
        </View>
      </Menu>
    );
  }
}
