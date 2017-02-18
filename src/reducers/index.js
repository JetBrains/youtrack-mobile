import {combineReducers} from 'redux';

import app from './reducers';
import agile from '../views/agile-board/board-reducers';

export default combineReducers({
  agile,
  app
});
