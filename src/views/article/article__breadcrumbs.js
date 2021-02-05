/* @flow */

import React from 'react';

import Router from '../../components/router/router';
import {createBreadCrumbs} from '../../components/articles/articles-tree-helper';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import styles from './article.styles';

import type {Article, Article as ArticleEntity, ArticlesList} from '../../flow/Article';
import type {IssueProject} from '../../flow/CustomFields';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  article: Article,
  articlesList: ArticlesList,
  withSeparator?: boolean,
  withLast?: boolean,
  excludeProject?: boolean,
  styles?: ViewStyleProp,
  root?: boolean
};

const MAX_BREADCRUMB_TEXT_LENGTH: number = 24;
const renderSeparator = () => <Text style={styles.breadCrumbsButtonTextSeparator}>/</Text>;

type ArticleBreadCrumbsItemProps = {
  article: Article,
  onPress?: Function,
  noSeparator?: boolean,
  style?: ViewStyleProp
};
export const ArticleBreadCrumbsItem = (props: ArticleBreadCrumbsItemProps) => {
  const breadcrumbText: string = props.article.name || props.article.summary;
  return (
    <View
      style={[styles.breadCrumbsItem, props.style]}
    >
      {!props.noSeparator && renderSeparator()}
      <TouchableOpacity
        disabled={!props.onPress}
        style={styles.breadCrumbsButton}
        onPress={props.onPress}
      >
        <Text style={[styles.breadCrumbsButtonText, !props.onPress && styles.breadCrumbsButtonTextDisabled]}>
          {breadcrumbText.substr(0, MAX_BREADCRUMB_TEXT_LENGTH)}
          {breadcrumbText.length > MAX_BREADCRUMB_TEXT_LENGTH && '…'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ArticleBreadCrumbs = (props: Props) => {
  const {article, articlesList, withSeparator = true, excludeProject, withLast} = props;
  const breadCrumbs: Array<ArticleEntity | IssueProject> = createBreadCrumbs(article, articlesList, excludeProject);

  if (breadCrumbs.length === 0) {
    return null;
  }

  return (
    <View style={[styles.breadCrumbs, props.styles]}>
      <ScrollView
        horizontal={true}
        contentContainerStyle={styles.breadCrumbsContent}
      >
        {excludeProject && <View style={styles.breadCrumbsItem}>{renderSeparator()}</View>}
        {breadCrumbs.map((article: ArticleEntity | IssueProject, index: number) =>
          <ArticleBreadCrumbsItem
            key={article.id}
            noSeparator={index === 0}
            article={article}
            onPress={() => Router.Article({articlePlaceholder: article, storePrevArticle: true})}
          />
        )}
        {withLast && <ArticleBreadCrumbsItem article={article}/>}
      </ScrollView>
      {withSeparator && <View style={styles.breadCrumbsSeparator}/>}
    </View>
  );
};

export default React.memo<Props>(ArticleBreadCrumbs);
