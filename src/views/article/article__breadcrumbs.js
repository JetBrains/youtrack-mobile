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
  extraDepth?: number,
  withSeparator?: boolean,
  excludeProject?: boolean,
  styles?: ViewStyleProp
};

const maxBreadcrumbTextLength: number = 24;

const ArticleBreadCrumbs = (props: Props) => {
  const {article, articlesList, extraDepth = 0, withSeparator = true, excludeProject} = props;
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
        {breadCrumbs.map((it: ArticleEntity | IssueProject, index: number) => {
          const breadcrumbText: string = it.name || it.summary;
          return (
            <View key={it.id}>
              <View style={styles.commentContent}>
                {index > 0 && <Text style={styles.breadCrumbsButtonTextSeparator}>/</Text>}
                <TouchableOpacity
                  style={styles.breadCrumbsButton}
                  onPress={() => Router.backTo(breadCrumbs.length - index + extraDepth)}
                >
                  <Text style={styles.breadCrumbsButtonText}>
                    {breadcrumbText.substr(0, maxBreadcrumbTextLength)}
                    {breadcrumbText.length > maxBreadcrumbTextLength && '…'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {withSeparator && <View style={styles.breadCrumbsSeparator}/>}
    </View>
  );
};

export default React.memo<Props>(ArticleBreadCrumbs);
