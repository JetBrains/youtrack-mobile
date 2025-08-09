import * as React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import styles from './tip.styles';

import {IconClose} from 'components/icon/icon';

import type {ViewStyleProp} from 'types/Internal';

const Tip = ({
  text,
  icon,
  onClose,
  style,
}: {
  text: string;
  icon: React.ReactNode;
  onClose: () => void;
  style?: ViewStyleProp;
}) => {
  return (
    <View style={[styles.tip, style]}>
      {icon}
      <Text style={styles.tipText}>{text}</Text>
      <TouchableOpacity style={styles.tipCloseButton} onPress={onClose}>
        <IconClose size={20} color={styles.tipIcon.color} />
      </TouchableOpacity>
    </View>
  );
};

export default Tip;
