import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {View} from 'react-native-animatable';

import {IconAttachment} from 'components/icon/icon';
import {i18n} from 'components/i18n/i18n';

import styles from './attachment-add-panel.styles';

import type {ViewStyleProp} from 'types/Internal';

interface Props {
  isDisabled?: boolean;
  showAddAttachDialog: () => any;
  style?: ViewStyleProp;
}

const AttachmentAddPanel = (props: Props) => {
  return (
    <View style={[styles.attachButtonsContainer, props.style]}>
      <TouchableOpacity
        testID="test:id/attachment-button"
        accessibilityLabel="attachment-button"
        accessible={true}
        disabled={props.isDisabled}
        style={styles.attachButton}
        onPress={props.showAddAttachDialog}
      >
        <IconAttachment
          color={
            props.isDisabled
              ? styles.attachButtonTextDisabled.color
              : styles.attachButtonText.color
          }
        />
        <Text
          style={[
            styles.attachButtonText,
            props.isDisabled ? styles.attachButtonTextDisabled : null,
          ]}
        >
          {i18n('Attach files')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AttachmentAddPanel;
