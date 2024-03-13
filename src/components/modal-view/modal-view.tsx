import React from 'react';
import {Modal, TouchableOpacity, View} from 'react-native';

import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

import styles from './modal.view.styles';

import type {ModalAnimationType, ModalOrientation} from 'types/ModalView';
import type {ViewStyleProp} from 'types/Internal';
import {AnimationType, Orientation} from 'types/ModalView';

interface Props {
  animationType?: ModalAnimationType;
  children: React.ReactNode;
  onRequestClose?: () => void;
  style?: ViewStyleProp | null;
  supportedOrientations?: ModalOrientation[];
  testID?: string;
  transparent?: boolean;
  visible?: boolean;
}

export default function ModalView(props: Props) {
  const {
    animationType = AnimationType.SLIDE,
    supportedOrientations = [Orientation.PORTRAIT, Orientation.LANDSCAPE],
    onRequestClose = () => {},
    transparent,
  } = props;
  const baseStyle: ViewStyleProp = {flex: 1};
  return (
    <View>
      <Modal
        animationType={animationType}
        onRequestClose={onRequestClose}
        supportedOrientations={supportedOrientations}
        testID={props.testID}
        transparent={transparent}
        visible={props.visible}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalMask} onPress={onRequestClose} />
        <SafeAreaProvider>
          <SafeAreaView
            style={[
              baseStyle,
              transparent === true
                ? null
                : {
                  backgroundColor: styles.modalContent.backgroundColor,
                },
            ]}
          >
            <View style={[styles.container, transparent && styles.containerPopup]}>
              <View
                style={[
                  styles.modalContent,
                  transparent && styles.modalPopup,
                  props.style,
                ]}
              >
                {props.children}
              </View>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}
