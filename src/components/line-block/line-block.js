/* @flow */

import {View, TouchableOpacity, Text} from 'react-native';
import React, {PureComponent} from 'react';

import ModalView from '../modal-view/modal-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from './line-block.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {COLOR_GRAY} from '../variables/variables';

type Props = {
  inline?: boolean,
  style?: ViewStyleProp,
  title?: React$Element<*>,

  childrenRenderer: Function,
  allChildrenRenderer: Function
}


type State = {
  showMore: boolean
}

export default class LineBlock extends PureComponent<Props, State> {
  hitSlop = ['top', 'left', 'bottom', 'right'].reduce((data, key) => Object.assign(data, {[key]: 12}), {});

  constructor(props: Props) {
    super(props);
    this.state = {showMore: false};
  }

  _toggleShowAll() {
    this.setState({showMore: !this.state.showMore});
  }

  render() {
    const {inline, style, childrenRenderer, allChildrenRenderer} = this.props;

    if (!childrenRenderer || !allChildrenRenderer) {
      return null;
    }

    const onShowAllToggle = () => this._toggleShowAll();

    return (
      <View
        testID="lineBlock"
        style={[inline ? styles.containerInline : styles.container, style]}
      >
        {childrenRenderer()}

        {!inline && <TouchableOpacity
          testID="lineBlockMore"
          style={styles.showMore}
          onPress={onShowAllToggle}
        >
          <Text style={styles.arrowIcon}><Icon name="angle-right" size={24} color={COLOR_GRAY}/></Text>
        </TouchableOpacity>}

        {this.state.showMore &&
        <ModalView
          testID="lineBlockModal"
          style={styles.modal}>
          {allChildrenRenderer()}

          <TouchableOpacity
            testID="lineBlockModalClose"
            style={styles.closeButton}
            onPress={onShowAllToggle}
            hitSlop={this.hitSlop}
          >
            <MaterialIcon name="close" size={40} color={COLOR_GRAY}/>
          </TouchableOpacity>
        </ModalView>}

      </View>
    );
  }
}
