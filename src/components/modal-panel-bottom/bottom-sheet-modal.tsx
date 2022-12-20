import React, {useEffect, useRef} from 'react';
import {Portal} from 'react-native-portalize';
import {Modalize} from 'react-native-modalize';
import styles from './bottom-sheet.style';
type Props = {
  children: any;
  height?: number;
  header?: any;
  isVisible: boolean;
  onClose: () => void;
  snapPoint?: number;
  withHandle?: boolean;
};

const SheetModal = (
  props: Props,
): React.ReactElement<
  React.ComponentProps<typeof Portal>,
  typeof Portal
> | null => {
  const {snapPoint = 16, withHandle = false} = props;
  const ref: typeof Modalize = useRef(null);
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
        adjustToContentHeight={typeof props?.height !== 'number'}
        modalHeight={props?.height}
        modalStyle={styles.modal}
        childrenStyle={styles.content}
        ref={ref}
        withHandle={withHandle}
        snapPoint={snapPoint}
        onClose={props.onClose}
        HeaderComponent={() => props.header}
      >
        {props.children}
      </Modalize>
    </Portal>
  );
};

export default React.memo<Props>(SheetModal);