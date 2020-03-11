import React from 'react';

import {shallow} from 'enzyme';
import toJson from 'enzyme-to-json';

import CreateIssueConnected from './create-issue';
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
  let wrapper;
  let storeActions;

  beforeEach(async () => {
    await __setStorageState({});
    issueMock = mocks.createIssueMock({project: {id: PROJECT_ID_MOCK}});
    createStore();
  });

  beforeEach(() => render(issueMock));

  describe('Render', () => {

    describe('Component', () => {
      it('should match a snapshot', () => {
        expect(toJson(wrapper)).toMatchSnapshot();
      });

      it('should render component', () => {
        expect(findByTestId('createIssue')).toHaveLength(1);
      });

      it('should render fields', () => {
        expect(findByTestId('createIssueFields')).toHaveLength(1);
      });

      it('should render summary', () => {
        expect(findByTestId('createIssueSummary')).toHaveLength(1);
      });
    });

    describe('Render attachments block', () => {
      it('should render attachments', () => {
        expect(findByTestId('createIssueAttachmentRow')).toHaveLength(1);
      });

      it('should render attach file button', () => {
        expect(findByTestId('createIssueAttachmentButton')).toHaveLength(1);
      });

    });
  });


  describe('Actions', () => {
    it('should read stored draft ID', async () => {
      await __setStorageState({projectId: PROJECT_ID_MOCK});
      await store.dispatch(actions.loadStoredProject());
      storeActions = store.getActions();

      expect(storeActions[0]).toEqual({
        type: types.SET_DRAFT_PROJECT_ID,
        projectId: PROJECT_ID_MOCK
      });
    });
  });


  function render(issue) {
    wrapper = shallow(<CreateIssueConnected store={store} issue={issue}/>).shallow();
  }

  function findByTestId(testId) {
    return wrapper && wrapper.find({testID: testId});
  }

  function createStore() {
    apiMock = {
      auth: {getAuthorizationHeaders: jest.fn()}
    };
    setApi(apiMock);
    stateMock = {
      app: {
        issuePermissions: {}
      },
      creation: {
        processing: false,
        attachingImage: null,
        predefinedDraftId: null,
        issue: issueMock
      }
    };
    ownPropsMock = {};
    store = createStoreMock(stateMock, ownPropsMock);
  }
});
