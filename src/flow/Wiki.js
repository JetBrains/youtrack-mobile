/* @flow */

import type {Attachment} from './CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export type YouTrackWiki = {
  attachments?: Array<Attachment>,
  backendUrl: string,
  imageHeaders: { Authorization: string, 'User-Agent': string },
  onIssueIdTap: () => void,
  title?: string,
  description?: string,
  style?: ViewStyleProp
};
