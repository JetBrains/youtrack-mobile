import * as issuesActions from 'views/issues/issues-actions';
import {SET_HELPDESK} from 'views/issues/issues-action-types';

import {ReduxAction, ReduxThunkDispatch} from 'types/Redux';


const openContextSelect = (): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  dispatch(issuesActions.openContextSelect('Tickets list context select'));
};

const setHelpDeskMode = (): ReduxAction => (dispatch: ReduxThunkDispatch) => {
  dispatch({
    type: SET_HELPDESK,
    helpDesk: true,
  });
};


export {
  openContextSelect,
  setHelpDeskMode,
};

