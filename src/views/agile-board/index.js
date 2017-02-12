/* @flow */
import React, {Component} from 'react';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import * as reducers from './reducers';
import AgileBoardContainer from './agile-board';
import Api from '../../components/api/api';
import type Auth from '../../components/auth/auth';

const logger = createLogger();
const createStoreWithMiddleware = applyMiddleware(thunk, logger)(createStore);
const reducer = combineReducers(reducers);
const store = createStoreWithMiddleware(reducer);

type Props = {
  auth: Auth
};

export default class AgileBoard extends Component {
  props: Props;

  render() {
    const {auth} = this.props;
    const api = new Api(auth);
    return (
      <Provider store={store}>
        <AgileBoardContainer auth={auth} api={api}/>
      </Provider>
    );
  }
}
