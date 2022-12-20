import React from 'react';
import {Text, TouchableOpacity} from 'react-native';
import IconAttachment from '@jetbrains/icons/attachment.svg';
import {i18n} from 'components/i18n/i18n';
import {View} from 'react-native-animatable';
import styles from './attachment-add-panel.styles';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
type Props = {
  isDisabled?: boolean;
  showAddAttachDialog: () => any;
  style?: ViewStyleProp;
};

const AttachmentAddPanel = (props: Props): React.ReactNode => {
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
          width={23}
          height={23}
          fill={
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
