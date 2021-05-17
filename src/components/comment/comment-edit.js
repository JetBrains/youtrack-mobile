/* @flow */

import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {useDispatch} from 'react-redux';

import Header from '../header/header';
import Router from '../router/router';
import TextEditForm from '../form/text-edit-form';
import {IconCheck, IconClose} from '../icon/icon';
import {ThemeContext} from '../theme/theme-context';

import styles from './comment.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {Theme} from '../../flow/Theme';

type Props = {
  comment: IssueComment,
  onUpdate: (comment: IssueComment) => Function,
};


const CommentEdit = (props: Props) => {
  const dispatch: Function = useDispatch();
  const theme: Theme = useContext(ThemeContext);

  const [commentText, updateCommentText] = useState('');
  const [isSubmitting, updateSubmitting] = useState(false);

  const {comment, onUpdate} = props;

  useEffect(() => {
    if (comment) {
      updateCommentText(comment.text);
    }
  }, [comment]);


  return (
    <View style={styles.commentEditContainer}>
      <Header
        style={styles.commentEditHeader}
        title="Edit comment"
        leftButton={<IconClose size={21} color={isSubmitting ? styles.disabled.color : styles.link.color}/>}
        onBack={() => !isSubmitting && Router.pop(true)}
        rightButton={
          (isSubmitting
            ? <ActivityIndicator color={styles.link.color}/>
            : <IconCheck size={20} color={styles.link.color}/>)
        }
        onRightButtonClick={async () => {
          updateSubmitting(true);
          await dispatch(onUpdate({...comment, text: commentText.trim()}));
          updateSubmitting(false);
          Router.pop();
        }}
      />
      <View style={styles.commentEditContent}>
        <TextEditForm
          style={styles.commentEditInput}
          adaptive={false}
          autoFocus={true}
          editable={!isSubmitting}
          multiline={true}
          description={commentText}
          onDescriptionChange={(text: string) => updateCommentText(text)}
          uiTheme={theme.uiTheme}
        />
      </View>
    </View>
  );
};

export default ((React.memo<Props>(CommentEdit): any): typeof CommentEdit);
