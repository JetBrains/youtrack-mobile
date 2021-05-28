/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {IconPaperClip} from '../icon/icon';
import {View} from 'react-native-animatable';

import styles from './attachment-add-panel.styles';

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  isDisabled?: boolean,
  showAddAttachDialog: () => any,
  style?: ViewStyleProp,
}


const AttachmentAddPanel = (props: Props) => {
  return (
    <View style={[styles.attachButtonsContainer, props.style]}>
      <TouchableOpacity
        testID="createIssueAttachmentButton"
        disabled={props.isDisabled}
        style={styles.attachButton}
        onPress={props.showAddAttachDialog}
      >
        <IconPaperClip
          style={styles.attachButtonIcon}
          size={20}
          color={props.isDisabled ? styles.attachButtonTextDisabled.color : styles.attachButtonText.color}
        />
        <Text
          style={[
            styles.attachButtonText,
            props.isDisabled ? styles.attachButtonTextDisabled : null
          ]}>
          Add attachment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttachmentAddPanel;

