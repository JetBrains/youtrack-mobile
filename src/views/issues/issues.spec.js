import sinon from 'sinon';
import reducer from './issues-reducers';

import * as actions from './issues-actions';
import * as types from './issues-action-types';
import * as Feature from 'components/feature/feature';
import {flushStoragePart, getStorageState, __setStorageState} from 'components/storage/storage';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {SET_PROGRESS} from '../../actions/action-types';

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
          currentUser: currentUserMock,
        },
      },
      searchContext: {
        query: issueContextQueryMock,
      },
      issueList: {
        query: issueListQueryMock,
      },
    };
    dispatch = sinon.spy();
    getState = () => stateMock;
    apiMock = {
      search: {},
    };

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


  describe('Suggestions', () => {
    const assistSuggestions = [{option: 'for: me'}];

    beforeEach(() => {
      const queryAssistSuggestionsResourceMock = jest.fn().mockResolvedValueOnce(assistSuggestions);
      apiMock.search.getQueryAssistSuggestions = queryAssistSuggestionsResourceMock;
      apiMock.search.getQueryAssistSuggestionsLegacy = queryAssistSuggestionsResourceMock;
    });

    it('should use legacy REST endpoint', async () => {
      jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(false);

      await doSuggest(2);
      expect(apiMock.search.getQueryAssistSuggestionsLegacy).toHaveBeenCalledWith(
        stateMock.issueList.query,
        2
      );
    });

    it('should use latest REST endpoint and with the search context', async () => {
      jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(true);
      const searchContextMock = {id: 'searchContext'};
      __setStorageState({
        searchContext: searchContextMock,
      });

      await doSuggest(5);
      expect(apiMock.search.getQueryAssistSuggestions).toHaveBeenCalledWith(
        stateMock.issueList.query,
        5,
        [searchContextMock]
      );
    });

    it('should use latest REST endpoint and without any search context', async () => {
      jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(true);

      await doSuggest(5);
      expect(apiMock.search.getQueryAssistSuggestions).toHaveBeenCalledWith(
        stateMock.issueList.query,
        5,
        null
      );
    });

    it('should load query assist suggestions', async () => {
      await doSuggest();

      const suggestions = [{title: null, data: assistSuggestions}];
      dispatch.should.have.been.calledWith({type: types.SUGGEST_QUERY, suggestions});
    });

    it('should load query assist suggestions with recent searches', async () => {
      const cachedRecentUserQueryMock = ['last-query'];
      await flushStoragePart({lastQueries: cachedRecentUserQueryMock});

      await doSuggest();

      const suggestions = [{title: null, data: assistSuggestions}, {
        title: 'Recent searches', data: [{
          id: 'lastQueries-0',
          name: 'last-query', query: 'last-query',
        }],
      }];
      dispatch.should.have.been.calledWith({
        type: types.SUGGEST_QUERY,
        suggestions,
      });
    });

    async function doSuggest(caretPosition: number = 4) {
      await actions.suggestIssuesQuery(TEST_QUERY, caretPosition)(dispatch, getState, () => apiMock);
    }
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
        getIssuesCount: jest.fn().mockResolvedValueOnce(countMock),
      };

      await actions.loadIssuesCount()(dispatch, () => stateMock, () => apiMock);

      dispatch.should.have.been.calledWith({
        type: types.SET_ISSUES_COUNT,
        count: countMock,
      });
    });

    it('should load issues count', async () => {
      apiMock.issues = {
        getIssuesCount: jest.fn(),
      };

      const folderMock = {id: 'contextId'};
      await actions.loadIssuesCount(issueContextQueryMock, folderMock)(dispatch, () => stateMock, () => apiMock);

      expect(apiMock.issues.getIssuesCount).toHaveBeenCalledWith(
        issueContextQueryMock,
        folderMock,
        false,
        expect.anything()
      );
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
    const newState = reducer({}, {type: SET_PROGRESS, isInProgress: true});
    newState.should.deep.equal({
      loadingError: null,
      isListEndReached: false,
      isRefreshing: true,
      skip: 0,
    });
  });

  it('should stop issues loading', () => {
    reducer({}, {type: SET_PROGRESS, isInProgress: false})
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
        issues: [],
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
        {id: 'another-issue', summary: 'another'},
      ],
    };
    const updatedIssue = {id: 'test', summary: 'after update', foo: 'bar'};
    const newState = reducer(state, {
      type: ISSUE_UPDATED,
      issue: updatedIssue,
    });

    newState.issues.should.deep.equal([
      {id: 'test', summary: 'after update'},
      {id: 'another-issue', summary: 'another'},
    ]);
  });

});
