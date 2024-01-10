import log from 'components/log/log';
import {getStorageState} from 'components/storage/storage';
import {RECEIVE_ISSUES} from 'views/issues/issues-reducers';
import {SET_HELPDESK_CONTEXT, SET_HELPDESK_MODE} from 'views/issues/issues-reducers';

import {Folder} from 'types/User';
import {IssueOnList} from 'types/Issue';
import {ReduxAction, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

const setHelpDeskMode = (): ReduxAction => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
) => {
  dispatch(SET_HELPDESK_MODE(true));
  dispatch(SET_HELPDESK_CONTEXT(getState().app.user?.profiles?.helpdesk?.helpdeskFolder as Folder));
};

const setTicketsFromCache = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  const cachedTickets: IssueOnList[] = getStorageState().helpdeskCache || [];
  if (cachedTickets.length > 0) {
    log.debug(`Loaded ${cachedTickets.length} cached tickets`);
    dispatch(RECEIVE_ISSUES(cachedTickets));
  }
};


export {
  setHelpDeskMode,
  setTicketsFromCache,
};
