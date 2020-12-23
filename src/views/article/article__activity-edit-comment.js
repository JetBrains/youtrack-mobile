/* @flow */

import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {useDispatch} from 'react-redux';

import Header from '../../components/header/header';
import Router from '../../components/router/router';
import TextEditForm from '../../components/issue-summary/text-edit-form';
import {IconCheck, IconClose} from '../../components/icon/icon';
import {updateArticleComment} from './arcticle-actions';

import styles from './article.styles';

import type {UITheme} from '../../flow/Theme';
import type {IssueComment} from '../../flow/CustomFields';

type Props = {
  comment: IssueComment,
  uiTheme: UITheme
};


const ArticleEditComment = (props: Props) => {
  const {uiTheme, comment} = props;

  const dispatch: Function = useDispatch();
  const [commentText, updateCommentText] = useState('');
  const [isSubmitting, updateSubmitting] = useState(false);

  useEffect(() => {
    if (comment) {
      updateCommentText(comment.text);
    }
  }, [comment]);


  const linkColor: string = uiTheme.colors.$link;
  return (
    <View style={styles.container}>
      <Header
        style={styles.commentEditHeader}
        title="Edit comment"
        leftButton={<IconClose size={21} color={isSubmitting ? uiTheme.colors.$disabled : linkColor}/>}
        onBack={() => !isSubmitting && Router.pop(true)}
        rightButton={isSubmitting
          ? <ActivityIndicator color={linkColor}/> :
          <IconCheck size={20} color={linkColor}/>}
        onRightButtonClick={async () => {
          updateSubmitting(true);
          await dispatch(updateArticleComment({...comment, text: commentText.trim()}));
          updateSubmitting(false);
          Router.pop();
        }}
      />
      <View style={styles.commentEditContainer}>
        <TextEditForm
          style={styles.commentEditInput}
          adaptive={false}
          autoFocus={true}
          editable={!isSubmitting}
          multiline={true}
          description={commentText}
          onDescriptionChange={(text: string) => updateCommentText(text)}
          uiTheme={uiTheme}
        />
      </View>
    </View>
  );
};

export default React.memo<Props>(ArticleEditComment);
