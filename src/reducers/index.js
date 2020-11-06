import {combineReducers} from 'redux';

import app from './app-reducer';
import agile from '../views/agile-board/board-reducers';
import issueList from '../views/issue-list/issue-list-reducers';
import creation from '../views/create-issue/create-issue-reducers';
import singleIssue from '../views/issue/issue-reducers';
import issueActivity from '../views/issue/activity/issue-activity__reducers';
import issueCommentActivity from '../views/issue/activity/issue-activity__comment-reducers';
import inbox from '../views/inbox/inbox-reducers';

export default combineReducers({
  app,
  issueList,
  creation,
  singleIssue,
  issueActivity,
  issueCommentActivity,
  agile,
  inbox
});
