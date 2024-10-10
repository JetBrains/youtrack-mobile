import React from 'react';
import {Text, TextStyle} from 'react-native';

import {useDispatch} from 'react-redux';

import {guid} from 'util/util';
import {handleURL} from 'actions/app-actions';

import styles from 'components/wiki/youtrack-wiki.styles';

import type {ReduxThunkDispatch} from 'types/Redux.ts';

const MarkdownHyperLink = ({
  children,
  uri,
  style,
}: {
  children?: React.ReactNode;
  uri: string;
  style: TextStyle | TextStyle[];
}) => {
  const dispatch: ReduxThunkDispatch = useDispatch();
  return (
    <Text
      selectable={true}
      key={guid()}
      style={new Array().concat(style).concat(styles.link)}
      onPress={() => {
        dispatch(handleURL(uri));
      }}
    >
      {children || uri}
    </Text>
  );
};

export default React.memo(MarkdownHyperLink);
