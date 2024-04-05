import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import {IconAngleRight} from 'components/icon/icon';

import styles from './form.style';

import {ViewStyleProp} from 'types/Internal';

const FormSelectButton = ({
  label,
  onPress,
  style,
  testID,
  value,
}: {
  label?: string;
  onPress: () => unknown;
  style?: ViewStyleProp;
  testID?: string;
  value?: string;
}) => {
  return (
    <TouchableOpacity
      style={[styles.feedbackFormInput, styles.feedbackFormType, style]}
      onPress={onPress}
    >
      {!!label && <Text style={styles.feedbackFormTextSup}>{label}</Text>}
      <Text testID={testID} style={[styles.feedbackFormText, label && styles.feedbackFormTextMain]}>
        {value}
      </Text>
      <IconAngleRight size={20} color={styles.icon.color} />
    </TouchableOpacity>
  );
};

export default React.memo(FormSelectButton);
