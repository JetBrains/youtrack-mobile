/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, Linking, StyleSheet} from 'react-native';

import {COLOR_LINK, UNIT} from '../variables/variables';

type Props = {
  error?: ?string,
  tips?: string,
  showSupportLink?: boolean
};


export default class ErrorMessageInline extends PureComponent<Props, void> {
  render() {
    const {error, tips, showSupportLink} = this.props;
    if (!error) {
      return null;
    }
    return (
      <View
        testID="errorMessageInline"
        style={styles.error}>
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
            Contact support
          </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  error: {
    marginTop: UNIT,
    marginBottom: UNIT * 2
  },
  errorText: {
    marginBottom: UNIT,
    color: 'red'
  },
  link: {
    color: COLOR_LINK
  }
});
