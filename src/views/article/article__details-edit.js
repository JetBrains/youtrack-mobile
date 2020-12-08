/* @flow */

import React from 'react';

import throttle from 'lodash.throttle';
import {View as AnimatedView} from 'react-native-animatable';

import CreateUpdateInfo from '../../components/issue-tabbed/issue-tabbed__created-updated';
import IssueSummary from '../../components/issue-summary/issue-summary';

import styles from './article.styles';

import type {Article} from '../../flow/Article';
import type {UITheme} from '../../flow/Theme';

type Props = {
  article: Article,
  articleDraft: Article,
  updateArticleDraft: (draft: Article) => Function,
  uiTheme: UITheme,
};

const THROTTLE_UPDATE_DELAY: number = 50;


const ArticleDetailsEdit = (props: Props) => {
  const {article, articleDraft, updateArticleDraft, uiTheme} = props;

  return (
    <AnimatedView
      animation="fadeIn"
      duration={500}
      useNativeDriver
      style={styles.articleDetails}
    >

      <CreateUpdateInfo
        reporter={article.reporter}
        updater={article.updatedBy}
        created={article.created}
        updated={article.updated}
      />

      <IssueSummary
        editable={true}
        summary={articleDraft.summary}
        showSeparator={true}
        description={articleDraft.content}
        onSummaryChange={throttle((summary: string) => {
          updateArticleDraft({...articleDraft, ...{summary}});
        }, THROTTLE_UPDATE_DELAY)}
        onDescriptionChange={throttle((content: string) => {
          updateArticleDraft({...articleDraft, ...{content}});
        }, THROTTLE_UPDATE_DELAY)}
        uiTheme={uiTheme}
      />

    </AnimatedView>
  );
};

export default ArticleDetailsEdit;
