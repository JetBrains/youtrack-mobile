/* @flow */

import React, {PureComponent} from 'react';
import {Modal, View} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import {ThemeContext} from '../theme/theme-context';

import type {ModalOrientation, ModalAnimationType} from '../../flow/ModalView';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

import {Orientation, AnimationType} from '../../flow/ModalView';

import styles from './modal.view.styles';

import type {Node} from 'React';
import type {Theme} from '../../flow/Theme';


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
  children: any,
  testID?: string,
}

export default class ModalView extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onRequestClose: () => {},
    supportedOrientations: [
      Orientation.PORTRAIT,
      Orientation.LANDSCAPE,
    ],
    animationType: AnimationType.NONE,
  };

  render(): Node {
    const {
      visible,
      transparent,
      animationType,
      supportedOrientations,
      onRequestClose,
      children,
      style = {},
      testID = 'modalView',
    } = this.props;


    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <Modal
              testID={testID}
              visible={visible}
              transparent={transparent}
              animationType={animationType}
              supportedOrientations={supportedOrientations}
              onRequestClose={onRequestClose}
            >
              <SafeAreaView style={[
                styles.box,
                transparent === true ? null : {backgroundColor: theme.uiTheme.colors.$background},
              ]}>
                <View style={[styles.box, style]}>
                  {children}
                </View>
              </SafeAreaView>
            </Modal>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}
