import React from 'react';
import {View, Text} from 'react-native';

import styles from './color-field.styles';

import {TextStyleProp, ViewStyleProp} from 'types/Internal';

export interface ColorCoding {
  id: string;
  foreground: string;
  background: string;
}

interface Props {
  children?: React.ReactNode;
  color?: ColorCoding;
  fullText?: boolean;
  monospace?: boolean;
  style?: TextStyleProp & ViewStyleProp;
  text?: string;
}

export const COLOR_FIELD_SIZE = 21;
const NO_COLOR_CODING_ID = '0';

export default function ColorField(props: Props) {
  const getText = (): string => {
    if (!props.text?.trim?.()) {
      return '';
    }
    return props.fullText ? props.text : Array.from(props.text)[0];
  };

  const {style = null, color} = props;
  const hasNoColor: boolean = !color || color?.id === NO_COLOR_CODING_ID;

  return (
    <View
      testID="test:id/color-field-value-wrapper"
      accessible={true}
      style={[
        {backgroundColor: color?.background},
        styles.wrapper,
        !props.fullText && styles.wrapperOneChar,
        style,
        hasNoColor ? styles.defaultColorCoding : null,
      ]}
    >
      {props.children}
      <Text
        style={[
          styles.text,
          style?.fontSize ? {fontSize: style.fontSize} : null,
          props.monospace ? styles.textMonospace : null,
          {color: hasNoColor ? styles.defaultColorCoding.color : color?.foreground},
        ]}
        numberOfLines={1}
        testID="test:id/color-field-value"
        accessible={true}
      >
        {getText()}
      </Text>
    </View>
  );
}
