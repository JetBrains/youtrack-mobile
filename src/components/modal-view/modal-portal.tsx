import React from 'react';
import {TouchableOpacity, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Portal} from 'react-native-portalize';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './modal.view.styles';

import type {ViewStyleProp} from 'types/Internal';

interface Props {
  children: React.ReactNode;
  fullscreen?: boolean;
  popup?: boolean;
  hasOverlay?: boolean;
  onHide: () => any;
  style?: ViewStyleProp;
  testID?: string;
}

const ModalPortal = (props: Props) => {
  const {hasOverlay = true, onHide = () => {}} = props;
  const {top, bottom} = useSafeAreaInsets();
  return props.children ? (
    // @ts-ignore
    <Portal testID={props.testID}>
      <AnimatedView
        useNativeDriver
        animation="fadeIn"
        duration={400}
        style={[styles.container, {paddingTop: top, paddingBottom: bottom}, props.style]}
      >
        {hasOverlay && (
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalMask, props.fullscreen && styles.fullscreen]}
            onPress={onHide}
          />
        )}
        <View style={styles.modal}>
          <View style={[styles.modalContent, props.popup && styles.modalPopup, props.fullscreen && styles.fullscreen]}>
            {props.children}
          </View>
        </View>
      </AnimatedView>
    </Portal>
  ) : null;
};

export default React.memo(ModalPortal);
