import React from 'react';
import {TouchableOpacity, View} from 'react-native';

import {Portal} from 'react-native-portalize';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './modal.view.styles';

import type {ViewStyleProp} from 'types/Internal';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  fullscreen?: boolean;
  hasOverlay?: boolean;
  onHide: () => any;
  style?: ViewStyleProp;
  testID?: string;
}

const ModalPortal = (props: Props) => {
  const {hasOverlay = true, onHide = () => {}} = props;
  const {top, bottom} = useSafeAreaInsets();
  return (
    // @ts-ignore
    <Portal testID={props.testID}>
      {!!props.children && (
        <AnimatedView useNativeDriver animation="fadeIn" duration={400} style={[styles.container, {paddingTop: top, paddingBottom: bottom}, props.style]}>
          {hasOverlay && (
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.modalMask, props.fullscreen && styles.fullscreen]}
              onPress={onHide}
            />
          )}
          <View style={styles.modal}>
            <View style={[styles.modalContent, props.fullscreen && styles.fullscreen]}>
              {props.children}
            </View>
          </View>
        </AnimatedView>
      )}
    </Portal>
  );
};

export default ModalPortal;
