/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';

import {useSelector} from 'react-redux';

import ArticleWithChildren from '../../components/articles/article-item-with-children';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import Header from '../../components/header/header';
import MarkdownView from '../../components/wiki/markdown-view';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Separator from '../../components/separator/separator';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE} from '../../components/analytics/analytics-ids';
import {findArticleNode} from '../../components/articles/articles-tree-helper';
import {IconAdd, IconAngleRight, IconBack} from '../../components/icon/icon';
import {logEvent} from '../../components/log/log-helper';
import {SkeletonIssueContent} from '../../components/skeleton/skeleton';

import styles from './article.styles';

import type {AppState} from '../../reducers';
import type {Article, ArticleNode, ArticlesList} from '../../flow/Article';
import type {Attachment} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';
import type {UITheme} from '../../flow/Theme';

type Props = {
  article: Article,
  articlePlaceholder: Article,
  error: CustomError,
  isLoading: boolean,
  subArticles: Array<Article>,
  onRemoveAttach: ?(attachment: Attachment) => any,
  onCreateArticle: ?() => any,
  uiTheme: UITheme
};

const ArticleDetails = (props: Props) => {
  const articlesList: ArticlesList = useSelector((state: AppState) => state.articles.articlesList);

  const navigateToSubArticlePage = (article: Article) => (
    Router.Page({
      children: renderSubArticles(article, props.uiTheme)
    })
  );

  const renderSubArticles = (article: Article, uiTheme: UITheme) => {
    const articleNode: ?ArticleNode = articlesList && findArticleNode(articlesList, article.project.id, article.id);
    const subArticles: Array<ArticleNode> = articleNode?.children || [];

    const renderArticleNode = ({item}: { item: Article }) => (
      <ArticleWithChildren
        style={styles.subArticleItem}
        articleNode={item}
        onArticlePress={(article: Article) => Router.Article({articlePlaceholder: article, storePrevArticle: true})}
        onShowSubArticles={navigateToSubArticlePage}
      />
    );

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
          keyExtractor={(item: ArticleNode) => item.data.id}
          getItemLayout={Select.getItemLayout}
          renderItem={renderArticleNode}
          ItemSeparatorComponent={Select.renderSeparator}
        />
      </>
    );
  };

  const renderSubArticlesButton = () => {
    const hasSubArticles: boolean = subArticles?.length > 0;
    if (!!onCreateArticle || hasSubArticles) {
      return (
        <TouchableOpacity
          disabled={!hasSubArticles}
          onPress={() => navigateToSubArticlePage(props.article)}
          style={styles.subArticles}
        >
          <View style={styles.breadCrumbsItem}>
            <Text style={styles.subArticlesTitle}>Sub-articles</Text>
            {!!onCreateArticle && (
              <View style={styles.subArticlesCreate}>
                <TouchableOpacity
                  onPress={onCreateArticle}
                  style={styles.subArticlesCreateIcon}
                >
                  <IconAdd size={18} color={styles.subArticlesCreateIcon.color}/>
                </TouchableOpacity>
              </View>
            )}
          </View>
          {hasSubArticles && <View style={styles.subArticlesContent}>
            <Text
              style={styles.subArticleItemText}>
              {`${subArticles.length} ${subArticles.length > 1 ? 'articles' : 'article'}`}
            </Text>
            <IconAngleRight
              size={18}
              color={uiTheme.colors.$text}
              style={styles.subArticlesNavigateIcon}
            />
          </View>}
        </TouchableOpacity>
      );
    }
  };

  const {
    article,
    articlePlaceholder,
    isLoading,
    error,
    uiTheme,
    subArticles = [],
    onRemoveAttach,
    onCreateArticle
  } = props;

  if (!article && !articlePlaceholder) {
    return null;
  }

  const summary: string = (article || articlePlaceholder).summary;
  return (
    <>
      {!!summary && <Text style={styles.summaryText}>{summary}</Text>}

      {isLoading && !error && !article?.content && <SkeletonIssueContent/>}

      {renderSubArticlesButton()}

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
              canRemoveAttachment={!!onRemoveAttach}
              onRemoveImage={onRemoveAttach || undefined}
              onOpenAttachment={(type) => usage.trackEvent(
                ANALYTICS_ARTICLE_PAGE,
                type === 'image' ? 'Showing image' : 'Open attachment by URL'
              )}
              uiTheme={uiTheme}
            />
          </View>
        </>
      )}
    </>
  );
};

export default ArticleDetails;
