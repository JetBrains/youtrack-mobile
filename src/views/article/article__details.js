/* @flow */

import React from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';

import ArticleWithChildren from '../../components/articles/article-item-with-children';
import AttachmentsRow from '../../components/attachments-row/attachments-row';
import Header from '../../components/header/header';
import MarkdownView from '../../components/wiki/markdown-view';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import Separator from '../../components/separator/separator';
import usage from '../../components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE} from '../../components/analytics/analytics-ids';
import {IconAdd, IconAngleRight, IconBack} from '../../components/icon/icon';
import {logEvent} from '../../components/log/log-helper';
import {SkeletonIssueContent} from '../../components/skeleton/skeleton';

import styles from './article.styles';

import type {Article, ArticleNode} from '../../flow/Article';
import type {Attachment} from '../../flow/CustomFields';
import type {CustomError} from '../../flow/Error';
import type {UITheme} from '../../flow/Theme';

type Props = {
  articleNode: ArticleNode,
  articlePlaceholder: Article,
  error: CustomError,
  isLoading: boolean,
  onRemoveAttach: ?(attachment: Attachment) => any,
  onCreateArticle: ?() => any,
  uiTheme: UITheme
};

const ArticleDetails = (props: Props) => {

  function navigateToSubArticlePage(articleNode: ArticleNode) {
    Router.Page({
      children: renderSubArticles(articleNode)
    });
  }

  function renderSubArticles(articleNode: ArticleNode) {
    const renderArticleNode = ({item}: { item: Article }) => {
      return (
        <ArticleWithChildren
          style={styles.subArticleItem}
          articleNode={item}
          onArticlePress={(article: Article) => Router.Article({articlePlaceholder: article, storePrevArticle: true})}
          onShowSubArticles={(childArticleNode: ArticleNode) => navigateToSubArticlePage(childArticleNode)}
        />
      );
    };

    return (
      <>
        <Header
          style={styles.subArticlesHeader}
          leftButton={<IconBack color={styles.link.color}/>}
          onBack={() => Router.pop()}
        >
          <Text numberOfLines={2} style={styles.subArticlesHeaderText}>{articleNode.data.summary}</Text>
        </Header>

        <FlatList
          data={articleNode.children}
          keyExtractor={(item: ArticleNode) => item.data.id}
          getItemLayout={Select.getItemLayout}
          renderItem={renderArticleNode}
          ItemSeparatorComponent={Select.renderSeparator}
        />
      </>
    );
  }

  const renderSubArticlesButton = () => {
    const subArticles: Array<ArticleNode> = props?.articleNode?.children || [];
    const hasSubArticles: boolean = subArticles.length > 0;

    if (!!onCreateArticle || hasSubArticles) {
      return (
        <TouchableOpacity
          disabled={!hasSubArticles}
          onPress={() => navigateToSubArticlePage(props.articleNode)}
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
    articleNode,
    articlePlaceholder,
    isLoading,
    error,
    uiTheme,
    onRemoveAttach,
    onCreateArticle
  } = props;

  if (!articleNode && !articlePlaceholder) {
    return null;
  }

  const article: Article = articleNode?.data || articlePlaceholder;
  return (
    <>
      {!!article.summary && <Text style={styles.summaryText}>{article.summary}</Text>}

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
