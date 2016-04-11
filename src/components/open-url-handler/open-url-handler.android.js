import {Linking} from 'react-native';
import extractId from './open-url-handler__extract-id';

function checkInitialUrlForIssueId(onIssueIdDetected) {
  return Linking.getInitialURL()
    .then(url => {
      const issueId = extractId(url);
      if (issueId) {
        onIssueIdDetected(issueId);
      }
    });
}

export default checkInitialUrlForIssueId;
