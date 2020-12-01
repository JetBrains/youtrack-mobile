/* @flow */

import React from 'react';
import {View, Text, ScrollView} from 'react-native';

import CreateUpdateInfo from '../../components/issue-tabbed/issue-tabbed__created-updated';
import MarkdownView from '../../components/wiki/markdown-view';
import {SkeletonIssueContent} from '../../components/skeleton/skeleton';

import styles from './article.styles';

import type {ArticleState} from './article-reducers';
import type {UITheme} from '../../flow/Theme';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = ArticleState & {
  style: ViewStyleProp,
  uiTheme: UITheme
};


const ArticleDetails = (props: Props) => {
  const {article, isLoading, error, uiTheme, style} = props;

  return (
    <ScrollView
      style={[styles.container, style]}
      testID="articleDetails"
    >

      {!!article.reporter && <CreateUpdateInfo
        reporter={article.reporter}
        updater={article.updatedBy}
        created={article.created}
        updated={article.updated}
      />}

      {!!article.summary && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>{article.summary}</Text>
        </View>
      )}

      {!!article.content && (
        <MarkdownView
          style={styles.description}
          attachments={article.attachments}
          uiTheme={uiTheme}
        >
          {article.content}
        </MarkdownView>
      )}

      {isLoading && !error && <SkeletonIssueContent/>}

    </ScrollView>
  );
};

export default ArticleDetails;
