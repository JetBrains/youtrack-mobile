import * as actions from './issues-actions';
import * as Feature from 'components/feature/feature';
import * as types from './issues-action-types';
import API from 'components/api/api';
// @ts-ignore
import mocks from 'test/mocks';
import reducer, {IssuesState} from './issues-reducers';
import Store from 'store';
import {flushStoragePart, getStorageState, __setStorageState, StorageState} from 'components/storage/storage';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {SET_PROGRESS} from 'actions/action-types';

import {Folder} from 'types/User';
import {AnyIssue} from 'types/Issue';

const currentUserIdMock = 'current-user';
let apiMock: Partial<API & any>;
let currentUserMock;
let issueContextQueryMock: string;
let issueListQueryMock: string;
let store: typeof Store;

const getApi = () => apiMock;
const createStoreMock = mocks.createMockStore(getApi);


describe('Issues', () => {
  const TEST_QUERY = 'test-query';
  afterEach(() => jest.restoreAllMocks());
  beforeEach(() => {
    issueContextQueryMock = 'project MyProject';
    issueListQueryMock = 'test search';
    currentUserMock = {
      id: currentUserIdMock,
    };
    apiMock = {
      search: {} as IssuesState,
    };
    store = createStoreMock({
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
        settings: {search: {filters: {}}},
      },
    });
    __setStorageState({});
  });


  describe('Issue list actions', () => {

    it('should set issues query', async () => {
      await store.dispatch(actions.setIssuesQuery(TEST_QUERY));

      expect(store.getActions()[0]).toEqual({
        type: types.SET_ISSUES_QUERY,
        query: TEST_QUERY,
      });
    });

    it('should read stored query', async () => {
      await flushStoragePart({
        query: issueContextQueryMock,
      });

      await store.dispatch(actions.readStoredIssuesQuery());

      expect(store.getActions()[0]).toEqual({
        type: types.SET_ISSUES_QUERY,
        query: issueContextQueryMock,
      });
    });


    describe('Suggestions', () => {
      const assistSuggestions = [
        {
          option: 'for: me',
        },
      ];

      beforeEach(() => {
        const queryAssistSuggestionsResourceMock = jest
          .fn()
          .mockResolvedValueOnce(assistSuggestions);
        apiMock.search.getQueryAssistSuggestions = queryAssistSuggestionsResourceMock;
        apiMock.search.getQueryAssistSuggestionsLegacy = queryAssistSuggestionsResourceMock;
      });

      it('should use legacy REST endpoint', async () => {
        jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(false);
        await doSuggest(2);

        expect(
          apiMock.search.getQueryAssistSuggestionsLegacy,
        ).toHaveBeenCalledWith(TEST_QUERY, 2);
      });

      it('should use latest REST endpoint and with the search context', async () => {
        jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(true);
        const searchContextMock = {
          id: 'searchContext',
        };

        __setStorageState({
          searchContext: searchContextMock,
        } as StorageState);

        await doSuggest(5);

        expect(
          apiMock.search.getQueryAssistSuggestions,
        ).toHaveBeenCalledWith(TEST_QUERY, 5, [searchContextMock]);
      });

      it('should use latest REST endpoint and without any search context', async () => {
        jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(true);

        await doSuggest(5);

        expect(apiMock.search.getQueryAssistSuggestions).toHaveBeenCalledWith(
          TEST_QUERY,
          5,
          null,
        );
      });

      it('should load query assist suggestions', async () => {
        await doSuggest();

        const suggestions = [
          {
            title: null,
            data: assistSuggestions,
          },
        ];

        expect(store.getActions()[0]).toEqual({
          type: types.SUGGEST_QUERY,
          suggestions,
        });
      });

      it('should load query assist suggestions with recent searches', async () => {
        const cachedRecentUserQueryMock = ['last-query'];
        await flushStoragePart({
          lastQueries: cachedRecentUserQueryMock,
        });
        await doSuggest();
        const suggestions = [
          {
            title: null,
            data: assistSuggestions,
          },
          {
            title: 'Recent searches',
            data: [
              {
                id: 'lastQueries-0',
                name: 'last-query',
                query: 'last-query',
              },
            ],
          },
        ];
        expect(store.getActions()[0]).toEqual({
          type: types.SUGGEST_QUERY,
          suggestions,
        });
      });

      async function doSuggest(caretPosition: number = 4) {
        await store.dispatch(actions.suggestIssuesQuery(TEST_QUERY, caretPosition));
      }
    });

    it('should clear query assist suggestions', async () => {
      await store.dispatch(actions.clearAssistSuggestions());

      expect(store.getActions()[0].type).toEqual(types.CLEAR_SUGGESTIONS);
    });

    it('should store query', async () => {
      await store.dispatch(actions.storeIssuesQuery('query-update'));

      expect(getStorageState().query).toEqual('query-update');
    });

    it('should receive issues', async () => {
      const issues = [
        {
          id: 'test',
        },
      ] as AnyIssue[];

      await store.dispatch(actions.receiveIssues(issues));

      expect(store.getActions()[0]).toEqual({
        type: types.RECEIVE_ISSUES,
        issues,
        pageSize: 14,
      });
    });


    describe('loadIssuesCount', () => {
      it('should set issues count', async () => {
        const countMock = 12;
        apiMock.issues = {
          getIssuesCount: jest.fn().mockResolvedValueOnce(countMock),
        };

        await store.dispatch(actions.loadIssuesCount());

        expect(store.getActions()[0]).toEqual({
          type: types.SET_ISSUES_COUNT,
          count: countMock,
        });
      });

      it('should load issues count', async () => {
        apiMock.issues = {
          getIssuesCount: jest.fn(),
        };
        const folderMock = {
          id: 'contextId',
        } as Folder;

        await store.dispatch(actions.loadIssuesCount(folderMock));

        expect(apiMock.issues.getIssuesCount).toHaveBeenCalledWith(
          issueListQueryMock,
          folderMock,
          false,
          expect.anything(),
        );
      });
    });
  });


  describe('Issue list reducers', () => {
    it('should set issues query', async () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.SET_ISSUES_QUERY,
          query: 'test',
        },
      );

      expect(newState.query).toEqual('test');
    });

    it('should set query assist suggestions', () => {
      const suggestions = [
        {
          id: 'test',
        },
      ];
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.SUGGEST_QUERY,
          suggestions,
        },
      );

      expect(newState.queryAssistSuggestions).toEqual(suggestions);
    });

    it('should start issue loading', () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: SET_PROGRESS,
          isInProgress: true,
        },
      );

      expect(newState).toEqual({
        loadingError: null,
        isListEndReached: false,
        isRefreshing: true,
        skip: 0,
      });
    });

    it('should stop issues loading', () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: SET_PROGRESS,
          isInProgress: false,
        },
      );

      expect(newState.isRefreshing).toEqual(false);
    });

    it('should start loading more issues', () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.START_LOADING_MORE,
          newSkip: 10,
        },
      );

      expect(newState).toEqual({
        isLoadingMore: true,
        skip: 10,
      });
    });

    it('should stop loading more', () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.STOP_LOADING_MORE,
        },
      );

      expect(newState).toEqual({
        isLoadingMore: false,
      });
    });

    it('should receive issues', () => {
      const issues = [
        {
          id: 'test',
        },
      ];
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.RECEIVE_ISSUES,
          issues,
        },
      );

      expect(newState).toEqual({
        issues,
        isInitialized: true,
      });
    });

    it('should set error on failed to load issues', () => {
      const error = new Error();
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.LOADING_ISSUES_ERROR,
          error,
        },
      );

      expect(newState).toEqual({
        isInitialized: true,
        isListEndReached: true,
        loadingError: error,
        issues: [],
      });
    });

    it('should set that issues list end is reached', () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.LIST_END_REACHED,
        },
      );

      expect(newState).toEqual({
        isListEndReached: true,
      });
    });

    it('should set issues counter', () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: types.SET_ISSUES_COUNT,
          count: 12,
        },
      );

      expect(newState).toEqual({
        issuesCount: 12,
      });
    });

    it('should find and update issue in list and not take rest props from updated issue', () => {
      const updatedIssue = {
        id: 'test',
        summary: 'after update',
        foo: 'bar',
      };
      const newState = reducer({
        issues: [
          {
            id: 'test',
            summary: 'before update',
          },
          {
            id: 'another-issue',
            summary: 'another',
          },
        ],
      } as IssuesState, {
        type: ISSUE_UPDATED,
        issue: updatedIssue,
      });

      expect(newState.issues).toEqual([
        {
          id: 'test',
          summary: 'after update',
        },
        {
          id: 'another-issue',
          summary: 'another',
        },
      ]);
    });
  });

});
