import {SET_HELPDESK_CONTEXT, SET_HELPDESK_MODE} from 'views/issues/issues-reducers';
import {ReduxAction, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';
import {Folder} from 'types/User';

const setHelpDeskMode = (): ReduxAction => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
) => {
  dispatch(SET_HELPDESK_MODE(true));
  dispatch(SET_HELPDESK_CONTEXT(getState().app.user?.profiles?.helpdesk?.helpdeskFolder as Folder));
};

export {
  setHelpDeskMode,
};
