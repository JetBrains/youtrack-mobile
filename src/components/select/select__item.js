/* @flow */

import {View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import Avatar from '../avatar/avatar';
import {IconCheck} from '../icon/icon';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';

import styles from './select.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export type Props = {
  item: Object,
  isSelected: boolean,
  onPress: (item: Object) => any,
  titleRenderer?: (item: Object) => any,
  style?: ViewStyleProp
};

export default class SelectItem extends PureComponent<Props, void> {
  static defaultProps = {
    isSelected: false,
    onPress: (item: Object) => {},
  };

  getDefaultTitle(item: Object): string {
    return getEntityPresentation(item);
  }

  renderTitle(item: Object) {
    if (this.props.titleRenderer) {
      return this.props.titleRenderer(item);
    }

    return this.getDefaultTitle(item);
  }

  onSelect = () => {
    const {item, onPress} = this.props;
    onPress(item);
  }

  render() {
    const {item, isSelected, style} = this.props;

    if (!item) {
      return null;
    }

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.row, style]}
        onPress={this.onSelect}
      >
        <View style={styles.selectItemValue}>
          {item.avatarUrl && (
            <Avatar
              userName={this.getDefaultTitle(item)}
              size={32}
              style={styles.itemIcon}
              source={{uri: item.avatarUrl}}
            />
          )}

          {this.renderTitle(item)}
        </View>

        {isSelected && <IconCheck size={20} color={styles.link.color}/>}
      </TouchableOpacity>
    );
  }
}
