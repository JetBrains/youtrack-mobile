/* @flow */
import * as types from './issue-list-action-types';
import {AsyncStorage} from 'react-native';

const QUERY_STORAGE_KEY = 'YT_QUERY_STORAGE';

export function setIssuesQuery(query: string) {
  return {
    type: types.SET_ISSUES_QUERY,
    query
  };
}

export function readStoredIssuesQuery() {
  return async (dispatch: (any) => any, getState: () => Object) => {
    const query = await AsyncStorage.getItem(QUERY_STORAGE_KEY);
    dispatch({
      type: types.SET_ISSUES_QUERY,
      query: query
    });
  };
}

export function storeIssuesQuery(query: string) {
  return () => {
    AsyncStorage.setItem(QUERY_STORAGE_KEY, query);
  };
}
