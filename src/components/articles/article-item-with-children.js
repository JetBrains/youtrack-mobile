/* @flow */

import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

import IconTrash from '@jetbrains/icons/trash.svg';

import {hasType} from '../api/api__resource-types';
import {IconAngleRight, IconLock} from '../icon/icon';

import styles from './article-item-with-children.styles';

import type {Article, ArticleNode} from '../../flow/Article';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  articleNode: ArticleNode,
  onArticlePress: (article: Article) => void,
  onShowSubArticles?: (article: Article) => void,
  onDelete?: (article: Article) => any,
  style?: ViewStyleProp
};


const ArticleItemWithChildren = (props: Props) => {
  const {articleNode, onArticlePress, onShowSubArticles, style, onDelete} = props;
  const article: ?Article = articleNode.data;

  if (!article) {
    return null;
  }

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        style={{...styles.row, ...styles.item}}
        onPress={() => onArticlePress(article)}
      >
        <Text numberOfLines={2} style={styles.articleTitleText}>{article.summary || 'Untitled'}</Text>
        <View style={styles.itemArticleIcon}>
          {hasType.visibilityLimited(article?.visibility) && (
            <IconLock
              size={16}
              color={styles.lockIcon.color}
            />
          )}
        </View>
      </TouchableOpacity>

      {onDelete && <TouchableOpacity
        style={styles.iconTrash}
        onPress={() => onDelete(article)}
      >
        <IconTrash
          fill={styles.iconTrash.color}
          width={19}
          height={19}
        />
      </TouchableOpacity>}

      {articleNode?.children?.length > 0 && <TouchableOpacity
        style={styles.itemButtonContainer}
        onPress={() => onShowSubArticles && onShowSubArticles(article)}
      >
        <View style={styles.itemButton}>
          <Text style={styles.itemButtonText}>{articleNode.children.length}</Text>
          <IconAngleRight style={styles.itemButtonIcon} size={22} color={styles.icon.color}/>
        </View>
      </TouchableOpacity>}
    </View>
  );
};

export default React.memo<Props>(ArticleItemWithChildren);
