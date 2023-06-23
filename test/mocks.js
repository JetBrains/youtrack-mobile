import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {deepmerge} from 'deepmerge-ts';

import * as storage from 'components/storage/storage';
import Auth from 'components/auth/oauth2';
import {createProjectCustomFieldMock} from './mocks__custom-fields';
import {ResourceTypes} from 'components/api/api__resource-types';

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

function createArticleMock(...args) {
  return Object.assign(
    createIssueMock(),
    {
      $type: 'Article',
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
  return deepmerge(
    {
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
        appearance: {
          useAbsoluteDates: true,
        },
        issuesList: {},
        timetracking: {
          isTimeTrackingAvailable: true,
        },
      },
      userPermissions: {
        has: () => true,
      },
    },
    data
  );
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
  return deepmerge(
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

function uuid(isNumber) {
  uuid.id = (uuid.id || 1);
  return isNumber ? uuid.id++ : `${uuid.id++}`;
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
      scopes: 'scope# scope2',
      landingUrl: 'oauth://url',
    },
  };
}

function createAuthParamsMock() {
  return {
    'access_token': 'access-token',
    'refresh_token': 'refresh-token',
    'token_type': 'token-type',
  };
}

function createAuthMock(config) {
  return {
    ...(new Auth(config || createConfigMock())),
    getAuthorizationHeaders: () => ({Authorization: 'token type fake token'}),
  };
}

function createActivityCustomFieldMock(data = {}) {
  return deepmerge({
    $type: 'CustomFieldActivityItem',
    added: [{
      $type: 'StateBundleElement',
      color: {$type: 'FieldStyle', id: 3},
      id: '0-1',
      name: 'Fixed',
    }],
    author: {
      $type: 'User',
      avatarUrl: 'https://example.com/avatar',
      fullName: 'John Dow',
      id: '0-1',
      login: 'John.Dow',
      name: 'John Dow',
      ringId: '1234',
    },
    category: {
      $type: 'ActivityCategory',
      id: 'CustomFieldCategory',
    },
    removed: [],
    timestamp: uuid(true),
    target: {
      $type: 'Issue',
      created: 1,
      id: '0-1',
      usesMarkdown: true,
    },
  }, data);
}

function createActivityCommentMock(data = {}) {
  return deepmerge({
    $type: 'CommentActivityItem',
    added: [{
      text: 'Fixed',
    }],
    author: {
      $type: 'User',
      avatarUrl: 'https://example.com/avatar',
      fullName: 'John Dow',
      id: '0-1',
      login: 'John.Dow',
      name: 'John Dow',
      ringId: '1234',
    },
    category: {
      $type: 'ActivityCategory',
      id: 'CommentsCategory',
    },
    removed: [],
    timestamp: 1,
    target: {
      $type: 'IssueComment',
      created: 1,
      id: '0-1',
      usesMarkdown: true,
    },
  }, data);
}

function createThreadMock(data = {}) {
  return deepmerge(
    {
      id: `S-${uuid()}`,
      notified: 1,
      muted: false,
      messages: [{
        id: `S-message-${uuid()}`,
        read: false,
        timestamp: 0,
        activities: [createActivityCustomFieldMock()],
      }],
      subject: {
        target: {
          $type: 'jetbrains.charisma.persistent.Issue',
          id: 'id',
          idReadable: 'ISSUE-1',
          summary: 'Lorem ipsum',
        },
      },
    },
    data
  );
}

function reactReduxMockFn() {
  return () => jest.mock('react-redux', () => {
    return {
      ...jest.requireActual('react-redux'),
      useSelector: jest.fn().mockImplementation(() => true),
      useDispatch: jest.fn().mockImplementation(() => {}),
    };
  });
}

export default {
  setStorage,

  createIssueMock,
  createArticleMock,
  createIssueFieldMock: createIssuePriorityFieldMock,
  createProjectCustomFieldMock,
  createMockStore,

  navigatorMock,
  createCommentMock,

  randomSentence,

  createConfigMock,
  createAuthMock,
  createAuthParamsMock,
  createUserMock,
  createActivityCustomFieldMock,
  createActivityCommentMock,
  createThreadMock,

  reactReduxMockFn,
};
