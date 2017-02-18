/* @flow */
import {createReducer} from 'redux-create-reducer';
import * as types from './issue-list-action-types';

type IssuesListState = {
  query: string
};

const initialState: IssuesListState = {
  query: ''
};

export default createReducer(initialState, {
  [types.SET_ISSUES_QUERY]: (state: IssuesListState, action: Object) => {
    return {
      ...state,
      query: action.query
    };
  }
});
