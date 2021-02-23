/* @flow */

import React from 'react';
import {View} from 'react-native';

import MarkdownView from '../../components/wiki/markdown-view';

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
  articleContent: string
};

const ArticleContent = (props: Props) => {

  const {articleContent, attachments, mentionedArticles, mentionedIssues, uiTheme} = props;

  if (!articleContent) {
    return null;
  }
  return (
    <View style={styles.description}>
      <MarkdownView
        attachments={attachments}
        mentions={{
          articles: mentionedArticles,
          issues: mentionedIssues
        }}
        uiTheme={uiTheme}
      >
        {articleContent}
      </MarkdownView>
    </View>
  );
};

export default React.memo<Props>(ArticleContent);
