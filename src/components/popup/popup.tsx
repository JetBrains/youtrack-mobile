import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import ModalView from 'components/modal-view/modal-view';
import {HIT_SLOP} from 'components/common-styles/button';
import {i18n} from 'components/i18n/i18n';

import styles from './popup.styles';

export default function Popup({
  childrenRenderer,
  onHide,
  noButton,
}: {
  childrenRenderer: () => React.ReactNode;
  onHide: () => void;
  noButton?: boolean;
}) {
  return (
    <ModalView testID="popup" transparent animationType="fade" style={styles.modal} onRequestClose={onHide}>
      <View testID="popupContentChildren">{childrenRenderer()}</View>

      {!noButton && (
        <View style={styles.buttons}>
          <TouchableOpacity hitSlop={HIT_SLOP} onPress={onHide} style={styles.button}>
            <Text style={styles.buttonText}>{i18n('Close')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ModalView>
  );
}
