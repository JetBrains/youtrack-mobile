/* @flow */

import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {View} from 'react-native-animatable';

import {IconPaperClip} from '../icon/icon';

import styles from './attachment-add-panel.styles';

import type {UITheme} from '../../flow/Theme';

type Props = {
  isDisabled: boolean,
  showAddAttachDialog: () => any,
  uiTheme: UITheme
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
          size={24}
          color={props.isDisabled ? props.uiTheme.colors.$textSecondary : props.uiTheme.colors.$link}
        />
        <Text
          style={[
            styles.attachButtonText,
            props.isDisabled ? {color: props.uiTheme.colors.$textSecondary} : null
          ]}>
          Add Attachment
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttachmentAddPanel;

