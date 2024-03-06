import * as issuesActions from 'views/issues/issues-actions';
import * as ticketsActions from './tickets-actions';
import * as storage from 'components/storage/storage';
import * as types from 'views/issues/issues-action-types';
import mocks from 'test/mocks';
import {
  IssuesState,
  RECEIVE_ISSUES,
  SET_HELPDESK_QUERY,
} from 'views/issues/issues-reducers';
import Store from 'store';
import {deepmerge} from 'deepmerge-ts';
import {issuesSettingsDefault} from 'views/issues';

import {IssueOnList} from 'types/Issue';

let queryMock: string;
let issueListQueryMock: string;
let store: typeof Store;

const createStoreMock = mocks.createMockStore({});


describe('Tickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    queryMock = 'project MyProject';
    issueListQueryMock = 'test search';

    storage.__setStorageState({});
  });

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

  it('should set tickets from the cache', async () => {
    const helpdeskCache: IssueOnList[] = [mocks.createIssueMock()];
    await storage.flushStoragePart({helpdeskCache});

    await store.dispatch(ticketsActions.setTicketsFromCache());

    expect(store.getActions()[0]).toEqual({
      type: `${RECEIVE_ISSUES}`,
      payload: helpdeskCache,
    });
  });

  it('should read stored Helpdesk query', async () => {
    await storage.flushStoragePart({helpdeskQuery: queryMock});
    await store.dispatch(issuesActions.initSearchQuery());

    expect(store.getActions()[0]).toEqual({
      type: `${SET_HELPDESK_QUERY}`,
      payload: queryMock,
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
      type: `${SET_HELPDESK_QUERY}`,
      payload: queryMock,
    });

    expect(
      store.getActions().find((it: Record<string, unknown>) => it.type === types.SET_ISSUES_QUERY)
    ).toBeUndefined();
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
      searchContext: {
        query: queryMock,
      },
      query: issueListQueryMock,
      settings: {search: {filters: {}}},
    }, data),
  });
}
