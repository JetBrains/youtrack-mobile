/* @flow */

import React, {PureComponent} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {};

export default class MenuIcon extends PureComponent<Props, void> {

  render() {
    return (
      <Icon name="menu" size={24}/>
    );
  }
}
