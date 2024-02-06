import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {EVERYTHING_SEARCH_CONTEXT} from 'components/search/search-context';
import {i18n} from 'components/i18n/i18n';
import {ISSUE_CREATED} from '../create-issue/create-issue-action-types';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {IssuesSettings, issuesSettingsDefault} from 'views/issues/index';
import {LOG_OUT, SET_PROGRESS} from 'actions/action-types';

import type {AssistSuggest, IssueOnList} from 'types/Issue';
import type {Folder} from 'types/User';
import {CustomError} from 'types/Error';
import {ISelectProps} from 'components/select/select';
import {ISSWithItemActionsProps} from 'components/select/select-sectioned-with-item-and-star';


export interface IssuesState {
  query: string;
  helpdeskQuery: string;
  skip: number;
  queryAssistSuggestions: AssistSuggest[];
  isLoadingMore: boolean;
  isListEndReached: boolean;
  loadingError: CustomError | null;
  isInitialized: boolean;
  isRefreshing: boolean;
  isIssuesContextOpen: boolean;
  issuesCount: number | null;
  issues: IssueOnList[];
  selectProps: (Partial<ISelectProps> | ISelectProps | ISSWithItemActionsProps & { isSectioned?: boolean }) | null;
  searchContext: Folder;
  isSearchContextPinned: boolean;
  settings: IssuesSettings;
  helpdeskSearchContext: Folder;
  helpDeskMode: boolean;
}

export const initialState: IssuesState = {
  query: '',
  helpdeskQuery: '',
  queryAssistSuggestions: [],
  skip: 0,
  isLoadingMore: false,
  isListEndReached: false,
  loadingError: null,
  isInitialized: false,
  isRefreshing: false,
  isIssuesContextOpen: false,
  issuesCount: null,
  issues: [],
  selectProps: null,
  searchContext: EVERYTHING_SEARCH_CONTEXT,
  isSearchContextPinned: false,
  settings: issuesSettingsDefault,
  helpdeskSearchContext: {...EVERYTHING_SEARCH_CONTEXT, name: i18n('Tickets')},
  helpDeskMode: false,
};

export const issuesNamespace = 'issues';
const {reducer, actions} = createSlice({
  name: issuesNamespace,
  initialState,

  reducers: {
    SET_ISSUES_QUERY(state: IssuesState, action: PayloadAction<string>) {
      state.query = action.payload;
    },
    SET_HELPDESK_QUERY(state: IssuesState, action: PayloadAction<string>) {
      state.helpdeskQuery = action.payload;
    },
    SUGGEST_QUERY(state: IssuesState, action: PayloadAction<AssistSuggest[]>) {
      state.queryAssistSuggestions = action.payload;
    },
    CLEAR_SUGGESTIONS(state: IssuesState) {
      state.queryAssistSuggestions = [];
    },
    START_LOADING_MORE(state: IssuesState, action: PayloadAction<number>) {
      state.isLoadingMore = true;
      state.skip = action.payload;
    },
    STOP_LOADING_MORE(state: IssuesState) {
      state.isLoadingMore = false;
    },
    RECEIVE_ISSUES(state: IssuesState, action: PayloadAction<IssueOnList[]>) {
      state.issues = action.payload;
      state.isInitialized = true;
    },
    LOADING_ISSUES_ERROR(state: IssuesState, action: PayloadAction<CustomError | null>) {
      state.loadingError = action.payload;
      state.isInitialized = true;
      state.isListEndReached = true;
      state.issues = [];
    },
    LIST_END_REACHED(state: IssuesState) {
      state.isListEndReached = true;
    },
    SET_ISSUES_COUNT(state: IssuesState, action: PayloadAction<number | null>) {
      state.issuesCount = action.payload;
    },
    RESET_ISSUES_COUNT(state: IssuesState) {
      state.issuesCount = null;
    },
    OPEN_SEARCH_CONTEXT_SELECT(state: IssuesState, action: PayloadAction<Partial<ISelectProps> | ISelectProps | (ISSWithItemActionsProps & { isSectioned: boolean })>) {
      state.selectProps = action.payload;
      state.isIssuesContextOpen = true;
    },
    CLOSE_SEARCH_CONTEXT_SELECT(state: IssuesState) {
      state.selectProps = null;
      state.isIssuesContextOpen = false;
    },
    IS_SEARCH_CONTEXT_PINNED(state: IssuesState, action: PayloadAction<boolean>) {
      state.isSearchContextPinned = action.payload;
    },
    SET_SEARCH_CONTEXT(state: IssuesState, action: PayloadAction<Folder>) {
      state.searchContext = action.payload;
    },
    SET_LIST_SETTINGS(state: IssuesState, action: PayloadAction<IssuesSettings>) {
      state.settings = action.payload;
    },
    SET_HELPDESK_MODE(state: IssuesState, action: PayloadAction<boolean>) {
      state.helpDeskMode = action.payload;
    },
    SET_HELPDESK_CONTEXT(state: IssuesState, action: PayloadAction<Folder>) {
      state.helpdeskSearchContext = action.payload;
    },
  },

  extraReducers: {
    [LOG_OUT]: (): IssuesState => {
      return initialState;
    },
    [ISSUE_CREATED]: (
      state: IssuesState,
      action: {
        issue: IssueOnList;
      },
    ): IssuesState => {
      return {...state, issues: [action.issue, ...state.issues]};
    },
    [SET_PROGRESS]: (
      state: IssuesState,
      action: {
        isInProgress: boolean;
      },
    ) => {
      const isRefreshing: boolean = action.isInProgress;
      return {
        ...state,
        isRefreshing,
        ...(isRefreshing
          ? {
            loadingError: null,
            isListEndReached: false,
            skip: 0,
          }
          : {}),
      };
    },
    [ISSUE_UPDATED]: (
      state: IssuesState,
      action: {
        issue: IssueOnList;
      },
    ) => {
      const sourceIssue: IssueOnList = action.issue;

      function updateIssue(issue: IssueOnList): IssueOnList {
        return Object.keys(issue).reduce((updated: IssueOnList, key: string) => {
          return {...updated, [key]: sourceIssue[key as keyof IssueOnList]};
        }, {} as IssueOnList);
      }

      const issues: IssueOnList[] = state.issues.map((issue: IssueOnList) =>
        issue.id === sourceIssue?.id ? updateIssue(issue) : issue,
      );
      return {...state, issues};
    },
  },
});

export const {
  CLEAR_SUGGESTIONS,
  CLOSE_SEARCH_CONTEXT_SELECT,
  IS_SEARCH_CONTEXT_PINNED,
  LIST_END_REACHED,
  LOADING_ISSUES_ERROR,
  OPEN_SEARCH_CONTEXT_SELECT,
  RECEIVE_ISSUES,
  RESET_ISSUES_COUNT,
  SET_HELPDESK_CONTEXT,
  SET_HELPDESK_MODE,
  SET_HELPDESK_QUERY,
  SET_ISSUES_COUNT,
  SET_ISSUES_QUERY,
  SET_LIST_SETTINGS,
  SET_SEARCH_CONTEXT,
  START_LOADING_MORE,
  STOP_LOADING_MORE,
  SUGGEST_QUERY,
} = actions;

export default reducer;
