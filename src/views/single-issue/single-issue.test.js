import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import * as Mocks from '../../../test/mocks';

import * as actions from './single-issue-actions';
import * as activityCommentActions from './activity/single-issue-activity__comment-actions';
import * as types from './single-issue-action-types';

import * as activityHelper from './activity/single-issue-activity__helper';

let fakeApi;
const getApi = () => fakeApi;
const ISSUE_ID = 'test-id';

const mockStore = configureMockStore([thunk.withExtraArgument(getApi)]);

describe('Issue view actions', () => {
  let store;
  let fakeIssue;
  let fakeComment;

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
      singleIssue: {issueId: ISSUE_ID, issue: fakeIssue},
      issueActivity: {
        activityPage: []
      }
    });
  });

  it('should load issue', async () => {
    await store.dispatch(actions.loadIssue());

    fakeApi.issue.getIssue.should.have.been.calledWith(ISSUE_ID);
    const dispatched = store.getActions();
    expect(dispatched[0]).toEqual({type: types.SET_ISSUE_ID, issueId: fakeIssue.id});
    expect(dispatched[1]).toEqual({type: types.RECEIVE_ISSUE, issue: fakeIssue});
  });

  it('should add comment', async () => {
    Mocks.default.setStorage({});

    await store.dispatch(activityCommentActions.addComment(fakeComment));

    fakeApi.issue.submitComment.should.have.been.calledWith(ISSUE_ID, fakeComment);

    const dispatched = store.getActions();

    expect(dispatched[0]).toEqual({type: types.START_SUBMITTING_COMMENT});
    expect(dispatched[1]).toEqual({type: types.STOP_SUBMITTING_COMMENT});
    expect(dispatched[2]).toEqual({type: types.RECEIVE_ACTIVITY_API_AVAILABILITY, activitiesEnabled: false});
    expect(dispatched[4]).toEqual({
      type: types.RECEIVE_ACTIVITY_PAGE,
      activityPage: activityHelper.convertCommentsToActivityPage([fakeComment])
    });
  });


  describe('Refresh issue', () => {
    const issueCommentsSelectedTypeMock = 'IssueComments';
    const issueActivityEnabledTypesMock = [{
      id: issueCommentsSelectedTypeMock,
      name: 'Show comments'
    }];
    let actionsIsActivitiesAPIEnabled;
    let getIssueActivitiesEnabledTypes;

    beforeEach(() => {
      actionsIsActivitiesAPIEnabled = sinon.stub(activityHelper, 'isActivitiesAPIEnabled').returns(true);
      getIssueActivitiesEnabledTypes = sinon.stub(activityHelper, 'getIssueActivitiesEnabledTypes').returns(issueActivityEnabledTypesMock);
    });

    afterEach(() => {
      actionsIsActivitiesAPIEnabled.restore();
      getIssueActivitiesEnabledTypes.restore();
    });

    it('should refresh issue details', async () => {
      await store.dispatch(actions.refreshIssue());

      fakeApi.issue.getIssue.should.have.been.calledWith(ISSUE_ID);

      const dispatched = store.getActions();
      expect(dispatched[0]).toEqual({type: types.START_ISSUE_REFRESHING});
      expect(dispatched[dispatched.length - 1]).toEqual({type: types.STOP_ISSUE_REFRESHING});
    });

  });
});
