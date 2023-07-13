import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList} from 'react-native';

import ArticleContent from './article__details-content';
import ArticleWithChildren from 'components/articles/article-item-with-children';
import AttachmentsRow from 'components/attachments-row/attachments-row';
import Header from 'components/header/header';
import ModalPortal from 'components/modal-view/modal-portal';
import Router from 'components/router/router';
import Select from 'components/select/select';
import Separator from 'components/separator/separator';
import usage from 'components/usage/usage';
import {ANALYTICS_ARTICLE_PAGE} from 'components/analytics/analytics-ids';
import {i18n, i18nPlural} from 'components/i18n/i18n';
import {
  IconAdd,
  IconAngleRight,
  IconBack,
  IconClose,
} from 'components/icon/icon';
import {logEvent} from 'components/log/log-helper';
import {routeMap} from 'app-routes';
import {SkeletonIssueContent} from 'components/skeleton/skeleton';

import styles from './article.styles';

import type {Article} from 'types/Article';
import type {Attachment} from 'types/CustomFields';
import type {CustomError} from 'types/Error';
import type {UITheme} from 'types/Theme';

type Props = {
  article: Article;
  error: CustomError | null;
  isLoading: boolean;
  onRemoveAttach?: (attachment: Attachment) => any;
  onCreateArticle?: () => any;
  uiTheme: UITheme;
  scrollData: Record<string, any>;
  onCheckboxUpdate?: (checked: boolean, position: number, articleContent: string) => void;
  isSplitView: boolean;
};

type ModalStackData = {
  id: string;
  children: any;
  onHide: () => any;
};


const ArticleDetails = (props: Props) => {
  const [modalStack, updateModalStack] = useState<ModalStackData[]>([]);

  function navigateToSubArticlePage(article: Article) {
    const update = () => {
      updateModalStack((prev: ModalStackData[]) => {
          const onHide = () =>
            updateModalStack((prev: ModalStackData[]) => prev.filter(it => it.id !== article.id));

          prev.push({
            id: article.id,
            onHide,
            children: renderSubArticles(
              article,
              onHide,
              prev.length === 0 ? (
                <IconClose size={21} color={styles.link.color} />
              ) : null,
            ),
          });
          return prev.slice();
        },
      );
    };

    if (props.isSplitView) {
      update();
    } else {
      Router.Page({
        children: renderSubArticles(article),
      });
    }
  }

  function renderSubArticles(
    article: Article,
    onHide: () => any = () => Router.pop(),
    backIcon?: any,
  ) {
    const renderArticle = ({item}: {item: Article}) => {
      return (
        <ArticleWithChildren
          style={styles.subArticleItem}
          article={item}
          onArticlePress={(article: Article) => {
            if (props.isSplitView) {
              Router.KnowledgeBase({
                lastVisitedArticle: article,
                preventReload: true,
              });
            } else {
              Router.Article({
                articlePlaceholder: article,
                storePrevArticle: true,
                store: true,
                storeRouteName: routeMap.ArticleSingle,
              });
            }
          }}
          onShowSubArticles={(childArticle: Article) =>
            navigateToSubArticlePage(childArticle)
          }
        />
      );
    };

    return (
      <>
        <Header
          style={styles.subArticlesHeader}
          leftButton={backIcon || <IconBack color={styles.link.color} />}
          onBack={onHide}
        >
          <Text numberOfLines={2} style={styles.articlesHeaderText}>
            {article.summary}
          </Text>
        </Header>

        <FlatList
          data={article.childArticles}
          keyExtractor={(it: Article) => it.id}
          getItemLayout={Select.getItemLayout}
          renderItem={renderArticle}
          ItemSeparatorComponent={Select.renderSeparator}
        />
      </>
    );
  }

  const renderSubArticlesButton = () => {
    const hasSubArticles: boolean = article?.childArticles?.length > 0;

    if (!!onCreateArticle || hasSubArticles) {
      return (
        <TouchableOpacity
          disabled={!hasSubArticles}
          onPress={() => navigateToSubArticlePage(props.article)}
          style={styles.subArticles}
        >
          <View style={styles.breadCrumbsItem}>
            <Text style={styles.subArticlesTitle}>{i18n('Sub-articles')}</Text>
            {!!onCreateArticle && (
              <View style={styles.subArticlesCreate}>
                <TouchableOpacity
                  onPress={onCreateArticle}
                  style={styles.subArticlesCreateIcon}
                >
                  <IconAdd
                    size={18}
                    color={styles.subArticlesCreateIcon.color}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {hasSubArticles && (
            <View style={styles.subArticlesContent}>
              <Text style={styles.subArticleItemText}>
                {i18nPlural(
                  article?.childArticles?.length,
                  '{{amount}} article',
                  '{{amount}} articles',
                  {
                    amount: article?.childArticles?.length,
                  },
                )}
              </Text>
              <IconAngleRight
                size={18}
                color={uiTheme.colors.$text}
                style={styles.subArticlesNavigateIcon}
              />
            </View>
          )}
        </TouchableOpacity>
      );
    }
  };

  const {
    article,
    isLoading,
    error,
    uiTheme,
    onRemoveAttach,
    onCreateArticle,
    scrollData,
    onCheckboxUpdate,
  } = props;

  if (!article) {
    return null;
  }

  return (
    <>
      {!!article.summary && (
        <Text style={styles.summaryText}>{article.summary}</Text>
      )}

      {isLoading && !error && !article?.content && <SkeletonIssueContent />}

      {renderSubArticlesButton()}

      <ArticleContent
        scrollData={scrollData}
        attachments={article?.attachments}
        mentions={{
          articles: article?.mentionedArticles,
          issues: article?.mentionedIssues,
          users: article?.mentionedUsers,
        }}
        articleContent={article?.content}
        onCheckboxUpdate={(
          checked: boolean,
          position: number,
          articleContent: string,
        ) => {
          onCheckboxUpdate?.(checked, position, articleContent);
        }}
      />

      {article?.attachments?.length > 0 && (
        <>
          <Separator fitWindow indent />
          <View style={styles.articleDetailsHeader}>
            <AttachmentsRow
              attachments={article.attachments}
              attachingImage={null}
              onImageLoadingError={(err: Record<string, any>) =>
                logEvent({
                  message: err.nativeEvent,
                  isError: true,
                })
              }
              canRemoveAttachment={!!onRemoveAttach}
              onRemoveImage={onRemoveAttach || undefined}
              onOpenAttachment={type =>
                usage.trackEvent(
                  ANALYTICS_ARTICLE_PAGE,
                  type === 'image' ? 'Showing image' : 'Open attachment by URL',
                )
              }
              uiTheme={uiTheme}
            />
          </View>
        </>
      )}

      {props.isSplitView && (
        <ModalPortal
          onHide={
            modalStack.length > 0
              ? modalStack[modalStack.length - 1].onHide
              : () => {}
          }
        >
          {modalStack.length > 0
            ? modalStack[modalStack.length - 1].children
            : null}
        </ModalPortal>
      )}
    </>
  );
};


export default React.memo<Props>(ArticleDetails);
