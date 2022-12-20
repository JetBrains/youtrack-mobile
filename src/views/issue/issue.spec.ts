import configureMockStore from 'redux-mock-store';
import sinon from 'sinon';
import thunk from 'redux-thunk';
import * as activityHelper from './activity/issue-activity__helper';
import createIssueActions from './issue-actions';
import * as types from './issue-action-types';
import Mocks from '../../../test/mocks';
import {actions} from './issue-reducers';
import {createActivityCommentActions} from './activity/issue-activity__comment-actions';
let apiMock;

const getApi = () => apiMock;

const ISSUE_ID = 'test-id';
const issueActions = createIssueActions();
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
    commentMock = {
      id: 'fake-comment',
      text: 'fake-text',
    };
    apiMock = {
      issue: {
        getIssue: sinon.stub().returns(issueMock),
        getIssueComments: sinon.stub().returns([commentMock]),
        submitDraftComment: jest.fn(),
        getActivitiesPage: jest.fn(),
      },
    };
    store = mockStore({
      issueState: {
        issueId: ISSUE_ID,
        issue: issueMock,
      },
      issueActivity: {
        activityPage: [],
      },
    });
  });
  it('should load issue', async () => {
    await store.dispatch(issueActions.loadIssue());
    apiMock.issue.getIssue.should.have.been.calledWith(ISSUE_ID);
    const dispatched = store.getActions();
    expect(dispatched[0]).toEqual({
      type: actions.SET_ISSUE_ID.type,
      payload: {
        issueId: issueMock.id,
      },
    });
    expect(dispatched[1]).toEqual({
      type: actions.RECEIVE_ISSUE.type,
      payload: {
        issue: issueMock,
      },
    });
  });
  it('should add comment', async () => {
    Mocks.setStorage();
    jest
      .spyOn(activityHelper, 'isIssueActivitiesAPIEnabled')
      .mockResolvedValueOnce(true);
    apiMock.issue.submitDraftComment.mockResolvedValueOnce(commentMock);
    const activityPageMock = [{}];
    apiMock.issue.getActivitiesPage.mockResolvedValueOnce(activityPageMock);
    await store.dispatch(
      createActivityCommentActions().submitDraftComment(commentMock),
    );
    await expect(apiMock.issue.submitDraftComment).toHaveBeenCalledWith(
      ISSUE_ID,
      commentMock,
    );
    const issueActivityTypes = [
      {
        id: 'IssueComments',
        name: 'Comments',
      },
      {
        id: 'IssueHistory',
        name: 'Issue history',
      },
      {
        id: 'TimeTracking',
        name: 'Spent time',
      },
      {
        id: 'IssueVcs',
        name: 'VCS changes',
      },
    ];
    const storeActions = store.getActions();
    expect(storeActions[0]).toEqual({
      type: types.SET_EDITING_COMMENT,
      comment: null,
    });
    expect(storeActions[1]).toEqual({
      type: types.RECEIVE_ACTIVITY_CATEGORIES,
      issueActivityTypes: issueActivityTypes,
      issueActivityEnabledTypes: issueActivityTypes,
    });
    expect(storeActions[2]).toEqual({
      type: types.RECEIVE_ACTIVITY_API_AVAILABILITY,
      activitiesEnabled: true,
    });
  });
  describe('Refresh issue', () => {
    const issueCommentsSelectedTypeMock = 'IssueComments';
    const issueActivityEnabledTypesMock = [
      {
        id: issueCommentsSelectedTypeMock,
        name: 'Show comments',
      },
    ];
    let actionsIsActivitiesAPIEnabled;
    let getIssueActivitiesEnabledTypes;
    beforeEach(() => {
      actionsIsActivitiesAPIEnabled = sinon
        .stub(activityHelper, 'isIssueActivitiesAPIEnabled')
        .returns(true);
      getIssueActivitiesEnabledTypes = sinon
        .stub(activityHelper, 'getIssueActivitiesEnabledTypes')
        .returns(issueActivityEnabledTypesMock);
    });
    afterEach(() => {
      actionsIsActivitiesAPIEnabled.restore();
      getIssueActivitiesEnabledTypes.restore();
    });
    it('should refresh issue details', async () => {
      await store.dispatch(issueActions.refreshIssue());
      apiMock.issue.getIssue.should.have.been.calledWith(ISSUE_ID);
      const dispatched = store.getActions();
      expect(dispatched[0]).toEqual({
        type: actions.START_ISSUE_REFRESHING.type,
      });
      expect(dispatched[dispatched.length - 1]).toEqual({
        type: actions.START_ISSUE_REFRESHING.type,
      });
    });
  });
});