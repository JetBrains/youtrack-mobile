import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import MockedStorage from '@react-native-community/async-storage';


import * as activityActions from './single-issue-activity__actions';
import * as issueCommentActions from './single-issue-activity__comment-actions';

import * as types from '../single-issue-action-types';
import * as storage from '../../../components/storage/storage';
import * as activity from './single-issue-activity__helper';

import {Activity} from '../../../components/activity/activity__category';

let APIMock;
const getApi = () => APIMock;
const ISSUE_ID = 'test-id';

const issueCommentsSelectedTypeMock = 'IssueComments';
const issueActivityEnabledTypesMock = [{
  id: issueCommentsSelectedTypeMock,
  name: 'Show comments'
}];
const mockStore = configureMockStore([thunk.withExtraArgument(getApi)]);


describe('Issue activity', () => {
  let store;
  let sandbox;
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

    sandbox = sinon.sandbox.create();
  });

  const categories = Activity.ActivityCategories[issueCommentsSelectedTypeMock];


  describe('Comments', function () {

    it('should load issue comments', async () => {
      await store.dispatch(issueCommentActions.loadIssueComments());
      const dispatched = store.getActions();

      expect(APIMock.issue.getIssueComments).toHaveBeenCalledWith(issueMock.id);

      expect(dispatched[0]).toEqual({
        type: types.RECEIVE_COMMENTS,
        comments: [commentMock]
      });
    });

  });


  describe('Load Activities', function () {

    beforeEach(async () => {
      sandbox.stub(MockedStorage, 'multiGet').returns(Promise.resolve([
        ['YT_ISSUE_ACTIVITIES_ENABLED_TYPES', issueActivityEnabledTypesMock],
      ]));
      await storage.populateStorage();
    });

    it('should load issue activity page', async () => {
      await store.dispatch(activityActions.loadActivitiesPage());
      const dispatched = store.getActions();

      expect(APIMock.issue.getActivitiesPage).toHaveBeenCalledWith(ISSUE_ID, categories);

      expect(dispatched[0]).toEqual({
        type: types.RECEIVE_ACTIVITY_API_AVAILABILITY,
        activitiesEnabled: true
      });

      expect(dispatched[1]).toEqual({
        type: types.RECEIVE_ACTIVITY_CATEGORIES,

        issueActivityTypes: activity.getIssueActivityAllTypes(),
        issueActivityEnabledTypes: issueActivityEnabledTypesMock
      });

      expect(dispatched[2]).toEqual({
        type: types.RECEIVE_ACTIVITY_PAGE,
        activityPage: activityPageMock
      });
    });
  });
});
