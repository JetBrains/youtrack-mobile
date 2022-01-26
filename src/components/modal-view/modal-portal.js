/* @flow */

import React from 'react';
import {TouchableOpacity, View} from 'react-native';

import {Portal} from 'react-native-portalize';

import modalStyles from './modal.view.styles';

import type {Node} from 'React';

type Props = {
  children: any,
  hasOverlay?: boolean,
  onHide: () => any,
  fullscreen?: boolean,
}

const ModalPortal = (props: Props): Node => {
  const {children, hasOverlay = true, onHide = () => {}, fullscreen} = props;

  return <Portal>
    {children && <>
      {hasOverlay && (
        <TouchableOpacity
          activeOpacity={1}
          style={modalStyles.modalMask}
          onPress={onHide}/>
      )}
      <View style={[modalStyles.modal, fullscreen && modalStyles.modalFullscreen]}>
        <View style={[modalStyles.modalContent, fullscreen && modalStyles.modalContentFullscreen]}>
          {children}
        </View>
      </View>
    </>}
  </Portal>;
};

export default ModalPortal;
