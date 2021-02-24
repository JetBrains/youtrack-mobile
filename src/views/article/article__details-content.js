/* @flow */

import React from 'react';
import {View} from 'react-native';

import MarkdownViewChunks from '../../components/wiki/markdown-view-chunks';

import styles from './article.styles';

import type {Article} from '../../flow/Article';
import type {Attachment} from '../../flow/CustomFields';
import type {IssueOnList} from '../../flow/Issue';
import type {UITheme} from '../../flow/Theme';

type Props = {
  attachments: Array<Attachment>,
  mentionedArticles: Array<Article>,
  mentionedIssues: Array<IssueOnList>,
  uiTheme: UITheme,
  articleContent: string,
  scrollData: Object
};

const ArticleContent = (props: Props) => {
  const {articleContent, attachments, mentionedArticles, mentionedIssues, scrollData, uiTheme} = props;

  if (!articleContent) {
    return null;
  }

  return (
    <View style={styles.description}>
      <MarkdownViewChunks
        scrollData={scrollData}
        attachments={attachments}
        mentionedArticles={mentionedArticles}
        mentionedIssues={mentionedIssues}
        uiTheme={uiTheme}
      >
        {articleContent}
      </MarkdownViewChunks>
    </View>
  );

};

export default React.memo<Props>(ArticleContent);
