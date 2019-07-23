/* @flow */

import styles from './tags.styles';

import {View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';

import ColorField from '../../components/color-field/color-field';

import type {Tag} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  tags: Array<Tag>,
  onTagPress: (query: string) => any,
  style?: ViewStyleProp,
}

type DefaultProps = {
  onTagPress: () => any,
}

export default class Tags extends PureComponent<Props, void> {

  static defaultProps: DefaultProps = {
    onTagPress: () => {}
  };


  _hasNoColor(tag: Tag) {
    return tag?.color.id === '0';
  }

  render() {
    const {tags, onTagPress, style = {}} = this.props;

    if (!tags || !tags.length) {
      return null;
    }

    return (
      <View
        testID="tags"
        style={[styles.tagsContainer, style]}
      >
        {tags.map(tag => {
          return (
            <TouchableOpacity
              testID="tagsTag"
              onPress={() => onTagPress(tag.query)}
              key={`${tag.id}_button`}
            >
              <ColorField
                testID="tagColor"
                style={[styles.tag, this._hasNoColor(tag) ? styles.tagNoColor: {}]}
                text={tag.name}
                color={tag.color}
                fullText={true}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }
}
