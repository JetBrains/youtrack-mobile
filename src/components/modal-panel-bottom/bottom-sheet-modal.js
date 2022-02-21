/* @flow */

import React, {useCallback} from 'react';
import {View, Text} from 'react-native';

import BottomSheet from 'reanimated-bottom-sheet';
import Modal from 'react-native-modal';
import {BottomSheetHandle} from '@gorhom/bottom-sheet';

import styles from './bottom-sheet.style';


interface Props {
  isVisible: boolean;
  onDismiss: () => void;
}

export default function SheetModal({isVisible, onDismiss, children, title}: Props): React.ElementType | null {
  const renderHeaderHandle = useCallback(
    () => {
      return <BottomSheetHandle
        style={styles.container}
        indicatorStyle={styles.indicator}
      >
        {typeof title === 'string' ? (
          <Text>{title}</Text>
        ) : (
          title
        )}
      </BottomSheetHandle>;
    },
    [title]
  );

  return (
    <Modal
      style={styles.modal}
      isVisible={isVisible}
      onDismiss={onDismiss}
      onBackdropPress={onDismiss}>
      <View
        style={styles.container}
        pointerEvents="box-none"
      >
        <BottomSheet
          initialSnap={0}
          snapPoints={[350, 0]}
          onCloseEnd={onDismiss}
          renderHeader={renderHeaderHandle}
          renderContent={() => (
            <View style={styles.content}>
              {children}
            </View>
          )}
        />
      </View>
    </Modal>
  );
}
