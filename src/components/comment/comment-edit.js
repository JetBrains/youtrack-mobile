/* @flow */

import React, {useContext, useEffect, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';

import {useSelector} from 'react-redux';

import ApiHelper from '../api/api__helper';
import AttachmentsRow from '../attachments-row/attachments-row';
import Header from '../header/header';
import log from '../log/log';
import Router from '../router/router';
import TextEditForm from '../form/text-edit-form';
import usage from '../usage/usage';
import VisibilityControl from '../visibility/visibility-control';
import {ANALYTICS_ISSUE_STREAM_SECTION} from '../analytics/analytics-ids';
import {IconCheck, IconClose} from '../icon/icon';
import {ThemeContext} from '../theme/theme-context';

import styles from './comment.styles';

import type {AppState} from '../../reducers';
import type {Attachment, IssueComment} from '../../flow/CustomFields';
import type {ConfigAuth} from '../../flow/AppConfig';
import type {CustomError} from '../../flow/Error';
import type {Node} from 'react';
import type {Theme} from '../../flow/Theme';
import type {UserGroup} from '../../flow/UserGroup';
import type {User} from '../../flow/User';

type Props = {
  comment: IssueComment,
  canDeleteCommentAttachment?: (attachment: Attachment) => boolean,
  onDeleteAttachment?: (attachment: Attachment) => Promise<void>,
  onUpdate: (comment: IssueComment) => Function,
  visibilityOptionsGetter?: () => Array<{ visibilityGroups: Array<UserGroup>, visibilityUsers: Array<User> }>,
};


const CommentEdit = (props: Props) => {
  const theme: Theme = useContext(ThemeContext);
  const backendUrl: ?ConfigAuth = useSelector((appState: AppState) => appState.app.auth?.config?.backendUrl);

  const {comment, onUpdate, visibilityOptionsGetter} = props;

  const [attachments, updateAttachments] = useState(comment.attachments || []);
  const [commentText, updateCommentText] = useState('');
  const [commentVisibility, updateCommentVisibility] = useState(comment?.visibility || null);
  const [isSubmitting, updateSubmitting] = useState(false);

  useEffect(() => {
    if (comment) {
      updateCommentText(comment.text);
      updateAttachments(comment.attachments || []);
    }
  }, [comment]);

  const renderAttachments = (): Node => {
    const canRemoveAttachment: boolean = (
      typeof props.canDeleteCommentAttachment === 'function' ? props.canDeleteCommentAttachment(attachments[0]) : false
    );
    return <AttachmentsRow
      style={styles.commentAttachments}
      attachments={backendUrl ? ApiHelper.convertAttachmentRelativeToAbsURLs(attachments, backendUrl) : attachments}
      attachingImage={null}
      onImageLoadingError={(err: CustomError) => log.warn('onImageLoadingError', err.nativeEvent)}
      onOpenAttachment={() => (
        usage.trackEvent(ANALYTICS_ISSUE_STREAM_SECTION, 'Edit comment attachment preview')
      )}
      canRemoveAttachment={canRemoveAttachment}
      onRemoveImage={async (attachment: Attachment) => {
        if (typeof props.onDeleteAttachment === 'function') {
          await props.onDeleteAttachment(attachment);
          updateAttachments(attachments.filter((it: Attachment) => it.id !== attachment.id));
        }
      }}
      uiTheme={theme.uiTheme}
    />;
  };


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

        {attachments.length > 0 && renderAttachments()}

      </View>
    </View>
  );
};

export default ((React.memo<Props>(CommentEdit): any): typeof CommentEdit);
