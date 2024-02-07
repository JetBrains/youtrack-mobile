import type {Attachment} from './CustomFields';
import type {RequestHeaders} from './Auth';
import type {ViewStyleProp} from 'types/Internal';
export type YouTrackWiki = {
  attachments?: Attachment[];
  backendUrl: string;
  imageHeaders: RequestHeaders | null | undefined;
  onIssueIdTap?: (issueId: string) => void
  title?: string;
  description?: string;
  style?: ViewStyleProp;
};
