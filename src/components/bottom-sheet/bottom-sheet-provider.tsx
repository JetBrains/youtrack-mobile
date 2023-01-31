import React from 'react';

import {Provider} from './bottom-sheet-context';
import {BottomSheetAPI, BottomSheetModalData, BottomSheetModal} from 'components/bottom-sheet/index';


const BSProvider = ({children}: { children: React.ReactNode }, ref: React.ForwardedRef<unknown>) => {
  const bottomSheetRef = React.useRef<((typeof BottomSheetModal) & BottomSheetAPI) | null>(null);

  const context: BottomSheetAPI = React.useMemo(
    () => ({
      openBottomSheet: (data: BottomSheetModalData) => {
        bottomSheetRef?.current?.openBottomSheet?.(data);
      },
      closeBottomSheet: () => {
        bottomSheetRef?.current?.closeBottomSheet?.();
      },
    }),
    [bottomSheetRef]
  );

  React.useImperativeHandle(
    ref,
    () => ({
      openBottomSheet: context.openBottomSheet,
      closeBottomSheet: context.closeBottomSheet,
    }),
    [context]
  );

  return (
    <Provider value={context}>
      {React.Children.only(children)}
      <BottomSheetModal ref={bottomSheetRef}/>
    </Provider>
  );
};
export default React.forwardRef(BSProvider);
