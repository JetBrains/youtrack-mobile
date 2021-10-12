/* @flow */

import type {Attachment} from './CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

export type YouTrackWiki = {
  attachments: Array<Attachment>,
  backendUrl: string,
  imageHeaders: { Authorization: string },
  onIssueIdTap: () => void,
  title?: string,
  description?: string,
  markdown?: string,
  style?: ViewStyleProp
};
