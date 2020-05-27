/* @flow */

import {View, TextInput} from 'react-native';
import React, {PureComponent} from 'react';

import {COLOR_PLACEHOLDER} from '../variables/variables';
import {IconMagnify} from '../icon/icon';

import styles from './query-assist.styles';

type Props = {
  input: string,
  onFocus: () => void,
  onBlur: () => void,
  clearButtonMode?: ('never' | 'while-editing' | 'unless-editing' | 'always')
};


export default class QueryInput extends PureComponent<Props, void> {
  static defaultProps = {
    onFocus: () => {},
    onBlur: () => {},
    clearButtonMode: 'while-editing'
  }

  render() {
    const {input, clearButtonMode, onFocus, onBlur} = this.props;

    return (
      <View style={styles.placeHolder}>
        <View
          style={styles.inputWrapper}
        >
          <IconMagnify style={styles.searchIcon} size={22} color={COLOR_PLACEHOLDER}/>

          <TextInput
            testID="query-assist-input"
            style={styles.searchInput}

            placeholderTextColor={COLOR_PLACEHOLDER}
            placeholder="Enter search request"

            clearButtonMode={clearButtonMode}
            returnKeyType="search"
            autoCorrect={false}
            underlineColorAndroid="transparent"
            autoCapitalize="none"

            onFocus={onFocus}
            onBlur={onBlur}

            value={input}
          />

        </View>
      </View>
    );
  }
}
