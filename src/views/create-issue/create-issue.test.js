import * as actions from './create-issue-actions';
import * as types from './create-issue-action-types';

import {__setStorageState} from '../../components/storage/storage';
import {setApi} from '../../components/api/api__instance';

import mocks from '../../../test/mocks';

let apiMock;
const getApi = () => apiMock;
const createStoreMock = mocks.createMockStore(getApi);
const PROJECT_ID_MOCK = 'PROJECT_ID';


describe('<CreateIssue/>', () => {
  let stateMock;
  let ownPropsMock;
  let issueMock;
  let store;
  let storeActions;

  beforeEach(async () => {
    await __setStorageState({});
    issueMock = mocks.createIssueMock({project: {id: PROJECT_ID_MOCK}});
    createStore();
  });

  describe('Actions', () => {
    it('should read stored draft ID', async () => {
      await __setStorageState({projectId: PROJECT_ID_MOCK});
      await store.dispatch(actions.loadStoredProject());
      storeActions = store.getActions();

      expect(storeActions[0]).toEqual({
        type: types.SET_DRAFT_PROJECT_ID,
        projectId: PROJECT_ID_MOCK,
      });
    });
  });


  function createStore() {
    apiMock = {
      auth: {getAuthorizationHeaders: jest.fn()},
    };
    setApi(apiMock);
    stateMock = {
      app: {
        issuePermissions: {},
      },
      creation: {
        processing: false,
        attachingImage: null,
        predefinedDraftId: null,
        issue: issueMock,
      },
    };
    ownPropsMock = {};
    store = createStoreMock(stateMock, ownPropsMock);
  }
});
