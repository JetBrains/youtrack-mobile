import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {HIT_SLOP} from '../common-styles/button';
import styles from './menu.styles';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
type Props = {
  disabled?: boolean;
  icon: React.ReactElement<React.ComponentProps<any>, any>;
  onPress: () => any;
  style?: ViewStyleProp;
  testID?: string;
};
export const MenuItem = (props: Props): React.ReactNode => {
  const {icon, onPress, style, testID, disabled = false} = props;
  return disabled ? null : (
    <View style={[styles.menuItem, style]}>
      <TouchableOpacity
        testID={testID}
        style={[styles.menuItemButton, style]}
        accessible={true}
        hitSlop={HIT_SLOP}
        onPress={onPress}
      >
        {icon}
      </TouchableOpacity>
    </View>
  );
};
