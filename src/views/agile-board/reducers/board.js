/* @flow */
import * as types from '../actions/actionTypes';
import type {SprintFull} from '../../../flow/Agile';

type BoardState = {
  isLoading: boolean,
  sprint: ?SprintFull
};

const initialState: BoardState = {
  isLoading: false,
  sprint: null
};

export default function board(state: BoardState = initialState, action: Object = {}): BoardState {
  switch (action.type) {
    case types.START_SPRINT_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case types.STOP_SPRINT_LOADING:
      return {
        ...state,
        isLoading: false
      };
    case types.RECEIVE_SPRINT:
      return {
        ...state,
        sprint: action.sprint
      };
    default:
      return state;
  }
}
