/* @flow */

import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import Header from '../header/header';
import Router from '../router/router';
import TextEditForm from '../form/text-edit-form';
import VisibilityControl from '../visibility/visibility-control';
import {IconCheck, IconClose} from '../icon/icon';
import {ThemeContext} from '../theme/theme-context';

import styles from './comment.styles';

import type {IssueComment} from '../../flow/CustomFields';
import type {Theme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';

type Props = {
  comment: IssueComment,
  onUpdate: (comment: IssueComment) => Function,
  visibilityOptionsGetter?: () => Array<{ visibilityGroups: Array<UserGroup>, visibilityUsers: Array<User> }>,
};


const CommentEdit = (props: Props) => {
  const theme: Theme = useContext(ThemeContext);

  const {comment, onUpdate, visibilityOptionsGetter} = props;

  const [commentText, updateCommentText] = useState('');
  const [commentVisibility, updateCommentVisibility] = useState(comment?.visibility || null);
  const [isSubmitting, updateSubmitting] = useState(false);

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
          onUpdate({
            ...comment,
            text: commentText.trim(),
            visibility: commentVisibility,
          });
          updateSubmitting(false);
          Router.pop();
        }}
      />


      <View style={styles.commentEditContent}>
        {!!visibilityOptionsGetter && (
          <VisibilityControl
            style={styles.commentVisibility}
            visibility={commentVisibility}
            onSubmit={updateCommentVisibility}
            uiTheme={theme.uiTheme}
            getOptions={visibilityOptionsGetter}
          />
        )}

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
