import showNotification from './notification_show';

export function notifyError (message, err) {
  if (err.json) {
    try {
      return err.json()
        .then(res => showNotification(message, res));
    } catch (e) {
      return showNotification(message, err);
    }
  } else {
    return showNotification(message, err);
  }
}
