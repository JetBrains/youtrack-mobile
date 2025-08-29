import {useDispatch as reduxUseDispatch} from 'react-redux';

import type {ReduxThunkDispatch} from 'types/Redux';

export function useDispatch(): ReduxThunkDispatch {
  return reduxUseDispatch();
}
