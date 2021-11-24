import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';

import Mocks from '../../../test/mocks';

import * as actions from './issue-actions';
import * as activityCommentActions from './activity/issue-activity__comment-actions';
import * as types from './issue-action-types';

import * as activityHelper from './activity/issue-activity__helper';


let apiMock;
const getApi = () => apiMock;
const ISSUE_ID = 'test-id';

const mockStore = configureMockStore([thunk.withExtraArgument(getApi)]);

describe('Issue view actions', () => {
  let store;
  let issueMock;
  let commentMock;

  beforeEach(() => {
    jest.restoreAllMocks();

    issueMock = {
      id: ISSUE_ID,
    };
    commentMock = {id: 'fake-comment', text: 'fake-text'};
    apiMock = {
      issue: {
        getIssue: sinon.stub().returns(issueMock),
        getIssueComments: sinon.stub().returns([commentMock]),
        submitDraftComment: jest.fn(),
        getActivitiesPage: jest.fn(),
      },
    };
    store = mockStore({
      issueState: {issueId: ISSUE_ID, issue: issueMock},
      issueActivity: {
        activityPage: [],
      },
    });
  });

  it('should load issue', async () => {
    await store.dispatch(actions.loadIssue());

    apiMock.issue.getIssue.should.have.been.calledWith(ISSUE_ID);
    const dispatched = store.getActions();
    expect(dispatched[0]).toEqual({type: types.SET_ISSUE_ID, issueId: issueMock.id});
    expect(dispatched[1]).toEqual({type: types.RECEIVE_ISSUE, issue: issueMock});
  });

  it('should add comment', async () => {
    Mocks.setStorage();
    jest.spyOn(activityHelper, 'isIssueActivitiesAPIEnabled').mockResolvedValueOnce(true);
    apiMock.issue.submitDraftComment.mockResolvedValueOnce(commentMock);
    const activityPageMock = [{}];
    apiMock.issue.getActivitiesPage.mockResolvedValueOnce(activityPageMock);

    await store.dispatch(activityCommentActions.submitDraftComment(commentMock));

    await expect(apiMock.issue.submitDraftComment).toHaveBeenCalledWith(ISSUE_ID, commentMock);

    const storeActions = store.getActions();
    expect(storeActions[0]).toEqual({type: types.SET_EDITING_COMMENT, comment: null});
    expect(storeActions[1]).toEqual({
      type: types.RECEIVE_ACTIVITY_CATEGORIES,
      issueActivityTypes: [
        {id: 'IssueComments', name: 'Comments'},
        {id: 'IssueHistory', name: 'History'},
        {id: 'TimeTracking', name: 'Work'},
        {id: 'IssueVcs', name: 'VCS changes'},
      ],
      issueActivityEnabledTypes: [
        {id: 'IssueComments', name: 'Comments'},
        {id: 'IssueHistory', name: 'History'},
        {id: 'TimeTracking', name: 'Work'},
        {id: 'IssueVcs', name: 'VCS changes'},
      ],
    });
    expect(storeActions[2]).toEqual({type: types.RECEIVE_ACTIVITY_API_AVAILABILITY, activitiesEnabled: true});
  });


  describe('Refresh issue', () => {
    const issueCommentsSelectedTypeMock = 'IssueComments';
    const issueActivityEnabledTypesMock = [{
      id: issueCommentsSelectedTypeMock,
      name: 'Show comments',
    }];
    let actionsIsActivitiesAPIEnabled;
    let getIssueActivitiesEnabledTypes;

    beforeEach(() => {
      actionsIsActivitiesAPIEnabled = sinon.stub(activityHelper, 'isIssueActivitiesAPIEnabled').returns(true);
      getIssueActivitiesEnabledTypes = sinon.stub(activityHelper, 'getIssueActivitiesEnabledTypes').returns(issueActivityEnabledTypesMock);
    });

    afterEach(() => {
      actionsIsActivitiesAPIEnabled.restore();
      getIssueActivitiesEnabledTypes.restore();
    });

    it('should refresh issue details', async () => {
      await store.dispatch(actions.refreshIssue());

      apiMock.issue.getIssue.should.have.been.calledWith(ISSUE_ID);

      const dispatched = store.getActions();
      expect(dispatched[0]).toEqual({type: types.START_ISSUE_REFRESHING});
      expect(dispatched[dispatched.length - 1]).toEqual({type: types.STOP_ISSUE_REFRESHING});
    });

  });
});
