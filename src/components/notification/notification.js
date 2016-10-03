import showNotification from './notification_show';
import log from '../log/log';
import usage from '../usage/usage';

const extractErrorMessage = function (err) {
  if (!err) {
    return 'Unknown error';
  }

  if (err.replace) {
    return err;
  }

  const values = [
    err.status,
    err.message,
    err.error_message,
    err.error_description,
    err.body,
    err.bodyText
  ].filter(msg => msg);

  return values.join(', ');
};

const showErrorMessage = function (message, error) {
  log.warn(message, error);
  usage.trackError(error, message);
  showNotification(message, extractErrorMessage(error));
};

export function notifyError (message, err) {
  if (err.json) {
    try {
      return err.json()
        .then(res => showErrorMessage(message, res));
    } catch (e) {
      return showErrorMessage(message, err);
    }
  } else {
    return showErrorMessage(message, err);
  }
}
