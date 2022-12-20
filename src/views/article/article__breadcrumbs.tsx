import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import Router from 'components/router/router';
import {createBreadCrumbs} from 'components/articles/articles-tree-helper';
import {hasType} from 'components/api/api__resource-types';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from './article.styles';
import type {
  Article,
  Article as ArticleEntity,
  ArticleProject,
  ArticlesList,
} from 'flow/Article';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
type Props = {
  article: Article;
  articlesList: ArticlesList;
  withSeparator?: boolean;
  withLast?: boolean;
  excludeProject?: boolean;
  styles?: ViewStyleProp;
};
const MAX_BREADCRUMB_TEXT_LENGTH: number = 24;

const renderSeparator = () => (
  <Text style={styles.breadCrumbsButtonTextSeparator}>/</Text>
);

type ArticleBreadCrumbsItemProps = {
  article: Article;
  onPress?: (...args: Array<any>) => any;
  noSeparator?: boolean;
  style?: ViewStyleProp;
  isSplitView: boolean;
};
export const ArticleBreadCrumbsItem = (
  props: ArticleBreadCrumbsItemProps,
): React.ReactNode => {
  const breadcrumbText: string = props.article.name || props.article.summary;
  return (
    <View style={[styles.breadCrumbsItem, props.style]}>
      {!props.noSeparator && renderSeparator()}
      <TouchableOpacity
        disabled={!props.onPress}
        style={styles.breadCrumbsButton}
        onPress={props.onPress}
      >
        <Text
          style={[
            styles.breadCrumbsButtonText,
            !props.onPress && styles.breadCrumbsButtonTextDisabled,
          ]}
        >
          {breadcrumbText.substr(0, MAX_BREADCRUMB_TEXT_LENGTH)}
          {breadcrumbText.length > MAX_BREADCRUMB_TEXT_LENGTH && '…'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ArticleBreadCrumbs = (props: Props) => {
  const {
    article,
    articlesList,
    withSeparator = true,
    excludeProject,
    withLast,
  } = props;

  if (!articlesList || !article) {
    return null;
  }

  const breadCrumbs: Array<ArticleEntity | ArticleProject> = createBreadCrumbs(
    article,
    articlesList,
    excludeProject || props.isSplitView,
  );

  if (breadCrumbs.length === 0) {
    return null;
  }

  return (
    <View style={[styles.breadCrumbs, props.styles]}>
      <ScrollView
        horizontal={true}
        contentContainerStyle={styles.breadCrumbsContent}
      >
        {excludeProject && (
          <View style={styles.breadCrumbsItem}>{renderSeparator()}</View>
        )}
        {breadCrumbs.map(
          (it: ArticleEntity | ArticleProject, index: number) => (
            <ArticleBreadCrumbsItem
              key={it.id}
              noSeparator={index === 0}
              article={it}
              onPress={() => {
                if (hasType.project(it)) {
                  Router.KnowledgeBase({
                    project: it,
                    preventReload: true,
                  });
                } else if (props.isSplitView) {
                  Router.KnowledgeBase({
                    lastVisitedArticle: it,
                    preventReload: true,
                  });
                } else {
                  Router.Article({
                    articlePlaceholder: it,
                    storePrevArticle: true,
                  });
                }
              }}
            />
          ),
        )}
        {withLast && <ArticleBreadCrumbsItem article={article} />}
      </ScrollView>
      {withSeparator && <View style={styles.breadCrumbsSeparator} />}
    </View>
  );
};

export default React.memo<Props>(ArticleBreadCrumbs) as React$AbstractComponent<
  Props,
  unknown
>;
