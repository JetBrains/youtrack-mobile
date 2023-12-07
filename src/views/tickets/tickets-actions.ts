import {SET_HELPDESK_CONTEXT, SET_HELPDESK_MODE} from 'views/issues/issues-action-types';
import {ReduxAction, ReduxStateGetter, ReduxThunkDispatch} from 'types/Redux';

const setHelpDeskMode = (): ReduxAction => (
  dispatch: ReduxThunkDispatch,
  getState: ReduxStateGetter
) => {
  dispatch({
    type: SET_HELPDESK_MODE,
    helpDeskMode: true,
  });
  dispatch({
    type: SET_HELPDESK_CONTEXT,
    helpdeskSearchContext: getState().app.user?.profiles?.helpdesk?.helpdeskFolder,
  });
};

export {
  setHelpDeskMode,
};
