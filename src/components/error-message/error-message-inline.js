/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, Linking} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {i18n} from '../i18n/i18n';
import {UNIT} from '../variables/variables';

import type {Node} from 'React';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  error?: ?string,
  tips?: string,
  showSupportLink?: boolean,
  style?: ViewStyleProp,
};


const styles = EStyleSheet.create({
  error: {
    marginTop: UNIT,
    marginBottom: UNIT * 2,
  },
  errorText: {
    marginBottom: UNIT,
    color: '$error',
  },
  link: {
    color: '$link',
  },
});

export default class ErrorMessageInline extends PureComponent<Props, void> {
  render(): null | Node {
    const {error, tips, showSupportLink, style} = this.props;
    if (!error) {
      return null;
    }
    return (
      <View
        testID="errorMessageInline"
        style={[styles.error, style]}>
        <Text
          style={styles.errorText}
          selectable={true}
          testID="errorMessageInlineError">
          {error}
        </Text>
        {Boolean(tips) && (
          <Text
            testID="errorMessageInlineTip"
            style={styles.errorText}
            selectable={true}
          >
            {tips}
          </Text>
        )}
        {showSupportLink && (
          <Text
            testID="errorMessageInlineSupportLink"
            onPress={() => Linking.openURL('https://youtrack-support.jetbrains.com/hc/en-us/requests/new')}
            style={[styles.error, styles.link]}>
            {i18n('Contact support')}
          </Text>
        )}
      </View>
    );
  }
}
