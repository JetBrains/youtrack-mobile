import Api from 'components/api/api';
import {AppState} from 'reducers';


export type ReduxAction = (
  dispatch: (arg0: any) => any,
  getState: () => AppState,
  getApi: () => Api
) => Promise<any>;
