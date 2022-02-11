/* @flow */

import React from 'react';

import {TextInput} from 'react-native';

import {decodeHTML} from 'entities';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  style?: ViewStyleProp,
  children: any
};

const LongText = (props: Props) => {
  const {children, style} = props;
  const decodedText: string = decodeHTML(children) || '';

  return <TextInput
    style={style}
    editable={false}
    multiline={true}
    spellCheck={false}
    autoCorrect={false}
    value={decodedText}
  />;
};

export default (React.memo<Props>(LongText): React$AbstractComponent<Props, mixed>);
