import React, {useState} from 'react';
import {ActivityIndicator, Text, TouchableOpacity, View} from 'react-native';

import {hasType} from '../api/api__resource-types';
import {i18n} from 'components/i18n/i18n';
import {IconAngleRight, IconLock, IconTrash} from 'components/icon/icon';

import styles from './article-item-with-children.styles';

import type {Article} from 'types/Article';
import type {ViewStyleProp} from 'types/Internal';

interface Props {
  article: Article;
  onArticlePress: (article: Article) => void;
  onShowSubArticles?: (article: Article) => any;
  onDelete?: (article: Article) => any;
  style?: ViewStyleProp;
}

const ArticleItemWithChildren = (props: Props) => {
  const [isLoadingSubArticles, updateIsLoadingSubArticles] = useState(false);
  const {article, onArticlePress, onShowSubArticles, style, onDelete} = props;

  if (!article) {
    return null;
  }

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        style={{...styles.row, ...styles.item}}
        onPress={() => onArticlePress(article)}
      >
        <Text numberOfLines={2} style={styles.articleTitleText}>
          {article.summary || i18n('Untitled')}
        </Text>
        <View style={styles.itemArticleIcon}>
          {article?.visibility?.$type && hasType.visibilityLimited({$type: article.visibility.$type}) && (
            <IconLock
              style={styles.lockIcon}
              size={16}
              color={styles.lockIcon.color}
            />
          )}
        </View>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={styles.iconTrash}
          onPress={() => onDelete(article)}
        >
          <IconTrash color={styles.iconTrash.color} />
        </TouchableOpacity>
      )}

      {article?.childArticles?.length > 0 && (
        <TouchableOpacity
          style={styles.itemButtonContainer}
          onPress={async () => {
            if (onShowSubArticles) {
              updateIsLoadingSubArticles(true);
              await onShowSubArticles(article);
              updateIsLoadingSubArticles(false);
            }
          }}
        >
          <View style={styles.itemButton}>
            {isLoadingSubArticles && (
              <ActivityIndicator color={styles.icon.color} />
            )}
            {!isLoadingSubArticles && (
              <>
                <Text style={styles.itemButtonText}>
                  {article.childArticles.length}
                </Text>
                <IconAngleRight
                  style={styles.itemButtonIcon}
                  size={22}
                  color={styles.itemButtonText.color}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default React.memo<Props>(ArticleItemWithChildren);
