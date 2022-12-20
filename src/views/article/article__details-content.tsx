import React from 'react';
import {View} from 'react-native';
import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import {markdownText} from 'components/common-styles/typography';
import styles from './article.styles';
import type {Article} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {IssueOnList} from 'types/Issue';
import type {UITheme} from 'types/Theme';
type Props = {
  attachments: Array<Attachment>;
  mentionedArticles: Array<Article>;
  mentionedIssues: Array<IssueOnList>;
  uiTheme: UITheme;
  articleContent: string;
  scrollData: Record<string, any>;
  onCheckboxUpdate: (articleContent: string) => (...args: Array<any>) => any;
};

const ArticleContent = (props: Props) => {
  const {
    articleContent,
    attachments,
    mentionedArticles,
    mentionedIssues,
    scrollData,
    uiTheme,
    onCheckboxUpdate,
  } = props;

  if (!articleContent) {
    return null;
  }

  return (
    <View style={styles.description}>
      <MarkdownViewChunks
        textStyle={markdownText}
        scrollData={scrollData}
        attachments={attachments}
        mentionedArticles={mentionedArticles}
        mentionedIssues={mentionedIssues}
        uiTheme={uiTheme}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          articleContent: string,
        ) => onCheckboxUpdate(checked, position, articleContent)}
      >
        {articleContent}
      </MarkdownViewChunks>
    </View>
  );
};

export default React.memo<Props>(ArticleContent) as React$AbstractComponent<
  Props,
  unknown
>;
