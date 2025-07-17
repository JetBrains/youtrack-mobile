import React, {useContext} from 'react';

import MarkdownView from 'components/wiki/markdown-view';
import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import {markdownText} from 'components/common-styles';
import {ThemeContext} from 'components/theme/theme-context';

import type {Attachment} from 'types/CustomFields';
import type {Mentions} from 'components/wiki/markdown-view-rules';
import type {ScrollData} from 'types/Markdown';
import type {Theme} from 'types/Theme';

type Props = {
  markdown: string;
  attachments?: Attachment[];
  onCheckboxUpdate?: (
    checked: boolean,
    position: number,
    description: string,
  ) => void;
  scrollData?: ScrollData;
  mentions?: Mentions;
};

function IssueMarkdown(props: Props) {
  const theme: Theme = useContext(ThemeContext);
  const {
    attachments,
    markdown,
    onCheckboxUpdate = (
      checked: boolean,
      position: number,
      description: string,
    ): void => {},
    scrollData,
    mentions,
  } = props;
  const Component: any = scrollData ? MarkdownViewChunks : MarkdownView;

  return (
    <Component
      attachments={attachments}
      onCheckboxUpdate={(
        checked: boolean,
        position: number,
        description: string,
      ) => onCheckboxUpdate(checked, position, description)}
      scrollData={scrollData}
      uiTheme={theme.uiTheme}
      textStyle={markdownText}
      mentions={mentions}
    >
      {markdown}
    </Component>
  );
}

export default React.memo<Props>(IssueMarkdown);
