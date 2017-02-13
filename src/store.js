/* @flow */
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import * as agileBoardReducers from './views/agile-board/agile-board-reducers';

const middlewares = [thunk];

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger();
  middlewares.push(logger);
}

const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const reducer = combineReducers(agileBoardReducers);

const store = createStoreWithMiddleware(
  reducer,
  global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
