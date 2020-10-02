/* @flow */

import {Text, View} from 'react-native';
import React, {PureComponent} from 'react';

import {IconSearch} from '../icon/icon';
import {iconClearText} from '../icon/icon-clear-text';

import {ThemeContext} from '../theme/theme-context';

import styles from './query-assist.styles';

import type {Theme} from '../../flow/Theme';

type Props = {
  query: string,
  onFocus: (clear?: boolean) => void,
  onClearText: () => void
};


export default class SearchQueryPreview extends PureComponent<Props, void> {
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
    const {query} = this.props;

    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => (
          <View style={styles.placeHolder}>
            <View style={styles.inputWrapper}>
              <IconSearch style={styles.searchIcon} size={20} color={theme.uiTheme.colors.$icon}/>

              <Text
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

              {!!query && iconClearText(this.focusAndClear, theme.uiTheme)}

            </View>
          </View>
        )}
      </ThemeContext.Consumer>
    );
  }
}

