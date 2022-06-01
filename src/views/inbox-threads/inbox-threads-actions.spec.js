import actions from './inbox-threads-actions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {__setStorageState} from '../../components/storage/storage';
import {inboxThreadsNamespace, inboxThreadsReducersNamesMap} from './inbox-threads-reducers';


describe('Inbox Threads', () => {
  let apiMock;
  let responseMock;
  let store;

  const getApi = () => apiMock;
  const middlewares = [thunk.withExtraArgument(getApi)];
  const storeMock = configureMockStore(middlewares);

  beforeEach(async () => {
  responseMock = [{subject: {}}];
    apiMock = {
      inbox: {
        getThreads: jest.fn(() => Promise.resolve(responseMock)),
      },
    };

    store = storeMock({});
    __setStorageState({});
  });

  describe('loadInboxThreads', () => {
    it('should load inbox threads', async () => {

      await store.dispatch(actions.loadInboxThreads());

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined);
      expect(store.getActions()).toEqual([
        {
          'type': `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setError}`,
          'payload': {
            'error': null,
          },
        },
        {
          'type': `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.toggleProgress}`,
          'payload': {
            'inProgress': true,
          },
        },
        {
          'type': `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.toggleProgress}`,
          'payload': {
            'inProgress': false,
          },
        },
        {
          'type': `${inboxThreadsNamespace}/${inboxThreadsReducersNamesMap.setNotifications}`,
          'payload': {
            'threads': responseMock,
          },
        },
      ]);
    });


    it('should load more threads', async () => {
      await store.dispatch(actions.loadInboxThreads(123));

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(123);
    });

  });
});
