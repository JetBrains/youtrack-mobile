import React from 'react';

import {Modalize} from 'react-native-modalize';

import styles from '../modal-panel-bottom/bottom-sheet.style';

import {BottomSheetAPI, BottomSheetModalData} from 'components/bottom-sheet/index';

const DEFAULT_SNAP_POINT: number = 16;


const BottomSheetModal = React.forwardRef(function SheetModal(props: any, ref: React.ForwardedRef<unknown>): JSX.Element {
  const modalizeRef = React.useRef<Modalize | null>(null);

  const [modalData, updateModalData] = React.useState<BottomSheetModalData>({});

  const proto = React.useMemo(() => ({
      open: (data: BottomSheetModalData) => {
        if (data?.children) {
          updateModalData(data);
          modalizeRef?.current?.open();
        }
      },
      close: () => {
        updateModalData({});
        modalizeRef?.current?.close();

      },
    }),
    [modalizeRef]
  );

  React.useImperativeHandle(
    ref,
    (): BottomSheetAPI => ({
      openBottomSheet: proto.open,
      closeBottomSheet: proto.close,
    }),
  );

  const {
    header,
    height,
    onClose = () => {},
    snapPoint = DEFAULT_SNAP_POINT,
    withHandle = true,
  } = modalData;
  return (
    <Modalize
      adjustToContentHeight={typeof height !== 'number'}
      childrenStyle={styles.content}
      closeOnOverlayTap={true}
      closeSnapPointStraightEnabled={true}
      disableScrollIfPossible={true}
      HeaderComponent={header}
      modalHeight={height}
      modalStyle={styles.modal}
      onClose={onClose}
      panGestureComponentEnabled={false}
      ref={modalizeRef}
      snapPoint={snapPoint}
      useNativeDriver={true}
      withHandle={withHandle}

    >
      {modalData?.children}
    </Modalize>
  );
});

export default React.memo(BottomSheetModal);
