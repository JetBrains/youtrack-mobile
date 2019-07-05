/* @flow */

import React, {PureComponent} from 'react';
import {Modal, StyleSheet, View} from 'react-native';
import SafeAreaView from 'react-native-safe-area-view';

import type {ModalOrientation, ModalAnimationType} from '../../flow/ModalView';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

import {Orientation, AnimationType} from '../../flow/ModalView';
import {COLOR_BLACK} from '../variables/variables';


type DefaultProps = {
  onRequestClose: () => any,
  supportedOrientations: Array<ModalOrientation>,
  animationType: ModalAnimationType
}

type Props = {
  visible?: boolean,
  transparent?: boolean,
  animationType?: ModalAnimationType,
  supportedOrientations?: Array<ModalOrientation>,
  onRequestClose?: () => any,
  style?: ?ViewStyleProp,
  children: any
}

export default class ModalView extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onRequestClose: () => {},
    supportedOrientations: [
      Orientation.PORTRAIT,
      Orientation.LANDSCAPE
    ],
    animationType: AnimationType.NONE
  };

  render() {
    const {visible, transparent, animationType, supportedOrientations, onRequestClose, children, style = {}} = this.props;


    return (
      <Modal
        testID="modalView"
        visible={visible}
        transparent={transparent}
        animationType={animationType}
        supportedOrientations={supportedOrientations}
        onRequestClose={onRequestClose}
      >
        <SafeAreaView style={[Styles.box, transparent === true ? {} : {backgroundColor: COLOR_BLACK}]}>
          <View style={[Styles.box, style]}>
            {children}
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}

const Styles = StyleSheet.create({
  box: {
    flex: 1
  }
});
