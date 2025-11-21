import React, {PureComponent} from 'react';
import {View, TouchableOpacity, Text, GestureResponderEvent} from 'react-native';

import Avatar from 'components/avatar/avatar';
import ImageWithProgress from 'components/image/image-with-progress';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {IconCheck} from 'components/icon/icon';

import styles from './select.styles';

import type {IItem} from 'components/select/select';
import type {ViewStyleProp} from 'types/Internal';

export interface Props<T> {
  item: T;
  isSelected?: boolean;
  onPress?: (item: T) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  titleRenderer?: (item: T) => React.ReactNode;
  style?: ViewStyleProp;
}

export default class ListSelectItem<T extends IItem = IItem> extends PureComponent<Props<T>, Readonly<{}>> {

  getDefaultTitle(item: T): string {
    return getEntityPresentation(item);
  }

  renderTitle(item: T) {
    if (this.props.titleRenderer) {
      return this.props.titleRenderer(item);
    }

    return this.getDefaultTitle(item);
  }

  onSelect = () => {
    const {item, onPress} = this.props;
    if (onPress) {
      onPress(item);
    }
  };

  render() {
    const {
      item,
      isSelected = false,
      style,
      onLongPress = () => {},
      disabled = false,
    } = this.props;

    return !item ? null : (
      <TouchableOpacity
        testID="test:id/selectListItem"
        accessibilityLabel="selectListItem"
        accessible={false}
        key={item.id}
        style={[styles.row, style]}
        onPress={this.onSelect}
        onLongPress={onLongPress}
        disabled={disabled}
      >
        <View style={styles.selectItemValue} testID="test:id/selectListItemText" accessible={true}>
          {(item.avatarUrl || item.icon) && (
            <Avatar
              userName={this.getDefaultTitle(item)}
              size={32}
              style={styles.itemIcon}
              source={{
                uri: item.avatarUrl || item.icon,
              }}
            />
          )}
          {item.avatarUrl && item.icon && (
            <ImageWithProgress
              resizeMethod="scale"
              style={styles.itemIconSecondary}
              source={{uri: item.icon}}
            />
          )}

          <View style={styles.itemWrapper}>
            <View style={styles.item}>
              {this.renderTitle(item)}
            </View>
            {!!item.description && (
              <Text numberOfLines={1} style={styles.description}>
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.itemIconSelected}>
            <IconCheck color={styles.link.color} />
          </View>
        )}
      </TouchableOpacity>
    );
  }
}
