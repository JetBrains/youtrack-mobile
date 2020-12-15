/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';

import {useDispatch} from 'react-redux';

import Header from '../../components/header/header';
import MarkdownView from '../../components/wiki/markdown-view';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import {IconAngleRight, IconBack} from '../../components/icon/icon';
import {SkeletonIssueContent} from '../../components/skeleton/skeleton';
import {updatePrevArticle} from './arcticle-actions';

import styles from './article.styles';

import type {Article} from '../../flow/Article';
import type {CustomError} from '../../flow/Error';
import type {UITheme} from '../../flow/Theme';

type Props = {
  article: Article,
  articlePlaceholder: Article,
  error: CustomError,
  isLoading: boolean,
  subArticles: Array<Article>,
  uiTheme: UITheme
};


const renderSubArticles = (article: Article, subArticles: Array<Article>, uiTheme: UITheme, dispatch: Function) => {
  return (
    <>
      <Header
        style={styles.subArticlesHeader}
        title={article.idReadable}
        leftButton={<IconBack color={uiTheme.colors.$link}/>}
        onBack={() => Router.pop()}
      />

      <FlatList
        data={subArticles}
        keyExtractor={(item: Article) => item.id}
        renderItem={({item}: Article) =>
          <TouchableOpacity
            style={styles.subArticleItem}
            onPress={async () => {
              dispatch(updatePrevArticle());
              Router.Article({articlePlaceholder: item});
            }}
          ><Text style={{color: uiTheme.colors.$link}}>{item.summary}</Text></TouchableOpacity>}
        ItemSeparatorComponent={Select.renderSeparator}
      />
    </>
  );
};

const ArticleDetails = (props: Props) => {
  const {article, articlePlaceholder, isLoading, error, uiTheme, subArticles = []} = props;
  const dispatch = useDispatch();

  if (!article && !articlePlaceholder) {
    return null;
  }

  const summary: string = (article || articlePlaceholder).summary;
  return (
    <>
      {!!summary && <Text style={styles.summaryText}>{summary}</Text>}

      {isLoading && !error && !article?.content && <SkeletonIssueContent/>}

      {!!article?.content && (
        <View style={styles.description}>
          <MarkdownView
            attachments={article.attachments}
            uiTheme={uiTheme}
          >
            {article.content}
          </MarkdownView>

          {subArticles?.length > 0 && (
            <TouchableOpacity
              onPress={() => Router.Page({
                children: renderSubArticles(article, subArticles, uiTheme, dispatch)
              })}
              style={styles.subArticles}
            >
              <Text style={styles.subArticlesTitle}>Sub-articles</Text>
              <View style={styles.subArticlesContent}>
                <Text>{`${subArticles.length} ${subArticles.length > 1 ? 'articles' : 'article'}`}</Text>
                <IconAngleRight size={18} color={uiTheme.colors.$text} style={styles.subArticlesIcon}/>
              </View>
            </TouchableOpacity>
          )}

        </View>
      )}
    </>
  );
};

export default ArticleDetails;