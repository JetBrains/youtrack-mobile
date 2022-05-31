import * as storage from '../../components/storage/storage';
import actions from './inbox-threads-actions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';


describe('Inbox Threads', () => {
  let apiMock;
  let responseMock;
  let store;

  const getApi = () => apiMock;
  const middlewares = [thunk.withExtraArgument(getApi)];
  const storeMock = configureMockStore(middlewares);

  beforeEach(async () => {
  responseMock = [{}];
    apiMock = {
      inbox: {
        getThreads: jest.fn(() => Promise.resolve(responseMock)),
      },
    };

    store = storeMock({});
    await storage.populateStorage();
  });

  describe('loadInboxThreads', () => {
    it('should load inbox threads', async () => {

      await store.dispatch(actions.loadInboxThreads());

      expect(apiMock.inbox.getThreads).toHaveBeenCalledWith(undefined);
      expect(store.getActions()).toEqual([
        {
          'type': 'inboxThreads/setError',
          'payload': {
            'error': null,
          },
        },
        {
          'type': 'inboxThreads/toggleProgress',
          'payload': {
            'inProgress': true,
          },
        },
        {
          'type': 'inboxThreads/toggleProgress',
          'payload': {
            'inProgress': false,
          },
        },
        {
          'type': 'inboxThreads/setNotifications',
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
