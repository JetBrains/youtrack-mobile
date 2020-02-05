/* @flow */

import React, {PureComponent} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {};

export default class ActionsIcon extends PureComponent<Props, void> {

  render() {
    return (
      <Icon name="dots-horizontal" size={26}/>
    );
  }
}
