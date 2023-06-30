import {Text, TouchableWithoutFeedback, View} from 'react-native';
import React, {Component} from 'react';
import {i18n} from 'components/i18n/i18n';
import {IconSearch} from '../icon/icon';
import {iconClearText} from '../icon/icon-clear-text';
import styles from './query-assist.styles';
import type {ViewStyleProp} from 'types/Internal';
type Props = {
  query: string;
  onFocus?: (clear: boolean) => any;
  onClearText: () => void;
  style?: ViewStyleProp;
};
export default class QueryPreview extends Component<Props, void> {
  static defaultProps: {
    onClearText: () => void;
    onFocus: () => void;
  } = {
    onFocus: () => {},
    onClearText: () => {},
  };

  componentDidUpdate(prevProps: Props): boolean {
    return prevProps.query !== this.props.query;
  }

  focusAndClear: () => void = () => {
    if (this.props.onFocus) {
      this.props.onFocus(true);
    }
  };
  focus: () => void = () => {
    if (this.props.onFocus) {
      this.props.onFocus(false);
    }
  };

  render(): React.ReactNode {
    const {query, style} = this.props;
    return (
      <View style={[styles.placeHolder, style]}>
        <View style={styles.inputWrapper}>
          <TouchableWithoutFeedback onPress={this.focus}>
            <IconSearch
              style={styles.searchIcon}
              size={20}
              color={styles.clearIcon.color}
            />
          </TouchableWithoutFeedback>

          <Text
            numberOfLines={1}
            onPress={this.focus}
            accessible={true}
            testID="test:id/query-assist-input"
            style={[
              styles.searchInput,
              styles.searchInputPlaceholder,
              query ? styles.searchInputHasText : null,
            ]}
          >
            {query ? query : i18n('Enter search request')}
          </Text>

          {!!query && iconClearText(this.focusAndClear, styles.clearIcon.color)}
        </View>
      </View>
    );
  }
}
