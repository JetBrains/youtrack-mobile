import Api from 'components/api/api';
import {AppState} from 'reducers';


export type ReduxActionDispatcher = (...args: any[]) => any;
export type ReduxStateGetter = () => AppState;
export type ReduxAPIGetter = () => Api;

export type ReduxAction<T = void> = (
  dispatch: ReduxActionDispatcher,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter
) => Promise<T>;
