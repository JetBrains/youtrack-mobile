import {Linking} from 'react-native';
import extractId from './open-url-handler__extract-id';

function checkInitialUrlForIssueId(onIssueIdDetected) {
  Linking.getInitialURL()
    .then(url => {
      const issueId = extractId(url);
      if (issueId) {
        console.info('Application was opened with issue URL, opening issue...');
        onIssueIdDetected(issueId);
      }
    });

  return function noop() {};
}

export default checkInitialUrlForIssueId;
