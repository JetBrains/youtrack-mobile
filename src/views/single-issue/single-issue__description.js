/* @flow */

import React from 'react';

import YoutrackWiki from '../../components/wiki/youtrack-wiki';
import MarkdownView from '../../components/wiki/markdown-view';
import type {Attachment} from '../../flow/CustomFields';
import type {YouTrackWiki} from '../../flow/Wiki';

type Props = {
  youtrackWiki: YouTrackWiki,
  markdown?: string,
  attachments: Array<Attachment>
}

function IssueDescription(props: Props) {
  const {youtrackWiki, attachments, markdown} = props;

  if (!youtrackWiki?.description && !markdown) {
    return null;
  }

  if (markdown) {
    return (
      <MarkdownView
        attachments={attachments}
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
