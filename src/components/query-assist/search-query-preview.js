/* @flow */

import {View, Text} from 'react-native';
import React, {PureComponent} from 'react';

import {COLOR_PLACEHOLDER} from '../variables/variables';
import {IconMagnify} from '../icon/icon';

import styles from './query-assist.styles';

type Props = {
  query: string,
  onFocus: () => void
};


export default class SearchQueryPreview extends PureComponent<Props, void> {
  static defaultProps = {
    onFocus: () => {},
    clearButtonMode: 'while-editing'
  };

  render() {
    const {query, onFocus} = this.props;

    return (
      <View style={styles.placeHolder}>
        <View style={styles.inputWrapper}>
          <IconMagnify style={styles.searchIcon} size={22} color={COLOR_PLACEHOLDER}/>

          <Text
            onPress={onFocus}
            testID="query-assist-input"
            style={[styles.searchInput, styles.searchInputPlaceholder]}
          >
            {query ? query : 'Enter search request'}
          </Text>

        </View>
      </View>
    );
  }
}
