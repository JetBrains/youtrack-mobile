/* @flow */

import React from 'react';
import {View, Text} from 'react-native';

import MarkdownView from '../../components/wiki/markdown-view';
import {SkeletonIssueContent} from '../../components/skeleton/skeleton';

import styles from './article.styles';

import type {Article} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';
import type {UITheme} from '../../flow/Theme';

type Props = {
  article: Article,
  error: CustomError,
  isLoading: boolean,
  uiTheme: UITheme,
};


const ArticleDetails = (props: Props) => {
  const {article, isLoading, error, uiTheme} = props;

  return (
    <>

      {!!article.summary && <Text style={styles.summaryText}>{article.summary}</Text>}

      {!!article.content && (
        <View style={styles.description}>
          <MarkdownView
            attachments={article.attachments}
            uiTheme={uiTheme}
          >
            {article.content}
          </MarkdownView>
        </View>
      )}

      {isLoading && !error && <SkeletonIssueContent/>}

    </>
  );
};

export default ArticleDetails;
