/* @flow */
import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {UNIT, COLOR_FONT_GRAY, COLOR_FONT, COLOR_PINK} from '../variables/variables';
import {extractErrorMessage} from '../notification/notification';

type Props = {
  error: Error,
  onTryAgain: Function
};

export default function IssueError({error, onTryAgain}: Props) {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.listMessageSmile}>{'(>_<)'}</Text>
      <Text style={styles.errorTitle} testID="error-message">Failed to load</Text>
      <Text style={styles.errorContent}>{extractErrorMessage(error)}</Text>
      <TouchableOpacity style={styles.tryAgainButton} onPress={onTryAgain}>
        <Text style={styles.tryAgainText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1
  },
  errorTitle: {
    marginTop: UNIT*2,
    fontSize: 16,
    textAlign: 'center'
  },
  errorContent: {
    margin: UNIT,
    marginTop: UNIT/4,
    color: COLOR_FONT_GRAY,
    fontSize: 14,
    textAlign: 'center'
  },
  tryAgainButton: {
    alignSelf: 'center',
    paddingTop: UNIT*2
  },
  tryAgainText: {
    fontSize: 18,
    color: COLOR_PINK
  },
  listMessageSmile: {
    paddingTop: UNIT * 6,
    fontSize: 36,
    color: COLOR_FONT,
    textAlign: 'center'
  }
});
