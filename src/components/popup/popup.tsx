import React, {PureComponent} from 'react';
import ModalView from '../modal-view/modal-view';
import {HIT_SLOP} from '../common-styles/button';
import {i18n} from 'components/i18n/i18n';
import {View, Text, TouchableOpacity} from 'react-native';
import styles from './popup.styles';
import type {Node} from 'react';
type Props = {
  childrenRenderer: () => any;
  onHide: () => any;
};
export default class Popup extends PureComponent<Props, void> {
  render(): Node {
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
            <View testID="popupContentChildren">{childrenRenderer()}</View>

            <View style={styles.buttons}>
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                onPress={onHide}
                style={styles.button}
              >
                <Text style={styles.buttonText}>{i18n('Close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ModalView>
    );
  }
}