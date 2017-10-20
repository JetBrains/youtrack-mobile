/* @flow */
import {notify} from '../notification/notification';

const NEXT_CLICK_MAX_TIMEOUT = 500;
const CLICKS_TO_SHOW_NOTIFICATION = 5;
const CLICKS_TO_ACTION = 10;

let timeoutId = null;
let counter = 0;

function increaseCounter() {
  counter++;
}

function resetCounter() {
  counter = 0;
}

export default function clicksCounter(actionToPerform: Function) {
  clearTimeout(timeoutId);
  increaseCounter();

  if (counter === CLICKS_TO_SHOW_NOTIFICATION) {
    notify(`Click ${CLICKS_TO_ACTION - CLICKS_TO_SHOW_NOTIFICATION} more times to open debug view`);
  }

  if (counter === CLICKS_TO_ACTION) {
    actionToPerform();
    return resetCounter();
  }

  timeoutId = setTimeout(resetCounter, NEXT_CLICK_MAX_TIMEOUT);
}
