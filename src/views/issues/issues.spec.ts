import * as actions from './issues-reducers';
import * as Feature from 'components/feature/feature';
import * as issuesActions from './issues-actions';
import * as storage from 'components/storage/storage';
import Api from 'components/api/api';
import mocks from 'test/mocks';
import reducer, {
  IssuesState,
  CLEAR_SUGGESTIONS,
  LIST_END_REACHED,
  LOADING_ISSUES_ERROR,
  RECEIVE_ISSUES,
  SET_ISSUES_COUNT,
  SET_ISSUES_QUERY,
  START_LOADING_MORE,
  STOP_LOADING_MORE,
  SUGGEST_QUERY,
} from './issues-reducers';
import Store from 'store';
import {deepmerge} from 'deepmerge-ts';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {issuesSettingsIssueSizes, issuesSettingsSearch} from 'views/issues/index';
import {SET_PROGRESS} from 'actions/action-types';

import type Auth from 'components/auth/oauth2';
import {IssueOnListExtended} from 'types/Issue';
import {Folder} from 'types/User';

jest.mock('components/api/api', () => {
  return jest.fn().mockImplementation(() => ({
    search: {},
    issues: {
      getIssuesCount: jest.fn(),
    },
    customFields: {
      getFilters: jest.fn().mockResolvedValue([]),
    },
  }));
});

let apiMock: Api;
let queryMock: string;
let issueListQueryMock: string;
let store: typeof Store;

const getApi = () => apiMock;
const createStoreMock = mocks.createMockStore(getApi);


describe('Issues', () => {
  const TEST_QUERY = 'test-query';

  beforeEach(() => {
    jest.clearAllMocks();

    queryMock = 'project MyProject';
    issueListQueryMock = 'test search';

    apiMock = new Api(mocks.createAuthMock() as Auth);

    createTestStore();

    storage.__setStorageState({});
  });


  describe('Issues mode', () => {
    it('should set Issues mode', async () => {
      const isHelpdeskMode = await store.dispatch(issuesActions.isHelpDeskMode());
      expect(isHelpdeskMode).toEqual(false);
    });

    it('should set issues query', async () => {
      await store.dispatch(actions.SET_ISSUES_QUERY(TEST_QUERY));

      expect(store.getActions()[0]).toEqual({
        type: `${SET_ISSUES_QUERY}`,
        payload: TEST_QUERY,
      });
    });

    it('should store query', async () => {
      await store.dispatch(issuesActions.storeIssuesQuery(queryMock));

      expect(storage.getStorageState().query).toEqual(queryMock);
    });

    it('should read stored query', async () => {
      await storage.flushStoragePart({query: queryMock});
      await store.dispatch(issuesActions.initSearchQuery());

      expect(store.getActions()[0]).toEqual({
        type: `${SET_ISSUES_QUERY}`,
        payload: queryMock,
      });
    });

    it('should clear query assist suggestions', async () => {
      await store.dispatch(actions.CLEAR_SUGGESTIONS());

      expect(store.getActions()[0].type).toEqual(`${CLEAR_SUGGESTIONS}`);
    });

    it('should receive issues', async () => {
      const issues = [
        {
          id: 'test',
        },
      ] as IssueOnListExtended[];

      await store.dispatch(actions.RECEIVE_ISSUES(issues));

      expect(store.getActions()[0]).toEqual({
        type: `${RECEIVE_ISSUES}`,
        payload: issues,
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
        const searchContextMock = mocks.createFolder();

        createTestStore({searchContext: searchContextMock});

        await doSuggest(5);

        expect(apiMock.search.getQueryAssistSuggestions).toHaveBeenCalledWith(
          TEST_QUERY,
          5,
          [searchContextMock],
          'Issue'
        );
      });

      it('should send empty array as `folders` param if a context does not have id', async () => {
        jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(true);
        const searchContextMock = {id: null, name: 'Everything', query: ''} as unknown as Folder;

        createTestStore({searchContext: searchContextMock});

        await doSuggest(5);

        expect(apiMock.search.getQueryAssistSuggestions).toHaveBeenCalledWith(
          TEST_QUERY,
          5,
          [],
          'Issue'
        );
      });

      it('should use latest REST endpoint and without any search context', async () => {
        jest.spyOn(Feature, 'checkVersion').mockReturnValueOnce(true);
        createTestStore({searchContext: {} as unknown as Folder});
        await doSuggest(5);

        expect(apiMock.search.getQueryAssistSuggestions).toHaveBeenCalledWith(
          TEST_QUERY,
          5,
          [],
          'Issue'
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
          type: `${SUGGEST_QUERY}`,
          payload: suggestions,
        });
      });

      it('should load query assist suggestions with recent searches', async () => {
        const cachedRecentUserQueryMock = ['last-query'];
        await storage.flushStoragePart({
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
          type: `${SUGGEST_QUERY}`,
          payload: suggestions,
        });
      });

      async function doSuggest(caretPosition: number = 4) {
        await store.dispatch(issuesActions.suggestIssuesQuery(TEST_QUERY, caretPosition));
      }
    });


    describe('loadIssuesCount', () => {
      it('should set issues count', async () => {
        const countMock = 12;
        (apiMock.issues.getIssuesCount as jest.Mock).mockResolvedValueOnce(countMock);

        await store.dispatch(issuesActions.loadIssuesCount());

        expect(store.getActions()[0]).toEqual({
          type: `${SET_ISSUES_COUNT}`,
          payload: countMock,
        });
      });

      it('should load issues count', async () => {
        const folderMock: Folder = mocks.createFolder();

        await store.dispatch(issuesActions.loadIssuesCount(folderMock));

        expect(apiMock.issues.getIssuesCount).toHaveBeenCalledWith(
          issueListQueryMock,
          folderMock,
          false,
          expect.any(Object)
        );
      });


      describe('Search Modes', () => {
        describe('Query', () => {
          it('should compose search query', async () => {
            createTestStore({
              query: `${queryMock}  `,
            });

            const composedQuery = await store.dispatch(issuesActions.composeSearchQuery());
            expect(composedQuery).toEqual(queryMock);
          });

        });

        describe('Filter', () => {
          it('should compose search query', async () => {
            const folderNameMock = 'State';
            const folder1: Folder = mocks.createFolder({name: folderNameMock});
            const filterMock1 = {
              id: folder1.name,
              selectedValues: ['A1', 'A 2'],
              filterField: [folder1],
            };
            const filterMock2 = {
              id: 'project',
              selectedValues: ['Project1', 'Project2'],
              filterField: [mocks.createFolder({name: 'project'})],
            };
            createTestStore({
              query: queryMock,
              settings: {
                search: {
                  ...issuesSettingsSearch[1],
                  filters: {
                    [filterMock1.id]: filterMock1,
                    [filterMock2.id]: filterMock2,
                  },
                },
                view: issuesSettingsIssueSizes[1],
              },
            });

            const composedQuery = await store.dispatch(issuesActions.composeSearchQuery());
            const nonStructuralQuery = `{${queryMock}}`;
            const projectQuery = `${filterMock2.id}: ${filterMock2.selectedValues.join(',')}`;
            const otherFolderQuery = `${folderNameMock.toLowerCase()}: ${filterMock1.selectedValues[0]},{${filterMock1.selectedValues[1]}}`;
            expect(composedQuery).toEqual([
              projectQuery,
              otherFolderQuery,
              nonStructuralQuery,
            ].join(' '));
          });

        });
      });
    });
  });


  describe('Issues reducers', () => {
    it('should set issues query', async () => {
      const newState = reducer(
        {} as IssuesState,
        {
          type: `${SET_ISSUES_QUERY}`,
          payload: 'test',
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
          type: `${SUGGEST_QUERY}`,
          payload: suggestions,
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
          type: `${START_LOADING_MORE}`,
          payload: 10,
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
          type: `${STOP_LOADING_MORE}`,
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
          type: `${RECEIVE_ISSUES}`,
          payload: issues,
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
          type: `${LOADING_ISSUES_ERROR}`,
          payload: error,
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
          type: `${LIST_END_REACHED}`,
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
          type: `${SET_ISSUES_COUNT}`,
          payload: 12,
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


  function createTestStore(data: Partial<IssuesState> = {}) {
    const user = mocks.createUserMock();
    store = createStoreMock({
      app: {
        user,
        auth: {
          currentUser: user,
        },
      },
      issueList: deepmerge({
        helpDeskMode: false,
        searchContext: {
          query: queryMock,
        },
        query: issueListQueryMock,
        settings: {search: {filters: {}}},
      }, data),
    });
  }
});
