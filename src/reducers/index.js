/* @flow */

import {combineReducers} from 'redux';

import agile from '../views/agile-board/board-reducers';
import app from './app-reducer';
import article from '../views/article/article-reducers';
import articles from '../views/knowledge-base/knowledge-base-reducers';
import creation from '../views/create-issue/create-issue-reducers';
import inbox from '../views/inbox/inbox-reducers';
import issueActivity from '../views/issue/activity/issue-activity__reducers';
import issueCommentActivity from '../views/issue/activity/issue-activity__comment-reducers';
import issueList from '../views/issues/issues-reducers';
import issueState from '../views/issue/issue-reducers';

import type {AgilePageState} from '../views/agile-board/board-reducers';
import type {RootState} from './app-reducer';
import type {ArticleState} from '../views/article/article-reducers';
import type {KnowledgeBaseState} from '../views/knowledge-base/knowledge-base-reducers';
import type {CreateIssueState} from '../views/create-issue/create-issue-reducers';
import type {InboxState} from '../views/inbox/inbox-reducers';
import type {State as ActivityState} from '../views/issue/activity/issue-activity__reducers';
import type {State as IssueCommentActivityState} from '../views/issue/activity/issue-activity__comment-reducers';
import type {IssuesState} from '../views/issues/issues-reducers';
import type {State as IssueState} from '../views/issue/issue-reducers';

export type AppState = {
  agile: AgilePageState,
  app: RootState,
  article: ArticleState,
  articles: KnowledgeBaseState,
  creation: CreateIssueState,
  inbox: InboxState,
  issueActivity: ActivityState,
  issueCommentActivity: IssueCommentActivityState,
  issueList: IssuesState,
  issueState: IssueState,
};

export default combineReducers({
  agile,
  app,
  article,
  articles,
  creation,
  inbox,
  issueActivity,
  issueCommentActivity,
  issueList,
  issueState,
});
