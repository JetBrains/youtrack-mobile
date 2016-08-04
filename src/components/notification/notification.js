import showNotification from './notification_show';

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
  console.warn(message, error);
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
