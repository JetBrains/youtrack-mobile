import React from 'react';

import {BottomSheetAPI, BottomSheetModalData} from './index';


const bottomSheetContext: React.Context<BottomSheetAPI> = React.createContext<BottomSheetAPI>({
  openBottomSheet: (data: BottomSheetModalData) => {},
  closeBottomSheet: () => {},
});

const useBottomSheetContext = () => React.useContext(bottomSheetContext);

const {Provider, Consumer} = bottomSheetContext;

export {
  Provider,
  Consumer,
  useBottomSheetContext,
};
