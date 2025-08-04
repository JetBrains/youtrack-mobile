import {notify} from '../notification/notification';

const NEXT_CLICK_MAX_TIMEOUT = 1000;
let timeoutId: number | null = null;
let counter = 0;

function increaseCounter() {
  counter++;
}

function resetCounter() {
  counter = 0;
}

export default function clicksCounter(
  actionToPerform?: () => void,
  message?: string,
  numberOfTaps: number = 6,
): void {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  increaseCounter();

  if (counter === numberOfTaps / 2 && message) {
    notify(message);
  }

  if (counter === numberOfTaps) {
    if (actionToPerform) {
      actionToPerform();
    }
    return resetCounter();
  }

  timeoutId = global.setTimeout(resetCounter, NEXT_CLICK_MAX_TIMEOUT) as unknown as number;
}
