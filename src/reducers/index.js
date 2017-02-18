import {combineReducers} from 'redux';

import app from './reducers';
import agile from '../views/agile-board/board-reducers';
import issueList from '../views/issue-list/issue-list-reducers';

export default combineReducers({
  app,
  issueList,
  agile
});
