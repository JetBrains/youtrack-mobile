/* @flow */
import * as types from '../actions/action-types';
import {createReducer} from 'redux-create-reducer';
import IssuePermissions from '../components/issue-permissions/issue-permissions';
import type Auth, {CurrentUser} from '../components/auth/auth';
import type {Permissions} from '../components/auth/auth__permissions';
import type {StorageState} from '../components/storage/storage';
import type {EndUserAgreement} from '../flow/AppConfig';
import type {WorkTimeSettings} from '../flow/WorkTimeSettings';
import type {User, UserAppearanceProfile} from '../flow/User';

declare type RootState = {
  auth: ?Auth,
  showMenu: boolean,
  showDebugView: boolean,
  showScanner: boolean,
  showUserAgreement: boolean,
  endUserAgreement: ?EndUserAgreement,
  otherAccounts: ?Array<StorageState>,
  isChangingAccount: boolean,
  features: Array<string>,
  workTimeSettings: ?WorkTimeSettings,
  user?: User,
};

const initialState: RootState = {
  auth: null,
  showMenu: false,
  showDebugView: false,
  showFeaturesView: false,
  showScanner: false,
  showUserAgreement: false,
  endUserAgreement: null,
  otherAccounts: null,
  isChangingAccount: false,
  features: [],
  workTimeSettings: {},
  user: null,
};

export default createReducer(initialState, {
  [types.INITIALIZE_AUTH](state: RootState, action: {auth: Auth}) {
    const {auth} = action;
    return {...state, auth};
  },
  [types.SET_PERMISSIONS](state: RootState, action: {permissions: Permissions, currentUser: CurrentUser}) {
    const {permissions, currentUser} = action;
    return {
      ...state,
      issuePermissions: new IssuePermissions(permissions, currentUser)
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
  [types.OPEN_FEATURES_VIEW](state: RootState) {
    return {
      ...state,
      showFeaturesView: true
    };
  },
  [types.CLOSE_FEATURES_VIEW](state: RootState) {
    return {
      ...state,
      showFeaturesView: false
    };
  },
  [types.OPEN_SCAN_VIEW](state: RootState) {
    return {
      ...state,
      showScanner: true
    };
  },
  [types.CLOSE_SCAN_VIEW](state: RootState) {
    return {
      ...state,
      showScanner: false
    };
  },
  [types.SET_FEATURES](state: RootState, action: {features: EndUserAgreement}) {
    return {
      ...state,
      features: action.features
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
  },
  [types.BEGIN_ACCOUNT_CHANGE](state: RootState, action: {otherAccounts: Array<StorageState>}) {
    return {...state, isChangingAccount: true};
  },
  [types.END_ACCOUNT_CHANGE](state: RootState, action: {otherAccounts: Array<StorageState>}) {
    return {...state, isChangingAccount: false};
  },
  [types.RECEIVE_WORK_TIME_SETTINGS](state: RootState, action: {workTimeSettings: WorkTimeSettings}) {
    return {...state, workTimeSettings: action.workTimeSettings};
  },
  [types.RECEIVE_USER](state: RootState, action: {user: User}) {
    return {
      ...state,
      ...{user: action.user}
    };
  },
  [types.RECEIVE_USER_APPEARANCE_PROFILE](state: RootState, action: {appearance: UserAppearanceProfile}) {
    const {user} = state;
    const _user = user || {profiles: {}};
    const updatedProfiles = Object.assign({}, _user.profiles || {}, {appearance: action.appearance});
    const updatedUser = {...state.user, ...{profiles: updatedProfiles}};
    return {
      ...state,
      ...{user: updatedUser}
    };
  }
});

export function getIsAuthorized(state: RootState) {
  return !!state.auth?.currentUser;
}
