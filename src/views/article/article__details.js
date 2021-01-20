/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';

import AttachmentsRow from '../../components/attachments-row/attachments-row';
import Header from '../../components/header/header';
import MarkdownView from '../../components/wiki/markdown-view';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Separator from '../../components/separator/separator';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE} from '../../components/analytics/analytics-ids';
import {hasType} from '../../components/api/api__resource-types';
import {IconAngleRight, IconBack, IconLock} from '../../components/icon/icon';
import {logEvent} from '../../components/log/log-helper';
import {SkeletonIssueContent} from '../../components/skeleton/skeleton';

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


const renderSubArticles = (article: Article, subArticles: Array<Article>, uiTheme: UITheme) => {
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
        getItemLayout={Select.getItemLayout}
        renderItem={({item}: Article) =>
          <TouchableOpacity
            style={styles.subArticleItem}
            onPress={async () => {
              Router.Article({articlePlaceholder: item, storePrevArticle: true});
            }}
          >
            <Text numberOfLines={5} style={styles.subArticleItemText}>{item.summary}</Text>
            {hasType.visibilityLimited(article?.visibility) && (
              <View style={styles.subArticleItemIcon}>
                <IconLock
                  size={16}
                  color={uiTheme.colors.$iconAccent}
                />
              </View>
            )}
          </TouchableOpacity>}
        ItemSeparatorComponent={Select.renderSeparator}
      />
    </>
  );
};

const ArticleDetails = (props: Props) => {
  const {article, articlePlaceholder, isLoading, error, uiTheme, subArticles = []} = props;

  if (!article && !articlePlaceholder) {
    return null;
  }

  const summary: string = (article || articlePlaceholder).summary;
  return (
    <>
      {!!summary && <Text style={styles.summaryText}>{summary}</Text>}

      {isLoading && !error && !article?.content && <SkeletonIssueContent/>}

      {subArticles?.length > 0 && (
        <TouchableOpacity
          onPress={() => Router.Page({
            children: renderSubArticles(article, subArticles, uiTheme)
          })}
          style={styles.subArticles}
        >
          <Text style={styles.subArticlesTitle}>Sub-articles</Text>
          <View style={styles.subArticlesContent}>
            <Text style={styles.subArticleItemText}>{`${subArticles.length} ${subArticles.length > 1 ? 'articles' : 'article'}`}</Text>
            <IconAngleRight size={18} color={uiTheme.colors.$text} style={styles.subArticlesIcon}/>
          </View>
        </TouchableOpacity>
      )}

      {!!article?.content && (
        <View style={styles.description}>
          <MarkdownView
            attachments={article.attachments}
            mentions={{
              articles: article.mentionedArticles,
              issues: article.mentionedIssues
            }}
            uiTheme={uiTheme}
          >
            {article.content}
          </MarkdownView>
        </View>
      )}

      {article?.attachments?.length > 0 && (
        <>
          <Separator fitWindow indent/>
          <View style={styles.articleDetailsHeader}>
            <AttachmentsRow
              attachments={article.attachments}
              attachingImage={null}
              onImageLoadingError={
                (err: Object) => logEvent({message: err.nativeEvent, isError: true})
              }
              canRemoveAttachment={false}
              onRemoveImage={() => null}
              onOpenAttachment={(type) => usage.trackEvent(
                ANALYTICS_ARTICLE_PAGE,
                type === 'image' ? 'Showing image' : 'Open attachment by URL')
              }
              uiTheme={uiTheme}
            />
          </View>
        </>
      )}
    </>
  );
};

export default ArticleDetails;
