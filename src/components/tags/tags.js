/* @flow */

import styles from './tags.styles';

import {View, TouchableOpacity} from 'react-native';
import React, {PureComponent} from 'react';
import ColorField from '../../components/color-field/color-field';
import type {Tag} from '../../flow/CustomFields';


type Props = {
  tags: Array<Tag>,
  onTagPress: (query: string) => any
}

export default class Tags extends PureComponent<Props, void> {

  render() {
    const {tags} = this.props;

    if (!tags || !tags.length) {
      return null;
    }

    return (
      <View
        testID="tags"
        style={styles.tagsContainer}
      >
        {tags.map(tag => {
          return (
            <TouchableOpacity
              onPress={() => this.props.onTagPress(tag.query)}
              key={tag.id}
            >
              <ColorField
                testID="tagColor"
                style={styles.tagColorField}
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
