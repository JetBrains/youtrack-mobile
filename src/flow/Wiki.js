/* @flow */

import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export type YouTrackWiki = {
  backendUrl: string,
  imageHeaders: { Authorization: string },
  onIssueIdTap: () => void,
  title?: string,
  description?: string,
  markdown?: string,
  style?: ViewStyleProp
};
