import {globalActionTypes as types} from '../actions/';
import {createReducer} from 'redux-create-reducer';
import type Api from '../../components/api/api';
import type Auth from '../../components/auth/auth';

type RootState = {
  api: ?Api,
  auth: ?Auth
};

const initialState: RootState = {
  api: null,
  auth: null
};

export default createReducer(initialState, {
  [types.INITIALIZE_API](state: RootState, action: Object = {}) {
    return {
      ...state,
      api: action.api,
      auth: action.auth
    };
  },
  [types.LOG_OUT](state: RootState, action: Object = {}) {
    if (state.auth) {
      state.auth.logOut();
    }
    return state;
  }
});
