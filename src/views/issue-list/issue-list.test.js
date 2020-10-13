import {flushStoragePart, getStorageState, __setStorageState} from '../../components/storage/storage';
import * as actions from './issue-list-actions';

import sinon from 'sinon';
import reducer from './issue-list-reducers';

import * as types from './issue-list-action-types';
import {ISSUE_UPDATED} from '../single-issue/single-issue-action-types';

let dispatch;
let stateMock;
let apiMock;
let issueContextQueryMock;
let issueListQueryMock;
let currentUserMock;
const currentUserIdMock = 'current-user';

describe('Issue list actions', () => {
  let getState;
  const TEST_QUERY = 'test-query';

  afterEach(() => jest.restoreAllMocks());

  beforeEach(() => {
    issueContextQueryMock = 'project YouTrackMobile';
    issueListQueryMock = 'test-query';

    currentUserMock = {id: currentUserIdMock};

    stateMock = {
      app: {
        user: currentUserMock,
        auth: {
          currentUser: currentUserMock
        }
      },
      searchContext: {
        query: issueContextQueryMock
      },
      issueList: {
        query: issueListQueryMock
      }
    };
    dispatch = sinon.spy();
    getState = () => stateMock;
    apiMock = {};

    __setStorageState({});
  });

  it('should set issues query', () => {
    actions
      .setIssuesQuery(TEST_QUERY)
      .should.deep.equal({type: types.SET_ISSUES_QUERY, query: TEST_QUERY});
  });

  it('should read stored query', async () => {
    await flushStoragePart({query: TEST_QUERY});
    await actions.readStoredIssuesQuery()(dispatch);

    dispatch.should.have.been.calledWith({type: types.SET_ISSUES_QUERY, query: TEST_QUERY});
  });

  it('should load query assist suggestions if query is not empty', async () => {
    const suggestions = [{id: 'test'}];
    apiMock.getQueryAssistSuggestions = () => new Promise(resolve => resolve(suggestions));

    await actions.suggestIssuesQuery(TEST_QUERY, 4)(dispatch, getState, () => apiMock);

    dispatch.should.have.been.calledWith({type: types.SUGGEST_QUERY, suggestions});
  });

  it('should load saved query and last searches if query is empty', async () => {
    const serverSavedQueryListMock = [
      {id: 'savedQuery', owner: {id: currentUserIdMock}},
      {id: 'savedQuery-not-own', owner: {id: 'other-user'}}
    ];
    const cachedRecentUserQueryMock = ['last-query'];

    apiMock.getSavedQueries = () => new Promise(resolve => resolve(serverSavedQueryListMock));
    await flushStoragePart({lastQueries: cachedRecentUserQueryMock});
    await actions.suggestIssuesQuery('', 0)(dispatch, getState, () => apiMock);

    dispatch.should.have.been.calledWith({
      type: types.SUGGEST_QUERY,
      suggestions: [serverSavedQueryListMock[0], {id: `lastQueries-0`, name: 'last-query', query: 'last-query'}]
    });
  });

  it('should clear query assist suggestions', () => {
    actions
      .clearAssistSuggestions()
      .should.deep.equal({type: types.CLEAR_SUGGESTIONS});
  });

  it('should store query', async () => {
    actions.storeIssuesQuery('query-update')();

    getStorageState().query.should.equal('query-update');
  });

  it('should receive issues', () => {
    const issues = [{id: 'test'}];
    actions
      .receiveIssues(issues)
      .should.deep.equal({type: types.RECEIVE_ISSUES, issues, pageSize: 10});
  });


  describe('loadIssuesCount', () => {
    it('should set issues count', async () => {
      const countMock = 12;
      apiMock.issues = {
        getIssuesCount: jest.fn().mockResolvedValueOnce(countMock)
      };

      await actions.loadIssuesCount()(dispatch, () => stateMock, () => apiMock);

      dispatch.should.have.been.calledWith({
        type: types.SET_ISSUES_COUNT,
        count: countMock
      });
    });

    it('should retrieve issues count', async () => {
      apiMock.issues = {
        getIssuesCount: jest.fn()
      };

      await actions.loadIssuesCount(issueContextQueryMock)(dispatch, () => stateMock, () => apiMock);

      expect(apiMock.issues.getIssuesCount).toHaveBeenCalledWith(issueContextQueryMock);
    });
  });
});


describe('Issue list reducers', () => {
  it('should set issues query', () => {
    const newState = reducer({}, {type: types.SET_ISSUES_QUERY, query: 'test'});
    newState.should.deep.equal({query: 'test'});
  });

  it('should set query assist suggestions', () => {
    const suggestions = [{id: 'test'}];
    const newState = reducer({}, {type: types.SUGGEST_QUERY, suggestions});
    newState.should.deep.equal({queryAssistSuggestions: suggestions});
  });

  it('should start issue loading', () => {
    const newState = reducer({}, {type: types.START_ISSUES_LOADING});
    newState.should.deep.equal({
      loadingError: null,
      isListEndReached: false,
      isRefreshing: true,
      skip: 0
    });
  });

  it('should stop issues loading', () => {
    reducer({}, {type: types.STOP_ISSUES_LOADING})
      .should.deep.equal({isRefreshing: false});
  });

  it('should start loading more issues', () => {
    reducer({}, {type: types.START_LOADING_MORE, newSkip: 10})
      .should.deep.equal({isLoadingMore: true, skip: 10});
  });

  it('should stop loading more', () => {
    reducer({}, {type: types.STOP_LOADING_MORE})
      .should.deep.equal({isLoadingMore: false});
  });

  it('should receive issues', () => {
    const issues = [{id: 'test'}];
    reducer({}, {type: types.RECEIVE_ISSUES, issues})
      .should.deep.equal({issues, isInitialized: true});
  });

  it('should set error on failed to load issues', () => {
    const error = new Error();
    reducer({}, {type: types.LOADING_ISSUES_ERROR, error}).should.deep.equal(
      {
        isInitialized: true,
        isListEndReached: true,
        loadingError: error,
        issues: []
      }
    );
  });

  it('should set that issues list end is reached', () => {
    reducer({}, {type: types.LIST_END_REACHED})
      .should.deep.equal({isListEndReached: true});
  });

  it('should set issues counter', () => {
    reducer({}, {type: types.SET_ISSUES_COUNT, count: 12})
      .should.deep.equal({issuesCount: 12});
  });

  it('should find and update issue in list and not take rest props from updated issue', () => {
    const state = {
      issues: [
        {id: 'test', summary: 'before update'},
        {id: 'another-issue', summary: 'another'}
      ]
    };
    const updatedIssue = {id: 'test', summary: 'after update', foo: 'bar'};
    const newState = reducer(state, {
      type: ISSUE_UPDATED,
      issue: updatedIssue
    });

    newState.issues.should.deep.equal([
      {id: 'test', summary: 'after update'},
      {id: 'another-issue', summary: 'another'}
    ]);
  });

});
