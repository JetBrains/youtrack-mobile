/* @flow */

import React from 'react';
import {View} from 'react-native';

import {ModalPortal} from 'react-native-modals';

import styles from './modal.view.styles';

export type SwipeDirection = 'up' | 'down' | 'left' | 'right'
type ModalProps = {
  visible?: boolean;
  children?: any;
  width?: number;
  height?: number;
  rounded?: boolean;
  hasOverlay?: boolean;
  overlayPointerEvents?: 'auto' | 'none';
  overlayBackgroundColor?: string;
  overlayOpacity?: number;
  modalTitle?: any;
  modalAnimation?: Object;
  modalStyle?: any;
  style?: any;
  animationDuration?: number;
  onTouchOutside?: () => void;
  onHardwareBackPress?: () => boolean;
  onShow?: () => void;
  onDismiss?: () => void;
  footer?: Node;
  onMove?: (event: DragEvent) => void,
  onSwiping?: (event :DragEvent) => void,
  onSwipeRelease?: (event: DragEvent) => void,
  onSwipingOut?: (event: DragEvent) => void,
  onSwipeOut?: (event: DragEvent) => void,
  swipeDirection?: SwipeDirection | Array<SwipeDirection>;
  swipeThreshold?: number;
  useNativeDriver?: boolean;
}

const modalsStack: Set<string> = new Set();


const modalUpdate = (id: string, children: any): string => {
  ModalPortal.update(id, children);
  return id;
};

const modalHide = (id: string) => {
  if (modalsStack.has(id)) {
    ModalPortal.dismiss(id);
    modalsStack.delete(id);
  }
};

const modalHideAll = () => {
  ModalPortal.dismissAll();
  modalsStack.clear();
};

const modalShow = (children: any, props?: ModalProps): string => {
  const id: string = ModalPortal.show(
    (
      <View style={styles.modalContent}>
        {children}
      </View>
    ),
    {
      ...props,
      modalStyle: styles.modal,
      containerStyle: styles.modalContainer,
      onTouchOutside: modalHideAll,
    }
  );
  modalsStack.add(id);
  return id;
};


export {
  modalShow,
  modalUpdate,
  modalHide,
  modalHideAll,
};
