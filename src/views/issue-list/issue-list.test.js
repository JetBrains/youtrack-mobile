import * as actions from './issue-list-actions';
import * as types from './issue-list-action-types';
import sinon from 'sinon';
import {AsyncStorage as MockedStorage} from 'react-native';

describe.only('Issue list actions', () => {
  let dispatch;
  let getState;
  let sandbox;
  const TEST_QUERY = 'test-query';

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    const state = {
      app: {
        auth: {
          currentUser: {id: 'current-user'}
        }
      }
    };
    dispatch = sinon.spy();
    getState = () => state;
  });

  afterEach(() => sandbox.restore());

  it('should set issues query', () => {
    actions
      .setIssuesQuery(TEST_QUERY)
      .should.deep.equal({type: types.SET_ISSUES_QUERY, query: TEST_QUERY});
  });

  it('should read stored query', async () => {
    sandbox.stub(MockedStorage, 'getItem', () => new Promise(resolve => resolve(TEST_QUERY)));
    await actions.readStoredIssuesQuery()(dispatch);

    dispatch.should.have.been.calledWith({type: types.SET_ISSUES_QUERY, query: TEST_QUERY});
  });

  it('should load query assist suggestions if query is not empty', async () => {
    const suggestions = [{id: 'test'}];
    const apiMock = {
      getQueryAssistSuggestions: () => new Promise(resolve => resolve(suggestions))
    };
    await actions.suggestIssuesQuery(TEST_QUERY, 4)(dispatch, getState, () => apiMock);

    dispatch.should.have.been.calledWith({type: types.SUGGEST_QUERY, suggestions});
  });

  it('should load saved query and last searches if query is empty', async () => {
    const savedQueries = [
      {id: 'saved', owner: {ringId: 'current-user'}},
      {id: 'saved-not-own', owner: {ringId: 'other-user'}}
    ];
    sinon.stub(MockedStorage,
      'getItem',
      () => new Promise(resolve => resolve(JSON.stringify(['last-query'])))
    );

    const apiMock = {
      getSavedQueries: () => new Promise(resolve => resolve(savedQueries))
    };

    await actions.suggestIssuesQuery('', 0)(dispatch, getState, () => apiMock);

    dispatch.should.have.been.calledWith({
      type: types.SUGGEST_QUERY,
      suggestions: [savedQueries[0], {name: 'last-query', query: 'last-query'}]
    });
  });

  it('should clear query assist suggestions', () => {
    actions
      .clearAssistSuggestions()
      .should.deep.equal({type: types.CLEAR_SUGGESTIONS});
  });

});
