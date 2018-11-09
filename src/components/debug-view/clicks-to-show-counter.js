/* @flow */
import {notify} from '../notification/notification';

const NEXT_CLICK_MAX_TIMEOUT = 1000;
const CLICKS_TO_SHOW_NOTIFICATION = 3;
const CLICKS_TO_ACTION = 6;

let timeoutId = null;
let counter = 0;

function increaseCounter() {
  counter++;
}

function resetCounter() {
  counter = 0;
}

export default function clicksCounter(actionToPerform: Function, description: string = '') {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
  increaseCounter();

  if (counter === CLICKS_TO_SHOW_NOTIFICATION) {
    const end = description ? ` to ${description}` : '';
    notify(`Click ${CLICKS_TO_ACTION - CLICKS_TO_SHOW_NOTIFICATION} more times${end}`);
  }

  if (counter === CLICKS_TO_ACTION) {
    actionToPerform();
    return resetCounter();
  }

  timeoutId = setTimeout(resetCounter, NEXT_CLICK_MAX_TIMEOUT);
}
