/* @flow */

import React, {PureComponent} from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';

import {COLOR_ICON_LIGHT_BLUE, UNIT} from '../variables/variables';
import {IconPaperClip} from '../icon/icon';

type Props = {
  style?: any,
  canAttach: boolean,
  onAttach: (any) => any
}

export default class IssueAttach extends PureComponent<Props, void> {

  render() {
    const {canAttach, onAttach, style} = this.props;

    if (!canAttach) {
      return null;
    }
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        onPress={onAttach}>
        <IconPaperClip size={26} color={COLOR_ICON_LIGHT_BLUE}/>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: UNIT
  }
});
