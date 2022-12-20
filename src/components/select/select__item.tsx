import {View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';
import Avatar from '../avatar/avatar';
import {IconCheck} from '../icon/icon';
import {getEntityPresentation} from '../issue-formatter/issue-formatter';
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
export default class SelectItem extends PureComponent<Props, void> {
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
        testID="test:id/selectItem"
        accessibilityLabel="selectItem"
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
