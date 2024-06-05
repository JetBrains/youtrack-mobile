import * as types from 'actions/action-types';
import IssuePermissions from 'components/issue-permissions/issue-permissions';
import OAuth2 from 'components/auth/oauth2';
import {createReducer} from 'redux-create-reducer';
import {issuePermissionsNull} from 'components/issue-permissions/issue-permissions-helper';

import type Auth from 'components/auth/oauth2';
import type {DraftCommentData} from 'types/CustomFields';
import type {EndUserAgreement} from 'types/AppConfig';
import type {GlobalSettings} from 'types/GlobalSettings';
import type {InboxFolder} from 'types/Inbox';
import type {NetInfoState} from '@react-native-community/netinfo';
import type {PermissionsStore} from 'components/permissions-store/permissions-store';
import type {StorageState} from 'components/storage/storage';
import type {User, UserAppearanceProfile, UserArticlesProfile, UserHelpdeskProfile} from 'types/User';
import type {UserProject} from 'types/Project';
import type {WorkTimeSettings} from 'types/Work';


export type RootState = {
  auth: OAuth2 | null;
  showMenu: boolean;
  showDebugView: boolean;
  showUserAgreement: boolean;
  endUserAgreement: EndUserAgreement | null | undefined;
  otherAccounts: StorageState[] | null | undefined;
  isChangingAccount: boolean;
  features: string[];
  workTimeSettings: WorkTimeSettings | {};
  user: User | null;
  issuePermissions: IssuePermissions;
  networkState: Partial<NetInfoState> | null;
  inboxThreadsFolders: InboxFolder[];
  isInProgress?: boolean;
  draftCommentData: DraftCommentData;
  globalSettings: GlobalSettings;
  helpdeskMenuHidden: boolean;
  projects: UserProject[];
};

const initialState: RootState = {
  auth: null,
  showMenu: false,
  showDebugView: false,
  showUserAgreement: false,
  endUserAgreement: null,
  otherAccounts: null,
  isChangingAccount: false,
  features: [],
  workTimeSettings: {},
  user: null,
  issuePermissions: issuePermissionsNull,
  networkState: {
    isConnected: true,
  },
  inboxThreadsFolders: [],
  isInProgress: false,
  draftCommentData: {} as DraftCommentData,
  globalSettings: {} as GlobalSettings,
  helpdeskMenuHidden: false,
  projects: [],
};


export default createReducer(initialState, {
  [types.INITIALIZE_AUTH](
    state: RootState,
    action: {
      auth: Auth;
    },
  ) {
    const {auth} = action;
    return {...state, auth};
  },

  [types.SET_PERMISSIONS](
    state: RootState,
    action: {
      permissionsStore: PermissionsStore;
      currentUser: User;
    },
  ) {
    const {permissionsStore, currentUser} = action;
    return {
      ...state,
      issuePermissions: new IssuePermissions(permissionsStore, currentUser),
    };
  },

  [types.LOG_OUT](state: RootState, action: Record<string, any> = {}) {
    return {...state, auth: null};
  },

  [types.OPEN_MENU](state: RootState) {
    return {...state, showMenu: true};
  },

  [types.CLOSE_MENU](state: RootState) {
    return {...state, showMenu: false};
  },

  [types.OPEN_DEBUG_VIEW](state: RootState) {
    return {...state, showDebugView: true};
  },

  [types.CLOSE_DEBUG_VIEW](state: RootState) {
    return {...state, showDebugView: false};
  },

  [types.SET_FEATURES](
    state: RootState,
    action: {
      features: EndUserAgreement;
    },
  ) {
    return {...state, features: action.features};
  },

  [types.SHOW_USER_AGREEMENT](
    state: RootState,
    action: {
      agreement: EndUserAgreement;
    },
  ) {
    return {
      ...state,
      showUserAgreement: true,
      endUserAgreement: action.agreement,
    };
  },

  [types.HIDE_USER_AGREEMENT](state: RootState) {
    return {...state, showUserAgreement: false, endUserAgreement: null};
  },

  [types.RECEIVE_OTHER_ACCOUNTS](
    state: RootState,
    action: {
      otherAccounts: StorageState[];
    },
  ) {
    return {...state, otherAccounts: action.otherAccounts};
  },

  [types.BEGIN_ACCOUNT_CHANGE](
    state: RootState,
    action: {
      otherAccounts: StorageState[];
    },
  ) {
    return {...state, isChangingAccount: true};
  },

  [types.END_ACCOUNT_CHANGE](
    state: RootState,
    action: {
      otherAccounts: StorageState[];
    },
  ) {
    return {...state, isChangingAccount: false};
  },

  [types.RECEIVE_WORK_TIME_SETTINGS](
    state: RootState,
    action: {
      workTimeSettings: WorkTimeSettings;
    },
  ) {
    return {...state, workTimeSettings: action.workTimeSettings};
  },

  [types.RECEIVE_USER](
    state: RootState,
    action: {
      user: User;
    },
  ) {
    return {
      ...state,
      ...{
        user: action.user,
      },
    };
  },

  [types.RECEIVE_USER_APPEARANCE_PROFILE](
    state: RootState,
    action: {
      appearance: UserAppearanceProfile;
    },
  ) {
    const {user} = state;

    const _user = user || {
      profiles: {},
    };

    const updatedProfiles = Object.assign({}, _user.profiles || {}, {
      appearance: action.appearance,
    });
    const updatedUser = {
      ...state.user,
      ...{
        profiles: updatedProfiles,
      },
    };
    return {
      ...state,
      ...{
        user: updatedUser,
      },
    };
  },
  [types.RECEIVE_USER_HELPDESK_PROFILES](
    state: RootState,
    action: { helpdesk: UserHelpdeskProfile;},
  ) {
    const {user} = state;

    const _user = user || {
      profiles: {},
    };

    const updatedProfiles = Object.assign({}, _user.profiles || {}, {
      helpdesk: action.helpdesk,
    });
    const updatedUser = {
      ...state.user,
      profiles: updatedProfiles,
    };
    return {
      ...state,
      ...{
        user: updatedUser,
      },
    };
  },

  [types.RECEIVE_USER_ARTICLES_PROFILE](
    state: RootState,
    action: {
      articles: UserArticlesProfile;
    },
  ) {
    const {user} = state;

    const _user = user || {
      profiles: {},
    };

    const updatedProfiles = Object.assign({}, _user.profiles || {}, {
      articles: action.articles,
    });
    const updatedUser = {
      ...state.user,
      ...{
        profiles: updatedProfiles,
      },
    };
    return {
      ...state,
      ...{
        user: updatedUser,
      },
    };
  },

  [types.SET_NETWORK](
    state: RootState,
    action: {
      networkState: NetInfoState;
    },
  ) {
    return {...state, networkState: action.networkState};
  },

  [types.INBOX_THREADS_FOLDERS](
    state: RootState,
    action: {
      inboxThreadsFolders: InboxFolder[];
    },
  ) {
    const map: Record<string, InboxFolder> = state.inboxThreadsFolders.reduce(
      (mf: Record<string, InboxFolder>, it: InboxFolder) => ({
        ...mf,
        [it.id]: it,
      }),
      {},
    );
    return {
      ...state,
      inboxThreadsFolders: action.inboxThreadsFolders.map((it: InboxFolder) => {
        const me = map[it.id];
        return {
          ...it,
          lastSeen: Math.max(
            it.lastSeen,
            typeof me?.lastSeen === 'number' ? me.lastSeen : -1,
          ),
          lastNotified: Math.max(
            it.lastNotified,
            typeof me?.lastNotified === 'number' ? me.lastNotified : -1,
          ),
        };
      }),
    };
  },

  [types.INBOX_THREADS_FOLDER_SEEN](
    state: RootState,
    action: {
      folderId: string;
      lasSeen: number;
    },
  ) {
    return {
      ...state,
      inboxThreadsFolders: state.inboxThreadsFolders.reduce(
        (list: InboxFolder[], it: InboxFolder) => {
          return list.concat(
            !action.folderId || it.id === action.folderId
              ? {...it, lastSeen: Math.max(action.lastSeen, it.lastSeen)}
              : it,
          );
        },
        [],
      ),
    };
  },

  [types.SET_PROGRESS](
    state: RootState,
    action: {
      isInProgress: boolean;
    },
  ) {
    return {...state, isInProgress: action.isInProgress};
  },

  [types.SET_DRAFT_COMMENT_DATA](
    state: RootState,
    action: DraftCommentData,
  ) {
    const {setDraft, getCommentDraft, entity} = action;
    return {
      ...state,
      draftCommentData: {
        entity,
        getCommentDraft,
        setDraft,
      },
    };
  },

  [types.SET_SETTINGS](
    state: RootState,
    action: { globalSettings: GlobalSettings },
  ) {
    return {
      ...state,
      globalSettings: action.globalSettings,
    };
  },

  [types.SET_HELPDESK_MENU_HIDDEN](
    state: RootState,
    action: { hidden: boolean },
  ) {
    return {
      ...state,
      helpdeskMenuHidden: action.hidden,
    };
  },

  [types.SET_PROJECTS](
    state: RootState,
    action: { projects: UserProject[] },
  ) {
    return {
      ...state,
      projects: action.projects,
    };
  },
});
