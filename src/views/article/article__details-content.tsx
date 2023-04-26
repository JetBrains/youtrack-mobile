import React from 'react';
import {View} from 'react-native';

import MarkdownViewChunks from 'components/wiki/markdown-view-chunks';
import {markdownText} from 'components/common-styles';

import styles from './article.styles';

import type {Attachment} from 'types/CustomFields';
import type {Mentions} from 'components/wiki/markdown-view-rules';

type Props = {
  attachments: Attachment[];
  mentions: Mentions;
  articleContent: string;
  scrollData: Record<string, any>;
  onCheckboxUpdate: (checked: boolean, position: number, articleContent: string) => void;
};


const ArticleContent = (props: Props) => {
  const {
    articleContent,
    attachments,
    scrollData,
    onCheckboxUpdate,
    mentions,
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
        mentions={mentions}
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


export default React.memo<Props>(ArticleContent);
