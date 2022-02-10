import configureMockStore from 'redux-mock-store';
import MockedStorage from '@react-native-community/async-storage';
import sinon from 'sinon';
import thunk from 'redux-thunk';

import * as storage from '../src/components/storage/storage';
import Auth from '../src/components/auth/oauth2';
import {createProjectCustomFieldMock} from './mocks__custom-fields';
import {ResourceTypes} from '../src/components/api/api__resource-types';

const sandbox = sinon.sandbox.create();

async function mockStorage() {
  sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([]));
  return await storage.populateStorage();
}

async function setStorage(state = {}) {
  return await storage.__setStorageState(state);
}


function createIssuePriorityFieldMock(...args) {
  return Object.assign({
    projectCustomField: {
      field: {
        name: 'priority',
      },
      bundle: {
        id: '',
        $type: 'EnumBundle',
      },
      ordinal: 2,
      canBeEmpty: false,
    },
    value: {
      localizedName: null,
      color: {
        id: '17',
        $type: 'FieldStyle',
      },
      archived: false,
      name: 'Normal',
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
      fields: [createIssuePriorityFieldMock()],
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
  updater: jest.fn(),
};

function createUserMock(data = {}) {
  return Object.assign({
    $type: ResourceTypes.USER,
    id: uuid(),
    ringId: uuid(),
    fullName: randomWord(),
    name: randomWord(),
    login: randomWord(),
    avatarUrl: 'https://unsplash.it/32/32',
    guest: false,
    profiles: {
      general: {
        useMarkup: true,
      },
      notifications: {},
      appearance: {},
      issuesList: {},
      timetracking: {},
    },
    userPermissions: {
      has: () => true,
    },
  }, data);
}

function createProjectMock(data) {
  return Object.assign({
    shortName: uuid().toString().toUpperCase(),
    name: uuid(),
    ringId: uuid(),
    iconUrl: null,
    archived: false,
    id: uuid(),
    $type: ResourceTypes.PROJECT,
    plugins: {
      timeTrackingSettings: {
        enabled: true,
      },
    },
  }, data);
}


function createCommentMock(data = {}) {
  return Object.assign(
    {
      $type: ResourceTypes.ISSUE_COMMENT,
      id: uuid(),
      usesMarkdown: true,
      text: randomSentence(3),
      author: createUserMock(),
      deleted: false,
      created: getPastTime(),
      draftComment: {
        text: randomWord(),
      },
      issue: {
        project: createProjectMock(),
      },

    },
    data
  );
}

function getRecentTime() {
  return Date.now();
}

function getPastTime() {
  const date = getRecentTime();
  return date - 1000;
}

function uuid() {
  uuid.id = (uuid.id || 1);
  return `${uuid.id++}`;
}

function randomWord() {
  return `A${uuid()}`;
}

function randomSentence(n) {
  const word = randomWord();
  return n ? word.repeat(n) : word;
}

function createConfigMock() {
  return {
    backendUrl: 'https://youtrack.cloud',
    auth: {
      serverUri: 'https://youtrack.cloud/hub',
      clientId: 'client-id',
      clientSecret: 'client-secret',
      youtrackServiceId: 'yt-service-id',
      scopes: 'scope1 scope2',
      landingUrl: 'ytoauth://landing.url',
    },
  };
}

function createAuthParamsMock() {
  return {
    access_token: 'fake-access-token',
    refresh_token: 'fake-refresh-token',
    token_type: 'bearer',
  };
}

function createAuthMock(config) {
  return {
    ...(new Auth(config || createConfigMock())),
    getAuthorizationHeaders: () => ({Authorization: 'token type fake token'}),
  };
}

export default {
  sandbox,
  mockStorage,
  setStorage,

  createIssueMock,
  createIssueFieldMock: createIssuePriorityFieldMock,
  createProjectCustomFieldMock,
  createMockStore,

  navigatorMock,
  createCommentMock,

  randomSentence,

  createConfigMock,
  createAuthMock,
  createAuthParamsMock,
};
