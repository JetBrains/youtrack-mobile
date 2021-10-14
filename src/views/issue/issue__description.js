/* @flow */

import React from 'react';

import YoutrackWiki from '../../components/wiki/youtrack-wiki';
import MarkdownView from '../../components/wiki/markdown-view';

import type {Attachment} from '../../flow/CustomFields';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {UITheme} from '../../flow/Theme';

type Props = {
  youtrackWiki?: YouTrackWiki,
  markdown: ?string,
  attachments: Array<Attachment>,
  uiTheme: UITheme,
  onCheckboxUpdate?: (checked: boolean, position: number, description: string) => void,
}

function IssueDescription(props: Props) {
  const {
    youtrackWiki,
    attachments,
    markdown,
    uiTheme,
    onCheckboxUpdate = (checked: boolean, position: number, description: string): void => {},
  } = props;

  if (markdown) {
    return <MarkdownView
      attachments={attachments}
      uiTheme={uiTheme}
      onCheckboxUpdate={
        (checked: boolean, position: number, description: string) => onCheckboxUpdate(checked, position, description)
      }
    >
      {markdown}
    </MarkdownView>;
  } else if (youtrackWiki?.description) {
    return <YoutrackWiki
      {...Object.assign({uiTheme: uiTheme}, {youtrackWiki}, attachments)}
    >
      {youtrackWiki.description}
    </YoutrackWiki>;
  }

  return null;
}

export default (React.memo<Props>(IssueDescription): React$AbstractComponent<Props, mixed>);
