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
}

const ModalPortal = (props: Props): Node => {
  const {children, hasOverlay = true, onHide = () => {}} = props;

  return <Portal>
    {children && <>
      {hasOverlay && (
        <TouchableOpacity
          activeOpacity={1}
          style={modalStyles.modalMask}
          onPress={onHide}/>
      )}
      <View style={modalStyles.modal}>
        <View style={modalStyles.modalContent}>
          {children}
        </View>
      </View>
    </>}
  </Portal>;
};

export default ModalPortal;
