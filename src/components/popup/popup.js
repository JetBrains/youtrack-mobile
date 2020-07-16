/* @flow */

import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import ModalView from '../modal-view/modal-view';
import {HIT_SLOP} from '../common-styles/button';

import styles from './popup.styles';

type Props = {
  childrenRenderer: () => any,
  onHide: () => any
};

export default class Popup extends PureComponent<Props, void> {

  render() {
    const {onHide, childrenRenderer} = this.props;

    return (
      <ModalView
        testID="popup"
        transparent={true}
        animationType="fade"
        style={styles.modal}
      >
        <View style={styles.container}>

          <View style={styles.content}>
            <View testID="popupContentChildren">
              {childrenRenderer()}
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                onPress={onHide}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>

            </View>

          </View>
        </View>
      </ModalView>
    );
  }
}
