/* @flow */
import {View, Text} from 'react-native';
import React, {Component} from 'react';
import usage from '../../components/usage/usage';
import Header from '../../components/header/header';
import styles from './agile-board.styles';
import Menu from '../../components/menu/menu';

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

        </View>
      </Menu>
    );
  }
}
