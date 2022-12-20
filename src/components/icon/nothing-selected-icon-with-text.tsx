import React from 'react';
import {Text, View} from 'react-native';
import styles from 'components/common-styles/split-view';
import {
  ICON_PICTOGRAM_DEFAULT_SIZE,
  IconNothingSelected,
} from './icon-pictogram';
export default function NothingSelectedIconWithText({text}: {text: string}) {
  return (
    <View style={styles.splitViewMainEmpty}>
      {<IconNothingSelected size={ICON_PICTOGRAM_DEFAULT_SIZE} />}
      {!!text && <Text style={styles.splitViewMessage}>{text}</Text>}
    </View>
  );
}