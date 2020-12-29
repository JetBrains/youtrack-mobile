/* @flow */

import React, {useCallback, useEffect, useState} from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';

import throttle from 'lodash.throttle';
import {useDispatch, useSelector} from 'react-redux';

import Mentions from '../../components/mentions/mentions';
import MultilineInput from '../../components/multiline-input/multiline-input';
import {composeSuggestionText, getSuggestWord} from '../../components/mentions/mension-helper';
import {IconArrowUp} from '../../components/icon/icon';
import {notify} from '../../components/notification/notification';
import {
  updateArticleCommentDraft,
  getArticleCommentDraft,
  submitArticleCommentDraft,
  getMentions
} from './arcticle-actions';

import styles from './article.styles';

import type {AppState} from '../../reducers';
import type {UITheme} from '../../flow/Theme';
import type {User} from '../../flow/User';

type Props = {
  onAdd: () => void,
  uiTheme: UITheme
};


const ArticleAddComment = (props: Props) => {
  let input: MultilineInput | null = null;

  const {uiTheme, onAdd} = props;

  const commentDraft: ?Comment = useSelector((state: AppState) => state.article.articleCommentDraft);
  const isLoading: boolean = useSelector((state: AppState) => state.article.isLoading);

  const [commentText, updateCommentText] = useState(commentDraft?.text || null);
  const [isSubmitting, updateSubmitting] = useState(false);

  const [isSuggestionsLoading, updateSuggestionsLoading] = useState(false);
  const [mentions, updateMentions] = useState(null);

  const dispatch = useDispatch();

  const loadDraftComment = () => dispatch(getArticleCommentDraft());

  useEffect(() => {
    loadDraftComment();
  }, []);

  useEffect(() => {
    if (commentDraft === null) {
      updateCommentText(null);
    } else if (commentDraft && commentDraft.text !== undefined) {
      updateCommentText(commentDraft.text);
    }
  }, [commentDraft]);

  const submitDraftComment = async () => {
    if (commentText) {
      updateSubmitting(true);
      await dispatch(submitArticleCommentDraft(commentText));
      onAdd();
      updateSubmitting(false);
    } else {
      notify('Can\'t create an empty comment');
    }
  };

  const onChange = useCallback(async (commentText: string) => {
    dispatch(updateArticleCommentDraft(commentText));

    if (!commentText) {
      return updateMentions(null);
    }

    const word: ?string = getSuggestWord(commentText, commentText.length);
    if (!word) {
      return updateMentions(null);
    }

    if (word[0] === '@') {
      updateSuggestionsLoading(true);
      const _mentions = await dispatch(getMentions(word.slice(1)));
      updateSuggestionsLoading(false);
      updateMentions(_mentions);
    }
  }, [commentText]);

  const debouncedOnChange = throttle(onChange, 350);

  const isDisabled: boolean = !commentText || isLoading || isSubmitting;
  const suggestionText: string = commentText || '';
  return (
    <View style={styles.commentContainer}>

      {(isSuggestionsLoading || !!mentions) && (
        <Mentions
          isLoading={isSuggestionsLoading}
          mentions={mentions}
          onApply={(user: User) => {
            const newText: ?string = composeSuggestionText(user, suggestionText, suggestionText.length);
            if (newText) {
              updateCommentText(newText);
              updateMentions(null);
            }
            setTimeout(() => input && input.focus && input.focus(), 150);
          }}
        />
      )}

      <View
        style={styles.commentContent}
      >
        <View style={styles.commentInputContainer}>

          <MultilineInput
            ref={(instance: ?MultilineInput) => instance && (input = instance)}
            style={styles.commentInput}
            autoFocus={false}
            placeholder="Write a comment, @mention people"
            value={commentText}
            editable={!isLoading && !isSubmitting}
            underlineColorAndroid="transparent"
            keyboardAppearance={uiTheme.name}
            placeholderTextColor={uiTheme.colors.$icon}
            autoCapitalize="sentences"
            onChangeText={(text) => {
              updateCommentText(text);
              debouncedOnChange(text);
            }}
            onBlur={() => {
              updateSuggestionsLoading(false);
              updateMentions(null);
            }}
          />

          <TouchableOpacity
            style={[
              styles.commentSendButton,
              isDisabled ? styles.commentSendButtonDisabled : null
            ]}
            disabled={isDisabled}
            onPress={submitDraftComment}>
            {!isSubmitting && (
              <IconArrowUp
                size={22}
                color={uiTheme.colors.$textButton}
              />
            )}
            {isSubmitting && <ActivityIndicator color={uiTheme.colors.$background}/>}
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};

export default React.memo<Props>(ArticleAddComment);
