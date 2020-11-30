/* @flow */

import {combineReducers} from 'redux';

import agile from '../views/agile-board/board-reducers';
import app from './app-reducer';
import articles from '../views/articles/articles-reducers';
import creation from '../views/create-issue/create-issue-reducers';
import inbox from '../views/inbox/inbox-reducers';
import issueActivity from '../views/issue/activity/issue-activity__reducers';
import issueCommentActivity from '../views/issue/activity/issue-activity__comment-reducers';
import issueList from '../views/issues/issues-reducers';
import issueState from '../views/issue/issue-reducers';

export default combineReducers({
  agile,
  app,
  articles,
  creation,
  inbox,
  issueActivity,
  issueCommentActivity,
  issueList,
  issueState,
});
