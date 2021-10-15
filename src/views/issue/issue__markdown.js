/* @flow */

import React, {useContext} from 'react';

import YoutrackWiki from '../../components/wiki/youtrack-wiki';
import MarkdownView from '../../components/wiki/markdown-view';
import {ThemeContext} from '../../components/theme/theme-context';

import type {Attachment} from '../../flow/CustomFields';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {Theme} from '../../flow/Theme';

type Props = {
  youtrackWiki?: YouTrackWiki,
  markdown?: string | null,
  attachments?: Array<Attachment>,
  onCheckboxUpdate?: (checked: boolean, position: number, description: string) => void,
}

function IssueMarkdown(props: Props) {
  const theme: Theme = useContext(ThemeContext);

  const {
    youtrackWiki,
    attachments,
    markdown,
    onCheckboxUpdate = (checked: boolean, position: number, description: string): void => {},
  } = props;

  if (markdown) {
    return <MarkdownView
      attachments={attachments}
      onCheckboxUpdate={
        (checked: boolean, position: number, description: string) => onCheckboxUpdate(checked, position, description)
      }
    >
      {markdown}
    </MarkdownView>;
  } else if (youtrackWiki?.description) {
    return <YoutrackWiki
      {...Object.assign({uiTheme: theme.uiTheme}, {youtrackWiki}, attachments)}
    >
      {youtrackWiki.description}
    </YoutrackWiki>;
  }

  return null;
}

export default (React.memo<Props>(IssueMarkdown): React$AbstractComponent<Props, mixed>);
