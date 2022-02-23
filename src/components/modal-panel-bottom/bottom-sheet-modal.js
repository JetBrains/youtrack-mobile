/* @flow */

import React, {useEffect, useRef} from 'react';

import {Portal} from 'react-native-portalize';
import { Modalize } from 'react-native-modalize';

import styles from './bottom-sheet.style';


interface Props {
  children: any;
  height?: number;
  header?: any;
  isVisible: boolean;
  onClose: () => void;
  snapPoint?: number;
}

const SheetModal = (props: Props): React$Element<typeof Portal> | null => {
  const ref: typeof Modalize = useRef(null);

  useEffect(() => {
    if (props.isVisible) {
      ref.current?.open();
    } else {
      ref.current?.close();
    }
  }, [props.isVisible]);

  return (
    <Portal style={styles.container}>
      <Modalize
        modalHeight={props?.height}
        modalStyle={styles.modal}
        childrenStyle={[styles.container, styles.content]}
        ref={ref}
        withHandle={true}
        snapPoint={props?.snapPoint}
        onClose={props.onClose}
        HeaderComponent={() => props.header}
      >
        {props.children}
      </Modalize>
    </Portal>
  );
};

export default React.memo<Props>(SheetModal);
