import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as Mocks from '../../../../test/mocks';

import * as activityActions from './single-issue-activity__actions';
import * as issueCommentActions from './single-issue-activity__comment-actions';

import * as types from '../single-issue-action-types';
import * as activityHelper from './single-issue-activity__helper';

let APIMock;
const getApi = () => APIMock;
const ISSUE_ID = 'test-id';

const issueActivityAllTypes = activityHelper.getIssueActivityAllTypes();

const mockStore = configureMockStore([thunk.withExtraArgument(getApi)]);

describe('Issue activity', () => {
  let store;
  let issueMock;
  let commentMock;
  let activityPageMock;

  beforeEach(() => {
    issueMock = {id: ISSUE_ID};
    commentMock = {id: 'comment-id', text: 'comment-text'};
    activityPageMock = [{id: 'activity-id', added: [], removed: []}];

    APIMock = {
      issue: {
        getIssueComments: jest.fn(() => [commentMock]),
        getActivitiesPage: jest.fn(() => activityPageMock)
      }
    };

    store = mockStore({
      singleIssue: {issueId: ISSUE_ID, issue: issueMock}
    });
  });

  beforeEach(async () => {
    Mocks.default.setStorage({});
  });


  describe('Comments', function () {

    it('should load issue comments', async () => {
      await store.dispatch(issueCommentActions.loadIssueCommentsAsActivityPage());
      const dispatched = store.getActions();

      expect(APIMock.issue.getIssueComments).toHaveBeenCalledWith(issueMock.id);

      expect(dispatched[0]).toEqual({
        type: types.RECEIVE_ACTIVITY_API_AVAILABILITY,
        activitiesEnabled: false
      });

      expect(dispatched[1]).toEqual({
        type: types.RECEIVE_ACTIVITY_CATEGORIES,
        issueActivityTypes: issueActivityAllTypes,
        issueActivityEnabledTypes: issueActivityAllTypes
      });

      expect(dispatched[2]).toEqual({
        type: types.RECEIVE_ACTIVITY_PAGE,
        activityPage: activityHelper.convertCommentsToActivityPage([commentMock])
      });
    });

  });


  describe('Load Activities', function () {
    const categories = activityHelper.getActivityCategories(issueActivityAllTypes);

    it('should load issue activity page', async () => {
      await store.dispatch(activityActions.loadActivitiesPage());
      const dispatched = store.getActions();

      expect(APIMock.issue.getActivitiesPage).toHaveBeenCalledWith(ISSUE_ID, categories);

      expect(dispatched[0]).toEqual({
        type: types.RECEIVE_ACTIVITY_CATEGORIES,
        issueActivityTypes: issueActivityAllTypes,
        issueActivityEnabledTypes: issueActivityAllTypes
      });

      expect(dispatched[1]).toEqual({
        type: types.RECEIVE_ACTIVITY_PAGE,
        activityPage: []
      });

      expect(dispatched[2]).toEqual({
        type: types.RECEIVE_ACTIVITY_API_AVAILABILITY,
        activitiesEnabled: true
      });
      expect(dispatched[3]).toEqual({
        type: types.RECEIVE_ACTIVITY_PAGE,
        activityPage: activityPageMock
      });
    });
  });
});
