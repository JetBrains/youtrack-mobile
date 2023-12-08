import * as issuesActions from './issues-actions';
import * as Feature from 'components/feature/feature';
import * as types from './issues-action-types';
import * as storage from 'components/storage/storage';
import Api from 'components/api/api';
// @ts-ignore
import mocks from 'test/mocks';
import reducer, {IssuesState} from './issues-reducers';
import Store from 'store';
import {deepmerge} from 'deepmerge-ts';
import {ISSUE_UPDATED} from '../issue/issue-action-types';
import {issuesSettingsDefault, issuesSettingsIssueSizes, issuesSettingsSearch} from 'views/issues/index';
import {SET_PROGRESS} from 'actions/action-types';
import {StorageState} from 'components/storage/storage';

import {Folder, User} from 'types/User';
import {AnyIssue, IssueOnList} from 'types/Issue';

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

    apiMock = new Api(mocks.createAuthMock());

    createTestStore({
      helpDeskMode: false,
    });

    storage.__setStorageState({});
  });


  describe('Issues mode', () => {
    it('should set Issues mode', async () => {
      const isHelpdeskMode = await store.dispatch(issuesActions.isHelpDeskMode());
      expect(isHelpdeskMode).toEqual(false);
    });

    it('should set issues query', async () => {
      await store.dispatch(issuesActions.issuesQueryAction(TEST_QUERY));

      expect(store.getActions()[0]).toEqual({
        type: types.SET_ISSUES_QUERY,
        query: TEST_QUERY,
      });
    });

    it('should store query', async () => {
      await store.dispatch(issuesActions.storeIssuesQuery(queryMock));

      expect(storage.getStorageState().query).toEqual(queryMock);
    });

    it('should read stored query', async () => {
      await storage.flushStoragePart({query: queryMock});
      await store.dispatch(issuesActions.setStoredIssuesQuery());

      expect(store.getActions()[0]).toEqual({
        type: types.SET_ISSUES_QUERY,
        query: queryMock,
      });
    });

    it('should clear query assist suggestions', async () => {
      await store.dispatch(issuesActions.clearAssistSuggestions());

      expect(store.getActions()[0].type).toEqual(types.CLEAR_SUGGESTIONS);
    });

    it('should receive issues', async () => {
      const issues = [
        {
          id: 'test',
        },
      ] as AnyIssue[];

      await store.dispatch(issuesActions.receiveIssues(issues));

      expect(store.getActions()[0]).toEqual({
        type: types.RECEIVE_ISSUES,
        issues,
        pageSize: 14,
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

        storage.__setStorageState({
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
          type: types.SUGGEST_QUERY,
          suggestions,
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
          type: types.SET_ISSUES_COUNT,
          count: countMock,
        });
      });

      it('should load issues count', async () => {
        const folderMock = mocks.createFolder();

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
            const projectQuery = `${filterMock2.id}:${filterMock2.selectedValues.join(',')}`;
            const otherFolderQuery = `${folderNameMock.toLowerCase()}:${filterMock1.selectedValues[0]},{${filterMock1.selectedValues[1]}}`;
            expect(composedQuery).toEqual([
              nonStructuralQuery,
              projectQuery,
              otherFolderQuery,
            ].join(' '));
          });

        });
      });
    });
  });


  describe('HelpDesk mode', () => {
    let issueStateHelpdesk: Partial<IssuesState>;
    beforeEach(() => {
      issueStateHelpdesk = {
        helpDeskMode: true,
        helpdeskQuery: '',
        helpdeskSearchContext: mocks.createFolder(),
        settings: issuesSettingsDefault,
      };
      createTestStore(issueStateHelpdesk);
    });

    it('should set Helpdesk mode', async () => {
      const isHelpdeskMode = await store.dispatch(issuesActions.isHelpDeskMode());

      expect(isHelpdeskMode).toEqual(true);
    });

    it('should initialize list with Helpdesk cache', async () => {
      const helpdeskCache: IssueOnList[] = [mocks.createIssueMock()];
      await storage.flushStoragePart({helpdeskCache});

      await store.dispatch(issuesActions.initializeIssuesList());

      expect(store.getActions()[4]).toEqual({
        type: types.RECEIVE_ISSUES,
        issues: helpdeskCache,
        pageSize: issuesActions.PAGE_SIZE,
      });
    });

    it('should read stored Helpdesk query', async () => {
      await storage.flushStoragePart({helpdeskQuery: queryMock});
      await store.dispatch(issuesActions.setStoredIssuesQuery());

      expect(store.getActions()[0]).toEqual({
        type: types.SET_HELPDESK_QUERY,
        helpdeskQuery: queryMock,
      });
    });

    it('should store Helpdesk query', async () => {
      await storage.flushStoragePart({helpdeskQuery: null});
      await store.dispatch(issuesActions.storeIssuesQuery(queryMock));

      expect(storage.getStorageState().helpdeskQuery).toEqual(queryMock);
    });

    it('should update Helpdesk query', async () => {
      await store.dispatch(issuesActions.onQueryUpdate(queryMock));

      expect(store.getActions()[0]).toEqual({
        type: types.SET_HELPDESK_QUERY,
        helpdeskQuery: queryMock,
      });

      expect(
        store.getActions().find((it: Record<string, unknown>) => it.type === types.SET_ISSUES_QUERY)
      ).toBeUndefined();
    });


  });


  describe('Issues reducers', () => {
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



  function createTestStore(data: Partial<IssuesState> = {}) {
    const user: User = mocks.createUserMock();
    store = createStoreMock({
      app: {
        user,
        auth: {
          currentUser: user,
        },
      },
      issueList: deepmerge({
        searchContext: {
          query: queryMock,
        },
        query: issueListQueryMock,
        settings: {search: {filters: {}}},
      }, data),
    });
  }
});
