/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {View} from 'react-native-animatable';

import {IconPaperClip} from '../icon/icon';

import styles from './attachment-add-panel.styles';

type Props = {
  isDisabled?: boolean,
  showAddAttachDialog: () => any
}


const AttachmentAddPanel = (props: Props) => {
  return (
    <View style={styles.attachButtonsContainer}>
      <TouchableOpacity
        testID="createIssueAttachmentButton"
        disabled={props.isDisabled}
        style={styles.attachButton}
        onPress={props.showAddAttachDialog}
      >
        <IconPaperClip
          style={styles.attachButtonIcon}
          size={18}
          color={props.isDisabled ? styles.attachButtonTextDisabled.color : styles.attachButtonText.color}
        />
        <Text
          style={[
            styles.attachButtonText,
            props.isDisabled ? styles.attachButtonTextDisabled : null
          ]}>
          Add Attachment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttachmentAddPanel;

