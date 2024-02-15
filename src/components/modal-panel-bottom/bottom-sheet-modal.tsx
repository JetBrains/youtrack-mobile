import React, {useEffect, useRef} from 'react';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import styles from './bottom-sheet.style';
type Props = {
  children: any;
  height?: number;
  adjustToHeight?: boolean;
  modalTopOffset?: number;
  header?: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  snapPoint?: number;
  withHandle?: boolean;
  style?: Record<string, any>;
};

const SheetModal = (props: Props): React.JSX.Element => {
  const {snapPoint = 16, withHandle = false, adjustToHeight = typeof props?.height !== 'number'} = props;
  const ref: React.MutableRefObject<Modalize | null> = useRef<Modalize | null>(null);

  useEffect(() => {
    if (props.isVisible) {
      ref.current?.open();
    } else {
      ref.current?.close();
    }
  }, [props.isVisible]);
  useEffect(() => {
    if (props.isVisible) {
      setTimeout(() => ref.current?.open());
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Portal style={styles.container}>
      <Modalize
        adjustToContentHeight={adjustToHeight}
        modalHeight={props?.height}
        modalStyle={styles.modal}
        modalTopOffset={props.modalTopOffset}
        childrenStyle={[styles.content, props.style]}
        ref={ref}
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
