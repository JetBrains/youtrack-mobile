import {Linking} from 'react-native';
import extractId from './open-url-handler__extract-id';

function handleInitialOpenWithUrl(onIssueIdDetected) {
  Linking.getInitialURL()
    .then(url => {
      const id = extractId(url);
      if (id) {
        console.info('Application was opened with issue URL, id ${id}, opening issue...');
        return onIssueIdDetected(id);
      }
    });
}

function checkInitialUrlForIssueId(onIssueIdDetected) {
  handleInitialOpenWithUrl(onIssueIdDetected);

  function onOpenWithUrl(event) {
    const id = extractId(event.url);
    if (id) {
      console.info(`Application was restored with issue URL, id ${id}, opening issue...`);
      return onIssueIdDetected(id);
    }
  }

  Linking.addEventListener('url', onOpenWithUrl);

  return function unsubscribe() {
    Linking.removeEventListener('url', onOpenWithUrl);
  }
}

export default checkInitialUrlForIssueId;
