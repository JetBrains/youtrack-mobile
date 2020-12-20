/* @flow */

import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';

import throttle from 'lodash.throttle';
import {useDispatch, useSelector} from 'react-redux';

import MultilineInput from '../../components/multiline-input/multiline-input';
import {IconArrowUp} from '../../components/icon/icon';
import {notify} from '../../components/notification/notification';
import {updateArticleCommentDraft, getArticleCommentDraft, submitArticleCommentDraft} from './arcticle-actions';

import styles from './article.styles';

import type {UITheme} from '../../flow/Theme';
import type {AppState} from '../../reducers';

type Props = {
  uiTheme: UITheme
};


const ArticleAddComment = (props: Props) => {
  const {uiTheme} = props;

  const commentDraft: ?Comment = useSelector((state: AppState) => state.article.articleCommentDraft);
  const isLoading: boolean = useSelector((state: AppState) => state.article.isLoading);

  const [commentText, updateCommentText] = useState(commentDraft?.text || null);
  const [isSubmitting, updateSubmitting] = useState(false);

  const loadDraftComment = () => dispatch(getArticleCommentDraft());
  const submitDraftComment = async () => {
    if (commentText) {
      updateSubmitting(true);
      await dispatch(submitArticleCommentDraft(commentText));
      updateSubmitting(false);
    } else {
      notify('Can\'t create an empty comment');
    }
  };

  const dispatch = useDispatch();
  useEffect(() => {
    loadDraftComment();
  }, []);

  useEffect(() => {
    if (commentDraft === null) {
      updateCommentText(null);
    } else if (commentDraft && commentDraft.text !== undefined){
      updateCommentText(commentDraft.text);
    }
  }, [commentDraft]);


  const debouncedOnChange = throttle((commentText: string) => (
    dispatch(updateArticleCommentDraft(commentText))
  ), 500);

  return (
    <View
      style={styles.commentContainer}
    >
      <View style={styles.commentInputContainer}>

        <MultilineInput
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
        />

        <TouchableOpacity
          style={[
            styles.commentSendButton,
            isSubmitting ? styles.commentSendButtonDisabled : null
          ]}
          disabled={!commentText || isLoading || isSubmitting}
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
  );
};

export default React.memo<Props>(ArticleAddComment);
