/* @flow */

import React, {PureComponent} from 'react';
import {Text} from 'react-native';
import DiffMatchPatch from 'diff-match-patch';

import styles from './diff.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type DiffInfo = {
  id: string,
  style: ViewStyleProp
}

type Props = {
  text1: string,
  text2: string
}

export default class Diff extends PureComponent<Props, void> {
  diffMatchPatch: Object;

  constructor(props: Props) {
    super(props);
    this.diffMatchPatch = new DiffMatchPatch();
  }

  getDiffInfo(key: string): DiffInfo {
    let diffInfo = {
      id: 'diffNull',
      style: null
    };

    switch (true) {
    case key === DiffMatchPatch.DIFF_INSERT:
      diffInfo = {
        id: 'diffInsert',
        style: styles.diffInsert
      };
      break;
    case key === DiffMatchPatch.DIFF_DELETE:
      diffInfo = {
        id: 'diffDelete',
        style: styles.diffDelete
      };
      break;
    case key === DiffMatchPatch.DIFF_EQUAL:
      diffInfo = {
        id: 'diffEqual',
        style: styles.diffEqual
      };
    }
    return diffInfo;
  }

  createDiff() {
    const {text1, text2} = this.props;
    return this.diffMatchPatch.diff_main(text1, text2);
  }

  render() {
    return (
      <Text testID="diff">
        {this.createDiff().map(
          (it, index) => {
            const diffInfo = this.getDiffInfo(it[0]);
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
  }
}
