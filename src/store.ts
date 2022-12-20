import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {getApi} from 'components/api/api__instance';
import reducer from './reducers';
const middlewares = [thunk.withExtraArgument(getApi)];
const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
const store: any = createStoreWithMiddleware(
  reducer,
  global.__REDUX_DEVTOOLS_EXTENSION__ && global.__REDUX_DEVTOOLS_EXTENSION__(),
);
export default store;
