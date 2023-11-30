import Api from 'components/api/api';
import {AppState} from 'reducers';
import {ThunkDispatch, ThunkAction} from 'redux-thunk';

export type ReduxAPIGetter = () => Api;

export type ReduxStateGetter = () => AppState;

export type ReduxThunkDispatch = ThunkDispatch<AppState, ReduxAPIGetter, any>;

export type ReduxAction<T = void> = ThunkAction<T, AppState, ReduxAPIGetter, any>;
