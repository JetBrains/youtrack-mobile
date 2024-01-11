import React, {PureComponent} from 'react';
import {View, Text} from 'react-native';

import styles from './color-field.styles';

export interface ColorCoding {
  id: string;
  background: string;
  foreground: string;
}

interface Props {
  text?: string;
  color?: ColorCoding;
  fullText?: boolean;
  style?: any;
  children?: any;
}

export const COLOR_FIELD_SIZE = 20;
const NO_COLOR_CODING_ID = '0';


export default class ColorField extends PureComponent<Props, Readonly<{}>> {
  getText(): null | string {
    if (!this.props.text) {
      return '';
    }

    return this.props.fullText
      ? this.props.text
      : Array.from(this.props.text)[0];
  }

  render(): React.ReactNode {
    const {style = null, color} = this.props;
    const hasNoColor: boolean = !color || color?.id === NO_COLOR_CODING_ID;

    return (
      <View
        testID="test:id/color-field-value-wrapper"
        accessibilityLabel="color-field-value-wrapper"
        accessible={true}
        style={[
          {backgroundColor: color?.background},
          styles.wrapper,
          !this.props.fullText && styles.wrapperOneChar,
          style,
          hasNoColor ? styles.defaultColorCoding : null,
        ]}
      >
        {this.props.children}
        <Text
          style={[
            styles.text,
            {color: hasNoColor ? styles.defaultColorCoding.color : color?.foreground},
          ]}
          numberOfLines={1}
          testID="test:id/color-field-value"
          accessible={true}
        >
          {this.getText()}
        </Text>
      </View>
    );
  }
}
