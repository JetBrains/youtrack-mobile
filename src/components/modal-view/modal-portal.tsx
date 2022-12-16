/* @flow */

import React from 'react';
import {TouchableOpacity, View} from 'react-native';

import {Portal} from 'react-native-portalize';

import modalStyles from './modal.view.styles';

import type {Node} from 'react';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  children: any,
  fullscreen?: boolean,
  hasOverlay?: boolean,
  onHide: () => any,
  style?: ViewStyleProp,
}

const ModalPortal = (props: Props): Node => {
  const {hasOverlay = true, onHide = () => {}} = props;

  return <Portal>
    {!!props.children && <View style={modalStyles.container}>
      {hasOverlay && (
        <TouchableOpacity
          activeOpacity={1}
          style={modalStyles.modalMask}
          onPress={onHide}/>
      )}
      <View style={[modalStyles.modal, props.fullscreen && modalStyles.modalFullscreen]}>
        <View style={[modalStyles.modalContent, props.fullscreen && modalStyles.modalContentFullscreen, props.style]}>
          {props.children}
        </View>
      </View>
    </View>}
  </Portal>;
};

export const ModalPortalPart = ({
  children,
  isVisible,
  style,
}: {
  children: any,
  isVisible: boolean,
  style?: ViewStyleProp,
}): Node => {
  return <Portal>
    {!!children && isVisible && (
      <View style={style}>
        {children}
      </View>
    )}
  </Portal>;
};


export default ModalPortal;
