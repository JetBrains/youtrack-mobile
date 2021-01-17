/* @flow */

import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View, FlatList, RefreshControl, Text} from 'react-native';

import {IconBack, IconKnowledgeBase} from '../../components/icon/icon';

import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import KnowledgeBaseArticle from './knowledge-base__article';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import {loadArticlesDrafts} from './knowledge-base-actions';
import {routeMap} from '../../app-routes';
import {SkeletonList} from '../../components/skeleton/skeleton';
import {useDispatch} from 'react-redux';

import styles from './knowledge-base.styles';

import type {Article, ArticleNode} from '../../flow/Article';


const KnowledgeBaseDrafts = () => {
  const dispatch = useDispatch();
  const [drafts, updateDrafts] = useState(null);
  const [isLoading, updateLoading] = useState(false);

  const loadDrafts = async () => {
    updateLoading(true);
    const drafts = await dispatch(loadArticlesDrafts());
    updateLoading(false);
    updateDrafts(drafts);
  };

  let onRouteChange = (routeName: string, prevRouteName: string) => {
    if (routeName === routeMap.Page && prevRouteName === routeMap.ArticleCreate) {
      loadDrafts();
    }
  };

  useEffect(() => {
    loadDrafts();
    Router.setOnDispatchCallback(onRouteChange);
    return () => onRouteChange = () => {};
  }, []);

  const renderArticle = ({item}) => {
    return (
      <KnowledgeBaseArticle
        style={styles.itemDraft}
        articleNode={{data: item}}
        onArticlePress={(article: Article) => Router.ArticleCreate({articleDraft: article})}
      />
    );
  };

  return (
    <View
      style={styles.container}>
      <Header
        showShadow={true}
        leftButton={(
          <TouchableOpacity
            onPress={() => {
              Router.pop();
            }}
          >
            <IconBack color={styles.link.color}/>
          </TouchableOpacity>
        )}
        title={'Drafts'}
      />

      {isLoading && <SkeletonList/>}
      {!isLoading && drafts && drafts.length === 0 && (
        <View style={styles.noDrafts}>
          <ErrorMessage errorMessageData={{
            title: 'No drafts yet',
            icon: () => <IconKnowledgeBase size={81}/>,
            iconSize: 48
          }}/>

          <TouchableOpacity
            style={styles.noDraftsButton}
            onPress={() => Router.ArticleCreate()}
          >
            <Text style={styles.noDraftsButtonText}>Start a new article</Text>
          </TouchableOpacity>
        </View>
      )}

      {<FlatList
        testID="articleDrafts"
        data={drafts}
        refreshControl={<RefreshControl
          refreshing={false}
          tintColor={styles.link.color}
          onRefresh={loadDrafts}
        />}
        keyExtractor={(item: ArticleNode, index: number) => item?.id || index}
        getItemLayout={Select.getItemLayout}
        renderItem={renderArticle}
        ItemSeparatorComponent={Select.renderSeparator}
      />}
    </View>
  );
};

export default React.memo<any>(KnowledgeBaseDrafts);
