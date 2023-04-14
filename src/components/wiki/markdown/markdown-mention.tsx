import React from 'react';

import {guid} from 'util/util';

import {Text, TextStyle} from 'react-native';


export default function MarkdownMention({mention, onPress, style}: {
  mention: string,
  onPress: () => void,
  style: TextStyle | TextStyle[],
}): JSX.Element | null {
  return (
    <Text
      key={guid()}
      onPress={onPress}
      selectable={true}
      style={style}
    >
      {mention}
    </Text>
  );
}
