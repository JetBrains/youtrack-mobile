/* @flow */
import {createReducer} from 'redux-create-reducer';
import * as types from './issue-list-action-types';
import {ListView} from 'react-native';
import Cache from '../../components/cache/cache';
import type {IssueOnList, TransformedSuggestions} from '../../flow/Issue';

const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
const ISSUES_CACHE_KEY = 'yt_mobile_issues_cache';

export type IssuesListState = {
  query: string,
  skip: number,
  queryAssistSuggestions: Array<TransformedSuggestions>,

  isLoadingMore: boolean,
  isListEndReached: boolean,
  loadingError: ?Object,
  isInitialized: boolean,
  isRefreshing: boolean,

  cache: Cache,
  issues: Array<IssueOnList>,
  dataSource: Object
};

const initialState: IssuesListState = {
  query: '',
  queryAssistSuggestions: [],
  skip: 0,
  isLoadingMore: false,
  isListEndReached: false,

  loadingError: null,
  isInitialized: false,
  isRefreshing: false,
  cache: new Cache(ISSUES_CACHE_KEY),
  issues: [],
  dataSource: ds.cloneWithRows([])
};

export default createReducer(initialState, {
  [types.SET_ISSUES_QUERY]: (state: IssuesListState, action: Object) => {
    return {...state, query: action.query};
  },
  [types.SUGGEST_QUERY]: (state: IssuesListState, action: Object) => {
    return {...state, queryAssistSuggestions: action.suggestions};
  },
  [types.CLEAR_SUGGESTIONS]: (state: IssuesListState, action: Object) => {
    return {...state, queryAssistSuggestions: []};
  },
  [types.START_ISSUES_LOADING]: (state: IssuesListState, action: Object) => {
    return {
      ...state, loadingError: null, isListEndReached: false, isRefreshing: true, skip: 0
    };
  },
  [types.STOP_ISSUES_LOADING]: (state: IssuesListState, action: Object) => {
    return {...state, isRefreshing: false};
  },
  [types.START_LOADING_MORE]: (state: IssuesListState, action: Object) => {
    return {...state, isLoadingMore: true};
  },
  [types.STOP_LOADING_MORE]: (state: IssuesListState, action: Object) => {
    return {...state, isLoadingMore: false};
  },
  [types.RECEIVE_ISSUES]: (state: IssuesListState, action: {issues: Array<IssueOnList>, pageSize: number}) => {
    return {
      ...state,
      issues: action.issues,
      dataSource: state.dataSource.cloneWithRows(action.issues),
      isInitialized: true
    };
  },
  [types.LOADING_ISSUES_ERROR]: (state: IssuesListState, action: {error: Object}) => {
    return {
      ...state,
      isInitialized: true,
      isListEndReached: true,
      loadingError: action.error,
      issues: [],
      dataSource: state.dataSource.cloneWithRows([])
    };
  },
  [types.LIST_END_REACHED]: (state: IssuesListState, action: {error: Object}) => {
    return {...state, isListEndReached: true};
  }
});
