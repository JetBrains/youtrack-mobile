/* @flow */

import React, {useEffect, useState} from 'react';
import {TouchableOpacity, View, FlatList, RefreshControl, Text, ActivityIndicator} from 'react-native';

import ErrorMessage from '../../components/error-message/error-message';
import Header from '../../components/header/header';
import IconTrash from '@jetbrains/icons/trash.svg';
import KnowledgeBaseArticle from './knowledge-base__article';
import Router from '../../components/router/router';
import Select from '../../components/select/select';
import {confirmation} from '../../components/confirmation/confirmation';
import {deleteArticle} from '../article/arcticle-actions';
import {IconBack, IconKnowledgeBase} from '../../components/icon/icon';
import {loadArticlesDrafts} from './knowledge-base-actions';
import {routeMap} from '../../app-routes';
import {SkeletonList} from '../../components/skeleton/skeleton';
import {until} from '../../util/util';
import {useDispatch} from 'react-redux';
import {View as AnimatedView} from 'react-native-animatable';

import styles from './knowledge-base.styles';

import type {Article, ArticleNode} from '../../flow/Article';


const KnowledgeBaseDrafts = () => {
  const dispatch = useDispatch();
  const [drafts, updateDrafts] = useState(null);
  const [isLoading, updateLoading] = useState(false);
  const [isDeleting, updateDeleting] = useState(false);

  const loadDrafts = async () => {
    updateLoading(true);
    const drafts = await dispatch(loadArticlesDrafts());
    updateLoading(false);
    updateDrafts(drafts);
  };

  const confirmDelete = async (
    title: string = 'Are you sure you want to delete this draft?',
    message?: string
  ) => await confirmation(
    title,
    'Delete',
    message
  );

  const deleteAllDrafts = async () => {
    if (drafts && drafts.length > 0) {
      await confirmDelete(
        'Delete all drafts?',
        'This action deletes all drafts, including unpublished sub-articles'
      );
      updateDeleting(true);
      await until(drafts.map((draft: Article) => dispatch(deleteArticle(draft))));
      updateDrafts([]);
      updateDeleting(false);
      loadDrafts();
    }
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
        style={[
          styles.itemDraft,
          isDeleting ? styles.itemDraftDisabled : null
        ]}
        articleNode={{data: item}}
        onArticlePress={(article: Article) => Router.ArticleCreate({articleDraft: article})}
        onDelete={async (article: Article) => {
          if (!isDeleting) {
            await confirmDelete();
            dispatch(deleteArticle(article, loadDrafts));
          }
        }}
      />
    );
  };

  return (
    <View style={styles.content}>
      <Header
        title={'Drafts'}
        showShadow={true}
        leftButton={(
          <TouchableOpacity onPress={() => !isDeleting && Router.pop()}>
            <IconBack color={isDeleting ? styles.icon.color : styles.link.color}/>
          </TouchableOpacity>
        )}
        rightButton={drafts && drafts.length > 0 ? (
          isDeleting
            ? <ActivityIndicator style={styles.iconTrash} color={styles.link.color}/>
            : <TouchableOpacity
              style={styles.iconTrash}
              onPress={deleteAllDrafts}
            >
              <IconTrash
                fill={styles.link.color}
                width={19}
                height={19}
              />
            </TouchableOpacity>
        ) : null}
      />

      {isLoading && !drafts && <SkeletonList/>}

      {!drafts || drafts.length === 0 && (
        <AnimatedView
          useNativeDriver
          duration={500}
          animation="fadeIn"
          style={styles.noDrafts}
        >
          <ErrorMessage errorMessageData={{
            title: 'No drafts yet',
            icon: () => <IconKnowledgeBase size={81}/>
          }}/>

          <TouchableOpacity
            style={styles.noDraftsButton}
            onPress={() => Router.ArticleCreate()}
          >
            <Text style={styles.noDraftsButtonText}>Start a new article</Text>
          </TouchableOpacity>
        </AnimatedView>
      )}

      {drafts && <FlatList
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
