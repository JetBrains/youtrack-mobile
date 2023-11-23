import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';

import styles from './color-field.styles';

interface Props {
  text: string;
  color?: Record<string, any>;
  defaultColorCoding?: Record<string, any> | null | undefined;
  fullText?: boolean;
  style?: any;
}

export const COLOR_FIELD_SIZE = 20;
const NO_COLOR_CODING_ID = '0';


export default class ColorField extends PureComponent<Props, Readonly<{}>> {
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
    const {style, defaultColorCoding, color} = this.props;
    const hasNoColor: boolean = color?.id === NO_COLOR_CODING_ID;

    return (
      <View
        style={[
          {backgroundColor: this._getBackgroundColor()},
          styles.wrapper,
          !this.props.fullText ? styles.wrapperOneChar : null,
          style,
          defaultColorCoding,
          hasNoColor && !defaultColorCoding && styles.defaultColorCoding,
        ]}
        testID="color-field-value-wrapper"
      >
        <Text
          style={[
            {color: this._getForegroundColor()},
            styles.text,
            hasNoColor && !defaultColorCoding && {color: styles.defaultColorCoding.color},
          ]}
          numberOfLines={1}
          testID="color-field-value"
          accessible={true}
        >
          {this.getText()}
        </Text>
      </View>
    );
  }
}
