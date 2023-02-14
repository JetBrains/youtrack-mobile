import React, {PureComponent} from 'react';
import {View, TouchableOpacity} from 'react-native';

import Avatar from 'components/avatar/avatar';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {IconCheck} from 'components/icon/icon';

import styles from './select.styles';

import type {ViewStyleProp} from 'types/Internal';

export type Props = {
  item: Record<string, any>;
  isSelected: boolean;
  onPress: (item: Record<string, any>) => any;
  onLongPress?: (arg0: any) => any;
  disabled?: boolean;
  titleRenderer?: (item: Record<string, any>) => any;
  style?: ViewStyleProp;
};


export default class ListSelectItem extends PureComponent<Props, Readonly<{}>> {
  static defaultProps: {
    isSelected: boolean;
    onPress: (item: any) => void;
  } = {
    isSelected: false,
    onPress: (item: Record<string, any>) => {},
  };

  getDefaultTitle(item: Record<string, any>): string {
    return getEntityPresentation(item);
  }

  renderTitle(item: Record<string, any>): any | string {
    if (this.props.titleRenderer) {
      return this.props.titleRenderer(item);
    }

    return this.getDefaultTitle(item);
  }

  onSelect: () => void = () => {
    const {item, onPress} = this.props;
    onPress(item);
  };

  render(): React.ReactNode {
    const {
      item,
      isSelected,
      style,
      onLongPress = () => {},
      disabled = false,
    } = this.props;

    if (!item) {
      return null;
    }

    return (
      <TouchableOpacity
        testID="test:id/selectListItem"
        accessibilityLabel="selectListItem"
        accessible={true}
        key={item.id}
        style={[styles.row, style]}
        onPress={this.onSelect}
        onLongPress={onLongPress}
        disabled={disabled}
      >
        <View style={styles.selectItemValue}>
          {item.avatarUrl && (
            <Avatar
              userName={this.getDefaultTitle(item)}
              size={32}
              style={styles.itemIcon}
              source={{
                uri: item.avatarUrl,
              }}
            />
          )}

          {this.renderTitle(item)}
        </View>

        {isSelected && <IconCheck size={20} color={styles.link.color} />}
      </TouchableOpacity>
    );
  }
}
