import React, {useContext} from 'react';
import YoutrackWiki from 'components/wiki/youtrack-wiki';
import MarkdownView from 'components/wiki/markdown-view';
import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import {markdownText} from 'components/common-styles';
import {ThemeContext} from 'components/theme/theme-context';
import type {Attachment} from 'types/CustomFields';
import type {Theme} from 'types/Theme';
import type {YouTrackWiki} from 'types/Wiki';
import type {ScrollData} from 'types/Markdown';
type Props = {
  youtrackWiki?: YouTrackWiki;
  markdown?: string | null;
  attachments?: Attachment[];
  onCheckboxUpdate?: (
    checked: boolean,
    position: number,
    description: string,
  ) => void;
  scrollData?: ScrollData;
};

function IssueMarkdown(props: Props) {
  const theme: Theme = useContext(ThemeContext);
  const {
    youtrackWiki,
    attachments,
    markdown,
    onCheckboxUpdate = (
      checked: boolean,
      position: number,
      description: string,
    ): void => {},
    scrollData,
  } = props;
  const Component: any = scrollData ? MarkdownViewChunks : MarkdownView;

  if (markdown) {
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
      >
        {markdown}
      </Component>
    );
  } else if (youtrackWiki?.description) {
    return (
      <YoutrackWiki
        {...Object.assign(
          {
            uiTheme: theme.uiTheme,
          },
          youtrackWiki,
          attachments,
        )}
      >
        {youtrackWiki.description}
      </YoutrackWiki>
    );
  }

  return null;
}

export default React.memo<Props>(IssueMarkdown) as React$AbstractComponent<
  Props,
  unknown
>;
