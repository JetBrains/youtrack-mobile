/* @flow */

import React from 'react';
import {Modal, View} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import ModalView from './modal-view';
import {ThemeContext} from '../theme/theme-context';

import styles from './modal.view.styles';

import type {Node} from 'React';
import type {Theme} from '../../flow/Theme';


export default class ModalViewDimmed extends ModalView {

  render(): Node {
    return (
      <ThemeContext.Consumer>
        {(theme: Theme) => {
          return (
            <Modal
              hardwareAccelerated={true}
              visible={true}
              testID={this.props.testID || 'modalViewDimmed'}
              transparent={true}
              animationType="none"
              supportedOrientations={this.props.supportedOrientations}
              onRequestClose={this.props.onRequestClose}
            >
              <SafeAreaView style={[
                styles.box,
                styles.container,
              ]}>
                <View style={styles.content}>
                  <View style={styles.children}>
                    {this.props.children}
                  </View>
                </View>
              </SafeAreaView>
            </Modal>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
}
