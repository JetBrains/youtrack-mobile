/* @flow */

import {Text, View} from 'react-native';
import React, {PureComponent} from 'react';

import {IconSearch} from '../icon/icon';
import {iconClearText} from '../icon/icon-clear-text';

import styles from './query-assist.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  query: string,
  onFocus: (clear: boolean) => any,
  onClearText: () => void,
  style?: ViewStyleProp
};


export default class QueryPreview extends PureComponent<Props, void> {
  static defaultProps = {
    onFocus: () => {},
    onClearText: () => {}
  };

  focusAndClear = () => {
    this.props.onFocus(true);
  }

  focus = () => {
    this.props.onFocus(false);
  }

  render() {
    const {query, style} = this.props;

    return (
      <View style={[styles.placeHolder, style]}>
        <View style={styles.inputWrapper}>
          <IconSearch style={styles.searchIcon} size={20} color={styles.clearIcon.color}/>

          <Text
            numberOfLines={1}
            onPress={this.focus}
            testID="query-assist-input"
            style={[
              styles.searchInput,
              styles.searchInputPlaceholder,
              query ? styles.searchInputHasText : null
            ]}
          >
            {query ? query : 'Enter search request'}
          </Text>

          {!!query && iconClearText(this.focusAndClear, styles.clearIcon.color)}

        </View>
      </View>
    );
  }
}

