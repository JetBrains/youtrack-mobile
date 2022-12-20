import React, {PureComponent} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {secondaryText} from '../common-styles/typography';
import {UNIT} from '../variables/variables';
type Props = {
  text: string;
  color?: Record<string, any>;
  defaultColorCoding?: Record<string, any> | null | undefined;
  fullText?: boolean;
  style?: any;
};
export const COLOR_FIELD_SIZE = 20;
const NO_COLOR_CODING_ID = '0';
export default class ColorField extends PureComponent<Props, void> {
  _getBackgroundColor() {
    const {defaultColorCoding, color} = this.props;
    return defaultColorCoding
      ? defaultColorCoding.backgroundColor
      : color?.background;
  }

  _getForegroundColor() {
    const {defaultColorCoding, color} = this.props;
    return defaultColorCoding?.color || color?.foreground;
  }

  getText(): null | string {
    if (!this.props.text) {
      return null;
    }

    return this.props.fullText
      ? this.props.text
      : Array.from(this.props.text)[0];
  }

  render(): React.ReactNode {
    const {color, fullText, style, defaultColorCoding} = this.props;

    if (color && color.id === NO_COLOR_CODING_ID && !fullText) {
      return null;
    }

    return (
      <View
        style={Object.assign(
          {
            backgroundColor: this._getBackgroundColor(),
          },
          styles.wrapper,
          !this.props.fullText ? styles.wrapperOneChar : null,
          style,
          defaultColorCoding,
        )}
        testID="color-field-value-wrapper"
      >
        <Text
          style={Object.assign(
            {
              color: this._getForegroundColor(),
            },
            styles.text,
          )}
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
    justifyContent: 'center',
    paddingVertical: UNIT / 4,
    paddingHorizontal: UNIT / 2,
    borderRadius: UNIT / 2,
  },
  wrapperOneChar: {
    width: COLOR_FIELD_SIZE,
    height: COLOR_FIELD_SIZE,
  },
  text: {...secondaryText, fontSize: 13, lineHeight: 15, textAlign: 'center'},
});
