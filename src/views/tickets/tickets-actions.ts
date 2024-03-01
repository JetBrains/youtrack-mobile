import log from 'components/log/log';
import {EVERYTHING_SEARCH_CONTEXT} from 'components/search/search-context';
import {getStorageState} from 'components/storage/storage';
import {RECEIVE_ISSUES} from 'views/issues/issues-reducers';
import {SET_HELPDESK_CONTEXT, SET_HELPDESK_MODE} from 'views/issues/issues-reducers';

import {IssueOnList} from 'types/Issue';
import {ReduxAction, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

const setHelpDeskMode = (): ReduxAction => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
) => {
  dispatch(SET_HELPDESK_MODE(true));
  const helpdeskFolder = getState().app.user?.profiles?.helpdesk?.helpdeskFolder;
  dispatch(SET_HELPDESK_CONTEXT(helpdeskFolder || EVERYTHING_SEARCH_CONTEXT));
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
