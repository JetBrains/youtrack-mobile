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

type Props = {
  auth: Auth
};

type State = {
  showMenu: boolean
};

export default class AgileBoard extends Component {
  props: Props;
  state: State;

  state = {
    showMenu: false
  };

  constructor(props: Props) {
    super(props);
    usage.trackScreenView('Agile board');
  }

  _onLogOut = () => {

  }

  _renderHeader() {
    return (
      <Header
        leftButton={<Text>Menu</Text>}
        rightButton={<Text></Text>}
        onBack={() => this.setState({showMenu: true})}
      >
        <Text>Agile Board</Text>
      </Header>
    );
  }

  _renderBoard() {
    return (
      <View>
        <BoardHeader columns={['Open', 'In Progress', 'Fixed']}/>

        <BoardRow row={{}}/>
      </View>
    );
  }

  render() {
    const {auth} = this.props;
    const {showMenu} = this.state;
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
              {this._renderBoard()}
            </ScrollView>
          </ScrollView>
        </View>
      </Menu>
    );
  }
}
