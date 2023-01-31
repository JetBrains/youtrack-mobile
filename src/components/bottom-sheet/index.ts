import React from 'react';

export {default as BottomSheetModal} from './bottom-sheet-modal';
export {default as BottomSheetProvider} from './bottom-sheet-provider';
export {useBottomSheetContext} from './bottom-sheet-context';

export interface BottomSheetAPI {
  openBottomSheet: (data: BottomSheetModalData) => void;
  closeBottomSheet: () => void;
}

export interface BottomSheetModalData {
  children?: React.ReactNode,
  height?: number;
  header?: React.ReactNode;
  onClose?: () => any;
  snapPoint?: number;
  withHandle?: boolean;
}
