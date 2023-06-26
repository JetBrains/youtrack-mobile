import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import * as activityHelper from './activity/issue-activity__helper';
import * as types from './issue-action-types';
import createIssueActions from './issue-actions';
import Mocks from 'test/mocks';
import {actions} from './issue-reducers';
import {createActivityCommentActions} from './activity/issue-activity__comment-actions';
import {Store} from 'redux';
import API from 'components/api/api';
import {setApi} from 'components/api/api__instance';

let apiMock: API;

const getApi = () => apiMock;

const ISSUE_ID = 'test-id';
const issueActions = createIssueActions();
const mockStore = configureMockStore([thunk.withExtraArgument(getApi)]);


describe('Issue view actions', () => {
  let store: Store;
  let issueMock: {};
  let commentMock: {};
  beforeEach(() => {
    jest.resetAllMocks();
    issueMock = {
      id: ISSUE_ID,
    };
    commentMock = {
      id: 'fake-comment',
      text: 'fake-text',
    };
    apiMock = {
      issue: {
        getIssue: jest.fn().mockResolvedValue(issueMock),
        getIssueComments: jest.fn().mockResolvedValue([commentMock]),
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
    setApi(apiMock);
  });

  it('should load issue', async () => {
    await store.dispatch(issueActions.loadIssue());

    expect(apiMock.issue.getIssue).toHaveBeenCalledWith(ISSUE_ID);

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
      actionsIsActivitiesAPIEnabled = jest
        .spyOn(activityHelper, 'isIssueActivitiesAPIEnabled')
        .mockResolvedValueOnce(true);
      getIssueActivitiesEnabledTypes = jest
        .spyOn(activityHelper, 'getIssueActivitiesEnabledTypes')
        .mockResolvedValueOnce(issueActivityEnabledTypesMock);
    });
    afterEach(() => {
      actionsIsActivitiesAPIEnabled.mockRestore();
      getIssueActivitiesEnabledTypes.mockRestore();
    });
    it('should refresh issue details', async () => {
      await store.dispatch(issueActions.refreshIssue());
      expect(apiMock.issue.getIssue).toHaveBeenCalledWith(ISSUE_ID);
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
