/* @flow */

import React, {useState} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';

import IconTrash from '@jetbrains/icons/trash.svg';

import {hasType} from '../api/api__resource-types';
import {IconAngleRight, IconLock} from '../icon/icon';

import styles from './article-item-with-children.styles';

import type {Article} from '../../flow/Article';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

type Props = {
  article: Article,
  onArticlePress: (article: Article) => void,
  onShowSubArticles?: (article: Article) => any,
  onDelete?: (article: Article) => any,
  style?: ViewStyleProp,
  isTablet: boolean,
};


const ArticleItemWithChildren = (props: Props) => {
  const [isLoadingSubArticles, updateIsLoadingSubArticles] = useState(false);

  const {article, onArticlePress, onShowSubArticles, style, onDelete, isTablet} = props;

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
              style={styles.lockIcon}
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

      {article?.childArticles?.length > 0 && <TouchableOpacity
        disabled={isTablet}
        style={styles.itemButtonContainer}
        onPress={async () => {
          if (onShowSubArticles) {
            updateIsLoadingSubArticles(true);
            await onShowSubArticles(article);
            updateIsLoadingSubArticles(false);
          }
        }}
      >
        <View style={isTablet ? null : styles.itemButton}>
          {!isTablet && isLoadingSubArticles && <ActivityIndicator color={styles.icon.color} />}
          {!isLoadingSubArticles && <>
            <Text style={[styles.itemButtonText, isTablet && styles.itemButtonTextTablet]}>{article.childArticles.length}</Text>
            {!isTablet && <IconAngleRight style={styles.itemButtonIcon} size={22} color={styles.icon.color}/>}
          </>}
        </View>
      </TouchableOpacity>}
    </View>
  );
};

export default (React.memo<Props>(ArticleItemWithChildren): React$AbstractComponent<Props, mixed>);
