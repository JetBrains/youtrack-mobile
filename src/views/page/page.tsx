import React from 'react';
import {View} from 'react-native';
import styles from './page.style';
type Props = {
  children: any;
};
export default function (props: Props): React.ReactNode {
  return (
    <View style={styles.container} testID="page">
      {props.children}
    </View>
  );
}
