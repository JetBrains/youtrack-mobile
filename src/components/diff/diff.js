/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import DiffMatchWord from './diff__match-word';
import Icon from 'react-native-vector-icons/FontAwesome';

import styles from './diff.styles';

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

type State = {
  collapsed: boolean
}

export default class Diff extends PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = {};
    if (props.title) {
      this.state.collapsed = true;
    }
  }

  getDiffInfo(key: string): DiffInfo {
    let diffInfo = {
      id: 'diffNull',
      style: null
    };

    switch (true) {
    case key === DiffMatchWord.diffPatchType.DIFF_INSERT:
      diffInfo = {
        id: 'diffInsert',
        style: styles.diffInsert
      };
      break;
    case key === DiffMatchWord.diffPatchType.DIFF_DELETE:
      diffInfo = {
        id: 'diffDelete',
        style: styles.diffDelete
      };
      break;
    case key === DiffMatchWord.diffPatchType.DIFF_EQUAL:
      diffInfo = {
        id: 'diffEqual',
        style: styles.diffEqual
      };
    }
    return diffInfo;
  }

  createDiff() {
    const {text1, text2} = this.props;
    return DiffMatchWord.diff(text1, text2);
  }

  renderDiff() {
    return (
      <Text testID="diffText">
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

  render() {
    const {title} = this.props;
    const {collapsed} = this.state;

    return (
      <View testID="diff">
        {title && <TouchableOpacity
          style={styles.button}
          testID="diffToggle"
          onPress={() => this.setState({collapsed: !collapsed})}>
          <Text style={styles.title}>
            {`${title}: `}
          </Text>
          <Text style={styles.toggle}>
            {'Details '}
            <Icon name={collapsed ? 'angle-down' : 'angle-up'} />
          </Text>
        </TouchableOpacity>}

        {(!title || (title && !collapsed)) && this.renderDiff()}
      </View>
    );
  }
}
