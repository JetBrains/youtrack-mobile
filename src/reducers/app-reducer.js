/* @flow */
import * as types from '../actions/action-types';
import {createReducer} from 'redux-create-reducer';
import IssuePermissions from '../components/issue-permissions/issue-permissions';
import type Auth from '../components/auth/auth';
import type {StorageState} from '../components/storage/storage';
import type {EndUserAgreement} from '../flow/AppConfig';

declare type RootState = {
  auth: ?Auth,
  showMenu: boolean,
  showDebugView: boolean,
  showUserAgreement: boolean,
  endUserAgreement: ?EndUserAgreement,
  otherAccounts: ?Array<StorageState>
};

const initialState: RootState = {
  auth: null,
  showMenu: false,
  showDebugView: false,
  showUserAgreement: false,
  endUserAgreement: null,
  otherAccounts: null
};

export default createReducer(initialState, {
  [types.INITIALIZE_AUTH](state: RootState, action: {auth: Auth}) {
    const {auth} = action;
    return {...state, auth};
  },
  [types.SET_PERMISSIONS](state: RootState, action: {auth: Auth}) {
    const {auth} = action;
    return {
      ...state,
      issuePermissions: new IssuePermissions(auth.permissions, auth.currentUser)
    };
  },
  [types.LOG_OUT](state: RootState, action: Object = {}) {
    return {...state, auth: null};
  },
  [types.OPEN_MENU](state: RootState) {
    return {
      ...state,
      showMenu: true
    };
  },
  [types.CLOSE_MENU](state: RootState) {
    return {
      ...state,
      showMenu: false
    };
  },
  [types.OPEN_DEBUG_VIEW](state: RootState) {
    return {
      ...state,
      showDebugView: true
    };
  },
  [types.CLOSE_DEBUG_VIEW](state: RootState) {
    return {
      ...state,
      showDebugView: false
    };
  },
  [types.SHOW_USER_AGREEMENT](state: RootState, action: {agreement: EndUserAgreement}) {
    return {
      ...state,
      showUserAgreement: true,
      endUserAgreement: action.agreement
    };
  },
  [types.HIDE_USER_AGREEMENT](state: RootState) {
    return {
      ...state,
      showUserAgreement: false,
      endUserAgreement: null
    };
  },
  [types.RECEIVE_OTHER_ACCOUNTS](state: RootState, action: {otherAccounts: Array<StorageState>}) {
    return {...state, otherAccounts: action.otherAccounts};
  }
});
