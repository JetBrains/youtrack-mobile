import MockedStorage from '@react-native-community/async-storage';
import * as storage from '../src/components/storage/storage';
import sinon from 'sinon';
import type {StorageState} from '../src/components/storage/storage';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';

const sandbox = sinon.sandbox.create();

async function mockStorage() {
  sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([]));
  return await storage.populateStorage();
}

async function setStorage(state: StorageState) {
  return await storage.__setStorageState(state);
}


function createIssuePriorityFieldMock(...args) {
  return Object.assign({
    projectCustomField: {
      field: {
        name: 'priority'
      },
      bundle: {
        id: '',
        $type: 'EnumBundle'
      },
      ordinal: 2,
      canBeEmpty: false
    },
    value: {
      localizedName: null,
      color: {
        id: '17',
        $type: 'FieldStyle'
      },
      archived: false,
      name: 'Normal'
    },
    localizedName: null,
    color: {id: '17', $type: 'FieldStyle'},
  }, ...args);
}

function createIssueMock(...args) {
  return Object.assign(
    {
      $type: 'Issue',
      id: '00-00',
      summary: 'Issue test summary',
      description: 'Issue test description',
      fields: [createIssuePriorityFieldMock()]
    },
    ...args
  );
}

function createMockStore(middlewareArgument) {
  const middleware = [thunk.withExtraArgument(middlewareArgument)];
  return configureMockStore(middleware);
}

const navigatorMock = {
  context: {},
  dispatch: jest.fn(),
  props: {onNavigationStateChange: jest.fn()},
  refs: {},
  state: {nav: {}},
  subs: {remove: jest.fn()},
  updater: jest.fn()
};


export default {
  sandbox,
  mockStorage,
  setStorage,

  createIssueMock,
  createIssueFieldMock: createIssuePriorityFieldMock,
  createMockStore,

  navigatorMock
};
