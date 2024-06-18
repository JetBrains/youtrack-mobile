import React, {PureComponent} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';

import Avatar from 'components/avatar/avatar';
import {getEntityPresentation} from 'components/issue-formatter/issue-formatter';
import {IconCheck} from 'components/icon/icon';

import {View as AnimatedView} from 'react-native-animatable';

import styles from './select.styles';

import type {IItem} from 'components/select/select';
import type {ViewStyleProp} from 'types/Internal';

export interface Props {
  item: IItem;
  isSelected: boolean;
  onPress: (item: IItem) => void;
  onLongPress?: (item: IItem) => void;
  disabled?: boolean;
  titleRenderer?: (item: IItem) => React.ReactNode;
  style?: ViewStyleProp;
}


export default class ListSelectItem extends PureComponent<Props, Readonly<{}>> {
  static defaultProps: {
    isSelected: boolean;
    onPress: (item: IItem) => void;
  } = {
    isSelected: false,
    onPress: (item: IItem) => {},
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

  render() {
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
      <AnimatedView
        useNativeDriver
        duration={500}
        animation="fadeIn"
      >
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
          <View
            style={styles.selectItemValue}
            testID="test:id/selectListItemText"
            accessible={true}
          >
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

            <View style={styles.item}>
              {this.renderTitle(item)}
              {!!item.description &&
                  <Text numberOfLines={1} style={styles.description}>{item.description}</Text>}
            </View>
          </View>

          {isSelected && <View style={styles.itemIconSelected}>
            <IconCheck color={styles.link.color}/>
          </View>}
        </TouchableOpacity>
      </AnimatedView>
    );
  }
}
