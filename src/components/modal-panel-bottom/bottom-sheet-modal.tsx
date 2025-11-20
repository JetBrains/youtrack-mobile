import React, {useCallback, useEffect, useRef} from 'react';

import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';

import styles from './bottom-sheet.style';

import type {ViewStyleProp} from 'types/Internal';

interface Props extends React.PropsWithChildren {
  height?: number;
  adjustToHeight?: boolean;
  modalTopOffset?: number;
  header?: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  snapPoint?: number;
  withHandle?: boolean;
  style?: ViewStyleProp;
}

const SheetModal = (props: Props): React.JSX.Element => {
  const {snapPoint = 16, withHandle = false, adjustToHeight = typeof props?.height !== 'number'} = props;
  const ref: React.MutableRefObject<Modalize | null> = useRef<Modalize | null>(null);
  const isVisibleRef = useRef<boolean>(props.isVisible);

  useEffect(() => {
    isVisibleRef.current = props.isVisible;
  }, [props.isVisible]);

  const setRef = useCallback((modalizeInstance: Modalize | null) => {
    ref.current = modalizeInstance;
    if (modalizeInstance && isVisibleRef.current) {
      requestAnimationFrame(() => modalizeInstance.open());
    }
  }, []);

  useEffect(() => {
    if (props.isVisible) {
      if (ref.current) {
        ref.current.open();
      }
    } else {
      if (ref.current) {
        ref.current.close();
      }
    }
  }, [props.isVisible]);

  return (
    <Portal style={styles.container}>
      <Modalize
        adjustToContentHeight={adjustToHeight}
        modalHeight={props?.height}
        modalStyle={styles.modal}
        modalTopOffset={props.modalTopOffset}
        childrenStyle={[styles.content, props.style]}
        ref={setRef}
        withHandle={withHandle}
        snapPoint={snapPoint}
        onClose={props.onClose}
        HeaderComponent={props.header}
      >
        {props.children}
      </Modalize>
    </Portal>
  );
};

export default React.memo<Props>(SheetModal);
