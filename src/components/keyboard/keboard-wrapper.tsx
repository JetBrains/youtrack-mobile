import React from 'react';

import {KeyboardAvoidingView, Platform} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ViewStyleProp} from 'types/Internal';

interface Props extends React.PropsWithChildren {
  verticalOffset?: number;
  style?: ViewStyleProp;
  isInModal?: boolean;
}

const styles = {flex: 1} as const;

export const KeyboardWrapper = (props: Props) => {
  const {verticalOffset = 0, style, isInModal = false} = props;
  const insets = useSafeAreaInsets();
  const calculatedOffset = isInModal && Platform.OS === 'ios'
    ? verticalOffset + insets.top
    : verticalOffset;

  return (
    <KeyboardAvoidingView
      style={[styles, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled
      keyboardVerticalOffset={calculatedOffset}
    >
      {props.children}
    </KeyboardAvoidingView>
  );
};
