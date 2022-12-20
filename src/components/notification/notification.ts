import log from '../log/log';
import showNotification from './notification_show';
import {resolveErrorMessage} from '../error/error-resolver';
const NOTIFY_DURATION: number = 3000;
let toastComponentRef: any;

const showMessage = function (
  message: string,
  duration: number = NOTIFY_DURATION,
) {
  showNotification(message, null, toastComponentRef, duration);
};

export function notifyError(
  err: Record<string, any>,
  duration: number = NOTIFY_DURATION * 2,
): void {
  resolveErrorMessage(err, true).then((message: string) => {
    if (err) {
      log.warn(message, err);
    }

    showMessage(message, duration);
  });
}
export function notify(message: string, duration?: number): void {
  showMessage(message, duration);
}
export function setNotificationComponent(reference: any) {
  toastComponentRef = reference;
}