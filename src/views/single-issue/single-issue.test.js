import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import * as actions from './single-issue-actions';
import * as types from './single-issue-action-types';

import MockedStorage from '@react-native-community/async-storage';
import * as storage from '../../components/storage/storage';
import {Activity} from '../../components/activity/activity__category';

let fakeApi;
const getApi = () => fakeApi;
const ISSUE_ID = 'test-id';

const mockStore = configureMockStore([thunk.withExtraArgument(getApi)]);

describe('Issue view actions', () => {
  let store;
  let fakeIssue;
  let fakeComment;
  let sandbox;

  beforeEach(() => {
    fakeIssue = {
      id: ISSUE_ID
    };
    fakeComment = {id: 'fake-comment', text: 'fake-text'};
    fakeApi = {
      issue: {
        getIssue: sinon.stub().returns(fakeIssue),
        getIssueComments: sinon.stub().returns([fakeComment]),
        submitComment: sinon.stub().returns(fakeComment),
        getActivitiesPage: sinon.stub().returns([])
      }
    };
    store = mockStore({
      singleIssue: {issueId: ISSUE_ID, issue: fakeIssue}
    });
  });

  it('should load issue', async () => {
    await store.dispatch(actions.loadIssue());

    fakeApi.issue.getIssue.should.have.been.calledWith(ISSUE_ID);
    const dispatched = store.getActions();
    expect(dispatched[0]).toEqual({type: types.SET_ISSUE_ID, issueId: fakeIssue.id});
    expect(dispatched[1]).toEqual({type: types.RECEIVE_ISSUE, issue: fakeIssue});
  });

  it('should load issue comments', async () => {
    await store.dispatch(actions.loadIssueComments());

    const dispatched = store.getActions();
    fakeApi.issue.getIssueComments.should.have.been.calledWith(ISSUE_ID);
    expect(dispatched[0]).toEqual({type: types.RECEIVE_COMMENTS, comments: [fakeComment]});
  });

  it('should refresh issue and comments', async () => {
    await store.dispatch(actions.refreshIssue());

    fakeApi.issue.getIssue.should.have.been.calledWith(ISSUE_ID);
    fakeApi.issue.getIssueComments.should.have.been.calledWith(ISSUE_ID);

    const dispatched = store.getActions();
    expect(dispatched[0]).toEqual({type: types.START_ISSUE_REFRESHING});
    expect(dispatched[dispatched.length - 1]).toEqual({type: types.STOP_ISSUE_REFRESHING});
  });

  it('should add comment', async () => {
    await store.dispatch(actions.addComment(fakeComment));

    fakeApi.issue.submitComment.should.have.been.calledWith(ISSUE_ID, fakeComment);

    const dispatched = store.getActions();
    expect(dispatched[0]).toEqual({type: types.START_SUBMITTING_COMMENT});
    expect(dispatched[1]).toEqual({type: types.RECEIVE_COMMENT, comment: fakeComment});
    expect(dispatched[2]).toEqual({type: types.HIDE_COMMENT_INPUT});
    expect(dispatched[3]).toEqual({type: types.STOP_SUBMITTING_COMMENT});
  });


  describe('Activities', function () {
    const issueCommentsSelectedTypeMock = 'IssueComments';
    const issueActivityEnabledTypesMock = [{
      id: issueCommentsSelectedTypeMock,
      name: 'Show comments'
    }];

    beforeEach(async () => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([
        ['YT_ISSUE_ACTIVITIES_ENABLED_TYPES', issueActivityEnabledTypesMock],
      ]));
      await storage.populateStorage();
    });

    it('should load issue activities', async () => {
      await store.dispatch(actions.loadActivitiesPage([]));

      const dispatched = store.getActions();
      const categories = Activity.ActivityCategories[issueCommentsSelectedTypeMock];

      fakeApi.issue.getActivitiesPage.should.have.been.calledWith(ISSUE_ID, categories);

      expect(dispatched[0]).toEqual({
        type: types.RECEIVE_ACTIVITY_CATEGORIES,

        issueActivityTypes: actions.getIssueActivityAllTypes(),
        issueActivityEnabledTypes: issueActivityEnabledTypesMock
      });

      expect(dispatched[1]).toEqual({
        type: types.RECEIVE_ACTIVITY_PAGE,
        activityPage: []
      });
    });

  });
});
