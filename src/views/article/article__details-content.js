/* @flow */

import React from 'react';
import {View} from 'react-native';

import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import {markdownText} from '../../components/common-styles/typography';

import styles from './article.styles';

import type {Article} from 'flow/Article';
import type {Attachment} from 'flow/CustomFields';
import type {IssueOnList} from 'flow/Issue';
import type {UITheme} from 'flow/Theme';

type Props = {
  attachments: Array<Attachment>,
  mentionedArticles: Array<Article>,
  mentionedIssues: Array<IssueOnList>,
  uiTheme: UITheme,
  articleContent: string,
  scrollData: Object,
  onCheckboxUpdate: (articleContent: string) => Function,
};

const ArticleContent = (props: Props) => {
  const {articleContent, attachments, mentionedArticles, mentionedIssues, scrollData, uiTheme, onCheckboxUpdate} = props;

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
        onCheckboxUpdate={(checked: boolean, position: number, articleContent: string) => onCheckboxUpdate(checked, position, articleContent)}
      >
        {articleContent}
      </MarkdownViewChunks>
    </View>
  );

};

export default (React.memo<Props>(ArticleContent): React$AbstractComponent<Props, mixed>);
