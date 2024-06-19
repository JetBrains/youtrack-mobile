import log from 'components/log/log';
import {EVERYTHING_SEARCH_CONTEXT} from 'components/search/search-context';
import {getStorageState} from 'components/storage/storage';
import {RECEIVE_ISSUES, SET_HELPDESK_PROJECTS} from 'views/issues/issues-reducers';
import {SET_HELPDESK_CONTEXT, SET_HELPDESK_MODE} from 'views/issues/issues-reducers';
import {until} from 'util/util';

import {IssueOnList} from 'types/Issue';
import {ProjectHelpdesk} from 'types/Project';
import {ReduxAction, ReduxAPIGetter, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

const setHelpDeskMode = (): ReduxAction => (dispatch: ReduxThunkDispatch, getState: ReduxStateGetter) => {
  dispatch(SET_HELPDESK_MODE(true));
  const helpdeskFolder = getState().app.user?.profiles?.helpdesk?.helpdeskFolder;
  dispatch(SET_HELPDESK_CONTEXT(helpdeskFolder || EVERYTHING_SEARCH_CONTEXT));
};

const setTicketsFromCache = (): ReduxAction => async (dispatch: ReduxThunkDispatch) => {
  const cachedTickets: IssueOnList[] = getStorageState().helpdeskCache || [];
  if (cachedTickets.length > 0) {
    log.info(`Tickets: Cached tickets loaded`);
    dispatch(RECEIVE_ISSUES(cachedTickets));
  }
};

const setHelpdeskProjects = (): ReduxAction => async (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter,
  getApi: ReduxAPIGetter,
) => {
    const [error, projects] = await until<ProjectHelpdesk[]>(getApi().helpDesk.getProjects());
    if (error) {
      log.warn(error);
    } else {
      log.info(`Tickets: Loaded helpdesk projects`);
      dispatch(SET_HELPDESK_PROJECTS(projects));
    }
  };

const init = (): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  dispatch(setHelpDeskMode());
  dispatch(setTicketsFromCache());
  dispatch(setHelpdeskProjects());
};

export {init, setHelpDeskMode, setTicketsFromCache, setHelpdeskProjects};
