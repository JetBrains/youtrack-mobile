/* @flow */
import {View, Text, StyleSheet} from 'react-native';
import React, {PureComponent} from 'react';
import {secondaryText} from '../common-styles/typography';

export const SIZE = 20;
export const NO_COLOR_ID = '0';
export const INITIAL_COLOR = 'initial';

type Props = {
  text: string,
  color?: Object,
  fullText?: boolean,
  style?: any
};

export default class ColorField extends PureComponent<Props, void> {
  _getBackgroundColor() {
    return this.props.color?.background || INITIAL_COLOR;
  }

  _getForegroundColor() {
    return this.props.color?.foreground || INITIAL_COLOR;
  }

  _getFieldLetter() {
    if (!this.props.text) {
      return null;
    }
    return this.props.fullText ? this.props.text : Array.from(this.props.text)[0];
  }

  render() {
    const {color, fullText, style} = this.props;
    if (color && color.id === NO_COLOR_ID && !fullText) {
      return null;
    }

    return (
      <View
        style={[styles.wrapper, {backgroundColor: this._getBackgroundColor()}, style]}
        testID="color-field-value-wrapper"
      >
        <Text
          style={[styles.text, {color: this._getForegroundColor()}]}
          numberOfLines={1}
          testID="color-field-value"
        >
          {this._getFieldLetter()}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
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
