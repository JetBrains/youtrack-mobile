/* @flow */
import {View, Text, StyleSheet} from 'react-native';
import React, {PureComponent} from 'react';

import {secondaryText} from '../common-styles/typography';

type Props = {
  text: string,
  color?: Object,
  defaultColorCoding?: ?Object,
  fullText?: boolean,
  style?: any
};

export const COLOR_FIELD_SIZE = 20;
const NO_COLOR_CODING_ID = '0';

export default class ColorField extends PureComponent<Props, void> {
  _getBackgroundColor() {
    const {defaultColorCoding, color} = this.props;
    return defaultColorCoding ? defaultColorCoding.backgroundColor : color?.background;
  }

  _getForegroundColor() {
    const {defaultColorCoding, color} = this.props;
    return defaultColorCoding?.color || color?.foreground;
  }

  getText() {
    if (!this.props.text) {
      return null;
    }
    return this.props.fullText ? this.props.text : Array.from(this.props.text)[0];
  }

  render() {
    const {color, fullText, style, defaultColorCoding} = this.props;
    if (color && color.id === NO_COLOR_CODING_ID && !fullText) {
      return null;
    }

    return (
      <View
        style={[styles.wrapper, {backgroundColor: this._getBackgroundColor()}, style, defaultColorCoding]}
        testID="color-field-value-wrapper"
      >
        <Text
          style={[styles.text, {color: this._getForegroundColor()}]}
          numberOfLines={1}
          testID="color-field-value"
        >
          {this.getText()}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE,
    borderRadius: 4,
    justifyContent: 'center'
  },
  text: {
    ...secondaryText,
    fontSize: 13,
    lineHeight: 15,
    textAlign: 'center'
  }
});
