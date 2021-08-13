/* @flow */

import React from 'react';
import {Text, View} from 'react-native';

import Details from '../details/details';
import DiffMatchWord from './diff__match-word';

import styles from './diff.styles';

import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type DiffInfo = {
  id: string,
  style: ViewStyleProp
}

type Props = {
  text1: string,
  text2: string,
  title?: ?string
}


const Diff = (props: Props) => {

  const getDiffInfo = (key: string): DiffInfo => {
    let diffInfo = {
      id: 'diffNull',
      style: null,
    };

    switch (true) {
    case key === DiffMatchWord.diffPatchType.DIFF_INSERT:
      diffInfo = {
        id: 'diffInsert',
        style: styles.diffInsert,
      };
      break;
    case key === DiffMatchWord.diffPatchType.DIFF_DELETE:
      diffInfo = {
        id: 'diffDelete',
        style: styles.diffDelete,
      };
      break;
    case key === DiffMatchWord.diffPatchType.DIFF_EQUAL:
      diffInfo = {
        id: 'diffEqual',
        style: styles.diffEqual,
      };
    }
    return diffInfo;
  };

  const renderDiff = (): Node => {
    const {text1, text2} = props;
    return (
      <Text
        style={styles.content}
        testID="diffText"
      >
        {DiffMatchWord.diff(text1, text2).map(
          (it, index) => {
            const diffInfo = getDiffInfo(it[0]);
            return <Text
              testID={diffInfo.id}
              key={index}
              style={diffInfo.style}>
              {it[1]}
            </Text>;
          }
        )}
      </Text>
    );
  };

  return <View testID="diff"><Details title={props.title} renderer={renderDiff}/></View>;
};

export default (React.memo<Props>(Diff): React$AbstractComponent<Props, mixed>);
