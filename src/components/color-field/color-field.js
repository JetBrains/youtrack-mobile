/* @flow */
import {View, Text, StyleSheet} from 'react-native';
import React, {PropTypes} from 'react';

export const SIZE = 20;
export const NO_COLOR_ID = '0';

export default class ColorField extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    color: PropTypes.object.isRequired,
    fullText: PropTypes.bool
  }

  _getBackgroundColor() {
    return this.props.color.background;
  }

  _getForegroundColor() {
    return this.props.color.foreground;
  }

  _getFieldLetter() {
    return this.props.fullText ? this.props.text : this.props.text.substr(0, 1);
  }

  render() {
    const {color, fullText, style} = this.props;
    if (color.id === NO_COLOR_ID && !fullText) {
      return null;
    }

    return (
      <View style={[styles.wrapper, {backgroundColor: this._getBackgroundColor()}, style]}>
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
    fontSize: 12,
    textAlign: 'center'
  }
});
