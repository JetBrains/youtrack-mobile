import React, {useCallback, useMemo, useRef} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetHandle,
  BottomSheetHandleProps,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import {Portal} from 'react-native-portalize';
import styles from './modal-panel-bottom.style';
interface HeaderHandleProps extends BottomSheetHandleProps {
  children?: string | React.ReactNode | Array<React.ReactNode>;
}
export const Backdrop = (props: {
  children: any;
  title: React.ReactElement<React.ComponentProps<any>, any>;
  onDismiss?: () => any;
}) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => [350], []);
  const handlePresentPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);
  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} pressBehavior={'close'} />;
  }, []);
  const renderHeaderHandle = useCallback(
    ({children, ...rest}: HeaderHandleProps) => {
      return (
        <BottomSheetHandle
          style={styles.container}
          indicatorStyle={styles.indicator}
          {...rest}
        >
          {typeof children === 'string' ? <Text>{children}</Text> : children}
        </BottomSheetHandle>
      );
    },
    [],
  );
  return (
    <>
      <TouchableOpacity onPress={handlePresentPress}>
        {props.title}
      </TouchableOpacity>
      <Portal>
        <BottomSheetModalProvider>
          <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            enablePanDownToClose={true}
            onDismiss={props?.onDismiss}
            handleComponent={renderHeaderHandle}
            backdropComponent={renderBackdrop}
          >
            {props.children}
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </Portal>
    </>
  );
};
export default Backdrop;
