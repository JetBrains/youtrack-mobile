/* @flow */

import React from 'react';
import {View} from 'react-native';

import throttle from 'lodash.throttle';

import SummaryDescriptionForm from '../../components/form/summary-description-form';

import styles from './article.styles';

import type {Article} from '../../flow/Article';
import type {UITheme} from '../../flow/Theme';

type Props = {
  articleDraft: Article,
  updateArticleDraft: (draft: Article) => Function,
  uiTheme: UITheme,
};

const THROTTLE_UPDATE_DELAY: number = 50;


const ArticleDetailsEdit = (props: Props) => {
  const {articleDraft, updateArticleDraft, uiTheme} = props;

  return (
    <View
      style={styles.summaryEdit}
    >
      <SummaryDescriptionForm
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

    </View>
  );
};

export default ArticleDetailsEdit;
