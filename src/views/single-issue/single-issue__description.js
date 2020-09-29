/* @flow */

import React from 'react';

import YoutrackWiki from '../../components/wiki/youtrack-wiki';
import MarkdownView from '../../components/wiki/markdown-view';

import type {Attachment} from '../../flow/CustomFields';
import type {YouTrackWiki} from '../../flow/Wiki';
import type {UITheme} from '../../flow/Theme';

type Props = {
  youtrackWiki: YouTrackWiki,
  markdown?: string,
  attachments: Array<Attachment>,
  uiTheme: UITheme
}

function IssueDescription(props: Props) {
  const {youtrackWiki, attachments, markdown, uiTheme} = props;

  if (!youtrackWiki?.description && !markdown) {
    return null;
  }

  if (markdown) {
    return (
      <MarkdownView
        attachments={attachments}
        uiTheme={uiTheme}
      >
        {markdown}
      </MarkdownView>
    );
  }

  return (
    <YoutrackWiki {
      ...Object.assign({}, youtrackWiki, attachments)
    }>
      {youtrackWiki.description}
    </YoutrackWiki>
  );
}

export default React.memo<Props>(IssueDescription);
